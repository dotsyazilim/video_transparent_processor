import { useMemo } from 'react';
import { useTranslation } from '../../../i18n/LanguageProvider';
import './styles/feature-highlights.css';

type Feature = {
  title: string;
  description: string;
};

function FeatureHighlights() {
  const { t, translations } = useTranslation();

  const features = useMemo(() => {
    const items = translations?.features?.items;
    if (!Array.isArray(items)) {
      return [];
    }

    return items.filter((item: any) => typeof item?.title === 'string' && typeof item?.description === 'string') as Feature[];
  }, [translations]);

  return (
    <section className="features">
      <div className="section-heading">
        <p className="eyebrow">{t('features.eyebrow', 'Why creators switch')}</p>
        <h2>{t('features.title', 'Purpose-built for transparent video delivery.')}</h2>
        <p>{t('features.intro', 'Modern rendering, rich observability, and flexible outputs for every channel.')}</p>
      </div>
      <div className="feature-grid">
        {features.map((feature) => (
          <article key={feature.title}>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            <a href="#" className="learn-more">
              {t('features.learnMore', 'Learn more')}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FeatureHighlights;
