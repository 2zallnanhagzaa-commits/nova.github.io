const toggle = document.querySelector('#theme');
const preference = matchMedia('(prefers-color-scheme: dark)');

function updateThemeLabel() {
  const dark = (document.documentElement.dataset.theme ?? (preference.matches ? 'dark' : 'light')) === 'dark';
  toggle.setAttribute('aria-pressed', String(dark));
}

toggle.hidden = false;
updateThemeLabel();
preference.addEventListener('change', updateThemeLabel);
toggle.addEventListener('click', () => {
  const theme = toggle.getAttribute('aria-pressed') === 'true' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('nova-website-theme', theme); } catch {}
  updateThemeLabel();
});
