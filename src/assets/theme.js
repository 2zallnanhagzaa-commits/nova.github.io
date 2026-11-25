try {
  const theme = localStorage.getItem('nova-website-theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
} catch {}
