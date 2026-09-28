let csrf;

export async function api(path, { method = 'GET', body, signal } = {}) {
  const headers = { Accept: 'application/json' };
  if (method !== 'GET') {
    if (!csrf) await session();
    headers['X-CSRF-Token'] = csrf;
  }
  const isForm = body instanceof FormData;
  if (body && !isForm) headers['Content-Type'] = 'application/json';
  let response;
  try {
    response = await fetch(`/api${path}`, { method, headers, credentials: 'same-origin',
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
      signal: signal || AbortSignal.timeout(20_000) });
  } catch (error) {
    throw new Error(error.name === 'TimeoutError' ? 'The request timed out. Refresh to check whether it saved before retrying.' : 'Unable to connect. Check your connection and try again.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'Unable to complete the request.');
    error.status = response.status;
    if (response.status === 401 && !path.startsWith('/auth/')) window.dispatchEvent(new Event('session-expired'));
    throw error;
  }
  if (data.csrf) csrf = data.csrf;
  return data;
}

export async function session() { return api('/auth/session'); }

export function announceChange() {
  try { localStorage.setItem('portfolio-updated', String(Date.now())); } catch { /* Cross-tab refresh is optional. */ }
}

export function onContentChange(refresh) {
  window.addEventListener('storage', event => { if (event.key === 'portfolio-updated') refresh(); });
  window.addEventListener('focus', refresh);
}
