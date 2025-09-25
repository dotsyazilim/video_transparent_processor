import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const DEFAULT_LANGUAGE = 'en';

interface LanguageContextValue {
  language: string;
  setLanguage: (nextLanguage: string) => void;
  translations: Record<string, any>;
  isLoading: boolean;
  t: (key: string, fallback?: string) => string;
}

const noop = () => {};

const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANGUAGE,
  setLanguage: noop,
  translations: {},
  isLoading: true,
  t: (key, fallback) => fallback ?? key,
});

const getNestedValue = (data: Record<string, any>, key: string) => {
  const segments = key.split('.');
  let current: any = data;

  for (const segment of segments) {
    if (current == null) {
      return undefined;
    }

    current = current[segment];
  }

  return current;
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadTranslations = useCallback(async (nextLanguage: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/lang/${nextLanguage}.json`);

      if (!response.ok) {
        throw new Error(`Unable to load translations for ${nextLanguage}`);
      }

      const data = await response.json();
      setTranslations(data);
    } catch (error) {
      console.error(error);
      setTranslations({});

      if (nextLanguage !== DEFAULT_LANGUAGE) {
        setLanguage(DEFAULT_LANGUAGE);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTranslations(language);
  }, [language, loadTranslations]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      translations,
      isLoading,
      t: (key: string, fallback?: string) => {
        const result = getNestedValue(translations, key);
        if (result == null) {
          return fallback ?? key;
        }

        return result;
      },
    }),
    [language, translations, isLoading],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  return useContext(LanguageContext);
}
