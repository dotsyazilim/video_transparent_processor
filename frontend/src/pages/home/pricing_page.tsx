import { useMemo } from 'react';
import PricingSection from '../../components/home/PricingSection/PricingSection';
import { useTranslation } from '../../i18n/LanguageProvider';
import './styles/pricing-page.css';

type FaqEntry = {
  question: string;
  answer: string;
};

function PricingPage() {
  const { t, translations } = useTranslation();

  const features = useMemo(() => {
    const items = translations?.pricingPage?.features;
    if (!Array.isArray(items)) {
      return [];
    }

    return items.filter((item: unknown): item is string => typeof item === 'string');
  }, [translations]);

  const faqs = useMemo(() => {
    const items = translations?.pricingPage?.faqs;
    if (!Array.isArray(items)) {
      return [];
    }

    return items.filter(
      (item: any) => typeof item?.question === 'string' && typeof item?.answer === 'string',
    ) as FaqEntry[];
  }, [translations]);

  return (
    <div className="pricing-page">
      <section className="pricing-page__intro">
        <p className="eyebrow">{t('pricingPage.eyebrow', 'Pricing')}</p>
        <h1>{t('pricingPage.title', 'Pick the plan that fits your workflow')}</h1>
        <p>{t('pricingPage.subtitle', 'Flexible tiers support everything from quick experiments to enterprise delivery pipelines.')}</p>
      </section>

      <PricingSection />

      <section className="pricing-page__features">
        <h2>{t('pricingPage.featuresHeading', 'Everything plans include')}</h2>
        <ul>
          {features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </section>

      <section className="pricing-page__faq">
        <h2>{t('pricingPage.faqHeading', 'Frequently asked questions')}</h2>
        <div className="pricing-page__faq-list">
          {faqs.map((entry) => (
            <details key={entry.question}>
              <summary>{entry.question}</summary>
              <p>{entry.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="pricing-page__contact">
        <h2>{t('pricingPage.contactHeading', 'Need a custom deployment?')}</h2>
        <p>{t('pricingPage.contactDescription', 'Our solutions team can design dedicated regions, hybrid rendering, and tailored SLAs.')}</p>
        <a className="primary" href="#contact">
          {t('pricingPage.contactCta', 'Talk to sales')}
        </a>
      </section>
    </div>
  );
}

export default PricingPage;
