import { api, session } from './api.js';
import { feedback, initNavigation } from './ui.js';

initNavigation();
session().catch(error => feedback('login-feedback', error.message, true));
document.getElementById('login-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button');
  button.disabled = true; feedback('login-feedback', '');
  try {
    await session();
    await api('/auth/login', { method: 'POST', body: { username: form.elements.username.value.trim(), password: form.elements.password.value } });
    window.location.replace('/edit.html');
  } catch (error) { feedback('login-feedback', error.message, true); }
  finally { button.disabled = false; }
});
