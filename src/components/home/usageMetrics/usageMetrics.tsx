import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../i18n/LanguageProvider';
import '../../../styles/components/home/usageMetrics/usage-metrics.css';

interface AnimatedMetric {
  key: string;
  startValue: number;
  endValue: number;
  suffix: string;
  label: string;
  description: string;
}

const metricsData: AnimatedMetric[] = [
  {
    key: 'images',
    startValue: 0,
    endValue: 1200000000, // 1.2B+
    suffix: '',
    label: 'Sıkıştırılan Görsel',
    description: 'PNG, JPEG, WebP ve diğer formatlar'
  },
  {
    key: 'videos',
    startValue: 0,
    endValue: 500000000, // 500M+
    suffix: '',
    label: 'Sıkıştırılan Video',
    description: 'MP4, WebM, MOV ve diğer formatlar'
  },
  {
    key: 'storage',
    startValue: 0,
    endValue: 800, // 800TB+
    suffix: 'TB',
    label: 'Kazanılan Depolama',
    description: 'Toplam tasarruf edilen alan'
  }
];

function UsageMetrics() {
  const { t } = useTranslation();
  const [animatedValues, setAnimatedValues] = useState<{ [key: string]: number }>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const intervals: ReturnType<typeof setInterval>[] = [];

    metricsData.forEach((metric) => {
      let current = metric.startValue;
      const increment = metric.endValue / 100; // 100 adımda tamamla
      const interval = setInterval(() => {
        current += increment;
        if (current >= metric.endValue) {
          current = metric.endValue;
          clearInterval(interval);
        }

        setAnimatedValues(prev => ({
          ...prev,
          [metric.key]: Math.floor(current)
        }));
      }, 50);

      intervals.push(interval);
    });

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [isVisible]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B+';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M+';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K+';
    }
    return num.toString();
  };

  return (
    <section className="usage-metrics">
      <header className="usage-metrics__header">
        <p className="usage-metrics__eyebrow">{t('usageMetrics.eyebrow', 'Gerçek kullanım verileri')}</p>
        <h2>{t('usageMetrics.title', 'Saniyeler içinde ölçeklenen alt yapı')}</h2>
        <p className="usage-metrics__subtitle">
          {t(
            'usageMetrics.subtitle',
            'Platformumuz görüntü, video ve doküman yüklerini küresel olarak dengelerken kalite ve hızdan ödün vermiyor.',
          )}
        </p>
      </header>

      <div className="usage-metrics__grid">
        {metricsData.map((metric) => {
          const currentValue = animatedValues[metric.key] || 0;
          const displayValue = formatNumber(currentValue) + metric.suffix;

          return (
            <article className="usage-metrics__card" key={metric.key} data-metric={metric.key}>
              <span className="usage-metrics__icon" aria-hidden="true">
                {metric.key === 'images' && '🖼️'}
                {metric.key === 'videos' && '🎬'}
                {metric.key === 'storage' && '💾'}
              </span>
              <span className="usage-metrics__value">{displayValue}</span>
              <span className="usage-metrics__label">{metric.label}</span>
              <span className="usage-metrics__desc">{metric.description}</span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default UsageMetrics;
