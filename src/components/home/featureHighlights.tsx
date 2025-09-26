import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../i18n/LanguageProvider';
import '../../styles/components/home/featureHighlights/feature-highlights.css';

interface Service {
  id: string;
  category: 'video' | 'image' | 'document';
  title: string;
  description: string;
  icon: string;
  benefits: string[];
  color: string;
  formats: string[];
  compression: string;
  path: string;
}

interface Feature {
  category: 'video' | 'image' | 'document';
  title: string;
  description: string;
  icon: string;
  color: string;
  services: Service[];
}

const servicesData: Service[] = [
  // Video Services
  {
    id: 'video-mp4',
    category: 'video',
    title: 'MP4 Video Sıkıştırma',
    description: 'H.264/H.265 codec ile MP4 videolarınızı sıkıştırın.',
    icon: '🎬',
    benefits: ['H.264/H.265 desteği', 'Sıkıştırma kalitesi ayarlanabilir', 'Boyut optimizasyonu'],
    color: '#ff6b6b',
    formats: ['MP4', 'AVI', 'MOV'],
    compression: 'H.264/H.265',
    path: '/video/mp4'
  },
  {
    id: 'video-webm',
    category: 'video',
    title: 'WebM Video Optimizasyonu',
    description: 'VP9 codec ile web için optimize edilmiş videolar.',
    icon: '🌐',
    benefits: ['VP9/VP8 codec', 'Web tarayıcı optimizasyonu', 'Küçük dosya boyutu'],
    color: '#ff6b6b',
    formats: ['WebM', 'MKV'],
    compression: 'VP9/VP8',
    path: '/video/webm'
  },
  {
    id: 'video-gif',
    category: 'video',
    title: 'GIF Animasyon Optimizasyonu',
    description: 'Animasyonlu GIF dosyalarınızı optimize edin.',
    icon: '🎭',
    benefits: ['Frame optimizasyonu', 'Renk paleti azaltma', 'Animasyon kalitesi'],
    color: '#ff6b6b',
    formats: ['GIF'],
    compression: 'Lossy/Lossless',
    path: '/video/gif'
  },

  // Image Services
  {
    id: 'image-webp',
    category: 'image',
    title: 'WebP Görsel Sıkıştırma',
    description: 'Modern web formatı ile görsellerinizi sıkıştırın.',
    icon: '🖼️',
    benefits: ['En iyi sıkıştırma oranı', 'Renk profilini korur', 'Modern tarayıcılar'],
    color: '#4ecdc4',
    formats: ['WebP', 'PNG', 'JPEG'],
    compression: 'Lossy/Lossless',
    path: '/image/webp'
  },
  {
    id: 'image-jpeg',
    category: 'image',
    title: 'JPEG Optimizasyonu',
    description: 'Klasik JPEG formatında kalite-boyut optimizasyonu.',
    icon: '📸',
    benefits: ['Evrensel uyumluluk', 'İyi sıkıştırma', 'Hızlı yükleme'],
    color: '#4ecdc4',
    formats: ['JPEG', 'JPG'],
    compression: 'Lossy',
    path: '/image/jpeg'
  },
  {
    id: 'image-png',
    category: 'image',
    title: 'PNG Optimizasyonu',
    description: 'Grafik yoğun görseller için özel optimizasyon.',
    icon: '🖼️',
    benefits: ['Detay kaybını önler', 'Kaliteli renkler', 'Meta veri koruması'],
    color: '#4ecdc4',
    formats: ['PNG'],
    compression: 'Lossless',
    path: '/image/png'
  },
  {
    id: 'image-svg',
    category: 'image',
    title: 'SVG Vektör Optimizasyonu',
    description: 'Vektörel grafikleri temizleyin ve sıkıştırın.',
    icon: '🎨',
    benefits: ['Vektör grafikleri', 'Ölçeklenebilir', 'Temiz kod'],
    color: '#4ecdc4',
    formats: ['SVG'],
    compression: 'Lossless',
    path: '/image/svg'
  },

  // Document Services
  {
    id: 'document-pdf',
    category: 'document',
    title: 'PDF Sıkıştırma',
    description: 'PDF dosyalarınızı boyut ve kalite optimizasyonu.',
    icon: '📄',
    benefits: ['Boyut optimizasyonu', 'Kalite ayarları', 'Hızlı sıkıştırma'],
    color: '#95e1d3',
    formats: ['PDF'],
    compression: 'Lossy/Lossless',
    path: '/document/pdf'
  },
  {
    id: 'document-docx',
    category: 'document',
    title: 'Word Belgesi Optimizasyonu',
    description: 'DOCX dosyalarınızı sıkıştırın ve optimize edin.',
    icon: '📝',
    benefits: ['DOCX desteği', 'Görsel sıkıştırma', 'Boyut azaltma'],
    color: '#95e1d3',
    formats: ['DOCX', 'DOC'],
    compression: 'Lossless',
    path: '/document/docx'
  },
  {
    id: 'document-pptx',
    category: 'document',
    title: 'PowerPoint Sıkıştırma',
    description: 'PPTX sunumlarınızı optimize edin.',
    icon: '📊',
    benefits: ['Görsel optimizasyonu', 'Animasyon koruması', 'Boyut azaltma'],
    color: '#95e1d3',
    formats: ['PPTX', 'PPT'],
    compression: 'Lossy/Lossless',
    path: '/document/pptx'
  },
  {
    id: 'document-xlsx',
    category: 'document',
    title: 'Excel Tablo Optimizasyonu',
    description: 'XLSX dosyalarınızı sıkıştırın.',
    icon: '📈',
    benefits: ['Tablo optimizasyonu', 'Formül koruması', 'Boyut azaltma'],
    color: '#95e1d3',
    formats: ['XLSX', 'XLS'],
    compression: 'Lossless',
    path: '/document/xlsx'
  }
];

const featuresData: Feature[] = [
  {
    category: 'video',
    title: '🎬 Video Sıkıştırma',
    description: 'MP4, WebM, MOV, GIF formatlarını profesyonel olarak sıkıştırın.',
    icon: '🎬',
    color: '#ff6b6b',
    services: servicesData.filter(s => s.category === 'video')
  },
  {
    category: 'image',
    title: '🖼️ Görsel Optimizasyonu',
    description: 'WebP, JPEG, PNG, SVG formatlarını en iyi kalite-boyut oranında sıkıştırın.',
    icon: '🖼️',
    color: '#4ecdc4',
    services: servicesData.filter(s => s.category === 'image')
  },
  {
    category: 'document',
    title: '📄 Doküman Sıkıştırma',
    description: 'PDF, DOCX, PPTX, XLSX dosyalarınızı optimize edin ve boyutlarını azaltın.',
    icon: '📄',
    color: '#95e1d3',
    services: servicesData.filter(s => s.category === 'document')
  }
];

function FeatureHighlights() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const filteredServices = useMemo(() => {
    let filtered = servicesData;

    // Kategori filtresi
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.formats.some(format => format.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return filtered;
  }, [searchTerm, selectedCategory]);

  const categories = [
    { id: 'all', name: 'Tümü', icon: '🎯' },
    { id: 'video', name: 'Video', icon: '🎬' },
    { id: 'image', name: 'Görsel', icon: '🖼️' },
    { id: 'document', name: 'Doküman', icon: '📄' }
  ];

  const handleServiceClick = (service: Service) => {
    // Burada service.path'e yönlendirme yapabiliriz
    console.log('Navigating to:', service.path);
    // navigate(service.path);
  };

  return (
    <section className="features">
      <div className="section-heading">
        <p className="eyebrow">{t('features.eyebrow', 'Platform Özellikleri')}</p>
        <h2>{t('features.title', 'Profesyonel medya işleme çözümleri')}</h2>
        <p>
          {t(
            'features.intro',
            'Video, görsel, doküman ve API odaklı özelliklerle tüm medya iş akışınızı optimize edin.',
          )}
        </p>
      </div>

      {/* Arama ve Filtreleme */}
      <div className="services-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Hizmet ara (örn: PDF, MP4, WebP...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>


      {/* Filtrelenmiş Hizmetler */}
      {filteredServices.length > 0 && (
        <div className="services-section">
          <h3>🔍 Bulunan Hizmetler ({filteredServices.length})</h3>
          <div className="services-grid">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className={`service-card ${expandedService === service.id ? 'expanded' : ''}`}
                onClick={() => setExpandedService(expandedService === service.id ? null : service.id)}
              >
                <div className="service-header">
                  <div className="service-icon-wrapper" style={{ backgroundColor: service.color + '20' }}>
                    <span className="service-icon">{service.icon}</span>
                  </div>
                  <div className="service-info">
                    <h4>{service.title}</h4>
                    <p>{service.description}</p>
                  </div>
                  <div className="service-meta">
                    <span className="formats">{service.formats.join(', ')}</span>
                    <span className="compression">{service.compression}</span>
                  </div>
                </div>

                {expandedService === service.id && (
                  <div className="service-details">
                    <div className="service-benefits">
                      <h5>Özellikler:</h5>
                      <ul>
                        {service.benefits.map((benefit, index) => (
                          <li key={index}>
                            <span className="benefit-icon">✓</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="service-actions">
                      <button
                        className="primary-service-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleServiceClick(service);
                        }}
                      >
                        Hizmeti Kullan
                      </button>
                      <button className="secondary-service-btn">
                        Daha Fazla Bilgi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredServices.length === 0 && searchTerm && (
        <div className="no-results">
          <p>❌ "{searchTerm}" için hizmet bulunamadı.</p>
          <button onClick={() => setSearchTerm('')} className="clear-search">
            Aramayı Temizle
          </button>
        </div>
      )}

    </section>
  );
}

export default FeatureHighlights;
