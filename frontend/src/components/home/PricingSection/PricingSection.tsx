import { useMemo } from 'react';
import { useTranslation } from '../../../i18n/LanguageProvider';
import './styles/pricing-section.css';

type Plan = {
  name: string;
  price: string;
  cadence?: string;
  features: string[];
  highlighted?: boolean;
  cta?: string;
};

const isPlan = (item: unknown): item is Plan => {
  if (!item || typeof item !== 'object') {
    return false;
  }

  const candidate = item as Record<string, unknown>;
  return typeof candidate.name === 'string' && typeof candidate.price === 'string' && Array.isArray(candidate.features);
};

function PricingSection() {
  const { t, translations } = useTranslation();

  const plans = useMemo(() => {
    const items = translations?.pricing?.plans;
    if (!Array.isArray(items)) {
      return [];
    }

    return items.filter(isPlan) as Plan[];
  }, [translations]);

  return (
    <section className="pricing" id="pricing">
      <div className="section-heading">
        <p className="eyebrow">{t('pricing.eyebrow', 'Simple plans')}</p>
        <h2>{t('pricing.title', 'Scale from solo creator to enterprise distribution.')}</h2>
      </div>
      <div className="pricing-grid">
        {plans.map((plan) => (
          <article key={plan.name} className={plan.highlighted ? 'highlighted' : ''}>
            <h3>{plan.name}</h3>
            <p className="price">
              <span>{plan.price}</span>
              {plan.cadence ? <small>{plan.cadence}</small> : null}
            </p>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <a href="#" className={plan.highlighted ? 'primary' : 'ghost'}>
              {plan.cta ?? (plan.highlighted ? t('pricing.primaryCta', 'Start free trial') : t('pricing.secondaryCta', 'Contact us'))}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

export default PricingSection;
