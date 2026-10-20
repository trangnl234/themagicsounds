import React, { useState, useEffect, useRef } from 'react';
import { SoundTestSection } from './SoundTestSection';

const STORAGE_KEY_FOOTER_LOGO = 'phonics_footer_small_logo_v1';

export function Footer() {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const stripWhiteBg = (src: string, onDone: (cleanUrl: string) => void) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (!w || !h) {
          onDone(src);
          return;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          onDone(src);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const r = d[idx];
            const g = d[idx + 1];
            const b = d[idx + 2];
            const inEnglishRibbon =
              x > w * 0.25 && x < w * 0.75 && y > h * 0.66 && y < h * 0.86;
            if (!inEnglishRibbon) {
              const brightness = (r + g + b) / 3;
              const maxDiff = Math.max(
                Math.abs(r - g),
                Math.abs(g - b),
                Math.abs(r - b)
              );
              if (brightness > 215 && maxDiff < 30) {
                d[idx + 3] = 0;
              } else if (brightness > 190 && maxDiff < 25) {
                d[idx + 3] = Math.round(((215 - brightness) / 25) * d[idx + 3]);
              }
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
        onDone(canvas.toDataURL('image/png'));
      } catch {
        onDone(src);
      }
    };
    img.onerror = () => onDone(src);
    img.src = src;
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FOOTER_LOGO);
      if (saved) {
        stripWhiteBg(saved, (clean) => setLogoUrl(clean));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleLogoUpload = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (dataUrl) {
        stripWhiteBg(dataUrl, (cleanUrl) => {
          setLogoUrl(cleanUrl);
          try {
            localStorage.setItem(STORAGE_KEY_FOOTER_LOGO, cleanUrl);
            window.dispatchEvent(new Event('phonics-small-logo-updated'));
          } catch {
            // ignore
          }
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {/* Sound Test: Phần đánh giá năng lực nhận biết âm */}
      <SoundTestSection />

      {/* Main Footer */}
      <footer className="bg-inverse-surface text-inverse-on-surface py-12 border-t border-inverse-on-surface/10">
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleLogoUpload(f);
            e.target.value = '';
          }}
          className="hidden"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 ${
                  logoUrl
                    ? 'bg-transparent'
                    : 'bg-primary text-on-primary border border-white/15'
                }`}
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="THE MAGIC SOUNDS Logo"
                    className="w-full h-full object-contain bg-transparent"
                  />
                ) : (
                  <span>M</span>
                )}
              </div>

              <div className="flex flex-col">
                <span className="text-lg font-extrabold text-on-primary tracking-tight">
                  THE MAGIC SOUNDS
                </span>
              </div>
            </div>

            <p className="text-xs text-inverse-on-surface/75 leading-relaxed">
              Nghe nói và đánh vần, đọc đúng tiếng Anh cho trẻ em và người lớn
            </p>

            <div className="inline-flex items-center gap-1.5 text-xs text-group-ai-j-oa-ie-ee-or font-semibold">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              <span>Chuẩn ngôn ngữ, đúng lứa tuổi.</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-on-primary mb-3">
              Chương Trình Học
            </h4>
            <ul className="space-y-2.5 text-xs text-inverse-on-surface/75">
              <li>
                <a href="#khoa-tune-in" className="hover:text-white transition-colors">
                  Luyện nghe trẻ em Tune in
                </a>
              </li>
              <li>
                <a href="#khoa-sound-to-speech" className="hover:text-white transition-colors">
                  Luyện nghe người lớn Mimic
                </a>
              </li>
              <li>
                <a href="#khoa-magic-sounds" className="hover:text-white transition-colors">
                  Đánh vần trẻ em Magic Sounds
                </a>
              </li>
              <li>
                <a href="#khoa-sound-code" className="hover:text-white transition-colors">
                  Đọc chuẩn người lớn Sound Code
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-on-primary mb-3">
              Liên Hệ & Tư Vấn
            </h4>
            <ul className="space-y-2.5 text-xs text-inverse-on-surface/75">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] text-secondary shrink-0 mt-0.5">
                  location_on
                </span>
                <span>BT 2.10 Nguyễn Xuân Khoát, phường Xuân Đỉnh, Hà Nội</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-secondary shrink-0">
                  call
                </span>
                <a
                  href="https://zalo.me/0398612126"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Zalo hỗ trợ: Hotline Anh ngữ ASI (0398612126)
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-secondary shrink-0">
                  language
                </span>
                <a
                  href="https://www.facebook.com/trang.asi.jollyphonics/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  fb.com/trang.asi.jollyphonics
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-on-primary mb-3">
              Học một lần dùng cả đời.
            </h4>
            <p className="text-xs text-inverse-on-surface/75 leading-relaxed">
              Mọi ngôn ngữ đều cần trải qua vỡ lòng tập đọc. Nắm chắc âm, hiểu cách ghép vần chính là nền móng để tự đọc mà không cần học thuộc lòng.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-8 mt-8 border-t border-inverse-on-surface/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-inverse-on-surface/60">
          <p>© 2026 THE MAGIC SOUNDS. Bảo lưu mọi quyền.</p>
          <p>Chuẩn ngôn ngữ, đúng lứa tuổi • Lộ trình độc lập</p>
        </div>
      </footer>
    </>
  );
}
