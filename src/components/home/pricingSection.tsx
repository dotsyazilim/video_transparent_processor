import React, { useMemo } from 'react';
import { useTranslation } from '../../i18n/LanguageProvider';
import '../../styles/components/home/pricingSection/pricing-section.css';
import { Plan } from '../../../models/home';
import { filterPlans } from '../../controllers/home';

function PricingSection() {
  const { t, translations } = useTranslation();

  const plans = useMemo(() => {
    const items = translations?.pricing?.plans;
    return filterPlans(items) as Plan[];
  }, [translations]);

  return (
    <section className="pricing" id="pricing">
      <div className="section-heading">
        <p className="eyebrow">{t('pricing.eyebrow', 'Flexible usage-based plans')}</p>
        <h2>{t('pricing.title', 'From unlimited web compression to turnkey infrastructure.')}</h2>
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
            <a href={`/pricing?plan=${encodeURIComponent(plan.name)}`} className={plan.highlighted ? 'primary' : 'ghost'}>
              {plan.cta ?? (plan.highlighted ? t('pricing.primaryCta', 'Start free trial') : t('pricing.secondaryCta', 'Contact us'))}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

export default PricingSection;
