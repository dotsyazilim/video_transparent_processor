import { useMemo, useState } from 'react';
import LanguageSelector from '../language-selector/LanguageSelector';
import { useTranslation } from '../../../i18n/LanguageProvider';
import './styles/header.css';

type NavColumn = {
  heading: string;
  items: string[];
};

type NavItem = {
  id: string;
  label: string;
  description?: string;
  columns?: NavColumn[];
  href?: string;
};

const isNavItem = (value: unknown): value is NavItem => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === 'string' && typeof candidate.label === 'string';
};

const isNavColumn = (value: unknown): value is NavColumn => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return typeof candidate.heading === 'string' && Array.isArray(candidate.items);
};

const filterNavItems = (value: unknown): NavItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isNavItem).map((item) => ({
    ...item,
    columns: Array.isArray(item.columns) ? item.columns.filter(isNavColumn) : undefined,
    href: typeof item.href === 'string' ? item.href : undefined,
  }));
};

function AdsSlot() {
  const { t } = useTranslation();

  return (
    <a className="ad-slot" href="#" aria-label={t('header.ads.reserve', 'Reserve this banner')}>
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
      <circle cx="8" cy="8" r="5.5" stroke="#4a4f7a" strokeWidth="1.5" />
      <line x1="12.4" y1="12.9" x2="16" y2="16.5" stroke="#4a4f7a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Header() {
  const { t, translations } = useTranslation();
  const [active, setActive] = useState<string | null>(null);

  const navItems = useMemo(() => filterNavItems(translations?.header?.nav), [translations]);
  const activePanel = navItems.find((item) => item.id === active);

  return (
    <header className="site-header" onMouseLeave={() => setActive(null)}>
      <div className="header-ads">
        <AdsSlot />
        <div className="infobar">
          <span>{t('header.ads.infobar', 'Boost ROI with branded ad slots & white-label embeds.')}</span>
        </div>
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
              const isActive = item.id === active && hasColumns;

              return (
                <li
                  key={item.id}
                  onMouseEnter={hasColumns ? () => setActive(item.id) : undefined}
                  onFocus={hasColumns ? () => setActive(item.id) : undefined}
                  className={isActive ? 'active' : ''}
                >
                  {hasColumns ? (
                    <button type="button" aria-haspopup="true" aria-expanded={isActive}>
                      {item.label}
                    </button>
                  ) : (
                    <a href={item.href ?? '#'}>{item.label}</a>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="header-actions">
          <LanguageSelector />
          <button type="button" className="icon-button" aria-label={t('header.actions.searchAria', 'Search')}>
            <SearchIcon />
          </button>
          <a className="link" href="#login">
            {t('header.actions.login', 'Log In')}
          </a>
          <a className="cta" href="#signup">
            {t('header.actions.signup', 'Sign Up')}
          </a>
        </div>
      </div>

      {activePanel?.columns && (
        <div className="header-mega" onMouseEnter={() => setActive(activePanel.id)}>
          <div className="mega-panel" role="region" aria-label={`${activePanel.label} menu`}>
            {activePanel.columns.map((column) => (
              <div className="mega-column" key={column.heading}>
                <div className="mega-heading">{column.heading}</div>
                <ul>
                  {column.items.map((item) => (
                    <li key={item}>
                      <a href="#">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
