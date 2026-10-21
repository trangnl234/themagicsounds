import { useState, useMemo, useRef, useEffect } from 'react';
import {
  DECODABLE_BOOKS_DATA,
  ADVANCE_BOOKS_DATA,
  EXTENDED_BOOKS_DATA,
  DecodableBook,
  DecodableWordToken,
  DecodableBookPage,
  buildStoryLinesFromSentences,
} from '../data/decodableBooksData';
import {
  speakPhoneme,
  speakWholeWordAi,
  speakSentence,
  stopSpeaking,
} from '../utils/audioPlayer';
import { SpeldFlipbookIllustration } from './SpeldFlipbookIllustration';

interface DecodableReadersSectionProps {
  isLoggedIn: boolean;
  hasPurchasedCourse?: boolean;
  onRequireLogin: (groupNumber: number) => void;
  onRewardDiamond: (bookTitle: string) => void;
}

export type ReaderLevelType = 'beginning' | 'advance' | 'extended';

interface StoryPhonemeUnit {
  display: string;
  audioKey: string;
  isDigraph: boolean;
  isSeparator?: boolean;
}

type FullPdfSheetType =
  | { kind: 'cover'; sheetNumber: number; label: string }
  | { kind: 'practice'; sheetNumber: number; label: string }
  | { kind: 'story'; sheetNumber: number; label: string; storyPage: DecodableBookPage };

// Tập hợp các từ Tricky Words chuẩn Jolly Phonics
const JOLLY_TRICKY_WORDS_SET = new Set([
  'a', 'i', 'he', 'she', 'the', 'we', 'me', 'be', 'was', 'to', 'do', 'are', 'all', 'you',
  'your', 'come', 'some', 'said', 'here', 'there', 'they', 'go', 'no', 'so', 'my', 'one',
  'by', 'only', 'old', 'like', 'have', 'live', 'give', 'little', 'down', 'what', 'when', 'why',
  'where', 'who', 'which', 'any', 'many', 'more', 'before', 'other', 'were', 'because', 'want', 'saw',
  'put', 'could', 'should', 'would', 'right', 'two', 'four', 'goes', 'does', 'made', 'their', 'once',
  'upon', 'always', 'also', 'of', 'eight', 'love', 'cover', 'after', 'every', 'mother', 'father', 'brother',
]);

const STORY_SPLIT_DIGRAPH_WORDS = new Set([
  'make', 'made', 'came', 'same', 'name', 'game', 'take', 'bake', 'cake', 'lake',
  'safe', 'gate', 'late', 'plate', 'wave', 'cave', 'save', 'shade', 'grape', 'whale',
  'face', 'race', 'space', 'place', 'page', 'cage', 'stage', 'grace',
  'these', 'complete',
  'like', 'bike', 'time', 'line', 'mine', 'nine', 'fine', 'pine', 'ride', 'hide',
  'side', 'wide', 'kite', 'five', 'white', 'shine', 'smile', 'slide', 'drive', 'inside',
  'mice', 'nice', 'rice', 'slice',
  'home', 'bone', 'cone', 'rope', 'hope', 'hole', 'mole', 'pole', 'note', 'nose', 'rose',
  'stone', 'throne', 'woke', 'spoke', 'drove', 'stove',
  'cute', 'cube', 'tube', 'tune', 'use', 'fuse', 'mule', 'rule', 'flute', 'huge',
]);

const STORY_MULTI_GRAPHEMES = [
  'igh', 'air', 'ear', 'are', 'eer', 'tch', 'dge',
  'sh', 'ch', 'th', 'qu', 'ng', 'ck', 'ph', 'wh',
  'ai', 'ee', 'ie', 'oa', 'ue', 'oo', 'or', 'er', 'ar', 'ou', 'oi',
  'ea', 'ay', 'oy', 'ow', 'ir', 'ur', 'aw', 'au', 'ew',
  'll', 'ff', 'ss', 'zz', 'pp', 'nn', 'tt', 'dd', 'bb', 'gg', 'rr', 'mm',
];

const STORY_END_SILENT_E_DIGRAPHS = ['ce', 'ge', 'se', 'ze', 've', 'le'];

function segmentStoryWordToPhonemes(rawText: string): StoryPhonemeUnit[] {
  const trimmed = rawText.trim();
  if (!trimmed) return [];

  if (trimmed.includes('-')) {
    const parts = trimmed.split('-');
    const combined: StoryPhonemeUnit[] = [];
    parts.forEach((part, idx) => {
      const subUnits = segmentSingleWordPartToPhonemes(part);
      combined.push(...subUnits);
      if (idx < parts.length - 1) {
        combined.push({
          display: '-',
          audioKey: '',
          isDigraph: false,
          isSeparator: true,
        });
      }
    });
    return combined;
  }

  return segmentSingleWordPartToPhonemes(trimmed);
}

function segmentSingleWordPartToPhonemes(rawPart: string): StoryPhonemeUnit[] {
  const possessiveMatch = rawPart.match(/^([a-zA-Z]+)([’']s)$/i);
  if (possessiveMatch) {
    const baseOrig = possessiveMatch[1];
    const suffixOrig = possessiveMatch[2];
    const baseUnits = segmentCleanAlphaWord(baseOrig);
    return [
      ...baseUnits,
      {
        display: suffixOrig,
        audioKey: 's',
        isDigraph: false,
      },
    ];
  }

  const cleanOrig = rawPart.replace(/[^a-zA-Z]/g, '');
  return segmentCleanAlphaWord(cleanOrig);
}

function segmentCleanAlphaWord(cleanOrig: string): StoryPhonemeUnit[] {
  const cleanLower = cleanOrig.toLowerCase();
  if (!cleanLower) return [];

  if (STORY_SPLIT_DIGRAPH_WORDS.has(cleanLower) && cleanLower.length >= 3) {
    const prefixOrig = cleanOrig.slice(0, cleanOrig.length - 3);
    const vowelOrig = cleanOrig[cleanOrig.length - 3];
    const midOrig = cleanOrig[cleanOrig.length - 2];
    const silentEOrig = cleanOrig[cleanOrig.length - 1];

    const prefixUnits = tokenizeStoryPlainSegment(prefixOrig, cleanLower, false);
    const vowelLower = vowelOrig.toLowerCase();
    const midLower = midOrig.toLowerCase();

    const vowelMap: Record<string, string> = {
      a: 'a_e',
      e: 'e_e',
      i: 'i_e',
      o: 'o_e',
      u: 'u_e',
    };
    const vowelAudio = vowelMap[vowelLower] || vowelLower;
    let midAudio = midLower;
    if (midLower === 'c') midAudio = 'soft_c';
    else if (midLower === 'g') midAudio = 'soft_g';
    else if (midLower === 's' && ['these', 'use', 'fuse', 'nose', 'rose'].includes(cleanLower)) {
      midAudio = 'z';
    }

    return [
      ...prefixUnits,
      {
        display: vowelOrig,
        audioKey: vowelAudio,
        isDigraph: false,
      },
      {
        display: `${midOrig}${silentEOrig}`,
        audioKey: midAudio,
        isDigraph: false,
      },
    ];
  }

  return tokenizeStoryPlainSegment(cleanOrig, cleanLower, true);
}

function tokenizeStoryPlainSegment(
  segmentOrig: string,
  fullWordLower: string,
  isAtWordEnd: boolean
): StoryPhonemeUnit[] {
  const units: StoryPhonemeUnit[] = [];
  const segLower = segmentOrig.toLowerCase();
  let i = 0;

  while (i < segmentOrig.length) {
    const rem = segmentOrig.length - i;
    let matchedLen = 0;

    if (rem >= 3) {
      const tri = segLower.slice(i, i + 3);
      if (STORY_MULTI_GRAPHEMES.includes(tri)) {
        matchedLen = 3;
      }
    }
    if (matchedLen === 0 && rem >= 2) {
      const di = segLower.slice(i, i + 2);
      const isEnd = isAtWordEnd && i + 2 === segmentOrig.length;
      if (
        STORY_MULTI_GRAPHEMES.includes(di) ||
        (isEnd && STORY_END_SILENT_E_DIGRAPHS.includes(di))
      ) {
        matchedLen = 2;
      }
    }

    if (matchedLen > 0) {
      const disp = segmentOrig.slice(i, i + matchedLen);
      const low = segLower.slice(i, i + matchedLen);
      let audioKey = low;

      if (['nn', 'll', 'ss', 'ff', 'zz', 'pp', 'tt', 'dd', 'bb', 'gg', 'rr', 'mm'].includes(low)) {
        audioKey = low[0];
      } else if (low === 'ow') {
        const oaWords = new Set([
          'low', 'bow', 'row', 'blow', 'crow', 'flow', 'glow', 'slow', 'snow', 'show', 'grow', 'yellow', 'window', 'rainbow', 'bowl',
        ]);
        audioKey = oaWords.has(fullWordLower) ? 'ow_oa' : 'ow_ou';
      }

      units.push({
        display: disp,
        audioKey,
        isDigraph: true,
      });
      i += matchedLen;
    } else {
      const disp = segmentOrig[i];
      const low = segLower[i];
      const nextLow = segLower[i + 1] || '';
      const isLast = isAtWordEnd && i + 1 === segmentOrig.length;
      let audioKey = low;

      if (low === 'y' && isLast) {
        audioKey = fullWordLower.length <= 3 ? 'y_ie' : 'y_ee';
      } else if (low === 'c' && ['e', 'i', 'y'].includes(nextLow)) {
        audioKey = 'soft_c';
      }

      units.push({
        display: disp,
        audioKey,
        isDigraph: false,
      });
      i += 1;
    }
  }

  return units;
}

export function DecodableReadersSection({
  isLoggedIn,
  hasPurchasedCourse = false,
  onRequireLogin,
  onRewardDiamond,
}: DecodableReadersSectionProps) {
  const [readerLevel, setReaderLevel] = useState<ReaderLevelType>('extended');
  const [selectedGroup, setSelectedGroup] = useState<number>(1);
  const [selectedBookIndex, setSelectedBookIndex] = useState<number>(0);

  // Chỉ số tờ trang PDF đang mở (0 .. totalSheets - 1, mặc định mở tờ 0 = Trang Bìa 1/16)
  const [currentSheetIdx, setCurrentSheetIdx] = useState<number>(0);
  const [flipAnimDirection, setFlipAnimDirection] = useState<'next' | 'prev' | null>(null);

  const [showPhonicsDots, setShowPhonicsDots] = useState<boolean>(true);
  const [highlightTricky, setHighlightTricky] = useState<boolean>(true);

  const [activeBlendState, setActiveBlendState] = useState<{
    wordKey: string;
    activePhonemeIdx: number | null;
    isReadingWholeWord: boolean;
  } | null>(null);

  const blendTimeoutRef = useRef<number | null>(null);
  const blendRunIdRef = useRef<number>(0);

  const [completedBookIds, setCompletedBookIds] = useState<Set<number>>(
    new Set([1, 2, 3, 4, 5, 6])
  );

  useEffect(() => {
    return () => {
      if (blendTimeoutRef.current) {
        window.clearTimeout(blendTimeoutRef.current);
      }
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    blendRunIdRef.current += 1;
    if (blendTimeoutRef.current) {
      window.clearTimeout(blendTimeoutRef.current);
      blendTimeoutRef.current = null;
    }
    setActiveBlendState(null);
    stopSpeaking();
  }, [readerLevel, selectedGroup, selectedBookIndex, currentSheetIdx]);

  // Reset về Trang 1 (Bìa sách) khi đổi sách hoặc đổi nhóm
  useEffect(() => {
    setCurrentSheetIdx(0);
  }, [readerLevel, selectedGroup, selectedBookIndex]);

  const currentDataMap =
    readerLevel === 'beginning'
      ? DECODABLE_BOOKS_DATA
      : readerLevel === 'advance'
      ? ADVANCE_BOOKS_DATA
      : EXTENDED_BOOKS_DATA;

  const availableGroups = useMemo(() => {
    return readerLevel === 'extended' ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7];
  }, [readerLevel]);

  const booksInGroup = useMemo(() => {
    return currentDataMap[selectedGroup] || currentDataMap[1] || [];
  }, [currentDataMap, selectedGroup]);

  const activeBook = booksInGroup[selectedBookIndex] || booksInGroup[0];

  /**
   * Xây dựng danh sách trang lật gọn gàng cho Level Advance:
   * Trang Bìa -> Practice Page -> Trang Truyện 1, 2, 3... cho tới trang truyện cuối
   */
  const fullPdfSheets: FullPdfSheetType[] = useMemo(() => {
    if (!activeBook) return [];

    // Với Level Beginning (1 trang truyện):
    if (readerLevel === 'beginning' || !activeBook.pages || activeBook.pages.length === 0) {
      return [
        {
          kind: 'story',
          sheetNumber: 1,
          label: 'Trang 1',
          storyPage: {
            pageNumber: 1,
            lines: activeBook.lines,
            captionVi: activeBook.captionVi,
          },
        },
      ];
    }

    // Với Level Advance: Trang Bìa -> Practice Page -> Truyện 1..cuối
    const sheets: FullPdfSheetType[] = [];
    let sNum = 1;

    // 1. Trang Bìa (Front Cover)
    sheets.push({ kind: 'cover', sheetNumber: sNum++, label: 'Trang Bìa' });

    // 2. Practice Page (Sounds, Blending Words, Tricky Words)
    sheets.push({ kind: 'practice', sheetNumber: sNum++, label: 'Practice Page' });

    // 3. Các trang truyện 1, 2, 3... cho tới trang cuối
    activeBook.pages.forEach((sp) => {
      sheets.push({
        kind: 'story',
        sheetNumber: sNum++,
        label: `Trang ${sp.pageNumber}`,
        storyPage: sp,
      });
    });

    return sheets;
  }, [activeBook, readerLevel]);

  const activeSheet = fullPdfSheets[currentSheetIdx] || fullPdfSheets[0];

  const completedCountInGroup = booksInGroup.filter((b) =>
    completedBookIds.has(b.id)
  ).length;

  const totalBooksInLevel = useMemo(() => {
    return Object.values(currentDataMap).reduce((sum, list) => sum + list.length, 0);
  }, [currentDataMap]);

  const completedCountInLevel = useMemo(() => {
    return Object.values(currentDataMap)
      .flat()
      .filter((b) => completedBookIds.has(b.id)).length;
  }, [currentDataMap, completedBookIds]);

  const handleSwitchLevel = (level: ReaderLevelType) => {
    if (!hasPurchasedCourse && level !== 'beginning') {
      onRequireLogin(1);
      return;
    }
    setReaderLevel(level);
    setSelectedGroup(1);
    setSelectedBookIndex(0);
  };

  const triggerFlipAnimation = (dir: 'next' | 'prev', nextIdx: number) => {
    setFlipAnimDirection(dir);
    setCurrentSheetIdx(nextIdx);
    window.setTimeout(() => {
      setFlipAnimDirection(null);
    }, 260);
  };

  const handlePrevSheet = () => {
    if (currentSheetIdx > 0) {
      triggerFlipAnimation('prev', currentSheetIdx - 1);
    }
  };

  const handleNextSheet = () => {
    if (currentSheetIdx < fullPdfSheets.length - 1) {
      triggerFlipAnimation('next', currentSheetIdx + 1);
    }
  };

  /**
   * Bấm vào từ:
   * - Nếu là Tricky Word: đọc nguyên từ (whole word) luôn bằng AI.
   * - Nếu là từ thường: đánh vần từng âm (Blending) rồi đọc trơn cả từ.
   */
  const handleWordClickInStory = (
    rawWord: string,
    wordKey: string,
    forceTricky?: boolean
  ) => {
    const cleanWordForSpeech = rawWord.replace(/[^a-zA-Z'-]/g, '');
    const alphaOnly = rawWord.replace(/[^a-zA-Z]/g, '');
    if (!alphaOnly) return;
    const lowerWord = cleanWordForSpeech.toLowerCase();

    blendRunIdRef.current += 1;
    const currentRunId = blendRunIdRef.current;

    if (blendTimeoutRef.current) {
      window.clearTimeout(blendTimeoutRef.current);
      blendTimeoutRef.current = null;
    }
    stopSpeaking();

    const bookTrickyList = activeBook?.practicePage?.trickyWords?.map((w) => w.toLowerCase()) || [];
    const isTrickyWord = Boolean(
      forceTricky ||
        JOLLY_TRICKY_WORDS_SET.has(lowerWord) ||
        bookTrickyList.includes(lowerWord)
    );

    const readWholeWordSmoothly = () => {
      if (blendRunIdRef.current !== currentRunId) return;

      setActiveBlendState({
        wordKey,
        activePhonemeIdx: null,
        isReadingWholeWord: true,
      });

      speakWholeWordAi(
        lowerWord,
        () => {
          if (blendRunIdRef.current !== currentRunId) return;
          blendTimeoutRef.current = window.setTimeout(() => {
            if (blendRunIdRef.current === currentRunId) {
              setActiveBlendState(null);
            }
          }, 600);
        },
        false,
        1.0
      );
    };

    if (isTrickyWord) {
      readWholeWordSmoothly();
      return;
    }

    const units = segmentStoryWordToPhonemes(rawWord);
    const speakableIdxList = units
      .map((u, idx) => (u.isSeparator ? -1 : idx))
      .filter((idx) => idx !== -1);

    if (speakableIdxList.length === 0) {
      readWholeWordSmoothly();
      return;
    }

    let pointer = 0;

    const playNextPhonemeStep = () => {
      if (blendRunIdRef.current !== currentRunId) return;

      if (pointer < speakableIdxList.length) {
        const unitIdx = speakableIdxList[pointer];
        const currentUnit = units[unitIdx];

        setActiveBlendState({
          wordKey,
          activePhonemeIdx: unitIdx,
          isReadingWholeWord: false,
        });

        let advanced = false;
        const advance = () => {
          if (advanced || blendRunIdRef.current !== currentRunId) return;
          advanced = true;
          if (watchdog) {
            window.clearTimeout(watchdog);
          }
          pointer += 1;
          if (pointer < speakableIdxList.length) {
            playNextPhonemeStep();
          } else {
            readWholeWordSmoothly();
          }
        };

        const watchdog = window.setTimeout(advance, 2400);

        speakPhoneme(
          currentUnit.audioKey,
          () => {
            advance();
          },
          1.0,
          undefined,
          true
        );
      } else {
        readWholeWordSmoothly();
      }
    };

    playNextPhonemeStep();
  };

  const isGroupUnlocked = (groupNum: number) => {
    if (hasPurchasedCourse) return true;
    return readerLevel === 'beginning' && groupNum === 1;
  };

  const isBookUnlocked = (groupNum: number, bookIdx: number) => {
    if (hasPurchasedCourse) return true;
    return readerLevel === 'beginning' && groupNum === 1 && bookIdx === 0;
  };

  const handleSelectGroup = (groupNum: number) => {
    if (!isGroupUnlocked(groupNum)) {
      onRequireLogin(groupNum);
      return;
    }
    setSelectedGroup(groupNum);
    setSelectedBookIndex(0);
  };

  const handleToggleBookCompletion = (book: DecodableBook) => {
    setCompletedBookIds((prev) => {
      const next = new Set(prev);
      if (next.has(book.id)) {
        next.delete(book.id);
      } else {
        next.add(book.id);
        onRewardDiamond(book.title);
      }
      return next;
    });
  };

  const handlePrevBook = () => {
    if (selectedBookIndex > 0) {
      setSelectedBookIndex((prev) => prev - 1);
    }
  };

  const handleNextBook = () => {
    if (selectedBookIndex < booksInGroup.length - 1) {
      const nextIdx = selectedBookIndex + 1;
      if (!isBookUnlocked(selectedGroup, nextIdx)) {
        onRequireLogin(selectedGroup);
        return;
      }
      setSelectedBookIndex(nextIdx);
    }
  };

  const handleReadCurrentSheet = () => {
    if (!activeBook || !activeSheet) return;
    blendRunIdRef.current += 1;
    setActiveBlendState(null);

    if (activeSheet.kind === 'story') {
      const text = activeSheet.storyPage.lines.map((l) => l.sentence).join(' ');
      speakSentence(text, activeBook.title);
    } else if (activeSheet.kind === 'cover') {
      speakSentence(activeBook.title, activeBook.title);
    } else if (activeSheet.kind === 'practice' && activeBook.practicePage) {
      speakSentence(activeBook.practicePage.blendingWords.join(', '), activeBook.title);
    } else {
      const fullText = activeBook.lines.map((l) => l.sentence).join(' ');
      speakSentence(fullText, activeBook.title);
    }
  };

  const isCurrentBookCompleted = activeBook ? completedBookIds.has(activeBook.id) : false;

  /**
   * Render 1 từ có chấm âm (Phonics Dots) và đánh dấu Tricky Word
   */
  const renderInteractiveWordToken = (
    text: string,
    wordKey: string,
    options?: {
      isTricky?: boolean;
      leadingPunct?: string;
      trailingPunct?: string;
      sizeClass?: string;
      lightTheme?: boolean;
    }
  ) => {
    const isThisWordActive = activeBlendState?.wordKey === wordKey;
    const isReadingWhole = isThisWordActive && activeBlendState?.isReadingWholeWord;
    const activePhonemeIdx = isThisWordActive ? activeBlendState?.activePhonemeIdx : null;

    const cleanLower = text.replace(/[^a-zA-Z]/g, '').toLowerCase();
    const bookTrickyList = activeBook?.practicePage?.trickyWords?.map((w) => w.toLowerCase()) || [];
    const isTrickyWord =
      options?.isTricky ||
      JOLLY_TRICKY_WORDS_SET.has(cleanLower) ||
      bookTrickyList.includes(cleanLower);

    const fontSizeClass = options?.sizeClass || 'text-2xl sm:text-3xl lg:text-4xl';

    if (isTrickyWord) {
      return (
        <span
          key={wordKey}
          onClick={(e) => {
            e.stopPropagation();
            handleWordClickInStory(text, wordKey, true);
          }}
          className={`tricky-word inline-flex flex-col items-center cursor-pointer px-2.5 py-1 rounded-xl transition-all select-none ${
            isReadingWhole
              ? 'bg-purple-600 text-white scale-110 font-black ring-2 ring-purple-300 shadow-sm'
              : highlightTricky
              ? 'bg-purple-100 text-purple-800 border border-purple-300 hover:bg-purple-200 font-bold'
              : options?.lightTheme
              ? 'text-white hover:bg-white/15 font-bold'
              : 'text-on-surface hover:bg-surface-container-high/60 font-bold'
          }`}
          title={`Tricky Word — Bấm để nghe AI đọc nguyên từ "${text}"`}
        >
          <span className={`${fontSizeClass} leading-none`}>
            {options?.leadingPunct || ''}
            {text}
            {options?.trailingPunct || ''}
          </span>
          {showPhonicsDots && highlightTricky && (
            <span
              className={`mt-1.5 text-[9px] font-extrabold uppercase tracking-wider px-1.5 rounded-full leading-tight ${
                isReadingWhole ? 'bg-white/25 text-white' : 'bg-purple-600 text-white'
              }`}
            >
              tricky
            </span>
          )}
        </span>
      );
    }

    const phonemeUnits = segmentStoryWordToPhonemes(text);

    return (
      <span
        key={wordKey}
        onClick={(e) => {
          e.stopPropagation();
          handleWordClickInStory(text, wordKey, false);
        }}
        className={`decodable-word inline-flex items-baseline cursor-pointer px-2 py-1 rounded-xl transition-all select-none ${
          isReadingWhole
            ? 'bg-emerald-100/95 ring-2 ring-emerald-400 scale-110 shadow-xs'
            : isThisWordActive
            ? 'bg-rose-50/95 ring-2 ring-rose-300'
            : options?.lightTheme
            ? 'hover:bg-white/15'
            : 'hover:bg-surface-container-high/70'
        }`}
        title={`Bấm để nghe đọc mẫu Blending: "${text}"`}
      >
        {options?.leadingPunct && (
          <span
            className={`${fontSizeClass} font-bold leading-none mr-0.5 ${
              options?.lightTheme ? 'text-white/80' : 'text-on-surface-variant'
            }`}
          >
            {options.leadingPunct}
          </span>
        )}
        {phonemeUnits.map((unit, uIdx) => {
          if (unit.isSeparator) {
            return (
              <span
                key={uIdx}
                className={`${fontSizeClass} font-bold leading-none mx-0.5 ${
                  options?.lightTheme ? 'text-white/80' : 'text-on-surface-variant'
                }`}
              >
                {unit.display}
              </span>
            );
          }

          const isPhonemeHighlighted = activePhonemeIdx === uIdx || isReadingWhole;

          return (
            <span
              key={uIdx}
              className={`flex flex-col items-center transition-transform duration-150 ${
                activePhonemeIdx === uIdx ? 'scale-120 -translate-y-1' : ''
              }`}
            >
              <span
                className={`${fontSizeClass} font-bold leading-none transition-colors ${
                  isReadingWhole
                    ? 'text-emerald-700'
                    : isPhonemeHighlighted
                    ? 'text-[#e11d48]'
                    : options?.lightTheme
                    ? 'text-white'
                    : 'text-on-surface'
                }`}
              >
                {unit.display}
              </span>
              {showPhonicsDots && (
                <span
                  className={`mt-1.5 transition-all duration-150 rounded-full ${
                    unit.isDigraph ? 'w-5 h-2' : 'w-2.5 h-2.5'
                  } ${
                    isReadingWhole
                      ? 'bg-emerald-500 scale-125'
                      : activePhonemeIdx === uIdx
                      ? 'bg-[#e11d48] scale-150 ring-2 ring-rose-200'
                      : options?.lightTheme
                      ? 'bg-amber-300'
                      : 'bg-[#d97706]'
                  }`}
                />
              )}
            </span>
          );
        })}
        {options?.trailingPunct && (
          <span
            className={`${fontSizeClass} font-bold leading-none ml-0.5 ${
              options?.lightTheme ? 'text-white' : ''
            }`}
          >
            {options.trailingPunct}
          </span>
        )}
      </span>
    );
  };

  const titleLines = useMemo(() => {
    if (!activeBook) return [];
    return buildStoryLinesFromSentences(
      [activeBook.title],
      activeBook.practicePage?.trickyWords || []
    );
  }, [activeBook]);

  return (
    <section className="w-full py-5 bg-surface-container-low rounded-3xl px-4 sm:px-6 border border-surface-container" id="truyen-decodable">
      <div className="w-full flex flex-col gap-5">
        {/* 1. TIÊU ĐỀ GỌN + CHUYỂN ĐỔI 2 CẤP ĐỘ: LEVEL BEGINNING & LEVEL ADVANCE */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div>
              <h2 className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e13829] text-white font-black text-base sm:text-lg shadow-[0_3px_0_#991b1b]">
                <span className="material-symbols-outlined text-lg">
                  menu_book
                </span>
                <span>Decodable Readers: Truyện đọc đánh vần</span>
              </h2>
            </div>

            {/* Nút chuyển đổi 3 mục: Đoạn văn - Truyện đọc - Truyện mở rộng */}
            <div className="inline-flex flex-wrap items-center p-1 rounded-2xl bg-surface-container-lowest border-2 border-primary/20 shadow-xs shrink-0 self-start sm:self-auto gap-1">
              <button
                onClick={() => handleSwitchLevel('beginning')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  readerLevel === 'beginning'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-base">menu_book</span>
                <span>Đoạn văn</span>
              </button>

              <button
                onClick={() => handleSwitchLevel('advance')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  readerLevel === 'advance'
                    ? 'bg-gradient-to-r from-[#c2410c] to-[#ea580c] text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {!hasPurchasedCourse && (
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                )}
                <span className="material-symbols-outlined text-base">auto_stories</span>
                <span>Truyện đọc</span>
              </button>

              <button
                onClick={() => handleSwitchLevel('extended')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  readerLevel === 'extended'
                    ? 'bg-gradient-to-r from-[#7c3aed] to-[#9333ea] text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {!hasPurchasedCourse && (
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                )}
                <span className="material-symbols-outlined text-base">library_books</span>
                <span>Truyện mở rộng</span>
              </button>
            </div>
          </div>

          {/* Chọn Nhóm 1 -> 7 (hoặc Set 1 -> 5 với Truyện mở rộng) */}
          <div className="flex items-center gap-1.5 bg-surface-container-lowest p-1.5 rounded-2xl border border-surface-container shadow-2xs overflow-x-auto">
            {availableGroups.map((g) => {
              const isActive = selectedGroup === g;
              const unlocked = isGroupUnlocked(g);
              return (
                <button
                  key={g}
                  onClick={() => handleSelectGroup(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                    isActive
                      ? readerLevel === 'advance'
                        ? 'bg-[#c2410c] text-white shadow-xs'
                        : readerLevel === 'extended'
                        ? 'bg-[#7c3aed] text-white shadow-xs'
                        : 'bg-primary text-on-primary shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {!unlocked && (
                    <span className="material-symbols-outlined text-[13px]">
                      lock
                    </span>
                  )}
                  <span>{readerLevel === 'extended' ? `Set ${g}` : `Nhóm ${g}`}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. KHUNG SÁCH LẬT ĐẦY ĐỦ TẤT CẢ CÁC TRANG */}
        <div
          className={`bg-surface-container-lowest rounded-3xl p-5 sm:p-7 shadow-lg border-2 flex flex-col gap-5 ${
            readerLevel === 'advance'
              ? 'border-[#ea580c]/30'
              : readerLevel === 'extended'
              ? 'border-purple-500/30'
              : 'border-primary/15'
          }`}
        >
          {/* Thanh chọn 5 truyện trong nhóm + Công cụ đọc */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-surface-container">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              {booksInGroup.map((book, idx) => {
                const isCurrent = idx === selectedBookIndex;
                const isDone = completedBookIds.has(book.id);
                const bookUnlocked = isBookUnlocked(selectedGroup, idx);
                return (
                  <button
                    key={book.id}
                    onClick={() => {
                      if (!bookUnlocked) {
                        onRequireLogin(selectedGroup);
                        return;
                      }
                      setSelectedBookIndex(idx);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${
                      isCurrent
                        ? readerLevel === 'advance'
                          ? 'bg-[#c2410c] text-white border-[#c2410c] shadow-sm scale-105'
                          : readerLevel === 'extended'
                          ? 'bg-[#7c3aed] text-white border-[#7c3aed] shadow-sm scale-105'
                          : 'bg-primary text-on-primary border-primary shadow-sm scale-105'
                        : isDone
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high border-transparent'
                    }`}
                  >
                    {!bookUnlocked && (
                      <span className="material-symbols-outlined text-[13px]">
                        lock
                      </span>
                    )}
                    <span>
                      {book.bookNumber}. {book.title}
                    </span>
                    {book.stars && (
                      <span className="text-[10px] opacity-90">
                        {'★'.repeat(book.stars)}
                      </span>
                    )}
                    {isDone && (
                      <span
                        className={`material-symbols-outlined text-[14px] ${
                          isCurrent ? 'text-white' : 'text-emerald-600'
                        }`}
                      >
                        check_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Nút công cụ: Dot từng từ, Tricky Words, Đọc mẫu, Đánh dấu đã đọc */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setShowPhonicsDots((prev) => !prev)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  showPhonicsDots
                    ? 'bg-amber-500/15 text-amber-800 ring-1 ring-amber-500/40'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-sm">radio_button_checked</span>
                <span>Dot từng từ</span>
              </button>

              <button
                onClick={() => setHighlightTricky((prev) => !prev)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  highlightTricky
                    ? 'bg-purple-100 text-purple-800 ring-1 ring-purple-300'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                <span>Tricky Words</span>
              </button>

              <button
                onClick={handleReadCurrentSheet}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-on-secondary text-xs font-extrabold transition-all cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-sm">volume_up</span>
                <span>Đọc mẫu</span>
              </button>

              {activeBook && (
                <button
                  onClick={() => handleToggleBookCompletion(activeBook)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    isCurrentBookCompleted
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-surface-container-high text-on-surface hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {isCurrentBookCompleted ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span>{isCurrentBookCompleted ? 'Đã đọc' : 'Hoàn thành'}</span>
                </button>
              )}
            </div>
          </div>

          {/* HIỂN THỊ CUỐN TRUYỆN + 2 NÚT MŨI TÊN LẬT TRANG CŨ / TRANG MỚI */}
          <div className="relative flex items-center gap-2 sm:gap-4">
            {/* Nút mũi tên hướng sang trang cũ (bên trái) */}
            <button
              onClick={
                fullPdfSheets.length > 1 ? handlePrevSheet : handlePrevBook
              }
              disabled={
                fullPdfSheets.length > 1
                  ? currentSheetIdx === 0
                  : selectedBookIndex === 0
              }
              aria-label="Lật về trang cũ"
              title="Lật về trang cũ"
              className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shrink-0 transition-all shadow-md border-2 ${
                (fullPdfSheets.length > 1
                  ? currentSheetIdx === 0
                  : selectedBookIndex === 0)
                  ? 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed opacity-50'
                  : 'bg-white hover:bg-[#c2410c] text-stone-800 hover:text-white border-stone-300 hover:border-[#c2410c] cursor-pointer hover:scale-105 active:scale-95'
              }`}
            >
              <span className="material-symbols-outlined text-2xl sm:text-3xl font-bold">
                arrow_back
              </span>
            </button>

            {/* Khung cuốn truyện ở giữa */}
            <div
              className={`flex-1 min-w-0 transition-all duration-300 ${
                flipAnimDirection === 'next'
                  ? 'translate-x-1 opacity-90'
                  : flipAnimDirection === 'prev'
                  ? '-translate-x-1 opacity-90'
                  : ''
              }`}
            >
              {/* ================= 1. TRANG BÌA (FRONT COVER) ================= */}
              {activeSheet?.kind === 'cover' && activeBook && (
                <div className="rounded-3xl overflow-hidden border-2 border-stone-300 shadow-xl bg-[#c2632b] flex flex-col">
                  {/* Thanh cam trên cùng: Sao ★ & SET */}
                  <div className="px-6 py-3 bg-[#c2632b] text-white flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xl tracking-widest">
                      {'★'.repeat(activeBook.stars || 1)}
                    </div>
                    <span className="text-base sm:text-lg font-black tracking-wide">
                      SET {activeBook.group}
                    </span>
                  </div>

                  {/* Khung tranh bìa lớn + Tên sách có Dot từng từ */}
                  <div className="relative bg-stone-800 grid grid-cols-1 md:grid-cols-12 items-center">
                    <div className="md:col-span-6 aspect-4/3 w-full overflow-hidden">
                      {activeBook.flipbookId ? (
                        <SpeldFlipbookIllustration
                          bookId={activeBook.flipbookId}
                          pageNumber={1}
                          fallbackImg={activeBook.illustration}
                          alt={activeBook.title}
                        />
                      ) : (
                        <img
                          src={activeBook.illustration}
                          alt={activeBook.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    <div className="md:col-span-6 p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-4 bg-gradient-to-b from-stone-900/75 to-stone-900/95 h-full">
                      <div className="flex flex-wrap items-center justify-center gap-3 py-2">
                        {titleLines[0]?.tokens.map((tok, idx) =>
                          renderInteractiveWordToken(tok.text, `cover_title_${idx}`, {
                            isTricky: tok.type === 'tricky',
                            leadingPunct: tok.leadingPunct,
                            trailingPunct: tok.trailingPunct,
                            sizeClass: 'text-4xl sm:text-5xl lg:text-6xl',
                            lightTheme: true,
                          })
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-stone-200 font-medium">
                        {activeBook.author || 'SPELD SA Phonic Book Series'}
                      </p>
                    </div>
                  </div>

                  {/* Dải họa tiết dưới đáy bìa SPELD SA */}
                  <div className="bg-[#1c130e] px-6 py-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-[#ea580c] border-dashed flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-[#ea580c]" />
                      </div>
                      <div className="w-6 h-6 rounded-full border-2 border-amber-500 border-dotted" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-black tracking-wide">SPELD SA</div>
                      <div className="text-[11px] text-stone-300 font-semibold">
                        Phonic Book Series
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= 2. PRACTICE PAGE (KHÔNG CÓ VOCAB) ================= */}
              {activeSheet?.kind === 'practice' && activeBook?.practicePage && (
                <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-stone-200 shadow-md flex flex-col gap-6">
                  <div className="border-b border-stone-300 border-dotted pb-3">
                    <h3 className="text-2xl sm:text-3xl font-black text-stone-900">
                      Practice page
                    </h3>
                  </div>

                  {/* Practise the sounds */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-sm sm:text-base font-bold text-stone-800">
                      Practise the sounds
                    </h4>
                    <div className="flex flex-wrap gap-3 sm:gap-4 py-1">
                      {activeBook.practicePage.sounds.map((snd) => {
                        const slashMatch = snd.match(/\/([^/]+)\//);
                        const audioSoundKey = slashMatch ? slashMatch[1].trim() : snd.trim();
                        const isAltLabel = snd.includes('/');
                        return (
                          <button
                            key={snd}
                            onClick={() => speakPhoneme(audioSoundKey)}
                            className={`${
                              isAltLabel
                                ? 'px-4 py-2 min-w-[92px] text-xl sm:text-2xl bg-[#7bd3f7]/45 border-sky-300'
                                : 'w-14 h-14 sm:w-16 sm:h-16 text-3xl sm:text-4xl bg-stone-50 border-stone-300'
                            } rounded-2xl border-2 hover:border-[#c2410c] hover:bg-amber-50 hover:scale-105 transition-all font-bold text-stone-900 shadow-2xs cursor-pointer flex items-center justify-center`}
                            title={`Nghe âm /${audioSoundKey}/`}
                          >
                            {snd}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Practise blending sounds */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-sm sm:text-base font-bold text-stone-800">
                      Practise blending sounds
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                      {activeBook.practicePage.blendingWords.map((word, wIdx) => (
                        <div
                          key={wIdx}
                          className="bg-[#d8effc] rounded-xl p-4 flex items-center justify-center border border-sky-200 min-h-[84px]"
                        >
                          {renderInteractiveWordToken(word, `sheet_prac_blend_${wIdx}`, {
                            isTricky: false,
                            sizeClass: 'text-3xl sm:text-4xl',
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Practise high frequency words */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-sm sm:text-base font-bold text-stone-800">
                      Practise high frequency words
                    </h4>
                    {activeBook.practicePage.trickyWords.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                        {activeBook.practicePage.trickyWords.map((tw, tIdx) => (
                          <div
                            key={tIdx}
                            className="bg-[#d8effc] rounded-xl p-4 flex items-center justify-center border border-sky-200 min-h-[84px]"
                          >
                            {renderInteractiveWordToken(tw, `sheet_prac_tricky_${tIdx}`, {
                              isTricky: true,
                              sizeClass: 'text-3xl sm:text-4xl',
                            })}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-stone-500 italic">
                        (Không có từ bất quy tắc trong cuốn này)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ================= 3. CÁC TRANG TRUYỆN (STORY PAGES - KHÔNG DỊCH, KHÔNG HIỆN SỐ TRANG) ================= */}
              {activeSheet?.kind === 'story' && activeBook && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center bg-[#fffdf9] rounded-3xl p-5 sm:p-8 border-2 border-[#e7e5e4] shadow-inner relative">
                  {/* Đường gáy sách ở giữa */}
                  <div className="hidden md:block absolute top-3 bottom-3 left-[45.8%] w-[2px] bg-gradient-to-b from-stone-200 via-stone-300 to-stone-200 pointer-events-none" />

                  {/* TRANG TRÁI: TRANH MINH HỌA */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center">
                    <div className="w-full aspect-4/3 rounded-2xl overflow-hidden shadow-md relative bg-surface-container-high border-2 border-stone-200">
                      {activeBook.flipbookId ? (
                        <SpeldFlipbookIllustration
                          bookId={activeBook.flipbookId}
                          pageNumber={activeSheet.storyPage.pageNumber}
                          fallbackImg={activeBook.illustration}
                          alt={activeBook.title}
                        />
                      ) : (
                        <img
                          src={activeBook.illustration}
                          alt={activeBook.illustrationAlt}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                  </div>

                  {/* TRANG PHẢI: HỘP NỀN XANH NHẠT + CHỮ CÓ DOT & TRICKY WORD */}
                  <div className="md:col-span-7 flex flex-col justify-center min-h-[250px] bg-[#d8effc] rounded-2xl p-6 sm:p-10 border border-sky-200 relative">
                    <div className="flex flex-col justify-center gap-6 my-auto">
                      {activeSheet.storyPage.lines.map((line, lIdx) => (
                        <div
                          key={lIdx}
                          className="story-line-row flex items-baseline flex-wrap gap-x-4 gap-y-4 leading-relaxed"
                        >
                          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-4">
                            {line.tokens.map((token: DecodableWordToken, tIdx: number) => {
                              const wordKey = `story_p${activeSheet.storyPage.pageNumber}_l${lIdx}_t${tIdx}`;
                              return renderInteractiveWordToken(token.text, wordKey, {
                                isTricky: token.type === 'tricky',
                                leadingPunct: token.leadingPunct,
                                trailingPunct: token.trailingPunct,
                                sizeClass: 'text-3xl sm:text-4xl lg:text-5xl',
                              });
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Nút mũi tên hướng sang trang mới (bên phải) */}
            <button
              onClick={
                fullPdfSheets.length > 1 ? handleNextSheet : handleNextBook
              }
              disabled={
                fullPdfSheets.length > 1
                  ? currentSheetIdx >= fullPdfSheets.length - 1
                  : selectedBookIndex >= booksInGroup.length - 1
              }
              aria-label="Lật sang trang mới"
              title="Lật sang trang mới"
              className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shrink-0 transition-all shadow-md border-2 ${
                (fullPdfSheets.length > 1
                  ? currentSheetIdx >= fullPdfSheets.length - 1
                  : selectedBookIndex >= booksInGroup.length - 1)
                  ? 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed opacity-50'
                  : 'bg-[#c2410c] hover:bg-[#9a3412] text-white border-[#c2410c] cursor-pointer hover:scale-105 active:scale-95'
              }`}
            >
              <span className="material-symbols-outlined text-2xl sm:text-3xl font-bold">
                arrow_forward
              </span>
            </button>
          </div>
        </div>

        {/* 3. PHẦN THEO DÕI SỐ LƯỢNG TRUYỆN ĐÃ ĐỌC (NẰM DƯỚI CÙNG & GỌN GÀNG) */}
        <div className="bg-surface-container-lowest px-5 py-3.5 rounded-2xl border border-surface-container shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">library_books</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-extrabold text-on-surface">
                  Theo dõi truyện đã đọc (
                  {readerLevel === 'extended' ? `Set ${selectedGroup}` : `Nhóm ${selectedGroup}`} •{' '}
                  {readerLevel === 'advance'
                    ? 'Truyện đọc'
                    : readerLevel === 'extended'
                    ? 'Truyện mở rộng'
                    : 'Đoạn văn'}
                  ):
                </span>
                <span className="text-xs sm:text-sm font-black text-emerald-600">
                  {completedCountInGroup} / {booksInGroup.length} truyện
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Tổng toàn cấp độ:{' '}
                <strong>
                  {completedCountInLevel} / {totalBooksInLevel} truyện
                </strong>{' '}
                đã hoàn thành
              </p>
            </div>
          </div>

          {/* Thanh tiến độ gọn + các ô số nhanh */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1">
              {booksInGroup.map((b, idx) => {
                const isDone = completedBookIds.has(b.id);
                const isCurrent = idx === selectedBookIndex;
                const bookUnlocked = isBookUnlocked(selectedGroup, idx);
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      if (!bookUnlocked) {
                        onRequireLogin(selectedGroup);
                        return;
                      }
                      setSelectedBookIndex(idx);
                    }}
                    className={`w-7 h-7 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer flex items-center justify-center ${
                      isDone
                        ? 'bg-emerald-500 text-white shadow-2xs'
                        : isCurrent
                        ? 'bg-primary/15 text-primary ring-1 ring-primary'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                    title={`Truyện ${b.bookNumber}: ${b.title} (${isDone ? 'Đã đọc' : 'Chưa đọc'})`}
                  >
                    {bookUnlocked ? (
                      b.bookNumber
                    ) : (
                      <span className="material-symbols-outlined text-[12px]">
                        lock
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="hidden md:flex items-center gap-2 w-28">
              <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.round(
                      (completedCountInGroup / (booksInGroup.length || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
