import React, { useMemo } from 'react';
import { useTranslation } from '../../i18n/LanguageProvider';
import UploadSection from '../../components/home/uploadSection';
import FeatureHighlights from '../../components/home/featureHighlights';
import ApiPromo from '../../components/home/apiPromo';
import UsageMetrics from '../../components/home/usageMetrics/usageMetrics';
import '../../styles/pages/home/home-page.css';

function HomePage() {
  const { t } = useTranslation();

  const quickHighlights = useMemo(
    () => [
      {
        icon: '🛡️',
        label: t('home.hero.highlights.secure', 'Tamamen sizde çalışan güvenli işleme'),
      },
      {
        icon: '⚙️',
        label: t('home.hero.highlights.controls', 'Video, görsel, doküman için ayrıntılı kontrol'),
      },
      {
        icon: '🚀',
        label: t('home.hero.highlights.speed', 'Dakikalar yerine saniyelerde sonuç'),
      },
    ],
    [t],
  );

  const trustBadges = useMemo(
    () => [
      {
        icon: '📉',
        eyebrow: t('home.hero.badges.reduction', "%80'e varan boyut azaltma"),
        caption: t('home.hero.badges.reductionCaption', 'Akıllı CRF profilleri ve çoklu codec otomasyonu.'),
      },
      {
        icon: '🗄️',
        eyebrow: t('home.hero.badges.storage', 'Akıllı saklama katmanları'),
        caption: t('home.hero.badges.storageCaption', 'Sıcak ve soğuk depolama arasında otomatik geçiş.'),
      },
      {
        icon: '⚡',
        eyebrow: t('home.hero.badges.api', 'Gerçek zamanlı API'),
        caption: t('home.hero.badges.apiCaption', 'Webhook, kuyruğa alma ve SDK ile dakikalar içinde entegre.'),
      },
    ],
    [t],
  );

  const faqItems = useMemo(
    () => [
      {
        question: t('home.faq.uploadLimit.question', 'Yükleyebileceğim maksimum dosya boyutu nedir?'),
        answer: t('home.faq.uploadLimit.answer', "Tek seferde 1 GiB'e kadar video veya 100 MB'a kadar görsel/gif kabul ediyoruz. Daha büyük iş akışları için API ile dilimleme ve ardışık işlem seçenekleri mevcut."),
      },
      {
        question: t('home.faq.quality.question', 'Sıkıştırma sonrası kaliteyi nasıl koruyorsunuz?'),
        answer: t('home.faq.quality.answer', 'Her format için CRF, bitrate, çözünürlük ve renk profili kontrolleri sunuyoruz. Varsayılan ayarlar kaliteyi korurken, isterseniz kayıpsız profillere geçebilirsiniz.'),
      },
      {
        question: t('home.faq.queue.question', 'Toplu yüklemelerde süreç nasıl ilerliyor?'),
        answer: t('home.faq.queue.answer', 'Dosyalar paralel kuyruklarda işlenir, durumlarını panelden takip edebilirsiniz. Webhook veya e-posta ile sonuç bildirimi gönderebiliyoruz.'),
      },
      {
        question: t('home.faq.security.question', 'Verilerimin güvenliği nasıl sağlanıyor?'),
        answer: t('home.faq.security.answer', 'Verileriniz bölgenizde saklanır, isteğe bağlı olarak işlem sonrası otomatik silme veya belirli saklama politikaları tanımlayabilirsiniz.'),
      },
    ],
    [t],
  );

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__background" aria-hidden="true" />
        <div className="home-hero__content">
          <div className="home-hero__upload">
            <UploadSection />
          </div>
          <div className="home-hero__intro">
            <span className="home-hero__eyebrow">
              {t('home.hero.eyebrow', 'Video, görsel ve doküman için tek noktadan işleme')}
            </span>
            <h1 className="home-hero__title">
              {t('home.hero.title', 'Kaliteyi bozmadan dosya boyutlarını küçültün, dağıtın ve yönetin.')}
            </h1>
            <p className="home-hero__description">
              {t(
                'home.hero.description',
                "Büyük görsel arşivlerinden sinematik projelere kadar tüm medya türlerini tek panelde sıkıştırın. Hazır preset'ler, gelişmiş FFmpeg ayarları ve otomasyon API'leriyle içeriğinizi zahmetsizce yayınlayın.",
              )}
            </p>
            <ul className="home-hero__highlights">
              {quickHighlights.map((item) => (
                <li key={item.label}>
                  <span className="icon" aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="home-hero__badges">
          {trustBadges.map((badge) => (
            <article key={badge.eyebrow} className="home-hero__badge">
              <span className="home-hero__badge-icon" aria-hidden="true">{badge.icon}</span>
              <div className="home-hero__badge-copy">
                <span className="home-hero__badge-eyebrow">{badge.eyebrow}</span>
                <p>{badge.caption}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <UsageMetrics />
      </section>

      <section className="home-section">
        <FeatureHighlights />
      </section>

      <section className="home-section home-section--muted" id="api">
        <ApiPromo />
      </section>

      <section className="home-section home-faq">
        <div className="home-faq__header">
          <h2>{t('home.faq.title', 'Sık sorulan sorular')}</h2>
          <p>
            {t(
              'home.faq.subtitle',
              'Sıkıştırma projelerinizi planlamadan önce bilmeniz gerekenleri kısa kısa derledik.',
            )}
          </p>
        </div>
        <div className="home-faq__list">
          {faqItems.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
