import { useState, useEffect, useRef } from 'react';
import { PHONICS_42_SOUNDS, PHONICS_GROUPS, PhonicsSound } from '../data/phonicsData';
import { speakPhonicsSound } from '../utils/audioPlayer';
import {
  CustomAudioRecord,
  saveCustomAudio,
  blobToBase64,
  getDefaultPhonicsAudio,
} from '../utils/audioStorage';
import {
  initVideoStorage,
  getLoadedAltSetVideos,
  saveAltSetVideo,
  deleteAltSetVideo,
  subscribeVideoUpdates,
  getPhonicsGroupVideoKey,
  autoDistributeGroupVideos,
  LoadedVideoItem,
} from '../utils/videoStorage';
import {
  getThumbnailForPhonicsSound,
  findMatchingTongueTwisterRecordId,
  loadFastSoundThumbnailsMap,
  invalidateVideoFrameCache,
} from '../utils/videoFrameExtractor';
import {
  readImageFileAsDataUrl,
  loadAllShadowImages,
  savePhonics42SoundImage,
  getPhonics42ImageKey,
  matchSoundIdFromImageFilename,
} from '../utils/shadowImageStorage';
import { TongueTwisterIllustration } from './TongueTwisterIllustration';

interface Phonics42SectionProps {
  onSelectSound: (sound: PhonicsSound) => void;
  customAudios: Map<string, CustomAudioRecord>;
  onOpenAudioManager: () => void;
  onRefreshAudios: () => void;
  isLoggedIn?: boolean;
  hasPurchasedCourse?: boolean;
  onRequireRegister?: () => void;
  onRequirePurchase?: () => void;
}

export function Phonics42Section({
  onSelectSound,
  customAudios,
  onOpenAudioManager,
  onRefreshAudios,
  isLoggedIn = false,
  hasPurchasedCourse = false,
  onRequireRegister,
  onRequirePurchase,
}: Phonics42SectionProps) {
  // Mặc định hiển thị gọn theo từng Nhóm (Nhóm 1) thay vì trải dài cả 42 thẻ lớn
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<number | 'all'>(1);
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);
  const cardFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const cardImageInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Ảnh đại diện cho từng âm trong 42 âm
  const [soundThumbnailsMap, setSoundThumbnailsMap] = useState<Record<string, string>>({});
  const [dedicatedSoundImgsMap, setDedicatedSoundImgsMap] = useState<Record<string, string>>({});
  const [isBatchImgUploading, setIsBatchImgUploading] = useState(false);
  const [isImgDragOver, setIsImgDragOver] = useState(false);
  const [showImageDistributor, setShowImageDistributor] = useState(false);

  const batchSoundImageInputRef = useRef<HTMLInputElement | null>(null);
  const pendingImageGroupTargetRef = useRef<number | 'auto'>('auto');

  // Quản lý video học từng Nhóm âm (Nhóm 1 -> Nhóm 7)
  const [groupVideosMap, setGroupVideosMap] = useState<Record<number, LoadedVideoItem[]>>({});
  const [collapsedGroupVideos, setCollapsedGroupVideos] = useState<Record<number, boolean>>({});
  const [activeGroupVideoIdx, setActiveGroupVideoIdx] = useState<Record<number, number>>({});
  const [isGroupBatchUploading, setIsGroupBatchUploading] = useState(false);
  const [groupVideoToast, setGroupVideoToast] = useState<string | null>(null);

  const groupVideoInputRef = useRef<HTMLInputElement | null>(null);
  const batchGroupVideoInputRef = useRef<HTMLInputElement | null>(null);
  const pendingGroupUploadRef = useRef<{
    groupId: number;
    mode: 'replace' | 'append';
    replaceIdx?: number;
  }>({ groupId: 1, mode: 'replace' });

  const refreshPhonicsGroupVideos = async () => {
    const next: Record<number, LoadedVideoItem[]> = {};
    for (let g = 1; g <= 7; g++) {
      next[g] = getLoadedAltSetVideos(getPhonicsGroupVideoKey(g));
    }
    setGroupVideosMap(next);

    // Nạp nhanh toàn bộ ảnh đã lưu trong 1 lần đọc duy nhất
    const [fastMap, allShadow] = await Promise.all([
      loadFastSoundThumbnailsMap(),
      loadAllShadowImages(),
    ]);
    const dedicatedOnly: Record<string, string> = {};
    for (const s of PHONICS_42_SOUNDS) {
      const k = getPhonics42ImageKey(s.id);
      if (allShadow[k]) {
        dedicatedOnly[s.id] = allShadow[k];
      }
    }
    setDedicatedSoundImgsMap(dedicatedOnly);
    setSoundThumbnailsMap((prev) => ({ ...prev, ...fastMap }));
  };

  // Chỉ trích xuất khung hình cho nhóm đang hiển thị nếu âm đó có video riêng nhưng chưa có ảnh lưu sẵn
  useEffect(() => {
    let cancelled = false;
    const extractActiveGroupFrames = async () => {
      if (selectedGroupFilter === 'all') return;
      const shadowImgs = await loadAllShadowImages();
      const grpSounds = PHONICS_42_SOUNDS.filter(
        (s) => s.group === selectedGroupFilter
      );
      for (let idx = 0; idx < grpSounds.length; idx++) {
        if (cancelled) return;
        const s = grpSounds[idx];
        const thumb = await getThumbnailForPhonicsSound(
          s.id,
          selectedGroupFilter,
          idx,
          shadowImgs
        );
        if (!cancelled && thumb) {
          setSoundThumbnailsMap((prev) =>
            prev[s.id] === thumb ? prev : { ...prev, [s.id]: thumb }
          );
        }
      }
    };
    extractActiveGroupFrames();
    return () => {
      cancelled = true;
    };
  }, [selectedGroupFilter]);

  useEffect(() => {
    let mounted = true;
    initVideoStorage().then(() => {
      if (mounted) refreshPhonicsGroupVideos();
    });

    const unsub = subscribeVideoUpdates(() => {
      invalidateVideoFrameCache();
      if (mounted) refreshPhonicsGroupVideos();
    });

    const onShadowImgUpdated = () => {
      invalidateVideoFrameCache();
      if (mounted) refreshPhonicsGroupVideos();
    };
    window.addEventListener('phonics-shadow-image-updated', onShadowImgUpdated);

    return () => {
      mounted = false;
      unsub();
      window.removeEventListener('phonics-shadow-image-updated', onShadowImgUpdated);
    };
  }, []);

  /**
   * Kiểm tra nút "Học âm" có được mở vào học trực tiếp hay không:
   * - Đã kích hoạt mã code Magic (hasPurchasedCourse): mở toàn bộ 42 âm
   * - Chưa kích hoạt: Mở đúng 1 nhóm âm đầu tiên (Nhóm 1), bấm sang Nhóm 2-7 mở bảng Đăng ký MAGIC SOUNDS
   */
  const canEnterSoundLesson = (groupId: number, _indexInGroup: number): boolean => {
    if (hasPurchasedCourse) return true;
    return groupId === 1;
  };

  const triggerGroupVideoUpload = (
    groupId: number,
    mode: 'replace' | 'append' = 'replace',
    replaceIdx?: number
  ) => {
    pendingGroupUploadRef.current = { groupId, mode, replaceIdx };
    if (groupVideoInputRef.current) {
      groupVideoInputRef.current.value = '';
      groupVideoInputRef.current.click();
    }
  };

  const handleGroupVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const { groupId, mode, replaceIdx } = pendingGroupUploadRef.current;
    const key = getPhonicsGroupVideoKey(groupId);
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
      await refreshPhonicsGroupVideos();
      setCollapsedGroupVideos((prev) => ({ ...prev, [groupId]: false }));
      setGroupVideoToast(`Đã gắn video học vào Nhóm ${groupId} thành công!`);
      setTimeout(() => setGroupVideoToast(null), 4000);
    } catch (err) {
      console.error(err);
    }
    e.target.value = '';
  };

  const handleBatchGroupVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsGroupBatchUploading(true);
    try {
      const report = await autoDistributeGroupVideos(files, 'phonics-7-groups');
      await refreshPhonicsGroupVideos();
      setGroupVideoToast(
        `Đã tự động phân phối ${report.totalFiles} video về chuẩn vị trí 7 Nhóm Âm!`
      );
      setTimeout(() => setGroupVideoToast(null), 4500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGroupBatchUploading(false);
      e.target.value = '';
    }
  };

  const handleDeletePhonicsGroupVideo = async (groupId: number, idx?: number) => {
    if (!window.confirm(`Xóa video bài học của Nhóm ${groupId}?`)) return;
    await deleteAltSetVideo(getPhonicsGroupVideoKey(groupId), idx);
    setActiveGroupVideoIdx((prev) => ({ ...prev, [groupId]: 0 }));
    await refreshPhonicsGroupVideos();
  };

  const handlePlaySound = (sound: PhonicsSound, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlayingSoundId(sound.id);
    speakPhonicsSound(
      sound.sound,
      sound.ipa,
      `${sound.nameEn} (${sound.nameVi})`,
      sound.spokenText,
      () => setPlayingSoundId(null),
      sound.id
    );
  };

  const handleQuickUpload = async (soundId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await blobToBase64(file);
      await saveCustomAudio(soundId, {
        audioData: base64,
        fileName: file.name,
        sourceType: 'upload',
      });
      onRefreshAudios();
    } catch (err) {
      console.error(err);
    }
    e.target.value = '';
  };

  const handleCardImageUpload = async (
    soundId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      await savePhonics42SoundImage(soundId, dataUrl);
      setSoundThumbnailsMap((prev) => ({ ...prev, [soundId]: dataUrl }));
      setDedicatedSoundImgsMap((prev) => ({ ...prev, [soundId]: dataUrl }));
      window.dispatchEvent(new CustomEvent('phonics-shadow-image-updated'));
    } catch (err) {
      console.error(err);
    }
    e.target.value = '';
  };

  /**
   * Tự động phân phối 1 loạt ảnh đại diện cho các âm trong 42 Sounds
   */
  const handleBatchSoundImagesFiles = async (
    fileList: FileList | File[],
    forcedGroup?: number | 'auto'
  ) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;

    // Sắp xếp tự nhiên theo tên file (VD: 1, 2, 3... hoặc Screenshot theo thứ tự thời gian)
    files.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );

    setIsBatchImgUploading(true);
    try {
      const allSoundIds = PHONICS_42_SOUNDS.map((s) => s.id);
      const targetMode = forcedGroup ?? pendingImageGroupTargetRef.current;

      // Xác định danh sách âm ưu tiên điền tuần tự khi file không đặt tên theo âm
      let sequentialPool: string[] = [];
      if (typeof targetMode === 'number') {
        const grpIds = PHONICS_42_SOUNDS.filter((s) => s.group === targetMode).map(
          (s) => s.id
        );
        const restIds = allSoundIds.filter((id) => !grpIds.includes(id));
        sequentialPool = [...grpIds, ...restIds];
      } else if (files.length <= 6 && typeof selectedGroupFilter === 'number') {
        const grpIds = PHONICS_42_SOUNDS.filter(
          (s) => s.group === selectedGroupFilter
        ).map((s) => s.id);
        const emptyInGrp = grpIds.filter((id) => !dedicatedSoundImgsMap[id]);
        const filledInGrp = grpIds.filter((id) => !!dedicatedSoundImgsMap[id]);
        const restIds = allSoundIds.filter((id) => !grpIds.includes(id));
        sequentialPool = [...emptyInGrp, ...filledInGrp, ...restIds];
      } else {
        const emptyAll = allSoundIds.filter((id) => !dedicatedSoundImgsMap[id]);
        const filledAll = allSoundIds.filter((id) => !!dedicatedSoundImgsMap[id]);
        sequentialPool = [...emptyAll, ...filledAll];
      }

      const usedInThisBatch = new Set<string>();
      const pendingSequentialFiles: File[] = [];
      const updatedMap: Record<string, string> = {};

      // Bước 1: Khớp các file có tên âm rõ ràng trước (chỉ khi không ép cứng 1 nhóm 6 ảnh)
      for (const file of files) {
        if (typeof targetMode === 'number' && files.length <= 6) {
          pendingSequentialFiles.push(file);
          continue;
        }
        const matched = matchSoundIdFromImageFilename(file.name, allSoundIds);
        if (matched && !usedInThisBatch.has(matched.soundId)) {
          const dataUrl = await readImageFileAsDataUrl(file);
          await savePhonics42SoundImage(matched.soundId, dataUrl);
          usedInThisBatch.add(matched.soundId);
          updatedMap[matched.soundId] = dataUrl;
        } else {
          pendingSequentialFiles.push(file);
        }
      }

      // Bước 2: Phân phối các file còn lại theo thứ tự vào các âm chưa nhận trong đợt này
      const remainingTargets = sequentialPool.filter((id) => !usedInThisBatch.has(id));
      for (let i = 0; i < pendingSequentialFiles.length; i++) {
        const targetSoundId =
          remainingTargets[i] || allSoundIds[i % allSoundIds.length];
        if (!targetSoundId) continue;
        const dataUrl = await readImageFileAsDataUrl(pendingSequentialFiles[i]);
        await savePhonics42SoundImage(targetSoundId, dataUrl);
        usedInThisBatch.add(targetSoundId);
        updatedMap[targetSoundId] = dataUrl;
      }

      setSoundThumbnailsMap((prev) => ({ ...prev, ...updatedMap }));
      setDedicatedSoundImgsMap((prev) => ({ ...prev, ...updatedMap }));
      window.dispatchEvent(new CustomEvent('phonics-shadow-image-updated'));

      const assignedSoundNames = Array.from(usedInThisBatch)
        .slice(0, 8)
        .map((id) => {
          const s = PHONICS_42_SOUNDS.find((item) => item.id === id);
          return s ? `/${s.sound}/` : id;
        })
        .join(', ');

      setGroupVideoToast(
        `Đã tự động phân phối ${files.length} ảnh đại diện vào các âm: ${assignedSoundNames}${
          usedInThisBatch.size > 8 ? ` (+${usedInThisBatch.size - 8} âm khác)` : ''
        }!`
      );
      setShowImageDistributor(true);
      setTimeout(() => setGroupVideoToast(null), 6000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBatchImgUploading(false);
      pendingImageGroupTargetRef.current = 'auto';
    }
  };

  /**
   * Đổi/Hoán đổi vị trí ảnh đại diện từ âm này sang âm khác
   */
  const handleSwapSoundImage = async (fromSoundId: string, toSoundId: string) => {
    if (!fromSoundId || !toSoundId || fromSoundId === toSoundId) return;
    const fromImg = soundThumbnailsMap[fromSoundId] || '';
    const toImg = soundThumbnailsMap[toSoundId] || '';
    if (!fromImg) return;

    await savePhonics42SoundImage(toSoundId, fromImg);
    if (toImg) {
      await savePhonics42SoundImage(fromSoundId, toImg);
    }

    setSoundThumbnailsMap((prev) => ({
      ...prev,
      [toSoundId]: fromImg,
      ...(toImg ? { [fromSoundId]: toImg } : {}),
    }));
    setDedicatedSoundImgsMap((prev) => ({
      ...prev,
      [toSoundId]: fromImg,
      ...(toImg ? { [fromSoundId]: toImg } : {}),
    }));
    window.dispatchEvent(new CustomEvent('phonics-shadow-image-updated'));
  };

  const uploadedCount = PHONICS_42_SOUNDS.filter(
    (s) => customAudios.has(s.id) || !!getDefaultPhonicsAudio(s.id)
  ).length;
  const uploadedDedicatedImgCount = Object.keys(dedicatedSoundImgsMap).length;

  // Group sounds for rendering
  const displayedGroups =
    selectedGroupFilter === 'all'
      ? PHONICS_GROUPS
      : PHONICS_GROUPS.filter((g) => g.id === selectedGroupFilter);

  return (
    <section className="w-full py-2" id="bang-42-am">
      <div className="w-full space-y-5">
        {/* Hidden input cho tải loạt ảnh đại diện từng âm */}
        <input
          ref={batchSoundImageInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleBatchSoundImagesFiles(e.target.files);
            }
            e.target.value = '';
          }}
          className="hidden"
        />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e13829] text-white font-black text-base sm:text-lg shadow-[0_3px_0_#991b1b]">
              <span className="material-symbols-outlined text-lg">
                graphic_eq
              </span>
              <span>42 Sounds: 42 âm cơ bản</span>
            </h2>
          </div>

          {/* Hidden inputs for Group Videos */}
          <input
            ref={groupVideoInputRef}
            type="file"
            multiple
            accept="video/mp4,video/quicktime,video/webm,video/ogg,video/*"
            onChange={handleGroupVideoFileChange}
            className="hidden"
          />
          <input
            ref={batchGroupVideoInputRef}
            type="file"
            multiple
            accept="video/mp4,video/quicktime,video/webm,video/ogg,video/*"
            onChange={handleBatchGroupVideoChange}
            className="hidden"
          />
        </div>

        {/* Thanh Chọn 7 Nhóm Âm Gọn Gàng + Nút Xem Bảng Tổng Hợp 42 Âm */}
        <div className="bg-surface-container-low p-2 rounded-2xl border border-surface-container flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 flex-1">
            {PHONICS_GROUPS.map((grp) => {
              const isSelected = selectedGroupFilter === grp.id;
              const isLockedGrp = !hasPurchasedCourse && grp.id > 1;
              const grpSoundsLabel = PHONICS_42_SOUNDS.filter((s) => s.group === grp.id)
                .map((s) => s.sound)
                .join(', ');
              return (
                <button
                  key={grp.id}
                  onClick={() => {
                    if (isLockedGrp) {
                      onRequirePurchase?.();
                      return;
                    }
                    setSelectedGroupFilter(grp.id);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'text-white shadow-sm scale-[1.02]'
                      : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container-high border-surface-container'
                  }`}
                  style={
                    isSelected
                      ? { backgroundColor: grp.color, borderColor: grp.color }
                      : undefined
                  }
                >
                  {isLockedGrp ? (
                    <span className="material-symbols-outlined text-[13px] text-stone-500">
                      lock
                    </span>
                  ) : (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: isSelected ? '#ffffff' : grp.color }}
                    />
                  )}
                  <span>{grp.shortName}:</span>
                  <span className={isSelected ? 'text-white/95 font-bold' : 'text-on-surface-variant font-semibold'}>
                    {grpSoundsLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {groupVideoToast && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              <span>{groupVideoToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setGroupVideoToast(null)}
              className="text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        )}

        {/* CHẾ ĐỘ 1: HIỂN THỊ BẢNG TỔNG HỢP 42 ÂM SIÊU GỌN (7 HÀNG x 6 Ô) */}
        {selectedGroupFilter === 'all' ? (
          <div className="bg-surface-container-lowest rounded-3xl p-4 sm:p-5 border border-surface-container shadow-xs space-y-2.5">
            {PHONICS_GROUPS.map((group) => {
              const groupSounds = PHONICS_42_SOUNDS.filter((s) => s.group === group.id);
              return (
                <div
                  key={group.id}
                  className="flex flex-col lg:flex-row lg:items-center gap-2.5 p-2.5 rounded-2xl bg-surface-container-low/60 border border-surface-container"
                >
                  {/* Nhãn Nhóm bên trái */}
                  <button
                    type="button"
                    onClick={() => setSelectedGroupFilter(group.id)}
                    className="lg:w-44 shrink-0 flex items-center justify-between lg:justify-start gap-2 px-3 py-2 rounded-xl text-left font-extrabold text-xs text-white shadow-2xs hover:opacity-95 transition-opacity cursor-pointer"
                    style={{ backgroundColor: group.color }}
                    title={`Mở chi tiết ${group.name}`}
                  >
                    <span>{group.shortName}</span>
                    <span className="material-symbols-outlined text-[15px] ml-auto">
                      open_in_new
                    </span>
                  </button>

                  {/* 6 Ô Âm thu gọn trên 1 hàng */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 flex-1">
                    {groupSounds.map((sound, idxInGroup) => {
                      const isPlaying = playingSoundId === sound.id;
                      const isAllowed = canEnterSoundLesson(group.id, idxInGroup);
                      return (
                        <div
                          key={sound.id}
                          onClick={() => {
                            if (isAllowed) {
                              onSelectSound(sound);
                            } else {
                              if (!isLoggedIn && group.id === 1) {
                                onRequireRegister?.();
                              } else {
                                onRequirePurchase?.();
                              }
                            }
                          }}
                          className={`bg-surface-container-lowest hover:bg-primary/5 rounded-xl px-2.5 py-2 border border-surface-container hover:border-primary/40 transition-all cursor-pointer flex items-center justify-between gap-1.5 shadow-2xs ${
                            isPlaying ? 'ring-2 ring-primary' : ''
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-baseline gap-1">
                              <span className="font-black text-lg sm:text-xl text-primary leading-none">
                                {sound.sound}
                              </span>
                              <span className="text-[10px] text-on-surface-variant font-mono">
                                {sound.ipa}
                              </span>
                            </div>
                            <p className="text-[10px] font-semibold text-on-surface-variant truncate mt-0.5">
                              {sound.nameVi}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              if (!isAllowed) {
                                e.stopPropagation();
                                if (!isLoggedIn && group.id === 1) {
                                  onRequireRegister?.();
                                } else {
                                  onRequirePurchase?.();
                                }
                                return;
                              }
                              handlePlaySound(sound, e);
                            }}
                            className="w-7 h-7 rounded-full bg-secondary-container/80 hover:bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 cursor-pointer"
                            title={
                              isAllowed
                                ? `Nghe âm /${sound.sound}/`
                                : 'Bấm để đăng ký mở khoá học âm này'
                            }
                          >
                            <span className="material-symbols-outlined text-[15px]">
                              {isAllowed ? 'volume_up' : 'lock'}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* CHẾ ĐỘ 2 (MẶC ĐỊNH): HIỂN THỊ GỌN GÀNG 1 NHÓM ĐANG CHỌN (6 ÂM TRÊN 1 HÀNG) */
          <div className="space-y-6">
            {displayedGroups.map((group) => {
              const groupSounds = PHONICS_42_SOUNDS.filter((s) => s.group === group.id);
              const grpVideos = groupVideosMap[group.id] || [];
              const activeVIdx = Math.min(
                activeGroupVideoIdx[group.id] || 0,
                Math.max(0, grpVideos.length - 1)
              );
              const currentGrpVideo = grpVideos[activeVIdx];
              const isCollapsed = !!collapsedGroupVideos[group.id];

              return (
                <div
                  key={group.id}
                  className="bg-surface-container-lowest rounded-3xl p-4 sm:p-5 border border-surface-container shadow-xs space-y-4"
                >
                  {/* Group Title */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-container">
                    <h3 className="text-base sm:text-lg font-extrabold text-on-surface">
                      {group.name}
                    </h3>
                  </div>

                  {/* Khung phát Video Học Nhóm Âm (nếu Nhóm đã được gắn video) */}
                  {currentGrpVideo && !isCollapsed && (
                    <div
                      className="p-3.5 rounded-2xl bg-surface-container-low border space-y-2.5"
                      style={{ borderColor: `${group.color}40` }}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="material-symbols-outlined text-lg"
                            style={{ color: group.color }}
                          >
                            smart_display
                          </span>
                          <span className="text-xs font-black text-on-surface">
                            Video Bài Học {group.name}
                          </span>
                        </div>

                        {grpVideos.length > 1 && (
                          <div className="flex items-center gap-1.5">
                            {grpVideos.map((v, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() =>
                                  setActiveGroupVideoIdx((prev) => ({ ...prev, [group.id]: idx }))
                                }
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                  activeVIdx === idx
                                    ? 'bg-primary text-white'
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
                          key={currentGrpVideo.playUrl}
                          src={currentGrpVideo.playUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* 6 Compact Sound Cards Grid (1 hàng gọn gàng trên Desktop) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {groupSounds.map((sound, idxInGroup) => {
                      const isPlaying = playingSoundId === sound.id;
                      const customRec = customAudios.get(sound.id) || getDefaultPhonicsAudio(sound.id);
                      const isAllowed = canEnterSoundLesson(group.id, idxInGroup);
                      const videoCutImg = soundThumbnailsMap[sound.id];
                      const ttRecordId = findMatchingTongueTwisterRecordId(sound.id);

                      const handleCardOrButtonClick = () => {
                        if (isAllowed) {
                          onSelectSound(sound);
                        } else if (!isLoggedIn && group.id === 1) {
                          onRequireRegister?.();
                        } else {
                          onRequirePurchase?.();
                        }
                      };

                      return (
                        <div
                          key={sound.id}
                          onClick={handleCardOrButtonClick}
                          className={`bg-surface-container-low/50 hover:bg-surface-container-low rounded-2xl p-3 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative border border-surface-container cursor-pointer ${
                            isPlaying ? 'card-playing ring-2 ring-primary' : ''
                          }`}
                          style={{ borderTopWidth: '3px', borderTopColor: group.color }}
                        >
                          <div>
                            {/* Top Phoneme & Speaker */}
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-baseline gap-1">
                                <span className="font-black text-3xl text-primary leading-none">
                                  {sound.sound}
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-surface-container text-[10px] text-on-surface-variant font-bold">
                                  {sound.ipa}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  if (!isAllowed) {
                                    e.stopPropagation();
                                    onRequirePurchase?.();
                                    return;
                                  }
                                  handlePlaySound(sound, e);
                                }}
                                className={`w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xs shrink-0 cursor-pointer ${
                                  isPlaying ? 'btn-playing ring-2 ring-secondary' : ''
                                }`}
                                title={
                                  isAllowed
                                    ? `Nghe âm /${sound.sound}/ ${customRec ? `(${customRec.fileName})` : '(Giọng máy)'}`
                                    : 'Bấm để đăng ký mở khoá học âm này'
                                }
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  {isAllowed ? 'volume_up' : 'lock'}
                                </span>
                              </button>
                            </div>

                            {/* Hình đại diện từng âm - Tự động co giãn chuẩn khung theo tỷ lệ ảnh gốc, không cắt mất chữ */}
                            <div
                              className={`my-2 w-full rounded-xl bg-white flex items-center justify-center overflow-hidden border border-surface-container relative ${
                                videoCutImg ? '' : 'h-24'
                              }`}
                            >
                              <input
                                type="file"
                                ref={(el) => {
                                  cardImageInputRefs.current[sound.id] = el;
                                }}
                                onChange={(e) => handleCardImageUpload(sound.id, e)}
                                accept="image/*"
                                className="hidden"
                              />

                              {videoCutImg ? (
                                <img
                                  src={videoCutImg}
                                  alt={sound.nameVi}
                                  className="w-full h-auto object-contain block"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full relative">
                                  <TongueTwisterIllustration
                                    recordId={ttRecordId}
                                    soundTitle={`/${sound.sound}/`}
                                    className="w-full h-full object-cover"
                                  />
                                  {/* Biểu tượng phát ra âm nhỏ màu đỏ góc phải dưới giống trong video */}
                                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-full bg-[#e11d48] text-white text-[10px] font-black shadow-xs flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-[10px]">
                                      volume_up
                                    </span>
                                    <span>{sound.sound}</span>
                                  </span>
                                </div>
                              )}

                              {/* Nút nhỏ góc trái để đổi/dán hình đại diện của âm nếu muốn */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cardImageInputRefs.current[sound.id]?.click();
                                }}
                                title={`Đổi ảnh đại diện cho âm /${sound.sound}/`}
                                className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black/55 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[13px]">
                                  add_photo_alternate
                                </span>
                              </button>

                              {customRec && (
                                <span
                                  className="absolute top-1 right-1 bg-group-ai-j-oa-ie-ee-or text-white px-1.5 py-0.5 rounded-full text-[8px] font-extrabold shadow-2xs flex items-center gap-0.5"
                                  title={`Đã tải file chuẩn: ${customRec.fileName}`}
                                >
                                  <span className="material-symbols-outlined text-[9px]">
                                    music_note
                                  </span>
                                  <span>Chuẩn</span>
                                </span>
                              )}
                            </div>

                            {/* Vietnamese Name & English word on 1 compact block */}
                            <p className="text-xs font-extrabold text-on-surface text-center capitalize truncate">
                              {sound.nameVi}{' '}
                              <span className="font-normal text-on-surface-variant/80 italic">
                                ({sound.nameEn})
                              </span>
                            </p>
                          </div>

                          {/* Bottom Action Buttons: Vẫn có nút Học âm, nếu khoá thì hiện cái khoá trên nút Học âm */}
                          <div
                            className="mt-2.5 flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="file"
                              ref={(el) => {
                                cardFileInputRefs.current[sound.id] = el;
                              }}
                              onChange={(e) => handleQuickUpload(sound.id, e)}
                              accept="audio/*"
                              className="hidden"
                            />

                            <button
                              type="button"
                              onClick={handleCardOrButtonClick}
                              className="flex-1 py-1.5 bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer group-hover:bg-primary group-hover:text-on-primary"
                            >
                              {!isAllowed && (
                                <span className="material-symbols-outlined text-[13px]">
                                  lock
                                </span>
                              )}
                              <span>Học âm</span>
                              {isAllowed && (
                                <span className="material-symbols-outlined text-[14px]">
                                  arrow_forward
                                </span>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => cardFileInputRefs.current[sound.id]?.click()}
                              className="p-1.5 rounded-xl bg-surface-container hover:bg-secondary-container hover:text-on-secondary-container text-on-surface-variant transition-colors cursor-pointer"
                              title={`Tải file âm thanh chuẩn cho âm /${sound.sound}/`}
                            >
                              <span className="material-symbols-outlined text-[15px]">
                                upload
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
