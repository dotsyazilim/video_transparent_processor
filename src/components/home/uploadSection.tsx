import React, { useState, useMemo, useRef } from 'react';
import { useTranslation } from '../../i18n/LanguageProvider';
import '../../styles/components/home/uploadSection/upload.css';
import { UploadPreset } from '../../models/home';
import { filterUploadPresets } from '../../controllers/home';

type FileType = 'image' | 'gif' | 'video';
type SizeOption = 'preserve' | 'custom';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

function UploadSection() {
  const { t, translations } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileType, setSelectedFileType] = useState<FileType>('video');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // CRF ve boyut ayarları
  const [crf, setCrf] = useState(23);
  const [sizeOption, setSizeOption] = useState<SizeOption>('preserve');
  const [customWidth, setCustomWidth] = useState(1280);
  const [customHeight, setCustomHeight] = useState(720);

  // Video ayarları
  const [videoFormat, setVideoFormat] = useState('mp4');
  const [videoBitrate, setVideoBitrate] = useState(2500);
  const [audioQuality, setAudioQuality] = useState('192k');
  const [selectedSize, setSelectedSize] = useState<{ label: string; width: number; height: number; desc: string } | null>(null);

  // Görsel ayarları
  const [imageFormat, setImageFormat] = useState('webp');
  const [imageQuality, setImageQuality] = useState(85);
  const [resizeType, setResizeType] = useState('original');
  const [imageWidth, setImageWidth] = useState(1920);
  const [imageHeight, setImageHeight] = useState(1080);

  // GIF ayarları
  const [gifQuality, setGifQuality] = useState('medium');
  const [optimizeFrames, setOptimizeFrames] = useState(true);
  const [reduceColors, setReduceColors] = useState(true);

  // Preset state
  const [showPresets, setShowPresets] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState('');

  // Preset helper functions
  const getPresetName = (preset: string): string => {
    const presets: { [key: string]: string } = {
      'web-optimized': 'Web için Optimize',
      'social-media': 'Sosyal Medya',
      'mobile-stories': 'Mobil Hikayeler',
      'presentation': 'Sunum',
      'archive': 'Arşiv'
    };
    return presets[preset] || preset;
  };

  const getPresetFormat = (preset: string): string => {
    const formats: { [key: string]: string } = {
      'web-optimized': 'WebM',
      'social-media': 'MP4',
      'mobile-stories': 'MP4',
      'presentation': 'MP4',
      'archive': 'MOV'
    };
    return formats[preset] || 'MP4';
  };

  const getPresetCRF = (preset: string): string => {
    const crfs: { [key: string]: string } = {
      'web-optimized': '28',
      'social-media': '32',
      'mobile-stories': '30',
      'presentation': '25',
      'archive': '18'
    };
    return crfs[preset] || '23';
  };

  const getPresetResolution = (preset: string): string => {
    const resolutions: { [key: string]: string } = {
      'web-optimized': '1080p',
      'social-media': '720p',
      'mobile-stories': '720p',
      'presentation': '1080p',
      'archive': '4K'
    };
    return resolutions[preset] || '1080p';
  };

  const getPresetBitrate = (preset: string): string => {
    const bitrates: { [key: string]: string } = {
      'web-optimized': '2.5M',
      'social-media': '1.5M',
      'mobile-stories': '1M',
      'presentation': '5M',
      'archive': '50M'
    };
    return bitrates[preset] || '2.5M';
  };

  const getPresetImageFormat = (preset: string): string => {
    const formats: { [key: string]: string } = {
      'web-optimized': 'WebP',
      'social-media': 'JPEG',
      'mobile-stories': 'WebP',
      'presentation': 'JPEG',
      'archive': 'PNG'
    };
    return formats[preset] || 'WebP';
  };

  const getPresetImageQuality = (preset: string): string => {
    const qualities: { [key: string]: string } = {
      'web-optimized': '85',
      'social-media': '80',
      'mobile-stories': '75',
      'presentation': '90',
      'archive': '95'
    };
    return qualities[preset] || '85';
  };

  const getPresetImageSize = (preset: string): string => {
    const sizes: { [key: string]: string } = {
      'web-optimized': 'Orijinal',
      'social-media': '1200px',
      'mobile-stories': '1080px',
      'presentation': '1920px',
      'archive': 'Orijinal'
    };
    return sizes[preset] || 'Orijinal';
  };

  const presets = useMemo(() => {
    const items = translations?.upload?.presets;
    return filterUploadPresets(items) as UploadPreset[];
  }, [translations]);

  const handleFileSelect = (files: FileList) => {
    const fileArray = Array.from(files);
    const uploadedFileData = fileArray.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }));
    setUploadedFiles(uploadedFileData);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalFilesSize = uploadedFiles.reduce((total, file) => total + file.size, 0);
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <section className="upload" id="upload">
      <header className="upload-header">
        <h2>{t('upload.tagline', 'Kaliteyi bozmadan dosya boyutlarını küçültün, dağıtın ve yönetin.')}</h2>
        <p>
          {t(
            'upload.subline',
            'Video, görsel ve doküman iş akışlarınızı tek panelde yönetin; presetler ve gelişmiş FFmpeg ayarları ile her çıktı kontrolünüzde.',
          )}
        </p>
      </header>

      <div className="upload-dropzone">
        <div className="file-type-selector">
          <span className="file-type-eyebrow">
            {t('upload.fileTypeEyebrow', 'İçerik türünüzü seçin')}
          </span>
          <div className="type-buttons">
            {[
              { type: 'video' as FileType, label: '🎬 Video', desc: 'MP4, WebM, MOV' },
              { type: 'image' as FileType, label: '🖼️ Görsel', desc: 'PNG, JPEG, WebP' },
              { type: 'gif' as FileType, label: '🎭 GIF', desc: 'Animasyonlu görseller' }
            ].map(({ type, label, desc }) => (
              <button
                key={type}
                type="button"
                className={`type-button ${selectedFileType === type ? 'active' : ''}`}
                onClick={() => setSelectedFileType(type)}
              >
                <span className="type-label">{label}</span>
                <small>{desc}</small>
              </button>
            ))}
          </div>
        </div>

        <div
          className={`drop-area ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={
              selectedFileType === 'video' ? 'video/*' :
              selectedFileType === 'image' ? 'image/*' : 'image/gif'
            }
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            style={{ display: 'none' }}
          />

          <span className="drop-icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="22" stroke="var(--accent)" strokeWidth="2" strokeDasharray="8 8" />
              <path d="M24 14V30" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
              <path d="M18 25L24 31L30 25" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>

          <h3>Dosyaları buraya sürükleyin veya tıklayın</h3>
          <p className="upload-description">
            {selectedFileType === 'video' && 'MP4, MOV, WebM formatları desteklenir (max 1GB)'}
            {selectedFileType === 'image' && 'PNG, JPEG, WebP formatları desteklenir (max 100MB)'}
            {selectedFileType === 'gif' && 'Animasyonlu GIF dosyaları desteklenir (max 50MB)'}
          </p>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="file-info">
            <h4>Seçilen Dosyalar ({uploadedFiles.length})</h4>
            <div className="file-list">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                </div>
              ))}
            </div>
            <p className="batch-info">
              <strong>Toplam:</strong> {formatFileSize(totalFilesSize)} •
              {" "}
              Tüm dosyalara aynı ayarlar uygulanacak
            </p>
          </div>
        )}

        <div className="upload-quick-actions">
          <button type="button" className="primary-action" onClick={handleBrowseClick}>
            Dosya Seçin
          </button>
          <button type="button" className="secondary-action">
            Örnek Dosya Kullan
          </button>
        </div>
      </div>

      <div className="upload-details">
        <aside className="upload-sidebar">
          <h3>Hazır Ayarlar</h3>

          {/* Modern Preset Selector */}
          <div className="preset-selector">
            <label>
              <span className="preset-label">🎯 Hızlı Seçim</span>
              <div className="custom-select">
                <select
                  value={selectedPreset}
                  onChange={(e) => setSelectedPreset(e.target.value)}
                >
                  <option value="">⚙️ Manuel Ayarlar</option>
                  <optgroup label="🌐 Web İçin">
                    <option value="web-optimized">Web Optimized - VP9, CRF 28, 1080p</option>
                    <option value="social-media">Social Media - H.264, CRF 32, 720p</option>
                  </optgroup>
                  <optgroup label="📱 Mobil İçin">
                    <option value="mobile-stories">Stories - 9:16, 720p, 1MB</option>
                    <option value="instagram">Instagram - 1:1, 1080p, H.264</option>
                  </optgroup>
                  <optgroup label="💼 İş İçin">
                    <option value="presentation">Presentation - 16:9, 1080p, H.264</option>
                    <option value="archive">Archive - ProRes, 4K, Lossless</option>
                  </optgroup>
                </select>
                <div className="select-arrow">▼</div>
              </div>
            </label>
            <div className="preset-description">
              {selectedPreset === 'web-optimized' && '🎯 Web siteleri için ideal, hızlı yükleme'}
              {selectedPreset === 'social-media' && '📱 Sosyal medya platformları için optimize'}
              {selectedPreset === 'mobile-stories' && '📱 Mobil hikayeler için ideal boyut'}
              {selectedPreset === 'presentation' && '💼 İş sunumları için yüksek kalite'}
              {selectedPreset === 'archive' && '💾 Uzun süreli saklama için lossless'}
              {!selectedPreset && '⚙️ Manuel ayarlar ile tam kontrol'}
            </div>
          </div>

          {/* Detaylı Ayarlar Butonu */}
          <div className="advanced-toggle">
            <button
              className="detail-settings-btn"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            >
              ⚙️ {showAdvancedSettings ? 'Detaylı Ayarları Gizle' : 'Detaylı Ayarları Göster'}
            </button>
          </div>

          {/* Gelişmiş Ayarlar */}
          {showAdvancedSettings && (
            <div className="advanced-settings">
              {selectedFileType === 'video' && (
                <div className="video-settings">
                  <h4>🎬 Video Ayarları</h4>

                  {/* Seçili preset'in ayarlarını göster */}
                  {selectedPreset && (
                    <div className="preset-info">
                      <h5>📋 "{getPresetName(selectedPreset)}" Ayarları:</h5>
                      <div className="preset-details">
                        <span>Format: {getPresetFormat(selectedPreset)}</span>
                        <span>CRF: {getPresetCRF(selectedPreset)}</span>
                        <span>Boyut: {getPresetResolution(selectedPreset)}</span>
                        <span>Bitrate: {getPresetBitrate(selectedPreset)}</span>
                      </div>
                    </div>
                  )}

                  <div className="setting-group">
                    <label>
                      <span>Video Formatı:</span>
                      <select value={videoFormat} onChange={(e) => setVideoFormat(e.target.value)}>
                        <option value="mp4">MP4</option>
                        <option value="webm">WebM</option>
                        <option value="mov">MOV</option>
                      </select>
                    </label>
                    <small>
                      {videoFormat === 'mp4' && 'En yaygın kullanılan format'}
                      {videoFormat === 'webm' && 'Web için optimize edilmiş'}
                      {videoFormat === 'mov' && 'Apple cihazları için ideal'}
                    </small>
                  </div>

                  <div className="setting-group">
                    <label>
                      <span>Video Kalitesi (CRF):</span>
                      <input
                        type="range"
                        min="18"
                        max="35"
                        value={crf}
                        onChange={(e) => setCrf(Number(e.target.value))}
                      />
                      <span className="value">{crf}</span>
                    </label>
                    <small>
                      {crf <= 23 && '🎬 Yüksek kalite'}
                      {crf > 23 && crf <= 28 && '💻 Dengeli kalite'}
                      {crf > 28 && '📱 Web için uygun'}
                    </small>
                  </div>

                  <div className="setting-group">
                    <label>
                      <span>Ekran Boyutu:</span>
                      <div className="size-options">
                        <button
                          type="button"
                          className={sizeOption === 'preserve' ? 'active' : ''}
                          onClick={() => setSizeOption('preserve')}
                        >
                          Orijinal
                        </button>
                        <button
                          type="button"
                          className={sizeOption === '1080p' ? 'active' : ''}
                          onClick={() => setSizeOption('1080p')}
                        >
                          1080p
                        </button>
                        <button
                          type="button"
                          className={sizeOption === '720p' ? 'active' : ''}
                          onClick={() => setSizeOption('720p')}
                        >
                          720p
                        </button>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {selectedFileType === 'image' && (
                <div className="image-settings">
                  <h4>🖼️ Görsel Ayarları</h4>

                  {selectedPreset && (
                    <div className="preset-info">
                      <h5>📋 "{getPresetName(selectedPreset)}" Ayarları:</h5>
                      <div className="preset-details">
                        <span>Format: {getPresetImageFormat(selectedPreset)}</span>
                        <span>Kalite: {getPresetImageQuality(selectedPreset)}%</span>
                        <span>Boyut: {getPresetImageSize(selectedPreset)}</span>
                      </div>
                    </div>
                  )}

                  <div className="setting-group">
                    <label>
                      <span>Görsel Formatı:</span>
                      <select value={imageFormat} onChange={(e) => setImageFormat(e.target.value)}>
                        <option value="webp">WebP</option>
                        <option value="jpeg">JPEG</option>
                        <option value="png">PNG</option>
                      </select>
                    </label>
                    <small>
                      {imageFormat === 'webp' && 'En küçük boyut, modern web'}
                      {imageFormat === 'jpeg' && 'En yaygın kullanılan format'}
                      {imageFormat === 'png' && 'Geniş renk gamı ve keskin detaylar'}
                    </small>
                  </div>

                  <div className="setting-group">
                    <label>
                      <span>Sıkıştırma Kalitesi:</span>
                      <input
                        type="range"
                        min="60"
                        max="95"
                        value={imageQuality}
                        onChange={(e) => setImageQuality(Number(e.target.value))}
                      />
                      <span className="value">{imageQuality}%</span>
                    </label>
                    <small>
                      {imageQuality <= 75 && '📱 Küçük boyut, web için'}
                      {imageQuality > 75 && imageQuality <= 85 && '💻 Dengeli kalite'}
                      {imageQuality > 85 && '🎨 Yüksek kalite'}
                    </small>
                  </div>
                </div>
              )}

              {selectedFileType === 'gif' && (
                <div className="gif-settings">
                  <h4>🎭 GIF Ayarları</h4>

                  <div className="setting-group">
                    <label>
                      <span>Animasyon Kalitesi:</span>
                      <select value={gifQuality} onChange={(e) => setGifQuality(e.target.value)}>
                        <option value="high">Yüksek</option>
                        <option value="medium">Orta</option>
                        <option value="low">Düşük</option>
                      </select>
                    </label>
                    <small>
                      {gifQuality === 'high' && 'Mükemmel kalite, büyük boyut'}
                      {gifQuality === 'medium' && 'İyi kalite, orta boyut'}
                      {gifQuality === 'low' && 'Web için optimize, küçük boyut'}
                    </small>
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

export default UploadSection;
