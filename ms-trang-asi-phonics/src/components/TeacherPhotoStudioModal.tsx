import { useState, useEffect, useRef } from 'react';
import {
  NATURAL_SCENE_PRESETS,
  getLoadedTeacherPhoto,
  processAndSaveUploadedTeacherPhoto,
  generateAllCompositesFromRawUrl,
  removeWhiteBackdropFloodFill,
  renderNaturalTeacherComposite,
} from '../utils/teacherPhotoStorage';

interface TeacherPhotoStudioModalProps {
  onClose: () => void;
}

export function TeacherPhotoStudioModal({ onClose }: TeacherPhotoStudioModalProps) {
  const existing = getLoadedTeacherPhoto();
  const [rawDataUrl, setRawDataUrl] = useState<string>(existing?.rawDataUrl || '');
  const [selectedSceneId, setSelectedSceneId] = useState<string>(
    existing?.selectedSceneId || 'warm-classroom'
  );
  const [aspect, setAspect] = useState<'16:9' | '3:4' | '1:1'>('16:9');
  const [showBadge, setShowBadge] = useState<boolean>(false);
  const [headlineText, setHeadlineText] = useState<string>('Ms Trang ASI');
  const [subText, setSubText] = useState<string>('Đánh Vần Tiếng Anh Tự Nhiên');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mattedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Khi có rawDataUrl, tách nền trắng 1 lần rồi render preview tức thì
  useEffect(() => {
    if (!rawDataUrl) {
      setPreviewUrl('');
      mattedCanvasRef.current = null;
      return;
    }

    let cancelled = false;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) return;
      const matted = removeWhiteBackdropFloodFill(img);
      mattedCanvasRef.current = matted;
      const out = renderNaturalTeacherComposite(matted, {
        sceneId: selectedSceneId,
        aspect,
        showBadge,
        headlineText,
        subText,
      });
      setPreviewUrl(out);
      setIsProcessing(false);
    };
    img.onerror = () => {
      if (!cancelled) setIsProcessing(false);
    };
    img.src = rawDataUrl;

    return () => {
      cancelled = true;
    };
  }, [rawDataUrl]);

  // Khi đổi bối cảnh / tỷ lệ / nhãn chữ thì kết xuất lại ngay từ mattedCanvasRef
  useEffect(() => {
    if (!mattedCanvasRef.current) return;
    const out = renderNaturalTeacherComposite(mattedCanvasRef.current, {
      sceneId: selectedSceneId,
      aspect,
      showBadge,
      headlineText,
      subText,
    });
    setPreviewUrl(out);
  }, [selectedSceneId, aspect, showBadge, headlineText, subText]);

  const handleFileSelected = async (file: File) => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const saved = await processAndSaveUploadedTeacherPhoto(file, selectedSceneId);
      setRawDataUrl(saved.rawDataUrl);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyToWebsite = async () => {
    if (!rawDataUrl) return;
    setIsProcessing(true);
    try {
      await generateAllCompositesFromRawUrl(rawDataUrl, selectedSceneId);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3500);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadImage = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `co-trang-asi-${selectedSceneId}-${aspect.replace(':', 'x')}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-5 animate-in fade-in">
      <div className="bg-white max-w-4xl w-full rounded-3xl p-5 sm:p-7 shadow-2xl border border-stone-200 flex flex-col gap-5 max-h-[94vh] overflow-y-auto">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFileSelected(f);
            e.target.value = '';
          }}
          className="hidden"
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">photo_camera_front</span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-on-surface">
                Tạo Ảnh Cô Trang ASI Tự Nhiên Để Đăng Bài Web
              </h3>
              <p className="text-xs text-on-surface-variant">
                Tự động tách phông trắng Studio và ghép bối cảnh lớp học nắng ấm tự nhiên (giữ nguyên 100% chân dung thật của Cô Trang)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Cột Trái: Khung Xem Trước Ảnh Tự Nhiên */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            {previewUrl ? (
              <div className="relative bg-stone-100 rounded-3xl p-3 border border-stone-200 flex flex-col items-center justify-center min-h-[320px]">
                <img
                  src={previewUrl}
                  alt="Ảnh Cô Trang ASI tự nhiên đăng bài web"
                  className="max-h-[440px] w-auto rounded-2xl shadow-md object-contain"
                />

                {savedNotice && (
                  <div className="mt-3 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-black flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    <span>Đã áp dụng ảnh tự nhiên của Cô Trang lên toàn bộ Website!</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4 w-full">
                  <button
                    type="button"
                    onClick={handleDownloadImage}
                    className="px-5 py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-on-primary text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">download</span>
                    <span>Tải Ảnh Này Về Đăng Web (.JPG)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyToWebsite}
                    className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">public</span>
                    <span>Áp Dụng Lên Trang Web</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2.5 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">upload_file</span>
                    <span>Đổi Ảnh Gốc Khác</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) handleFileSelected(f);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full min-h-[340px] rounded-3xl border-3 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-primary bg-primary/10 scale-[1.01]'
                    : 'border-stone-300 hover:border-primary bg-stone-50 hover:bg-stone-100/70'
                }`}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-3">
                    <span className="w-10 h-10 rounded-full border-3 border-primary border-t-transparent animate-spin" />
                    <span className="text-sm font-bold text-primary">
                      Đang xử lý tách nền & tạo ánh sáng tự nhiên...
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-4xl">add_photo_alternate</span>
                    </div>
                    <h4 className="text-base sm:text-lg font-black text-on-surface">
                      Bấm vào đây hoặc kéo thả ảnh <span className="text-primary">"cô trang asi.png"</span> vào
                    </h4>
                    <p className="text-xs text-on-surface-variant max-w-md mt-1.5 leading-relaxed">
                      Hệ thống sẽ tự động xóa phông trắng studio, cân bằng ánh sáng nắng ấm tự nhiên và tạo ngay bộ ảnh đăng bài web + cập nhật hình ảnh Cô Trang trên trang chủ.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cột Phải: Tuỳ Chỉnh Bối Cảnh Tự Nhiên & Khung Hình Đăng Web */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* 1. Chọn bối cảnh tự nhiên */}
            <div className="space-y-2">
              <label className="text-xs font-black text-on-surface uppercase tracking-wider block">
                1. Chọn Bối Cảnh Tự Nhiên:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {NATURAL_SCENE_PRESETS.map((scene) => {
                  const isSelected = scene.id === selectedSceneId;
                  return (
                    <button
                      key={scene.id}
                      type="button"
                      onClick={() => setSelectedSceneId(scene.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                          : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <div>
                        <div className="text-xs sm:text-sm font-black text-on-surface">
                          {scene.name}
                        </div>
                        <div className="text-[11px] text-on-surface-variant">{scene.desc}</div>
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-primary text-xl">
                          check_circle
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Chọn tỷ lệ khung ảnh đăng web */}
            <div className="space-y-2">
              <label className="text-xs font-black text-on-surface uppercase tracking-wider block">
                2. Tỷ Lệ Ảnh Đăng Bài Web:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '16:9', label: '16:9 Ngang Web' },
                  { id: '3:4', label: '3:4 Chân Dung' },
                  { id: '1:1', label: '1:1 Vuông FB' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAspect(item.id as '16:9' | '3:4' | '1:1')}
                    className={`py-2.5 px-2 rounded-xl text-xs font-black border cursor-pointer transition-all ${
                      aspect === item.id
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-on-surface border-stone-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Chế độ Ảnh tự nhiên thuần túy hay Có khung chữ đăng bài */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-on-surface">
                  Chèn khung chữ tiêu đề bài đăng Web
                </span>
                <button
                  type="button"
                  onClick={() => setShowBadge((prev) => !prev)}
                  className={`px-3 py-1 rounded-full text-xs font-black cursor-pointer transition-all ${
                    showBadge
                      ? 'bg-primary text-white'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {showBadge ? 'Đang Bật' : 'Đang Tắt (Ảnh Tự Nhiên 100%)'}
                </button>
              </div>

              {showBadge && (
                <div className="space-y-2 pt-1">
                  <input
                    type="text"
                    value={headlineText}
                    onChange={(e) => setHeadlineText(e.target.value)}
                    placeholder="Tiêu đề chính (vd: Ms Trang ASI)"
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs font-bold"
                  />
                  <input
                    type="text"
                    value={subText}
                    onChange={(e) => setSubText(e.target.value)}
                    placeholder="Dòng phụ (vd: Đánh Vần Tiếng Anh Tự Nhiên)"
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs font-bold"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
