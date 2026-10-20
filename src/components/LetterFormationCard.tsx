import { useState, useRef, useEffect, useMemo } from 'react';
import { speakPhonicsSound } from '../utils/audioPlayer';
import { getCompositeSvgSound } from '../utils/phonicsLetterSvgPaths';

interface LetterFormationCardProps {
  soundText: string;
  soundId: string;
  ipa?: string;
  nameVi?: string;
}

export function LetterFormationCard({
  soundText,
  soundId,
  ipa,
  nameVi,
}: LetterFormationCardProps) {
  const [isTracingMode, setIsTracingMode] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Lấy dữ liệu nét vẽ vector đơn nét (monoline stroke) chuẩn sư phạm Jolly Phonics
  const composite = useMemo(() => {
    return getCompositeSvgSound(soundText);
  }, [soundText]);

  // Xóa nét vẽ trên canvas
  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Lấy tọa độ chính xác ngay dưới đầu bút / con trỏ chuột (không bị nhân đôi tỷ lệ)
  const getCanvasPoint = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    const touch = 'touches' in e ? e.touches[0] || e.changedTouches[0] : null;
    const clientX = touch ? touch.clientX : (e as React.MouseEvent<HTMLCanvasElement>).clientX;
    const clientY = touch ? touch.clientY : (e as React.MouseEvent<HTMLCanvasElement>).clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      scale: scaleX,
    };
  };

  // Bắt đầu vẽ
  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pt = getCanvasPoint(e);
    if (!ctx || !pt) return;

    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 22 * pt.scale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const pt = getCanvasPoint(e);
    if (!ctx || !pt) return;

    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
  };

  // Đồng bộ kích thước canvas vẽ theo đúng khung hiển thị thực tế (không dùng ctx.scale để tránh lệch tọa độ)
  useEffect(() => {
    if (isTracingMode && canvasRef.current && containerRef.current) {
      const canvas = canvasRef.current;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 2;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
    }
  }, [isTracingMode, soundText]);

  return (
    <div className="bg-[#f9fafb] p-3 sm:p-4 rounded-3xl border-2 border-red-200/90 shadow-md flex flex-col justify-between items-center relative select-none w-full max-w-xl mx-auto transition-all">
      {/* Nút Điều Khiển Tập Tô */}
      <div className="flex items-center justify-end w-full pb-2 gap-2">
        {isTracingMode && (
          <button
            onClick={handleClearCanvas}
            className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-[#ff6b6b] font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
            title="Xóa nét vẽ để tô lại"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Xóa Nét Tô</span>
          </button>
        )}

        <button
          onClick={() => setIsTracingMode(!isTracingMode)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0 ${
            isTracingMode
              ? 'bg-[#ff6b6b] text-white ring-2 ring-red-300 scale-102'
              : 'bg-red-50 text-[#ff6b6b] hover:bg-red-100'
          }`}
          title="Bật/Tắt chế độ bé tập tô chữ"
        >
          <span className="material-symbols-outlined text-[16px]">edit_note</span>
          <span>{isTracingMode ? 'Đang Tập Tô' : 'Bé Tập Tô Chữ'}</span>
        </button>
      </div>

      {/* KHUNG HIỂN THỊ CHỮ VIẾT NÉT ĐỎ CÂN ĐỐI CHÍNH GIỮA */}
      <div
        ref={containerRef}
        className="relative w-full h-[320px] sm:h-[360px] md:h-[380px] flex items-center justify-center my-1 select-none overflow-hidden bg-white rounded-3xl border border-red-100/80 shadow-inner"
      >
        {/* NỀN ĐỒNG BỘ: MẪU NÉT CHỮ VECTOR ĐƠN NÉT (MONOLINE STROKE) TO THẬT TO */}
        <div
          onClick={() => !isTracingMode && speakPhonicsSound(soundText, ipa, nameVi, undefined, undefined, soundId)}
          className={`w-full h-full p-4 sm:p-8 flex items-center justify-center transition-all ${
            isTracingMode
              ? 'opacity-35 cursor-crosshair'
              : 'cursor-pointer hover:scale-[1.02] active:scale-98'
          }`}
        >
          {composite.elements.length > 0 ? (
            <svg
              viewBox={composite.viewBox}
              className="w-full h-full max-h-full drop-shadow-xs"
              fill="none"
              preserveAspectRatio="xMidYMid meet"
            >
              {composite.elements.map((item) => (
                <g key={item.key} transform={`translate(${item.offsetX}, 0)`}>
                  {/* Các nét vẽ đơn mảnh khép góc hoặc hở theo chữ viết tay chuẩn */}
                  {item.letterDef.paths.map((p, idx) => (
                    <path
                      key={idx}
                      d={p.d}
                      fill="none"
                      stroke="#ff6b6b"
                      strokeWidth={13}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}

                  {/* Dấu chấm tròn (dành cho chữ i, j...) */}
                  {item.letterDef.dots?.map((d, idx) => (
                    <circle
                      key={`dot_${idx}`}
                      cx={d.cx}
                      cy={d.cy}
                      r={d.r}
                      fill="#ff6b6b"
                    />
                  ))}
                </g>
              ))}
            </svg>
          ) : (
            /* Fallback nét chữ thanh mảnh cho các ký tự đặc biệt hoặc chữ hoa */
            <svg
              viewBox="0 0 200 260"
              className="w-full h-full max-h-full"
              fill="none"
              preserveAspectRatio="xMidYMid meet"
            >
              <text
                x="100"
                y="190"
                textAnchor="middle"
                fill="none"
                stroke="#ff6b6b"
                strokeWidth={12}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  fontFamily: "'Playpen Sans', 'Comic Neue', cursive, sans-serif",
                  fontSize: soundText.length >= 3 ? '120px' : soundText.length === 2 ? '150px' : '200px',
                  fontWeight: 400,
                }}
              >
                {soundText}
              </text>
            </svg>
          )}
        </div>

        {/* LỚP VẼ CANVAS KHI BẬT CHẾ ĐỘ BÉ TẬP TÔ */}
        {isTracingMode && (
          <div className="absolute inset-0 z-10 touch-none">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full cursor-crosshair"
            />
          </div>
        )}
      </div>
    </div>
  );
}
