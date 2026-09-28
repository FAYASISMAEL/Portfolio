export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

let observer;
export function reveal(container) {
  const targets = container.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach(node => node.classList.add('visible'));
    return;
  }
  observer ||= new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.15 });
  targets.forEach(node => { node.classList.add('reveal-ready'); observer.observe(node); });
}

export function initNavigation() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const update = () => nav.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', update, { passive: true });
  update();
  const toggle = nav.querySelector('.menu-toggle');
  const close = () => { nav.classList.remove('menu-open'); toggle?.setAttribute('aria-expanded', 'false'); };
  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('menu-open')) { close(); toggle.focus(); }
  });
  document.addEventListener('click', event => { if (!nav.contains(event.target)) close(); });
  matchMedia('(min-width: 769px)').addEventListener('change', close);
}

export function projectImage(project, className = 'project-image') {
  const holder = element('div', className === 'project-image' ? 'anim-morph' : 'thumbnail');
  const fallback = () => {
    const message = element('span', 'image-fallback', project.name);
    const hint = element('span', 'image-fallback-note', 'Preview coming soon');
    message.append(hint);
    holder.replaceChildren(message);
  };
  if (!project.image) { fallback(); return holder; }
  const image = element('img', className);
  image.alt = `${project.name} project screenshot`;
  image.loading = 'lazy'; image.decoding = 'async';
  image.width = project.id === 'coinmetric-ai' ? 600 : 500;
  image.height = project.id === 'coinmetric-ai' ? 400 : 300;
  image.addEventListener('error', fallback, { once: true });
  image.src = project.image;
  holder.append(image);
  return holder;
}

function externalLink(url, label, name) {
  try { if (!['https:', 'http:'].includes(new URL(url).protocol)) return null; } catch { return null; }
  const link = element('a', 'project-link', `${label} →`);
  link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', `${label}: ${name} (opens in a new tab)`);
  return link;
}

export function renderProjects(container, projects) {
  const rows = projects.map(project => {
    const row = element('article', 'project-row'); row.dataset.reveal = '';
    const visual = element('div', 'project-visual');
    const inner = element('div', 'project-visual-inner'); inner.append(projectImage(project)); visual.append(inner);
    const info = element('div', 'project-info');
    const details = element('div');
    details.append(element('h3', 'project-name', project.name), element('p', 'project-cat', `${project.category} — ${project.year}`), element('p', 'project-desc', project.description));
    const tags = element('div', 'project-tags');
    tags.append(...project.technologies.map(tag => element('span', 'tag', tag))); details.append(tags);
    const links = element('div', 'project-actions');
    for (const [url, label] of [[project.liveUrl, 'Live Project'], [project.github, 'Source Code']]) {
      if (url) { const link = externalLink(url, label, project.name); if (link) links.append(link); }
    }
    info.append(details, links); row.append(visual, info); return row;
  });
  container.replaceChildren(...rows);
  container.setAttribute('aria-busy', 'false'); reveal(container);
}

export function dateLabel(date) {
  if (!date) return '';
  const [year, month] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1)));
}
export function experienceDates(item) { return `${dateLabel(item.startDate)} — ${item.current ? 'Present' : dateLabel(item.endDate)}`; }

export function renderExperience(container, experience) {
  container.replaceChildren(...experience.map(item => {
    const row = element('article', 'experience-item'); row.dataset.reveal = '';
    const content = element('div', 'exp-content');
    content.append(element('h3', 'exp-role', item.role), element('p', 'exp-company', item.company), element('p', 'exp-desc', item.description));
    const tags = element('div', 'exp-tags'); tags.append(...item.tags.map(tag => element('span', 'exp-tag', tag)));
    content.append(tags); row.append(element('div', 'exp-date', experienceDates(item)), content); return row;
  }));
  container.setAttribute('aria-busy', 'false'); reveal(container);
}

export function feedback(id, message, error = false) {
  const node = document.getElementById(id);
  node.textContent = message;
  node.classList.toggle('is-error', error);
}

export function initContact() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = document.getElementById('submitBtn');
    button.disabled = true; button.textContent = 'Sending…'; feedback('formError', '');
    try {
      const response = await fetch(form.action, { method: 'POST', body: new FormData(form),
        headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(20_000) });
      if (!response.ok) throw new Error('Unable to send your message. Please try again or email me directly.');
      form.hidden = true;
      const success = document.getElementById('formSuccess'); success.hidden = false; success.focus();
    } catch (error) {
      feedback('formError', error.message === 'Failed to fetch' ? 'Network error. Please try again or email fayas.ofcl@gmail.com.' : error.name === 'TimeoutError' ? 'Sending timed out. Please try again or email me directly.' : error.message, true);
    } finally { button.disabled = false; button.textContent = 'Send Message →'; }
  });
}
