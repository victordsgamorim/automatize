/**
 * Inline script that prevents flash of wrong theme on web.
 * Inject in <head> via dangerouslySetInnerHTML before React hydrates.
 *
 * Reads the same localStorage key used by createWebStorageAdapter().
 */
export const THEME_ANTI_FLASH_SCRIPT = `
(function(){
  try {
    var p = localStorage.getItem('theme-preference');
    var isDark = (p === 'dark') ||
      ((p === 'system' || !p) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
  } catch(e){}
})();
`;
