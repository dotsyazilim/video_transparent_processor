import { useMemo } from 'react';
import { useTranslation } from '../../../i18n/LanguageProvider';
import './styles/upload.css';

type UploadPreset = {
  name: string;
  description: string;
};

function UploadSection() {
  const { t, translations } = useTranslation();

  const presets = useMemo(() => {
    const items = translations?.upload?.presets;
    if (!Array.isArray(items)) {
      return [];
    }

    return items.filter((item: any) => typeof item?.name === 'string' && typeof item?.description === 'string') as UploadPreset[];
  }, [translations]);

  return (
    <section className="upload" id="upload">
      <div className="upload-card">
        <div className="upload-dropzone">
          <span className="drop-icon" aria-hidden="true">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="18" r="17" stroke="#626bcc" strokeWidth="2" strokeDasharray="6 6" />
              <path d="M18 10V24" stroke="#626bcc" strokeWidth="2" strokeLinecap="round" />
              <path d="M13 19L18 24L23 19" stroke="#626bcc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h2>{t('upload.title', 'Drop files here or browse')}</h2>
          <p className="upload-description">
            {t(
              'upload.description',
              'Supports MP4, MOV, WebM, GIF up to 1 GiB. Background removal presets are applied automatically.',
            )}
          </p>
          <div className="upload-buttons">
            <button type="button">{t('upload.select', 'Select files')}</button>
            <button type="button" className="secondary">
              {t('upload.sample', 'Use sample clip')}
            </button>
          </div>
          <p className="upload-note">{t('upload.note', 'No sign-up required for 3 free jobs per day.')}</p>
        </div>
        <aside className="upload-sidebar">
          <h3>{t('upload.sidebarTitle', 'Preset spotlight')}</h3>
          <ul>
            {presets.map((preset) => (
              <li key={preset.name}>
                <strong>{preset.name}</strong>
                <span>{preset.description}</span>
              </li>
            ))}
          </ul>
          <a href="#pricing" className="sidebar-cta">
            {t('upload.sidebarCta', 'See full preset library →')}
          </a>
        </aside>
      </div>
    </section>
  );
}

export default UploadSection;
