import { useState, useRef, useEffect, Fragment } from 'react';
import confetti from 'canvas-confetti';
import { PhonicsSound } from '../data/phonicsData';
import {
  BlendingWordItem,
  getStoredBlendingWordsList,
  saveStoredBlendingWordsList,
  getCachedBlendingAudio,
  deleteBlendingAudio,
} from '../utils/audioStorage';
import {
  speakPhoneme,
  speakWholeWordAi,
  playBlendSuccessChime,
  stopSpeaking,
} from '../utils/audioPlayer';
import {
  BLENDING_LEVELS,
  BlendingLevelKey,
  getWordBankForSound,
} from '../data/wordBankData';
import { getSyllableSplit } from '../utils/syllableHelper';

interface BlendingManagerTabProps {
  sound: PhonicsSound;
}

// Phonics digraphs, trigraphs, and double consonants for auto-detecting sound bars
const SPECIAL_PHONEMES = [
  'igh', 'air', 'ear', 'ure', // trigraphs
  'ai', 'ee', 'ie', 'oa', 'ue', 'er', 'ar', 'or', 'ou', 'oi', 'oo',
  'ch', 'sh', 'th', 'ng', 'qu', 'ck', 'wh', 'ph', 'ay', 'oy', 'ea',
  'ow', 'ew', 'ur', 'ir', 'aw', 'au',
  'll', 'ff', 'ss', 'zz', 'pp', 'nn', 'tt', 'dd', 'bb', 'gg', 'rr', 'mm',
];

// End-of-word consonant + silent-e digraphs (e.g. give, have, live, sleeve, solve, breeze, freeze, sneeze, tense)
const END_OF_WORD_SILENT_E_DIGRAPHS = ['ve', 'ze', 'se'];

export function parseWordToPhonemes(input: string): string[] {
  const clean = input.toLowerCase().trim();
  if (!clean) return [];

  // If user used hyphens or commas: e.g. "s-a-t" or "r-ai-n" or "s, a, t"
  if (clean.includes('-') || clean.includes(',')) {
    return clean
      .split(/[-,\s]+/)
      .map((p) => p.trim())
      .filter(Boolean);
  }

  // Auto-parse using digraph detection
  const result: string[] = [];
  let i = 0;
  while (i < clean.length) {
    const threeChars = clean.slice(i, i + 3);
    if (SPECIAL_PHONEMES.includes(threeChars)) {
      result.push(threeChars);
      i += 3;
      continue;
    }
    const twoChars = clean.slice(i, i + 2);
    const isAtWordEnd = i + 2 === clean.length && clean.length >= 3;
    if (
      SPECIAL_PHONEMES.includes(twoChars) ||
      (isAtWordEnd && END_OF_WORD_SILENT_E_DIGRAPHS.includes(twoChars))
    ) {
      result.push(twoChars);
      i += 2;
      continue;
    }
    result.push(clean[i]);
    i += 1;
  }
  return result;
}

function getWordSizeConfig(phonemeCount: number) {
  if (phonemeCount <= 3) {
    return {
      textSize: 'text-7xl sm:text-8xl md:text-9xl lg:text-[10rem]',
      gapClass: 'gap-4 sm:gap-6 md:gap-8',
      gapCss: 'clamp(1rem, 2.5vw, 1.75rem)',
      dotSize: 'w-6 h-6 sm:w-7 sm:h-7',
      digraphMinWidth: 'min-w-[56px] sm:min-w-[70px]',
      digraphHeight: 'h-3.5 sm:h-4',
      dotMarginTop: 'mt-4 sm:mt-6',
      dotContainerHeight: 'h-8',
      slashSize: 'text-7xl sm:text-8xl md:text-9xl lg:text-[10rem]',
    };
  }
  if (phonemeCount === 4) {
    return {
      textSize: 'text-6xl sm:text-7xl md:text-8xl lg:text-[8.5rem]',
      gapClass: 'gap-3 sm:gap-4.5 md:gap-6',
      gapCss: 'clamp(0.85rem, 2.2vw, 1.5rem)',
      dotSize: 'w-5 h-5 sm:w-6 sm:h-6',
      digraphMinWidth: 'min-w-[46px] sm:min-w-[58px]',
      digraphHeight: 'h-3 sm:h-3.5',
      dotMarginTop: 'mt-4 sm:mt-5',
      dotContainerHeight: 'h-7',
      slashSize: 'text-6xl sm:text-7xl md:text-8xl lg:text-[8.5rem]',
    };
  }
  if (phonemeCount === 5) {
    return {
      textSize: 'text-5xl sm:text-6xl md:text-7xl lg:text-[7rem]',
      gapClass: 'gap-2.5 sm:gap-3.5 md:gap-5',
      gapCss: 'clamp(0.75rem, 1.9vw, 1.25rem)',
      dotSize: 'w-4 h-4 sm:w-5 sm:h-5',
      digraphMinWidth: 'min-w-[38px] sm:min-w-[48px]',
      digraphHeight: 'h-2.5 sm:h-3',
      dotMarginTop: 'mt-3 sm:mt-4',
      dotContainerHeight: 'h-6',
      slashSize: 'text-5xl sm:text-6xl md:text-7xl lg:text-[7rem]',
    };
  }
  if (phonemeCount === 6) {
    return {
      textSize: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
      gapClass: 'gap-2 sm:gap-3 md:gap-4',
      gapCss: 'clamp(0.65rem, 1.6vw, 1.1rem)',
      dotSize: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
      digraphMinWidth: 'min-w-[30px] sm:min-w-[40px]',
      digraphHeight: 'h-2 sm:h-2.5',
      dotMarginTop: 'mt-2.5 sm:mt-3.5',
      dotContainerHeight: 'h-5',
      slashSize: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
    };
  }
  // 7+ phonemes (dentist, plastic, windmill, caterpillar, ...)
  return {
    textSize: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
    gapClass: 'gap-1.5 sm:gap-2.5 md:gap-3',
    gapCss: 'clamp(0.5rem, 1.3vw, 0.85rem)',
    dotSize: 'w-3 h-3 sm:w-3.5 sm:h-3.5',
    digraphMinWidth: 'min-w-[24px] sm:min-w-[32px]',
    digraphHeight: 'h-1.5 sm:h-2',
    dotMarginTop: 'mt-2 sm:mt-3',
    dotContainerHeight: 'h-5',
    slashSize: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
  };
}

function getInitialWordsForSoundAndLevel(soundId: string, level: BlendingLevelKey): BlendingWordItem[] {
  const list = getWordBankForSound(soundId, level);
  const seen = new Set<string>();
  const uniqueWords: string[] = [];
  for (const w of list) {
    const clean = w.toLowerCase().trim();
    if (clean && !seen.has(clean)) {
      seen.add(clean);
      uniqueWords.push(clean);
    }
  }
  return uniqueWords.map((w, idx) => ({
    id: `blending_${soundId}_${level}_${w}_${idx}`,
    soundId,
    word: w,
    phonemes: parseWordToPhonemes(w),
    updatedAt: new Date().toISOString(),
  }));
}

export function BlendingManagerTab({ sound }: BlendingManagerTabProps) {
  // Trình độ từ vựng được chọn (5-6 tuổi, 7-8 tuổi, 9-10 tuổi)
  const [selectedLevel, setSelectedLevel] = useState<BlendingLevelKey>('age_5_6');

  // Danh sách từ vựng lấy trực tiếp 100% từ Jolly Phonics Word Bank theo từng âm và trình độ
  const [words, setWords] = useState<BlendingWordItem[]>(() => {
    return getInitialWordsForSoundAndLevel(sound.id, 'age_5_6');
  });

  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(0);

  // New word form state
  const [isAddingWord, setIsAddingWord] = useState<boolean>(false);
  const [newWordInput, setNewWordInput] = useState<string>('');
  const [newPhonemesInput, setNewPhonemesInput] = useState<string>('');

  // Interactive Blending & Highlighting states
  const [activePhonemeIndex, setActivePhonemeIndex] = useState<number | null>(null);
  const [isBlendingWholeWord, setIsBlendingWholeWord] = useState<boolean>(false);
  const [isAutoBlending, setIsAutoBlending] = useState<boolean>(false);
  const [autoBlendStage, setAutoBlendStage] = useState<'idle' | 'slow' | 'fast' | 'ai'>('idle');

  // Trạng thái hiển thị xuộc phân tách 2 âm tiết (chỉ xuất hiện ở cuối cùng sau khi đã đọc hết toàn bộ âm lẻ)
  const [isSlashRevealed, setIsSlashRevealed] = useState<boolean>(false);

  const autoBlendTimeoutRef = useRef<number | null>(null);

  // Tự động tải đúng danh sách từ không trùng lặp theo từng âm và trình độ từ vựng
  useEffect(() => {
    const list = getInitialWordsForSoundAndLevel(sound.id, selectedLevel);
    setWords(list);
    setSelectedWordIndex(0);
    setIsAddingWord(false);
    setActivePhonemeIndex(null);
    setIsBlendingWholeWord(false);
    setIsSlashRevealed(false);
    stopSpeaking();
  }, [sound.id, selectedLevel]);

  // Chuyển đổi trình độ từ vựng
  const handleSelectLevel = (level: BlendingLevelKey) => {
    setSelectedLevel(level);
    const list = getInitialWordsForSoundAndLevel(sound.id, level);
    setWords(list);
    setSelectedWordIndex(0);
    setActivePhonemeIndex(null);
    setIsBlendingWholeWord(false);
    setIsSlashRevealed(false);
    stopSpeaking();
  };

  // Clean up auto blend timeout on unmount
  useEffect(() => {
    return () => {
      if (autoBlendTimeoutRef.current) {
        clearTimeout(autoBlendTimeoutRef.current);
      }
      stopSpeaking();
    };
  }, []);

  const activeWord = words[selectedWordIndex] || words[0];
  // Phân tích âm tiết: kiểm tra từ 2 âm tiết và vị trí đặt xuộc
  const syllableSplit = activeWord ? getSyllableSplit(activeWord.word, activeWord.phonemes) : null;
  // Cấu hình kích cỡ co giãn tự động để đảm bảo từ dài luôn fit trọn vẹn 1 dòng không xuống dòng
  const sizeConfig = getWordSizeConfig(activeWord ? activeWord.phonemes.length : 3);

  // Persist words
  const updateWordsList = (newList: BlendingWordItem[]) => {
    setWords(newList);
    saveStoredBlendingWordsList(sound.id, newList);
  };

  // Add sample words quickly if user wants to test
  const handleAddSampleWords = () => {
    const list = getInitialWordsForSoundAndLevel(sound.id, selectedLevel);
    setWords(list);
    setSelectedWordIndex(0);
    setActivePhonemeIndex(null);
    setIsBlendingWholeWord(false);
    stopSpeaking();
  };

  // Add new word (không thêm trùng nếu từ đã có trong danh sách)
  const handleAddNewWord = (e: React.FormEvent) => {
    e.preventDefault();
    const rawWord = newWordInput.trim().toLowerCase();
    if (!rawWord) return;

    const cleanWord = rawWord.replace(/[-,\s]/g, '');
    const existingIndex = words.findIndex((item) => item.word.toLowerCase() === cleanWord);
    if (existingIndex !== -1) {
      setSelectedWordIndex(existingIndex);
      setNewWordInput('');
      setNewPhonemesInput('');
      setIsAddingWord(false);
      return;
    }

    // Determine phonemes
    let phonemes: string[] = [];
    if (newPhonemesInput.trim()) {
      phonemes = parseWordToPhonemes(newPhonemesInput);
    } else {
      phonemes = parseWordToPhonemes(rawWord);
    }

    const newObj: BlendingWordItem = {
      id: `blending_${sound.id}_${cleanWord}_${Date.now()}`,
      soundId: sound.id,
      word: cleanWord,
      phonemes,
      updatedAt: new Date().toISOString(),
    };

    const updated = [...words, newObj];
    updateWordsList(updated);
    setSelectedWordIndex(updated.length - 1);
    setNewWordInput('');
    setNewPhonemesInput('');
    setIsAddingWord(false);
  };

  // Delete word
  const handleDeleteWord = (index: number) => {
    const wordToDelete = words[index];
    if (confirm(`Bạn có chắc muốn xóa từ "${wordToDelete.word}"?`)) {
      deleteBlendingAudio(sound.id, wordToDelete.word);
      const updated = words.filter((_, i) => i !== index);
      updateWordsList(updated);
      setSelectedWordIndex(Math.max(0, index - 1));
      setActivePhonemeIndex(null);
      setIsBlendingWholeWord(false);
    }
  };



  // Touch single phoneme: highlights it and plays its sound
  const handleTouchPhoneme = (index: number) => {
    if (!activeWord || !activeWord.phonemes[index]) return;
    const ph = activeWord.phonemes[index];
    setActivePhonemeIndex(index);
    setIsBlendingWholeWord(false);
    // Khi chạm từng âm đơn lẻ, không hiện xuộc để tránh gây rối mắt
    speakPhoneme(ph, () => {
      // Keep highlighted for a moment then fade
      setTimeout(() => {
        setActivePhonemeIndex((curr) => (curr === index ? null : curr));
      }, 400);
    }, 1.0);
  };

  // Quy Trình Ghép Vần Chuẩn: Khi bấm vào chữ thì đọc trọn vẹn toàn bộ từng âm, sau đó ghép lại đọc nguyên từ giọng UK nữ, tốc độ đọc 1.0 không có quãng nghỉ.
  const handleRunAutoBlend = () => {
    if (!activeWord) return;

    // Reset bất kỳ timer/audio đang chạy để chạy mới ngay lập tức
    if (autoBlendTimeoutRef.current) {
      window.clearTimeout(autoBlendTimeoutRef.current);
      autoBlendTimeoutRef.current = null;
    }
    stopSpeaking();

    setIsAutoBlending(true);
    setIsBlendingWholeWord(false);
    setIsSlashRevealed(false); // Reset: Trong lúc đọc các âm lẻ, KHÔNG HIỆN XUỘC (không gây rối mắt)
    setAutoBlendStage('slow');

    const phonemes = activeWord.phonemes;
    const totalPhonemes = phonemes.length;

    let idx = 0;

    const playWholeWordNow = () => {
      setAutoBlendStage('ai');
      setActivePhonemeIndex(null);
      setIsBlendingWholeWord(true);
      // ĐÃ ĐỌC HẾT TOÀN BỘ ÂM LẺ -> BÂY GIỜ MỚI HIỆN XUỘC PHÂN TÁCH 2 ÂM TIẾT Ở CUỐI CÙNG
      if (syllableSplit) {
        setIsSlashRevealed(true);
      }

      // Đọc hết âm thì ngay lập tức đọc nguyên từ không có thời gian đợi giữa chừng
      speakWholeWordAi(
        activeWord.word,
        () => {
          // BẮN PHÁO HOA KHI ĐỌC XONG TOÀN BỘ TỪ!
          try {
            confetti({
              particleCount: 90,
              spread: 100,
              origin: { y: 0.6 },
              colors: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
            });
            playBlendSuccessChime();
          } catch (_) {}

          autoBlendTimeoutRef.current = window.setTimeout(() => {
            setIsAutoBlending(false);
            setIsBlendingWholeWord(false);
            setAutoBlendStage('idle');
          }, 1200);
        },
        false, // Chuông và pháo hoa sẽ nổ rực rỡ khi đọc xong toàn bộ từ
        1.0 // Tốc độ đọc 1.0 chuẩn giọng UK nữ
      );
    };

    const playNextPhoneme = () => {
      if (idx < totalPhonemes) {
        setActivePhonemeIndex(idx);
        setIsBlendingWholeWord(false);

        const currentPhoneme = phonemes[idx];

        let advanced = false;
        const advance = () => {
          if (advanced) return;
          advanced = true;
          if (watchdogTimer) {
            window.clearTimeout(watchdogTimer);
          }
          idx++;
          if (idx < totalPhonemes) {
            // Chuyển sang âm tiếp theo ngay lập tức không có quãng nghỉ
            playNextPhoneme();
          } else {
            // ĐÃ KẾT THÚC TOÀN BỘ ÂM LẺ: TỪ HOÀN CHỈNH ĐỌC LIỀN TỨC THÌ (ZERO DELAY)
            playWholeWordNow();
          }
        };

        // Watchdog dự phòng an toàn (1500ms) đề phòng trường hợp trình duyệt bị gián đoạn onend
        const watchdogTimer = window.setTimeout(advance, 1500);

        // Phát trọn vẹn 100% âm thanh của từng âm đơn lẻ.
        // Ngay khi vừa dứt âm (onend), chuyển tức thì (zero delay) sang âm tiếp theo hoặc nguyên từ!
        speakPhoneme(
          currentPhoneme,
          () => {
            advance();
          },
          1.0, // Tốc độ đọc 1.0 chuẩn
          undefined, // Đọc trọn vẹn 100% âm, không cắt xén
          true // skipCancel = true để không ngắt quãng các âm nối tiếp
        );
      } else {
        playWholeWordNow();
      }
    };

    playNextPhoneme();
  };

  // Real-time preview calculation for the new word form
  const previewPhonemes = newWordInput.trim()
    ? parseWordToPhonemes(newPhonemesInput.trim() || newWordInput.trim())
    : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Tiêu đề gọn + Chọn độ tuổi đơn giản */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-secondary-container/20 border border-secondary/30 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold shrink-0">
            <span className="material-symbols-outlined text-lg">join_inner</span>
          </div>
          <h4 className="text-xs sm:text-sm font-black text-on-surface uppercase tracking-wide">
            Luyện Đánh Vần (Blending) – Âm /{sound.sound}/
          </h4>
        </div>

        {/* 3 Nút Chọn Độ Tuổi Đơn Giản */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-surface-container">
          {BLENDING_LEVELS.map((lvl) => {
            const isSelected = lvl.key === selectedLevel;
            return (
              <button
                key={lvl.key}
                type="button"
                onClick={() => handleSelectLevel(lvl.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                }`}
              >
                <span>{lvl.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Word Selector Pills */}
      {words.length > 0 ? (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {words.map((item, idx) => {
            const isSelected = idx === selectedWordIndex;
            const hasAudio = !!getCachedBlendingAudio(sound.id, item.word);

            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedWordIndex(idx);
                  setActivePhonemeIndex(null);
                  setIsBlendingWholeWord(false);
                  setIsSlashRevealed(false);
                  stopSpeaking();
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs border ${
                  isSelected
                    ? 'bg-secondary-container text-on-secondary-container border-secondary ring-2 ring-secondary/30 scale-105'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface border-surface-container'
                }`}
              >
                <span className="text-[10px] opacity-60 font-semibold">{idx + 1}.</span>
                <span>{item.word}</span>
                {hasAudio && (
                  <span
                    className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold"
                    title="Đã có file audio thu âm riêng"
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-surface-container flex flex-col items-center justify-center gap-2 text-center">
          <span className="material-symbols-outlined text-3xl text-primary/60">info</span>
          <h4 className="font-extrabold text-sm text-on-surface">
            {sound.id === 's'
              ? 'Âm /s/ là âm mở đầu (từ ghép vần bắt đầu xuất hiện từ âm /a/ và /t/ tiếp theo)'
              : `Chưa có từ ghép vần cho âm /${sound.sound}/ ở trình độ này`}
          </h4>
        </div>
      )}

      {/* FORM NẠP TỪ MỚI (CÓ PREVIEW NÉT DOT & GẠCH CHÂN) */}
      {isAddingWord && (
        <form
          onSubmit={handleAddNewWord}
          className="p-5 rounded-3xl bg-surface-container border-2 border-primary/30 flex flex-col gap-4 shadow-sm animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
            <span className="text-xs font-black uppercase text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-base">add_circle</span>
              Nạp Từ Mới Vào Luyện Đánh Vần
            </span>
            <button
              type="button"
              onClick={() => setIsAddingWord(false)}
              className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Nhập từ tiếng Anh (ví dụ: sat, rain, ship, boat...)
              </label>
              <input
                type="text"
                value={newWordInput}
                onChange={(e) => setNewWordInput(e.target.value)}
                placeholder="VD: sat hoặc rain..."
                required
                autoFocus
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Tùy chỉnh phân tách âm (tùy chọn, ví dụ: <code>s-a-t</code> hoặc <code>r-ai-n</code>)
              </label>
              <input
                type="text"
                value={newPhonemesInput}
                onChange={(e) => setNewPhonemesInput(e.target.value)}
                placeholder="Để trống để hệ thống tự nhận diện âm đôi!"
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-3.5 py-2.5 text-sm font-bold focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Live Preview of the entered word with dots & digraph underlines */}
          {previewPhonemes.length > 0 && (
            <div className="p-4 bg-surface-container-lowest rounded-2xl border border-surface-container flex flex-col items-center gap-2">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase">
                Hình Ảnh Xem Trước Khi Nạp Vào:
              </span>
              <div className="flex items-end justify-center gap-3 sm:gap-4 py-3 select-none">
                {previewPhonemes.map((ph, idx) => {
                  const isDigraph = ph.length >= 2;
                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <span className="text-4xl sm:text-5xl font-black text-[#2e3440] leading-none">
                        {ph}
                      </span>
                      <div className="h-6 flex items-center justify-center mt-2.5 w-full">
                        {isDigraph ? (
                          <div className="h-2.5 w-full min-w-[36px] bg-[#fcd4dc] rounded-full" />
                        ) : (
                          <div className="w-4 h-4 bg-[#fcd4dc] rounded-full" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingWord(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-high cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-all cursor-pointer shadow-xs"
            >
              Lưu & Bắt Đầu Luyện Ghép Âm
            </button>
          </div>
        </form>
      )}

      {/* GIAO DIỆN HIỂN THỊ TỪ ĐÁNH VẦN TƯƠNG TÁC: CHẠM TÔ SÁNG & KÉO GHÉP ÂM (WORD + DOTS + DIGRAPH UNDERLINE + SLIDER) */}
      {activeWord && (
        <div className="bg-surface-container-low p-5 sm:p-7 rounded-3xl border-2 border-primary/20 flex flex-col items-center gap-6 shadow-sm">
          {/* Top Word Status Bar */}
          <div className="w-full flex items-center justify-between pb-3 border-b border-surface-container">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-on-surface-variant uppercase">
                Từ Đang Luyện:
              </span>
              <span className="text-base font-black text-primary">
                "{activeWord.word}"
              </span>
              {syllableSplit && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-300/40">
                  2 âm tiết ({syllableSplit.syllable1} / {syllableSplit.syllable2})
                </span>
              )}
              {isBlendingWholeWord && (
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 animate-bounce">
                  🎉 Ghép thành công!
                </span>
              )}
            </div>
          </div>

          {/* KHUNG TƯƠNG TÁC: BẤM VÀO CHỮ AUTO ĐỌC (CHỈ GIỮ LẠI CHỮ VÀ DOT) */}
          <div
            onClick={handleRunAutoBlend}
            className={`w-full bg-white rounded-3xl p-5 sm:p-10 md:p-12 border-2 transition-all relative overflow-hidden select-none cursor-pointer transform active:scale-[0.99] flex flex-col items-center justify-center ${
              isBlendingWholeWord
                ? 'border-emerald-500 shadow-2xl ring-4 ring-emerald-300/60 bg-gradient-to-b from-emerald-50/40 via-white to-white'
                : isAutoBlending
                ? 'border-primary shadow-xl ring-4 ring-primary/25 bg-gradient-to-b from-rose-50/30 via-white to-white'
                : 'border-surface-container shadow-xs hover:border-primary/50 hover:shadow-lg'
            }`}
            title="Bấm vào chữ để auto đọc"
          >
            {/* MẶT CHỮ TO RÕ NÉT + FIT 1 DÒNG DUY NHẤT (flex-nowrap) + CHẤM PHONIC DOT + NÉT GẠCH CHÂN ÂM ĐÔI + XUỘC PHÂN TÁCH 2 ÂM TIẾT */}
            <div className="w-full flex items-center justify-center overflow-x-auto py-4 sm:py-6 scrollbar-none px-1">
              <div
                className={`flex items-end justify-center flex-nowrap whitespace-nowrap shrink-0 max-w-full ${sizeConfig.gapClass}`}
                style={{
                  ['--letter-gap' as any]: sizeConfig.gapCss,
                }}
              >
                {activeWord.phonemes.map((ph, idx) => {
                  const isDigraph = ph.length >= 2;
                  const isHighlighted = activePhonemeIndex === idx || isBlendingWholeWord;

                  return (
                    <div
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRunAutoBlend();
                      }}
                      className={`relative flex flex-col items-center cursor-pointer transition-all duration-200 transform shrink-0 ${
                        isHighlighted ? 'scale-105 -translate-y-1' : 'hover:scale-102'
                      }`}
                    >
                      {/* Letter characters - luôn fit 1 dòng */}
                      <span
                        className={`${sizeConfig.textSize} font-black leading-none tracking-normal font-sans transition-colors duration-200 select-none ${
                          isHighlighted
                            ? 'text-[#e11d48] drop-shadow-md'
                            : 'text-[#2e3440]'
                        }`}
                        style={{ letterSpacing: '0.01em' }}
                      >
                        {ph}
                      </span>

                      {/* Dot or Digraph Underline bar */}
                      <div className={`${sizeConfig.dotContainerHeight} flex items-center justify-center ${sizeConfig.dotMarginTop} w-full`}>
                        {isDigraph ? (
                          // NÉT GẠCH CHÂN NỐI 2 MẶT CHỮ CHO ÂM ĐÔI
                          <div
                            className={`${sizeConfig.digraphHeight} ${sizeConfig.digraphMinWidth} w-full rounded-full transition-all duration-200 ${
                              isHighlighted
                                ? 'bg-[#fb7185] ring-4 ring-[#fecdd3] shadow-md scale-105'
                                : 'bg-[#fcd4dc]'
                            }`}
                          />
                        ) : (
                          // CHẤM DOT TRÒN CHO ÂM ĐƠN
                          <div
                            className={`${sizeConfig.dotSize} rounded-full transition-all duration-200 ${
                              isHighlighted
                                ? 'bg-[#fb7185] ring-4 ring-[#fecdd3] shadow-md scale-110'
                                : 'bg-[#fcd4dc]'
                            }`}
                          />
                        )}
                      </div>

                      {/* XUỘC PHÂN TÁCH 2 ÂM TIẾT:
                          - Chỉ hiện ở cuối cùng sau khi đã đọc hết toàn bộ âm lẻ (lúc đọc cả từ)
                          - Xuộc mảnh ở giữa, KHÔNG làm dãn cách các chữ cái trong từ (position absolute không chiếm width)
                          - Nằm chính giữa khoảng cách tự nhiên giữa 2 âm tiết */}
                      {syllableSplit && idx === syllableSplit.splitPhonemeIndex && isSlashRevealed && (
                        <div
                          className="absolute top-0 bottom-0 pointer-events-none select-none z-20 flex flex-col items-center justify-center animate-in fade-in zoom-in-75 duration-200"
                          style={{
                            left: 'calc(100% + var(--letter-gap) / 2)',
                            transform: 'translateX(-50%)',
                          }}
                          title={`Phân tách 2 âm tiết: ${syllableSplit.syllable1} / ${syllableSplit.syllable2}`}
                        >
                          {/* Nét xuộc mảnh thanh lịch, căn giữa chiều cao chữ cái */}
                          <svg
                            className="h-[52%] sm:h-[58%] w-3 overflow-visible pointer-events-none drop-shadow-xs text-amber-500"
                            viewBox="0 0 12 100"
                            fill="none"
                          >
                            <line
                              x1="9"
                              y1="8"
                              x2="3"
                              y2="92"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />
                          </svg>
                          {/* Khoảng trống bù chân để thẳng hàng với hàng dot/underline bên dưới */}
                          <div className={`${sizeConfig.dotContainerHeight} ${sizeConfig.dotMarginTop} shrink-0`} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>



        </div>
      )}
    </div>
  );
}
