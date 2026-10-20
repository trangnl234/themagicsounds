import React, { useState, useEffect, useRef } from 'react';
import { ADMIN_EMAIL } from '../firebase';
import { CourseKey } from '../utils/courseCoverStorage';

const STORAGE_KEY_SMALL_LOGO = 'phonics_footer_small_logo_v1';

interface HeaderProps {
  isLoggedIn: boolean;
  currentUsername?: string;
  currentUserEmail?: string;
  onSetAuth: (status: boolean) => void;
  diamonds: number;
  uploadedAudioCount: number;
  onOpenLogin: (initialMode?: 'login' | 'register' | 'forgot') => void;
  onOpenDiamondModal: () => void;
  onOpenAudioManager: () => void;
  onOpenMicrophone?: () => void;
  onOpenAdminDashboard?: () => void;
  onGoHome?: () => void;
  activeCoursePage?: CourseKey | null;
  onSelectCourse?: (courseKey: CourseKey) => void;
}

const NAV_COURSES: Array<{
  key: CourseKey;
  label: string;
  activeClass: string;
  idleClass: string;
}> = [
  {
    key: 'tune-in',
    label: 'Tune In',
    activeClass: 'bg-[#e13829] text-white border-[#e13829] shadow-2xs',
    idleClass:
      'bg-[#fff8f6] hover:bg-[#ffe8e3] text-[#c8281b] border-[#e13829]/30',
  },
  {
    key: 'sound-to-speech',
    label: 'Mimic',
    activeClass: 'bg-emerald-700 text-white border-emerald-700 shadow-2xs',
    idleClass:
      'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-600/30',
  },
  {
    key: 'magic-sounds',
    label: 'Magic Sounds',
    activeClass: 'bg-primary text-white border-primary shadow-2xs',
    idleClass:
      'bg-primary-fixed/25 hover:bg-primary-fixed/45 text-primary border-primary/30',
  },
  {
    key: 'sound-code',
    label: 'Sound Code',
    activeClass: 'bg-slate-900 text-white border-slate-900 shadow-2xs',
    idleClass:
      'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300',
  },
];

export function Header({
  isLoggedIn,
  currentUsername,
  currentUserEmail = '',
  onSetAuth,
  onOpenLogin,
  onOpenAdminDashboard,
  onGoHome,
  activeCoursePage = null,
  onSelectCourse,
}: HeaderProps) {
  const [logoUrl, setLogoUrl] = useState<string>('');

  useEffect(() => {
    const stripWhiteBg = (src: string) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const w = img.naturalWidth || img.width;
          const h = img.naturalHeight || img.height;
          if (!w || !h) {
            setLogoUrl(src);
            return;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setLogoUrl(src);
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
              // Giữ nguyên chữ ENGLISH màu trắng nằm trong dải băng xanh lá ở giữa dưới
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
                  // Khử răng cưa viền trắng
                  d[idx + 3] = Math.round(((215 - brightness) / 25) * d[idx + 3]);
                }
              }
            }
          }
          ctx.putImageData(imgData, 0, 0);
          setLogoUrl(canvas.toDataURL('image/png'));
        } catch {
          setLogoUrl(src);
        }
      };
      img.onerror = () => setLogoUrl(src);
      img.src = src;
    };

    const syncLogo = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_SMALL_LOGO);
        if (saved) {
          stripWhiteBg(saved);
        }
      } catch {
        // ignore
      }
    };
    syncLogo();
    window.addEventListener('phonics-small-logo-updated', syncLogo);
    return () => window.removeEventListener('phonics-small-logo-updated', syncLogo);
  }, []);

  const isAdminAccount =
    currentUserEmail.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.05)] border-b border-surface-container/80">
      <div className="min-h-16 py-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo + THE MAGIC SOUNDS */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onGoHome?.()}
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl overflow-hidden cursor-pointer ${
              logoUrl
                ? 'bg-transparent'
                : 'bg-primary text-on-primary shadow-sm border border-primary/20'
            }`}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="THE MAGIC SOUNDS"
                className="w-full h-full object-contain bg-transparent"
              />
            ) : (
              <span>M</span>
            )}
          </button>

          <div className="flex flex-col">
            <button
              type="button"
              onClick={() => onGoHome?.()}
              className="font-black text-base sm:text-lg text-primary tracking-tight leading-tight text-left cursor-pointer hover:underline"
            >
              THE MAGIC SOUNDS
            </button>
            <span className="text-[11px] font-semibold text-on-surface-variant hidden xl:inline">
              Hành trình kỳ diệu từ âm thanh tới chữ viết
            </span>
          </div>
        </div>

        {/* Center Quick Course Bar: Bấm 1 chạm vào thẳng từng khoá học ở bất kỳ đâu */}
        {onSelectCourse && (
          <nav className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5">
            <button
              type="button"
              onClick={() => onGoHome?.()}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                activeCoursePage === null
                  ? 'bg-stone-800 text-white border-stone-800 shadow-2xs'
                  : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">home</span>
              <span>Trang chủ</span>
            </button>

            {NAV_COURSES.map((item) => {
              const isCurrent = activeCoursePage === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelectCourse(item.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer shrink-0 ${
                    isCurrent ? item.activeClass : item.idleClass
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right side controls: Nút Quản trị Học viên + Đăng ký & Đăng nhập */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenAdminDashboard && (
            <button
              type="button"
              onClick={onOpenAdminDashboard}
              title="Quản trị tài khoản học viên, tiến trình học & cấp mã kích hoạt 1 lần"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                isAdminAccount
                  ? 'bg-[#e13829] text-white shadow-xs hover:bg-[#c8281b]'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                admin_panel_settings
              </span>
              <span className="hidden lg:inline">Quản trị</span>
            </button>
          )}

          {!isLoggedIn ? (
            <>
              <button
                type="button"
                onClick={() => onOpenLogin('register')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-primary text-primary bg-surface-container-lowest hover:bg-primary/5 text-xs sm:text-sm font-extrabold transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>Đăng ký</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenLogin('login')}
                className="flex items-center gap-1.5 bg-primary text-on-primary px-3 py-2 rounded-xl text-xs sm:text-sm font-extrabold hover:bg-primary-container transition-all shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>Đăng nhập</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-extrabold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px]">verified_user</span>
                <div className="flex flex-col leading-tight">
                  <span>{currentUsername || 'Học viên'}</span>
                  {currentUserEmail && (
                    <span className="text-[10px] font-semibold text-on-surface-variant hidden sm:inline">
                      {currentUserEmail}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSetAuth(false)}
                className="px-2.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-bold transition-all cursor-pointer"
                title="Đăng xuất"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
