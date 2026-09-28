import { api, onContentChange } from './api.js';
import { initNavigation, renderProjects, feedback } from './ui.js';

initNavigation();
let snapshot, loading = false;
async function refresh() {
  if (loading) return;
  loading = true;
  try {
    const projects = await api('/projects');
    const next = JSON.stringify(projects);
    if (next !== snapshot) renderProjects(document.getElementById('projects-list'), projects);
    snapshot = next;
    document.getElementById('project-count').textContent = `${String(projects.length).padStart(2, '0')} projects`;
    feedback('projects-feedback', projects.length ? '' : 'New projects are on the way.');
  } catch (error) {
    feedback('projects-feedback', `${error.message} Refresh to try again.`, true);
    document.getElementById('projects-list').setAttribute('aria-busy', 'false');
  } finally { loading = false; }
}
refresh(); onContentChange(refresh);
