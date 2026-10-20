import React, { useState, useEffect, useRef } from 'react';
import {
  CourseKey,
  loadCourseCover,
  saveCourseCoverFile,
} from '../utils/courseCoverStorage';
import { CourseCoverArt } from './CourseCoverArt';

interface CourseBannerHeaderProps {
  courseKey: CourseKey;
  stepNumber: string;
  title: string;
  subtitleLine1: string;
  subtitleLine2: string;
  accentColor: 'rose' | 'blue' | 'indigo' | 'emerald';
  introDescription: string;
  accessSummary: string;
  bulletPoints: string[];
  onOpenCoursePage: () => void;
  isSubpage?: boolean;
  onRegisterCourseClick?: () => void;
  highlightRegisterButton?: boolean;
}

export function CourseBannerHeader({
  courseKey,
  title,
  subtitleLine1,
  subtitleLine2,
  accentColor,
  onOpenCoursePage,
  isSubpage = false,
  onRegisterCourseClick,
  highlightRegisterButton = false,
}: CourseBannerHeaderProps) {
  const [coverUrl, setCoverUrl] = useState<string>('');
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const syncCover = () => {
      loadCourseCover(courseKey).then((url) => {
        if (mounted) setCoverUrl(url || '');
      });
    };
    syncCover();
    window.addEventListener('phonics-course-cover-updated', syncCover);
    return () => {
      mounted = false;
      window.removeEventListener('phonics-course-cover-updated', syncCover);
    };
  }, [courseKey]);

  const themeMap = {
    rose: {
      border: 'border-[#e13829]/30 hover:border-[#e13829]',
      bg: 'bg-gradient-to-r from-[#fff8f6] via-white to-[#fff5f2]',
      titleText: 'text-[#c8281b]',
      btnSolid: 'bg-[#e13829] hover:bg-[#c8281b] text-white shadow-[0_3px_0_#991b1b]',
    },
    blue: {
      border: 'border-primary/30 hover:border-primary',
      bg: 'bg-gradient-to-r from-primary-fixed/25 via-white to-primary-fixed/15',
      titleText: 'text-primary',
      btnSolid: 'bg-primary hover:bg-primary-container text-on-primary shadow-[0_3px_0_#1e3a8a]',
    },
    indigo: {
      border: 'border-indigo-900/25 hover:border-indigo-900',
      bg: 'bg-gradient-to-r from-slate-50 via-white to-indigo-50/40',
      titleText: 'text-slate-900',
      btnSolid: 'bg-slate-900 hover:bg-slate-800 text-white shadow-[0_3px_0_#0f172a]',
    },
    emerald: {
      border: 'border-emerald-700/30 hover:border-emerald-700',
      bg: 'bg-gradient-to-r from-emerald-50/60 via-white to-teal-50/40',
      titleText: 'text-emerald-900',
      btnSolid: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-[0_3px_0_#064e3b]',
    },
  }[accentColor];

  const handleCardClick = () => {
    if (!isSubpage) {
      onOpenCoursePage();
    }
  };

  return (
    <div
      id={isSubpage ? 'course-subpage-banner' : undefined}
      onClick={handleCardClick}
      className={`rounded-2xl p-3.5 sm:p-4 border-2 shadow-xs transition-all scroll-mt-24 ${
        !isSubpage ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      } ${themeMap.border} ${themeMap.bg}`}
    >
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            await saveCourseCoverFile(courseKey, file);
          }
          e.target.value = '';
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Compact Course Cover Image + Bold Title + Short Description */}
        <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
          <div
            onClick={(e) => {
              e.stopPropagation();
              coverInputRef.current?.click();
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              const file = e.dataTransfer?.files?.[0];
              if (file && file.type.startsWith('image/')) {
                await saveCourseCoverFile(courseKey, file);
              }
            }}
            title={`Bấm để đổi ảnh đại diện khoá ${title}`}
            className="group relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl overflow-hidden shrink-0 border border-stone-200 hover:border-primary/40 cursor-pointer shadow-xs transition-all flex items-center justify-center"
          >
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover block"
              />
            ) : (
              <CourseCoverArt
                courseKey={courseKey}
                className="w-full h-full block"
              />
            )}
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation();
              if (!isSubpage) {
                onOpenCoursePage();
              } else if (
                courseKey !== 'sound-to-speech' &&
                courseKey !== 'tune-in'
              ) {
                onRegisterCourseClick?.();
              }
            }}
            className={`space-y-0.5 min-w-0 ${
              !isSubpage ||
              (courseKey !== 'sound-to-speech' && courseKey !== 'tune-in')
                ? 'cursor-pointer group'
                : ''
            }`}
          >
            <h2
              className={`text-xl sm:text-2xl font-black tracking-tight leading-tight group-hover:underline ${themeMap.titleText}`}
            >
              {title}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-on-surface leading-snug">
              {subtitleLine1}
              {subtitleLine2 ? (
                <span className="font-semibold text-on-surface-variant">
                  {' '}
                  • {subtitleLine2}
                </span>
              ) : null}
            </p>
          </div>
        </div>

        {/* Right: Main Action Button */}
        <div
          className="flex flex-col items-end gap-2 self-stretch md:self-center justify-center shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-wrap items-center gap-2.5 justify-end">
            {isSubpage ? (
              courseKey === 'sound-to-speech' || courseKey === 'tune-in' ? (
                <span className="px-4 py-2.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-black text-xs sm:text-sm flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-emerald-700">
                    verified
                  </span>
                  <span>HOÀN TOÀN MIỄN PHÍ</span>
                </span>
              ) : courseKey === 'magic-sounds' ? null : (
                <button
                  id="btn-dang-ky-khoa-hoc"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRegisterCourseClick?.();
                  }}
                  className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                    themeMap.btnSolid
                  } ${
                    highlightRegisterButton
                      ? 'ring-4 ring-amber-400 scale-105 animate-bounce'
                      : ''
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    how_to_reg
                  </span>
                  <span>{`Đăng ký ${title.toUpperCase()}`}</span>
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCoursePage();
                }}
                className={`px-6 py-3 rounded-2xl font-black text-sm sm:text-base transition-all flex items-center gap-2 cursor-pointer active:translate-y-0.5 ${themeMap.btnSolid}`}
              >
                <span>Vào học {title}</span>
                <span className="material-symbols-outlined text-[20px]">
                  arrow_forward
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
