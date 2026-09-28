export function featuredProjects(projects) {
  const featured = projects.filter(project => project.featured).sort((a, b) => a.order - b.order);
  return featured.length ? featured.slice(0, 3) : [...projects].sort((a, b) =>
    (b.createdAt || '').localeCompare(a.createdAt || '') || b.order - a.order).slice(0, 3);
}
