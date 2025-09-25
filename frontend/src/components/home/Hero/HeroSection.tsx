import { useMemo } from 'react';
import { useTranslation } from '../../../i18n/LanguageProvider';
import './styles/hero.css';

type Metric = {
  value: string;
  label: string;
};

type PreviewCopy = {
  before: string;
  after: string;
  original: string;
  processed: string;
};

function HeroSection() {
  const { t, translations } = useTranslation();

  const metrics = useMemo(() => {
    const items = translations?.hero?.metrics;
    if (!Array.isArray(items)) {
      return [];
    }

    return items.filter((item: any) => typeof item?.value === 'string' && typeof item?.label === 'string') as Metric[];
  }, [translations]);

  const previews = useMemo(() => {
    const raw = translations?.hero?.previews;
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    return raw as PreviewCopy;
  }, [translations]);

  return (
    <section className="hero">
      <div className="hero-content">
        <p className="eyebrow">{t('hero.eyebrow', 'Next-gen transparent compression')}</p>
        <h1>{t('hero.title', 'Deliver lightweight videos with studio-grade alpha channels.')}</h1>
        <p className="hero-description">
          {t(
            'hero.description',
            'Drag and drop media to remove white or chroma backgrounds, balance bitrate, and ship ready-to-stream assets in seconds.',
          )}
        </p>
        <div className="hero-actions">
          <a className="primary" href="#upload">
            {t('hero.primaryAction', 'Upload a file')}
          </a>
          <a className="ghost" href="#api">
            {t('hero.secondaryAction', 'Explore the API')}
          </a>
        </div>
        <ul className="hero-metrics">
          {metrics.map((metric) => (
            <li key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="hero-card">
        <div className="card-header">
          <span className="status-pill">{t('hero.status', 'Live preview')}</span>
          <span className="card-title">{t('hero.cardTitle', 'HQ WebP with transparent alpha')}</span>
        </div>
        <div className="card-body">
          <div className="preview-grid">
            <div className="preview before">
              <span>{previews?.before ?? t('hero.previews.before', 'Before')}</span>
              <div className="mock-frame mock-before">
                <span>{previews?.original ?? t('hero.previews.original', 'Original footage')}</span>
              </div>
            </div>
            <div className="preview after">
              <span>{previews?.after ?? t('hero.previews.after', 'After')}</span>
              <div className="mock-frame mock-after">
                <span>{previews?.processed ?? t('hero.previews.processed', 'Transparent WebP')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
