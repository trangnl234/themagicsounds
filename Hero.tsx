import { useState, useEffect, useRef } from 'react';
import { CourseCoverArt } from './CourseCoverArt';
import {
  CourseKey,
  ALL_COURSE_KEYS,
  loadCourseCover,
  saveCourseCoverFile,
} from '../utils/courseCoverStorage';

// Ảnh cố định hiển thị ở góc phải phần giới thiệu đầu trang
const HERO_TEACHER_IMAGE = '/assets/co-trang-asi-hero.jpg';

interface HeroProps {
  onSelectCourse?: (courseKey: CourseKey) => void;
}

export function Hero({ onSelectCourse }: HeroProps = {}) {
  const [customCovers, setCustomCovers] = useState<Record<string, string>>({});
  const [uploadingCourseKey, setUploadingCourseKey] =
    useState<CourseKey | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const syncCovers = async () => {
      const next: Record<string, string> = {};
      for (const k of ALL_COURSE_KEYS) {
        const url = await loadCourseCover(k);
        if (url) next[k] = url;
      }
      setCustomCovers(next);
    };
    syncCovers();
    window.addEventListener('phonics-course-cover-updated', syncCovers);

    return () => {
      window.removeEventListener('phonics-course-cover-updated', syncCovers);
    };
  }, []);

  const handleTriggerCoverUpload = (
    e: React.MouseEvent,
    courseKey: CourseKey
  ) => {
    e.stopPropagation();
    setUploadingCourseKey(courseKey);
    coverInputRef.current?.click();
  };

  const renderThumbnail = (courseKey: CourseKey, alt: string) => {
    const customUrl = customCovers[courseKey];
    return (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const file = e.dataTransfer?.files?.[0];
          if (file && file.type.startsWith('image/')) {
            await saveCourseCoverFile(courseKey, file);
          }
        }}
        className={`relative w-full ${
          customUrl ? 'bg-white border-black/10' : 'aspect-[16/9] border-black/5'
        } rounded-2xl overflow-hidden border shadow-xs mb-3 flex items-center justify-center group/thumb`}
      >
        {customUrl ? (
          <img
            src={customUrl}
            alt={alt}
            referrerPolicy="no-referrer"
            className="w-full h-auto object-contain block"
          />
        ) : (
          <CourseCoverArt
            courseKey={courseKey}
            className="w-full h-full block"
          />
        )}

        <button
          type="button"
          onClick={(e) => handleTriggerCoverUpload(e, courseKey)}
          title={`Bấm để đổi ảnh đại diện khoá ${alt}`}
          className="absolute top-2.5 right-2.5 px-2.5 py-1.5 rounded-xl bg-white/95 hover:bg-white text-stone-900 border border-stone-300 shadow-sm text-xs font-extrabold flex items-center gap-1 transition-all hover:scale-105 cursor-pointer z-10"
        >
          <span className="material-symbols-outlined text-[15px] text-emerald-700">
            add_photo_alternate
          </span>
          <span>Đổi ảnh</span>
        </button>
      </div>
    );
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-primary-fixed/30 via-surface to-surface pb-10 pt-8">
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file && uploadingCourseKey) {
            await saveCourseCoverFile(uploadingCourseKey, file);
          }
          e.target.value = '';
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 space-y-10">
        {/* Khối Giới Thiệu Đầu Trang + Ảnh Cô Trang Ở Góc Phải */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Cột Trái: Tiêu đề đồng nhất tông màu, tinh gọn & sang trọng */}
          <div className="flex-1 space-y-3 max-w-3xl">
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-primary tracking-tight leading-tight">
                ĐÁNH VẦN TIẾNG ANH{' '}
                <span className="text-[#e13829]">THE MAGIC SOUNDS</span>
              </h1>
              <p className="text-base sm:text-lg font-bold text-on-surface tracking-tight">
                Hành trình kỳ diệu từ âm thanh tới chữ viết
              </p>
            </div>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-0.5">
              <span className="text-base sm:text-lg font-extrabold text-primary tracking-wide">
                Hear it - Feel it - Read it
              </span>
              <span className="text-on-surface-variant/40 hidden sm:inline">
                •
              </span>
              <span className="text-sm sm:text-base font-semibold text-on-surface-variant">
                Nghe âm - Cảm âm - Tập đọc
              </span>
            </div>

            <div className="pt-2.5 border-t border-surface-container-high/80 space-y-1">
              <p className="text-sm sm:text-base font-medium text-on-surface-variant leading-relaxed">
                Mọi đứa trẻ đều phải biết đánh vần tập đọc tiếng Anh, như vỡ
                lòng tiếng mẹ đẻ.
              </p>
              <p className="text-sm sm:text-base italic font-normal text-on-surface-variant text-right">
                - Cô Trang ASI
              </p>
            </div>
          </div>

          {/* Góc Phải Ngay Phần Giới Thiệu: Ảnh Cô Trang ASI cùng học trò */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="w-40 sm:w-44 md:w-48 bg-surface-container-lowest p-2 rounded-2xl shadow-md border-2 border-white">
              <div className="relative w-full rounded-xl overflow-hidden bg-surface-container">
                <img
                  src={HERO_TEACHER_IMAGE}
                  alt="Cô Trang ASI dạy đánh vần tiếng Anh cùng học trò"
                  className="w-full h-auto block"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Khu vực Giới Thiệu Về Hành Trình Ngôn Ngữ Thuận Tự Nhiên */}
        <div
          id="hanh-trinh-ngon-ngu"
          className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 lg:p-10 border-2 border-primary/15 shadow-sm space-y-8"
        >
          {/* Tiêu đề & Nội dung Hành Trình Ngôn Ngữ Thuận Tự Nhiên */}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-container-high pb-4">
              <h2 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
                Hành Trình Ngôn Ngữ Thuận Tự Nhiên
              </h2>

              <a
                href="#sound-test"
                className="px-4 py-2.5 rounded-2xl bg-primary hover:bg-primary-container text-on-primary text-xs sm:text-sm font-extrabold transition-all shadow-xs flex items-center gap-2 shrink-0 self-start"
              >
                <span className="material-symbols-outlined text-[18px]">
                  fact_check
                </span>
                <span>Sound test: Đánh giá năng lực nhận biết âm</span>
              </a>
            </div>

            <div className="space-y-3.5 text-sm sm:text-base text-on-surface leading-relaxed font-medium">
              <p>
                Hãy nhớ lại cách chúng ta học tiếng mẹ đẻ. Từ khi chào đời, ta đã nghe bố mẹ và những người xung quanh nói chuyện mỗi ngày. Ta nghe rất lâu trước khi bật ra tiếng nói đầu tiên. Khi khả năng nghe – nói dần hình thành, ta mới làm quen với chữ cái, học đánh vần, tập đọc, tập viết rồi mới học cách diễn đạt những suy nghĩ dài hơn.
              </p>

              <p className="font-extrabold text-primary text-base sm:text-lg">
                Nghe – Nói – Đọc – Viết là tiến trình tự nhiên của ngôn ngữ.
              </p>

              <p>
                Nhưng với tiếng Anh, nhiều người không có cơ hội nghe ngấm từ nhỏ. Đến tuổi đi học, tiếng Anh xuất hiện cùng sách vở, bài kiểm tra và áp lực điểm số. Việc học dễ tập trung vào từ vựng, ngữ pháp và đáp án đúng, trong khi khả năng nghe hiểu, phát âm và tự đánh vần để đọc lại chưa được xây dựng đầy đủ.
              </p>

              <p>
                Vì thế, một học viên có thể nhớ nhiều từ nhưng không nhận ra chúng khi nghe; có thể nhìn thấy từ quen nhưng vẫn phải chờ giáo viên đọc mẫu; có thể làm bài đúng nhưng chưa biết diễn đạt điều mình muốn nói. Vấn đề không hẳn nằm ở năng khiếu, mà đôi khi nằm ở những bước nền tảng đã bị bỏ qua hoặc học chưa đúng trình tự.
              </p>

              <p>
                Trang xây dựng lộ trình này để đưa người học trở lại với hành trình ngôn ngữ thuận tự nhiên: nghe để nhận ra âm thanh, nói để hình thành phản xạ, đánh vần để tự đọc và viết để diễn đạt suy nghĩ. Tùy độ tuổi và nền tảng, mỗi học viên có thể bắt đầu từ một điểm khác nhau, nhưng đích đến chung vẫn là hiểu bản chất, sử dụng được tiếng Anh và từng bước tự học.
              </p>

              <p className="font-bold text-on-surface">
                Bạn có sẵn sàng trở lại đúng chỗ để bắt đầu một hành trình mới? Trang sẵn sàng đồng hành cùng bạn.
              </p>
              <div className="pt-1 space-y-0.5">
                <p className="text-base sm:text-lg font-black text-[#e13829] tracking-tight">
                  THE MAGIC SOUNDS
                </p>
                <p className="text-sm sm:text-base font-bold text-on-surface">
                  Hành trình kỳ diệu từ âm thanh đến chữ viết.
                </p>
                <p className="text-sm sm:text-base italic font-medium text-on-surface-variant">
                  Cô Trang ASI
                </p>
              </div>
            </div>
          </div>

          {/* ================================================================== */}
          {/* KHỐI CHỦ ĐẠO 1: LUYỆN NGHE NHẮC LẠI (2 SET HỌC MIỄN PHÍ)           */}
          {/* ================================================================== */}
          <div className="rounded-3xl bg-gradient-to-br from-emerald-50/90 via-white to-rose-50/60 p-5 sm:p-7 border-2 border-emerald-500/35 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 pb-3.5">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <span className="material-symbols-outlined text-2xl">
                    headphones
                  </span>
                </span>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-950 tracking-tight uppercase">
                  LUYỆN NGHE NHẮC LẠI
                </h3>
              </div>

              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-black uppercase tracking-wide flex items-center gap-1.5 shadow-2xs">
                <span className="material-symbols-outlined text-base">
                  verified
                </span>
                <span>2 Khoá Học Miễn Phí</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 1. Tune In */}
              <div
                id="khoa-tune-in"
                role="button"
                tabIndex={0}
                onClick={() => onSelectCourse?.('tune-in')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectCourse?.('tune-in');
                  }
                }}
                className="group text-left bg-[#fff8f6] hover:bg-[#fff0ec] p-4 sm:p-5 rounded-3xl border-2 border-[#e13829]/35 hover:border-[#e13829] transition-all hover:-translate-y-0.5 flex flex-col justify-between gap-3 shadow-xs hover:shadow-md cursor-pointer scroll-mt-24"
              >
                <div className="w-full">
                  {renderThumbnail('tune-in', 'Tune In')}
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-2xl sm:text-3xl font-black text-[#c8281b] group-hover:text-[#a81f14]">
                      Tune In
                    </h4>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black uppercase">
                      Miễn phí
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-on-surface mt-1">
                    Nghe ngấm tiếng Anh mỗi ngày
                  </p>
                </div>
                <div className="w-full pt-3 border-t border-[#e13829]/15 flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-on-surface-variant">
                    Trẻ 0–6 tuổi
                  </span>
                  <span className="px-4 py-2 rounded-xl bg-[#e13829] text-white text-xs sm:text-sm font-extrabold flex items-center gap-1.5 shadow-2xs">
                    <span>Vào học</span>
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_forward
                    </span>
                  </span>
                </div>
              </div>

              {/* 2. Mimic */}
              <div
                id="khoa-sound-to-speech"
                role="button"
                tabIndex={0}
                onClick={() => onSelectCourse?.('sound-to-speech')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectCourse?.('sound-to-speech');
                  }
                }}
                className="group text-left bg-emerald-50/70 hover:bg-emerald-50 p-4 sm:p-5 rounded-3xl border-2 border-emerald-600/40 hover:border-emerald-700 transition-all hover:-translate-y-0.5 flex flex-col justify-between gap-3 shadow-xs hover:shadow-md cursor-pointer scroll-mt-24"
              >
                <div className="w-full">
                  {renderThumbnail('sound-to-speech', 'Mimic')}
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-2xl sm:text-3xl font-black text-emerald-900">
                      Mimic
                    </h4>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black uppercase">
                      Miễn phí
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-on-surface mt-1">
                    Nghe đúng khối âm – nói tự nhiên
                  </p>
                </div>
                <div className="w-full pt-3 border-t border-emerald-600/15 flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-on-surface-variant truncate">
                    Từ 7 tuổi - người lớn
                  </span>
                  <span className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs sm:text-sm font-extrabold flex items-center gap-1.5 shrink-0 shadow-2xs">
                    <span>Vào học</span>
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_forward
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================== */}
          {/* KHỐI BÊN DƯỚI 2: ĐÁNH VẦN - ĐỌC THẠO (2 SET HỌC CÓ PHÍ)             */}
          {/* ================================================================== */}
          <div className="rounded-3xl bg-slate-50/80 p-5 sm:p-7 border-2 border-primary/20 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3.5">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xs shrink-0">
                  <span className="material-symbols-outlined text-2xl">
                    menu_book
                  </span>
                </span>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-primary tracking-tight uppercase">
                  ĐÁNH VẦN - ĐỌC THẠO
                </h3>
              </div>

              <span className="px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/25 text-primary text-xs sm:text-sm font-black uppercase tracking-wide">
                Khoá Học Chuyên Sâu
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 3. Magic Sounds */}
              <div
                id="khoa-magic-sounds"
                role="button"
                tabIndex={0}
                onClick={() => onSelectCourse?.('magic-sounds')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectCourse?.('magic-sounds');
                  }
                }}
                className="group text-left bg-white hover:bg-primary-fixed/20 p-4 sm:p-5 rounded-3xl border-2 border-primary/30 hover:border-primary transition-all hover:-translate-y-0.5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-md cursor-pointer scroll-mt-24"
              >
                <div className="w-full">
                  {renderThumbnail('magic-sounds', 'Magic Sounds')}
                  <h4 className="text-2xl sm:text-3xl font-black text-primary">
                    Magic Sounds
                  </h4>
                  <p className="text-sm sm:text-base font-bold text-on-surface mt-1">
                    Đánh vần – tập đọc tiếng Anh
                  </p>
                </div>
                <div className="w-full pt-3 border-t border-primary/15 flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-on-surface-variant">
                    Trẻ 6–12 tuổi
                  </span>
                  <span className="px-4 py-2 rounded-xl bg-primary text-white text-xs sm:text-sm font-extrabold flex items-center gap-1.5 shadow-2xs">
                    <span>Vào học</span>
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_forward
                    </span>
                  </span>
                </div>
              </div>

              {/* 4. Sound Code */}
              <div
                id="khoa-sound-code"
                role="button"
                tabIndex={0}
                onClick={() => onSelectCourse?.('sound-code')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectCourse?.('sound-code');
                  }
                }}
                className="group text-left bg-white hover:bg-slate-100/80 p-4 sm:p-5 rounded-3xl border-2 border-slate-300 hover:border-slate-800 transition-all hover:-translate-y-0.5 flex flex-col justify-between gap-3 shadow-2xs hover:shadow-md cursor-pointer scroll-mt-24"
              >
                <div className="w-full">
                  {renderThumbnail('sound-code', 'Sound Code')}
                  <h4 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Sound Code
                  </h4>
                  <p className="text-sm sm:text-base font-bold text-on-surface mt-1">
                    Giải mã cách đọc bằng hệ thống âm IPA
                  </p>
                </div>
                <div className="w-full pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-on-surface-variant truncate">
                    Từ 12 tuổi - người lớn
                  </span>
                  <span className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-extrabold flex items-center gap-1.5 shrink-0 shadow-2xs">
                    <span>Vào học</span>
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_forward
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
