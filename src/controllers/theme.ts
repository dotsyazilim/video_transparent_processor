export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'vtp-theme';

const isBrowser = typeof window !== 'undefined';

const prefersDark = () => {
  if (!isBrowser || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const getStoredTheme = (): Theme => {
  if (!isBrowser) {
    return 'light';
  }

  const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  return prefersDark() ? 'dark' : 'light';
};

export const saveThemePreference = (theme: Theme) => {
  if (!isBrowser) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, theme);
};

export const clearThemePreference = () => {
  if (!isBrowser) {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
};

export const applyTheme = (theme: Theme) => {
  if (!isBrowser) {
    return;
  }

  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.setProperty('color-scheme', theme);
};

export const getNextTheme = (current: Theme): Theme => (current === 'light' ? 'dark' : 'light');

export const subscribeSystemTheme = (callback: (theme: Theme) => void) => {
  if (!isBrowser || typeof window.matchMedia !== 'function') {
    return () => {};
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const listener = (event: MediaQueryListEvent) => {
    callback(event.matches ? 'dark' : 'light');
  };

  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }

  // Safari < 14 fallback
  mediaQuery.addListener(listener);
  return () => mediaQuery.removeListener(listener);
};

