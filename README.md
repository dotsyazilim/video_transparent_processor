# Görsel & Video Sıkıştırma Sunucusu

Bu depo, görsel ve video dosyalarını kaliteyi koruyarak küçültüp güvenle depolamak için tasarlanmış Go tabanlı HTTP servisinin ve React/Vite arayüzünün kaynak kodlarını içerir. Sunucu FFmpeg kullanarak iş yüklerini kuyruğa alır, `/api/process` uç noktası üzerinden gelen dosyaları sıkıştırır ve opsiyonel olarak arşivler.

## Öne Çıkanlar

- Görsel ve video odaklı sıkıştırma presetleri (WebM, MP4, WebP, AVIF)
- Dosya başına boyut, kalite, fps gibi parametreleri yapılandırılabilir API
- Çok bölgeli depolama kancaları ve webhook entegrasyonları
- React tabanlı kontrol paneli: yükleme, fiyatlandırma, dil seçimi ve tema değişimi
- CLI veya UI üzerinden gözlemlenebilirlik: `/api/probe` ile FFmpeg encoder listesini raporlayın

## Gereksinimler

- Go 1.20+
- FFmpeg (libwebp, libvpx, libx265 önerilir)

macOS (Homebrew):

```bash
brew install ffmpeg go
```

Ubuntu/Debian:

```bash
sudo apt update && sudo apt install -y ffmpeg golang
```

## Geliştirme

Sunucuyu ve istemciyi hızlıca ayağa kaldırmak için:

```bash
# Arka uç
go run main.go
# http://localhost:8080 üzerinde API ve statik dosyalar

# Ön uç
npm install
npm run dev
# http://localhost:5173 üzerinde Vite geliştirici sunucusu
```

Prod benzeri derleme:

```bash
npm run build   # Vite build -> dist/
go build -o videoprocessor
./videoprocessor
```

## API Kısa Rehberi

Sıkıştırma isteği örneği:

```bash
curl -X POST http://localhost:8080/api/process \
  -F file=@input.mp4 \
  -F height=1080 \
  -F fps=30 \
  -F outWebp=true \
  -F outAv1=false \
  -o output.webp
```

Başarılı yanıt tek dosyaysa direkt çıktı (örn. `image/webp`), birden çok format istendiğinde otomatik olarak ZIP oluşturulur. Toplam yük boyutu varsayılan olarak 1 GiB ile sınırlandırılmıştır (`handleProcess`).

## Proje Yapısı

```
├── main.go                     # Go HTTP sunucusu ve FFmpeg orkestrasyonu
├── index.html                  # Statik yükleme arayüzü (sunucu kökü)
├── src/                        # React + TypeScript istemci
│   ├── components/             # Ana bileşenler (Header, Hero, Pricing, vb.)
│   ├── controllers/            # Arayüz kontrol yardımcıları (tema, nav filtreleri)
│   ├── i18n/                   # Dil sağlayıcısı ve JSON dosyaları
│   └── pages/                  # Sayfa bazlı bileşenler (home, video, image...)
└── public/lang/*.json          # Çeviri sözlükleri
```

## Test

Go tarafı için:

```bash
go test ./... -cover
```

Ön yüz için istenirse `vitest` ekleyerek bileşen testleri oluşturabilirsiniz.

## Kullanım İpuçları

- `/api/probe` ile FFmpeg kurulumu ve encoder bilgilerini doğrulayın.
- Büyük iş yüklerinde `TMPDIR` (veya Windows için `%TEMP%`) alanının yeterli olduğundan emin olun.
- Varsayılan presetleri genişletirken FFmpeg argümanlarını satır içi yorumlarla belgeleyin.
- Tema geçişi (`Light/Dark`) ve dil seçimi istemci tarafında yerleşik; yeni statik sayfalar eklerken bu bileşenleri yeniden kullanın.

## Lisans

Bu depo içeriği MIT lisansı altındadır. Ayrıntılar için `LICENSE` dosyasına bakın.
