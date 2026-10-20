import React from 'react';

interface SpeldFlipbookIllustrationProps {
  bookId: string; // 'speld-g1-b1' | 'speld-g1-b2' | 'speld-g1-b3' | 'speld-g1-b4' | 'speld-g1-b5'
  pageNumber: number; // 1..8
  fallbackImg?: string;
  alt?: string;
}

/**
 * Vẽ nhân vật kiến Sant (Sant the honey ant) chuẩn SPELD SA:
 * Đầu tròn nâu, mắt to trắng đen, râu cong, bụng tròn vàng sọc đen.
 */
function SantAntCharacter({
  x,
  y,
  scale = 1,
  isCrying = false,
  isSpinning = false,
  waveLeft = true,
}: {
  x: number;
  y: number;
  scale?: number;
  isCrying?: boolean;
  isSpinning?: boolean;
  waveLeft?: boolean;
}) {
  return (
    <g
      transform={`translate(${x}, ${y}) scale(${scale}) ${
        isSpinning ? 'rotate(-22)' : ''
      }`}
    >
      {/* Bóng đổ dưới chân */}
      <ellipse cx="0" cy="78" rx="45" ry="9" fill="rgba(0,0,0,0.22)" />

      {/* Bụng kiến vàng sọc đen (Honey ant abdomen) */}
      <g transform="translate(26, 36)">
        <ellipse
          cx="18"
          cy="12"
          rx="28"
          ry="24"
          fill="#f59e0b"
          stroke="#451a03"
          strokeWidth="2.5"
        />
        <path
          d="M 8 -10 Q 14 4 8 18"
          stroke="#1c1917"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 24 -9 Q 30 5 24 20"
          stroke="#1c1917"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Thân giữa (Thorax) */}
      <ellipse
        cx="0"
        cy="26"
        rx="12"
        ry="22"
        fill="#854d0e"
        stroke="#451a03"
        strokeWidth="2.5"
      />
      <line x1="-11" y1="20" x2="11" y2="20" stroke="#451a03" strokeWidth="2" />
      <line x1="-11" y1="32" x2="11" y2="32" stroke="#451a03" strokeWidth="2" />

      {/* Chân kiến */}
      <path
        d="M -6 44 L -16 72 L -28 74"
        stroke="#854d0e"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M 6 44 L 14 72 L 26 74"
        stroke="#854d0e"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Tay kiến */}
      <path
        d={waveLeft ? 'M -10 14 L -34 -4' : 'M -10 18 L -32 28'}
        stroke="#854d0e"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx={waveLeft ? -36 : -34} cy={waveLeft ? -6 : 29} r="5" fill="#854d0e" />

      <path
        d="M 10 14 L 34 -4"
        stroke="#854d0e"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="36" cy="-6" r="5" fill="#854d0e" />

      {/* Đầu kiến */}
      <ellipse
        cx="0"
        cy="-16"
        rx="28"
        ry="24"
        fill="#92400e"
        stroke="#451a03"
        strokeWidth="2.5"
      />

      {/* 2 Râu kiến */}
      <path
        d="M -10 -38 Q -24 -64 -38 -48"
        stroke="#78350f"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 10 -38 Q 24 -64 38 -48"
        stroke="#78350f"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Mắt to */}
      <ellipse
        cx="-9"
        cy="-18"
        rx="8.5"
        ry="10.5"
        fill="#ffffff"
        stroke="#1c1917"
        strokeWidth="2"
      />
      <ellipse
        cx="9"
        cy="-18"
        rx="8.5"
        ry="10.5"
        fill="#ffffff"
        stroke="#1c1917"
        strokeWidth="2"
      />
      <circle cx="-6" cy="-16" r="4" fill="#1c1917" />
      <circle cx="6" cy="-16" r="4" fill="#1c1917" />
      <circle cx="-4.5" cy="-18" r="1.5" fill="#ffffff" />
      <circle cx="7.5" cy="-18" r="1.5" fill="#ffffff" />

      {/* Lông mày */}
      {isCrying ? (
        <>
          <line x1="-18" y1="-28" x2="-4" y2="-33" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />
          <line x1="4" y1="-33" x2="18" y2="-28" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M -17 -31 Q -9 -36 -2 -31" stroke="#1c1917" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 2 -31 Q 9 -36 17 -31" stroke="#1c1917" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* Miệng */}
      {isCrying ? (
        <ellipse cx="2" cy="-1" rx="7" ry="9" fill="#450a0a" stroke="#1c1917" strokeWidth="2" />
      ) : (
        <path
          d="M -6 -3 Q 4 7 12 -2"
          fill="#7f1d1d"
          stroke="#1c1917"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

/**
 * Vẽ chú cún Tan-Tan (nâu đốm trắng đáng yêu)
 */
function TanTanPuppy({
  x,
  y,
  scale = 1,
  isSitting = true,
}: {
  x: number;
  y: number;
  scale?: number;
  isSitting?: boolean;
}) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <ellipse cx="5" cy="58" rx="44" ry="9" fill="rgba(0,0,0,0.2)" />
      {/* Đuôi vẫy */}
      <path
        d="M 35 32 Q 58 18 52 -2 Q 46 18 30 24 Z"
        fill="#a1805b"
        stroke="#292524"
        strokeWidth="2.5"
      />
      {/* Thân cún */}
      <ellipse
        cx="8"
        cy={isSitting ? 28 : 22}
        rx="28"
        ry={isSitting ? 26 : 20}
        fill="#a1805b"
        stroke="#292524"
        strokeWidth="2.5"
      />
      {/* Đốm trắng trên lưng và ngực */}
      <ellipse cx="16" cy="20" rx="12" ry="7" fill="#ffffff" />
      <ellipse cx="-8" cy="28" rx="9" ry="14" fill="#ffffff" />

      {/* Chân trước & sau */}
      <rect
        x="-14"
        y="34"
        width="11"
        height="24"
        rx="5"
        fill="#a1805b"
        stroke="#292524"
        strokeWidth="2.5"
      />
      <rect
        x="2"
        y="34"
        width="11"
        height="24"
        rx="5"
        fill="#a1805b"
        stroke="#292524"
        strokeWidth="2.5"
      />
      <ellipse
        cx="24"
        cy="48"
        rx="13"
        ry="9"
        fill="#a1805b"
        stroke="#292524"
        strokeWidth="2.5"
      />

      {/* Đầu cún */}
      <g transform="translate(-14, -12)">
        <circle
          cx="0"
          cy="0"
          r="24"
          fill="#a1805b"
          stroke="#292524"
          strokeWidth="2.5"
        />
        {/* Vệt trắng dọc sống mũi */}
        <path d="M -4 -22 L 4 -22 L 8 14 L -12 14 Z" fill="#ffffff" />
        {/* Tai cụp */}
        <path
          d="M 14 -16 Q 30 -10 26 10 Q 16 12 14 -4 Z"
          fill="#8c6d4c"
          stroke="#292524"
          strokeWidth="2.5"
        />
        {/* Mõm trắng & mũi nâu */}
        <ellipse
          cx="-10"
          cy="8"
          rx="14"
          ry="11"
          fill="#ffffff"
          stroke="#292524"
          strokeWidth="2"
        />
        <ellipse cx="-14" cy="4" rx="6" ry="4.5" fill="#451a03" />
        {/* Miệng cười lưỡi đỏ */}
        <path d="M -12 12 Q -4 22 2 12 Z" fill="#dc2626" stroke="#292524" strokeWidth="1.8" />
        {/* Mắt to */}
        <ellipse cx="-8" cy="-4" rx="5" ry="6.5" fill="#1c1917" />
        <ellipse cx="6" cy="-2" rx="5" ry="6.5" fill="#1c1917" />
        <circle cx="-6.5" cy="-6" r="2" fill="#ffffff" />
        <circle cx="7.5" cy="-4" r="2" fill="#ffffff" />
      </g>
    </g>
  );
}

/**
 * Vẽ nhân vật trẻ em trong truyện (Ann, Pat, Pip, Tan, Nat)
 */
function KidCharacter({
  x,
  y,
  scale = 1,
  shirtColor = '#9333ea',
  pantsColor = '#f472b6',
  name = '',
  isSitting = false,
  isCoveringEyes = false,
  isPanting = false,
  hasTornPants = false,
}: {
  x: number;
  y: number;
  scale?: number;
  shirtColor?: string;
  pantsColor?: string;
  name?: string;
  isSitting?: boolean;
  isCoveringEyes?: boolean;
  isPanting?: boolean;
  hasTornPants?: boolean;
}) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <ellipse cx="0" cy={isSitting ? 62 : 85} rx="26" ry="7" fill="rgba(0,0,0,0.18)" />

      {/* Chân */}
      {isSitting ? (
        <g>
          <ellipse
            cx="-12"
            cy="54"
            rx="18"
            ry="7"
            fill={pantsColor}
            stroke="#1c1917"
            strokeWidth="2"
          />
          <ellipse
            cx="12"
            cy="54"
            rx="18"
            ry="7"
            fill={pantsColor}
            stroke="#1c1917"
            strokeWidth="2"
          />
        </g>
      ) : (
        <g>
          <rect
            x="-15"
            y="38"
            width="12"
            height="34"
            rx="4"
            fill={pantsColor}
            stroke="#1c1917"
            strokeWidth="2"
          />
          <rect
            x="3"
            y="38"
            width="12"
            height="34"
            rx="4"
            fill={pantsColor}
            stroke="#1c1917"
            strokeWidth="2"
          />
          {hasTornPants && (
            <path
              d="M 4 54 L 10 51 L 8 57 L 14 55"
              stroke="#451a03"
              strokeWidth="2.5"
              fill="none"
            />
          )}
          <ellipse cx="-11" cy="76" rx="9" ry="4.5" fill="#78350f" stroke="#1c1917" strokeWidth="1.8" />
          <ellipse cx="11" cy="76" rx="9" ry="4.5" fill="#78350f" stroke="#1c1917" strokeWidth="1.8" />
        </g>
      )}

      {/* Áo */}
      <rect
        x="-18"
        y="4"
        width="36"
        height="38"
        rx="8"
        fill={shirtColor}
        stroke="#1c1917"
        strokeWidth="2"
      />

      {/* Tay */}
      {isCoveringEyes ? (
        <>
          <path
            d="M -18 14 Q -28 -6 -8 -16"
            stroke="#78350f"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 18 14 Q 28 -6 8 -16"
            stroke="#78350f"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />
        </>
      ) : (
        <>
          <path
            d={isPanting ? 'M -18 14 L -28 28 L -16 36' : 'M -18 14 L -32 2'}
            stroke="#78350f"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d={isPanting ? 'M 18 14 L 28 28 L 16 36' : 'M 18 14 L 34 4'}
            stroke="#78350f"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </>
      )}

      {/* Đầu */}
      <circle
        cx="0"
        cy="-18"
        r="20"
        fill="#78350f"
        stroke="#1c1917"
        strokeWidth="2"
      />
      {/* Tóc */}
      <path
        d="M -20 -22 Q -16 -42 0 -40 Q 18 -42 20 -22 Q 10 -30 -20 -22 Z"
        fill="#1c1917"
      />

      {/* Mắt hoặc tay che mắt */}
      {isCoveringEyes ? (
        <g>
          <rect x="-13" y="-26" width="11" height="14" rx="4" fill="#92400e" stroke="#1c1917" strokeWidth="1.5" />
          <rect x="2" y="-26" width="11" height="14" rx="4" fill="#92400e" stroke="#1c1917" strokeWidth="1.5" />
        </g>
      ) : (
        <g>
          <circle cx="-7" cy="-20" r="3.5" fill="#ffffff" />
          <circle cx="7" cy="-20" r="3.5" fill="#ffffff" />
          <circle cx="-6.5" cy="-20" r="1.8" fill="#1c1917" />
          <circle cx="7.5" cy="-20" r="1.8" fill="#1c1917" />
        </g>
      )}

      {/* Miệng */}
      <path
        d="M -6 -10 Q 0 -4 6 -10"
        stroke="#1c1917"
        strokeWidth="2"
        fill={isPanting ? '#f87171' : 'none'}
        strokeLinecap="round"
      />

      {/* Nhãn tên nhỏ trên áo */}
      {name && (
        <text
          x="0"
          y="27"
          textAnchor="middle"
          fontSize="10"
          fontWeight="bold"
          fill="#ffffff"
        >
          {name}
        </text>
      )}
    </g>
  );
}

/**
 * Vẽ chiếc lon thiếc (Tin can)
 */
function TinCan({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotate})`}>
      <rect
        x="-20"
        y="-26"
        width="40"
        height="52"
        rx="4"
        fill="#b45309"
        stroke="#451a03"
        strokeWidth="2"
      />
      <ellipse
        cx="0"
        cy="-26"
        rx="20"
        ry="6"
        fill="#d97706"
        stroke="#451a03"
        strokeWidth="2"
      />
      <line x1="-18" y1="-12" x2="18" y2="-12" stroke="#92400e" strokeWidth="1.5" />
      <line x1="-18" y1="0" x2="18" y2="0" stroke="#92400e" strokeWidth="1.5" />
      <line x1="-18" y1="12" x2="18" y2="12" stroke="#92400e" strokeWidth="1.5" />
    </g>
  );
}

/**
 * Vẽ con kiến đen nhỏ (Black ant)
 */
function SmallBlackAnt({ x, y, scale = 1, rotate = 0 }: { x: number; y: number; scale?: number; rotate?: number }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale}) rotate(${rotate})`}>
      <ellipse cx="-14" cy="0" rx="8" ry="6" fill="#27272a" stroke="#09090b" strokeWidth="1.5" />
      <ellipse cx="0" cy="0" rx="6" ry="4.5" fill="#27272a" stroke="#09090b" strokeWidth="1.5" />
      <ellipse cx="14" cy="-2" rx="7" ry="5.5" fill="#27272a" stroke="#09090b" strokeWidth="1.5" />
      <circle cx="16" cy="-3" r="1.5" fill="#ffffff" />
      <path d="M -8 4 L -12 13 M 0 4 L 0 13 M 8 4 L 12 13" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
      <path d="M 19 -6 Q 24 -14 28 -10" stroke="#18181b" strokeWidth="1.8" fill="none" />
    </g>
  );
}

export const SpeldFlipbookIllustration: React.FC<SpeldFlipbookIllustrationProps> = ({
  bookId,
  pageNumber,
  fallbackImg,
  alt,
}) => {
  // BOOK 2: Sant the ant (4 pages)
  if (bookId === 'speld-g1-b2') {
    return (
      <svg viewBox="0 0 400 320" className="w-full h-full object-cover rounded-2xl bg-[#fde68a]">
        {/* Bầu trời & Nền cát đỏ Outback */}
        <rect x="0" y="0" width="400" height="115" fill="#7dd3fc" />
        <path d="M 0 110 Q 120 95 260 112 T 400 105 L 400 320 L 0 320 Z" fill="#d97706" />
        <path d="M 0 140 Q 180 125 400 145 L 400 320 L 0 320 Z" fill="#b45309" opacity="0.35" />

        {/* Bụi cây sa mạc */}
        <path d="M 45 110 L 30 65 M 45 110 L 48 60 M 45 110 L 65 72" stroke="#3f6212" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 330 108 L 315 70 M 330 108 L 335 65 M 330 108 L 350 75" stroke="#3f6212" strokeWidth="3.5" strokeLinecap="round" />

        {pageNumber === 1 && (
          <g>
            <SantAntCharacter x={190} y={175} scale={1.25} />
          </g>
        )}

        {pageNumber === 2 && (
          <g>
            {/* Sant ngồi trong lon thiếc */}
            <SantAntCharacter x={200} y={155} scale={1.05} />
            <g transform="translate(200, 225)">
              <rect x="-52" y="-45" width="104" height="95" rx="8" fill="#9a3412" stroke="#451a03" strokeWidth="3" />
              <ellipse cx="0" cy="-45" rx="52" ry="12" fill="#b45309" stroke="#451a03" strokeWidth="3" />
              <line x1="-48" y1="-15" x2="48" y2="-15" stroke="#7c2d12" strokeWidth="2.5" />
              <line x1="-48" y1="15" x2="48" y2="15" stroke="#7c2d12" strokeWidth="2.5" />
            </g>
          </g>
        )}

        {pageNumber === 3 && (
          <g>
            {/* Sant ngồi cạnh vòi nước đang chảy */}
            <SantAntCharacter x={145} y={185} scale={1.1} />
            {/* Vòi nước (Tap) */}
            <g transform="translate(295, 135)">
              <rect x="45" y="0" width="18" height="165" fill="#64748b" stroke="#1e293b" strokeWidth="2.5" />
              <path d="M 50 18 L -20 18 L -20 48 L 0 48 L 0 34 L 50 34 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5" />
              <rect x="-35" y="0" width="42" height="10" rx="4" fill="#0284c7" stroke="#1e293b" strokeWidth="2" />
              {/* Dòng nước chảy */}
              <path d="M -16 52 Q -10 110 -18 175" stroke="#bae6fd" strokeWidth="12" strokeLinecap="round" fill="none" />
              <path d="M -12 52 Q -6 110 -12 175" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" fill="none" />
            </g>
          </g>
        )}

        {pageNumber === 4 && (
          <g>
            {/* Sant ngồi trúng chiếc kim băng (pin) và kêu a-a-a! */}
            <SantAntCharacter x={155} y={165} scale={1.15} isCrying={true} />
            {/* Kim băng (Safety pin) */}
            <g transform="translate(245, 240) rotate(-20)">
              <line x1="-35" y1="-10" x2="25" y2="30" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
              <line x1="25" y1="-25" x2="25" y2="30" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" />
              <circle cx="25" cy="30" r="10" fill="none" stroke="#94a3b8" strokeWidth="5" />
              <rect x="16" y="-36" width="18" height="16" rx="4" fill="#94a3b8" stroke="#334155" strokeWidth="2" />
            </g>
            {/* Bóng thoại a-a-a! */}
            <g transform="translate(285, 85)">
              <ellipse cx="0" cy="0" rx="72" ry="38" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
              <path d="M -45 26 L -72 44 L -25 34 Z" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
              <text x="0" y="8" textAnchor="middle" fontSize="26" fontWeight="bold" fill="#dc2626">
                a-a-a!
              </text>
            </g>
          </g>
        )}
      </svg>
    );
  }

  // BOOK 1: It (8 pages)
  if (bookId === 'speld-g1-b1') {
    return (
      <svg viewBox="0 0 400 320" className="w-full h-full object-cover rounded-2xl bg-[#cbd5e1]">
        {/* Sân trường & Vạch kẻ nhảy lò cò */}
        <rect x="0" y="0" width="400" height="105" fill="#93c5fd" />
        <rect x="30" y="35" width="340" height="75" fill="#64748b" stroke="#334155" strokeWidth="2" />
        <rect x="0" y="105" width="400" height="215" fill="#a8a29e" />
        <line x1="40" y1="220" x2="360" y2="290" stroke="#f5f5f4" strokeWidth="4" opacity="0.7" />
        <line x1="80" y1="295" x2="340" y2="210" stroke="#f5f5f4" strokeWidth="4" opacity="0.7" />

        {pageNumber === 1 && (
          <g>
            <KidCharacter x={65} y={165} scale={0.85} shirtColor="#f97316" pantsColor="#38bdf8" name="Pip" />
            <KidCharacter x={130} y={155} scale={0.9} shirtColor="#94a3b8" pantsColor="#1e3a8a" name="Tan" />
            <KidCharacter x={200} y={145} scale={0.95} shirtColor="#facc15" pantsColor="#64748b" name="Pat" />
            <KidCharacter x={270} y={160} scale={0.9} shirtColor="#9333ea" pantsColor="#f472b6" name="Ann" />
            <KidCharacter x={340} y={150} scale={0.92} shirtColor="#38bdf8" pantsColor="#1d4ed8" name="Nat" />
          </g>
        )}

        {pageNumber === 2 && (
          <g>
            <KidCharacter x={75} y={145} scale={0.8} shirtColor="#94a3b8" pantsColor="#1e3a8a" name="Tan" />
            <KidCharacter x={140} y={150} scale={0.85} shirtColor="#facc15" pantsColor="#64748b" name="Pat" />
            <KidCharacter x={285} y={150} scale={0.82} shirtColor="#f97316" pantsColor="#38bdf8" name="Pip" />
            <KidCharacter x={345} y={140} scale={0.85} shirtColor="#38bdf8" pantsColor="#1d4ed8" name="Nat" />
            <KidCharacter x={210} y={185} scale={1.15} shirtColor="#9333ea" pantsColor="#f472b6" name="Ann" isCoveringEyes={true} />
          </g>
        )}

        {pageNumber === 3 && (
          <g>
            <KidCharacter x={120} y={160} scale={0.95} shirtColor="#9333ea" pantsColor="#f472b6" name="Ann" />
            <KidCharacter x={205} y={155} scale={0.95} shirtColor="#38bdf8" pantsColor="#1d4ed8" name="Nat" />
            <KidCharacter x={310} y={210} scale={0.95} shirtColor="#38bdf8" pantsColor="#1d4ed8" name="Nat" isSitting={true} />
          </g>
        )}

        {pageNumber === 4 && (
          <g>
            <KidCharacter x={115} y={205} scale={0.95} shirtColor="#94a3b8" pantsColor="#1e3a8a" name="Pip" isSitting={true} />
            <KidCharacter x={245} y={155} scale={0.95} shirtColor="#9333ea" pantsColor="#f472b6" name="Ann" />
            <KidCharacter x={320} y={160} scale={0.9} shirtColor="#94a3b8" pantsColor="#1e3a8a" name="Pip" />
          </g>
        )}

        {pageNumber === 5 && (
          <g>
            <KidCharacter x={110} y={155} scale={0.92} shirtColor="#9333ea" pantsColor="#f472b6" name="Ann" />
            <KidCharacter x={185} y={155} scale={0.9} shirtColor="#f97316" pantsColor="#38bdf8" name="Tan" />
            <KidCharacter x={300} y={205} scale={0.98} shirtColor="#f97316" pantsColor="#38bdf8" name="Tan" isSitting={true} />
          </g>
        )}

        {pageNumber === 6 && (
          <g>
            <KidCharacter x={165} y={165} scale={1.05} shirtColor="#facc15" pantsColor="#64748b" name="Pat" />
            <KidCharacter x={255} y={165} scale={1.05} shirtColor="#9333ea" pantsColor="#f472b6" name="Ann" />
          </g>
        )}

        {pageNumber === 7 && (
          <g>
            <KidCharacter x={150} y={175} scale={1.15} shirtColor="#facc15" pantsColor="#64748b" name="Pat" isPanting={true} />
            <KidCharacter x={260} y={175} scale={1.15} shirtColor="#9333ea" pantsColor="#f472b6" name="Ann" isPanting={true} />
          </g>
        )}

        {pageNumber === 8 && (
          <g>
            <KidCharacter x={85} y={150} scale={0.85} shirtColor="#9333ea" pantsColor="#f472b6" name="Ann" />
            <KidCharacter x={305} y={155} scale={0.85} shirtColor="#f97316" pantsColor="#38bdf8" name="Pip" />
            <KidCharacter x={200} y={185} scale={1.15} shirtColor="#facc15" pantsColor="#64748b" name="Pat" isCoveringEyes={true} />
          </g>
        )}
      </svg>
    );
  }

  // BOOK 3: Tan-Tan sits (8 pages)
  if (bookId === 'speld-g1-b3') {
    return (
      <svg viewBox="0 0 400 320" className="w-full h-full object-cover rounded-2xl bg-[#fef3c7]">
        {/* Bầu trời & Rừng cây Khuynh Diệp */}
        <rect x="0" y="0" width="400" height="135" fill="#93c5fd" />
        <rect x="55" y="0" width="22" height="160" fill="#a8a29e" />
        <rect x="290" y="0" width="26" height="160" fill="#a8a29e" />
        <circle cx="65" cy="30" r="55" fill="#4d7c0f" opacity="0.85" />
        <circle cx="295" cy="35" r="65" fill="#3f6212" opacity="0.85" />
        <rect x="0" y="135" width="400" height="185" fill="#d6d3d1" />
        <path d="M 0 155 Q 200 140 400 160 L 400 320 L 0 320 Z" fill="#d97706" opacity="0.35" />

        {pageNumber === 1 && (
          <g>
            <KidCharacter x={105} y={145} scale={1.15} shirtColor="#9333ea" pantsColor="#1e3a8a" name="Nat" />
            <KidCharacter x={200} y={175} scale={0.92} shirtColor="#4ade80" pantsColor="#64748b" name="Pip" />
            <TanTanPuppy x={305} y={205} scale={0.95} isSitting={false} />
          </g>
        )}

        {pageNumber === 2 && (
          <g>
            <KidCharacter x={145} y={145} scale={1.15} shirtColor="#9333ea" pantsColor="#1e3a8a" name="Nat" />
            <TanTanPuppy x={265} y={205} scale={1.0} isSitting={false} />
          </g>
        )}

        {(pageNumber === 3 || pageNumber === 8) && (
          <g>
            <TanTanPuppy x={210} y={185} scale={1.45} isSitting={true} />
          </g>
        )}

        {pageNumber === 4 && (
          <g>
            <KidCharacter x={155} y={175} scale={1.05} shirtColor="#9333ea" pantsColor="#1e3a8a" name="Nat" isSitting={true} />
            <TanTanPuppy x={255} y={195} scale={1.1} isSitting={true} />
          </g>
        )}

        {pageNumber === 5 && (
          <g>
            <KidCharacter x={145} y={165} scale={1.05} shirtColor="#4ade80" pantsColor="#64748b" name="Pip" />
            <TanTanPuppy x={265} y={200} scale={1.05} isSitting={true} />
          </g>
        )}

        {pageNumber === 6 && (
          <g>
            <KidCharacter x={115} y={145} scale={1.12} shirtColor="#9333ea" pantsColor="#1e3a8a" name="Nat" />
            <KidCharacter x={205} y={175} scale={0.92} shirtColor="#4ade80" pantsColor="#64748b" name="Pip" />
            <TanTanPuppy x={300} y={205} scale={0.95} isSitting={true} />
          </g>
        )}

        {pageNumber === 7 && (
          <g>
            <KidCharacter x={155} y={180} scale={1.0} shirtColor="#4ade80" pantsColor="#64748b" name="Pip" isSitting={true} />
            <TanTanPuppy x={250} y={195} scale={1.1} isSitting={true} />
          </g>
        )}
      </svg>
    );
  }

  // BOOK 4: The tins sit (8 pages)
  if (bookId === 'speld-g1-b4') {
    return (
      <svg viewBox="0 0 400 320" className="w-full h-full object-cover rounded-2xl bg-[#e5e7eb]">
        {/* Tường tranh Bích Họa Đỏ Vàng (Mural Wall) & Sân Xi Măng */}
        <rect x="0" y="0" width="400" height="195" fill="#b91c1c" />
        <circle cx="95" cy="95" r="68" fill="#78716c" stroke="#facc15" strokeWidth="8" />
        <circle cx="245" cy="95" r="68" fill="#ea580c" stroke="#facc15" strokeWidth="8" />
        <rect x="0" y="195" width="400" height="125" fill="#9ca3af" />

        {pageNumber === 1 && (
          <g>
            <KidCharacter x={175} y={155} scale={1.1} shirtColor="#ec4899" pantsColor="#7e22ce" name="Nat" />
            <TinCan x={235} y={145} />
            <SantAntCharacter x={305} y={210} scale={0.65} />
          </g>
        )}

        {pageNumber === 2 && (
          <g>
            <TinCan x={95} y={245} />
            <TinCan x={145} y={235} />
            <TinCan x={255} y={245} />
            <KidCharacter x={185} y={155} scale={1.05} shirtColor="#ec4899" pantsColor="#7e22ce" name="Nat" />
            <SantAntCharacter x={315} y={210} scale={0.65} />
          </g>
        )}

        {pageNumber === 3 && (
          <g>
            <KidCharacter x={120} y={155} scale={1.05} shirtColor="#ec4899" pantsColor="#7e22ce" name="Nat" />
            {/* Tháp lon thiếc */}
            <TinCan x={205} y={255} />
            <TinCan x={250} y={255} />
            <TinCan x={295} y={255} />
            <TinCan x={228} y={203} />
            <TinCan x={273} y={203} />
            <TinCan x={180} y={135} />
            <SantAntCharacter x={345} y={205} scale={0.6} />
          </g>
        )}

        {pageNumber === 4 && (
          <g>
            {/* Tháp 6 lon thiếc */}
            <TinCan x={165} y={255} />
            <TinCan x={210} y={255} />
            <TinCan x={255} y={255} />
            <TinCan x={188} y={203} />
            <TinCan x={233} y={203} />
            <TinCan x={210} y={151} />
            <SantAntCharacter x={275} y={145} scale={0.75} />
          </g>
        )}

        {pageNumber === 5 && (
          <g>
            <TinCan x={165} y={255} />
            <TinCan x={210} y={255} />
            <TinCan x={255} y={255} />
            <TinCan x={188} y={203} />
            <TinCan x={233} y={203} />
            <TinCan x={210} y={151} />
            <SantAntCharacter x={315} y={205} scale={0.75} />
          </g>
        )}

        {pageNumber === 6 && (
          <g>
            <TinCan x={155} y={265} rotate={-75} />
            <TinCan x={210} y={255} />
            <TinCan x={255} y={255} />
            <TinCan x={190} y={200} rotate={-25} />
            <TinCan x={240} y={195} rotate={15} />
            <TinCan x={210} y={140} rotate={-35} />
            <SantAntCharacter x={310} y={165} scale={0.85} isSpinning={true} />
          </g>
        )}

        {pageNumber === 7 && (
          <g>
            <TinCan x={65} y={245} rotate={85} />
            <TinCan x={135} y={240} />
            <TinCan x={195} y={255} />
            <TinCan x={260} y={255} rotate={80} />
            <SantAntCharacter x={310} y={195} scale={0.8} isCrying={true} />
          </g>
        )}

        {pageNumber === 8 && (
          <g>
            <KidCharacter x={185} y={165} scale={1.15} shirtColor="#ec4899" pantsColor="#7e22ce" name="Nat" />
            <SantAntCharacter x={265} y={155} scale={0.55} />
          </g>
        )}
      </svg>
    );
  }

  // BOOK 5: Ants in Ann's pants (8 pages)
  if (bookId === 'speld-g1-b5') {
    return (
      <svg viewBox="0 0 400 320" className="w-full h-full object-cover rounded-2xl bg-[#fed7aa]">
        {/* Bầu trời & Đất cát đỏ */}
        <rect x="0" y="0" width="400" height="95" fill="#93c5fd" />
        <path d="M 0 95 Q 200 80 400 95 L 400 320 L 0 320 Z" fill="#d97706" />
        <ellipse cx="200" cy="245" rx="145" ry="48" fill="#b45309" opacity="0.45" />

        {pageNumber === 1 && (
          <g>
            <SmallBlackAnt x={145} y={195} scale={2.6} rotate={-10} />
            <SmallBlackAnt x={285} y={135} scale={2.1} rotate={-15} />
          </g>
        )}

        {pageNumber === 2 && (
          <g>
            <SmallBlackAnt x={85} y={165} scale={1.8} />
            <SmallBlackAnt x={145} y={215} scale={2.0} />
            <SmallBlackAnt x={215} y={155} scale={1.9} />
            <SmallBlackAnt x={265} y={210} scale={2.0} />
            <SmallBlackAnt x={335} y={175} scale={1.8} />
          </g>
        )}

        {pageNumber === 3 && (
          <g>
            <KidCharacter
              x={200}
              y={155}
              scale={1.15}
              shirtColor="#9333ea"
              pantsColor="#f472b6"
              name="Ann"
              hasTornPants={true}
            />
          </g>
        )}

        {pageNumber === 4 && (
          <g>
            {/* Cận cảnh chiếc quần hồng của Ann có vết rách ở đầu gối */}
            <rect x="145" y="40" width="44" height="190" rx="10" fill="#f472b6" stroke="#1c1917" strokeWidth="3" />
            <rect x="210" y="40" width="44" height="190" rx="10" fill="#f472b6" stroke="#1c1917" strokeWidth="3" />
            <path d="M 215 135 L 245 125 L 225 148 L 248 145" stroke="#451a03" strokeWidth="4" fill="#78350f" />
            <ellipse cx="160" cy="245" rx="28" ry="12" fill="#78350f" stroke="#1c1917" strokeWidth="2.5" />
            <ellipse cx="238" cy="245" rx="28" ry="12" fill="#78350f" stroke="#1c1917" strokeWidth="2.5" />
          </g>
        )}

        {pageNumber === 5 && (
          <g>
            <KidCharacter
              x={200}
              y={185}
              scale={1.2}
              shirtColor="#9333ea"
              pantsColor="#f472b6"
              name="Ann"
              isSitting={true}
            />
          </g>
        )}

        {pageNumber === 6 && (
          <g>
            <KidCharacter
              x={175}
              y={185}
              scale={1.18}
              shirtColor="#9333ea"
              pantsColor="#f472b6"
              name="Ann"
              isSitting={true}
            />
            <SmallBlackAnt x={245} y={255} scale={1.1} rotate={-15} />
            <SmallBlackAnt x={280} y={248} scale={1.1} rotate={-10} />
            <SmallBlackAnt x={315} y={258} scale={1.1} rotate={-15} />
            <SmallBlackAnt x={350} y={252} scale={1.1} rotate={-10} />
          </g>
        )}

        {pageNumber === 7 && (
          <g>
            {/* Cận cảnh đàn kiến bò vào ống quần hồng bị rách */}
            <rect x="60" y="135" width="150" height="58" rx="16" fill="#f472b6" stroke="#1c1917" strokeWidth="3" />
            <path d="M 175 140 L 202 160 L 180 185" stroke="#451a03" strokeWidth="4" fill="#78350f" />
            <SmallBlackAnt x={145} y={162} scale={1.3} rotate={180} />
            <SmallBlackAnt x={225} y={175} scale={1.5} rotate={170} />
            <SmallBlackAnt x={285} y={185} scale={1.5} rotate={165} />
            <SmallBlackAnt x={345} y={198} scale={1.5} rotate={165} />
          </g>
        )}

        {pageNumber === 8 && (
          <g>
            <KidCharacter
              x={200}
              y={150}
              scale={1.15}
              shirtColor="#9333ea"
              pantsColor="#f472b6"
              name="Ann"
              hasTornPants={true}
            />
            {/* Đường xoáy xoay vòng (in a spin) */}
            <path
              d="M 135 135 Q 200 155 265 135 M 130 165 Q 200 185 270 165 M 140 195 Q 200 215 260 195"
              stroke="#ffffff"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
    );
  }

  // ============================================================================
  // SET 2 (NHÓM 2) — 9 CUỐN SÁCH LẬT SPELD SA
  // ============================================================================

  // SET 2 - BOOK 1: Ants at the tip (8 pages)
  if (bookId === 'speld-g2-b1') {
    return (
      <svg viewBox="0 0 400 320" className="w-full h-full object-cover rounded-2xl bg-[#fde68a]">
        <rect x="0" y="0" width="400" height="110" fill="#93c5fd" />
        <path d="M 0 110 Q 180 95 400 110 L 400 320 L 0 320 Z" fill="#d97706" />
        {/* Bãi phế liệu (the tip) ở hậu cảnh */}
        <rect x="25" y="75" width="75" height="42" rx="4" fill="#94a3b8" stroke="#475569" strokeWidth="2" rotate="-8" />
        <ellipse cx="335" cy="115" rx="48" ry="26" fill="#78350f" stroke="#451a03" strokeWidth="2" />

        {pageNumber === 1 && (
          <g>
            <ellipse cx="215" cy="205" rx="68" ry="34" fill="#451a03" opacity="0.75" />
            <SmallBlackAnt x={115} y={165} scale={1.4} rotate={15} />
            <SmallBlackAnt x={165} y={145} scale={1.3} rotate={-20} />
            <SmallBlackAnt x={255} y={155} scale={1.4} rotate={25} />
            <SmallBlackAnt x={135} y={235} scale={1.5} rotate={-10} />
            <SmallBlackAnt x={225} y={248} scale={1.5} rotate={12} />
            <SmallBlackAnt x={305} y={215} scale={1.4} rotate={-18} />
          </g>
        )}

        {pageNumber === 2 && (
          <g>
            <KidCharacter x={140} y={150} scale={1.1} shirtColor="#f59e0b" pantsColor="#2563eb" name="Mick" />
            <rect x="105" y="120" width="12" height="90" rx="4" fill="#92400e" stroke="#451a03" strokeWidth="2" transform="rotate(28 140 150)" />
            <KidCharacter x={255} y={180} scale={1.0} shirtColor="#14b8a6" pantsColor="#9ca3af" name="Kim" isSitting={true} />
            <rect x="295" y="145" width="12" height="85" rx="4" fill="#92400e" stroke="#451a03" strokeWidth="2" />
          </g>
        )}

        {(pageNumber === 3 || pageNumber === 4) && (
          <g>
            <rect x="145" y="95" width="110" height="145" rx="10" fill="#cbd5e1" stroke="#334155" strokeWidth="3" transform="rotate(-18 200 165)" />
            <SmallBlackAnt x={175} y={135} scale={1.3} rotate={-25} />
            <SmallBlackAnt x={215} y={165} scale={1.3} rotate={15} />
            <SmallBlackAnt x={190} y={205} scale={1.3} rotate={-10} />
            {pageNumber === 4 && (
              <g>
                <path d="M 65 255 L 155 185 L 175 215 L 85 285 Z" fill="#78350f" stroke="#1c1917" strokeWidth="2.5" />
                <SmallBlackAnt x={125} y={225} scale={1.4} rotate={-30} />
              </g>
            )}
          </g>
        )}

        {pageNumber === 5 && (
          <g>
            <KidCharacter x={215} y={155} scale={1.2} shirtColor="#14b8a6" pantsColor="#9ca3af" name="Kim" />
            <SmallBlackAnt x={195} y={155} scale={0.9} />
            <SmallBlackAnt x={230} y={168} scale={0.9} />
            <SmallBlackAnt x={205} y={185} scale={0.9} />
          </g>
        )}

        {pageNumber === 6 && (
          <g>
            <KidCharacter x={200} y={155} scale={1.2} shirtColor="#f59e0b" pantsColor="#2563eb" name="Mick" />
            <SmallBlackAnt x={180} y={155} scale={0.9} />
            <SmallBlackAnt x={220} y={165} scale={0.9} />
            <SmallBlackAnt x={195} y={185} scale={0.9} />
          </g>
        )}

        {pageNumber === 7 && (
          <g>
            <KidCharacter x={95} y={165} scale={0.95} shirtColor="#f59e0b" pantsColor="#2563eb" name="Mick" />
            <KidCharacter x={165} y={155} scale={0.95} shirtColor="#14b8a6" pantsColor="#9ca3af" name="Kim" />
            {/* Bồn nước lớn (The tank & tap) */}
            <rect x="275" y="35" width="115" height="185" rx="8" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
            <line x1="275" y1="75" x2="390" y2="75" stroke="#64748b" strokeWidth="2.5" />
            <line x1="275" y1="115" x2="390" y2="115" stroke="#64748b" strokeWidth="2.5" />
            <line x1="275" y1="155" x2="390" y2="155" stroke="#64748b" strokeWidth="2.5" />
            <rect x="255" y="195" width="26" height="10" fill="#64748b" />
          </g>
        )}

        {pageNumber === 8 && (
          <g>
            <KidCharacter x={115} y={155} scale={1.05} shirtColor="#f59e0b" pantsColor="#2563eb" name="Mick" />
            <KidCharacter x={225} y={185} scale={1.0} shirtColor="#14b8a6" pantsColor="#9ca3af" name="Kim" isSitting={true} />
            <rect x="285" y="35" width="105" height="175" rx="8" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
            <path d="M 275 195 Q 268 235 280 265" stroke="#38bdf8" strokeWidth="14" strokeLinecap="round" fill="none" />
          </g>
        )}
      </svg>
    );
  }

  // SET 2 - BOOK 2: Crack, crack, crack (8 pages)
  if (bookId === 'speld-g2-b2') {
    return (
      <svg viewBox="0 0 400 320" className="w-full h-full object-cover rounded-2xl bg-[#bbf7d0]">
        <rect x="0" y="0" width="400" height="95" fill="#7dd3fc" />
        <path d="M 0 95 Q 200 75 400 95 L 400 320 L 0 320 Z" fill="#4ade80" />
        <path d="M 75 95 L 310 195 L 145 320 L 245 320 L 365 195 L 115 95 Z" fill="#e7e5e4" />

        {pageNumber === 1 && (
          <g>
            <rect x="40" y="135" width="320" height="165" rx="8" fill="#b45309" stroke="#451a03" strokeWidth="3" />
            <rect x="165" y="95" width="125" height="75" rx="6" fill="#e2e8f0" stroke="#334155" strokeWidth="3" />
            <rect x="115" y="160" width="95" height="65" fill="#fef08a" stroke="#334155" strokeWidth="2" />
            <path d="M 130 180 Q 160 165 190 195" stroke="#15803d" strokeWidth="5" fill="none" />
          </g>
        )}

        {pageNumber === 2 && (
          <g>
            <rect x="40" y="35" width="320" height="250" rx="12" fill="#a16207" stroke="#451a03" strokeWidth="3" />
            {/* Sack (ba lô vàng), cap (mũ xanh), map, pick, drink */}
            <rect x="145" y="85" width="110" height="135" rx="22" fill="#facc15" stroke="#1c1917" strokeWidth="3" />
            <circle cx="95" cy="110" r="24" fill="#22d3ee" stroke="#1c1917" strokeWidth="2.5" />
            <rect x="85" y="175" width="28" height="75" rx="6" fill="#fef3c7" stroke="#1c1917" strokeWidth="2" />
            <line x1="295" y1="65" x2="295" y2="235" stroke="#d97706" strokeWidth="10" strokeLinecap="round" />
            <path d="M 245 70 Q 295 50 345 75" stroke="#cbd5e1" strokeWidth="9" fill="none" strokeLinecap="round" />
            <rect x="315" y="165" width="32" height="75" rx="8" fill="#e2e8f0" stroke="#1c1917" strokeWidth="2.5" />
          </g>
        )}

        {pageNumber === 3 && (
          <g>
            <KidCharacter x={145} y={185} scale={1.1} shirtColor="#ffffff" pantsColor="#dc2626" />
            <rect x="110" y="175" width="28" height="42" rx="8" fill="#facc15" stroke="#1c1917" strokeWidth="2" />
          </g>
        )}

        {pageNumber === 4 && (
          <g>
            <KidCharacter x={200} y={145} scale={1.15} shirtColor="#ffffff" pantsColor="#dc2626" />
            <rect x="168" y="205" width="64" height="75" rx="14" fill="#facc15" stroke="#1c1917" strokeWidth="3" />
          </g>
        )}

        {pageNumber === 5 && (
          <g>
            <KidCharacter x={145} y={165} scale={1.15} shirtColor="#ffffff" pantsColor="#dc2626" />
            <line x1="85" y1="85" x2="215" y2="85" stroke="#92400e" strokeWidth="8" strokeLinecap="round" />
            <path d="M 75 65 Q 65 95 85 125" stroke="#cbd5e1" strokeWidth="8" fill="none" strokeLinecap="round" />
            <path d="M 195 295 Q 255 155 325 295 Z" fill="#d6d3d1" stroke="#44403c" strokeWidth="3" />
          </g>
        )}

        {pageNumber === 6 && (
          <g>
            <path d="M 175 295 Q 255 125 345 295 Z" fill="#d6d3d1" stroke="#44403c" strokeWidth="3" />
            <KidCharacter x={155} y={195} scale={1.1} shirtColor="#ffffff" pantsColor="#dc2626" isSitting={true} isPanting={true} />
          </g>
        )}

        {pageNumber === 7 && (
          <g>
            <KidCharacter x={145} y={155} scale={1.15} shirtColor="#ffffff" pantsColor="#dc2626" />
            <line x1="175" y1="155" x2="265" y2="235" stroke="#92400e" strokeWidth="8" strokeLinecap="round" />
            <polygon points="245,235 285,215 315,245 265,275" fill="#f59e0b" stroke="#1c1917" strokeWidth="2.5" />
          </g>
        )}

        {pageNumber === 8 && (
          <g>
            <ellipse cx="205" cy="235" rx="145" ry="58" fill="#d6d3d1" stroke="#1c1917" strokeWidth="3" />
            <ellipse cx="235" cy="255" rx="22" ry="16" fill="#ffffff" stroke="#1c1917" strokeWidth="2.5" />
            <ellipse cx="285" cy="255" rx="22" ry="16" fill="#ffffff" stroke="#1c1917" strokeWidth="2.5" />
            <circle cx="255" cy="235" r="10" fill="#1c1917" />
            <circle cx="257" cy="233" r="3" fill="#ffffff" />
          </g>
        )}
      </svg>
    );
  }

  // SET 2 - BOOK 3: Did it happen? (8 pages)
  if (bookId === 'speld-g2-b3') {
    return (
      <svg viewBox="0 0 400 320" className="w-full h-full object-cover rounded-2xl bg-[#e0f2fe]">
        <rect x="0" y="0" width="400" height="125" fill="#93c5fd" />
        <rect x="0" y="125" width="400" height="195" fill="#fdba74" />

        {pageNumber === 1 && (
          <g>
            <rect x="0" y="0" width="400" height="320" fill="#f1f5f9" />
            <rect x="20" y="185" width="210" height="115" rx="10" fill="#94a3b8" stroke="#475569" strokeWidth="3" />
            <path d="M 65 135 Q 85 135 85 160 L 85 235" stroke="#bae6fd" strokeWidth="10" fill="none" />
            <KidCharacter x={265} y={175} scale={1.2} shirtColor="#ec4899" pantsColor="#1e293b" name="Tam" />
            <rect x="215" y="140" width="32" height="22" rx="4" fill="#db2777" transform="rotate(-20 230 150)" />
          </g>
        )}

        {pageNumber === 2 && (
          <g>
            {/* Dan lái xe tải (không phải ngồi trong lều!) */}
            <rect x="45" y="35" width="310" height="245" rx="18" fill="#f8fafc" stroke="#475569" strokeWidth="4" />
            <rect x="195" y="65" width="135" height="95" rx="8" fill="#bae6fd" stroke="#334155" strokeWidth="3" />
            <KidCharacter x={175} y={155} scale={1.15} shirtColor="#facc15" pantsColor="#1d4ed8" name="Dan" isSitting={true} />
            <line x1="215" y1="165" x2="275" y2="140" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
          </g>
        )}

        {pageNumber === 3 && (
          <g>
            {/* Đàn cừu trong chuồng rào sắt (không phải gà mái!) */}
            <line x1="20" y1="155" x2="380" y2="155" stroke="#cbd5e1" strokeWidth="5" />
            <line x1="20" y1="195" x2="380" y2="195" stroke="#cbd5e1" strokeWidth="5" />
            <line x1="20" y1="235" x2="380" y2="235" stroke="#cbd5e1" strokeWidth="5" />
            <ellipse cx="185" cy="185" rx="34" ry="22" fill="#fef3c7" stroke="#78716c" strokeWidth="2" />
            <ellipse cx="245" cy="185" rx="34" ry="22" fill="#fef3c7" stroke="#78716c" strokeWidth="2" />
            <KidCharacter x={295} y={175} scale={1.25} shirtColor="#bae6fd" pantsColor="#1e3a8a" name="Rick" />
          </g>
        )}

        {pageNumber === 4 && (
          <g>
            {/* Máy bay nhỏ đậu trên sân bay đất đỏ */}
            <rect x="165" y="125" width="165" height="28" rx="12" fill="#f8fafc" stroke="#334155" strokeWidth="2.5" />
            <polygon points="305,125 335,95 345,125" fill="#ea580c" stroke="#334155" strokeWidth="2" />
            <KidCharacter x={115} y={165} scale={1.15} shirtColor="#3b82f6" pantsColor="#d6d3d1" name="Nick" />
          </g>
        )}

        {pageNumber === 5 && (
          <g>
            <rect x="0" y="0" width="400" height="320" fill="#e2e8f0" />
            <rect x="85" y="115" width="95" height="145" rx="22" fill="#60a5fa" stroke="#1e3a8a" strokeWidth="3" />
            <KidCharacter x={135} y={155} scale={0.95} shirtColor="#facc15" pantsColor="#f472b6" name="Pam" isSitting={true} />
            <KidCharacter x={265} y={145} scale={1.25} shirtColor="#1e3a8a" pantsColor="#1e3a8a" />
            <rect x="252" y="122" width="26" height="16" rx="4" fill="#2dd4bf" />
          </g>
        )}

        {pageNumber === 6 && (
          <g>
            {/* Bố sửa ô tô (không phải sửa bàn!) */}
            <path d="M 0 145 L 215 145 L 235 255 L 0 255 Z" fill="#cbd5e1" stroke="#334155" strokeWidth="3" />
            <line x1="0" y1="145" x2="115" y2="35" stroke="#94a3b8" strokeWidth="8" />
            <circle cx="65" cy="255" r="38" fill="#1e293b" stroke="#475569" strokeWidth="6" />
            <KidCharacter x={265} y={155} scale={1.2} shirtColor="#9ca3af" pantsColor="#2563eb" name="Dad" />
          </g>
        )}

        {pageNumber === 7 && (
          <g>
            <KidCharacter x={200} y={155} scale={1.2} shirtColor="#facc15" pantsColor="#f472b6" name="Pam" />
          </g>
        )}

        {pageNumber === 8 && (
          <g>
            {/* Mimma nấp sau thân cây lớn */}
            <KidCharacter x={215} y={155} scale={1.15} shirtColor="#f59e0b" pantsColor="#2563eb" />
            <rect x="45" y="0" width="145" height="320" fill="#a8a29e" stroke="#57534e" strokeWidth="3" />
            <path d="M 75 45 L 135 120 L 95 220" stroke="#fde68a" strokeWidth="22" opacity="0.55" fill="none" />
          </g>
        )}
      </svg>
    );
  }

  // SET 2 - BOOK 4: Hats (8 pages)
  if (bookId === 'speld-g2-b4') {
    return (
      <svg viewBox="0 0 400 320" className="w-full h-full object-cover rounded-2xl bg-[#f8fafc]">
        {pageNumber === 1 && (
          <g>
            <rect x="0" y="0" width="400" height="320" fill="#a8a29e" />
            <path d="M 65 215 L 115 125 Q 200 100 285 125 L 335 215 Q 200 245 65 215 Z" fill="#1d4ed8" stroke="#0f172a" strokeWidth="4" />
            <path d="M 98 165 Q 200 182 302 165 L 310 185 Q 200 202 90 185 Z" fill="#84cc16" stroke="#0f172a" strokeWidth="3" />
          </g>
        )}

        {pageNumber === 2 && (
          <g>
            {/* Gà mái đội mũ (A hen in a hat) */}
            <ellipse cx="205" cy="175" rx="78" ry="58" fill="#d97706" stroke="#78350f" strokeWidth="3" />
            <circle cx="135" cy="115" r="28" fill="#d97706" stroke="#78350f" strokeWidth="3" />
            <polygon points="95,115 112,108 112,122" fill="#facc15" />
            <path d="M 105 92 L 165 102 L 155 75 L 115 68 Z" fill="#1d4ed8" stroke="#0f172a" strokeWidth="2.5" />
            <line x1="175" y1="230" x2="155" y2="285" stroke="#f59e0b" strokeWidth="5" />
            <line x1="225" y1="230" x2="235" y2="285" stroke="#f59e0b" strokeWidth="5" />
          </g>
        )}

        {pageNumber === 3 && (
          <g>
            {/* Mèo đội mũ (A cat in a hat) */}
            <ellipse cx="200" cy="205" rx="52" ry="72" fill="#a8a29e" stroke="#44403c" strokeWidth="3" />
            <circle cx="200" cy="115" r="42" fill="#a8a29e" stroke="#44403c" strokeWidth="3" />
            <circle cx="185" cy="110" r="7" fill="#84cc16" stroke="#1c1917" strokeWidth="2" />
            <circle cx="215" cy="110" r="7" fill="#84cc16" stroke="#1c1917" strokeWidth="2" />
            <path d="M 155 85 L 245 85 L 235 55 L 165 55 Z" fill="#38bdf8" stroke="#0f172a" strokeWidth="2.5" />
            <ellipse cx="200" cy="85" rx="52" ry="8" fill="#facc15" stroke="#0f172a" strokeWidth="2.5" />
          </g>
        )}

        {pageNumber === 4 && (
          <g>
            {/* Chuột đội mũ lưỡi trai (A rat in a cap) */}
            <ellipse cx="225" cy="185" rx="75" ry="52" fill="#78716c" stroke="#292524" strokeWidth="3" />
            <circle cx="175" cy="185" r="38" fill="#78716c" stroke="#292524" strokeWidth="3" />
            <path d="M 145 155 Q 175 115 215 155 Z" fill="#7e22ce" stroke="#0f172a" strokeWidth="2.5" />
            <path d="M 115 158 L 165 152 L 155 168 Z" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
          </g>
        )}

        {pageNumber === 5 && (
          <g>
            <rect x="0" y="0" width="400" height="320" fill="#e2e8f0" />
            <KidCharacter x={145} y={165} scale={1.15} shirtColor="#94a3b8" pantsColor="#1e3a8a" name="Tam" />
            <ellipse cx="140" cy="115" rx="28" ry="10" fill="#cbd5e1" stroke="#0f172a" strokeWidth="2" />
            <KidCharacter x={255} y={165} scale={1.15} shirtColor="#4ade80" pantsColor="#f472b6" name="Pip" />
            <ellipse cx="250" cy="115" rx="28" ry="10" fill="#4ade80" stroke="#0f172a" strokeWidth="2" />
          </g>
        )}

        {pageNumber === 6 && (
          <g>
            <rect x="0" y="0" width="400" height="120" fill="#93c5fd" />
            <rect x="0" y="120" width="400" height="200" fill="#ea580c" opacity="0.7" />
            <KidCharacter x={135} y={145} scale={1.25} shirtColor="#fef3c7" pantsColor="#2563eb" name="Dad" />
            <ellipse cx="135" cy="88" rx="38" ry="10" fill="#d6d3d1" stroke="#1c1917" strokeWidth="2.5" />
            <KidCharacter x={255} y={180} scale={0.95} shirtColor="#f59e0b" pantsColor="#38bdf8" name="Tim" />
            <ellipse cx="255" cy="138" rx="26" ry="8" fill="#38bdf8" stroke="#1c1917" strokeWidth="2" />
          </g>
        )}

        {pageNumber === 7 && (
          <g>
            <rect x="0" y="0" width="400" height="320" fill="#dbeafe" />
            <path d="M 165 110 Q 280 65 395 95 L 395 235 L 185 215 Z" fill="#d6d3d1" stroke="#44403c" strokeWidth="3" />
            <polygon points="95,215 135,95 175,215" fill="#ef4444" stroke="#1c1917" strokeWidth="2.5" />
            <polygon points="45,235 85,135 125,235" fill="#9333ea" stroke="#1c1917" strokeWidth="2.5" />
            <circle cx="215" cy="185" r="35" fill="#f97316" stroke="#1c1917" strokeWidth="2.5" />
            <rect x="295" y="175" width="58" height="68" rx="6" fill="#334155" stroke="#0f172a" strokeWidth="2.5" />
          </g>
        )}

        {pageNumber === 8 && (
          <g>
            <rect x="0" y="0" width="400" height="320" fill="#dbeafe" />
            <KidCharacter x={105} y={175} scale={1.05} shirtColor="#94a3b8" pantsColor="#1e3a8a" />
            <ellipse cx="105" cy="122" rx="32" ry="12" fill="#f97316" stroke="#1c1917" strokeWidth="2.5" />
            <KidCharacter x={200} y={165} scale={1.1} shirtColor="#4ade80" pantsColor="#f472b6" />
            <polygon points="168,118 200,52 232,118" fill="#9333ea" stroke="#1c1917" strokeWidth="2.5" />
            <KidCharacter x={295} y={175} scale={1.05} shirtColor="#f59e0b" pantsColor="#38bdf8" />
            <polygon points="275,122 295,62 315,122" fill="#ef4444" stroke="#1c1917" strokeWidth="2.5" />
          </g>
        )}
      </svg>
    );
  }

  // SET 2 - BOOK 5: Ken (8 pages)
  if (bookId === 'speld-g2-b5') {
    return (
      <svg viewBox="0 0 400 320" className="w-full h-full object-cover rounded-2xl bg-[#fde68a]">
        <rect x="0" y="0" width="400" height="105" fill="#3f6212" />
        <path d="M 0 105 Q 190 75 400 115 L 400 320 L 0 320 Z" fill="#eab308" opacity="0.55" />

        {/* Hàm vẽ xe đạp BMX cam của Ken */}
        {(pageNumber >= 1 && pageNumber <= 6) && (
          <g
            transform={
              pageNumber === 4
                ? 'translate(210, 175) rotate(18)'
                : pageNumber === 5
                ? 'translate(200, 170) rotate(-22)'
                : pageNumber === 6
                ? 'translate(195, 195) rotate(32)'
                : 'translate(215, 195)'
            }
          >
            <circle cx="-48" cy="35" r="32" fill="none" stroke="#1e293b" strokeWidth="7" />
            <circle cx="48" cy="35" r="32" fill="none" stroke="#1e293b" strokeWidth="7" />
            <path d="M -48 35 L -8 5 L 42 5 L 0 35 Z" fill="none" stroke="#ea580c" strokeWidth="6" strokeLinejoin="round" />
            <line x1="35" y1="-22" x2="48" y2="35" stroke="#ea580c" strokeWidth="6" />
          </g>
        )}

        <KidCharacter
          x={pageNumber >= 7 ? 125 : 200}
          y={pageNumber >= 7 ? 165 : 135}
          scale={1.1}
          shirtColor="#a3a380"
          pantsColor="#2563eb"
          name="Ken"
          isSitting={pageNumber >= 3}
          isPanting={pageNumber === 7}
        />

        {/* Mũ bảo hiểm đỏ có sọc trắng của Ken */}
        {pageNumber !== 8 && (
          <path
            d={
              pageNumber >= 7
                ? 'M 102 122 Q 125 95 148 122 Z'
                : 'M 177 92 Q 200 65 223 92 Z'
            }
            fill="#ef4444"
            stroke="#1c1917"
            strokeWidth="2.5"
          />
        )}

        {pageNumber >= 7 && (
          <g>
            <rect x="45" y="215" width="310" height="85" rx="6" fill="#78350f" stroke="#451a03" strokeWidth="3" />
            {pageNumber === 8 && (
              <rect x="148" y="115" width="28" height="14" rx="4" fill="#e2e8f0" stroke="#1e293b" strokeWidth="2" />
            )}
          </g>
        )}
      </svg>
    );
  }

  // SET 2 - BOOK 6: Red sand (8 pages)
  if (bookId === 'speld-g2-b6') {
    return (
      <svg viewBox="0 0 400 320" className="w-full h-full object-cover rounded-2xl bg-[#d97706]">
        <rect x="0" y="0" width="400" height="320" fill="#d97706" />
        <path d="M 0 120 Q 200 95 400 125 L 400 320 L 0 320 Z" fill="#b45309" opacity="0.45" />

        {(pageNumber === 1 || pageNumber === 3) && (
          <g>
            {/* Bàn tay thả dòng cát đỏ chảy xuống */}
            <path d="M 145 75 L 395 65 L 395 110 L 185 115 Z" fill="#78350f" stroke="#1c1917" strokeWidth="3" />
            <path d="M 195 105 L 195 285" stroke="#9a3412" strokeWidth="18" strokeLinecap="round" opacity="0.75" />
          </g>
        )}

        {pageNumber === 4 && (
          <g>
            {/* Hai bàn tay vỗ đống cát đỏ (I pat the sand) */}
            <path d="M 55 285 Q 200 85 345 285 Z" fill="#b45309" stroke="#78350f" strokeWidth="3" />
            <ellipse cx="165" cy="145" rx="45" ry="18" fill="#78350f" stroke="#1c1917" strokeWidth="2.5" transform="rotate(-25 165 145)" />
            <ellipse cx="245" cy="165" rx="45" ry="18" fill="#78350f" stroke="#1c1917" strokeWidth="2.5" transform="rotate(-20 245 165)" />
          </g>
        )}

        {(pageNumber === 2 || pageNumber === 5 || pageNumber === 6 || pageNumber === 7 || pageNumber === 8) && (
          <g>
            <KidCharacter
              x={200}
              y={pageNumber >= 7 ? 145 : 165}
              scale={pageNumber === 8 ? 0.85 : 1.15}
              shirtColor="#bef264"
              pantsColor="#475569"
              isSitting={pageNumber === 2 || pageNumber === 5}
            />
            {pageNumber === 5 && (
              <path d="M 115 235 Q 175 175 235 235 Z" fill="#d97706" stroke="#9a3412" strokeWidth="2.5" />
            )}
          </g>
        )}
      </svg>
    );
  }

  // SET 2 - BOOK 7: Rick (8 pages)
  if (bookId === 'speld-g2-b7') {
    return (
      <svg viewBox="0 0 400 320" className="w-full h-full object-cover rounded-2xl bg-[#fde68a]">
        <rect x="0" y="0" width="400" height="105" fill="#93c5fd" />
        <rect x="0" y="105" width="400" height="215" fill="#d97706" opacity="0.65" />

        {pageNumber < 8 ? (
          <g>
            {/* Chú chuột túi Rick (Rick the kangaroo) */}
            <g transform="translate(215, 165)">
              <path d="M 15 35 Q 75 45 65 -15" stroke="#a16207" strokeWidth="18" strokeLinecap="round" fill="none" />
              <ellipse cx="0" cy="15" rx="28" ry="45" fill="#a16207" stroke="#451a03" strokeWidth="2.5" />
              <ellipse cx="-5" cy="18" rx="16" ry="34" fill="#fef3c7" />
              <circle cx="-5" cy="-38" r="22" fill="#a16207" stroke="#451a03" strokeWidth="2.5" />
              <ellipse cx="-24" cy="-34" rx="16" ry="10" fill="#a16207" stroke="#451a03" strokeWidth="2.5" />
              <circle cx="-36" cy="-36" r="5" fill="#451a03" />
              <circle cx="-12" cy="-42" r="5" fill="#ffffff" />
              <circle cx="-12" cy="-42" r="2.5" fill="#1c1917" />
              {/* Hai tai dài của chuột túi */}
              <ellipse cx="-14" cy="-64" rx="6" ry="16" fill="#a16207" stroke="#451a03" strokeWidth="2" transform="rotate(-15 -14 -64)" />
              <ellipse cx="4" cy="-64" rx="6" ry="16" fill="#a16207" stroke="#451a03" strokeWidth="2" transform="rotate(15 4 -64)" />
              {/* Chân đá (kicks) */}
              <path
                d={pageNumber >= 2 && pageNumber <= 6 ? 'M -15 45 L -58 15' : 'M -15 55 L -45 62'}
                stroke="#a16207"
                strokeWidth="12"
                strokeLinecap="round"
              />
            </g>

            {pageNumber === 3 && (
              <ellipse cx="115" cy="155" rx="38" ry="16" fill="#451a03" transform="rotate(-25 115 155)" />
            )}
            {pageNumber === 4 && (
              <polygon points="65,195 145,155 155,255" fill="#b45309" stroke="#78350f" strokeWidth="2.5" />
            )}
            {pageNumber === 5 && (
              <circle cx="115" cy="145" r="24" fill="#dc2626" />
            )}
            {pageNumber === 6 && (
              <rect x="265" y="25" width="125" height="195" rx="8" fill="#cbd5e1" stroke="#475569" strokeWidth="3" />
            )}
          </g>
        ) : (
          <g>
            {/* Trang 8: Dấu chân chuột túi trên cát (A track is in the sand) */}
            <ellipse cx="200" cy="165" rx="22" ry="68" fill="#78350f" opacity="0.65" />
            <ellipse cx="155" cy="175" rx="14" ry="38" fill="#78350f" opacity="0.65" transform="rotate(-15 155 175)" />
            <ellipse cx="245" cy="175" rx="14" ry="38" fill="#78350f" opacity="0.65" transform="rotate(15 245 175)" />
          </g>
        )}
      </svg>
    );
  }

  // SET 2 - BOOK 8: Sant the ant is mad (8 pages)
  if (bookId === 'speld-g2-b8') {
    return (
      <svg viewBox="0 0 400 320" className="w-full h-full object-cover rounded-2xl bg-[#fde68a]">
        <rect x="0" y="0" width="400" height="115" fill="#38bdf8" />
        <path d="M 0 115 Q 200 95 400 115 L 400 320 L 0 320 Z" fill="#d97706" />

        {/* Kiến Sant */}
        <SantAntCharacter
          x={pageNumber === 2 || pageNumber === 5 || pageNumber === 6 ? 135 : 195}
          y={pageNumber === 8 ? 215 : 175}
          scale={1.15}
          isCrying={pageNumber <= 4}
          isSpinning={pageNumber === 8}
        />

        {/* Mũ giấy báo trên đầu Sant (trang 1, 2, 3) */}
        {pageNumber <= 3 && (
          <polygon
            points={
              pageNumber === 2
                ? '100,138 135,98 170,138'
                : '160,138 195,98 230,138'
            }
            fill="#f8fafc"
            stroke="#1e293b"
            strokeWidth="2.5"
          />
        )}

        {/* Lon thiếc bị đá móp (trang 3) */}
        {pageNumber === 3 && (
          <rect x="105" y="225" width="75" height="45" rx="6" fill="#cbd5e1" stroke="#475569" strokeWidth="2.5" transform="rotate(12 140 245)" />
        )}

        {/* Bố của Sant (trang 2, 5, 6) */}
        {(pageNumber === 2 || pageNumber === 5 || pageNumber === 6) && (
          <SantAntCharacter x={265} y={145} scale={1.4} isCrying={pageNumber === 5} />
        )}
      </svg>
    );
  }

  // SET 2 - BOOK 9: Simon Says (8 pages)
  if (bookId === 'speld-g2-b9') {
    return (
      <svg viewBox="0 0 400 320" className="w-full h-full object-cover rounded-2xl bg-[#dbeafe]">
        {/* Phòng học & Thảm xanh đại dương */}
        <rect x="0" y="0" width="400" height="175" fill="#e2e8f0" />
        <rect x="0" y="175" width="400" height="145" fill="#2563eb" />

        {pageNumber === 6 ? (
          <g>
            <KidCharacter x={200} y={175} scale={1.3} shirtColor="#facc15" pantsColor="#94a3b8" name="Nick" isSitting={true} />
          </g>
        ) : (
          <g>
            {/* Bạn quản trò Simon ở bên trái */}
            <KidCharacter x={65} y={135} scale={1.1} shirtColor="#94a3b8" pantsColor="#1e3a8a" name="Simon" />
            {/* Bóng thoại câu lệnh */}
            {pageNumber <= 5 && (
              <g transform="translate(195, 52)">
                <ellipse cx="0" cy="0" rx="82" ry="34" fill="#ffffff" stroke="#1e293b" strokeWidth="2" />
                <text x="0" y="5" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0f172a">
                  {pageNumber === 1
                    ? 'Simon says stand.'
                    : pageNumber === 2
                    ? 'Simon says tap.'
                    : pageNumber === 3
                    ? 'Simon says stamp.'
                    : pageNumber === 4
                    ? 'Simon says spin.'
                    : 'Kick.'}
                </text>
              </g>
            )}
            {/* Nhóm các bạn nhỏ chơi Simon Says */}
            <KidCharacter
              x={145}
              y={pageNumber === 8 ? 205 : 175}
              scale={0.95}
              shirtColor="#facc15"
              pantsColor="#94a3b8"
              name="Nick"
              isSitting={pageNumber === 8}
            />
            <KidCharacter
              x={215}
              y={pageNumber === 8 ? 205 : 175}
              scale={0.95}
              shirtColor="#f97316"
              pantsColor="#38bdf8"
              isSitting={pageNumber === 8}
            />
            <KidCharacter
              x={285}
              y={pageNumber === 8 ? 205 : 175}
              scale={0.95}
              shirtColor="#a855f7"
              pantsColor="#f472b6"
              isSitting={pageNumber === 8}
            />
            <KidCharacter
              x={348}
              y={pageNumber === 8 ? 205 : 165}
              scale={0.95}
              shirtColor="#fde047"
              pantsColor="#2563eb"
              isSitting={pageNumber === 8}
            />
          </g>
        )}
      </svg>
    );
  }

  // SET 2 - BOOK 10: Yes/No (8 pages)
  if (bookId === 'speld-g2-b10') {
    return (
      <svg viewBox="0 0 400 320" className="w-full h-full object-cover rounded-2xl bg-[#fef3c7]">
        <rect x="0" y="0" width="400" height="205" fill="#e0f2fe" />
        <rect x="0" y="205" width="400" height="115" fill="#fde68a" />
        {(pageNumber === 1 || pageNumber === 2) && (
          <g transform="translate(200, 145)">
            <rect x="-15" y="-65" width="30" height="125" rx="8" fill="#64748b" stroke="#1e293b" strokeWidth="3" />
            <rect x="-45" y="-15" width="40" height="22" rx="6" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5" />
            <circle cx="-15" cy="-42" r="14" fill="#ef4444" stroke="#1e293b" strokeWidth="2.5" />
            <path d="M -38 15 Q -42 35 -32 45 Q -22 35 -28 15 Z" fill="#38bdf8" />
          </g>
        )}
        {(pageNumber === 3 || pageNumber === 4) && (
          <g transform="translate(200, 165)">
            {/* Chú chó đốm (It is a dog) */}
            <ellipse cx="0" cy="15" rx="52" ry="34" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" />
            <circle cx="-18" cy="10" r="12" fill="#78350f" />
            <circle cx="20" cy="18" r="14" fill="#78350f" />
            <circle cx="-48" cy="-18" r="26" fill="#f8fafc" stroke="#1e293b" strokeWidth="3" />
            <ellipse cx="-62" cy="-12" rx="10" ry="22" fill="#78350f" />
            <circle cx="-55" cy="-22" r="5" fill="#1e293b" />
            <circle cx="-72" cy="-15" r="6" fill="#1e293b" />
            <rect x="-35" y="42" width="12" height="32" rx="5" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
            <rect x="22" y="42" width="12" height="32" rx="5" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
          </g>
        )}
        {(pageNumber === 5 || pageNumber === 6) && (
          <g transform="translate(200, 165)">
            {/* Chú lừa xám (It is a donkey) */}
            <ellipse cx="8" cy="15" rx="58" ry="36" fill="#94a3b8" stroke="#1e293b" strokeWidth="3" />
            <circle cx="-48" cy="-22" r="26" fill="#94a3b8" stroke="#1e293b" strokeWidth="3" />
            <ellipse cx="-55" cy="-62" rx="8" ry="26" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5" transform="rotate(-12 -55 -62)" />
            <ellipse cx="-36" cy="-62" rx="8" ry="26" fill="#94a3b8" stroke="#1e293b" strokeWidth="2.5" transform="rotate(12 -36 -62)" />
            <circle cx="-54" cy="-26" r="5" fill="#1e293b" />
            <rect x="-32" y="45" width="12" height="36" rx="4" fill="#64748b" stroke="#1e293b" strokeWidth="2.5" />
            <rect x="28" y="45" width="12" height="36" rx="4" fill="#64748b" stroke="#1e293b" strokeWidth="2.5" />
          </g>
        )}
        {pageNumber === 7 && <SantAntCharacter x={185} y={155} scale={1.35} />}
        {pageNumber === 8 && (
          <KidCharacter x={200} y={165} scale={1.15} shirtColor="#f472b6" pantsColor="#38bdf8" isSitting={true} />
        )}
      </svg>
    );
  }

  // ============================================================================
  // BỘ MINH HỌA ĐỘNG CHO TOÀN BỘ TRUYỆN SET 3, SET 4, SET 5, SET 6, SET 7
  // ============================================================================
  if (bookId.startsWith('speld-g')) {
    const match = bookId.match(/^speld-g(\d+)-b(\d+)$/);
    const setNum = match ? parseInt(match[1], 10) : 3;
    const bookNum = match ? parseInt(match[2], 10) : 1;

    // Nhóm các truyện có nhân vật kiến Sant:
    // g3-b4, g4-b5, g5-b5, g6-b4, g7-b7, g8-b3 (Sant and Spotty), g9-b6 (Sant mystery sound), g10-b2 (Eat a rainbow with Sant)
    const isSantStory =
      (setNum === 3 && bookNum === 4) ||
      (setNum === 4 && bookNum === 5) ||
      (setNum === 5 && bookNum === 5) ||
      (setNum === 6 && bookNum === 4) ||
      (setNum === 7 && bookNum === 7) ||
      (setNum === 8 && bookNum === 3) ||
      (setNum === 9 && bookNum === 6) ||
      (setNum === 10 && bookNum === 2);

    if (isSantStory) {
      return (
        <svg viewBox="0 0 400 320" className="w-full h-full object-cover rounded-2xl bg-[#fef3c7]">
          <rect x="0" y="0" width="400" height="175" fill={setNum === 3 ? '#dbeafe' : setNum === 5 ? '#f3e8ff' : '#bae6fd'} />
          <path d="M 0 175 Q 200 155 400 175 L 400 320 L 0 320 Z" fill={setNum === 8 ? '#38bdf8' : '#fcd34d'} />

          {/* Đạo cụ theo từng bộ truyện của Sant */}
          {setNum === 3 && pageNumber >= 3 && pageNumber <= 7 && (
            <g transform="translate(200, 215)">
              <rect x="-110" y="-25" width="220" height="55" rx="14" fill="#93c5fd" stroke="#1e3a8a" strokeWidth="3" />
              <rect x="-100" y="-42" width="55" height="26" rx="10" fill="#ffffff" stroke="#1e3a8a" strokeWidth="2.5" />
            </g>
          )}
          {setNum === 4 && pageNumber === 1 && (
            <g transform="translate(185, 225)">
              <ellipse cx="0" cy="12" rx="58" ry="16" fill="#fde047" stroke="#713f12" strokeWidth="2.5" />
              <circle cx="12" cy="-12" r="28" fill="#a16207" stroke="#451a03" strokeWidth="3" />
              <circle cx="12" cy="-12" r="14" fill="none" stroke="#fef3c7" strokeWidth="2.5" />
            </g>
          )}
          {setNum === 5 && (
            <g>
              <text x={85 + (pageNumber % 3) * 35} y={75} fontSize="28" fill="#7c3aed" fontWeight="bold">
                ♪ ♫
              </text>
              <text x={285 - (pageNumber % 2) * 30} y={95} fontSize="26" fill="#db2777" fontWeight="bold">
                ♫ ♪
              </text>
            </g>
          )}
          {setNum === 6 && (
            <g transform="translate(275, 195)">
              <rect x="-45" y="-25" width="90" height="55" rx="8" fill="#fef08a" stroke="#ca8a04" strokeWidth="3" />
              <text x="0" y="6" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#854d0e">
                FISH &amp; CHIPS
              </text>
            </g>
          )}
          {setNum === 7 && (
            <g transform="translate(270, 165)">
              <rect x="-75" y="-35" width="140" height="65" rx="8" fill="#2563eb" stroke="#1e3a8a" strokeWidth="3" />
              <circle cx="-45" cy="35" r="16" fill="#1e293b" stroke="#cbd5e1" strokeWidth="4" />
              <circle cx="35" cy="35" r="16" fill="#1e293b" stroke="#cbd5e1" strokeWidth="4" />
            </g>
          )}
          {setNum === 8 && (
            <g transform="translate(105, 175)">
              {/* Spotty Lizard */}
              <ellipse cx="0" cy="12" rx="22" ry="48" fill="#4ade80" stroke="#14532d" strokeWidth="2.5" />
              <circle cx="8" cy="-35" r="16" fill="#4ade80" stroke="#14532d" strokeWidth="2.5" />
              <circle cx="12" cy="-38" r="3.5" fill="#1c1917" />
              <circle cx="-4" cy="4" r="4" fill="#15803d" />
              <circle cx="6" cy="22" r="5" fill="#15803d" />
            </g>
          )}
          {setNum === 9 && (
            <g transform="translate(105, 225)">
              {/* Chiếc lá xanh to */}
              <path d="M -55 0 Q 0 -38 55 0 Q 0 38 -55 0 Z" fill="#22c55e" stroke="#14532d" strokeWidth="3" />
              <line x1="-55" y1="0" x2="65" y2="-8" stroke="#14532d" strokeWidth="3" />
            </g>
          )}
          {setNum === 10 && (
            <g>
              {/* Cầu vồng trái cây */}
              <path d="M 30 175 Q 200 25 370 175" fill="none" stroke="#ef4444" strokeWidth="14" opacity="0.75" />
              <path d="M 45 175 Q 200 45 355 175" fill="none" stroke="#facc15" strokeWidth="14" opacity="0.75" />
              <path d="M 60 175 Q 200 65 340 175" fill="none" stroke="#22c55e" strokeWidth="14" opacity="0.75" />
            </g>
          )}

          <SantAntCharacter
            x={210 + ((pageNumber * 17) % 50) - 25}
            y={155}
            scale={1.25}
            isCrying={(setNum === 3 && pageNumber <= 5) || (setNum === 8 && pageNumber === 6)}
            isSpinning={pageNumber % 4 === 0}
          />
        </svg>
      );
    }

    // Nhóm các truyện có chú chó / thú cưng (Tag the dog, Tig naps, What is in the sack, Kora, Pookee, The dog, Wet cat, Good dog Harry)
    const isPetStory =
      (setNum === 3 && (bookNum === 6 || bookNum === 7)) ||
      (setNum === 4 && bookNum === 10) ||
      (setNum === 5 && (bookNum === 3 || bookNum === 4 || bookNum === 6)) ||
      (setNum === 7 && bookNum === 9) ||
      (setNum === 9 && bookNum === 2);

    if (isPetStory) {
      const isCat = setNum === 7 && bookNum === 9;
      return (
        <svg viewBox="0 0 400 320" className="w-full h-full object-cover rounded-2xl bg-[#e0f2fe]">
          <rect x="0" y="0" width="400" height="185" fill={isCat && pageNumber <= 4 ? '#94a3b8' : '#bae6fd'} />
          <path d="M 0 185 Q 200 165 400 185 L 400 320 L 0 320 Z" fill={setNum === 5 ? '#d97706' : '#86efac'} />

          {/* Mưa rơi cho truyện A wet cat */}
          {isCat && pageNumber <= 4 && (
            <g stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round">
              <line x1="75" y1="25" x2="65" y2="55" />
              <line x1="155" y1="35" x2="145" y2="65" />
              <line x1="245" y1="20" x2="235" y2="50" />
              <line x1="325" y1="40" x2="315" y2="70" />
            </g>
          )}

          {/* Thảm / Hồ nước */}
          {setNum === 5 && pageNumber >= 4 && (
            <ellipse cx="200" cy="245" rx="135" ry="42" fill="#38bdf8" stroke="#0284c7" strokeWidth="3" />
          )}

          {/* Vẽ chú chó hoặc chú mèo Tigger */}
          <g transform={`translate(${185 + ((pageNumber % 3) - 1) * 24}, ${pageNumber % 2 === 0 ? 175 : 165})`}>
            <ellipse cx="12" cy="18" rx="52" ry="32" fill={isCat ? '#f97316' : '#a16207'} stroke="#451a03" strokeWidth="3" />
            <circle cx="-38" cy="-14" r="26" fill={isCat ? '#f97316' : '#a16207'} stroke="#451a03" strokeWidth="3" />
            <ellipse cx="-48" cy="-34" rx="9" ry="18" fill="#78350f" />
            <circle cx="-45" cy="-18" r="5" fill="#1c1917" />
            <circle cx="-60" cy="-10" r="5" fill="#1c1917" />
            <path d="M 58 8 Q 85 -15 75 -32" stroke={isCat ? '#f97316' : '#a16207'} strokeWidth="10" strokeLinecap="round" fill="none" />
            <rect x="-24" y="42" width="12" height="28" rx="5" fill={isCat ? '#f97316' : '#a16207'} stroke="#451a03" strokeWidth="2.5" />
            <rect x="32" y="42" width="12" height="28" rx="5" fill={isCat ? '#f97316' : '#a16207'} stroke="#451a03" strokeWidth="2.5" />
          </g>
        </svg>
      );
    }

    // Nhóm các truyện The Flash / Nikisha / Thể thao (g6-b1, g6-b7..10, g7-b6, g7-b10, g8-b5, g10-b4, g10-b6)
    const isActionHeroStory =
      (setNum === 6 && (bookNum === 1 || bookNum >= 7)) ||
      (setNum === 7 && (bookNum === 6 || bookNum === 10)) ||
      (setNum === 8 && bookNum === 5) ||
      (setNum === 10 && (bookNum === 4 || bookNum === 6));

    if (isActionHeroStory) {
      return (
        <svg viewBox="0 0 400 320" className="w-full h-full object-cover rounded-2xl bg-[#dbeafe]">
          <rect x="0" y="0" width="400" height="185" fill="#bfdbfe" />
          <rect x="0" y="185" width="400" height="135" fill="#4ade80" />
          <path d="M 0 215 L 400 215 L 400 265 L 0 265 Z" fill="#fb923c" opacity="0.85" />

          {/* Áo choàng tia chớp nếu là truyện The Flash */}
          {setNum === 6 && bookNum >= 7 && bookNum <= 9 && (
            <polygon points="195,125 265,165 245,215 185,175" fill="#ef4444" stroke="#991b1b" strokeWidth="2.5" />
          )}

          {/* Cột bóng rổ nếu là truyện A bet (g6-b1) */}
          {setNum === 6 && bookNum === 1 && (
            <g transform="translate(320, 95)">
              <rect x="-6" y="0" width="12" height="125" fill="#475569" />
              <rect x="-38" y="-35" width="48" height="36" rx="4" fill="#ffffff" stroke="#1e293b" strokeWidth="3" />
              <ellipse cx="-22" cy="-2" rx="18" ry="6" fill="none" stroke="#ea580c" strokeWidth="3.5" />
              <circle cx={-65 - (pageNumber % 3) * 25} cy={-15 + (pageNumber % 2) * 20} r="14" fill="#f97316" stroke="#7c2d12" strokeWidth="2.5" />
            </g>
          )}

          <KidCharacter
            x={145 + ((pageNumber * 23) % 90)}
            y={145}
            scale={1.18}
            shirtColor={setNum === 6 && bookNum >= 7 ? '#eab308' : '#2563eb'}
            pantsColor="#1e293b"
          />
          {pageNumber % 2 === 0 && (
            <KidCharacter
              x={85}
              y={152}
              scale={1.05}
              shirtColor="#16a34a"
              pantsColor="#334155"
            />
          )}
        </svg>
      );
    }

    // Minh họa đa năng sinh động cho các truyện còn lại trong Set 3, 4, 5, 6, 7
    const skyColors = ['#bae6fd', '#fde68a', '#e9d5ff', '#fecdd3', '#cffafe'];
    const groundColors = ['#86efac', '#fcd34d', '#fdba74', '#a7f3d0', '#fde047'];
    const skyBg = skyColors[(setNum + bookNum + pageNumber) % skyColors.length];
    const groundBg = groundColors[(setNum + bookNum) % groundColors.length];

    return (
      <svg viewBox="0 0 400 320" className="w-full h-full object-cover rounded-2xl">
        <rect x="0" y="0" width="400" height="185" fill={skyBg} />
        <path d="M 0 185 Q 200 160 400 185 L 400 320 L 0 320 Z" fill={groundBg} />

        {/* Mặt trời & mây trắng */}
        <circle cx="335" cy="52" r="26" fill="#facc15" stroke="#eab308" strokeWidth="3" />
        <g fill="#ffffff" opacity="0.9">
          <ellipse cx={85 + (pageNumber * 15) % 80} cy="55" rx="36" ry="18" />
          <ellipse cx={108 + (pageNumber * 15) % 80} cy="48" rx="28" ry="16" />
        </g>

        {/* Cây xanh hoặc ngôi nhà tùy trang */}
        <g transform="translate(68, 135)">
          <rect x="-10" y="10" width="20" height="52" fill="#78350f" />
          <circle cx="0" cy="-8" r="36" fill="#16a34a" stroke="#14532d" strokeWidth="2.5" />
          <circle cx="-18" cy="4" r="24" fill="#22c55e" />
          <circle cx="18" cy="4" r="24" fill="#15803d" />
        </g>

        {/* Nhân vật chính tương tác theo từng trang */}
        <KidCharacter
          x={185 + ((pageNumber % 3) - 1) * 28}
          y={148}
          scale={1.15}
          shirtColor={['#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'][(bookNum + pageNumber) % 5]}
          pantsColor={['#1e3a8a', '#334155', '#7c2d12', '#14532d'][(setNum + pageNumber) % 4]}
          isSitting={pageNumber % 4 === 0}
        />

        {pageNumber % 2 === 1 && (
          <KidCharacter
            x={288}
            y={155}
            scale={1.0}
            shirtColor={['#ec4899', '#eab308', '#06b6d4'][(bookNum + pageNumber) % 3]}
            pantsColor="#1e293b"
          />
        )}
      </svg>
    );
  }

  return (
    <img
      src={fallbackImg}
      alt={alt || 'Story illustration'}
      className="w-full h-full object-cover"
      loading="lazy"
    />
  );
};

