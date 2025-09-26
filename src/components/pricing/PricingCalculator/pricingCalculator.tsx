import React, { ChangeEvent, useMemo, useState } from 'react';
import { useTranslation } from '../../../i18n/LanguageProvider';
import '../../../styles/components/pricing/pricingCalculator/pricing-calculator.css';

type PlanId = 'starter' | 'studio' | 'enterprise';

type BreakdownItem = {
  label: string;
  amount: number;
  detail?: string;
};

type PlanOption = {
  id: PlanId;
  label: string;
  description: string;
};

const STARTER_INCLUDED = {
  api: 1_000,
  storageGb: 0.05,
};

const STUDIO_INCLUDED = {
  api: 300_000,
  storageGb: 1,
};

const ENTERPRISE_INCLUDED = {
  cpu: 2,
  ram: 2,
  storageGb: 25,
};

const STARTER_API_MAX = 200_000;
const STUDIO_API_MAX = 1_000_000;
const STARTER_STORAGE_MAX = 20; // GB
const STUDIO_STORAGE_MAX = 200; // GB
const ENTERPRISE_CPU_MAX = 32;
const ENTERPRISE_RAM_MAX = 64;
const ENTERPRISE_STORAGE_MAX = 500; // GB

const STORAGE_RATE = 0.1; // $ per GB
const STARTER_API_RATE = 1; // $ per extra 10k
const STUDIO_API_RATE = 1; // $ per extra 20k
const ENTERPRISE_CPU_RATE = 0.99; // $ per vCPU
const ENTERPRISE_RAM_RATE = 0.99; // $ per GB RAM

const STARTER_BASE = 0;
const STUDIO_BASE = 4.99;
const ENTERPRISE_BASE = 4.99;

function formatRequests(value: number, locale: string) {
  if (value >= 1_000_000) {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value / 1_000_000) + 'M';
  }
  if (value >= 1_000) {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value / 1_000) + 'K';
  }
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

function PricingCalculator() {
  const { t, language } = useTranslation();
  const locale = language === 'tr' ? 'tr-TR' : 'en-US';

  const [plan, setPlan] = useState<PlanId>('starter');
  const [starterApiRequests, setStarterApiRequests] = useState(STARTER_INCLUDED.api);
  const [starterStorageGb, setStarterStorageGb] = useState(STARTER_INCLUDED.storageGb);
  const [studioApiRequests, setStudioApiRequests] = useState(STUDIO_INCLUDED.api);
  const [studioStorageGb, setStudioStorageGb] = useState(STUDIO_INCLUDED.storageGb);
  const [enterpriseCpu, setEnterpriseCpu] = useState(ENTERPRISE_INCLUDED.cpu);
  const [enterpriseRam, setEnterpriseRam] = useState(ENTERPRISE_INCLUDED.ram);
  const [enterpriseStorageGb, setEnterpriseStorageGb] = useState(ENTERPRISE_INCLUDED.storageGb);

  const apiRequests = plan === 'starter' ? starterApiRequests : plan === 'studio' ? studioApiRequests : 0;
  const storageGb = plan === 'starter' ? starterStorageGb : plan === 'studio' ? studioStorageGb : enterpriseStorageGb;

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [locale],
  );

  const planOptions: PlanOption[] = useMemo(
    () => [
      {
        id: 'starter',
        label: t('pricingPage.calculator.plan.starter', 'Starter'),
        description: t(
          'pricingPage.calculator.plan.starterDescription',
          'Unlimited web compression for ≤5 MB images and ≤100 MB videos. Pay as you go for API calls and storage.',
        ),
      },
      {
        id: 'studio',
        label: t('pricingPage.calculator.plan.studio', 'Studio'),
        description: t(
          'pricingPage.calculator.plan.studioDescription',
          'Everything in Starter plus bigger web limits, 10k API requests per day included, and 1 GB managed storage.',
        ),
      },
      {
        id: 'enterprise',
        label: t('pricingPage.calculator.plan.enterprise', 'Enterprise'),
        description: t(
          'pricingPage.calculator.plan.enterpriseDescription',
          'Rent dedicated nodes. Start with 2 vCPU / 2 GB RAM and 25 GB storage, then drag to scale resources.',
        ),
      },
    ],
    [t],
  );

  const { total, breakdown, highlight } = useMemo(() => {
    const items: BreakdownItem[] = [];
    let summary = '';

    if (plan === 'starter') {
      items.push({
        label: t('pricingPage.calculator.breakdown.baseStarter', 'Starter base plan'),
        amount: STARTER_BASE,
        detail: t(
          'pricingPage.calculator.breakdown.baseStarterDetail',
          'Unlimited web compression for ≤5 MB images and ≤100 MB videos.',
        ),
      });

      const extraRequests = Math.max(apiRequests - STARTER_INCLUDED.api, 0);
      const apiUnits = extraRequests === 0 ? 0 : Math.ceil(extraRequests / 10_000);
      const apiCost = apiUnits * STARTER_API_RATE;

      items.push({
        label: t('pricingPage.calculator.breakdown.apiStarter', 'API usage (1,000 requests included)'),
        amount: apiCost,
        detail: t('pricingPage.calculator.breakdown.apiStarterDetail', '$1 per additional 10k requests.'),
      });

      const extraStorage = Math.max(storageGb - STARTER_INCLUDED.storageGb, 0);
      const storageCost = parseFloat((extraStorage * STORAGE_RATE).toFixed(2));

      items.push({
        label: t('pricingPage.calculator.breakdown.storageStarter', 'Storage (first 50 MB included)'),
        amount: storageCost,
        detail: t('pricingPage.calculator.breakdown.storageDetail', '$0.10 per additional GB.'),
      });

      summary = t(
        'pricingPage.calculator.highlight.starter',
        'Perfect for individuals shipping lightweight assets with occasional API or storage bursts.',
      );

      const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
      return { total: parseFloat(totalAmount.toFixed(2)), breakdown: items, highlight: summary };
    }

    if (plan === 'studio') {
      items.push({
        label: t('pricingPage.calculator.breakdown.baseStudio', 'Studio subscription'),
        amount: STUDIO_BASE,
        detail: t(
          'pricingPage.calculator.breakdown.baseStudioDetail',
          'Includes bigger web uploads (≤50 MB images, ≤1 GB videos) and 10k API requests per day.',
        ),
      });

      const extraRequests = Math.max(apiRequests - STUDIO_INCLUDED.api, 0);
      const apiUnits = extraRequests === 0 ? 0 : Math.ceil(extraRequests / 20_000);
      const apiCost = apiUnits * STUDIO_API_RATE;

      items.push({
        label: t('pricingPage.calculator.breakdown.apiStudio', 'API usage beyond 10k/day included allotment'),
        amount: apiCost,
        detail: t('pricingPage.calculator.breakdown.apiStudioDetail', '$1 per additional 20k requests.'),
      });

      const extraStorage = Math.max(storageGb - STUDIO_INCLUDED.storageGb, 0);
      const storageCost = parseFloat((extraStorage * STORAGE_RATE).toFixed(2));

      items.push({
        label: t('pricingPage.calculator.breakdown.storageStudio', 'Storage (first 1 GB included)'),
        amount: storageCost,
        detail: t('pricingPage.calculator.breakdown.storageDetail', '$0.10 per additional GB.'),
      });

      summary = t(
        'pricingPage.calculator.highlight.studio',
        'Great for teams managing steady workloads, thumbnails, and mezzanine assets with predictable API volume.',
      );

      const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
      return { total: parseFloat(totalAmount.toFixed(2)), breakdown: items, highlight: summary };
    }

    items.push({
      label: t('pricingPage.calculator.breakdown.baseEnterprise', 'Enterprise base node'),
      amount: ENTERPRISE_BASE,
      detail: t(
        'pricingPage.calculator.breakdown.baseEnterpriseDetail',
        'Dedicated 2 vCPU / 2 GB RAM node with 25 GB storage. Estimated 50k requests per day.',
      ),
    });

    const extraCpu = Math.max(enterpriseCpu - ENTERPRISE_INCLUDED.cpu, 0);
    const cpuCost = parseFloat((extraCpu * ENTERPRISE_CPU_RATE).toFixed(2));
    items.push({
      label: t('pricingPage.calculator.breakdown.cpuEnterprise', 'Additional vCPU'),
      amount: cpuCost,
      detail: t('pricingPage.calculator.breakdown.cpuEnterpriseDetail', '$0.99 per extra vCPU.'),
    });

    const extraRam = Math.max(enterpriseRam - ENTERPRISE_INCLUDED.ram, 0);
    const ramCost = parseFloat((extraRam * ENTERPRISE_RAM_RATE).toFixed(2));
    items.push({
      label: t('pricingPage.calculator.breakdown.ramEnterprise', 'Additional RAM'),
      amount: ramCost,
      detail: t('pricingPage.calculator.breakdown.ramEnterpriseDetail', '$0.99 per extra GB RAM.'),
    });

    const extraStorage = Math.max(storageGb - ENTERPRISE_INCLUDED.storageGb, 0);
    const storageCost = parseFloat((extraStorage * STORAGE_RATE).toFixed(2));
    items.push({
      label: t('pricingPage.calculator.breakdown.storageEnterprise', 'Storage (first 25 GB included)'),
      amount: storageCost,
      detail: t('pricingPage.calculator.breakdown.storageDetail', '$0.10 per additional GB.'),
    });

    summary = t(
      'pricingPage.calculator.highlight.enterprise',
      'Tune dedicated capacity for pipelines handling massive daily workloads or on-premise requirements.',
    );

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    return { total: parseFloat(totalAmount.toFixed(2)), breakdown: items, highlight: summary };
  }, [plan, t, apiRequests, storageGb, enterpriseCpu, enterpriseRam]);

  const handlePlanChange = (id: PlanId) => {
    setPlan(id);
  };

  const handleApiChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (plan === 'starter') {
      setStarterApiRequests(value);
    } else if (plan === 'studio') {
      setStudioApiRequests(value);
    }
  };

  const handleStorageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    if (plan === 'starter') {
      setStarterStorageGb(value);
    } else if (plan === 'studio') {
      setStudioStorageGb(value);
    } else {
      setEnterpriseStorageGb(value);
    }
  };

  const apiLabel = plan === 'starter'
    ? t('pricingPage.calculator.apiLabelStarter', 'Monthly API requests')
    : t('pricingPage.calculator.apiLabelStudio', 'Monthly API requests');

  const apiRangeMax = plan === 'starter' ? STARTER_API_MAX : STUDIO_API_MAX;
  const apiIncluded = plan === 'starter' ? STARTER_INCLUDED.api : STUDIO_INCLUDED.api;
  const storageLabel = plan === 'enterprise'
    ? t('pricingPage.calculator.storageLabelEnterprise', 'Storage (GB)')
    : t('pricingPage.calculator.storageLabel', 'Storage (GB)');

  return (
    <section className="pricing-calculator">
      <div className="calculator-card">
        <header>
          <p className="eyebrow">{t('pricingPage.calculator.eyebrow', 'Cost estimator')}</p>
          <h2>{t('pricingPage.calculator.title', 'Drag the sliders to model your monthly bill.')}</h2>
          <p>{t('pricingPage.calculator.subtitle', 'Switch plans and drag the handles to reflect the API, storage, and infrastructure you need.')}</p>
        </header>

        <div className="plan-toggle" role="tablist" aria-label={t('pricingPage.calculator.planToggleAria', 'Select a pricing plan')}>
          {planOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={plan === option.id}
              className={plan === option.id ? 'active' : ''}
              onClick={() => handlePlanChange(option.id)}
            >
              <span className="plan-label">{option.label}</span>
              <span className="plan-description">{option.description}</span>
            </button>
          ))}
        </div>

        {plan !== 'enterprise' ? (
          <div className="input-stack">
            <label>
              <span>{apiLabel}</span>
              <strong>{formatRequests(apiRequests, locale)}</strong>
              <small>
                {t(
                  'pricingPage.calculator.apiIncluded',
                  '{{included}} free, then billed per additional block.',
                ).replace('{{included}}', formatRequests(apiIncluded, locale))}
              </small>
              <input
                type="range"
                min={0}
                max={apiRangeMax}
                step={1_000}
                value={apiRequests}
                onChange={handleApiChange}
                aria-valuemin={0}
                aria-valuemax={apiRangeMax}
                aria-valuenow={apiRequests}
                aria-valuetext={`${formatRequests(apiRequests, locale)} ${t('pricingPage.calculator.requests', 'requests')}`}
              />
            </label>

            <label>
              <span>{storageLabel}</span>
              <strong>
                {new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(storageGb)} {t('pricingPage.calculator.unitGb', 'GB')}
              </strong>
              <small>
                {plan === 'starter'
                  ? t('pricingPage.calculator.storageStarterHelper', 'First 0.05 GB (50 MB) included.')
                  : t('pricingPage.calculator.storageStudioHelper', 'First 1 GB included.')} 
              </small>
              <input
                type="range"
                min={0}
                max={plan === 'starter' ? STARTER_STORAGE_MAX : STUDIO_STORAGE_MAX}
                step={0.05}
                value={storageGb}
                onChange={handleStorageChange}
                aria-valuemin={0}
                aria-valuemax={plan === 'starter' ? STARTER_STORAGE_MAX : STUDIO_STORAGE_MAX}
                aria-valuenow={storageGb}
                aria-valuetext={`${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(storageGb)} ${t('pricingPage.calculator.unitGb', 'GB')}`}
              />
            </label>
          </div>
        ) : (
          <div className="input-stack">
            <label>
              <span>{t('pricingPage.calculator.cpuLabel', 'vCPU count')}</span>
              <strong>{enterpriseCpu}</strong>
              <small>{t('pricingPage.calculator.cpuHelper', 'Base node includes 2 vCPU. Each extra vCPU is $0.99.')}</small>
              <input
                type="range"
                min={ENTERPRISE_INCLUDED.cpu}
                max={ENTERPRISE_CPU_MAX}
                step={1}
                value={enterpriseCpu}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setEnterpriseCpu(Number(event.target.value))}
                aria-valuemin={ENTERPRISE_INCLUDED.cpu}
                aria-valuemax={ENTERPRISE_CPU_MAX}
                aria-valuenow={enterpriseCpu}
                aria-valuetext={`${enterpriseCpu} ${t('pricingPage.calculator.unitCpu', 'vCPU')}`}
              />
            </label>
            <label>
              <span>{t('pricingPage.calculator.ramLabel', 'RAM (GB)')}</span>
              <strong>{enterpriseRam}</strong>
              <small>{t('pricingPage.calculator.ramHelper', 'Base node includes 2 GB RAM. Each extra GB is $0.99.')}</small>
              <input
                type="range"
                min={ENTERPRISE_INCLUDED.ram}
                max={ENTERPRISE_RAM_MAX}
                step={1}
                value={enterpriseRam}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setEnterpriseRam(Number(event.target.value))}
                aria-valuemin={ENTERPRISE_INCLUDED.ram}
                aria-valuemax={ENTERPRISE_RAM_MAX}
                aria-valuenow={enterpriseRam}
                aria-valuetext={`${enterpriseRam} ${t('pricingPage.calculator.unitGb', 'GB')}`}
              />
            </label>
            <label>
              <span>{storageLabel}</span>
              <strong>
                {new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(storageGb)} {t('pricingPage.calculator.unitGb', 'GB')}
              </strong>
              <small>{t('pricingPage.calculator.storageEnterpriseHelper', 'First 25 GB included. Drag to add more reserved storage.')}</small>
              <input
                type="range"
                min={ENTERPRISE_INCLUDED.storageGb}
                max={ENTERPRISE_STORAGE_MAX}
                step={1}
                value={enterpriseStorageGb}
                onChange={handleStorageChange}
                aria-valuemin={ENTERPRISE_INCLUDED.storageGb}
                aria-valuemax={ENTERPRISE_STORAGE_MAX}
                aria-valuenow={enterpriseStorageGb}
                aria-valuetext={`${enterpriseStorageGb} ${t('pricingPage.calculator.unitGb', 'GB')}`}
              />
            </label>
          </div>
        )}

        <footer>
          <div className="total">
            <span>{t('pricingPage.calculator.totalLabel', 'Estimated monthly total')}</span>
            <strong>{currencyFormatter.format(total)}</strong>
          </div>
          <ul>
            {breakdown.map((item) => (
              <li key={item.label}>
                <div>
                  <span className="breakdown-label">{item.label}</span>
                  {item.detail ? <small>{item.detail}</small> : null}
                </div>
                <span className="breakdown-amount">{currencyFormatter.format(item.amount)}</span>
              </li>
            ))}
          </ul>
          <p className="highlight">{highlight}</p>
        </footer>
      </div>
    </section>
  );
}

export default PricingCalculator;
