import React, { useMemo } from 'react';
import { useTranslation } from '../../../i18n/LanguageProvider';
import '../../../styles/components/video/videoOverview/video-overview.css';

type Workflow = {
  title: string;
  description: string;
};

function VideoOverview() {
  const { t, translations } = useTranslation();

  const workflows = useMemo(() => {
    const items = translations?.videoPage?.workflows;
    if (!Array.isArray(items)) {
      return [];
    }

    return items.filter(
      (item: any) => typeof item?.title === 'string' && typeof item?.description === 'string',
    ) as Workflow[];
  }, [translations]);

  const presets = useMemo(() => {
    const items = translations?.videoPage?.presets;
    if (!Array.isArray(items)) {
      return [];
    }

    return items.filter((item: unknown): item is string => typeof item === 'string');
  }, [translations]);

  return (
    <div className="video-overview">
      <section className="video-overview__hero">
        <p className="eyebrow">{t('videoPage.eyebrow', 'Video sıkıştırma')}</p>
        <h1>{t('videoPage.title', 'Akıllı video sıkıştırması ve depolama')}</h1>
        <p>{t('videoPage.subtitle', 'Kare kare optimizasyon, modern kodekler ve depolama politikanızla uyumlu presetler.')}</p>
        <div className="video-overview__actions">
          <a className="primary" href="/?section=upload">
            {t('videoPage.primaryAction', 'Sıkıştırmayı başlat')}
          </a>
          <a className="ghost" href="/docs/workflows">
            {t('videoPage.secondaryAction', 'Workflow rehberini incele')}
          </a>
        </div>
      </section>

      <section className="video-overview__workflows">
        <h2>{t('videoPage.workflowsHeading', 'Choose a ready-to-run workflow')}</h2>
        <div className="video-overview__grid">
          {workflows.map((workflow) => (
            <article key={workflow.title}>
              <h3>{workflow.title}</h3>
              <p>{workflow.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="video-overview__presets">
        <h2>{t('videoPage.presetsHeading', 'Popular preset bundles')}</h2>
        <ul>
          {presets.map((preset) => (
            <li key={preset}>{preset}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default VideoOverview;
