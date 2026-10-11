(() => {
  let theme = 'light';
  try {
    const saved = localStorage.getItem('jyc-theme');
    theme = saved === 'dark' || saved === 'light'
      ? saved
      : (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  } catch {
    theme = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = theme;
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.content = theme === 'dark' ? '#0f0e11' : '#f5f1e6';
})();
