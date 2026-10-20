import React, { useEffect, useState } from 'react';
import { CourseKey } from '../utils/courseCoverStorage';
import { findBrightestVideoCutThumbnail } from '../utils/videoFrameExtractor';
import { subscribeVideoUpdates } from '../utils/videoStorage';

interface CourseCoverArtProps {
  courseKey: CourseKey;
  className?: string;
}

export function CourseCoverArt({
  courseKey,
  className = 'w-full h-full',
}: CourseCoverArtProps) {
  const [videoCutThumbnail, setVideoCutThumbnail] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    const refreshVideoCutCover = async () => {
      if (courseKey === 'tune-in' || courseKey === 'magic-sounds') {
        const bestUrl = await findBrightestVideoCutThumbnail(courseKey);
        if (mounted && bestUrl) {
          setVideoCutThumbnail(bestUrl);
        }
      }
    };

    refreshVideoCutCover();

    const unsub = subscribeVideoUpdates(() => {
      refreshVideoCutCover();
    });
    window.addEventListener('phonics-shadow-image-updated', refreshVideoCutCover);

    return () => {
      mounted = false;
      unsub();
      window.removeEventListener(
        'phonics-shadow-image-updated',
        refreshVideoCutCover
      );
    };
  }, [courseKey]);

  // 1. KHOÁ TUNE IN: Lấy hình đại diện là hình cắt từ video chỗ có phát ra âm nhỏ màu đỏ (chọn hình tươi sáng nhất)
  if (courseKey === 'tune-in') {
    if (videoCutThumbnail) {
      return (
        <img
          src={videoCutThumbnail}
          alt="Tune In"
          className={`${className} object-cover`}
        />
      );
    }

    // Khung hình video tươi sáng với biểu tượng phát ra âm nhỏ màu đỏ (khi trình duyệt chưa nạp file video cục bộ)
    return (
      <svg
        viewBox="0 0 320 220"
        className={`${className} object-cover`}
        preserveAspectRatio="xMidYMid slice"
        aria-label="Hình cắt từ video Tune In chỗ phát ra âm nhỏ màu đỏ"
      >
        {/* Bầu trời xanh sáng & đồi nắng vàng tươi từ cảnh video */}
        <rect width="320" height="220" fill="#7dd3fc" />
        <circle cx="268" cy="44" r="24" fill="#fde047" stroke="#facc15" strokeWidth="4" />
        <path d="M0 138 Q160 112 320 138 L320 220 L0 220 Z" fill="#4ade80" />
        <path d="M0 166 Q160 148 320 168 L320 220 L0 220 Z" fill="#86efac" />

        {/* Nhân vật hoạt hình đang phát âm trong cảnh video */}
        <circle cx="116" cy="112" r="36" fill="#fed7aa" stroke="#ea580c" strokeWidth="3" />
        <path d="M84 98 Q116 64 148 98" fill="#7c2d12" />
        <circle cx="104" cy="106" r="4.5" fill="#1e293b" />
        <circle cx="128" cy="106" r="4.5" fill="#1e293b" />
        {/* Khẩu hình miệng bật ra âm */}
        <ellipse cx="122" cy="124" rx="10" ry="7" fill="#e11d48" />

        {/* Sóng âm màu đỏ phát ra từ miệng */}
        <path
          d="M 146 112 Q 156 124 146 136"
          fill="none"
          stroke="#e11d48"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 158 104 Q 172 124 158 144"
          fill="none"
          stroke="#e11d48"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Biểu tượng phát ra âm nhỏ màu đỏ nổi bật trong cảnh video */}
        <g transform="translate(174, 66)">
          <circle cx="48" cy="48" r="40" fill="#ffffff" stroke="#e11d48" strokeWidth="5" />
          <circle cx="48" cy="48" r="33" fill="#fff1f2" />
          <text
            x="44"
            y="60"
            textAnchor="middle"
            fill="#e11d48"
            fontFamily="Plus Jakarta Sans, sans-serif"
            fontSize="40"
            fontWeight="900"
          >
            s
          </text>
          {/* Loa phát âm nhỏ màu đỏ */}
          <circle cx="78" cy="20" r="14" fill="#e11d48" />
          <path d="M72 17 L76 17 L81 13 L81 27 L76 23 L72 23 Z" fill="#ffffff" />
        </g>
      </svg>
    );
  }

  // 2. KHOÁ MAGIC SOUNDS: Lấy hình đại diện là hình cắt từ video chỗ có phát ra âm nhỏ màu đỏ (chọn hình tươi sáng nhất)
  if (courseKey === 'magic-sounds') {
    if (videoCutThumbnail) {
      return (
        <img
          src={videoCutThumbnail}
          alt="Magic Sounds"
          className={`${className} object-cover`}
        />
      );
    }

    // Khung hình video tươi sáng với biểu tượng phát ra âm nhỏ màu đỏ (khi trình duyệt chưa nạp file video cục bộ)
    return (
      <svg
        viewBox="0 0 320 220"
        className={`${className} object-cover`}
        preserveAspectRatio="xMidYMid slice"
        aria-label="Hình cắt từ video Magic Sounds chỗ phát ra âm nhỏ màu đỏ"
      >
        {/* Nền cảnh video tươi sáng rực rỡ */}
        <rect width="320" height="220" fill="#bae6fd" />
        <circle cx="54" cy="44" r="24" fill="#fde047" stroke="#f59e0b" strokeWidth="4" />
        <path d="M0 140 Q160 116 320 142 L320 220 L0 220 Z" fill="#fde047" />
        <path d="M0 165 Q160 145 320 168 L320 220 L0 220 Z" fill="#4ade80" />

        {/* Cảnh minh họa âm /a/ - Con kiến & Quả táo đỏ tươi sáng trong video */}
        <circle cx="108" cy="118" r="34" fill="#ef4444" stroke="#b91c1c" strokeWidth="3" />
        <path d="M108 82 Q116 70 128 76" fill="none" stroke="#15803d" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="122" cy="76" rx="10" ry="5" fill="#22c55e" />

        {/* Sóng âm màu đỏ phát ra */}
        <path
          d="M 150 104 Q 162 118 150 132"
          fill="none"
          stroke="#e11d48"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M 162 96 Q 178 118 162 140"
          fill="none"
          stroke="#e11d48"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Biểu tượng phát ra âm nhỏ màu đỏ nổi bật trong cảnh video */}
        <g transform="translate(178, 64)">
          <circle cx="48" cy="48" r="40" fill="#ffffff" stroke="#e11d48" strokeWidth="5" />
          <circle cx="48" cy="48" r="33" fill="#fff1f2" />
          <text
            x="44"
            y="60"
            textAnchor="middle"
            fill="#e11d48"
            fontFamily="Plus Jakarta Sans, sans-serif"
            fontSize="40"
            fontWeight="900"
          >
            a
          </text>
          {/* Loa phát âm nhỏ màu đỏ */}
          <circle cx="78" cy="20" r="14" fill="#e11d48" />
          <path d="M72 17 L76 17 L81 13 L81 27 L76 23 L72 23 Z" fill="#ffffff" />
        </g>
      </svg>
    );
  }

  if (courseKey === 'sound-code') {
    return (
      <svg
        viewBox="0 0 320 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="codeBg" x1="0" y1="0" x2="320" y2="220" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="55%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#312E81" />
          </linearGradient>
        </defs>

        <rect width="320" height="220" fill="url(#codeBg)" />

        {/* Subtle grid lines */}
        <line x1="0" y1="55" x2="320" y2="55" stroke="#FFFFFF" strokeOpacity="0.06" />
        <line x1="0" y1="110" x2="320" y2="110" stroke="#FFFFFF" strokeOpacity="0.06" />
        <line x1="80" y1="0" x2="80" y2="220" stroke="#FFFFFF" strokeOpacity="0.06" />
        <line x1="240" y1="0" x2="240" y2="220" stroke="#FFFFFF" strokeOpacity="0.06" />

        {/* IPA Phonetic Cards */}
        <rect x="38" y="34" width="72" height="50" rx="12" fill="#312E81" stroke="#818CF8" strokeWidth="2" />
        <text x="74" y="66" textAnchor="middle" fill="#E0E7FF" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="22" fontWeight="900">/iː/</text>

        <rect x="124" y="28" width="72" height="54" rx="14" fill="#4338CA" stroke="#A5B4FC" strokeWidth="2.5" />
        <text x="160" y="62" textAnchor="middle" fill="#FFFFFF" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="24" fontWeight="900">/eɪ/</text>

        <rect x="210" y="34" width="72" height="50" rx="12" fill="#312E81" stroke="#818CF8" strokeWidth="2" />
        <text x="246" y="66" textAnchor="middle" fill="#E0E7FF" fontFamily="Plus Jakarta Sans, sans-serif" fontSize="22" fontWeight="900">/ʃ/</text>

        {/* Syllable Decoder Bar */}
        <rect x="52" y="100" width="216" height="44" rx="12" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
        <text
          x="160"
          y="128"
          textAnchor="middle"
          fill="#38BDF8"
          fontFamily="Plus Jakarta Sans, sans-serif"
          fontSize="17"
          fontWeight="900"
          letterSpacing="1"
        >
          un · der · stand
        </text>

        {/* Bottom Ribbon Label */}
        <rect x="58" y="162" width="204" height="34" rx="17" fill="#F8FAFC" />
        <text
          x="160"
          y="184"
          textAnchor="middle"
          fill="#0F172A"
          fontFamily="Plus Jakarta Sans, sans-serif"
          fontSize="15"
          fontWeight="900"
        >
          SOUND CODE • IPA 12+
        </text>
      </svg>
    );
  }

  // 4. KHOÁ MIMIC (sound-to-speech): Hình đại diện tươi sáng, trực quan (Nghe & Nhại theo giọng bản xứ tự nhiên)
  return (
    <svg
      viewBox="0 0 320 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} object-cover`}
      preserveAspectRatio="xMidYMid slice"
      aria-label="Mimic - Nghe đúng khối âm, nói tự nhiên"
    >
      <defs>
        <linearGradient id="mimicSkyBg" x1="0" y1="0" x2="320" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#CCFBF1" />
          <stop offset="55%" stopColor="#E0F2FE" />
          <stop offset="100%" stopColor="#FEF3C7" />
        </linearGradient>
      </defs>

      {/* Nền tươi sáng trong trẻo */}
      <rect width="320" height="220" fill="url(#mimicSkyBg)" />
      <circle cx="276" cy="40" r="22" fill="#FDE047" stroke="#F59E0B" strokeWidth="3.5" />
      <path d="M0 156 Q160 132 320 156 L320 220 L0 220 Z" fill="#6EE7B7" />
      <path d="M0 176 Q160 158 320 178 L320 220 L0 220 Z" fill="#34D399" />

      {/* Nhân vật trẻ đeo tai nghe đang nghe & nhại lại (Mimic) */}
      <g transform="translate(24, 48)">
        {/* Vòng tai nghe */}
        <path
          d="M20 62 C20 22, 84 22, 84 62"
          stroke="#0D9488"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        {/* Khuôn mặt tươi tắn */}
        <circle cx="52" cy="68" r="32" fill="#FED7AA" stroke="#EA580C" strokeWidth="3" />
        {/* Tóc */}
        <path d="M22 58 Q52 24 82 58" fill="#7C2D12" />
        {/* Ốp tai nghe 2 bên */}
        <rect x="12" y="52" width="12" height="26" rx="6" fill="#0F766E" stroke="#FFFFFF" strokeWidth="2" />
        <rect x="80" y="52" width="12" height="26" rx="6" fill="#0F766E" stroke="#FFFFFF" strokeWidth="2" />
        {/* Mắt sáng & miệng cười mở phát âm */}
        <circle cx="41" cy="64" r="4" fill="#1E293B" />
        <circle cx="63" cy="64" r="4" fill="#1E293B" />
        <ellipse cx="55" cy="80" rx="9" ry="6.5" fill="#E11D48" />
      </g>

      {/* Sóng âm thanh truyền tới & bật ra */}
      <path
        d="M122 106 Q134 118 122 130"
        fill="none"
        stroke="#0D9488"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M133 98 Q149 118 133 138"
        fill="none"
        stroke="#0D9488"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Bóng thoại phát âm nối âm tự nhiên */}
      <g transform="translate(148, 34)">
        <rect x="0" y="0" width="152" height="78" rx="20" fill="#FFFFFF" stroke="#0D9488" strokeWidth="3.5" />
        <path d="M0 48 L-14 58 L4 62 Z" fill="#FFFFFF" stroke="#0D9488" strokeWidth="3" strokeLinejoin="round" />
        <text
          x="76"
          y="34"
          textAnchor="middle"
          fill="#065F46"
          fontFamily="Plus Jakarta Sans, sans-serif"
          fontSize="16"
          fontWeight="900"
        >
          wake‿up‿at
        </text>
        {/* Nhịp sóng âm mẫu */}
        <g stroke="#10B981" strokeWidth="4" strokeLinecap="round">
          <line x1="34" y1="56" x2="34" y2="64" />
          <line x1="48" y1="50" x2="48" y2="66" />
          <line x1="62" y1="54" x2="62" y2="64" />
          <line x1="76" y1="46" x2="76" y2="68" />
          <line x1="90" y1="52" x2="90" y2="66" />
          <line x1="104" y1="48" x2="104" y2="66" />
          <line x1="118" y1="55" x2="118" y2="64" />
        </g>
      </g>

      {/* Nhãn MIMIC nổi bật ở dưới */}
      <rect x="64" y="164" width="192" height="36" rx="18" fill="#065F46" stroke="#FFFFFF" strokeWidth="2.5" />
      <text
        x="160"
        y="187"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="Plus Jakarta Sans, sans-serif"
        fontSize="16"
        fontWeight="900"
        letterSpacing="1"
      >
        MIMIC • MIỄN PHÍ
      </text>
    </svg>
  );
}
