import { useState, useEffect, useRef } from 'react';
import { TRICKY_WORDS_DATA } from '../data/trickyWordsData';
import { speakWord, speakSentence, speakSequence } from '../utils/audioPlayer';
import {
  initVideoStorage,
  getLoadedAltSetVideos,
  saveAltSetVideo,
  deleteAltSetVideo,
  subscribeVideoUpdates,
  getTrickyGroupVideoKey,
  autoDistributeGroupVideos,
  LoadedVideoItem,
} from '../utils/videoStorage';

interface TrickyWordsSectionProps {
  hasPurchasedCourse?: boolean;
  onRequireCourseRegister?: () => void;
  onStudyTrickyGroup?: (groupNumber: number, label: string) => void;
}

export function TrickyWordsSection({
  hasPurchasedCourse = false,
  onRequireCourseRegister,
  onStudyTrickyGroup,
}: TrickyWordsSectionProps = {}) {
  const [currentGroup, setCurrentGroup] = useState<number>(1);
  const [currentSet, setCurrentSet] = useState<1 | 2>(1);
  const [playingWordIndex, setPlayingWordIndex] = useState<number | null>(null);

  // Quản lý video học từng Nhóm (Nhóm 1 -> Nhóm 6)
  const [groupVideosMap, setGroupVideosMap] = useState<Record<number, LoadedVideoItem[]>>({});
  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);
  const [isVideoExpanded, setIsVideoExpanded] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isBatchUploading, setIsBatchUploading] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const singleFileInputRef = useRef<HTMLInputElement | null>(null);
  const batchFileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const uploadModeRef = useRef<{ groupId: number; mode: 'replace' | 'append'; replaceIdx?: number }>({
    groupId: 1,
    mode: 'replace',
  });

  const groupData = TRICKY_WORDS_DATA[currentGroup];
  const activeWords = currentSet === 1 ? groupData.set1 : groupData.set2;

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const refreshTrickyVideos = () => {
    const next: Record<number, LoadedVideoItem[]> = {};
    for (let g = 1; g <= 6; g++) {
      next[g] = getLoadedAltSetVideos(getTrickyGroupVideoKey(g));
    }
    setGroupVideosMap(next);
  };

  useEffect(() => {
    let mounted = true;
    initVideoStorage().then(() => {
      if (mounted) refreshTrickyVideos();
    });

    const unsub = subscribeVideoUpdates(() => {
      if (mounted) refreshTrickyVideos();
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  // Khi chuyển Set 1 / Set 2: nếu Nhóm có >= 2 video thì tự chuyển sang video tương ứng Set 1 (index 0) hoặc Set 2 (index 1)
  useEffect(() => {
    const vids = groupVideosMap[currentGroup] || [];
    if (vids.length >= 2) {
      setActiveVideoIndex(currentSet === 1 ? 0 : 1);
    } else {
      setActiveVideoIndex(0);
    }
  }, [currentGroup, currentSet, groupVideosMap]);

  const handlePlaySingleWord = (word: string, index: number) => {
    setPlayingWordIndex(index);
    speakWord(word, () => {
      setPlayingWordIndex(null);
    });
  };

  const handlePlayAllWords = () => {
    onStudyTrickyGroup?.(
      currentGroup,
      `Magic Sounds: Tricky Words Nhóm ${currentGroup}`
    );
    speakSequence(
      activeWords,
      (idx) => setPlayingWordIndex(idx),
      () => setPlayingWordIndex(null)
    );
  };

  const handlePlaySentence = () => {
    onStudyTrickyGroup?.(
      currentGroup,
      `Magic Sounds: Tricky Words Nhóm ${currentGroup}`
    );
    speakSentence(
      groupData.sentence,
      `Câu ví dụ Nhóm ${currentGroup}: ${groupData.sentence}`
    );
  };

  const triggerUploadForGroup = (
    groupId: number,
    mode: 'replace' | 'append' = 'replace',
    replaceIdx?: number
  ) => {
    uploadModeRef.current = { groupId, mode, replaceIdx };
    if (singleFileInputRef.current) {
      singleFileInputRef.current.value = '';
      singleFileInputRef.current.click();
    }
  };

  const handleSingleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const { groupId, mode, replaceIdx } = uploadModeRef.current;
    const key = getTrickyGroupVideoKey(groupId);
    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        await saveAltSetVideo(
          key,
          f,
          f.name,
          i === 0 && mode === 'replace' ? 'replace' : 'append',
          i === 0 ? replaceIdx : undefined
        );
      }
      refreshTrickyVideos();
      setIsVideoExpanded(true);
      showToast(`Đã gắn video học vào Nhóm ${groupId} thành công!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Không thể lưu video. Vui lòng thử lại!', 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleBatchFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsBatchUploading(true);
    try {
      const report = await autoDistributeGroupVideos(files, 'tricky-6-groups');
      refreshTrickyVideos();
      setIsVideoExpanded(true);
      showToast(
        `Đã tự động phân phối ${report.totalFiles} video về chuẩn vị trí 6 Nhóm!`,
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi phân phối kho video!', 'error');
    } finally {
      setIsBatchUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteGroupVideo = async (groupId: number, idx?: number) => {
    const vids = groupVideosMap[groupId] || [];
    const label =
      typeof idx === 'number' && vids.length > 1
        ? `video #${idx + 1} của Nhóm ${groupId}`
        : `video của Nhóm ${groupId}`;
    if (!window.confirm(`Bạn có chắc muốn xóa ${label}?`)) return;

    await deleteAltSetVideo(getTrickyGroupVideoKey(groupId), idx);
    setActiveVideoIndex(0);
    refreshTrickyVideos();
    showToast(`Đã xóa ${label}!`, 'success');
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const currentGroupVideos = groupVideosMap[currentGroup] || [];
  const safeIdx = Math.min(activeVideoIndex, Math.max(0, currentGroupVideos.length - 1));
  const currentVideo = currentGroupVideos[safeIdx];
  const groupsWithVideoCount = [1, 2, 3, 4, 5, 6].filter(
    (g) => (groupVideosMap[g]?.length || 0) > 0
  ).length;

  return (
    <section className="w-full py-2" id="tricky-words">
      {/* Hidden File Inputs */}
      <input
        ref={singleFileInputRef}
        type="file"
        multiple
        accept="video/mp4,video/quicktime,video/webm,video/ogg,video/*"
        onChange={handleSingleFileChange}
        className="hidden"
      />
      <input
        ref={batchFileInputRef}
        type="file"
        multiple
        accept="video/mp4,video/quicktime,video/webm,video/ogg,video/*"
        onChange={handleBatchFileChange}
        className="hidden"
      />

      <div className="w-full space-y-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e13829] text-white font-black text-base sm:text-lg shadow-[0_3px_0_#991b1b]">
              <span className="material-symbols-outlined text-lg">
                stars
              </span>
              <span>Tricky Words: Từ khó</span>
            </h2>
          </div>
        </div>

        {/* Thanh Chọn Nhóm 1 - 6 + Chuyển Set 1 / Set 2 Gọn Trên 1 Hàng */}
        <div className="bg-surface-container-low p-2 rounded-2xl border border-surface-container flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((g) => {
              const hasVideo = (groupVideosMap[g]?.length || 0) > 0;
              const isSelected = currentGroup === g;
              return (
                <button
                  key={g}
                  onClick={() => {
                    if (g > 1 && !hasPurchasedCourse) {
                      onRequireCourseRegister?.();
                      return;
                    }
                    setCurrentGroup(g);
                  }}
                  className={`px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-primary text-on-primary border-primary shadow-sm scale-[1.02]'
                      : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high border-surface-container'
                  }`}
                >
                  {g > 1 && !hasPurchasedCourse && (
                    <span className="material-symbols-outlined text-[13px]">
                      lock
                    </span>
                  )}
                  <span>Nhóm {g}</span>
                  {hasVideo && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-emerald-300' : 'bg-emerald-500'
                      }`}
                      title={`Nhóm ${g} đã có video bài học`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Set 1 / Set 2 Switcher */}
          <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl shrink-0">
            <button
              onClick={() => setCurrentSet(1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                currentSet === 1
                  ? 'bg-primary text-on-primary shadow-2xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">layers</span>
              <span>Set 1</span>
            </button>
            <button
              onClick={() => {
                if (!hasPurchasedCourse) {
                  onRequireCourseRegister?.();
                  return;
                }
                setCurrentSet(2);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 cursor-pointer ${
                currentSet === 2
                  ? 'bg-primary text-on-primary shadow-2xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {!hasPurchasedCourse ? (
                <span className="material-symbols-outlined text-[14px]">lock</span>
              ) : (
                <span className="material-symbols-outlined text-[15px]">layers</span>
              )}
              <span>Set 2</span>
            </button>
          </div>
        </div>

        {toast && (
          <div
            className={`p-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                : 'bg-red-50 text-red-900 border border-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">
                {toast.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span>{toast.msg}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        )}

        {/* Khung Chính Gọn Gàng: Nút Video / Đọc 6 Từ + 6 Thẻ Từ + Câu Ví Dụ */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={async (e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (!files || files.length === 0) return;
            const key = getTrickyGroupVideoKey(currentGroup);
            setIsUploading(true);
            try {
              for (let i = 0; i < files.length; i++) {
                await saveAltSetVideo(key, files[i], files[i].name, i === 0 ? 'replace' : 'append');
              }
              refreshTrickyVideos();
              setIsVideoExpanded(true);
              showToast(`Đã gắn video học vào Nhóm ${currentGroup}!`, 'success');
            } finally {
              setIsUploading(false);
            }
          }}
          className="bg-surface-container-lowest rounded-3xl p-4 sm:p-5 border border-surface-container shadow-xs space-y-4"
        >
          {/* Hàng điều khiển Đọc 6 từ */}
          <div className="flex flex-wrap items-center justify-end gap-2 pb-3 border-b border-surface-container">
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handlePlayAllWords}
                className="px-3 py-1.5 rounded-xl bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-on-secondary text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px]">play_circle</span>
                <span>Đọc cả 6 từ</span>
              </button>
            </div>
          </div>

          {/* Khung phát Video Học Nhóm (Chỉ hiển thị khi đã có video và đang mở) */}
          {currentVideo && isVideoExpanded && (
            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-primary/20 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-lg">
                    smart_display
                  </span>
                  <span className="text-xs font-black text-on-surface">
                    Video Bài Học Nhóm {currentGroup}
                  </span>
                </div>

                {currentGroupVideos.length > 1 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {currentGroupVideos.map((v, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveVideoIndex(idx)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          safeIdx === idx
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                        }`}
                      >
                        {v.label || `Video ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="max-w-2xl mx-auto aspect-video max-h-[320px] bg-black rounded-xl overflow-hidden flex items-center justify-center shadow-inner">
                <video
                  ref={videoRef}
                  key={currentVideo.playUrl}
                  src={currentVideo.playUrl}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* 6 Thẻ Từ Khó Gọn Gàng Trên 1 Hàng */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {activeWords.map((word, idx) => {
              const isPlaying = playingWordIndex === idx;

              let fontClass = 'text-2xl sm:text-3xl';
              if (word.length > 6) fontClass = 'text-xl sm:text-2xl';

              return (
                <div
                  key={word}
                  onClick={() => handlePlaySingleWord(word, idx)}
                  className={`group relative rounded-2xl bg-surface-container-low/60 hover:bg-white border-2 transition-all flex items-center justify-between px-3.5 py-4 cursor-pointer select-none ${
                    isPlaying
                      ? 'card-playing border-secondary ring-2 ring-secondary/30 scale-[1.02] bg-white'
                      : 'border-surface-container hover:border-primary shadow-2xs hover:shadow-md hover:-translate-y-0.5'
                  }`}
                >
                  <span
                    className={`font-black text-on-surface group-hover:text-primary tracking-tight leading-none transition-transform duration-200 ${fontClass}`}
                  >
                    {word}
                  </span>

                  <span className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary transition-colors shadow-2xs shrink-0">
                    <span className="material-symbols-outlined text-[15px]">
                      volume_up
                    </span>
                  </span>
                </div>
              );
            })}
          </div>

          {/* Thanh Câu Ví Dụ Tương Tác Gọn Gàng */}
          <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">record_voice_over</span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider block">
                  Câu ví dụ Nhóm {currentGroup}:
                </span>
                <p className="text-sm sm:text-base font-bold text-on-surface truncate">
                  "{groupData.sentence}"
                </p>
              </div>
            </div>
            <button
              onClick={handlePlaySentence}
              className="px-4 py-2 rounded-xl bg-secondary-container text-on-secondary-container text-xs font-extrabold flex items-center justify-center gap-1.5 hover:bg-secondary hover:text-on-secondary transition-all shadow-2xs shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">volume_up</span>
              <span>Nghe câu ví dụ</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
