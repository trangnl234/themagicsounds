import React from 'react';

interface TongueTwisterIllustrationProps {
  recordId: string;
  soundTitle?: string;
  className?: string;
}

/**
 * Hình minh họa chuẩn theo đúng nội dung từng câu trong 49 câu Tongue Twisters (JE1 & JE2)
 */
export const TongueTwisterIllustration: React.FC<TongueTwisterIllustrationProps> = ({
  recordId,
  soundTitle = '',
  className = 'w-24 h-16 sm:w-28 sm:h-20',
}) => {
  const cleanSoundBadge = (soundTitle || '').replace(/\//g, '');

  const renderScene = () => {
    switch (recordId) {
      // 1. /s/ Sad spider in the sun.
      case 'tt-01':
        return (
          <>
            <rect width="120" height="80" fill="#fef3c7" />
            <path d="M0 52 Q60 44 120 54 L120 80 L0 80 Z" fill="#fde68a" />
            {/* Sun */}
            <circle cx="52" cy="22" r="13" fill="#facc15" stroke="#eab308" strokeWidth="2" />
            <g stroke="#eab308" strokeWidth="1.8" strokeLinecap="round">
              <line x1="52" y1="4" x2="52" y2="8" />
              <line x1="52" y1="36" x2="52" y2="40" />
              <line x1="34" y1="22" x2="38" y2="22" />
              <line x1="66" y1="22" x2="70" y2="22" />
              <line x1="39" y1="10" x2="42" y2="13" />
              <line x1="62" y1="31" x2="65" y2="34" />
              <line x1="65" y1="10" x2="62" y2="13" />
              <line x1="42" y1="31" x2="39" y2="34" />
            </g>
            {/* Sad spider 1 */}
            <g stroke="#4b5563" strokeWidth="1.5" fill="none">
              <path d="M26 56 Q18 52 16 64" />
              <path d="M26 58 Q18 58 18 68" />
              <path d="M38 56 Q46 52 48 64" />
              <path d="M38 58 Q46 58 46 68" />
            </g>
            <ellipse cx="32" cy="56" rx="8" ry="6" fill="#7c3aed" />
            <circle cx="29" cy="54" r="1.5" fill="#fff" />
            <circle cx="35" cy="54" r="1.5" fill="#fff" />
            <path d="M29 59 Q32 56 35 59" stroke="#fff" strokeWidth="1.2" fill="none" />
            {/* Sad spider 2 */}
            <g stroke="#4b5563" strokeWidth="1.5" fill="none">
              <path d="M72 56 Q64 52 62 64" />
              <path d="M84 56 Q92 52 94 64" />
            </g>
            <ellipse cx="78" cy="56" rx="8" ry="6" fill="#92400e" />
            <circle cx="75" cy="54" r="1.5" fill="#fff" />
            <circle cx="81" cy="54" r="1.5" fill="#fff" />
            <path d="M75 59 Q78 56 81 59" stroke="#fff" strokeWidth="1.2" fill="none" />
          </>
        );

      // 2. /a/ Happy ants with arrows.
      case 'tt-02':
        return (
          <>
            <rect width="120" height="80" fill="#dcfce7" />
            <path d="M0 45 Q60 38 120 46 L120 80 L0 80 Z" fill="#86efac" />
            {/* Apple target */}
            <circle cx="58" cy="36" r="12" fill="#ef4444" />
            <path d="M58 24 Q61 19 64 22" stroke="#15803d" strokeWidth="2" fill="none" />
            {/* Arrows */}
            <line x1="78" y1="18" x2="64" y2="30" stroke="#78350f" strokeWidth="2" />
            <polygon points="63,31 68,29 65,26" fill="#475569" />
            {/* Happy ants */}
            <g fill="#1f2937">
              <circle cx="26" cy="58" r="4" />
              <circle cx="33" cy="60" r="3.5" />
              <circle cx="40" cy="62" r="4.5" />
              <circle cx="82" cy="58" r="4" />
              <circle cx="89" cy="60" r="3.5" />
              <circle cx="96" cy="62" r="4.5" />
            </g>
            <path d="M22 52 Q18 58 22 65" stroke="#92400e" strokeWidth="1.5" fill="none" />
            <path d="M78 52 Q74 58 78 65" stroke="#92400e" strokeWidth="1.5" fill="none" />
          </>
        );

      // 3. /t/ Teddy bears playing tennis.
      case 'tt-03':
        return (
          <>
            <rect width="120" height="80" fill="#86efac" />
            <rect x="10" y="14" width="100" height="56" fill="#4ade80" stroke="#fff" strokeWidth="1.5" />
            {/* Tennis net */}
            <line x1="10" y1="42" x2="110" y2="42" stroke="#374151" strokeWidth="2.5" strokeDasharray="3 2" />
            {/* Teddy 1 */}
            <circle cx="36" cy="24" r="7" fill="#b45309" />
            <circle cx="31" cy="18" r="3" fill="#b45309" />
            <circle cx="41" cy="18" r="3" fill="#b45309" />
            <ellipse cx="36" cy="34" rx="8" ry="6" fill="#92400e" />
            {/* Racket & Ball */}
            <ellipse cx="52" cy="26" rx="6" ry="8" fill="none" stroke="#dc2626" strokeWidth="2" />
            <line x1="44" y1="32" x2="48" y2="29" stroke="#dc2626" strokeWidth="2" />
            <circle cx="56" cy="50" r="4.5" fill="#facc15" stroke="#fff" strokeWidth="1" />
            {/* Teddy 2 */}
            <circle cx="80" cy="54" r="7" fill="#b45309" />
            <circle cx="75" cy="48" r="3" fill="#b45309" />
            <circle cx="85" cy="48" r="3" fill="#b45309" />
            <ellipse cx="80" cy="64" rx="8" ry="6" fill="#2563eb" />
            <ellipse cx="66" cy="52" rx="6" ry="8" fill="none" stroke="#0284c7" strokeWidth="2" />
          </>
        );

      // 4. /i/ Inky's in pink ink.
      case 'tt-04':
        return (
          <>
            <rect width="120" height="80" fill="#f5f5f4" />
            <rect x="0" y="46" width="120" height="34" fill="#d6d3d1" />
            {/* Spilled pink ink puddle */}
            <ellipse cx="52" cy="58" rx="34" ry="12" fill="#f472b6" />
            {/* Ink bottle */}
            <rect x="14" y="42" width="16" height="14" rx="3" fill="#e5e7eb" stroke="#6b7280" strokeWidth="1.5" />
            {/* Mouse Inky */}
            <ellipse cx="76" cy="52" rx="10" ry="12" fill="#9ca3af" />
            <circle cx="74" cy="38" r="8" fill="#9ca3af" />
            <circle cx="67" cy="31" r="5" fill="#f472b6" stroke="#9ca3af" strokeWidth="1.5" />
            <circle cx="81" cy="31" r="5" fill="#f472b6" stroke="#9ca3af" strokeWidth="1.5" />
            <circle cx="74" cy="52" r="6" fill="#f472b6" />
          </>
        );

      // 5. /p/ Pink pencil, purple pen!
      case 'tt-05':
        return (
          <>
            <rect width="120" height="80" fill="#fefce8" />
            {/* Pink pencil */}
            <g transform="rotate(-28 45 42)">
              <rect x="38" y="14" width="10" height="44" rx="2" fill="#f472b6" stroke="#db2777" strokeWidth="1.2" />
              <polygon points="38,58 48,58 43,68" fill="#fde047" />
              <polygon points="41,64 45,64 43,68" fill="#ec4899" />
            </g>
            {/* Purple pen */}
            <g transform="rotate(18 76 42)">
              <rect x="70" y="12" width="11" height="46" rx="3" fill="#a855f7" stroke="#6b21a8" strokeWidth="1.2" />
              <polygon points="71,58 80,58 75.5,67" fill="#7e22ce" />
            </g>
          </>
        );

      // 6. /n/ No insects in the nest.
      case 'tt-06':
        return (
          <>
            <rect width="120" height="80" fill="#e0f2fe" />
            <circle cx="88" cy="40" r="34" fill="#22c55e" />
            {/* Branch & empty nest */}
            <path d="M35 55 L115 65" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
            <ellipse cx="75" cy="50" rx="22" ry="11" fill="#a16207" stroke="#713f12" strokeWidth="2" />
            <ellipse cx="75" cy="47" rx="16" ry="6" fill="#78350f" />
            {/* Butterfly flying away */}
            <ellipse cx="32" cy="26" rx="6" ry="8" fill="#facc15" />
            <ellipse cx="24" cy="30" rx="5" ry="6" fill="#eab308" />
            <line x1="28" y1="22" x2="28" y2="35" stroke="#1f2937" strokeWidth="2" />
          </>
        );

      // 7. /c k/ A cat on a kite.
      case 'tt-07':
        return (
          <>
            <rect width="120" height="80" fill="#bae6fd" />
            {/* Kite */}
            <polygon points="56,8 92,38 56,68 20,38" fill="#c084fc" stroke="#7e22ce" strokeWidth="2" />
            <path d="M56 68 Q75 74 96 66" stroke="#6b7280" strokeWidth="1.5" fill="none" />
            {/* Orange Cat sitting on kite */}
            <ellipse cx="56" cy="44" rx="14" ry="10" fill="#f97316" />
            <circle cx="48" cy="30" r="9" fill="#f97316" />
            <polygon points="41,24 44,16 49,23" fill="#ea580c" />
            <polygon points="49,23 54,16 56,24" fill="#ea580c" />
            <circle cx="45" cy="29" r="1.5" fill="#1f2937" />
            <circle cx="51" cy="29" r="1.5" fill="#1f2937" />
          </>
        );

      // 8. /e/ The egg's got legs!
      case 'tt-08':
        return (
          <>
            <rect width="120" height="80" fill="#e0f2fe" />
            <ellipse cx="60" cy="70" rx="52" ry="14" fill="#a16207" />
            {/* Egg with legs */}
            <line x1="52" y1="54" x2="46" y2="70" stroke="#eab308" strokeWidth="3" />
            <line x1="66" y1="54" x2="72" y2="70" stroke="#eab308" strokeWidth="3" />
            <ellipse cx="59" cy="36" rx="17" ry="22" fill="#ffffff" stroke="#9ca3af" strokeWidth="1.5" />
            <polyline points="45,32 53,36 59,30 66,36 74,31" fill="none" stroke="#9ca3af" strokeWidth="1.5" />
            <circle cx="55" cy="28" r="2" fill="#1f2937" />
            <circle cx="63" cy="28" r="2" fill="#1f2937" />
          </>
        );

      // 9. /h/ Happy hens and horses.
      case 'tt-09':
        return (
          <>
            <rect width="120" height="80" fill="#dbeafe" />
            <rect x="0" y="54" width="120" height="26" fill="#9ca3af" />
            {/* Horse */}
            <rect x="26" y="28" width="16" height="26" rx="6" fill="#78350f" />
            <ellipse cx="38" cy="26" rx="10" ry="7" fill="#78350f" />
            <circle cx="42" cy="24" r="1.5" fill="#fff" />
            {/* Happy White Hen */}
            <ellipse cx="78" cy="48" rx="11" ry="9" fill="#ffffff" stroke="#d1d5db" strokeWidth="1.2" />
            <circle cx="85" cy="40" r="6" fill="#ffffff" />
            <path d="M83 34 Q86 30 89 34" fill="#ef4444" />
            <polygon points="91,40 96,42 91,44" fill="#f59e0b" />
          </>
        );

      // 10. /r/ A rabbit in a red rocket.
      case 'tt-10':
        return (
          <>
            <rect width="120" height="80" fill="#1e3a8a" />
            <circle cx="22" cy="18" r="1.5" fill="#fde047" />
            <circle cx="98" cy="24" r="2" fill="#fde047" />
            <circle cx="88" cy="64" r="1.5" fill="#fde047" />
            {/* Rocket */}
            <g transform="rotate(-22 62 42)">
              <polygon points="18,42 32,32 32,52" fill="#f97316" />
              <rect x="32" y="28" width="48" height="28" rx="8" fill="#dc2626" />
              <polygon points="80,28 102,42 80,56" fill="#e5e7eb" />
              {/* Rabbit inside rocket window */}
              <circle cx="64" cy="42" r="10" fill="#bae6fd" />
              <circle cx="64" cy="44" r="6" fill="#ffffff" />
              <ellipse cx="61" cy="35" rx="2" ry="6" fill="#ffffff" />
              <ellipse cx="67" cy="35" rx="2" ry="6" fill="#ffffff" />
            </g>
          </>
        );

      // 11. /m/ Mum's got a muddy mouse.
      case 'tt-11':
        return (
          <>
            <rect width="120" height="80" fill="#dcfce7" />
            {/* Mum in pink shirt */}
            <circle cx="42" cy="26" r="11" fill="#fed7aa" />
            <path d="M30 24 Q42 10 54 24" fill="#92400e" />
            <rect x="28" y="38" width="28" height="36" rx="6" fill="#db2777" />
            {/* Arm holding muddy mouse */}
            <line x1="56" y1="44" x2="82" y2="34" stroke="#db2777" strokeWidth="6" strokeLinecap="round" />
            <line x1="84" y1="34" x2="84" y2="48" stroke="#9ca3af" strokeWidth="1.5" />
            <ellipse cx="84" cy="55" rx="7" ry="9" fill="#f3f4f6" stroke="#78350f" strokeWidth="2" />
            <circle cx="82" cy="53" r="2.5" fill="#78350f" />
            <circle cx="87" cy="58" r="3" fill="#78350f" />
          </>
        );

      // 12. /d/ Dad and the dog are digging.
      case 'tt-12':
        return (
          <>
            <rect width="120" height="80" fill="#bbf7d0" />
            <path d="M0 50 L120 50 L120 80 L0 80 Z" fill="#92400e" />
            {/* Dad digging */}
            <circle cx="38" cy="22" r="7" fill="#fed7aa" />
            <rect x="32" y="30" width="12" height="18" rx="3" fill="#16a34a" />
            <line x1="42" y1="38" x2="62" y2="58" stroke="#475569" strokeWidth="2.5" />
            {/* White Dog digging */}
            <ellipse cx="84" cy="54" rx="13" ry="7" fill="#ffffff" />
            <circle cx="96" cy="48" r="6" fill="#ffffff" />
            <line x1="74" y1="60" x2="70" y2="70" stroke="#ffffff" strokeWidth="3" />
            <line x1="90" y1="60" x2="94" y2="70" stroke="#ffffff" strokeWidth="3" />
          </>
        );

      // 13. /g/ I've got green grapes.
      case 'tt-13':
        return (
          <>
            <rect width="120" height="80" fill="#fef3c7" />
            {/* Bee */}
            <ellipse cx="42" cy="44" rx="12" ry="9" fill="#facc15" stroke="#1f2937" strokeWidth="1.5" />
            <line x1="38" y1="36" x2="38" y2="52" stroke="#1f2937" strokeWidth="3" />
            <line x1="46" y1="36" x2="46" y2="52" stroke="#1f2937" strokeWidth="3" />
            {/* Bunch of green grapes */}
            <g fill="#65a30d" stroke="#365314" strokeWidth="1">
              <circle cx="74" cy="28" r="6" />
              <circle cx="84" cy="28" r="6" />
              <circle cx="94" cy="28" r="6" />
              <circle cx="78" cy="38" r="6" />
              <circle cx="88" cy="38" r="6" />
              <circle cx="83" cy="48" r="6" />
              <circle cx="83" cy="58" r="5.5" />
            </g>
          </>
        );

      // 14. /o/ On, off, on, off
      case 'tt-14':
        return (
          <>
            <rect x="0" y="0" width="60" height="80" fill="#fef9c3" />
            <rect x="60" y="0" width="60" height="80" fill="#475569" />
            <line x1="60" y1="0" x2="60" y2="80" stroke="#fff" strokeWidth="2" />
            {/* Lamp ON */}
            <polygon points="18,40 42,40 36,22 24,22" fill="#ffffff" stroke="#eab308" strokeWidth="2" />
            <rect x="27" y="40" width="6" height="18" fill="#cbd5e1" />
            {/* Lamp OFF */}
            <polygon points="78,40 102,40 96,22 84,22" fill="#6b21a8" />
            <rect x="87" y="40" width="6" height="18" fill="#64748b" />
          </>
        );

      // 15. /u/ My umbrella's upstairs.
      case 'tt-15':
        return (
          <>
            <rect width="120" height="80" fill="#e2e8f0" />
            {/* Stairs */}
            <polygon points="20,76 20,60 40,60 40,46 60,46 60,32 98,32 98,76" fill="#b45309" />
            {/* White Umbrella */}
            <path d="M56 26 Q76 6 96 26 Z" fill="#ffffff" stroke="#475569" strokeWidth="1.5" />
            <line x1="76" y1="26" x2="76" y2="42" stroke="#475569" strokeWidth="2" />
          </>
        );

      // 16. /l/ I like lemon lollipops.
      case 'tt-16':
        return (
          <>
            <rect width="120" height="80" fill="#bef264" />
            {/* Mouse */}
            <ellipse cx="56" cy="52" rx="12" ry="15" fill="#9ca3af" />
            <circle cx="56" cy="32" r="9" fill="#9ca3af" />
            <circle cx="48" cy="24" r="5" fill="#f472b6" />
            <circle cx="64" cy="24" r="5" fill="#f472b6" />
            {/* Spiral Lollipop */}
            <line x1="74" y1="54" x2="86" y2="32" stroke="#fff" strokeWidth="2.5" />
            <circle cx="88" cy="28" r="11" fill="#ffffff" stroke="#6b7280" strokeWidth="1.5" />
            <circle cx="88" cy="28" r="6" fill="none" stroke="#eab308" strokeWidth="1.5" />
            {/* Lemon box */}
            <rect x="20" y="44" width="16" height="22" rx="2" fill="#facc15" stroke="#ca8a04" strokeWidth="1.2" />
          </>
        );

      // 17. /f/ Five fish with flags.
      case 'tt-17':
        return (
          <>
            <rect width="120" height="80" fill="#7dd3fc" />
            {[
              { x: 24, y: 24, c: '#facc15' },
              { x: 56, y: 20, c: '#ef4444' },
              { x: 86, y: 28, c: '#22c55e' },
              { x: 38, y: 54, c: '#f97316' },
              { x: 76, y: 56, c: '#a855f7' },
            ].map((f, i) => (
              <g key={i}>
                <ellipse cx={f.x} cy={f.y} rx="9" ry="5.5" fill={f.c} />
                <polygon points={`${f.x - 8},${f.y} ${f.x - 14},${f.y - 5} ${f.x - 14},${f.y + 5}`} fill={f.c} />
                <line x1={f.x + 2} y1={f.y - 5} x2={f.x + 2} y2={f.y - 14} stroke="#1e293b" strokeWidth="1.2" />
                <polygon points={`${f.x + 2},${f.y - 14} ${f.x + 10},${f.y - 11} ${f.x + 2},${f.y - 8}`} fill="#ef4444" />
              </g>
            ))}
          </>
        );

      // 18. /b/ A bat and ball in a bucket.
      case 'tt-18':
        return (
          <>
            <rect width="120" height="80" fill="#fde68a" />
            {/* White bucket */}
            <ellipse cx="48" cy="48" rx="18" ry="20" fill="#ffffff" stroke="#9ca3af" strokeWidth="1.5" />
            {/* Red bat & yellow ball */}
            <line x1="48" y1="50" x2="96" y2="62" stroke="#ef4444" strokeWidth="7" strokeLinecap="round" />
            <circle cx="56" cy="56" r="6.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1.2" />
          </>
        );

      // 19. /ai/ A snail sailing in the rain.
      case 'tt-19':
        return (
          <>
            <rect width="120" height="80" fill="#94a3b8" />
            <path d="M0 58 Q60 50 120 58 L120 80 L0 80 Z" fill="#0284c7" />
            {/* Boat & Sail */}
            <polygon points="24,56 96,56 82,70 38,70" fill="#78350f" />
            <polygon points="58,12 58,54 32,50" fill="#ffffff" />
            <polygon points="62,16 62,54 88,50" fill="#f1f5f9" />
            {/* Snail on boat */}
            <circle cx="72" cy="48" r="7" fill="#fde68a" stroke="#92400e" strokeWidth="1.5" />
          </>
        );

      // 20. /j/ I like jam, juice and jelly!
      case 'tt-20':
        return (
          <>
            <rect width="120" height="80" fill="#fb923c" />
            {/* Jam jar */}
            <rect x="22" y="42" width="16" height="22" rx="3" fill="#dc2626" stroke="#fff" strokeWidth="1.2" />
            <rect x="20" y="38" width="20" height="5" rx="1" fill="#fde047" />
            {/* Juice glass */}
            <rect x="46" y="40" width="14" height="24" rx="2" fill="#facc15" stroke="#fff" strokeWidth="1.2" />
            {/* Jelly */}
            <path d="M70 64 L76 36 L98 36 L104 64 Z" fill="#f472b6" stroke="#fff" strokeWidth="1.5" />
          </>
        );

      // 21. /oa/ A goat and a coat in a boat.
      case 'tt-21':
        return (
          <>
            <rect width="120" height="80" fill="#bae6fd" />
            <path d="M0 58 Q60 52 120 58 L120 80 L0 80 Z" fill="#38bdf8" />
            {/* White Boat */}
            <polygon points="20,54 100,54 86,68 34,68" fill="#ffffff" stroke="#64748b" strokeWidth="1.5" />
            {/* Green Coat on mast */}
            <line x1="52" y1="16" x2="52" y2="54" stroke="#78350f" strokeWidth="3" />
            <rect x="34" y="22" width="24" height="18" rx="3" fill="#15803d" />
            {/* Goat */}
            <ellipse cx="76" cy="48" rx="10" ry="7" fill="#9ca3af" />
            <circle cx="84" cy="40" r="5" fill="#9ca3af" />
          </>
        );

      // 22. /ie/ I've got a tie and a pie.
      case 'tt-22':
        return (
          <>
            <rect width="120" height="80" fill="#fef08a" />
            {/* Man with purple tie */}
            <circle cx="38" cy="26" r="11" fill="#fed7aa" />
            <path d="M26 22 Q38 10 50 22" fill="#57534e" />
            <rect x="24" y="38" width="28" height="36" rx="4" fill="#f8fafc" />
            <polygon points="38,38 42,58 38,66 34,58" fill="#9333ea" />
            {/* Pie */}
            <ellipse cx="82" cy="50" rx="20" ry="9" fill="#fde68a" stroke="#b45309" strokeWidth="2" />
          </>
        );

      // 23. /ee/ I see three bees in a tree.
      case 'tt-23':
        return (
          <>
            <rect width="120" height="80" fill="#e0f2fe" />
            <rect x="28" y="18" width="16" height="62" fill="#78350f" />
            <circle cx="36" cy="16" r="24" fill="#22c55e" />
            {/* Beehive */}
            <ellipse cx="68" cy="44" rx="14" ry="18" fill="#fde047" stroke="#ca8a04" strokeWidth="1.5" />
            <circle cx="66" cy="48" r="3.5" fill="#451a03" />
            {/* 3 Bees */}
            <circle cx="48" cy="54" r="4" fill="#facc15" stroke="#000" strokeWidth="1.2" />
            <circle cx="88" cy="36" r="4" fill="#facc15" stroke="#000" strokeWidth="1.2" />
            <circle cx="92" cy="56" r="4" fill="#facc15" stroke="#000" strokeWidth="1.2" />
          </>
        );

      // 24. /z/ Zebras, zebras, at the zoo.
      case 'tt-24':
        return (
          <>
            <rect width="120" height="80" fill="#bef264" />
            {[32, 62, 90].map((x, idx) => (
              <g key={idx}>
                <ellipse cx={x} cy={46 + (idx % 2) * 8} rx="12" ry="8" fill="#ffffff" stroke="#1f2937" strokeWidth="1.5" />
                <line x1={x - 4} y1={39 + (idx % 2) * 8} x2={x - 4} y2={53 + (idx % 2) * 8} stroke="#1f2937" strokeWidth="2.5" />
                <line x1={x + 2} y1={39 + (idx % 2) * 8} x2={x + 2} y2={53 + (idx % 2) * 8} stroke="#1f2937" strokeWidth="2.5" />
                <circle cx={x - 10} cy={38 + (idx % 2) * 8} r="5" fill="#ffffff" stroke="#1f2937" strokeWidth="1.5" />
              </g>
            ))}
          </>
        );

      // 25. /or/ The horse and tortoise like corn.
      case 'tt-25':
        return (
          <>
            <rect width="120" height="80" fill="#e0f2fe" />
            <rect x="0" y="54" width="120" height="26" fill="#94a3b8" />
            {/* Tortoise */}
            <path d="M18 52 Q30 36 42 52 Z" fill="#15803d" />
            <circle cx="45" cy="48" r="4" fill="#65a30d" />
            {/* Corn */}
            <ellipse cx="58" cy="52" rx="8" ry="4" fill="#facc15" />
            {/* Horse */}
            <ellipse cx="86" cy="42" rx="14" ry="12" fill="#475569" />
            <circle cx="82" cy="30" r="8" fill="#475569" />
          </>
        );

      // 26. /w/ It's wet and windy.
      case 'tt-26':
        return (
          <>
            <rect width="120" height="80" fill="#64748b" />
            <path d="M0 54 L120 54 L120 80 L0 80 Z" fill="#4ade80" />
            {/* Wind-blown tree & umbrella */}
            <ellipse cx="34" cy="28" rx="18" ry="10" fill="#15803d" />
            <path d="M62 34 Q82 14 102 34 Z" fill="#ffffff" />
            <g stroke="#bae6fd" strokeWidth="1.5">
              <line x1="20" y1="8" x2="12" y2="20" />
              <line x1="50" y1="10" x2="42" y2="22" />
              <line x1="88" y1="8" x2="80" y2="20" />
            </g>
          </>
        );

      // 27. /ng/ I'm long and strong!
      case 'tt-27':
        return (
          <>
            <rect width="120" height="80" fill="#dcfce7" />
            {/* Red strong snake + barbell */}
            <path d="M28 62 Q55 70 72 52 Q86 36 78 22" stroke="#dc2626" strokeWidth="10" fill="none" strokeLinecap="round" />
            <circle cx="78" cy="20" r="7" fill="#dc2626" />
            <line x1="18" y1="48" x2="48" y2="64" stroke="#64748b" strokeWidth="3" />
            <circle cx="18" cy="48" r="8" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
            <circle cx="48" cy="64" r="8" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
          </>
        );

      // 28. /ng/ Look at the King's ring.
      case 'tt-28':
        return (
          <>
            <rect width="120" height="80" fill="#fed7aa" />
            {/* King with crown and ring */}
            <circle cx="46" cy="30" r="10" fill="#fde68a" />
            <polygon points="36,22 40,12 46,20 52,12 56,22" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            <rect x="34" y="40" width="24" height="32" rx="4" fill="#dc2626" />
            <circle cx="80" cy="38" r="7" fill="none" stroke="#facc15" strokeWidth="2.5" />
            <polygon points="80,26 85,31 80,34 75,31" fill="#38bdf8" />
          </>
        );

      // 29. /v/ Listen! Violins on a volcano.
      case 'tt-29':
        return (
          <>
            <rect width="120" height="80" fill="#bae6fd" />
            {/* Volcano erupting */}
            <polygon points="10,74 34,28 48,28 70,74" fill="#78350f" />
            <path d="M34 28 Q41 12 48 28 L44 46 L38 46 Z" fill="#ef4444" />
            {/* Violin */}
            <ellipse cx="86" cy="46" rx="9" ry="13" fill="#b45309" stroke="#451a03" strokeWidth="1.5" />
            <line x1="86" y1="22" x2="86" y2="62" stroke="#fde047" strokeWidth="2" />
          </>
        );

      // 30. /oo/ Look, look, look at my book!
      case 'tt-30':
        return (
          <>
            <rect width="120" height="80" fill="#86efac" />
            {/* Two kids reading open book */}
            <circle cx="36" cy="30" r="9" fill="#fed7aa" />
            <circle cx="82" cy="30" r="9" fill="#fed7aa" />
            <rect x="44" y="44" width="32" height="22" rx="2" fill="#ffffff" stroke="#475569" strokeWidth="1.5" />
            <line x1="60" y1="44" x2="60" y2="66" stroke="#475569" strokeWidth="1.5" />
          </>
        );

      // 31. /oo/ Ooh! A kangaroo on the moon!
      case 'tt-31':
        return (
          <>
            <rect width="120" height="80" fill="#0f172a" />
            <circle cx="26" cy="20" r="9" fill="#38bdf8" />
            {/* Moon surface */}
            <path d="M0 58 Q60 40 120 58 L120 80 L0 80 Z" fill="#cbd5e1" />
            {/* White Kangaroo */}
            <ellipse cx="64" cy="44" rx="11" ry="7" fill="#ffffff" />
            <circle cx="72" cy="34" r="5" fill="#ffffff" />
            <path d="M53 46 Q40 50 36 42" stroke="#ffffff" strokeWidth="3" fill="none" />
          </>
        );

      // 32. /y/ I like yogurt. Yum, yum, yum.
      case 'tt-32':
        return (
          <>
            <rect width="120" height="80" fill="#dcfce7" />
            {/* Boy eating yellow yogurt */}
            <circle cx="78" cy="28" r="11" fill="#b45309" />
            <rect x="64" y="40" width="28" height="32" rx="5" fill="#dc2626" />
            {/* Yogurt cups */}
            <rect x="22" y="46" width="16" height="20" rx="2" fill="#ffffff" stroke="#9ca3af" strokeWidth="1.2" />
            <rect x="20" y="44" width="20" height="4" fill="#facc15" />
            <rect x="44" y="52" width="16" height="18" rx="2" fill="#ffffff" stroke="#9ca3af" strokeWidth="1.2" />
            <rect x="42" y="50" width="20" height="4" fill="#facc15" />
          </>
        );

      // 33. /x/ Six foxes in a box.
      case 'tt-33':
        return (
          <>
            <rect width="120" height="80" fill="#bae6fd" />
            {/* Brown box */}
            <rect x="26" y="44" width="68" height="30" rx="3" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
            {/* Foxes popping out */}
            {[36, 52, 68, 84].map((x, i) => (
              <g key={i}>
                <polygon points={`${x - 7},44 ${x},26 ${x + 7},44`} fill={i === 2 ? '#ffffff' : '#ea580c'} />
                <circle cx={x} cy="36" r="1.5" fill="#1f2937" />
              </g>
            ))}
          </>
        );

      // 34. /ch/ Chicks in the chimney. Cheep, cheep, cheep!
      case 'tt-34':
        return (
          <>
            <rect width="120" height="80" fill="#e0f2fe" />
            {/* Red brick chimney */}
            <rect x="28" y="38" width="64" height="38" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
            {/* Yellow chicks on top */}
            <circle cx="44" cy="30" r="8" fill="#facc15" />
            <circle cx="62" cy="28" r="9" fill="#facc15" />
            <circle cx="78" cy="31" r="8" fill="#facc15" />
          </>
        );

      // 35. /sh/ Sheep in shoes on a ship.
      case 'tt-35':
        return (
          <>
            <rect width="120" height="80" fill="#e0f2fe" />
            <path d="M0 60 Q60 54 120 60 L120 80 L0 80 Z" fill="#38bdf8" />
            {/* Ship */}
            <polygon points="20,52 100,52 88,68 32,68" fill="#ffffff" stroke="#64748b" strokeWidth="1.5" />
            <rect x="44" y="18" width="14" height="28" rx="2" fill="#fde047" />
            <rect x="64" y="22" width="14" height="24" rx="2" fill="#fde047" />
            {/* Sheep */}
            <circle cx="36" cy="46" r="6" fill="#f8fafc" stroke="#334155" strokeWidth="1.2" />
            <circle cx="82" cy="46" r="6" fill="#f8fafc" stroke="#334155" strokeWidth="1.2" />
          </>
        );

      // 36. /th/ This feather, that feather.
      case 'tt-36':
        return (
          <>
            <rect width="120" height="80" fill="#e0f2fe" />
            {/* Big white feather ("This") */}
            <path d="M22 66 Q30 24 54 18 Q48 50 22 66 Z" fill="#ffffff" stroke="#64748b" strokeWidth="1.5" />
            {/* Small colored feather ("That") */}
            <path d="M84 48 Q90 32 100 30 Q96 44 84 48 Z" fill="#ec4899" stroke="#be185d" strokeWidth="1.2" />
          </>
        );

      // 37. /th/ Three thin clowns.
      case 'tt-37':
        return (
          <>
            <rect width="120" height="80" fill="#fce7f3" />
            {[32, 60, 88].map((x, i) => (
              <g key={i}>
                <circle cx={x} cy="28" r="8" fill="#ffffff" stroke="#db2777" strokeWidth="1.2" />
                <circle cx={x} cy="29" r="2.5" fill="#ef4444" />
                <rect x={x - 5} y="37" width="10" height="34" rx="3" fill={i === 1 ? '#22c55e' : '#3b82f6'} />
              </g>
            ))}
          </>
        );

      // 38. /qu/ A quiet Queen with a quilt.
      case 'tt-38':
        return (
          <>
            <rect width="120" height="80" fill="#f3e8ff" />
            {/* Bed & Quilt */}
            <ellipse cx="60" cy="58" rx="46" ry="18" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Queen with crown */}
            <circle cx="60" cy="26" r="9" fill="#fed7aa" />
            <polygon points="52,18 56,11 60,17 64,11 68,18" fill="#facc15" />
          </>
        );

      // 39. /ou/ A loud mouse in the clouds.
      case 'tt-39':
        return (
          <>
            <rect width="120" height="80" fill="#38bdf8" />
            <circle cx="88" cy="54" r="18" fill="#ffffff" />
            <circle cx="72" cy="58" r="14" fill="#ffffff" />
            {/* White loud mouse */}
            <ellipse cx="52" cy="48" rx="11" ry="14" fill="#ffffff" />
            <circle cx="56" cy="32" r="8" fill="#ffffff" />
            <line x1="68" y1="30" x2="78" y2="26" stroke="#fff" strokeWidth="2" />
            <line x1="68" y1="34" x2="80" y2="34" stroke="#fff" strokeWidth="2" />
          </>
        );

      // 40. /oi/ Point to the coin in the soil.
      case 'tt-40':
        return (
          <>
            <rect width="120" height="80" fill="#a16207" />
            {/* Pointing hand */}
            <path d="M12 22 L42 34" stroke="#fed7aa" strokeWidth="8" strokeLinecap="round" />
            {/* Silver coins in soil */}
            <circle cx="54" cy="44" r="7" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
            <circle cx="74" cy="52" r="7" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
            <circle cx="88" cy="38" r="7" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
          </>
        );

      // 41. /ue/ A blue barbecue for you!
      case 'tt-41':
        return (
          <>
            <rect width="120" height="80" fill="#dcfce7" />
            {/* Blue BBQ grill */}
            <path d="M46 44 Q74 72 102 44 Z" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" />
            <ellipse cx="74" cy="44" rx="28" ry="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
            {/* Boy */}
            <circle cx="26" cy="28" r="8" fill="#fed7aa" />
            <rect x="18" y="38" width="16" height="28" rx="3" fill="#dc2626" />
          </>
        );

      // 42. /er/ A spider in a purple flower.
      case 'tt-42':
        return (
          <>
            <rect width="120" height="80" fill="#e0f2fe" />
            {/* Purple flower petals */}
            <g fill="#a855f7" stroke="#7e22ce" strokeWidth="1.2">
              <circle cx="60" cy="22" r="14" />
              <circle cx="42" cy="36" r="14" />
              <circle cx="78" cy="36" r="14" />
              <circle cx="48" cy="56" r="14" />
              <circle cx="72" cy="56" r="14" />
            </g>
            {/* Spider in center */}
            <circle cx="60" cy="40" r="9" fill="#78350f" />
            <circle cx="57" cy="38" r="1.5" fill="#fff" />
            <circle cx="63" cy="38" r="1.5" fill="#fff" />
          </>
        );

      // 43. /ar/ A star in a jar on a car.
      case 'tt-43':
        return (
          <>
            <rect width="120" height="80" fill="#334155" />
            {/* Glass jar on car */}
            <rect x="44" y="12" width="32" height="38" rx="5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
            <polygon points="60,18 64,27 74,28 66,34 68,44 60,39 52,44 54,34 46,28 56,27" fill="#fde047" stroke="#eab308" strokeWidth="1" />
            {/* Purple car */}
            <rect x="30" y="50" width="60" height="18" rx="6" fill="#7c3aed" />
            <circle cx="42" cy="68" r="6" fill="#1e293b" />
            <circle cx="78" cy="68" r="6" fill="#1e293b" />
          </>
        );

      // 44. /i/ I'm sick. Doctor, come quick.
      case 'tt-44':
        return (
          <>
            <rect width="120" height="80" fill="#f3e8ff" />
            {/* Bed with sick mouse */}
            <rect x="18" y="38" width="44" height="28" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
            <circle cx="32" cy="34" r="7" fill="#9ca3af" />
            {/* Doctor lion */}
            <circle cx="84" cy="28" r="9" fill="#d97706" />
            <rect x="76" y="38" width="16" height="26" rx="3" fill="#ffffff" />
            <circle cx="96" cy="48" r="6" fill="#1f2937" />
          </>
        );

      // 45. /x/ Six x-rays in a box.
      case 'tt-45':
        return (
          <>
            <rect width="120" height="80" fill="#fde68a" />
            {/* Box with dark x-ray sheets */}
            <rect x="20" y="38" width="44" height="32" rx="3" fill="#b45309" />
            <rect x="26" y="18" width="30" height="34" rx="2" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.2" />
            <line x1="34" y1="26" x2="48" y2="42" stroke="#e2e8f0" strokeWidth="2" />
            <line x1="48" y1="26" x2="34" y2="42" stroke="#e2e8f0" strokeWidth="2" />
          </>
        );

      // 46. /ng/ We're running and jumping! We're fit and strong.
      case 'tt-46':
        return (
          <>
            <rect width="120" height="80" fill="#bbf7d0" />
            <rect x="0" y="42" width="120" height="38" fill="#b91c1c" />
            {/* Mouse running & Bee jumping rope */}
            <circle cx="36" cy="42" r="8" fill="#9ca3af" />
            <circle cx="80" cy="46" r="8" fill="#1f2937" />
            <path d="M66 48 Q80 18 94 48" stroke="#e2e8f0" strokeWidth="2" fill="none" />
          </>
        );

      // 47. /ou/ A happy clown's mouth.
      case 'tt-47':
        return (
          <>
            <rect width="120" height="80" fill="#fed7aa" />
            {/* Clown with pink hair & big happy mouth */}
            <circle cx="42" cy="36" r="12" fill="#f472b6" />
            <circle cx="78" cy="36" r="12" fill="#f472b6" />
            <circle cx="60" cy="40" r="16" fill="#ffffff" />
            <polygon points="42,26 78,22 72,10 48,12" fill="#15803d" />
            <circle cx="60" cy="40" r="4" fill="#ef4444" />
            <path d="M50 46 Q60 56 70 46" stroke="#ef4444" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        );

      // 48. /t/ A teddy with a tie on a train.
      case 'tt-48':
        return (
          <>
            <rect width="120" height="80" fill="#bae6fd" />
            {/* Toy train */}
            <rect x="20" y="50" width="80" height="18" rx="3" fill="#dc2626" />
            <circle cx="34" cy="70" r="6" fill="#facc15" />
            <circle cx="60" cy="70" r="6" fill="#facc15" />
            <circle cx="86" cy="70" r="6" fill="#facc15" />
            {/* White Teddy with tie */}
            <circle cx="52" cy="26" r="10" fill="#ffffff" />
            <ellipse cx="52" cy="42" rx="12" ry="10" fill="#ffffff" />
            <polygon points="52,34 55,46 52,50 49,46" fill="#b45309" />
          </>
        );

      // 49. /r/ Can you rescue the rabbit?
      case 'tt-49':
      default:
        return (
          <>
            <rect width="120" height="80" fill="#dcfce7" />
            {/* Tree & white rabbit stuck in tree */}
            <rect x="52" y="34" width="14" height="46" fill="#78350f" />
            <circle cx="58" cy="24" r="24" fill="#16a34a" />
            <ellipse cx="48" cy="22" rx="8" ry="5" fill="#ffffff" />
            <circle cx="55" cy="20" r="4" fill="#ffffff" />
            {/* Person rescuing */}
            <circle cx="86" cy="44" r="7" fill="#fed7aa" />
            <rect x="78" y="52" width="16" height="26" rx="3" fill="#9333ea" />
          </>
        );
    }
  };

  return (
    <div
      className={`${className} rounded-xl overflow-hidden border border-stone-200 bg-white shadow-2xs shrink-0 relative select-none`}
    >
      <svg
        viewBox="0 0 120 80"
        className="w-full h-full object-cover"
        aria-label={`Minh họa âm ${soundTitle}`}
      >
        {renderScene()}
        {/* Nhãn âm nhỏ trong góc khung tranh giống hệt sách gốc */}
        <g>
          <rect
            x="84"
            y="4"
            width="32"
            height="18"
            rx="6"
            fill="rgba(255,255,255,0.92)"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
          <text
            x="100"
            y="16.5"
            textAnchor="middle"
            fontSize="11"
            fontWeight="800"
            fill="#334155"
          >
            {cleanSoundBadge}
          </text>
        </g>
      </svg>
    </div>
  );
};
