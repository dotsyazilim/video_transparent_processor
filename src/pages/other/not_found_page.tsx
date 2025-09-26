import React from 'react';
import { useTranslation } from '../../i18n/LanguageProvider';
import '../../styles/pages/other/not-found-page.css';

function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="not-found-page">
      <h1>{t('notFound.title', 'Page not found')}</h1>
      <p>{t('notFound.description', 'The page you are looking for might have been moved or is temporarily unavailable.')}</p>
      <a className="primary" href="/">
        {t('notFound.cta', 'Go back home')}
      </a>
    </div>
  );
}

export default NotFoundPage;
