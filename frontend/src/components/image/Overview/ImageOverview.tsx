import { useMemo } from 'react';
import { useTranslation } from '../../../i18n/LanguageProvider';
import './styles/image-overview.css';

type Workflow = {
  title: string;
  description: string;
};

function ImageOverview() {
  const { t, translations } = useTranslation();

  const workflows = useMemo(() => {
    const items = translations?.imagePage?.workflows;
    if (!Array.isArray(items)) {
      return [];
    }

    return items.filter(
      (item: any) => typeof item?.title === 'string' && typeof item?.description === 'string',
    ) as Workflow[];
  }, [translations]);

  const formats = useMemo(() => {
    const items = translations?.imagePage?.formats;
    if (!Array.isArray(items)) {
      return [];
    }

    return items.filter((item: unknown): item is string => typeof item === 'string');
  }, [translations]);

  return (
    <div className="image-overview">
      <section className="image-overview__hero">
        <p className="eyebrow">{t('imagePage.eyebrow', 'Image tools')}</p>
        <h1>{t('imagePage.title', 'Crystal-clear transparent image pipelines')}</h1>
        <p>{t('imagePage.subtitle', 'Optimise sprites, UI exports, and marketing assets without losing alpha fidelity.')}</p>
      </section>

      <section className="image-overview__workflows">
        <h2>{t('imagePage.workflowsHeading', 'Popular image workflows')}</h2>
        <div className="image-overview__grid">
          {workflows.map((workflow) => (
            <article key={workflow.title}>
              <h3>{workflow.title}</h3>
              <p>{workflow.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="image-overview__formats">
        <h2>{t('imagePage.formatsHeading', 'Supported formats')}</h2>
        <ul>
          {formats.map((format) => (
            <li key={format}>{format}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default ImageOverview;
