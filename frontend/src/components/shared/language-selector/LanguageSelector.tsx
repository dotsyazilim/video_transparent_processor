import { ChangeEvent, useMemo } from 'react';
import { useTranslation } from '../../../i18n/LanguageProvider';
import './styles/language-selector.css';

const FALLBACK_LANGUAGES: Record<string, string> = {
  en: 'English',
  tr: 'Türkçe',
  de: 'Deutsch',
  ar: 'العربية',
  hi: 'हिन्दी',
  ru: 'Русский',
  zh: '中文',
};

function LanguageSelector() {
  const { language, setLanguage, translations, t, isLoading } = useTranslation();

  const options = useMemo(() => {
    if (translations.languages && typeof translations.languages === 'object') {
      return translations.languages as Record<string, string>;
    }

    return FALLBACK_LANGUAGES;
  }, [translations.languages]);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLanguage(event.target.value);
  };

  return (
    <label className="language-selector">
      <span className="language-selector__label">{t('language.label', 'Language')}</span>
      <select
        className="language-selector__select"
        value={language}
        onChange={handleChange}
        disabled={isLoading && Object.keys(translations).length === 0}
      >
        {Object.entries(options).map(([code, label]) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default LanguageSelector;
