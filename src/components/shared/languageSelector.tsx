import React, { ChangeEvent, useMemo } from 'react';
import { useTranslation } from '../../i18n/LanguageProvider';
import '../../styles/components/shared/languageSelector/language-selector.css';

const FALLBACK_LANGUAGES: Record<string, string> = {
  en: 'English',
  tr: 'Türkçe',
  de: 'Deutsch',
  ar: 'العربية',
  hi: 'हिन्दी',
  ru: 'Русский',
  zh: '中文',
};

// Basic country flag emoji mapping for a compact flag dropdown.
// Note: Emoji flags won’t render everywhere; this is a lightweight default.
const FLAG: Record<string, string> = {
  en: '🇺🇸',
  tr: '🇹🇷',
  de: '🇩🇪',
  ar: '🇸🇦',
  hi: '🇮🇳',
  ru: '🇷🇺',
  zh: '🇨🇳',
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
      <select
        className="language-selector__select"
        value={language}
        onChange={handleChange}
        disabled={isLoading && Object.keys(translations).length === 0}
        aria-label={t('language.label', 'Language')}
      >
        {Object.entries(options).map(([code, label]) => (
          <option key={code} value={code}>
            {`${FLAG[code] ?? ''} ${label}`.trim()}
          </option>
        ))}
      </select>
    </label>
  );
}

export default LanguageSelector;
