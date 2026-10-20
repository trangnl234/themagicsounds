import { useState, useEffect, useRef } from 'react';
import { PhonicsSound } from '../data/phonicsData';
import {
  initVideoStorage,
  getLoadedSoundVideos,
  saveSoundVideo,
  deleteSoundVideo,
  subscribeVideoUpdates,
  LoadedSoundVideos,
  LoadedVideoItem,
} from '../utils/videoStorage';

interface SoundVideosSectionProps {
  sound: PhonicsSound;
  step?: 1 | 2;
}

export function SoundVideosSection({ sound, step }: SoundVideosSectionProps) {
  const [videos, setVideos] = useState<LoadedSoundVideos | undefined>(undefined);
  const [isActionUploading, setIsActionUploading] = useState(false);
  const [isMouthUploading, setIsMouthUploading] = useState(false);
  const [showActionUrlInput, setShowActionUrlInput] = useState(false);
  const [showMouthUrlInput, setShowMouthUrlInput] = useState(false);
  const [actionUrlText, setActionUrlText] = useState('');
  const [mouthUrlText, setMouthUrlText] = useState('');
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // File input refs
  const actionFileInputRef = useRef<HTMLInputElement | null>(null);
  const mouthFileInputRef = useRef<HTMLInputElement | null>(null);

  // Video refs for speed and loop controls
  const actionVideoRef = useRef<HTMLVideoElement | null>(null);
  const mouthVideoRef = useRef<HTMLVideoElement | null>(null);

  const [actionRate, setActionRate] = useState<number>(1.0);
  const [mouthRate, setMouthRate] = useState<number>(1.0);
  const [actionLoop, setActionLoop] = useState<boolean>(true);
  const [mouthLoop, setMouthLoop] = useState<boolean>(true);

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    let mounted = true;
    initVideoStorage().then(() => {
      if (mounted) {
        setVideos(getLoadedSoundVideos(sound.id));
      }
    });

    const unsub = subscribeVideoUpdates((updatedId) => {
      if (updatedId === sound.id || updatedId === 'c-k') {
        setVideos(getLoadedSoundVideos(sound.id));
      }
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, [sound.id]);

  // Xử lý upload file video
  const handleFileUpload = async (file: File, type: 'action' | 'mouth') => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      notify('Vui lòng chọn tệp định dạng video (MP4, MOV, WebM,...)', 'error');
      return;
    }

    if (type === 'action') setIsActionUploading(true);
    else setIsMouthUploading(true);

    try {
      const updated = await saveSoundVideo(sound.id, type, file, file.name);
      setVideos(updated);
      notify(`Đã lưu video ${type === 'action' ? 'hành động' : 'khẩu hình'} thành công!`, 'success');
      if (type === 'action') setShowActionUrlInput(false);
      else setShowMouthUrlInput(false);
    } catch (err) {
      console.error(err);
      notify('Lỗi khi lưu video vào kho dữ liệu. Vui lòng thử lại!', 'error');
    } finally {
      if (type === 'action') setIsActionUploading(false);
      else setIsMouthUploading(false);
    }
  };

  // Xử lý lưu URL video
  const handleSaveUrl = async (type: 'action' | 'mouth') => {
    const url = type === 'action' ? actionUrlText.trim() : mouthUrlText.trim();
    if (!url) {
      notify('Vui lòng nhập đường dẫn URL video', 'error');
      return;
    }

    try {
      const updated = await saveSoundVideo(sound.id, type, url);
      setVideos(updated);
      notify(`Đã lưu liên kết video ${type === 'action' ? 'hành động' : 'khẩu hình'}!`, 'success');
      if (type === 'action') {
        setShowActionUrlInput(false);
        setActionUrlText('');
      } else {
        setShowMouthUrlInput(false);
        setMouthUrlText('');
      }
    } catch (err) {
      console.error(err);
      notify('Lỗi khi lưu liên kết video!', 'error');
    }
  };

  // Xử lý xóa video
  const handleDelete = async (type: 'action' | 'mouth') => {
    const label = type === 'action' ? 'hành động âm' : 'khẩu hình miệng';
    if (!window.confirm(`Bạn có chắc muốn xóa video ${label} của âm /${sound.sound}/ không?`)) {
      return;
    }

    try {
      await deleteSoundVideo(sound.id, type);
      setVideos(getLoadedSoundVideos(sound.id));
      notify(`Đã xóa video ${label}!`, 'success');
    } catch (err) {
      console.error(err);
      notify('Lỗi khi xóa video!', 'error');
    }
  };

  const changeRate = (type: 'action' | 'mouth', rate: number) => {
    if (type === 'action') {
      setActionRate(rate);
      if (actionVideoRef.current) actionVideoRef.current.playbackRate = rate;
    } else {
      setMouthRate(rate);
      if (mouthVideoRef.current) mouthVideoRef.current.playbackRate = rate;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toast thông báo */}
      {notification && (
        <div
          className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-red-50 text-red-800 border border-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">
              {notification.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{notification.msg}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* KHỐI VIDEO THEO TỪNG BƯỚC HOẶC HIỂN THỊ CẢ 2 */}
      {step === 1 && (
        <div className="w-full max-w-2xl mx-auto">
          <VideoCardItem
            title="Video Hành Động Âm"
            icon="accessibility_new"
            badgeColor="bg-amber-100 text-amber-900 border-amber-300"
            videoItem={videos?.actionVideo}
            isUploading={isActionUploading}
            showUrlInput={showActionUrlInput}
            urlText={actionUrlText}
            playbackRate={actionRate}
            isLoop={actionLoop}
            videoRef={actionVideoRef}
            fileInputRef={actionFileInputRef}
            onRateChange={(r) => changeRate('action', r)}
            onLoopChange={() => {
              const next = !actionLoop;
              setActionLoop(next);
              if (actionVideoRef.current) actionVideoRef.current.loop = next;
            }}
            onReplay={() => {
              if (actionVideoRef.current) {
                actionVideoRef.current.currentTime = 0;
                actionVideoRef.current.play();
              }
            }}
            onTriggerUpload={() => actionFileInputRef.current?.click()}
            onFileChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, 'action');
              e.target.value = '';
            }}
            onToggleUrlInput={() => setShowActionUrlInput(!showActionUrlInput)}
            onUrlTextChange={setActionUrlText}
            onSaveUrl={() => handleSaveUrl('action')}
            onDelete={() => handleDelete('action')}
          />
        </div>
      )}

      {step === 2 && (
        <div className="w-full max-w-2xl mx-auto">
          <VideoCardItem
            title="Video Khẩu Hình Miệng"
            icon="record_voice_over"
            badgeColor="bg-sky-100 text-sky-900 border-sky-300"
            videoItem={videos?.mouthVideo}
            isUploading={isMouthUploading}
            showUrlInput={showMouthUrlInput}
            urlText={mouthUrlText}
            playbackRate={mouthRate}
            isLoop={mouthLoop}
            videoRef={mouthVideoRef}
            fileInputRef={mouthFileInputRef}
            onRateChange={(r) => changeRate('mouth', r)}
            onLoopChange={() => {
              const next = !mouthLoop;
              setMouthLoop(next);
              if (mouthVideoRef.current) mouthVideoRef.current.loop = next;
            }}
            onReplay={() => {
              if (mouthVideoRef.current) {
                mouthVideoRef.current.currentTime = 0;
                mouthVideoRef.current.play();
              }
            }}
            onTriggerUpload={() => mouthFileInputRef.current?.click()}
            onFileChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, 'mouth');
              e.target.value = '';
            }}
            onToggleUrlInput={() => setShowMouthUrlInput(!showMouthUrlInput)}
            onUrlTextChange={setMouthUrlText}
            onSaveUrl={() => handleSaveUrl('mouth')}
            onDelete={() => handleDelete('mouth')}
          />
        </div>
      )}

      {!step && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <VideoCardItem
            title="Video Hành Động Âm"
            icon="accessibility_new"
            badgeColor="bg-amber-100 text-amber-900 border-amber-300"
            videoItem={videos?.actionVideo}
            isUploading={isActionUploading}
            showUrlInput={showActionUrlInput}
            urlText={actionUrlText}
            playbackRate={actionRate}
            isLoop={actionLoop}
            videoRef={actionVideoRef}
            fileInputRef={actionFileInputRef}
            onRateChange={(r) => changeRate('action', r)}
            onLoopChange={() => {
              const next = !actionLoop;
              setActionLoop(next);
              if (actionVideoRef.current) actionVideoRef.current.loop = next;
            }}
            onReplay={() => {
              if (actionVideoRef.current) {
                actionVideoRef.current.currentTime = 0;
                actionVideoRef.current.play();
              }
            }}
            onTriggerUpload={() => actionFileInputRef.current?.click()}
            onFileChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, 'action');
              e.target.value = '';
            }}
            onToggleUrlInput={() => setShowActionUrlInput(!showActionUrlInput)}
            onUrlTextChange={setActionUrlText}
            onSaveUrl={() => handleSaveUrl('action')}
            onDelete={() => handleDelete('action')}
          />
          <VideoCardItem
            title="Video Khẩu Hình Miệng"
            icon="record_voice_over"
            badgeColor="bg-sky-100 text-sky-900 border-sky-300"
            videoItem={videos?.mouthVideo}
            isUploading={isMouthUploading}
            showUrlInput={showMouthUrlInput}
            urlText={mouthUrlText}
            playbackRate={mouthRate}
            isLoop={mouthLoop}
            videoRef={mouthVideoRef}
            fileInputRef={mouthFileInputRef}
            onRateChange={(r) => changeRate('mouth', r)}
            onLoopChange={() => {
              const next = !mouthLoop;
              setMouthLoop(next);
              if (mouthVideoRef.current) mouthVideoRef.current.loop = next;
            }}
            onReplay={() => {
              if (mouthVideoRef.current) {
                mouthVideoRef.current.currentTime = 0;
                mouthVideoRef.current.play();
              }
            }}
            onTriggerUpload={() => mouthFileInputRef.current?.click()}
            onFileChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file, 'mouth');
              e.target.value = '';
            }}
            onToggleUrlInput={() => setShowMouthUrlInput(!showMouthUrlInput)}
            onUrlTextChange={setMouthUrlText}
            onSaveUrl={() => handleSaveUrl('mouth')}
            onDelete={() => handleDelete('mouth')}
          />
        </div>
      )}
    </div>
  );
}

// Subcomponent: Thẻ Video độc lập (Dùng chung cho cả 2 loại video)
interface VideoCardItemProps {
  title: string;
  icon: string;
  badgeColor: string;
  videoItem?: LoadedVideoItem;
  isUploading: boolean;
  showUrlInput: boolean;
  urlText: string;
  playbackRate: number;
  isLoop: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onRateChange: (rate: number) => void;
  onLoopChange: () => void;
  onReplay: () => void;
  onTriggerUpload: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleUrlInput: () => void;
  onUrlTextChange: (val: string) => void;
  onSaveUrl: () => void;
  onDelete: () => void;
}

function VideoCardItem({
  title,
  icon,
  badgeColor,
  videoItem,
  isUploading,
  showUrlInput,
  urlText,
  playbackRate,
  isLoop,
  videoRef,
  fileInputRef,
  onRateChange,
  onLoopChange,
  onReplay,
  onTriggerUpload,
  onFileChange,
  onToggleUrlInput,
  onUrlTextChange,
  onSaveUrl,
  onDelete,
}: VideoCardItemProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div className="bg-surface-container-lowest rounded-3xl border-2 border-surface-container p-4 flex flex-col justify-between shadow-xs hover:border-primary/30 transition-all">
      {/* Header của thẻ */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-container gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-surface-container-high text-primary flex items-center justify-center font-bold shrink-0">
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </div>
          <h4 className="text-xs sm:text-sm font-black text-on-surface leading-tight">
            {title}
          </h4>
        </div>

        {videoItem ? (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 shrink-0 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Đã có video</span>
          </span>
        ) : (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${badgeColor}`}>
            Chưa tải video
          </span>
        )}
      </div>

      {/* KHUNG VIDEO HOẶC KHUNG TẢI LÊN */}
      <div className="my-3 flex-1 flex flex-col justify-center">
        {videoItem ? (
          /* ĐÃ CÓ VIDEO -> KHUNG PHÁT VIDEO CHUẨN HTML5 */
          <div className="flex flex-col gap-2">
            <div className="relative w-full aspect-video sm:h-[220px] md:h-[240px] bg-black rounded-2xl overflow-hidden flex items-center justify-center shadow-inner group">
              <video
                ref={videoRef}
                src={videoItem.playUrl}
                controls
                playsInline
                loop={isLoop}
                preload="metadata"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Thanh điều khiển nhanh bên dưới video */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 text-xs">
              <div className="flex items-center gap-1.5">
                {/* Nút xem lại */}
                <button
                  type="button"
                  onClick={onReplay}
                  className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                  title="Xem lại video từ đầu"
                >
                  <span className="material-symbols-outlined text-sm">replay</span>
                  <span>Xem lại</span>
                </button>

                {/* Tốc độ 1.0x vs 0.75x */}
                <div className="flex items-center bg-surface-container rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => onRateChange(1.0)}
                    className={`px-2 py-0.5 rounded-md font-bold text-[11px] cursor-pointer transition-colors ${
                      playbackRate === 1.0 ? 'bg-primary text-white' : 'text-on-surface hover:text-primary'
                    }`}
                  >
                    1.0x
                  </button>
                  <button
                    type="button"
                    onClick={() => onRateChange(0.75)}
                    className={`px-2 py-0.5 rounded-md font-bold text-[11px] cursor-pointer transition-colors ${
                      playbackRate === 0.75 ? 'bg-primary text-white' : 'text-on-surface hover:text-primary'
                    }`}
                    title="Chậm để quan sát kỹ"
                  >
                    0.75x
                  </button>
                </div>

                {/* Nút lặp lại */}
                <button
                  type="button"
                  onClick={onLoopChange}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
                    isLoop
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                  title={isLoop ? 'Đang bật lặp lại liên tục' : 'Tắt lặp lại'}
                >
                  <span className="material-symbols-outlined text-xs">repeat</span>
                  <span>{isLoop ? 'Lặp lại' : '1 Lần'}</span>
                </button>
              </div>

              {/* Đổi / Xóa video */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onTriggerUpload}
                  className="px-2 py-1 rounded-lg text-primary hover:bg-primary/10 font-bold text-[11px] flex items-center gap-0.5 cursor-pointer"
                  title="Thay tệp video mới"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  <span>Đổi video</span>
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="px-2 py-1 rounded-lg text-red-600 hover:bg-red-50 font-bold text-[11px] flex items-center gap-0.5 cursor-pointer"
                  title="Xóa video này"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* CHƯA CÓ VIDEO -> KHUNG TẢI LÊN (UPLOAD AREA) */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) {
                const syntheticEvent = {
                  target: { files: [file], value: '' },
                } as unknown as React.ChangeEvent<HTMLInputElement>;
                onFileChange(syntheticEvent);
              }
            }}
            className={`w-full aspect-video sm:h-[220px] md:h-[240px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center transition-all ${
              isDragOver
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-surface-container-high bg-surface-container-lowest hover:border-primary/40'
            }`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <span className="w-8 h-8 rounded-full border-3 border-primary border-t-transparent animate-spin"></span>
                <span className="text-xs font-bold text-primary">Đang tải và lưu video...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2.5 max-w-xs">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">upload_file</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface">
                    Chưa có video mô phỏng
                  </p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Kéo thả video vào đây hoặc chọn tệp từ máy
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onTriggerUpload}
                    className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-primary/90 transition-all cursor-pointer active:scale-95"
                  >
                    <span className="material-symbols-outlined text-base">cloud_upload</span>
                    <span>Tải Video Lên (.mp4, .mov,...)</span>
                  </button>

                  <button
                    type="button"
                    onClick={onToggleUrlInput}
                    className="px-3 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-medium hover:bg-surface-container-high transition-all cursor-pointer"
                  >
                    {showUrlInput ? 'Ẩn URL' : 'Dán URL Video'}
                  </button>
                </div>

                {/* Form dán URL video nếu cần */}
                {showUrlInput && (
                  <div className="w-full flex items-center gap-1.5 mt-2 animate-in fade-in">
                    <input
                      type="url"
                      placeholder="https://...mp4 hoặc link video"
                      value={urlText}
                      onChange={(e) => onUrlTextChange(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-surface-container-high text-xs bg-white text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={onSaveUrl}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                    >
                      Lưu
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input File ẩn */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/ogg,video/*"
        onChange={onFileChange}
        className="hidden"
      />
    </div>
  );
}
