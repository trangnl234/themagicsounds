import React, { useState, useEffect, useRef } from 'react';
import { CourseKey } from '../utils/courseCoverStorage';
import {
  redeemOneTimeActivationCode,
  UnlockedCoursesMap,
} from '../utils/studentProgressApi';

export type CourseAccessPromptType =
  | 'tune-in-register'
  | 'magic-sounds-register'
  | 'magic-sounds-purchase'
  | 'sound-code-purchase'
  | 'sound-to-speech-register';

const STORAGE_KEY_PAYMENT_QR = 'phonics_magic_sounds_payment_qr_v1';
const ZALO_SUPPORT_URL = 'https://zalo.me/0398612126';

interface CourseAccessModalProps {
  promptType: CourseAccessPromptType | null;
  isLoggedIn: boolean;
  currentUserEmail?: string;
  onClose: () => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
  onUnlockCourse: (
    courseKey: CourseKey,
    updatedMap?: UnlockedCoursesMap
  ) => void;
}

export function CourseAccessModal({
  promptType,
  isLoggedIn,
  currentUserEmail = '',
  onClose,
  onOpenAuthModal,
  onUnlockCourse,
}: CourseAccessModalProps) {
  const [activationCode, setActivationCode] = useState('');
  const [emailForCode, setEmailForCode] = useState(currentUserEmail);
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [copiedZaloMsg, setCopiedZaloMsg] = useState(false);
  const [customQrUrl, setCustomQrUrl] = useState<string>('');
  const qrInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (currentUserEmail) {
      setEmailForCode(currentUserEmail);
    }
  }, [currentUserEmail, promptType]);

  useEffect(() => {
    setCodeError('');
    setCodeSuccess('');
    setActivationCode('');
  }, [promptType]);

  useEffect(() => {
    try {
      const savedQr = localStorage.getItem(STORAGE_KEY_PAYMENT_QR);
      if (savedQr) {
        setCustomQrUrl(savedQr);
      }
    } catch {
      // ignore
    }
  }, []);

  if (!promptType) return null;

  const handleUploadQrImage = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (dataUrl) {
        setCustomQrUrl(dataUrl);
        try {
          localStorage.setItem(STORAGE_KEY_PAYMENT_QR, dataUrl);
        } catch {
          // ignore
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const isJoyPrompt = promptType === 'tune-in-register';

  const isMagicSoundsPrompt =
    promptType === 'magic-sounds-register' ||
    promptType === 'magic-sounds-purchase';

  const isRegisterPrompt = promptType === 'sound-to-speech-register';

  const handleRedeemOneTimeCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');
    setCodeSuccess('');

    const cleanedCode = activationCode.trim().toUpperCase();
    const cleanedEmail = (currentUserEmail || emailForCode)
      .trim()
      .toLowerCase();

    if (!cleanedEmail || !cleanedEmail.includes('@')) {
      setCodeError(
        'Vui lòng đăng nhập tài khoản học viên hoặc nhập đúng Email tài khoản đã đăng ký.'
      );
      return;
    }

    if (!cleanedCode) {
      setCodeError(
        'Vui lòng nhập mã kích hoạt (dùng 1 lần) mà Zalo Anh ngữ ASI đã cấp tương ứng với Email của bạn.'
      );
      return;
    }

    const targetExpectedKey: CourseKey = isJoyPrompt
      ? 'tune-in'
      : isMagicSoundsPrompt
      ? 'magic-sounds'
      : 'sound-code';

    setIsRedeeming(true);
    try {
      const result = await redeemOneTimeActivationCode(
        cleanedCode,
        cleanedEmail,
        targetExpectedKey
      );
      if (!result.ok) {
        setCodeError(
          result.error ||
            'Mã kích hoạt không hợp lệ hoặc đã được sử dụng.'
        );
        return;
      }

      const unlockedKey = result.courseKey || targetExpectedKey;
      onUnlockCourse(unlockedKey, result.unlockedCourses);
      setCodeSuccess(
        result.message ||
          `Đã kích hoạt thành công cho email ${cleanedEmail}!`
      );
      setActivationCode('');
      setTimeout(() => {
        onClose();
      }, 1100);
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleCopyZaloMessage = (courseTitle: string) => {
    const emailStr =
      (currentUserEmail || emailForCode).trim() || '[Điền Email của bạn]';
    const text = `Em muốn tư vấn đăng ký tài khoản học ${courseTitle}. Email tài khoản của em là: ${emailStr}. Nhờ Anh ngữ ASI hỗ trợ tư vấn và cấp mã kích hoạt giúp em ạ!`;
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedZaloMsg(true);
    setTimeout(() => setCopiedZaloMsg(false), 3000);
  };

  // ============================================================================
  // GIAO DIỆN ĐĂNG KÝ JOY (HIỆN RA KHI BẤM VÀO NÚT ĐĂNG KÝ JOY)
  // ============================================================================
  if (isJoyPrompt) {
    const joyBenefits = [
      'Nghe ngấm âm cùng giáo viên nước ngoài',
      'Thực hành nghe ngấm âm tại nhà hàng ngày',
      'Bước đệm tiến tới vỡ lòng tập đọc tiếng Anh',
    ];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in">
        <div className="bg-white max-w-xl w-full rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-[#e13829]/25 flex flex-col gap-5 relative my-auto max-h-[93vh] overflow-y-auto">
          {/* Nút Đóng */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer z-10"
            title="Đóng"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          {/* Header: ĐĂNG KÝ NGHE CẢM ÂM JOY */}
          <div className="pr-10 border-b border-stone-200 pb-3">
            <h3 className="text-2xl sm:text-3xl font-black text-[#c8281b] tracking-tight">
              Đăng ký nghe cảm âm JOY
            </h3>
          </div>

          {/* 3 Thông tin chương trình JOY */}
          <div className="bg-[#fff8f6] border-2 border-[#e13829]/25 rounded-2xl p-4 sm:p-5">
            <ul className="space-y-3">
              {joyBenefits.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-[#e13829]/15 shadow-2xs text-sm sm:text-base font-black text-stone-900"
                >
                  <span className="material-symbols-outlined text-emerald-600 text-2xl shrink-0">
                    check_circle
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Nút Zalo hỗ trợ: Hotline Anh ngữ ASI */}
          <div className="flex flex-col gap-2.5">
            <a
              href={ZALO_SUPPORT_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full py-4 px-5 rounded-2xl bg-[#0068ff] hover:bg-[#0052cc] text-white text-base sm:text-lg font-black shadow-[0_4px_0_#003eb3] active:translate-y-0.5 transition-all flex items-center justify-center gap-2.5 cursor-pointer text-center"
            >
              <span className="material-symbols-outlined text-2xl">
                support_agent
              </span>
              <span>Zalo hỗ trợ: Hotline Anh ngữ ASI</span>
            </a>
          </div>

          {/* Nếu chưa đăng nhập: nhắc tạo tài khoản để gắn mã kích hoạt */}
          {!isLoggedIn && (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-semibold text-stone-700">
                💡 Tạo tài khoản học viên để dùng Email nhận mã kích hoạt JOY:
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuthModal('register');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#e13829] text-white text-xs font-extrabold cursor-pointer hover:opacity-95"
                >
                  Đăng ký tài khoản
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuthModal('login');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-stone-200 text-stone-800 text-xs font-extrabold cursor-pointer hover:bg-stone-300"
                >
                  Đăng nhập
                </button>
              </div>
            </div>
          )}

          {/* Khu vực Nhập Mã Kích Hoạt JOY */}
          <div className="pt-3 border-t border-stone-200 space-y-2">
            <span className="text-xs sm:text-sm font-black text-stone-800 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-[#e13829]">
                vpn_key
              </span>
              <span>
                Nhập Mã Code JOY Riêng (VD: JOY-8F3K9A) để mở khoá phần JOY - NGHE CẢM ÂM:
              </span>
            </span>

            <form
              onSubmit={handleRedeemOneTimeCode}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2"
            >
              <input
                type="email"
                value={currentUserEmail || emailForCode}
                onChange={(e) => {
                  setEmailForCode(e.target.value);
                  setCodeError('');
                }}
                readOnly={Boolean(currentUserEmail)}
                placeholder="Email tài khoản học viên..."
                className={`sm:col-span-5 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#e13829] ${
                  currentUserEmail
                    ? 'bg-stone-100 border-stone-300 text-stone-700'
                    : 'bg-stone-50 border-stone-300 text-stone-900'
                }`}
              />
              <input
                type="text"
                value={activationCode}
                onChange={(e) => {
                  setActivationCode(e.target.value.toUpperCase());
                  setCodeError('');
                }}
                placeholder="Nhập mã kích hoạt (VD: JOY-8F3K9A)..."
                className="sm:col-span-4 px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs sm:text-sm font-black uppercase text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#e13829]"
              />
              <button
                type="submit"
                disabled={isRedeeming}
                className="sm:col-span-3 px-4 py-2.5 rounded-xl bg-[#e13829] hover:bg-[#c8281b] disabled:opacity-60 text-white text-xs sm:text-sm font-black cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">
                  verified
                </span>
                <span>
                  {isRedeeming ? 'Đang mở...' : 'Mở khoá JOY'}
                </span>
              </button>
            </form>

            {codeError && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
                {codeError}
              </p>
            )}
            {codeSuccess && (
              <p className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                {codeSuccess}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // GIAO DIỆN ĐĂNG KÝ RIÊNG CHO KHOÁ MAGIC SOUNDS (CÓ GIÁ, QUYỀN LỢI, ĐẦU RA, QR, ZALO & MÃ 1 LẦN THEO EMAIL)
  // ============================================================================
  if (isMagicSoundsPrompt) {
    const magicBenefits = [
      'Kiểm tra đầu vào',
      'Nhận lộ trình cá nhân hoá',
      '1 buổi zoom với mẹ và con để hướng dẫn thực hành và trả bài',
      '4 buổi zoom 1-1 để sửa âm và đánh vần',
      'Hỗ trợ trong toàn bộ lộ trình học',
    ];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in">
        <input
          ref={qrInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUploadQrImage(f);
            e.target.value = '';
          }}
          className="hidden"
        />

        <div className="bg-white max-w-2xl w-full rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-primary/20 flex flex-col gap-5 relative my-auto max-h-[93vh] overflow-y-auto">
          {/* Nút Đóng */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer z-10"
            title="Đóng"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>

          {/* Header: Tên khoá */}
          <div className="pr-10 border-b border-stone-200 pb-4">
            <h3 className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
              Đăng ký đánh vần tiếng anh MAGIC SOUNDS
            </h3>
          </div>

          {/* Nội dung chính: Nhận ngay + Đầu ra + Zalo hỗ trợ */}
          <div className="flex flex-col gap-4">
            {/* Khung Nhận ngay */}
            <div className="bg-primary-fixed/15 border border-primary/20 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-base">
                    redeem
                  </span>
                </span>
                <h4 className="text-base sm:text-lg font-black text-primary uppercase tracking-wide">
                  Nhận ngay
                </h4>
              </div>

              <ul className="space-y-2.5">
                {magicBenefits.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm sm:text-[15px] font-bold text-stone-800 leading-snug"
                  >
                    <span className="material-symbols-outlined text-emerald-600 text-xl shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Khung Đầu ra khi hoàn thành toàn bộ lộ trình học */}
            <div className="bg-amber-50/90 border-2 border-amber-300/90 rounded-2xl p-4 sm:p-5 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs sm:text-sm uppercase tracking-wider">
                <span className="material-symbols-outlined text-lg text-[#e13829]">
                  workspace_premium
                </span>
                <span>Đầu ra khi hoàn thành toàn bộ lộ trình học:</span>
              </div>
              <p className="text-base sm:text-lg font-black text-[#c8281b] leading-snug">
                Đánh vần tự đọc 4000 từ tiếng Anh mà không cần học thuộc.
              </p>
            </div>

            {/* Nút Kết nối Zalo hỗ trợ */}
            <a
              href={ZALO_SUPPORT_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-5 rounded-2xl bg-[#0068ff] hover:bg-[#0052cc] text-white text-sm sm:text-base font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">
                support_agent
              </span>
              <span>Zalo hỗ trợ: Hotline Anh ngữ ASI</span>
            </a>

            {/* Nếu chưa đăng nhập: nhắc quyền lợi đăng ký tài khoản miễn phí để học Nhóm âm số 1 */}
            {!isLoggedIn && (
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-semibold text-stone-700">
                  💡 Chưa có tài khoản? Đăng ký tài khoản miễn phí để học{' '}
                  <strong className="text-primary">Nhóm âm số 1 Full</strong>{' '}
                  và dùng Email đó nhận mã kích hoạt:
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuthModal('register');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-extrabold cursor-pointer hover:opacity-95"
                  >
                    Đăng ký tài khoản
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuthModal('login');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-stone-200 text-stone-800 text-xs font-extrabold cursor-pointer hover:bg-stone-300"
                  >
                    Đăng nhập
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Khu vực Nhập Mã Kích Hoạt */}
          <div className="pt-3 border-t border-stone-200 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-primary">
                  vpn_key
                </span>
                <span>
                  Nhập Mã Code Magic Riêng (VD: MS-8F3K9A) để mở khoá phần MAGIC SOUNDS:
                </span>
              </span>
            </div>

            <form
              onSubmit={handleRedeemOneTimeCode}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2"
            >
              <input
                type="email"
                value={currentUserEmail || emailForCode}
                onChange={(e) => {
                  setEmailForCode(e.target.value);
                  setCodeError('');
                }}
                readOnly={Boolean(currentUserEmail)}
                placeholder="Email tài khoản đã chuyển khoản..."
                className={`sm:col-span-5 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary ${
                  currentUserEmail
                    ? 'bg-stone-100 border-stone-300 text-stone-700'
                    : 'bg-stone-50 border-stone-300 text-stone-900'
                }`}
              />
              <input
                type="text"
                value={activationCode}
                onChange={(e) => {
                  setActivationCode(e.target.value.toUpperCase());
                  setCodeError('');
                }}
                placeholder="Nhập mã code Magic (VD: MS-8F3K9A)..."
                className="sm:col-span-4 px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs sm:text-sm font-black uppercase text-stone-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={isRedeeming}
                className="sm:col-span-3 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container disabled:opacity-60 text-white text-xs sm:text-sm font-black cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">
                  verified
                </span>
                <span>
                  {isRedeeming ? 'Đang mở...' : 'Mở khoá Magic'}
                </span>
              </button>
            </form>

            {codeError && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
                {codeError}
              </p>
            )}
            {codeSuccess && (
              <p className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                {codeSuccess}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // GIAO DIỆN CHO CÁC KHOÁ CÒN LẠI (SOUND CODE, MIMIC)
  // ============================================================================
  const getModalConfig = () => {
    switch (promptType) {
      case 'sound-code-purchase':
        return {
          courseKey: 'sound-code' as CourseKey,
          badge: 'KHOÁ HỌC CHUYÊN SÂU • SOUND CODE',
          title: 'Đăng ký mua khoá học Sound Code (Full)',
          description:
            'Khoá Sound Code là khoá giải mã cách đọc bằng hệ thống âm IPA dành cho học viên từ 12 tuổi cần xây lại nền tảng. Sau khi chuyển khoản, vui lòng bấm Zalo hỗ trợ và gửi Email tài khoản của bạn để nhận Mã kích hoạt dùng 1 lần tương ứng với Email.',
          accentBg: 'bg-slate-900',
          accentText: 'text-slate-900',
        };
      case 'sound-to-speech-register':
      default:
        return {
          courseKey: 'sound-to-speech' as CourseKey,
          badge: 'KHOÁ MIMIC • LỘ TRÌNH 30 NGÀY',
          title: 'Lộ trình 30 Ngày – 30 Chủ Đề Mimic',
          description:
            'Khoá Mimic gồm 30 ngày với 30 chủ đề giao tiếp (300 câu kèm ảnh minh hoạ). Tính năng Hiện chữ hoàn toàn miễn phí không cần tài khoản. Đăng nhập tài khoản để Chép chính tả, bấm Lưu nhận đánh giá và tích điểm vào tài khoản!',
          accentBg: 'bg-emerald-700',
          accentText: 'text-emerald-800',
        };
    }
  };

  const config = getModalConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-7 shadow-2xl border border-stone-200 flex flex-col gap-4 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl ${config.accentBg} text-white flex items-center justify-center shadow-xs shrink-0`}
          >
            <span className="material-symbols-outlined text-2xl">
              {isRegisterPrompt ? 'person_add' : 'workspace_premium'}
            </span>
          </div>
          <div>
            <span
              className={`text-[11px] font-black uppercase tracking-wider ${config.accentText}`}
            >
              {config.badge}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-stone-900 leading-snug">
              {config.title}
            </h3>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80">
          {config.description}
        </p>

        {isRegisterPrompt ? (
          <div className="flex flex-col gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuthModal('register');
              }}
              className={`w-full py-3 px-4 rounded-xl ${config.accentBg} hover:opacity-95 text-white text-sm font-black transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer`}
            >
              <span className="material-symbols-outlined text-lg">
                person_add
              </span>
              <span>Đăng ký tài khoản miễn phí ngay</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuthModal('login');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs sm:text-sm font-extrabold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">login</span>
              <span>Đã có tài khoản? Đăng nhập</span>
            </button>

            <a
              href={ZALO_SUPPORT_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-[#0068ff] hover:bg-[#0052cc] text-white text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">
                support_agent
              </span>
              <span>Zalo hỗ trợ: Hotline Anh ngữ ASI</span>
            </a>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <a
              href={ZALO_SUPPORT_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-[#0068ff] hover:bg-[#0052cc] text-white text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">
                support_agent
              </span>
              <span>Zalo hỗ trợ: Hotline Anh ngữ ASI</span>
            </a>

            <form onSubmit={handleRedeemOneTimeCode} className="space-y-2">
              <label className="block text-xs font-extrabold text-stone-700">
                Nhập Email tài khoản & Mã kích hoạt 1 lần (do Zalo hỗ trợ cấp):
              </label>
              <input
                type="email"
                value={currentUserEmail || emailForCode}
                onChange={(e) => {
                  setEmailForCode(e.target.value);
                  setCodeError('');
                }}
                readOnly={Boolean(currentUserEmail)}
                placeholder="Email tài khoản đã chuyển khoản..."
                className="w-full px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs sm:text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={activationCode}
                  onChange={(e) => {
                    setActivationCode(e.target.value.toUpperCase());
                    setCodeError('');
                  }}
                  placeholder="VD: SC-8F3K9A..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm font-black uppercase text-stone-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={isRedeeming}
                  className={`px-4 py-2.5 rounded-xl ${config.accentBg} text-white text-xs sm:text-sm font-black cursor-pointer shrink-0`}
                >
                  {isRedeeming ? 'Đang kiểm tra...' : 'Kích hoạt'}
                </button>
              </div>
              {codeError && (
                <p className="text-xs font-bold text-rose-600">{codeError}</p>
              )}
              {codeSuccess && (
                <p className="text-xs font-bold text-emerald-700">
                  {codeSuccess}
                </p>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
