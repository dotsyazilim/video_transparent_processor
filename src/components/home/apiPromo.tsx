import React, { useMemo } from 'react';
import { useTranslation } from '../../i18n/LanguageProvider';
import '../../styles/components/home/apiPromo/api-promo.css';

type ApiBenefit = string;

const defaultCodeSample = `curl -X POST https://api.transparastream.com/v1/compress \
  -H "Authorization: Bearer <token>" \
  -d '{"preset":"web-stream","storeMaster":true,"callbacks":["s3"]}'`;

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
        <h2>{t('apiPromo.title', 'Tek API ile sıkıştırma ve depolamayı yönetin')}</h2>
        <p>
          {t(
            'apiPromo.description',
            'Tarayıcıdan başlatın, API ile büyütün. Tek bir JSON ile sıkıştırma, depolama ve teslim zincirinizi uçtan uca yönetin.',
          )}
        </p>
        <ul>
          {benefits.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
        <div className="api-actions">
          <a className="primary" href="/docs/api">
            {t('apiPromo.primaryAction', 'API referansını aç')}
          </a>
          <a className="ghost" href="/sandbox">
            {t('apiPromo.secondaryAction', 'Sandbox anahtarı oluştur')}
          </a>
        </div>
      </div>
      <div className="api-code">
        <pre>{t('apiPromo.codeSample', defaultCodeSample)}</pre>
      </div>
    </section>
  );
}

export default ApiPromo;
