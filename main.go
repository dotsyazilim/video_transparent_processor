cat > main.go <<'EOF'
package main
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
	mux.Handle("/", http.FileServer(http.Dir("./static")))
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
	
	targetH := parseIntDefault(r.FormValue("height"), 720)
	fps     := parseIntDefault(r.FormValue("fps"), 24)
	sim     := parseFloatDefault(r.FormValue("similarity"), 0.12) // Beyaz için daha agresif
	blend   := parseFloatDefault(r.FormValue("blend"), 0.03)     // Daha yumuşak geçiş
	useLuma := parseBoolDefault(r.FormValue("lumaFallback"), true)
	whiteThreshold := parseFloatDefault(r.FormValue("whiteThreshold"), 0.95) // Beyaz tespit eşiği

	outWebp := parseBoolDefault(r.FormValue("outWebp"), true)
	outAv1  := parseBoolDefault(r.FormValue("outAv1"),  false)  // Video için default kapalı
	outH264 := parseBoolDefault(r.FormValue("outH264"), false)  // Video için default kapalı

	workDir, err := os.MkdirTemp("", "vp_*")
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
	if isGIF {
		if outWebp {
			webpOut := filepath.Join(workDir, stem+"_optimized.webp")
			// GIF'ler için daha agresif sıkıştırma
			fc := buildGIFOptimizationFilter(targetH, fps)
			err := runFFmpegComplex(inPath, webpOut,
				[]string{"-filter_complex", fc, "-map", "[v]"},
				[]string{"-c:v", "libwebp", "-q:v", "50", "-loop", "0", "-an", "-preset", "default", "-lossless", "0"}, wlog)
			if err == nil { 
				outputs = append(outputs, webpOut)
			} else { 
				wlog("GIF WebP optimizasyon hatası: "+err.Error()) 
			}
		}
		
		// GIF çıktısı
		gifOut := filepath.Join(workDir, stem+"_compressed.gif")
		err := runFFmpeg(inPath, gifOut,
			[]string{"-vf", buildGIFCompressionFilter(targetH, fps), "-gifflags", "+transdiff", "-f", "gif"}, wlog)
		if err == nil { outputs = append(outputs, gifOut) }
		
	} else {
		// Video için beyaz arka plan kaldırma
		if outWebp {
			wlog(fmt.Sprintf("WebP işleme başlıyor - parametreler: sim=%.3f, blend=%.3f, eşik=%.3f", sim, blend, whiteThreshold))
			webpOut := filepath.Join(workDir, stem+"_transparent.webp")
			fc := buildWhiteBackgroundFilter(targetH, fps, sim, blend, whiteThreshold, true)
			wlog("Filter: " + fc)
			err := runFFmpegComplex(inPath, webpOut,
				[]string{"-filter_complex", fc, "-map", "[v]"},
				[]string{"-c:v", "libwebp", "-quality", "80", "-compression_level", "6", "-loop", "0", "-an", "-preset", "default", "-method", "6", "-lossless", "0"}, wlog)
			if err != nil && useLuma {
				wlog("beyaz arka plan kaldırma yetersiz; luma key deneniyor…")
				fc2 := buildLumaKeyFilter(targetH, fps, whiteThreshold, true)
				wlog("Luma Filter: " + fc2)
				err2 := runFFmpegComplex(inPath, webpOut,
					[]string{"-filter_complex", fc2, "-map", "[v]"},
					[]string{"-c:v", "libwebp", "-quality", "80", "-compression_level", "6", "-loop", "0", "-an", "-preset", "default", "-method", "6", "-lossless", "0"}, wlog)
				if err2 == nil { 
					outputs = append(outputs, webpOut)
					wlog("✓ Luma key ile WebP başarılı!")
				} else { 
					wlog("luma key hata: "+err2.Error()) 
				}
			} else if err == nil { 
				outputs = append(outputs, webpOut)
				wlog("✓ Colorkey ile WebP başarılı!")
			} else { 
				wlog("webp colorkey hata: "+err.Error()) 
			}
		}
	}

	// Video için WebM çıktısı (sadece video içindir)
	if outAv1 && !isGIF {
		webmOut := filepath.Join(workDir, stem+"_clean.webm")
		vf10 := buildCleanFilter(targetH, fps) + ",format=yuv420p10le"
		// sırasıyla dene
		try := [][]string{
			{"-vf", vf10, "-c:v", "libsvtav1", "-crf", "28", "-preset", "7", "-g", "240", "-pix_fmt", "yuv420p10le", "-c:a", "libopus", "-b:a", "96k", "-ac", "1"},
			{"-vf", vf10, "-c:v", "libaom-av1", "-crf", "30", "-b:v", "0", "-cpu-used", "4", "-row-mt", "1", "-tiles", "2x1", "-g", "240", "-lag-in-frames", "25", "-c:a", "libopus", "-b:a", "96k", "-ac", "1"},
			{"-vf", buildCleanFilter(targetH, fps), "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "30", "-row-mt", "1", "-tile-columns", "2", "-g", "240", "-c:a", "libopus", "-b:a", "96k", "-ac", "1"},
		}
		var ok bool
		for _, args := range try {
			if err := runFFmpeg(inPath, webmOut, args, wlog); err == nil {
				ok = true; break
			} else { wlog("deneme hata: "+err.Error()) }
		}
		if ok { outputs = append(outputs, webmOut) }
	}

	// Video için MP4 (H.264) – yaygın uyumluluk (sadece video için)
	if outH264 && !isGIF {
		mp4Out := filepath.Join(workDir, stem+"_clean.mp4")
		args := []string{"-vf", buildCleanFilter(targetH, fps),
			"-c:v", "libx264", "-crf", "20", "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p",
			"-c:a", "aac", "-b:a", "96k", "-ac", "1", "-movflags", "+faststart"}
		if err := runFFmpeg(inPath, mp4Out, args, wlog); err == nil {
			outputs = append(outputs, mp4Out)
		} else { wlog("H.264 hata: "+err.Error()) }
	}

	// Hiçbiri çıkmadıysa hata mesajı (rewrap kaldırıldı)
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
func buildCleanFilter(h, fps int) string {
	// Modern FFmpeg için uyumlu filter (pp=deblock kaldırıldı)
	return fmt.Sprintf("hqdn3d=1.5:1.5:6:6,gradfun=12:16,unsharp=3:3:0.6:3:3:0.3,fps=%d,scale=-2:%d:flags=lanczos", fps, h)
}
func buildChromaKeyFilter(h, fps int, sim, blend float64, blur bool) string {
	base := buildCleanFilter(h, fps); color := "0xFFFFFF"
	if blur {
		return fmt.Sprintf("[0:v]%s,format=rgba,colorkey=%s:%0.3f:%0.3f[ck];[ck]alphaextract[am];[am]boxblur=2:1[am2];[ck][am2]alphamerge,format=yuva420p[v]", base, color, sim, blend)
	}
	return fmt.Sprintf("[0:v]%s,format=rgba,colorkey=%s:%0.3f:%0.3f,format=yuva420p[v]", base, color, sim, blend)
}
func buildLumaKeyFilter(h, fps int, _ float64, blur bool) string {
    base := buildCleanFilter(h, fps)
    if blur {
        // Tek kaynaktan iki akışa böl → gri maske üret → bulanıklaştır → alfa olarak birleştir
        return fmt.Sprintf("[0:v]%s,format=rgba,split[f0][f1];[f0]format=gray,geq=lum(X\\,Y):128:128[matte];[matte]boxblur=2:1[matte2];[f1][matte2]alphamerge,format=yuva420p[v]", base)
    }
    return fmt.Sprintf("[0:v]%s,format=rgba,split[f0][f1];[f0]format=gray,geq=lum(X\\,Y):128:128[matte];[f1][matte]alphamerge,format=yuva420p[v]", base)
}

// Beyaz arka plan kaldırma için gelişmiş filter
func buildWhiteBackgroundFilter(h, fps int, sim, blend, _ float64, blur bool) string {
    base := buildCleanFilter(h, fps)
    if blur {
        // Ölçeklenmiş tek kaynağı böl → bir kolda colorkey ile alfa çıkar → blur → diğer kolla birleştir
        return fmt.Sprintf("[0:v]%s,format=rgba,split[c0][c1];[c0]colorkey=white:%.3f:%.3f[ck];[ck]alphaextract[a];[a]boxblur=3:2[a2];[c1][a2]alphamerge,format=yuva420p[v]", base, sim, blend)
    }
    // Sade: doğrudan colorkey ile alfa üret
    return fmt.Sprintf("[0:v]%s,format=rgba,colorkey=white:%.3f:%.3f,format=yuva420p[v]", base, sim, blend)
}

// GIF optimizasyon filteri
func buildGIFOptimizationFilter(h, fps int) string {
	// GIF için daha agresif boyut azaltma ve renk optimizasyonu
	return fmt.Sprintf("scale=-2:%d:flags=lanczos,fps=%d,split[s0][s1];[s0]palettegen=max_colors=128:reserve_transparent=1[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle[v]", h, fps)
}

// GIF sıkıştırma filteri
func buildGIFCompressionFilter(h, fps int) string {
	// Kaliteyi minimize ederek maksimum sıkıştırma
	return fmt.Sprintf("scale=-2:%d:flags=neighbor,fps=%d,split[s0][s1];[s0]palettegen=max_colors=64:reserve_transparent=0:transparency_threshold=5[p];[s1][p]paletteuse=dither=none:diff_mode=rectangle", h, fps)
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
EOF