import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface DiamondRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  diamonds: number;
  bookTitle?: string;
}

export function DiamondRewardModal({
  isOpen,
  onClose,
  diamonds,
  bookTitle = 'Book 06: Tap, Tap, Tap!',
}: DiamondRewardModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#fea619', '#00288e', '#10B981', '#8B5CF6'],
        });
      } catch (e) {
        console.warn('Confetti error', e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.round((diamonds / 100) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-surface-container-lowest max-w-md w-full rounded-3xl p-6 shadow-2xl border-2 border-secondary-container flex flex-col items-center text-center gap-4 relative overflow-hidden transform scale-100 transition-transform">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-secondary-container/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-group-ai-j-oa-ie-ee-or/20 rounded-full blur-2xl pointer-events-none" />

        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-secondary-container to-secondary flex items-center justify-center text-4xl shadow-lg ring-8 ring-secondary-container/20 animate-bounce">
          💎
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-extrabold text-secondary uppercase tracking-wider">
            XUẤT SẮC • HOÀN THÀNH BÀI ĐỌC
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-on-surface">
            Chúc Mừng Bé Nhận 10 Kim Cương! 💎✨
          </h3>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            Bé đã tự tin giải mã thành công cuốn <strong>{bookTitle}</strong> mà không cần đoán mò. Kim cương đã được cộng vào tài khoản của bé!
          </p>
        </div>

        {/* Diamond Progress Card */}
        <div className="w-full bg-surface-container-low p-4 rounded-2xl flex flex-col gap-2.5 text-left border border-outline-variant/30">
          <div className="flex items-center justify-between text-xs font-bold text-on-surface">
            <span>Tổng kim cương tích lũy:</span>
            <span className="text-secondary font-black text-lg">
              {diamonds} 💎
            </span>
          </div>
          <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-secondary-container to-secondary rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-on-surface-variant flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[15px] text-group-ai-j-oa-ie-ee-or">
              stars
            </span>
            <span>
              Đạt 100 💎 để mở khóa Huy Hiệu Hiệp Sĩ Phonics & Phần quà từ cô Trang!
            </span>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 w-full pt-1">
          <a
            className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-sm"
            href="https://www.facebook.com/groups/phonics.mstrang.asi"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="material-symbols-outlined text-lg">send</span>
            <span>Quay Video Gửi Ms Trang ASI (Nhóm Facebook) 🎬</span>
          </a>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-surface-container-high text-on-surface text-xs sm:text-sm font-bold hover:bg-surface-container-highest transition-colors cursor-pointer"
          >
            Tiếp Tục Đọc Truyện Khác
          </button>
        </div>
      </div>
    </div>
  );
}
