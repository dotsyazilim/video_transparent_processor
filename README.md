# Video Transparent Processor

Basit HTTP servisi: beyaz arka planlı videoları ve GIF'leri işler, arka planı şeffaf yapar ve yüksek oranda sıkıştırır.

## Özellikler

- Video (MP4 vb.) → Şeffaf Animated WebP çıktısı
- GIF → Optimize Animated WebP ve opsiyonel sıkıştırılmış GIF
- Gelişmiş filtre zinciri: hqdn3d, gradfun, unsharp, colorkey/luma + alphamerge
- Tek çıktı ise tarayıcıda inline, çoklu ise ZIP

## Gereksinimler

- Go 1.20+
- FFmpeg (libwebp zorunlu; libopus/libx264 opsiyonel)

macOS (Homebrew):

```bash
brew install ffmpeg go
```

Ubuntu/Debian:

```bash
sudo apt update && sudo apt install -y ffmpeg golang
```

## Çalıştırma

```bash
go run main.go
# Varsayılan: http://localhost:8080
```

Sağlık kontrolü:

```bash
curl http://localhost:8080/health
```

## Web Arayüzü

- `index.html` kökten sunulur.
- Dosyayı seç, ayarları yap, İşle’ye bas.

Önerilen başlangıç ayarları (beyaz arka plan videolar için):

- Alpha similarity: 0.12
- Blend: 0.03
- Beyaz eşiği: 0.95
- Çıktı: Sadece Animated WebP (şeffaf)

## API

`POST /api/process` (multipart/form-data)

Form alanları:

- `file`: giriş video/gif
- `height` (int, def 720)
- `fps` (int, def 24)
- `similarity` (float, def 0.12)
- `blend` (float, def 0.03)
- `whiteThreshold` (float, def 0.95)
- `lumaFallback` (bool, def true)
- `outWebp` (bool, def true)
- `outAv1` (bool, def false)
- `outH264` (bool, def false)

Dönüşler:

- Tek dosya: `image/webp` inline (veya seçilen format)
- Çoklu dosya: `application/zip`
- Hata: 400 text

Örnek çağrı:

```bash
curl -X POST http://localhost:8080/api/process \
  -F height=720 -F fps=24 -F similarity=0.12 -F blend=0.03 -F whiteThreshold=0.95 \
  -F lumaFallback=true -F outWebp=true -F outAv1=false -F outH264=false \
  -F file=@input.mp4 -o out.webp
```

## Dağıtım

- İkili derleme:

```bash
go build -o videoprocessor
./videoprocessor
```

- Reverse proxy (nginx/caddy) arkasında 8080 portunu yönlendirin.

## Notlar

- MP4 formatı alfa/şeffaflığı desteklemez; şeffaf çıktı için WebP/WebM kullanılır.
- Çok parlak ama tam beyaz olmayan arka planlarda `similarity`, `blend` ve `whiteThreshold` değerlerini düşürüp/ artırarak deneyin.
