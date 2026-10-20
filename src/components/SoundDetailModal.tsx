import { useState, useEffect } from 'react';
import { PhonicsSound } from '../data/phonicsData';
import { speakPhonicsSound } from '../utils/audioPlayer';
import { LetterFormationCard } from './LetterFormationCard';
import { BlendingManagerTab } from './BlendingManagerTab';
import { SegmentingPracticeTab } from './SegmentingPracticeTab';
import { SoundVideosSection } from './SoundVideosSection';

interface SoundDetailModalProps {
  sound: PhonicsSound | null;
  onClose: () => void;
  onOpenAudioManager?: () => void;
}

export function SoundDetailModal({ sound, onClose }: SoundDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'sounds' | 'blending' | 'segmenting'>('sounds');
  // 3 Bước học âm: 1 (Nghe & Hành động) -> 2 (Nghe & Bắt chước) -> 3 (Nhìn chữ & Tập viết)
  const [soundStep, setSoundStep] = useState<1 | 2 | 3>(1);

  // Mặc định về Bước 1 mỗi khi mở âm mới
  useEffect(() => {
    if (sound) {
      setSoundStep(1);
      setActiveTab('sounds');
    }
  }, [sound]);

  if (!sound) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in">
      <div className="bg-surface-container-lowest max-w-3xl w-full rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-primary/20 flex flex-col gap-5 relative overflow-hidden max-h-[94vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-container">
          <div className="flex items-center gap-3">
            <span
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-3xl shadow-sm select-none"
              style={{ backgroundColor: `${sound.groupColor}20`, color: sound.groupColor }}
            >
              {sound.sound}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-on-surface">
                  Luyện Tập Âm /{sound.sound}/
                </h3>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ backgroundColor: `${sound.groupColor}20`, color: sound.groupColor }}
                >
                  {sound.groupName}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container font-mono font-bold text-primary">
                  {sound.ipa}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {sound.nameVi} • {sound.nameEn}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* 3 Main Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-surface-container p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('sounds')}
            className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'sounds'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">play_circle</span>
            <span>1. Học Âm (3 Bước)</span>
          </button>
          <button
            onClick={() => setActiveTab('blending')}
            className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'blending'
                ? 'bg-secondary-container text-on-secondary-container shadow-sm ring-2 ring-secondary/30'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">join_inner</span>
            <span>2. Đánh Vần</span>
          </button>
          <button
            onClick={() => setActiveTab('segmenting')}
            className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'segmenting'
                ? 'bg-group-ai-j-oa-ie-ee-or text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">call_split</span>
            <span>3. Tách Âm</span>
          </button>
        </div>

        {/* TAB 1: HỌC ÂM (3 BƯỚC TUẦN TỰ VỚI THANH NỔI) */}
        {activeTab === 'sounds' && (
          <div className="flex flex-col gap-4">
            {/* THANH NỔI ĐIỀU HƯỚNG 3 BƯỚC - BẤM CHUYỂN BƯỚC NHANH */}
            <div className="sticky top-0 z-20 bg-surface-container-lowest/95 backdrop-blur-md py-1 px-0.5 rounded-2xl border border-surface-container shadow-xs">
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setSoundStep(1)}
                  className={`py-2.5 px-2 sm:px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    soundStep === 1
                      ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-400/50 scale-[1.02]'
                      : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">accessibility_new</span>
                  <span className="truncate">Bước 1: Hành Động</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSoundStep(2)}
                  className={`py-2.5 px-2 sm:px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    soundStep === 2
                      ? 'bg-sky-600 text-white shadow-md ring-2 ring-sky-400/50 scale-[1.02]'
                      : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">record_voice_over</span>
                  <span className="truncate">Bước 2: Khẩu Hình</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSoundStep(3)}
                  className={`py-2.5 px-2 sm:px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    soundStep === 3
                      ? 'bg-red-500 text-white shadow-md ring-2 ring-red-400/50 scale-[1.02]'
                      : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">draw</span>
                  <span className="truncate">Bước 3: Tập Viết</span>
                </button>
              </div>
            </div>

            {/* NỘI DUNG BƯỚC 1: NGHE ÂM & LÀM THEO HÀNH ĐỘNG */}
            {soundStep === 1 && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <SoundVideosSection sound={sound} step={1} />
                
                {/* Nút bấm nổi sang Bước 2 */}
                <div className="flex items-center justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSoundStep(2)}
                    className="py-3 px-6 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Bấm Tiếp: Bước 2 (Khẩu Hình Miệng)</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* NỘI DUNG BƯỚC 2: NGHE ÂM & BẮT CHƯỚC THEO */}
            {soundStep === 2 && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <SoundVideosSection sound={sound} step={2} />

                {/* Thanh chuyển bước: Quay lại Bước 1 & Tiến sang Bước 3 */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setSoundStep(1)}
                    className="py-3 px-5 rounded-2xl bg-surface-container-high hover:bg-surface-variant text-on-surface font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    <span>Quay lại Bước 1</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSoundStep(3)}
                    className="py-3 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Bấm Tiếp: Bước 3 (Nhìn Chữ & Tập Viết)</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* NỘI DUNG BƯỚC 3: NHÌN CHỮ & TẬP VIẾT (NHƯ CŨ) */}
            {soundStep === 3 && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <div className="w-full flex justify-center py-1">
                  <LetterFormationCard
                    soundText={sound.sound}
                    soundId={sound.id}
                    ipa={sound.ipa}
                    nameVi={sound.nameVi}
                  />
                </div>

                {/* Thanh chuyển bước: Quay lại Bước 2 & Sang Tab Đánh Vần */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setSoundStep(2)}
                    className="py-3 px-5 rounded-2xl bg-surface-container-high hover:bg-surface-variant text-on-surface font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    <span>Quay lại Bước 2</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('blending')}
                    className="py-3 px-6 rounded-2xl bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-on-secondary font-black text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Sang Đánh Vần (Blending)</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Đánh Vần (Blending) - Quản lý từ và tải file audio từng từ */}
        {activeTab === 'blending' && (
          <BlendingManagerTab sound={sound} />
        )}

        {/* Tab 3: Tách Âm (Segmenting & Dictation) */}
        {activeTab === 'segmenting' && (
          <SegmentingPracticeTab sound={sound} />
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-surface-container flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-bold text-xs hover:bg-surface-variant transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
