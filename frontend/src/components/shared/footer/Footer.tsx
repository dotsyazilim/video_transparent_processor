import { useMemo } from 'react';
import { useTranslation } from '../../../i18n/LanguageProvider';
import './styles/footer.css';

type FooterLink = {
  label: string;
  href: string;
};

type FooterColumn = {
  heading: string;
  links: FooterLink[];
};

const isFooterColumn = (value: unknown): value is FooterColumn => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return typeof candidate.heading === 'string' && Array.isArray(candidate.links);
};

function Footer() {
  const { t, translations } = useTranslation();

  const columns = useMemo(() => {
    const rawColumns = translations?.footer?.columns;

    if (!Array.isArray(rawColumns)) {
      return [];
    }

    return rawColumns.filter(isFooterColumn) as FooterColumn[];
  }, [translations]);

  const socialLinks = useMemo(() => {
    const items = translations?.footer?.social;

    if (!Array.isArray(items)) {
      return [];
    }

    return items.filter((item: any) => typeof item?.label === 'string' && typeof item?.href === 'string');
  }, [translations]);

  const year = new Date().getFullYear();
  const brand = t('header.brand', 'TransparaStream');

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <a className="brand" href="/">
            <img src="/logo.svg" alt={brand} />
            <span>{brand}</span>
          </a>
          <p>{t('footer.description', 'Compress, convert, and monetise transparent media with ad-ready workflows.')}</p>
        </div>
        {columns.map((column) => (
          <div key={column.heading}>
            <h4>{column.heading}</h4>
            <ul>
              {column.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <span>
          &copy; {year} {brand}. {t('footer.rights', 'All rights reserved.')}
        </span>
        <div className="socials">
          {socialLinks.map((link) => (
            <a key={link.label} href={link.href} aria-label={link.label}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
