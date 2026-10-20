interface LockedGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  groupNumber: number;
}

export function LockedGroupModal({
  isOpen,
  onClose,
  onOpenLogin,
  groupNumber,
}: LockedGroupModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-surface-container-lowest max-w-md w-full rounded-3xl p-6 shadow-2xl border-2 border-secondary-container flex flex-col items-center text-center gap-4 relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-secondary-container/20 text-secondary flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-3xl">lock</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-secondary uppercase tracking-wider">
            NỘI DUNG DÀNH CHO HỌC VIÊN CHÍNH THỨC
          </span>
          <h3 className="text-xl font-black text-on-surface">
            🔒 Nhóm {groupNumber} Đang Bị Khóa!
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Ở chế độ khách trải nghiệm, bé được đọc thử <strong>Nhóm 1 (/s, a, t, i, p, n/)</strong>. Vui lòng <strong>Đăng nhập tài khoản học viên</strong> để mở khóa trọn bộ <strong>7 Nhóm Âm & 70 Truyện Đọc Decodable Readers</strong> nhé!
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full pt-2">
          <button
            onClick={() => {
              onClose();
              onOpenLogin();
            }}
            className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary text-sm font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">key</span>
            <span>Đăng Nhập Mở Khóa Toàn Bộ 70 Cuốn</span>
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl text-on-surface-variant text-xs font-semibold hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Quay lại đọc Nhóm 1
          </button>
        </div>
      </div>
    </div>
  );
}
