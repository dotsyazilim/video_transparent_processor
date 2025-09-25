import { useMemo } from 'react';
import { useTranslation } from '../../../i18n/LanguageProvider';
import './styles/api-promo.css';

type ApiBenefit = string;

function ApiPromo() {
  const { t, translations } = useTranslation();

  const benefits = useMemo(() => {
    const items = translations?.apiPromo?.benefits;
    if (!Array.isArray(items)) {
      return [];
    }

    return items.filter((item: unknown): item is ApiBenefit => typeof item === 'string');
  }, [translations]);

  return (
    <section className="api-promo" id="api">
      <div className="api-content">
        <h2>{t('apiPromo.title', 'Integrate background-aware compression into your workflow.')}</h2>
        <p>{t('apiPromo.description', 'Our REST API mirrors the UI presets so your automation can process footage at scale.')}</p>
        <ul>
          {benefits.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
        <div className="api-actions">
          <a className="primary" href="#">
            {t('apiPromo.primaryAction', 'View API reference')}
          </a>
          <a className="ghost" href="#">
            {t('apiPromo.secondaryAction', 'Generate sandbox key')}
          </a>
        </div>
      </div>
      <div className="api-code">
        <pre>{t('apiPromo.codeSample', 'curl -X POST https://api.transparastream.com/v1/process')}</pre>
      </div>
    </section>
  );
}

export default ApiPromo;
