import { api, session, announceChange } from './api.js';
import { element, feedback, projectImage, experienceDates, initNavigation } from './ui.js';

initNavigation();
const projectForm = document.getElementById('project-form');
const experienceForm = document.getElementById('experience-form');
const projectFields = document.getElementById('project-fields');
const experienceFields = document.getElementById('experience-fields');
let projects = [], experience = [], projectId = null, experienceId = null;
let imagePath = '', previewUrl = '', busy = false, loaded = false;
const splitTags = value => [...new Set(value.split(',').map(value => value.trim()).filter(Boolean))];

function setBusy(value) {
  busy = value;
  projectFields.disabled = value || !loaded;
  experienceFields.disabled = value || !loaded;
  document.querySelectorAll('.admin-list button, #logout').forEach(button => { button.disabled = value || button.dataset.boundary === 'true'; });
}

function preview(src) {
  const holder = document.getElementById('image-preview');
  holder.replaceChildren(); holder.hidden = !src;
  document.getElementById('remove-image').hidden = !src;
  if (src) {
    const image = element('img'); image.alt = 'Selected project image preview'; image.src = src;
    image.addEventListener('error', () => {
      holder.replaceChildren(element('p', 'field-help', 'This image cannot be previewed. Choose another image.'));
    });
    holder.append(image);
  }
}
function releasePreview() { if (previewUrl) URL.revokeObjectURL(previewUrl); previewUrl = ''; }
function resetProject() {
  projectForm.reset(); projectId = null; imagePath = ''; releasePreview(); preview('');
  document.getElementById('project-form-title').textContent = 'Add New Project';
  projectForm.elements.year.value = new Date().getFullYear();
}
function syncDates() {
  const current = experienceForm.elements.current.checked;
  experienceForm.elements.endDate.disabled = current;
  experienceForm.elements.endDate.required = !current;
  experienceForm.elements.endDate.min = experienceForm.elements.startDate.value || '1900-01';
}
function resetExperience() {
  experienceForm.reset(); experienceId = null;
  document.getElementById('experience-form-title').textContent = 'Add New Experience'; syncDates();
}

function editProject(item) {
  resetProject(); projectId = item.id; imagePath = item.image;
  for (const key of ['name', 'category', 'year', 'description', 'github', 'liveUrl']) projectForm.elements[key].value = item[key];
  projectForm.elements.technologies.value = item.technologies.join(', ');
  projectForm.elements.featured.checked = item.featured;
  document.getElementById('project-form-title').textContent = 'Edit Project';
  preview(imagePath); feedback('project-feedback', ''); projectForm.elements.name.focus();
  projectForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function editExperience(item) {
  resetExperience(); experienceId = item.id;
  for (const key of ['role', 'company', 'startDate', 'endDate', 'description']) experienceForm.elements[key].value = item[key];
  experienceForm.elements.tags.value = item.tags.join(', ');
  experienceForm.elements.current.checked = item.current;
  document.getElementById('experience-form-title').textContent = 'Edit Experience';
  syncDates(); feedback('experience-feedback', ''); experienceForm.elements.role.focus();
  experienceForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function action(label, name, handler, boundary = false) {
  const button = element('button', 'text-button', label); button.type = 'button';
  button.setAttribute('aria-label', `${label}: ${name}`); button.disabled = boundary;
  button.dataset.boundary = String(boundary); button.addEventListener('click', handler); return button;
}
function renderList(kind, items) {
  const container = document.getElementById(`admin-${kind}`);
  container.replaceChildren(...items.map((item, index) => {
    const name = kind === 'projects' ? item.name : item.role;
    const row = element('article', `admin-row ${kind === 'projects' ? 'with-thumbnail' : ''}`);
    if (kind === 'projects') row.append(projectImage(item, 'thumbnail-image'));
    const details = element('div', 'admin-row-details');
    details.append(element('h4', 'exp-role', name));
    details.append(element('p', 'field-help', kind === 'projects' ? `${item.category} — ${item.year} · ${item.featured ? 'Featured' : 'Works page'}` : `${item.company} · ${experienceDates(item)}`));
    const actions = element('div', 'row-actions');
    actions.append(action('Edit', name, () => kind === 'projects' ? editProject(item) : editExperience(item)),
      action('Delete', name, () => remove(kind, item)),
      action('Move Up', name, () => move(kind, index, -1), index === 0),
      action('Move Down', name, () => move(kind, index, 1), index === items.length - 1));
    details.append(actions); row.append(details); return row;
  }));
  if (!items.length) container.append(element('p', 'field-help', 'Add your first entry using the form above.'));
  container.setAttribute('aria-busy', 'false');
}
async function refresh() {
  [projects, experience] = await Promise.all([api('/projects'), api('/experience')]);
  renderList('projects', projects); renderList('experience', experience);
  document.getElementById('featured-count').textContent = `${projects.filter(item => item.featured).length} / 3 featured`;
  loaded = true;
}
async function afterSave(id, message) {
  announceChange(); feedback(id, message);
  try { await refresh(); }
  catch { feedback(id, `${message} The list could not refresh; reload before making more changes.`); loaded = false; }
}

function confirmDelete(name) {
  const dialog = document.getElementById('delete-dialog');
  document.getElementById('delete-description').textContent = `Are you sure you want to delete “${name}”?`;
  dialog.returnValue = 'cancel'; dialog.showModal();
  return new Promise(resolve => dialog.addEventListener('close', () => resolve(dialog.returnValue === 'delete'), { once: true }));
}
async function remove(kind, item) {
  if (busy || !await confirmDelete(kind === 'projects' ? item.name : item.role)) return;
  setBusy(true);
  const id = kind === 'projects' ? 'project-feedback' : 'experience-feedback';
  try {
    await api(`/${kind}/${item.id}`, { method: 'DELETE' });
    if (kind === 'projects' && projectId === item.id) resetProject();
    if (kind === 'experience' && experienceId === item.id) resetExperience();
    await afterSave(id, kind === 'projects' ? 'Project deleted.' : 'Experience deleted.');
  } catch (error) { feedback(id, error.message, true); }
  finally { setBusy(false); }
}
async function move(kind, index, direction) {
  if (busy) return;
  const items = [...(kind === 'projects' ? projects : experience)];
  [items[index], items[index + direction]] = [items[index + direction], items[index]];
  setBusy(true);
  const id = kind === 'projects' ? 'project-feedback' : 'experience-feedback';
  try {
    await api(`/${kind}/reorder`, { method: 'PUT', body: { ids: items.map(item => item.id) } });
    await afterSave(id, 'Display order updated.');
  } catch (error) { feedback(id, error.message, true); }
  finally { setBusy(false); }
}

document.getElementById('project-image').addEventListener('change', event => {
  releasePreview();
  const file = event.target.files[0];
  if (!file) return preview(imagePath);
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
    event.target.value = ''; preview(imagePath);
    feedback('project-feedback', 'Choose a PNG, JPG, JPEG or WebP image, no larger than 5 MB.', true); return;
  }
  previewUrl = URL.createObjectURL(file); preview(previewUrl); feedback('project-feedback', '');
});
document.getElementById('remove-image').addEventListener('click', () => {
  imagePath = ''; projectForm.elements.imageFile.value = ''; releasePreview(); preview('');
});
projectForm.elements.featured.addEventListener('change', event => {
  if (event.target.checked && projects.filter(item => item.featured && item.id !== projectId).length >= 3) {
    event.target.checked = false;
    feedback('project-feedback', 'You can feature only 3 projects on the homepage.', true);
  } else feedback('project-feedback', '');
});
experienceForm.elements.current.addEventListener('change', syncDates);
experienceForm.elements.startDate.addEventListener('change', syncDates);
document.getElementById('cancel-project').addEventListener('click', () => { resetProject(); feedback('project-feedback', ''); });
document.getElementById('cancel-experience').addEventListener('click', () => { resetExperience(); feedback('experience-feedback', ''); });

projectForm.addEventListener('submit', async event => {
  event.preventDefault(); if (busy) return;
  const values = projectForm.elements;
  const body = Object.fromEntries(['name', 'category', 'year', 'description', 'github', 'liveUrl'].map(key => [key, values[key].value.trim()]));
  body.technologies = splitTags(values.technologies.value); body.featured = values.featured.checked;
  const file = values.imageFile.files[0]; const editing = !!projectId;
  setBusy(true); feedback('project-feedback', file ? 'Uploading image…' : 'Saving project…');
  try {
    if (file) {
      const upload = new FormData(); upload.append('image', file);
      imagePath = (await api('/uploads', { method: 'POST', body: upload })).url;
      values.imageFile.value = ''; releasePreview(); preview(imagePath);
    }
    body.image = imagePath;
    await api(`/projects${projectId ? `/${projectId}` : ''}`, { method: projectId ? 'PUT' : 'POST', body });
    resetProject(); await afterSave('project-feedback', editing ? 'Project updated successfully.' : 'Project added successfully.');
  } catch (error) { feedback('project-feedback', error.message, true); }
  finally { setBusy(false); }
});
experienceForm.addEventListener('submit', async event => {
  event.preventDefault(); if (busy) return;
  const values = experienceForm.elements;
  const body = Object.fromEntries(['role', 'company', 'startDate', 'endDate', 'description'].map(key => [key, values[key].value.trim()]));
  body.current = values.current.checked; body.tags = splitTags(values.tags.value);
  const editing = !!experienceId; setBusy(true); feedback('experience-feedback', 'Saving experience…');
  try {
    await api(`/experience${experienceId ? `/${experienceId}` : ''}`, { method: experienceId ? 'PUT' : 'POST', body });
    resetExperience(); await afterSave('experience-feedback', editing ? 'Experience updated successfully.' : 'Experience added successfully.');
  } catch (error) { feedback('experience-feedback', error.message, true); }
  finally { setBusy(false); }
});
document.getElementById('logout').addEventListener('click', async () => {
  if (busy) return; setBusy(true);
  try { await api('/auth/logout', { method: 'POST' }); window.location.replace('/edit.html'); }
  catch (error) { feedback('admin-feedback', error.message, true); setBusy(false); }
});
window.addEventListener('session-expired', () => {
  feedback('admin-feedback', 'Your session expired. Log in in another tab, then return here to save your draft.', true);
  const link = element('a', 'project-link', 'Log in →'); link.href = '/edit.html'; link.target = '_blank'; link.rel = 'noopener noreferrer';
  document.getElementById('admin-feedback').append(' ', link);
});
window.addEventListener('focus', () => session().catch(() => {}));

resetProject(); resetExperience();
try {
  const state = await session();
  if (!state.authenticated) window.location.replace('/edit.html');
  else { await refresh(); setBusy(false); }
} catch (error) { feedback('admin-feedback', `${error.message} Refresh to try again.`, true); }
