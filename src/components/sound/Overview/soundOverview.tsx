import React, { useMemo } from 'react';
import { useTranslation } from '../../../i18n/LanguageProvider';
import '../../../styles/components/sound/soundOverview/sound-overview.css';

type Option = {
  title: string;
  description: string;
};

function SoundOverview() {
  const { t, translations } = useTranslation();

  const options = useMemo(() => {
    const items = translations?.soundPage?.options;
    if (!Array.isArray(items)) {
      return [];
    }

    return items.filter(
      (item: any) => typeof item?.title === 'string' && typeof item?.description === 'string',
    ) as Option[];
  }, [translations]);

  const formats = useMemo(() => {
    const items = translations?.soundPage?.formats;
    if (!Array.isArray(items)) {
      return [];
    }

    return items.filter((item: unknown): item is string => typeof item === 'string');
  }, [translations]);

  return (
    <div className="sound-overview">
      <section className="sound-overview__hero">
        <p className="eyebrow">{t('soundPage.eyebrow', 'Ses araçları')}</p>
        <h1>{t('soundPage.title', 'Profesyonel ses sıkıştırma ve zenginleştirme')}</h1>
        <p>{t('soundPage.subtitle', 'Diyalogları temizleyin, müzikleri dengeli hale getirin, tüm platformlar için hedeflenen ses seviyelerini yakalayın.')}</p>
      </section>

      <section className="sound-overview__options">
        <h2>{t('soundPage.optionsHeading', 'What you can do')}</h2>
        <div className="sound-overview__grid">
          {options.map((option) => (
            <article key={option.title}>
              <h3>{option.title}</h3>
              <p>{option.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sound-overview__formats">
        <h2>{t('soundPage.formatsHeading', 'Audio formats supported')}</h2>
        <ul>
          {formats.map((format) => (
            <li key={format}>{format}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default SoundOverview;
