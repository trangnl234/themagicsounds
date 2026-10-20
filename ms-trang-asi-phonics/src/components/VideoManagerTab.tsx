import { useState, useEffect, useRef } from 'react';
import { PHONICS_42_SOUNDS, PHONICS_GROUPS } from '../data/phonicsData';
import { ALTERNATIVE_SPELLINGS_DATA } from '../data/alternativeSpellingsData';
import {
  initVideoStorage,
  getAllLoadedVideos,
  getLoadedAltSetVideos,
  saveSoundVideo,
  deleteSoundVideo,
  saveAltSetVideo,
  deleteAltSetVideo,
  autoDistributeVideoBatch,
  subscribeVideoUpdates,
  LoadedSoundVideos,
} from '../utils/videoStorage';

interface VideoManagerTabProps {
  searchQuery: string;
}

export function VideoManagerTab({ searchQuery }: VideoManagerTabProps) {
  const [loadedVideos, setLoadedVideos] = useState<Map<string, LoadedSoundVideos>>(new Map());
  const [subTab, setSubTab] = useState<'phonics42' | 'altSets'>('phonics42');
  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>('all');
  const [previewVideo, setPreviewVideo] = useState<{ title: string; url: string } | null>(null);
  const [uploadingTarget, setUploadingTarget] = useState<{
    id: string;
    type: 'action' | 'mouth' | 'alt';
  } | null>(null);
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [batchMessage, setBatchMessage] = useState<string | null>(null);

  // File inputs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const batchFileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingTargetRef = useRef<{
    id: string;
    type: 'action' | 'mouth' | 'alt';
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    initVideoStorage().then((map) => {
      if (mounted) setLoadedVideos(new Map(map));
    });

    const unsub = subscribeVideoUpdates(() => {
      setLoadedVideos(new Map(getAllLoadedVideos()));
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const handleSelectUpload = (id: string, type: 'action' | 'mouth' | 'alt') => {
    pendingTargetRef.current = { id, type };
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = pendingTargetRef.current;
    if (!file || !target) return;

    setUploadingTarget(target);
    try {
      if (target.type === 'alt') {
        await saveAltSetVideo(target.id, file, file.name, 'replace');
      } else {
        await saveSoundVideo(target.id, target.type, file, file.name);
      }
      setLoadedVideos(new Map(getAllLoadedVideos()));
    } catch (err) {
      console.error('Error saving video:', err);
    } finally {
      setUploadingTarget(null);
      pendingTargetRef.current = null;
      e.target.value = '';
    }
  };

  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsBatchUploading(true);
    try {
      const scope = subTab === 'altSets' ? 'alt-only' : 'all';
      const report = await autoDistributeVideoBatch(files, scope);
      setLoadedVideos(new Map(getAllLoadedVideos()));
      setBatchMessage(
        `Đã tự động phân phối ${report.totalFiles} video (${report.altSetCount} video Set Âm Thay Thế, ${report.phonicsActionCount} video Hành Động, ${report.phonicsMouthCount} video Khẩu Hình)!`
      );
      setTimeout(() => setBatchMessage(null), 6000);
    } catch (err) {
      console.error('Batch video distribution error:', err);
    } finally {
      setIsBatchUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string, type: 'action' | 'mouth' | 'alt', name: string) => {
    const label =
      type === 'action' ? 'hành động' : type === 'mouth' ? 'khẩu hình' : 'Set âm thay thế';
    if (!window.confirm(`Xóa video ${label} của ${name}?`)) return;

    try {
      if (type === 'alt') {
        await deleteAltSetVideo(id);
      } else {
        await deleteSoundVideo(id, type);
      }
      setLoadedVideos(new Map(getAllLoadedVideos()));
    } catch (err) {
      console.error('Error deleting video:', err);
    }
  };

  // Filter 42 sounds
  const filteredSounds = PHONICS_42_SOUNDS.filter((sound) => {
    const matchGroup = selectedGroup === 'all' || sound.group === selectedGroup;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchGroup;
    return (
      matchGroup &&
      (sound.sound.toLowerCase().includes(q) ||
        sound.nameVi.toLowerCase().includes(q) ||
        sound.nameEn.toLowerCase().includes(q) ||
        sound.id.toLowerCase().includes(q))
    );
  });

  // Filter 8 Alternative Spelling Sets
  const filteredAltSets = ALTERNATIVE_SPELLINGS_DATA.filter((topic) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      topic.soundTitle.toLowerCase().includes(q) ||
      topic.id.toLowerCase().includes(q) ||
      topic.desc.toLowerCase().includes(q) ||
      topic.items.some((it) => it.grapheme.toLowerCase().includes(q))
    );
  });

  // Calculate stats
  let totalActionCount = 0;
  let totalMouthCount = 0;
  for (const s of PHONICS_42_SOUNDS) {
    const v = loadedVideos.get(s.id);
    if (v?.actionVideo) totalActionCount++;
    if (v?.mouthVideo) totalMouthCount++;
  }

  const totalAltSetsWithVideo = ALTERNATIVE_SPELLINGS_DATA.filter(
    (t) => getLoadedAltSetVideos(t.id).length > 0
  ).length;

  return (
    <div className="flex flex-col gap-3 flex-1 overflow-hidden">
      {/* Ẩn input file */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/ogg,video/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={batchFileInputRef}
        type="file"
        multiple
        accept="video/mp4,video/quicktime,video/webm,video/ogg,video/*"
        onChange={handleBatchUpload}
        className="hidden"
      />

      {/* Thanh thống kê + Nút Tải Cả Kho Video Tự Động Phân Phối */}
      <div className="p-3.5 rounded-2xl bg-surface-container-low border border-primary/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setSubTab('phonics42')}
            className={`px-3 py-1.5 rounded-xl font-black flex items-center gap-2 cursor-pointer transition-all ${
              subTab === 'phonics42'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span>42 Âm Cơ Bản</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
              HĐ: {totalActionCount}/42 • KH: {totalMouthCount}/42
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('altSets')}
            className={`px-3 py-1.5 rounded-xl font-black flex items-center gap-2 cursor-pointer transition-all ${
              subTab === 'altSets'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span>{ALTERNATIVE_SPELLINGS_DATA.length} Set Âm Thay Thế</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/20">
              {totalAltSetsWithVideo}/{ALTERNATIVE_SPELLINGS_DATA.length} Set
            </span>
          </button>
        </div>

        <button
          type="button"
          disabled={isBatchUploading}
          onClick={() => batchFileInputRef.current?.click()}
          className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
        >
          {isBatchUploading ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              <span>Đang phân phối kho video...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">drive_folder_upload</span>
              <span>Tải Cả Kho Video Lên (Tự Phân Phối)</span>
            </>
          )}
        </button>
      </div>

      {batchMessage && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between">
          <span>{batchMessage}</span>
          <button
            type="button"
            onClick={() => setBatchMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {subTab === 'phonics42' ? (
        <>
          {/* Bộ lọc nhóm 1 - 7 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
            <button
              onClick={() => setSelectedGroup('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedGroup === 'all'
                  ? 'bg-primary text-on-primary shadow-2xs'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Tất cả (42 âm)
            </button>
            {PHONICS_GROUPS.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGroup(g.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  selectedGroup === g.id
                    ? 'bg-primary text-on-primary shadow-2xs'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }}></span>
                <span>Nhóm {g.id}</span>
              </button>
            ))}
          </div>

          {/* Danh sách 42 âm và trạng thái 2 video */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredSounds.map((sound) => {
                const vRecord = loadedVideos.get(sound.id);
                const hasAction = !!vRecord?.actionVideo;
                const hasMouth = !!vRecord?.mouthVideo;
                const isUploadingThisAction =
                  uploadingTarget?.id === sound.id && uploadingTarget?.type === 'action';
                const isUploadingThisMouth =
                  uploadingTarget?.id === sound.id && uploadingTarget?.type === 'mouth';

                return (
                  <div
                    key={sound.id}
                    className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container hover:border-primary/30 flex flex-col justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shadow-xs"
                          style={{ backgroundColor: `${sound.groupColor}25`, color: sound.groupColor }}
                        >
                          {sound.sound}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-on-surface">
                              /{sound.sound}/ • {sound.nameVi}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-container font-mono text-primary font-bold">
                              {sound.ipa}
                            </span>
                          </div>
                          <span className="text-[10px] text-on-surface-variant">
                            Nhóm {sound.group}: {sound.groupName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Slot 1: Video Hành Động Âm */}
                      <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">accessibility_new</span>
                            <span>Bước 1: Hành Động</span>
                          </span>
                          {hasAction ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                              Đã có
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-200 text-stone-600 font-bold">
                              Trống
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 pt-1">
                          {hasAction ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewVideo({
                                    title: `Video Hành Động: /${sound.sound}/`,
                                    url: vRecord!.actionVideo!.playUrl,
                                  })
                                }
                                className="flex-1 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-xs">play_arrow</span>
                                <span>Xem</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectUpload(sound.id, 'action')}
                                className="p-1 rounded-lg text-primary hover:bg-primary/10 cursor-pointer"
                                title="Thay video"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(sound.id, 'action', `/${sound.sound}/`)}
                                className="p-1 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                                title="Xóa video"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              disabled={isUploadingThisAction}
                              onClick={() => handleSelectUpload(sound.id, 'action')}
                              className="w-full py-1.5 px-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                            >
                              {isUploadingThisAction ? (
                                <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-xs">upload</span>
                                  <span>Tải Video</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Slot 2: Video Khẩu Hình Miệng */}
                      <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-sky-900 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">record_voice_over</span>
                            <span>Bước 2: Khẩu Hình</span>
                          </span>
                          {hasMouth ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                              Đã có
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-200 text-stone-600 font-bold">
                              Trống
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 pt-1">
                          {hasMouth ? (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewVideo({
                                    title: `Video Khẩu Hình Miệng: /${sound.sound}/`,
                                    url: vRecord!.mouthVideo!.playUrl,
                                  })
                                }
                                className="flex-1 py-1 px-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-xs">play_arrow</span>
                                <span>Xem</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectUpload(sound.id, 'mouth')}
                                className="p-1 rounded-lg text-primary hover:bg-primary/10 cursor-pointer"
                                title="Thay video"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(sound.id, 'mouth', `/${sound.sound}/`)}
                                className="p-1 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                                title="Xóa video"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              disabled={isUploadingThisMouth}
                              onClick={() => handleSelectUpload(sound.id, 'mouth')}
                              className="w-full py-1.5 px-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                            >
                              {isUploadingThisMouth ? (
                                <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-xs">upload</span>
                                  <span>Tải Video</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* Danh sách 8 Set Âm Thay Thế */
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredAltSets.map((topic, idx) => {
              const altList = getLoadedAltSetVideos(topic.id);
              const primaryVideo = altList[0];
              const isUploadingThisAlt =
                uploadingTarget?.id === topic.id && uploadingTarget?.type === 'alt';

              return (
                <div
                  key={topic.id}
                  className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container hover:border-primary/30 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                      style={{ backgroundColor: `${topic.color}20`, color: topic.color }}
                    >
                      Set {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-black text-on-surface">
                          {topic.soundTitle}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container font-mono font-bold text-primary">
                          {topic.ipa}
                        </span>
                        {altList.length > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                            {altList.length} video
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-on-surface-variant truncate mt-0.5">
                        {topic.items.map((it) => it.grapheme).join(' • ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {primaryVideo ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewVideo({
                              title: `Set ${idx + 1}: ${topic.soundTitle}`,
                              url: primaryVideo.playUrl,
                            })
                          }
                          className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">play_arrow</span>
                          <span>Xem</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSelectUpload(topic.id, 'alt')}
                          className="p-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary cursor-pointer"
                          title="Đổi video"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(topic.id, 'alt', topic.soundTitle)}
                          className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                          title="Xóa video"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={isUploadingThisAlt}
                        onClick={() => handleSelectUpload(topic.id, 'alt')}
                        className="py-2 px-3.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {isUploadingThisAlt ? (
                          <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-sm">upload</span>
                            <span>Tải Video Set</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal xem trước video */}
      {previewVideo && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-surface-container-lowest max-w-xl w-full rounded-3xl p-5 shadow-2xl border border-surface-container flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <h4 className="text-sm font-bold text-on-surface">{previewVideo.title}</h4>
              <button
                onClick={() => setPreviewVideo(null)}
                className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center">
              <video
                src={previewVideo.url}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
