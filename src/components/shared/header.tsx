import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '../../i18n/LanguageProvider';
import '../../styles/components/shared/header/header.css';
import { NavItem } from '../../models/home';
import { filterNavItems } from '../../controllers/home';
import {
  applyTheme,
  getStoredTheme,
  getNextTheme,
  saveThemePreference,
  subscribeSystemTheme,
  Theme,
} from '../../controllers/theme';
import LanguageSelector from './LanguageSelector';

const AD_RESERVE_PATH = '/reklam';

const sanitizeHref = (href?: string) => {
  if (!href) {
    return undefined;
  }

  if (href === '#') {
    return '/';
  }

  if (href.startsWith('#')) {
    const section = href.slice(1);
    if (!section) {
      return '/';
    }
    return `/?section=${encodeURIComponent(section)}`;
  }

  return href;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'detay';

const createColumnHref = (navId: string, label: string) => `/cozumler/${slugify(navId)}/${slugify(label)}`;

const MenuIcon = () => (
  <span className="menu-icon" aria-hidden="true">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="4" height="4" rx="1" fill="currentColor" />
      <rect x="9" y="1" width="4" height="4" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="1" y="9" width="4" height="4" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="9" y="9" width="4" height="4" rx="1" fill="currentColor" />
    </svg>
  </span>
);

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9 13.5A4.5 4.5 0 1 0 9 4.5a4.5 4.5 0 0 0 0 9Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path d="M9 1v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9 15v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="m3.1 3.1 1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="m13.4 13.4 1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M1 9h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M15 9h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="m3.1 14.9 1.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="m13.4 4.6 1.5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M15.3 11.1A6.3 6.3 0 0 1 7 2.7 6.3 6.3 0 1 0 15.3 11.1Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.7H9v3.2h4.8a4 4 0 0 1-1.7 2.5v2h2.8c1.6-1.5 2.7-3.7 2.7-6Z" />
    <path fill="#34A853" d="M9 18c2.4 0 4.4-.8 5.8-2.2l-2.8-2c-.8.6-1.9 1-3 1a5.2 5.2 0 0 1-4.9-3.5H1.1v2.1A9 9 0 0 0 9 18Z" />
    <path fill="#FBBC05" d="M4.1 11.3c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V5.6H1.1a9 9 0 0 0 0 6.8l3-1.1Z" />
    <path fill="#EA4335" d="M9 3.5c1.3 0 2.4.4 3.4 1.2l2.6-2.6C13.4.8 11.4 0 9 0A9 9 0 0 0 1.1 5.6l3 2.1A5.2 5.2 0 0 1 9 3.5Z" />
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M13.3 17.4c-1 .8-1.8 1.3-2.9 1.3-1.3 0-1.7-.8-3-.8-1.3 0-1.9.8-3.1.8-1.1 0-2-.7-2.8-1.7A9.4 9.4 0 0 1 0 11.5c0-2.9 1.9-4.4 3.6-4.4 1.2 0 2.1.8 2.8.8.7 0 1.9-1 3.4-1 1.8 0 3.2.9 4 2.2-1.6.9-1.9 2.8-.9 4.2-.8 1.1-1.4 2-1.6 2.1Z"
      fill="currentColor"
    />
    <path
      d="M11.8 1.6c.6-.8 1-1.9.9-2.9-1 .1-2.1.7-2.8 1.5-.6.7-1 1.7-.9 2.8 1 0 2-.6 2.8-1.4Z"
      fill="currentColor"
    />
  </svg>
);

const MicrosoftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <rect width="8" height="8" fill="#F35325" />
    <rect x="10" width="8" height="8" fill="#81BC06" />
    <rect y="10" width="8" height="8" fill="#05A6F0" />
    <rect x="10" y="10" width="8" height="8" fill="#FFBA08" />
  </svg>
);

const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M9 0a9 9 0 0 0-2.8 17.6c.4.1.6-.2.6-.4v-1.7c-2.4.5-2.9-1.2-2.9-1.2-.3-.9-.8-1.1-.8-1.1-.6-.4 0-.4.1-.4.6 0 1 .6 1.1.8.6 1.1 1.6.8 2 .6.1-.4.3-.8.5-1-.2-.1-.9-.2-1.3-.9-.3-.6-.3-1.6.1-2.1-.2-.1-.4-.6 0-1.3 0 0 .5-.2 1.4.6.4-.1.8-.2 1.2-.2.4 0 .8.1 1.2.2.9-.8 1.4-.6 1.4-.6.3.7.2 1.2 0 1.3.4.5.4 1.5.1 2.1-.4.7-1.1.8-1.3.9.3.3.5.8.5 1.6v2.3c0 .2.2.5.6.4A9 9 0 0 0 9 0Z"
      fill="currentColor"
    />
  </svg>
);

function AdsSlot() {
  const { t } = useTranslation();

  return (
    <a className="ad-slot" href={AD_RESERVE_PATH} aria-label={t('header.ads.reserve', 'Reserve this banner')}>
      <div className="ad-tag">{t('header.ads.tag', 'Ad')}</div>
      <p>{t('header.ads.reserve', 'Reserve this banner')}</p>
    </a>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <line x1="12.4" y1="12.9" x2="16" y2="16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Header() {
  const { t, translations } = useTranslation();
  const headerRef = useRef<HTMLElement | null>(null);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());
  const [hasManualTheme, setHasManualTheme] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return Boolean(window.localStorage.getItem('vtp-theme'));
  });

  const navItems = useMemo<NavItem[]>(() => filterNavItems(translations?.header?.nav), [translations]);
  const activePanel = navItems.find((item) => item.id === activeMega);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const unsubscribe = subscribeSystemTheme((nextTheme) => {
      if (!hasManualTheme) {
        setTheme(nextTheme);
      }
    });
    return unsubscribe;
  }, [hasManualTheme]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!headerRef.current) {
        return;
      }

      if (!headerRef.current.contains(event.target as Node)) {
        setActiveMega(null);
        setAuthOpen(false);
      }
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveMega(null);
        setAuthOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    window.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  const providerButtons = useMemo(() => {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isApple = /Mac|iPhone|iPad|iPod/i.test(userAgent);
    const isWindows = /Windows/i.test(userAgent);

    const deviceProvider = isApple
      ? {
          id: 'apple',
          label: 'Apple ile devam et',
          href: '/auth/apple',
          icon: <AppleIcon />,
        }
      : isWindows
      ? {
          id: 'microsoft',
          label: 'Microsoft ile devam et',
          href: '/auth/microsoft',
          icon: <MicrosoftIcon />,
        }
      : null;

    return [
      {
        id: 'google',
        label: 'Google ile devam et',
        href: '/auth/google',
        icon: <GoogleIcon />,
      },
      deviceProvider,
      {
        id: 'github',
        label: 'GitHub ile devam et',
        href: '/auth/github',
        icon: <GithubIcon />,
      },
    ].filter(Boolean) as { id: string; label: string; href: string; icon: React.JSX.Element }[];
  }, []);

  const handleThemeToggle = () => {
    setHasManualTheme(true);
    setTheme((current) => {
      const next = getNextTheme(current);
      saveThemePreference(next);
      return next;
    });
  };

  return (
    <header className="site-header" ref={headerRef} onMouseLeave={() => setActiveMega(null)}>
      <div className="header-ads single">
        <AdsSlot />
      </div>

      <div className="header-main">
        <a className="brand" href="/">
          <img src="/logo.svg" alt={t('header.brand', 'TransparaStream')} />
          <span>{t('header.brand', 'TransparaStream')}</span>
        </a>

        <nav className="nav" aria-label={t('header.navigation', 'Primary navigation')}>
          <ul>
            {navItems.map((item) => {
              const hasColumns = Array.isArray(item.columns) && item.columns.length > 0;
              const isActive = hasColumns && activeMega === item.id;
              const href = sanitizeHref(item.href);

              return (
                <li
                  key={item.id}
                  onMouseEnter={hasColumns ? () => setActiveMega(item.id) : undefined}
                  onFocus={hasColumns ? () => setActiveMega(item.id) : undefined}
                  className={isActive ? 'active' : ''}
                >
                  {hasColumns ? (
                    <button type="button" aria-haspopup="true" aria-expanded={isActive}>
                      {item.label}
                    </button>
                  ) : href ? (
                    <a href={href}>{item.label}</a>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={handleThemeToggle}
            aria-label={t('header.actions.themeToggle', 'Tema değiştir')}
          >
            {theme === 'light' ? <SunIcon /> : <MoonIcon />}
          </button>
          <LanguageSelector />
          <button type="button" className="icon-button" aria-label={t('header.actions.searchAria', 'Search')}>
            <SearchIcon />
          </button>
          <div className="auth">
            <button
              type="button"
              className="cta"
              aria-haspopup="dialog"
              aria-expanded={authOpen}
              onClick={() => {
                setAuthOpen((open) => !open);
                setActiveMega(null);
              }}
            >
              {t('header.actions.account', 'Giriş / Kayıt')}
            </button>
          </div>
        </div>
      </div>

      {activePanel?.columns && !authOpen ? (
        <div className="header-mega" role="region" aria-label={`${activePanel.label} menu`} onMouseEnter={() => setActiveMega(activePanel.id)}>
          <div className="mega-panel">
            {activePanel.columns.map((column) => (
              <div className="mega-column" key={column.heading}>
                <div className="mega-heading">{column.heading}</div>
                <ul>
                  {column.items.map((item) => (
                    <li key={item}>
                      <a href={createColumnHref(activePanel.id, item)}>
                        <MenuIcon />
                        <span>{item}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {authOpen ? (
        <div className="header-mega" role="dialog" aria-label={t('header.auth.title', 'Hesabınız')}>
          <div className="auth-panel">
            <div className="auth-heading">
              <h3>{t('header.auth.title', 'Giriş yap')}</h3>
              <p>{t('header.auth.subtitle', 'Hizmetleri yönetmek için hesabınıza giriş yapın veya hızlıca kayıt olun.')}</p>
            </div>
            <form onSubmit={(event) => event.preventDefault()} className="auth-form">
              <label className="sr-only" htmlFor="auth-email">
                {t('header.auth.email', 'E-posta')}
              </label>
              <input id="auth-email" type="email" placeholder={t('header.auth.email', 'E-posta')} required />
              <label className="sr-only" htmlFor="auth-password">
                {t('header.auth.password', 'Şifre')}
              </label>
              <input id="auth-password" type="password" placeholder={t('header.auth.password', 'Şifre')} required />
              <button type="submit" className="primary auth-submit">
                {t('header.auth.login', 'Giriş yap')}
              </button>
            </form>
            <div className="auth-sep">
              <span>{t('header.auth.or', 'veya')}</span>
            </div>
            <div className="auth-providers">
              {providerButtons.map((provider) => (
                <a key={provider.id} className="auth-provider" href={provider.href}>
                  {provider.icon}
                  <span>{provider.label}</span>
                </a>
              ))}
            </div>
            <div className="auth-register">
              <span>{t('header.auth.noAccount', 'Henüz hesabınız yok mu?')}</span>
              <a className="link" href="/signup">
                {t('header.auth.signup', 'Hesap oluştur')}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default Header;
