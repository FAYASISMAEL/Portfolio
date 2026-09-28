export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function text(value, label, max, required = true) {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) {
    throw new HttpError(400, `${label} is required and must be no longer than ${max} characters.`);
  }
  return value.trim();
}
function tags(value, label) {
  if (!Array.isArray(value) || value.length > 30) throw new HttpError(400, `${label} must contain at most 30 items.`);
  return [...new Set(value.map(tag => text(tag, label, 60)))];
}
function url(value, label) {
  const input = text(value ?? '', label, 2048, false);
  if (!input) return '';
  try {
    const parsed = new URL(input);
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) throw Error();
    return parsed.href;
  } catch { throw new HttpError(400, `${label} must be a complete http:// or https:// URL.`); }
}
function month(value, label) {
  if (typeof value !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value) || Number(value.slice(0,4)) < 1900) {
    throw new HttpError(400, `${label} must be a valid month and year.`);
  }
  return value;
}

export function validateProject(body) {
  if (typeof body.featured !== 'boolean') throw new HttpError(400, 'Featured must be true or false.');
  const year = text(body.year, 'Year', 4);
  if (!/^\d{4}$/.test(year)) throw new HttpError(400, 'Enter a four-digit year.');
  const image = text(body.image ?? '', 'Image', 200, false);
  if (image && !/^\/(assets\/images\/[a-z0-9-]+\.png|uploads\/projects\/[a-f0-9-]+\.webp)$/.test(image)) {
    throw new HttpError(400, 'Choose an uploaded project image.');
  }
  return { name: text(body.name, 'Project name', 150), category: text(body.category, 'Category', 150), year,
    description: text(body.description, 'Description', 6000), image,
    technologies: tags(body.technologies, 'Technologies'), github: url(body.github, 'GitHub URL'),
    liveUrl: url(body.liveUrl, 'Live project URL'), featured: body.featured };
}

export function validateExperience(body) {
  if (typeof body.current !== 'boolean') throw new HttpError(400, 'Currently working must be true or false.');
  const startDate = month(body.startDate, 'Start date');
  const endDate = body.current ? '' : month(body.endDate, 'End date');
  if (endDate && endDate < startDate) throw new HttpError(400, 'End date cannot be before start date.');
  return { role: text(body.role, 'Role', 150), company: text(body.company, 'Company', 150),
    startDate, endDate, current: body.current, description: text(body.description, 'Description', 6000),
    tags: tags(body.tags, 'Skills / tags') };
}
