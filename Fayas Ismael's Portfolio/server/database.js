import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import session from 'express-session';

export function openDatabase(filename) {
  mkdirSync(path.dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');
  db.exec(`CREATE TABLE IF NOT EXISTS content (
    kind TEXT NOT NULL, id TEXT NOT NULL, position INTEGER NOT NULL,
    value TEXT NOT NULL, PRIMARY KEY (kind, id)
  );
  CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS sessions (sid TEXT PRIMARY KEY, value TEXT NOT NULL, expires INTEGER NOT NULL);`);
  const put = db.prepare('INSERT INTO content (kind,id,position,value) VALUES (?,?,?,?)');
  if (!db.prepare("SELECT value FROM settings WHERE key='seeded'").get()) {
    const seed = JSON.parse(readFileSync(new URL('../data/portfolio-data.json', import.meta.url), 'utf8'));
    transaction(db, () => {
      for (const kind of ['projects', 'experience']) {
        seed[kind].forEach((item, i) => put.run(kind, item.id, i, JSON.stringify(item)));
      }
      db.prepare("INSERT INTO settings VALUES ('seeded','1')").run();
    });
  }
  return db;
}

export function contentStore(db) {
  const list = kind => db.prepare('SELECT value, position FROM content WHERE kind=? ORDER BY position, id')
    .all(kind).map(row => ({ ...JSON.parse(row.value), order: row.position }));
  const get = (kind, id) => list(kind).find(item => item.id === id);
  const save = (kind, item) => db.prepare(`INSERT INTO content (kind,id,position,value) VALUES (?,?,?,?)
    ON CONFLICT(kind,id) DO UPDATE SET value=excluded.value, position=excluded.position`)
    .run(kind, item.id, item.order, JSON.stringify(item));
  return { list, get, save,
    remove: (kind, id) => db.prepare('DELETE FROM content WHERE kind=? AND id=?').run(kind, id),
    reorder: (kind, ids) => transaction(db, () => {
      ids.forEach((id, i) => db.prepare('UPDATE content SET position=? WHERE kind=? AND id=?').run(i, kind, id));
    })
  };
}

export function transaction(db, work) {
  db.exec('BEGIN IMMEDIATE');
  try { const result = work(); db.exec('COMMIT'); return result; }
  catch (error) { db.exec('ROLLBACK'); throw error; }
}

export class SQLiteSessionStore extends session.Store {
  constructor(db) {
    super();
    this.db = db;
    this.timer = setInterval(() => db.prepare('DELETE FROM sessions WHERE expires<=?').run(Date.now()), 60_000);
    this.timer.unref();
  }
  get(sid, callback) {
    try {
      const row = this.db.prepare('SELECT value FROM sessions WHERE sid=? AND expires>?').get(sid, Date.now());
      callback(null, row ? JSON.parse(row.value) : null);
    } catch (error) { callback(error); }
  }
  set(sid, value, callback = () => {}) {
    try {
      this.db.prepare('INSERT OR REPLACE INTO sessions VALUES (?,?,?)')
        .run(sid, JSON.stringify(value), new Date(value.cookie.expires).getTime());
      callback();
    } catch (error) { callback(error); }
  }
  destroy(sid, callback = () => {}) {
    try { this.db.prepare('DELETE FROM sessions WHERE sid=?').run(sid); callback(); }
    catch (error) { callback(error); }
  }
  touch(sid, value, callback) { this.set(sid, value, callback); }
  close() { clearInterval(this.timer); }
}
