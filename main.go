package main

import (
	"archive/zip"
	"bufio"
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"mime"
	"mime/multipart"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		w.WriteHeader(200)
		_, _ = w.Write([]byte("ok"))
	})
	mux.Handle("/", http.FileServer(http.Dir(".")))
	mux.HandleFunc("/api/process", handleProcess)
	mux.HandleFunc("/api/probe", handleProbe)

	addr := ":8080"
	log.Printf("videoprocessor listening on %s\n", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}

func handleProbe(w http.ResponseWriter, r *http.Request) {
	out, _ := exec.Command("ffmpeg", "-hide_banner", "-encoders").CombinedOutput()
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Write(out)
}

func handleProcess(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "POST required", http.StatusMethodNotAllowed)
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, 1<<30)
	if err := r.ParseMultipartForm(1 << 30); err != nil {
		http.Error(w, "form parse error: "+err.Error(), http.StatusBadRequest)
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil { http.Error(w, "file required: "+err.Error(), http.StatusBadRequest); return }
	defer file.Close()

	// Dosya türünü tespit et
	isGIF := strings.ToLower(filepath.Ext(header.Filename)) == ".gif"

	// Yeni sıkıştırma parametreleri
	preset := r.FormValue("preset")
	resolutionMode := r.FormValue("resolutionMode") // preserve, scale
	targetHeight := parseIntDefault(r.FormValue("targetHeight"), 720)
	maxWidth := parseIntDefault(r.FormValue("maxWidth"), 1280)
	fps := parseIntDefault(r.FormValue("fps"), 30)
	crf := parseIntDefault(r.FormValue("crf"), 23) // CRF değeri
	speed := r.FormValue("speed") // veryslow, slow, medium, fast, veryfast, ultrafast
	audioQuality := r.FormValue("audioQuality") // 96k, 128k, 192k, 320k
	twopass := parseBoolDefault(r.FormValue("twopass"), false)

	// Preset uygulama
	if preset != "" && preset != "custom" {
		switch preset {
		case "web-optimized":
			crf = 28; fps = 30; speed = "medium"
		case "social-media": 
			crf = 32; fps = 30; speed = "fast"
		case "high-quality":
			crf = 20; fps = 60; speed = "slow"
		case "ultra-compress":
			crf = 38; fps = 24; speed = "fast"
		case "gif-optimize":
			crf = 28; fps = 20; speed = "medium" // GIF için daha iyi kalite
		}
	}

	// Output formatları
	outWebm := parseBoolDefault(r.FormValue("outWebm"), true)
	outAv1  := parseBoolDefault(r.FormValue("outAv1"),  false)
	outH264 := parseBoolDefault(r.FormValue("outH264"), false)
	outWebp := parseBoolDefault(r.FormValue("outWebp"), false)
	outGif  := parseBoolDefault(r.FormValue("outGif"),  false)

	// Default değerler kontrolü
	if speed == "" {
		speed = "medium"
	}
	if audioQuality == "" {
		audioQuality = "128k"
	}

	workDir, err := os.MkdirTemp("", "compress_*")
	if err != nil { http.Error(w, "tmp dir error: "+err.Error(), 500); return }
	defer os.RemoveAll(workDir)

	inPath := filepath.Join(workDir, sanitize(header.Filename))
	if err := saveUploaded(file, inPath); err != nil { http.Error(w, "save error: "+err.Error(), 500); return }
	stem := strings.TrimSuffix(filepath.Base(inPath), filepath.Ext(inPath))

	// Log dosyası
	logPath := filepath.Join(workDir, "process.log")
	logFile, _ := os.Create(logPath)
	defer logFile.Close()
	lw := bufio.NewWriter(logFile)
	defer lw.Flush()
	wlog := func(s string) { lw.WriteString(s+"\n"); lw.Flush(); log.Println(s) }

	var outputs []string

	// GIF için özel işleme
	if outGif {
		wlog(fmt.Sprintf("GIF sıkıştırma başlıyor - CRF:%d, Preset:%s", crf, speed))
		gifOut := filepath.Join(workDir, stem+"_compressed.gif")
		fc := buildGIFCompressionFilter(targetHeight, maxWidth, fps, crf)
		err := runFFmpegComplex(inPath, gifOut,
			[]string{"-filter_complex", fc, "-map", "[v]"},
			[]string{"-gifflags", "+transdiff"}, wlog)
		if err == nil {
			outputs = append(outputs, gifOut)
			wlog("✓ GIF sıkıştırma başarılı!")
		} else {
			wlog("GIF sıkıştırma hatası: "+err.Error())
		}
	}

	// Video sıkıştırma - tüm formatlar için (GIF dahil)
	// Çözünürlük ayarları
	var vf string
	if resolutionMode == "preserve" {
		wlog("Çözünürlük korunacak - orijinal boyutları kullanılıyor")
		vf = buildPreserveResolutionFilter(fps)
	} else {
		wlog(fmt.Sprintf("Çözünürlük değiştirilecek - Hedef: %dp, Max genişlik: %d", targetHeight, maxWidth))
		vf = buildScaleFilter(targetHeight, maxWidth, fps)
	}

	// WebM (VP9) - En iyi sıkıştırma
	if outWebm {
		wlog(fmt.Sprintf("WebM sıkıştırma başlıyor - CRF:%d, Preset:%s", crf, speed))
		webmOut := filepath.Join(workDir, stem+"_compressed.webm")

		args := []string{"-vf", vf, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", fmt.Sprintf("%d", crf), "-preset", speed, "-g", "240", "-row-mt", "1"}

		if twopass && !isGIF {
			pass1Args := append(args, "-pass", "1", "-f", "null")
			runFFmpeg(inPath, "/dev/null", pass1Args, wlog)
			args = append(args, "-pass", "2") // pass 2 için
		}
		
		if !isGIF {
			args = append(args, "-c:a", "libopus", "-b:a", audioQuality, "-ac", "1")
		} else {
			args = append(args, "-an")
		}
		args = append(args, "-movflags", "+faststart")

		err := runFFmpeg(inPath, webmOut, args, wlog)
		if err == nil {
			outputs = append(outputs, webmOut)
			wlog(fmt.Sprintf("✓ WebM sıkıştırma başarılı! CRF:%d, Preset:%s", crf, preset))
		} else {
			wlog("WebM sıkıştırma hatası: "+err.Error())
		}
	}

	// AV1 - Yeni codec, daha iyi sıkıştırma
	if outAv1 {
		wlog(fmt.Sprintf("AV1 sıkıştırma başlıyor - CRF:%d, Preset:%s", crf, speed))
		av1Out := filepath.Join(workDir, stem+"_compressed_av1.webm")

		args := []string{"-vf", vf, "-c:v", "libsvtav1", "-crf", fmt.Sprintf("%d", crf), "-preset", speed, "-g", "240", "-pix_fmt", "yuv420p10le"}
		if !isGIF {
			args = append(args, "-c:a", "libopus", "-b:a", audioQuality, "-ac", "1")
		} else {
			args = append(args, "-an")
		}

		err := runFFmpeg(inPath, av1Out, args, wlog)
		if err == nil {
			outputs = append(outputs, av1Out)
			wlog(fmt.Sprintf("✓ AV1 sıkıştırma başarılı! CRF:%d, Preset:%s", crf, preset))
		} else {
			wlog("AV1 sıkıştırma hatası: "+err.Error())
		}
	}

	// H.264 - En geniş uyumluluk
	if outH264 {
		wlog(fmt.Sprintf("H.264 sıkıştırma başlıyor - CRF:%d, Preset:%s", crf, speed))
		mp4Out := filepath.Join(workDir, stem+"_compressed.mp4")

		args := []string{"-vf", vf, "-c:v", "libx264", "-crf", fmt.Sprintf("%d", crf), "-preset", speed, "-profile:v", "high", "-pix_fmt", "yuv420p"}
		if !isGIF {
			args = append(args, "-c:a", "aac", "-b:a", audioQuality, "-ac", "1")
		} else {
			args = append(args, "-an")
		}
		args = append(args, "-movflags", "+faststart")
		
		err := runFFmpeg(inPath, mp4Out, args, wlog)
		if err == nil {
			outputs = append(outputs, mp4Out)
			wlog(fmt.Sprintf("✓ H.264 sıkıştırma başarılı! CRF:%d, Preset:%s", crf, preset))
		} else {
			wlog("H.264 sıkıştırma hatası: "+err.Error())
		}
	}

	// WebP - Web için mükemmel
	if outWebp {
		wlog(fmt.Sprintf("WebP sıkıştırma başlıyor - CRF:%d, Preset:%s", crf, speed))
		webpOut := filepath.Join(workDir, stem+"_compressed.webp")

		var webpVf string
		var webpQuality int
		
		if isGIF {
			// GIF'ten WebP yaparken daha kaliteli filter ve ayarlar
			webpVf = buildWebPFromGIFFilter(targetHeight, maxWidth, fps)
			webpQuality = 90  // GIF'ten WebP yaparken yüksek kalite
		} else {
			webpVf = vf + ",format=rgba"
			// CRF'ye göre WebP kalitesi ayarla
			if crf <= 23 {
				webpQuality = 90
			} else if crf <= 28 {
				webpQuality = 80
			} else if crf <= 35 {
				webpQuality = 70
			} else {
				webpQuality = 60
			}
		}
		
		err := runFFmpegComplex(inPath, webpOut,
			[]string{"-filter_complex", webpVf, "-map", "[v]"},
			[]string{"-c:v", "libwebp", "-quality", fmt.Sprintf("%d", webpQuality), "-compression_level", "4", "-loop", "0", "-an", "-preset", speed, "-method", "4", "-lossless", "0"}, wlog)
		if err == nil {
			outputs = append(outputs, webpOut)
			wlog(fmt.Sprintf("✓ WebP sıkıştırma başarılı! Kalite:%d", webpQuality))
		} else {
			wlog("WebP sıkıştırma hatası: "+err.Error())
		}
	}

	// Hiçbiri çıkmadıysa hata mesajı
	if len(outputs) == 0 {
		wlog("HATA: Hiçbir çıktı formatı başarılı olmadı. Parametreleri kontrol edin.")
	}

	if len(outputs) == 0 {
		http.Error(w, "çıktı üretilemedi (eşikleri yumuşatmayı deneyin).", 400)
		return
	}

	// --- Tek dosyaysa direkt stream et; birden fazlaysa ZIP hazırla
	if len(outputs) == 1 {
		fp := outputs[0]
		ext := strings.ToLower(filepath.Ext(fp))
		mt := mime.TypeByExtension(ext)
		if mt == "" {
		switch ext {
		case ".webm": mt = "video/webm"
		case ".mp4":  mt = "video/mp4"
		case ".webp": mt = "image/webp"
		case ".gif":  mt = "image/gif"
		default:      mt = "application/octet-stream"
		}
		}
		w.Header().Set("Content-Type", mt)
		w.Header().Set("Content-Disposition", fmt.Sprintf("inline; filename=%q", filepath.Base(fp)))
		http.ServeFile(w, r, fp)
		return
	}

	// Çoklu çıktı: ZIP + process.log
	outputs = append(outputs, logPath)
	zipPath := filepath.Join(workDir, stem+"_processed.zip")
	if err := makeZip(zipPath, outputs); err != nil { http.Error(w, "zip error: "+err.Error(), 500); return }
	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%q", filepath.Base(zipPath)))
	http.ServeFile(w, r, zipPath)
}

// ---------------- helpers ----------------
func sanitize(name string) string {
	// Güvenlik için dosya adını temizle
	name = strings.ReplaceAll(name, "..", "")
	name = strings.ReplaceAll(name, "/", "_")
	name = strings.ReplaceAll(name, "\\", "_")
	name = strings.ReplaceAll(name, ":", "_")
	name = strings.TrimSpace(name)
	
	// Dosya uzantısını kontrol et ve geçerli formatlara sınırla
	ext := strings.ToLower(filepath.Ext(name))
	validExts := map[string]bool{
		".mp4": true, ".avi": true, ".mov": true, ".mkv": true, 
		".webm": true, ".gif": true, ".webp": true, ".m4v": true,
	}
	if !validExts[ext] {
		name = strings.TrimSuffix(name, filepath.Ext(name)) + ".mp4"
	}
	
	if name == "" { name = "video.mp4" }
	return name
}
func saveUploaded(src multipart.File, dst string) error { out, err := os.Create(dst); if err != nil { return err }
	defer out.Close(); _, err = io.Copy(out, src); return err }
func parseIntDefault(s string, def int) int { if s=="" {return def}; v,err:=strconv.Atoi(s); if err!=nil||v<=0{ return def }; return v }
func parseFloatDefault(s string, def float64) float64 { if s==""{return def}; v,err:=strconv.ParseFloat(s,64); if err!=nil{ return def }; return v }
func parseBoolDefault(s string, def bool) bool {
	if s=="" { return def }
	switch strings.ToLower(s) { case "1","true","yes","on": return true; case "0","false","no","off": return false }
	return def
}
// Çözünürlüğü koruyarak sıkıştırma filteri
func buildPreserveResolutionFilter(fps int) string {
	return fmt.Sprintf("fps=%d", fps)
}

// Yeniden boyutlandırma filteri
func buildScaleFilter(h, maxW, fps int) string {
	return fmt.Sprintf("scale='min(%d,iw)':'min(%d,ih)':force_original_aspect_ratio=decrease,fps=%d", maxW, h, fps)
}

// GIF için kaliteli sıkıştırma filteri (daha az agresif)
func buildGIFCompressionFilter(h, maxW, fps, crf int) string {
	// CRF değerine göre daha akıllı renk sayısı seçimi
	maxColors := 256
	if crf >= 38 {
		maxColors = 128  // Ultra düşük kalite için
	} else if crf >= 32 {
		maxColors = 200  // Düşük kalite için
	} else if crf >= 28 {
		maxColors = 240  // Orta kalite için
	} else {
		maxColors = 256  // Yüksek kalite için maksimum
	}

	// Daha kaliteli GIF palette üretimi
	return fmt.Sprintf("scale='min(%d,iw)':'min(%d,ih)':force_original_aspect_ratio=decrease,fps=%d,split[s0][s1];[s0]palettegen=max_colors=%d:reserve_transparent=1:stats_mode=full[p];[s1][p]paletteuse=dither=sierra2_4a[v]", maxW, h, fps, maxColors)
}

// WebP için GIF input'u durumunda kaliteli filter
func buildWebPFromGIFFilter(h, maxW, fps int) string {
	// GIF'ten WebP yaparken daha az sıkıştırma uygula
	return fmt.Sprintf("scale='min(%d,iw)':'min(%d,ih)':force_original_aspect_ratio=decrease,fps=%d", maxW, h, fps)
}
func runFFmpeg(inPath, outPath string, extra []string, wlog func(string)) error {
	args := []string{"-y", "-hide_banner", "-i", inPath}
	args = append(args, extra...)
	args = append(args, outPath)
	return runCmd("ffmpeg", args, wlog)
}
func runFFmpegComplex(inPath, outPath string, complex, extra []string, wlog func(string)) error {
	args := []string{"-y", "-hide_banner", "-i", inPath}
	args = append(args, complex...)
	args = append(args, extra...)
	args = append(args, outPath)
	return runCmd("ffmpeg", args, wlog)
}
func runCmd(bin string, args []string, wlog func(string)) error {
	wlog("$ " + bin + " " + strings.Join(args, " "))
	// GIF ve küçük dosyalar için daha kısa timeout, büyük videolar için uzun
	timeout := 30 * time.Minute
	for _, arg := range args {
		if strings.Contains(arg, ".gif") {
			timeout = 5 * time.Minute
			break
		}
	}
	
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()
	cmd := exec.CommandContext(ctx, bin, args...)
	var buf bytes.Buffer
	cmd.Stdout = io.MultiWriter(&buf)
	cmd.Stderr = io.MultiWriter(&buf)
	err := cmd.Run()
	sc := bufio.NewScanner(&buf)
	for sc.Scan() { wlog(sc.Text()) }
	
	// Context timeout kontrolü
	if ctx.Err() == context.DeadlineExceeded {
		return fmt.Errorf("işlem zaman aşımına uğradı (%v)", timeout)
	}
	return err
}
func makeZip(zipPath string, files []string) error {
	out, err := os.Create(zipPath); if err != nil { return err }
	defer out.Close()
	zw := zip.NewWriter(out); defer zw.Close()
	for _, f := range files {
		if _, err := os.Stat(f); err != nil { continue }
		w, err := zw.Create(filepath.Base(f)); if err != nil { return err }
		src, err := os.Open(f); if err != nil { return err }
		if _, err := io.Copy(w, src); err != nil { src.Close(); return err }
		src.Close()
	}
	return nil
}
// EOF
