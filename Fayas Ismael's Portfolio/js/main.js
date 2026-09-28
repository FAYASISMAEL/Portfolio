import { api, onContentChange } from './api.js';
import { initNavigation, initContact, renderProjects, renderExperience, feedback } from './ui.js';
import { featuredProjects } from './selection.js';

initNavigation(); initContact();
let loading = false;
let projectSnapshot, experienceSnapshot;
async function refresh() {
  if (loading) return;
  loading = true;
  await Promise.all([
    api('/projects').then(projects => {
      const next = JSON.stringify(projects);
      if (next !== projectSnapshot) renderProjects(document.getElementById('projects-list'), featuredProjects(projects));
      projectSnapshot = next;
      feedback('projects-feedback', projects.length ? '' : 'New projects are on the way.');
    }).catch(error => { feedback('projects-feedback', `${error.message} Refresh to try again.`, true); document.getElementById('projects-list').setAttribute('aria-busy', 'false'); }),
    api('/experience').then(items => {
      const next = JSON.stringify(items);
      if (next !== experienceSnapshot) renderExperience(document.getElementById('experience-list'), items);
      experienceSnapshot = next;
      document.getElementById('experience-count').textContent = items.length ? `01 — ${String(items.length).padStart(2, '0')}` : '00';
      feedback('experience-feedback', items.length ? '' : 'Experience updates coming soon.');
    }).catch(error => { feedback('experience-feedback', `${error.message} Refresh to try again.`, true); document.getElementById('experience-list').setAttribute('aria-busy', 'false'); })
  ]);
  loading = false;
}
refresh(); onContentChange(refresh);
