import React, { useState, useRef, useEffect } from 'react';
import { speakSentence, stopSpeaking } from '../utils/audioPlayer';
import {
  COMMON_SENTENCES_80,
  COMMON_SENTENCE_CATEGORIES,
  SHORT_SPEECH_A1_LESSONS,
} from '../data/soundToSpeechData';

interface IpaDecodeItem {
  id: string;
  ipa: string;
  graphemes: string;
  word: string;
  syllables: string;
  meaning: string;
  category: 'vowel' | 'diphthong' | 'consonant';
  isDemo?: boolean;
}

const SOUND_CODE_ITEMS: IpaDecodeItem[] = [
  {
    id: 'sc-1',
    ipa: '/iː/',
    graphemes: 'ee, ea, e_e',
    word: 'achievement',
    syllables: 'a · chieve · ment',
    meaning: 'thành tựu',
    category: 'vowel',
    isDemo: true,
  },
  {
    id: 'sc-2',
    ipa: '/ɪ/',
    graphemes: 'i, y',
    word: 'system',
    syllables: 'sys · tem',
    meaning: 'hệ thống',
    category: 'vowel',
  },
  {
    id: 'sc-3',
    ipa: '/æ/',
    graphemes: 'a',
    word: 'understand',
    syllables: 'un · der · stand',
    meaning: 'hiểu rõ',
    category: 'vowel',
  },
  {
    id: 'sc-4',
    ipa: '/ɑː/',
    graphemes: 'ar, a',
    word: 'department',
    syllables: 'de · part · ment',
    meaning: 'phòng ban',
    category: 'vowel',
  },
  {
    id: 'sc-5',
    ipa: '/ɔː/',
    graphemes: 'or, aw, au',
    word: 'important',
    syllables: 'im · por · tant',
    meaning: 'quan trọng',
    category: 'vowel',
  },
  {
    id: 'sc-6',
    ipa: '/ɜː/',
    graphemes: 'er, ir, ur',
    word: 'university',
    syllables: 'u · ni · ver · si · ty',
    meaning: 'đại học',
    category: 'vowel',
  },
  {
    id: 'sc-7',
    ipa: '/eɪ/',
    graphemes: 'a_e, ai, ay',
    word: 'communication',
    syllables: 'com · mu · ni · ca · tion',
    meaning: 'giao tiếp',
    category: 'diphthong',
  },
  {
    id: 'sc-8',
    ipa: '/aɪ/',
    graphemes: 'i_e, igh, y',
    word: 'environment',
    syllables: 'en · vi · ron · ment',
    meaning: 'môi trường',
    category: 'diphthong',
  },
  {
    id: 'sc-9',
    ipa: '/əʊ/',
    graphemes: 'oa, ow, o_e',
    word: 'focus',
    syllables: 'fo · cus',
    meaning: 'tập trung',
    category: 'diphthong',
  },
  {
    id: 'sc-10',
    ipa: '/ʃ/',
    graphemes: 'sh, ti, ci',
    word: 'information',
    syllables: 'in · for · ma · tion',
    meaning: 'thông tin',
    category: 'consonant',
  },
  {
    id: 'sc-11',
    ipa: '/tʃ/',
    graphemes: 'ch, tch, tu',
    word: 'natural',
    syllables: 'na · tu · ral',
    meaning: 'tự nhiên',
    category: 'consonant',
  },
  {
    id: 'sc-12',
    ipa: '/θ/',
    graphemes: 'th',
    word: 'method',
    syllables: 'me · thod',
    meaning: 'phương pháp',
    category: 'consonant',
  },
];

interface SoundCodeWorkspaceProps {
  hasPurchasedCourse?: boolean;
  onRequirePurchase?: () => void;
  onStudyLesson?: (ipaSymbol: string, label: string) => void;
}

export function SoundCodeWorkspace({
  hasPurchasedCourse = false,
  onRequirePurchase,
  onStudyLesson,
}: SoundCodeWorkspaceProps = {}) {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'vowel' | 'diphthong' | 'consonant'
  >('all');

  const filtered =
    selectedCategory === 'all'
      ? SOUND_CODE_ITEMS
      : SOUND_CODE_ITEMS.filter((item) => item.category === selectedCategory);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <h3 className="text-base sm:text-lg font-black text-slate-900">
          Bảng Giải Mã Âm IPA & Tách Ghép Vần Từ Đa Âm Tiết
        </h3>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'vowel', label: 'Nguyên âm đơn' },
            { id: 'diphthong', label: 'Nguyên âm đôi' },
            { id: 'consonant', label: 'Phụ âm' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setSelectedCategory(
                  tab.id as 'all' | 'vowel' | 'diphthong' | 'consonant'
                )
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {filtered.map((item) => {
          const isUnlocked = hasPurchasedCourse || !!item.isDemo;
          const handleCardClick = () => {
            if (isUnlocked) {
              speakSentence(item.word, 0.85);
              onStudyLesson?.(
                item.ipa,
                `Sound Code: Âm ${item.ipa} (${item.word})`
              );
            } else {
              onRequirePurchase?.();
            }
          };

          return (
            <div
              key={item.id}
              onClick={handleCardClick}
              className="group bg-slate-50/70 hover:bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-slate-900/40 transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-2xs hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-indigo-700 tracking-tight">
                      {item.ipa}
                    </span>
                    {item.isDemo && (
                      <span className="text-[10px] font-black uppercase text-emerald-700">
                        • DEMO
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">
                    Mặt chữ: <span className="text-slate-800">{item.graphemes}</span>
                  </p>
                </div>

                <span className="w-8 h-8 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-700 group-hover:text-white flex items-center justify-center transition-colors">
                  <span className="material-symbols-outlined text-lg">
                    {isUnlocked ? 'volume_up' : 'lock'}
                  </span>
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                <div>
                  <div className="text-base font-black text-slate-900">
                    {item.word}
                  </div>
                  <div className="text-xs font-bold text-indigo-600 mt-0.5">
                    {item.syllables} •{' '}
                    <span className="font-medium text-slate-600">{item.meaning}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-200/80 group-hover:bg-slate-900 text-slate-900 group-hover:text-white text-xs font-extrabold flex items-center gap-1 transition-colors shrink-0 cursor-pointer whitespace-nowrap"
                >
                  {!isUnlocked && (
                    <span className="material-symbols-outlined text-[14px]">
                      lock
                    </span>
                  )}
                  <span>Học âm</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface DictationEvaluationRecord {
  lineId: string;
  dayNumber: number;
  sentenceNumber: number;
  userInput: string;
  matchedCount: number;
  totalWords: number;
  accuracyPercent: number;
  earnedPoints: number;
  gradeLabel: string;
  savedAt: number;
}

interface SoundToSpeechWorkspaceProps {
  isLoggedIn?: boolean;
  currentUserEmail?: string;
  currentUsername?: string;
  diamonds?: number;
  onRequireRegister?: () => void;
  onStudyLesson?: (chunkId: string, label: string) => void;
  onRewardDictationPoints?: (params: {
    pointsAdded: number;
    lineId: string;
    label: string;
  }) => void;
}

function normalizeDictationText(str: string): string {
  return str
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9'\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STORAGE_KEY_MIMIC_DICTATIONS = 'phonics_mimic_30days_dictations_v1';

export function SoundToSpeechWorkspace({
  isLoggedIn = false,
  currentUserEmail = '',
  currentUsername = '',
  diamonds = 60,
  onRequireRegister,
  onStudyLesson,
  onRewardDictationPoints,
}: SoundToSpeechWorkspaceProps = {}) {
  // Phần 1: 80 Câu giao tiếp hàng ngày (nguyên bản)
  const [isSection1Open, setIsSection1Open] = useState<boolean>(true);
  const [selectedSentenceCategory, setSelectedSentenceCategory] =
    useState<string>('Tất cả');
  const [activeSentenceIdx, setActiveSentenceIdx] = useState<number>(0);

  // Phần 2: 300 Cụm Mimic • 30 Chủ đề
  const [isSection2Open, setIsSection2Open] = useState<boolean>(true);
  const [expandedSpeechIds, setExpandedSpeechIds] = useState<
    Record<string, boolean>
  >({
    [SHORT_SPEECH_A1_LESSONS[0]?.id || 'mimic-day-01']: true,
  });

  // Câu đang chọn trong từng Ngày (mỗi chủ đề 10 câu)
  const [speechLineIndices, setSpeechLineIndices] = useState<
    Record<string, number>
  >({});

  // Trạng thái hiện chữ (MIỄN PHÍ 100%, không cần đăng nhập tài khoản)
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  // Nội dung học viên đang gõ chép chính tả cho từng câu
  const [dictationInputs, setDictationInputs] = useState<
    Record<string, string>
  >({});

  // Kết quả chấm điểm & tích điểm đã lưu cho từng câu theo tài khoản
  const userStorageKey = `${STORAGE_KEY_MIMIC_DICTATIONS}_${
    (currentUserEmail || currentUsername || 'guest').toLowerCase()
  }`;

  const [savedEvaluations, setSavedEvaluations] = useState<
    Record<string, DictationEvaluationRecord>
  >({});

  useEffect(() => {
    if (!isLoggedIn) {
      setSavedEvaluations({});
      return;
    }
    try {
      const raw = localStorage.getItem(userStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setSavedEvaluations(parsed);
          const restoredInputs: Record<string, string> = {};
          for (const [lineId, rec] of Object.entries(
            parsed as Record<string, DictationEvaluationRecord>
          )) {
            if (rec?.userInput) {
              restoredInputs[`dict-line-${lineId}`] = rec.userInput;
            }
          }
          setDictationInputs((prev) => ({ ...restoredInputs, ...prev }));
        }
      }
    } catch {
      // ignore
    }
  }, [isLoggedIn, userStorageKey]);

  // Thông báo vừa lưu chấm điểm cho câu hiện tại
  const [recentSaveBanner, setRecentSaveBanner] = useState<{
    lineId: string;
    pointsAdded: number;
    totalEarned: number;
  } | null>(null);

  // Trạng thái đọc tự động ngắt cuối mỗi câu để học viên tự Shadow (Auto-Shadow)
  const [activeFlowKey, setActiveFlowKey] = useState<string | null>(null);
  const [flowPhase, setFlowPhase] = useState<
    'idle' | 'speaking' | 'shadow_pause'
  >('idle');
  const [shadowCountdownSec, setShadowCountdownSec] = useState<number>(0);

  const flowTimerRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const flowAbortRef = useRef<boolean>(false);

  const clearFlowTimers = () => {
    if (flowTimerRef.current) {
      window.clearTimeout(flowTimerRef.current);
      flowTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  const stopAutoShadowFlow = () => {
    flowAbortRef.current = true;
    clearFlowTimers();
    stopSpeaking();
    setActiveFlowKey(null);
    setFlowPhase('idle');
    setShadowCountdownSec(0);
  };

  useEffect(() => {
    return () => {
      stopAutoShadowFlow();
    };
  }, []);

  const filteredSentences80 =
    selectedSentenceCategory === 'Tất cả'
      ? COMMON_SENTENCES_80
      : COMMON_SENTENCES_80.filter(
          (item) => item.category === selectedSentenceCategory
        );

  /**
   * Phần Hiện chữ là FREE hoàn toàn, không cần đăng nhập tài khoản
   */
  const toggleRevealText = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSpeechAccordion = (speechId: string) => {
    setExpandedSpeechIds((prev) => ({
      ...prev,
      [speechId]: !prev[speechId],
    }));
  };

  const calcAutoShadowPauseMs = (sentence: string): number => {
    const wordCount = sentence.trim().split(/\s+/).length;
    return Math.min(6000, Math.max(3200, wordCount * 450));
  };

  const playSingleSentenceWithAutoShadow = (
    flowKey: string,
    sentence: string,
    rate: number,
    studyId: string,
    studyLabel: string,
    speakerIndex: number = 0
  ) => {
    stopAutoShadowFlow();
    flowAbortRef.current = false;
    setActiveFlowKey(flowKey);
    setFlowPhase('speaking');
    onStudyLesson?.(studyId, studyLabel);

    speakSentence(
      sentence,
      rate,
      () => {
        if (flowAbortRef.current) return;
        const pauseMs = calcAutoShadowPauseMs(sentence);
        setFlowPhase('shadow_pause');
        setShadowCountdownSec(Math.ceil(pauseMs / 1000));

        countdownIntervalRef.current = window.setInterval(() => {
          setShadowCountdownSec((prev) => Math.max(0, prev - 1));
        }, 1000);

        flowTimerRef.current = window.setTimeout(() => {
          clearFlowTimers();
          setActiveFlowKey(null);
          setFlowPhase('idle');
          setShadowCountdownSec(0);
        }, pauseMs);
      },
      speakerIndex
    );
  };

  const startAutoShadowSequence = (
    flowKey: string,
    items: Array<{ id: string; sentence: string }>,
    startIndex: number,
    rate: number,
    onStepChange: (idx: number) => void,
    studyLabel: string,
    speakerIndex: number = 0
  ) => {
    if (activeFlowKey === flowKey && flowPhase !== 'idle') {
      stopAutoShadowFlow();
      return;
    }

    stopAutoShadowFlow();
    flowAbortRef.current = false;
    setActiveFlowKey(flowKey);
    onStudyLesson?.(items[startIndex]?.id || flowKey, studyLabel);

    const runStep = (idx: number) => {
      if (flowAbortRef.current || idx >= items.length) {
        clearFlowTimers();
        setActiveFlowKey(null);
        setFlowPhase('idle');
        setShadowCountdownSec(0);
        return;
      }

      onStepChange(idx);
      setFlowPhase('speaking');
      setShadowCountdownSec(0);

      const currentSentence = items[idx].sentence;
      speakSentence(
        currentSentence,
        rate,
        () => {
          if (flowAbortRef.current) return;
          const pauseMs = calcAutoShadowPauseMs(currentSentence);
          setFlowPhase('shadow_pause');
          setShadowCountdownSec(Math.ceil(pauseMs / 1000));

          if (countdownIntervalRef.current) {
            window.clearInterval(countdownIntervalRef.current);
          }
          countdownIntervalRef.current = window.setInterval(() => {
            setShadowCountdownSec((prev) => Math.max(0, prev - 1));
          }, 1000);

          flowTimerRef.current = window.setTimeout(() => {
            clearFlowTimers();
            if (!flowAbortRef.current) {
              runStep(idx + 1);
            }
          }, pauseMs);
        },
        speakerIndex
      );
    };

    runStep(startIndex);
  };

  /**
   * Hiển thị phản hồi từng từ cho phần Chép chính tả trong 80 câu giao tiếp hàng ngày (nguyên bản)
   */
  const renderDictationFeedback = (
    targetSentence: string,
    userInput: string
  ) => {
    const trimmed = userInput.trim();
    if (!trimmed) return null;

    const targetWords = targetSentence.trim().split(/\s+/);
    const normTarget = normalizeDictationText(targetSentence);
    const normUser = normalizeDictationText(trimmed);
    const userWordsNorm = normUser.split(/\s+/).filter(Boolean);

    const isExactMatch = normTarget === normUser;

    return (
      <div className="pt-2 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {targetWords.map((word, idx) => {
            const cleanWord = normalizeDictationText(word);
            const matched = userWordsNorm[idx] === cleanWord;
            return (
              <span
                key={`${word}-${idx}`}
                className={`px-2 py-0.5 rounded-lg text-xs font-black transition-all ${
                  matched
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-stone-100 text-stone-400 border border-dashed border-stone-300'
                }`}
              >
                {matched ? word : '•'.repeat(Math.max(3, word.length))}
              </span>
            );
          })}
        </div>
        {isExactMatch && (
          <p className="text-xs font-black text-emerald-700 flex items-center gap-1">
            <span className="material-symbols-outlined text-base">
              check_circle
            </span>
            <span>Chính xác 100%! Bạn đã nghe và chép đúng toàn bộ câu.</span>
          </p>
        )}
      </div>
    );
  };

  /**
   * Bấm Lưu Chép Chính Tả:
   * - Kiểm tra đăng nhập (nếu chưa đăng nhập -> mở modal đăng nhập)
   * - Đánh giá độ chính xác từng từ & tính điểm thưởng tích luỹ vào tài khoản
   */
  const handleSaveDictationEvaluation = (
    lineId: string,
    targetSentence: string,
    dayNumber: number,
    sentenceNumber: number,
    dayTitleVi: string
  ) => {
    if (!isLoggedIn) {
      onRequireRegister?.();
      return;
    }

    const inputKey = `dict-line-${lineId}`;
    const rawUserText = (dictationInputs[inputKey] || '').trim();
    if (!rawUserText) return;

    const targetWords = targetSentence.trim().split(/\s+/).filter(Boolean);
    const normUserWords = normalizeDictationText(rawUserText)
      .split(/\s+/)
      .filter(Boolean);

    let matchedCount = 0;
    targetWords.forEach((w, idx) => {
      const cleanTarget = normalizeDictationText(w);
      if (normUserWords[idx] === cleanTarget) {
        matchedCount += 1;
      } else if (normUserWords.includes(cleanTarget)) {
        matchedCount += 0.5;
      }
    });

    const exactMatches = targetWords.filter(
      (w, idx) => normUserWords[idx] === normalizeDictationText(w)
    ).length;

    const totalWords = Math.max(1, targetWords.length);
    const rawPercent = Math.min(
      100,
      Math.round((matchedCount / totalWords) * 100)
    );
    const isExactMatch =
      normalizeDictationText(targetSentence) ===
      normalizeDictationText(rawUserText);
    const accuracyPercent = isExactMatch ? 100 : rawPercent;

    let earnedPoints = 2;
    let gradeLabel = 'Cần nghe kỹ hơn • Hãy bấm Nghe chậm và thử lại nhé!';
    if (accuracyPercent === 100) {
      earnedPoints = 10;
      gradeLabel = 'Xuất sắc! Bạn đã nghe và chép chính xác tuyệt đối 100%!';
    } else if (accuracyPercent >= 80) {
      earnedPoints = 8;
      gradeLabel = 'Rất tốt! Bạn đã nghe đúng hầu hết các cụm âm trong câu.';
    } else if (accuracyPercent >= 50) {
      earnedPoints = 5;
      gradeLabel = 'Khá tốt! Hãy kiểm tra các từ còn thiếu và lưu lại để đạt 10 điểm.';
    }

    const prevRecord = savedEvaluations[lineId];
    const prevBestPoints = prevRecord?.earnedPoints || 0;
    const pointsAdded = Math.max(0, earnedPoints - prevBestPoints);

    const newRecord: DictationEvaluationRecord = {
      lineId,
      dayNumber,
      sentenceNumber,
      userInput: rawUserText,
      matchedCount: exactMatches,
      totalWords,
      accuracyPercent,
      earnedPoints: Math.max(prevBestPoints, earnedPoints),
      gradeLabel,
      savedAt: Date.now(),
    };

    const updatedMap = {
      ...savedEvaluations,
      [lineId]: newRecord,
    };
    setSavedEvaluations(updatedMap);

    try {
      localStorage.setItem(userStorageKey, JSON.stringify(updatedMap));
    } catch {
      // ignore
    }

    setRecentSaveBanner({
      lineId,
      pointsAdded,
      totalEarned: newRecord.earnedPoints,
    });

    onRewardDictationPoints?.({
      pointsAdded,
      lineId,
      label: `Mimic Chủ đề ${dayNumber} (Câu ${sentenceNumber}/10 - ${dayTitleVi}): Chép chính tả đạt ${accuracyPercent}% (+${pointsAdded} 💎)`,
    });
  };

  const renderSavedEvaluationCard = (
    lineId: string,
    targetSentence: string,
    currentInput: string
  ) => {
    const saved = savedEvaluations[lineId];
    const trimmed = currentInput.trim();
    if (!saved && !trimmed) return null;

    const targetWords = targetSentence.trim().split(/\s+/).filter(Boolean);
    const normUser = normalizeDictationText(trimmed || saved?.userInput || '');
    const userWordsNorm = normUser.split(/\s+/).filter(Boolean);

    return (
      <div className="pt-2 space-y-2.5">
        {/* So sánh trực quan từng từ trong câu */}
        {trimmed && (
          <div className="flex flex-wrap gap-1.5 bg-stone-50 p-3 rounded-xl border border-stone-200/90">
            {targetWords.map((word, wIdx) => {
              const cleanWord = normalizeDictationText(word);
              const matched = userWordsNorm[wIdx] === cleanWord;
              return (
                <span
                  key={`${word}-${wIdx}`}
                  className={`px-2 py-0.5 rounded-lg text-xs font-black transition-all ${
                    matched
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-white text-stone-400 border border-dashed border-stone-300'
                  }`}
                >
                  {matched ? word : '•'.repeat(Math.max(3, word.length))}
                </span>
              );
            })}
          </div>
        )}

        {/* Bảng đánh giá & tích điểm khi đã bấm Lưu */}
        {saved && (
          <div
            className={`p-3.5 rounded-2xl border space-y-1.5 ${
              saved.accuracyPercent === 100
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                : saved.accuracyPercent >= 80
                ? 'bg-teal-50/90 border-teal-300 text-teal-950'
                : saved.accuracyPercent >= 50
                ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                : 'bg-rose-50/90 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-emerald-700">
                  verified
                </span>
                <span className="text-xs sm:text-sm font-black">
                  Đánh giá: {saved.accuracyPercent}% chính xác (Đúng{' '}
                  {saved.matchedCount}/{saved.totalWords} từ)
                </span>
              </div>

              <span className="text-xs sm:text-sm font-black text-emerald-800 tabular-nums">
                +{saved.earnedPoints}/10 điểm • 💎 Đã tích vào tài khoản
              </span>
            </div>

            <p className="text-xs font-bold opacity-90">{saved.gradeLabel}</p>

            {recentSaveBanner?.lineId === lineId && (
              <p className="text-xs font-extrabold text-emerald-700 pt-0.5">
                {recentSaveBanner.pointsAdded > 0
                  ? `🎉 Đã cộng thêm +${recentSaveBanner.pointsAdded} 💎 vào tài khoản của bạn! (Tổng điểm hiện tại: 💎 ${diamonds})`
                  : `✓ Đã cập nhật bản lưu chép chính tả vào tài khoản (Đã nhận tối đa ${recentSaveBanner.totalEarned}/10 điểm ở câu này).`}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  /**
   * Hiển thị dòng nhấn âm bên dưới câu hoàn chỉnh:
   * - Giữ nguyên cỡ chữ đồng nhất (không phóng to)
   * - Gạch chân các âm được nhấn (stressed syllables)
   */
  const renderStressRhythmSentence = (
    sentence: string,
    accentTheme: 'emerald' | 'teal' = 'emerald'
  ) => {
    const MULTI_SYLLABLE_STRESS_MAP: Record<string, string> = {
      about: 'aBOUT',
      across: 'aCROSS',
      after: 'AFter',
      afternoon: 'afterNOON',
      again: 'aGAIN',
      ahead: 'aHEAD',
      airplane: 'AIRplane',
      airport: 'AIRport',
      along: 'aLONG',
      aloud: 'aLOUD',
      always: 'ALways',
      animals: 'ANimals',
      anna: 'ANna',
      anytime: 'ANytime',
      apple: 'APple',
      appreciate: 'apPREciate',
      around: 'aROUND',
      arrive: 'arRIVE',
      arrived: 'arRIVED',
      autumn: 'AUtumn',
      away: 'aWAY',
      badminton: 'BADminton',
      bakery: 'BAkery',
      balloons: 'balLOONS',
      because: 'beCAUSE',
      bedtime: 'BEDtime',
      before: 'beFORE',
      being: 'BEing',
      believe: 'beLIEVE',
      better: 'BETter',
      between: 'beTWEEN',
      birthday: 'BIRTHday',
      blowing: 'BLOWing',
      bookmark: 'BOOKmark',
      bookstore: 'BOOKstore',
      borrow: 'BORrow',
      bottle: 'BOTtle',
      breakfast: 'BREAKfast',
      breaking: 'BREAKing',
      brother: 'BROTHer',
      butter: 'BUTter',
      button: 'BUTton',
      camera: 'CAMera',
      candles: 'CANdles',
      cannot: 'CANnot',
      careful: 'CAREful',
      carefully: 'CAREfully',
      carry: 'CARry',
      center: 'CENter',
      character: 'CHARacter',
      checkout: 'CHECKout',
      chocolate: 'CHOColate',
      city: 'CIty',
      classmates: 'CLASSmates',
      clearly: 'CLEARly',
      closer: 'CLOser',
      closing: 'CLOsing',
      collecting: 'colLECting',
      colorful: 'COLorful',
      coming: 'COMing',
      completing: 'comPLEting',
      congratulations: 'congratuLAtions',
      corner: 'CORner',
      counter: 'COUNter',
      cover: 'COVer',
      crayons: 'CRAYons',
      crossing: 'CROSSing',
      dairy: 'DAIry',
      decorate: 'DECorate',
      delicious: 'deLIcious',
      dinner: 'DINner',
      dishes: 'DISHes',
      doctor: 'DOCtor',
      doing: 'DOing',
      dollars: 'DOLlars',
      drawing: 'DRAWing',
      early: 'EARly',
      elephants: 'ELephants',
      english: 'ENGlish',
      enjoy: 'enJOY',
      evening: 'EVening',
      every: 'EVery',
      everyone: 'EVeryone',
      everything: 'EVerything',
      everywhere: 'EVerywhere',
      excited: 'exCIted',
      excuse: 'exCUSE',
      exercise: 'EXercise',
      family: 'FAMily',
      fasten: 'FASten',
      father: 'FAther',
      favorite: 'FAvorite',
      feeling: 'FEELing',
      fifteen: 'fifTEEN',
      fitting: 'FITting',
      flowers: 'FLOWers',
      flying: 'FLYing',
      forever: 'forEVer',
      forget: 'forGET',
      forgive: 'forGIVE',
      forest: 'FORest',
      freezing: 'FREEZing',
      future: 'FUture',
      garden: 'GARden',
      getting: 'GETting',
      giraffes: 'giRAFFES',
      going: 'GOing',
      golden: 'GOLDen',
      grandma: 'GRANDma',
      grandpa: 'GRANDpa',
      happened: 'HAPpened',
      happiness: 'HAPpiness',
      happy: 'HAPpy',
      having: 'HAVing',
      headache: 'HEADache',
      healthy: 'HEALTHy',
      hello: 'helLO',
      helmet: 'HELmet',
      helping: 'HELPing',
      hobbies: 'HOBbies',
      hobby: 'HOBby',
      hurry: 'HURry',
      idea: 'iDEa',
      inside: 'inSIDE',
      jacket: 'JACKet',
      kindness: 'KINDness',
      kitchen: 'KITCHen',
      kitten: 'KITten',
      lately: 'LATEly',
      later: 'LAter',
      learning: 'LEARNing',
      library: 'LIbrary',
      listen: 'LISten',
      listening: 'LIStening',
      little: 'LITtle',
      living: 'LIVing',
      many: 'MANy',
      matter: 'MATter',
      medicine: 'MEDicine',
      meeting: 'MEETing',
      menu: 'MENu',
      merrier: 'MERrier',
      message: 'MESsage',
      mimic: 'MIMic',
      minute: 'MINute',
      minutes: 'MINutes',
      mirror: 'MIRror',
      moment: 'MOment',
      monday: 'MONday',
      morning: 'MORNing',
      mother: 'MOTHer',
      movie: 'MOvie',
      music: 'MUsic',
      neatly: 'NEATly',
      never: 'NEVer',
      notebook: 'NOTEbook',
      "o'clock": "o'CLOCK",
      'o’clock': 'o’CLOCK',
      office: 'OFfice',
      okay: 'oKAY',
      open: 'OPen',
      opens: 'OPens',
      orange: 'ORange',
      order: 'ORder',
      other: 'OTHer',
      outside: 'outSIDE',
      over: 'OVer',
      painting: 'PAINTing',
      paper: 'PAper',
      partner: 'PARTner',
      party: 'PARty',
      pencil: 'PENcil',
      people: 'PEOple',
      perfect: 'PERfect',
      photo: 'PHOto',
      piano: 'piANo',
      picnic: 'PICnic',
      picture: 'PICture',
      pictures: 'PICtures',
      pleasant: 'PLEAsant',
      pleasure: 'PLEAsure',
      plenty: 'PLENty',
      pocket: 'POCKet',
      practice: 'PRACtice',
      present: 'PRESent',
      pronounce: 'proNOUNCE',
      puppy: 'PUPpy',
      quarter: 'QUARter',
      question: 'QUEStion',
      quickly: 'QUICKly',
      rainbow: 'RAINbow',
      ready: 'READy',
      really: 'REALly',
      relax: 'reLAX',
      remember: 'reMEMber',
      reusable: 'reUSable',
      riding: 'RIding',
      ruler: 'RUler',
      sandwiches: 'SANDwiches',
      saturday: 'SATurday',
      second: 'SECond',
      section: 'SECtion',
      seven: 'SEVen',
      shoelaces: 'SHOElaces',
      shopping: 'SHOPping',
      singing: 'SINGing',
      sister: 'SISter',
      sleeping: 'SLEEPing',
      slower: 'SLOWer',
      smaller: 'SMALLer',
      soccer: 'SOCcer',
      sofa: 'SOfa',
      sorry: 'SORry',
      speaking: 'SPEAKing',
      specially: 'SPEcially',
      stickers: 'STICKers',
      story: 'STOry',
      strawberries: 'STRAWberries',
      strongly: 'STRONGly',
      summer: 'SUMmer',
      sunday: 'SUNday',
      sunny: 'SUNny',
      support: 'supPORT',
      surprised: 'surPRISED',
      sweater: 'SWEATer',
      table: 'TAble',
      talking: 'TALKing',
      teacher: 'TEACHer',
      television: 'TELevision',
      temperature: 'TEMperature',
      thirty: 'THIRty',
      tightly: 'TIGHTly',
      tired: 'TIred',
      today: 'toDAY',
      together: 'toGETHer',
      tomorrow: 'toMORrow',
      tonight: 'toNIGHT',
      traffic: 'TRAFfic',
      travel: 'TRAVel',
      tuesday: 'TUESday',
      umbrella: 'umBRELla',
      uniform: 'UNiform',
      usually: 'USually',
      vegetables: 'VEGetables',
      very: 'VERy',
      volume: 'VOLume',
      water: 'WAter',
      weather: 'WEATHer',
      weekend: 'WEEKend',
      welcome: 'WELcome',
      window: 'WINdow',
      winter: 'WINter',
      wishing: 'WISHing',
      wonderful: 'WONderful',
      worry: 'WORry',
      yellow: 'YELlow',
      yesterday: 'YESterday',
      yourself: 'yourSELF',
    };

    const UNSTRESSED_WORDS = new Set([
      'a',
      'an',
      'the',
      'some',
      'any',
      'i',
      "i'm",
      'i’m',
      "i'd",
      'i’d',
      "i'll",
      'i’ll',
      'you',
      "you're",
      'you’re',
      'he',
      'she',
      'it',
      "it's",
      'it’s',
      'we',
      "we're",
      'we’re',
      "we'll",
      'we’ll',
      'they',
      'me',
      'him',
      'her',
      'us',
      'them',
      'my',
      'your',
      'his',
      'our',
      'their',
      'to',
      'of',
      'in',
      'on',
      'at',
      'for',
      'with',
      'from',
      'by',
      'into',
      'upon',
      'am',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'do',
      'does',
      'did',
      'have',
      'has',
      'had',
      'can',
      'could',
      'will',
      'would',
      'shall',
      'should',
      'may',
      'might',
      'must',
      'and',
      'or',
      'but',
      'if',
      'so',
      'that',
      'this',
      'these',
      'those',
      'as',
      'when',
      'there',
    ]);

    const PHRASAL_VERBS_BEFORE_ON_IN = new Set([
      'turn',
      'put',
      'try',
      'hold',
      'get',
      'come',
      'it',
    ]);

    const rawTokens = sentence.trim().split(/\s+/);
    const cleanTokens = rawTokens.map((t) =>
      t.replace(/^[^a-zA-Z0-9'’]+|[^a-zA-Z0-9'’]+$/g, '').toLowerCase()
    );

    const stressedStyle =
      accentTheme === 'teal'
        ? 'font-extrabold text-teal-900 underline decoration-2 decoration-teal-600 underline-offset-4'
        : 'font-extrabold text-emerald-900 underline decoration-2 decoration-emerald-600 underline-offset-4';

    return (
      <p className="text-xs sm:text-sm leading-relaxed flex flex-wrap items-baseline gap-x-1.5 gap-y-1 text-stone-500 font-medium">
        {rawTokens.map((token, idx) => {
          const match = token.match(
            /^([^a-zA-Z0-9'’]*)([a-zA-Z0-9'’]+)([^a-zA-Z0-9'’]*)$/
          );
          if (!match) {
            return <span key={idx}>{token}</span>;
          }

          const [, prefix, core, suffix] = match;
          const lowerCore = core.toLowerCase();
          const prevClean = idx > 0 ? cleanTokens[idx - 1] : '';
          const nextClean =
            idx < cleanTokens.length - 1 ? cleanTokens[idx + 1] : '';

          let patternCore = '';

          if (MULTI_SYLLABLE_STRESS_MAP[lowerCore]) {
            patternCore = MULTI_SYLLABLE_STRESS_MAP[lowerCore];
          } else if (
            (lowerCore === 'on' || lowerCore === 'in') &&
            (PHRASAL_VERBS_BEFORE_ON_IN.has(prevClean) || !nextClean)
          ) {
            patternCore = lowerCore.toUpperCase();
          } else if (
            lowerCore === 'do' &&
            nextClean !== 'you' &&
            nextClean !== 'not' &&
            nextClean !== 'we'
          ) {
            patternCore = 'DO';
          } else if (UNSTRESSED_WORDS.has(lowerCore)) {
            patternCore = lowerCore;
          } else {
            patternCore = lowerCore.toUpperCase();
          }

          // Tách theo vị trí các âm nhấn (chữ HOA trong patternCore) nhưng giữ nguyên chữ gốc của câu
          const patternRuns =
            patternCore.match(/[A-Z0-9'’]+|[^A-Z0-9'’]+/g) || [patternCore];

          let charCursor = 0;

          return (
            <span key={idx} className="inline">
              {prefix && <span>{prefix}</span>}
              {patternRuns.map((run, rIdx) => {
                const isStressed = /[A-Z]/.test(run);
                const originalSlice =
                  patternCore.length === core.length
                    ? core.slice(charCursor, charCursor + run.length)
                    : run;
                charCursor += run.length;

                return isStressed ? (
                  <span key={rIdx} className={stressedStyle}>
                    {originalSlice}
                  </span>
                ) : (
                  <span key={rIdx}>{originalSlice}</span>
                );
              })}
              {suffix && <span>{suffix}</span>}
            </span>
          );
        })}
      </p>
    );
  };

  const saved80Count = COMMON_SENTENCES_80.filter(
    (s) => !!savedEvaluations[s.id]
  ).length;
  const saved300Count = Object.keys(savedEvaluations).filter((k) =>
    k.startsWith('d')
  ).length;
  const totalEarnedMimicPoints = Object.values(savedEvaluations).reduce(
    (sum: number, item: DictationEvaluationRecord) =>
      sum + (item?.earnedPoints || 0),
    0
  );

  const isSec1NormalFlow = activeFlowKey === 'sec1-all-normal';

  return (
    <div className="space-y-3">
      {/* ================================================================== */}
      {/* PHẦN 1: 80 CÂU GIAO TIẾP HÀNG NGÀY                                 */}
      {/* ================================================================== */}
      <section className="bg-white rounded-2xl border border-emerald-200/90 shadow-xs overflow-hidden transition-all">
        <div
          onClick={() => setIsSection1Open((prev) => !prev)}
          className="w-full px-4 py-3 flex flex-wrap items-center justify-between gap-2.5 bg-gradient-to-r from-emerald-50/80 via-white to-teal-50/40 hover:from-emerald-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-2xs shrink-0">
              01
            </span>
            <h3 className="text-sm sm:text-base font-black text-emerald-950 tracking-tight uppercase">
              80 CÂU GIAO TIẾP HÀNG NGÀY
            </h3>
          </div>

          <div
            className="flex items-center gap-2 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {isLoggedIn ? (
              <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800 tabular-nums">
                <span>Đã lưu: {saved80Count}/80</span>
                <span aria-hidden="true">·</span>
                <span>💎 {diamonds}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onRequireRegister?.()}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black cursor-pointer transition-colors whitespace-nowrap shrink-0"
              >
                Đăng nhập để Chép chính tả & Tích điểm
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsSection1Open((prev) => !prev)}
              className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">
                {isSection1Open ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>
        </div>

        {isSection1Open && (
          <div className="p-3 sm:p-4 border-t border-emerald-100 space-y-3">
            {/* Bộ lọc 8 Chủ đề + Nút Nghe cả đoạn */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-200/80">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                {COMMON_SENTENCE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      stopAutoShadowFlow();
                      setSelectedSentenceCategory(cat);
                      setActiveSentenceIdx(0);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition-all whitespace-nowrap shrink-0 ${
                      selectedSentenceCategory === cat
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-white text-stone-700 hover:bg-emerald-100/60 border border-emerald-200/70'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    startAutoShadowSequence(
                      'sec1-all-normal',
                      filteredSentences80.map((s) => ({
                        id: s.id,
                        sentence: s.fullSentence,
                      })),
                      activeSentenceIdx,
                      1.0,
                      (idx) => setActiveSentenceIdx(idx),
                      `80 Câu Giao Tiếp (${selectedSentenceCategory})`
                    )
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                    isSec1NormalFlow
                      ? 'bg-rose-600 text-white'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {isSec1NormalFlow ? 'stop_circle' : 'play_circle'}
                  </span>
                  <span>{isSec1NormalFlow ? 'Dừng' : 'Nghe cả đoạn'}</span>
                </button>
              </div>
            </div>

            {/* Danh sách thẻ 80 câu giao tiếp hàng ngày (thu gọn) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredSentences80.map((item, idx) => {
                const isRevealed = !!revealedIds[item.id];
                const dictKey = `dict-line-${item.id}`;
                const userText = dictationInputs[dictKey] || '';
                const normalKey = `cs-normal-${item.id}`;
                const isThisNormal = activeFlowKey === normalKey;
                const isCurrentFlowItem =
                  isSec1NormalFlow && activeSentenceIdx === idx;
                const isHighlighted = isThisNormal || isCurrentFlowItem;

                return (
                  <div
                    key={item.id}
                    className={`rounded-xl p-2.5 border transition-all flex flex-col justify-between gap-2 ${
                      isHighlighted
                        ? 'bg-emerald-50/90 border-2 border-emerald-600 shadow-2xs'
                        : 'bg-stone-50/70 hover:bg-white border-stone-200/90'
                    }`}
                  >
                    {/* Hàng trên: Số thứ tự + Chủ đề + Nút Nghe từng câu */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-700 text-white font-black text-[11px] tabular-nums shrink-0">
                          #{String(item.number).padStart(2, '0')}
                        </span>
                        <span className="text-xs font-extrabold text-emerald-900 truncate">
                          {item.category}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (isThisNormal) {
                            stopAutoShadowFlow();
                            return;
                          }
                          setActiveSentenceIdx(idx);
                          playSingleSentenceWithAutoShadow(
                            normalKey,
                            item.fullSentence,
                            1.0,
                            item.id,
                            `Câu #${item.number}: ${item.fullSentence}`
                          );
                        }}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-extrabold cursor-pointer flex items-center gap-1 transition-all whitespace-nowrap shrink-0 ${
                          isThisNormal
                            ? 'bg-emerald-700 border-emerald-800 text-white'
                            : 'bg-emerald-100 hover:bg-emerald-200 border-emerald-300 text-emerald-950'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {isThisNormal ? 'stop_circle' : 'volume_up'}
                        </span>
                        <span>{isThisNormal ? 'Dừng' : 'Nghe từng câu'}</span>
                      </button>
                    </div>

                    {isHighlighted && flowPhase !== 'idle' && (
                      <div
                        className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 ${
                          flowPhase === 'speaking'
                            ? 'bg-amber-100 text-amber-950'
                            : 'bg-emerald-200/80 text-emerald-950'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {flowPhase === 'speaking'
                            ? 'volume_up'
                            : 'record_voice_over'}
                        </span>
                        <span>
                          {flowPhase === 'speaking'
                            ? 'Đang phát...'
                            : `Nhại lại (${shadowCountdownSec}s)...`}
                        </span>
                      </div>
                    )}

                    {/* 1. CHÉP CHÍNH TẢ (Ở TRÊN) */}
                    {isLoggedIn ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={userText}
                            onChange={(e) =>
                              setDictationInputs((prev) => ({
                                ...prev,
                                [dictKey]: e.target.value,
                              }))
                            }
                            placeholder="Chép chính tả..."
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 focus:border-emerald-600 focus:outline-none text-xs font-bold text-stone-900"
                          />
                          {userText && (
                            <button
                              type="button"
                              onClick={() =>
                                setDictationInputs((prev) => ({
                                  ...prev,
                                  [dictKey]: '',
                                }))
                              }
                              className="px-2 py-1 rounded-lg text-xs font-bold text-stone-400 hover:text-rose-600 cursor-pointer shrink-0"
                            >
                              Xoá
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={!userText.trim()}
                            onClick={() =>
                              handleSaveDictationEvaluation(
                                item.id,
                                item.fullSentence,
                                0,
                                item.number,
                                item.category
                              )
                            }
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-black cursor-pointer shrink-0"
                          >
                            Lưu
                          </button>
                        </div>
                        {renderSavedEvaluationCard(
                          item.id,
                          item.fullSentence,
                          userText
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onRequireRegister?.()}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 hover:border-emerald-400 text-stone-500 hover:text-emerald-900 text-xs font-extrabold flex items-center justify-between cursor-pointer transition-all"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm text-stone-400">
                            edit_note
                          </span>
                          <span>Chép chính tả</span>
                        </span>
                        <span className="material-symbols-outlined text-sm text-amber-600">
                          lock
                        </span>
                      </button>
                    )}

                    {/* 2. HIỆN CHỮ (Ở DƯỚI) */}
                    {isRevealed ? (
                      <div
                        onClick={() => toggleRevealText(item.id)}
                        className="p-2.5 rounded-lg bg-white border border-emerald-300 space-y-1 cursor-pointer transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-black text-stone-900">
                            {item.fullSentence}
                          </p>
                          <span className="text-[11px] font-bold text-stone-400 hover:text-stone-700 shrink-0">
                            Ẩn chữ
                          </span>
                        </div>
                        {renderStressRhythmSentence(
                          item.fullSentence,
                          'emerald'
                        )}
                        <p className="text-xs text-stone-600 font-semibold">
                          Nghĩa: {item.meaning}
                        </p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleRevealText(item.id)}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-white/90 hover:bg-white border border-dashed border-emerald-300 text-emerald-900 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        <span className="material-symbols-outlined text-sm text-emerald-600">
                          visibility
                        </span>
                        <span>Hiện chữ</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ================================================================== */}
      {/* PHẦN 2: 300 CỤM MIMIC • 30 CHỦ ĐỀ GIAO TIẾP                        */}
      {/* ================================================================== */}
      <section className="bg-white rounded-2xl border border-teal-200/90 shadow-xs overflow-hidden transition-all">
        <div
          onClick={() => setIsSection2Open((prev) => !prev)}
          className="w-full px-4 py-3 flex flex-wrap items-center justify-between gap-2.5 bg-gradient-to-r from-teal-50/80 via-white to-emerald-50/40 border-b border-teal-100 cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center font-black text-xs shadow-2xs shrink-0">
              02
            </span>
            <h3 className="text-sm sm:text-base font-black text-teal-950 tracking-tight uppercase">
              300 CỤM MIMIC • 30 CHỦ ĐỀ GIAO TIẾP
            </h3>
          </div>

          <div
            className="flex items-center gap-2 text-xs font-extrabold text-teal-900 tabular-nums"
            onClick={(e) => e.stopPropagation()}
          >
            {isLoggedIn ? (
              <div className="flex items-center gap-2 text-emerald-800">
                <span>Đã lưu: {saved300Count}/300</span>
                <span aria-hidden="true">·</span>
                <span>+{totalEarnedMimicPoints} 💎</span>
                <span aria-hidden="true">·</span>
                <span>💎 {diamonds}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onRequireRegister?.()}
                className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-black cursor-pointer transition-colors whitespace-nowrap shrink-0"
              >
                Đăng nhập để Chép chính tả & Tích điểm
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsSection2Open((prev) => !prev)}
              className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">
                {isSection2Open ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>
        </div>

        {isSection2Open && (
          <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {SHORT_SPEECH_A1_LESSONS.map((speech) => {
              const isSpeechExpanded = !!expandedSpeechIds[speech.id];
              const currentLineIdx = Math.min(
                speechLineIndices[speech.id] || 0,
                speech.lines.length - 1
              );
              const activeLine = speech.lines[currentLineIdx];
              const isLineRevealed = !!revealedIds[activeLine.id];
              const lineDictationKey = `dict-line-${activeLine.id}`;
              const userLineDictation = dictationInputs[lineDictationKey] || '';

              const slowFlowKey = `speech-${speech.id}-slow`;
              const singleNormalKey = `speech-single-${activeLine.id}-normal`;
              const isSlowFlowRunning = activeFlowKey === slowFlowKey;
              const isSingleNormalRunning = activeFlowKey === singleNormalKey;
              const isAnySpeechRunning =
                isSlowFlowRunning || isSingleNormalRunning;

              const completedInTopicCount = speech.lines.filter(
                (l) => !!savedEvaluations[l.id]
              ).length;

              return (
                <div
                  key={speech.id}
                  className={`rounded-xl border border-teal-200/90 bg-teal-50/25 overflow-hidden shadow-2xs transition-all ${
                    isSpeechExpanded ? 'md:col-span-2' : ''
                  }`}
                >
                  {/* Thanh tiêu đề từng Chủ đề thu gọn kèm 1 ảnh đại diện chung của cả chủ đề */}
                  <div
                    onClick={() => toggleSpeechAccordion(speech.id)}
                    className="p-2.5 sm:p-3 flex items-center justify-between gap-2.5 bg-white hover:bg-teal-50/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={speech.imageUrl}
                        alt={speech.titleVi}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover border border-teal-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm sm:text-base font-black text-stone-900 truncate">
                          {speech.titleVi}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-stone-500">
                          <span className="text-teal-800 truncate">
                            {speech.titleEn}
                          </span>
                          {isLoggedIn && completedInTopicCount > 0 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-emerald-700 font-black">
                                {completedInTopicCount}/10
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-base">
                        {isSpeechExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </span>
                  </div>

                  {/* CỬA SỔ HỌC TỪNG CÂU */}
                  {isSpeechExpanded && (
                    <div className="p-3 sm:p-4 border-t border-teal-200/70 space-y-2.5">
                      {/* Thanh chọn câu 1..10 & Điều khiển Nghe */}
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-teal-200/80">
                        <div className="flex flex-wrap items-center gap-1">
                          {speech.lines.map((l, idx) => {
                            const isSaved = !!savedEvaluations[l.id];
                            return (
                              <button
                                key={l.id}
                                type="button"
                                onClick={() => {
                                  stopAutoShadowFlow();
                                  setSpeechLineIndices((prev) => ({
                                    ...prev,
                                    [speech.id]: idx,
                                  }));
                                }}
                                className={`w-7 h-7 rounded-lg text-xs font-black cursor-pointer transition-all tabular-nums ${
                                  idx === currentLineIdx
                                    ? 'bg-teal-700 text-white shadow-2xs'
                                    : isSaved
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-400'
                                    : 'bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200'
                                }`}
                              >
                                {idx + 1}
                              </button>
                            );
                          })}

                          <div className="flex items-center gap-1 ml-1 pl-1.5 border-l border-stone-200">
                            <button
                              type="button"
                              disabled={currentLineIdx <= 0}
                              onClick={() => {
                                stopAutoShadowFlow();
                                setSpeechLineIndices((prev) => ({
                                  ...prev,
                                  [speech.id]: Math.max(0, currentLineIdx - 1),
                                }));
                              }}
                              className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-stone-800 text-xs font-extrabold cursor-pointer whitespace-nowrap shrink-0"
                            >
                              Lùi
                            </button>
                            <button
                              type="button"
                              disabled={
                                currentLineIdx >= speech.lines.length - 1
                              }
                              onClick={() => {
                                stopAutoShadowFlow();
                                setSpeechLineIndices((prev) => ({
                                  ...prev,
                                  [speech.id]: Math.min(
                                    speech.lines.length - 1,
                                    currentLineIdx + 1
                                  ),
                                }));
                              }}
                              className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-stone-800 text-xs font-extrabold cursor-pointer whitespace-nowrap shrink-0"
                            >
                              Tiếp
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (isSingleNormalRunning) {
                                stopAutoShadowFlow();
                                return;
                              }
                              playSingleSentenceWithAutoShadow(
                                singleNormalKey,
                                activeLine.sentence,
                                1.0,
                                activeLine.id,
                                `${speech.titleVi} - Câu ${currentLineIdx + 1}`,
                                speech.number
                              );
                            }}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold cursor-pointer flex items-center gap-1 transition-all whitespace-nowrap shrink-0 ${
                              isSingleNormalRunning
                                ? 'bg-amber-600 border-amber-700 text-white'
                                : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-950'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {isSingleNormalRunning
                                ? 'stop_circle'
                                : 'volume_up'}
                            </span>
                            <span>
                              {isSingleNormalRunning
                                ? 'Dừng'
                                : 'Nghe từng câu'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              startAutoShadowSequence(
                                slowFlowKey,
                                speech.lines.map((l) => ({
                                  id: l.id,
                                  sentence: l.sentence,
                                })),
                                0,
                                1.0,
                                (stepIdx) =>
                                  setSpeechLineIndices((prev) => ({
                                    ...prev,
                                    [speech.id]: stepIdx,
                                  })),
                                speech.titleVi,
                                1
                              )
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer flex items-center gap-1 transition-all whitespace-nowrap shrink-0 ${
                              isSlowFlowRunning
                                ? 'bg-rose-600 text-white'
                                : 'bg-teal-700 hover:bg-teal-800 text-white'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {isSlowFlowRunning ? 'stop_circle' : 'play_circle'}
                            </span>
                            <span>
                              {isSlowFlowRunning ? 'Dừng' : 'Nghe cả đoạn'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {isAnySpeechRunning && (
                        <div
                          className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all ${
                            flowPhase === 'speaking'
                              ? 'bg-amber-50 border-amber-300 text-amber-950'
                              : 'bg-teal-100/90 border-teal-400 text-teal-950'
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">
                            {flowPhase === 'speaking'
                              ? 'volume_up'
                              : 'record_voice_over'}
                          </span>
                          <span className="text-xs font-black">
                            {flowPhase === 'speaking'
                              ? 'Đang phát...'
                              : `Nhại lại (${shadowCountdownSec}s)...`}
                          </span>
                        </div>
                      )}

                      {/* 1. CHÉP CHÍNH TẢ (Ở TRÊN) */}
                      {isLoggedIn ? (
                        <div className="p-2.5 rounded-xl bg-white border border-teal-200/90 space-y-2">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={userLineDictation}
                              onChange={(e) =>
                                setDictationInputs((prev) => ({
                                  ...prev,
                                  [lineDictationKey]: e.target.value,
                                }))
                              }
                              placeholder="Chép chính tả..."
                              className="w-full px-3 py-1.5 rounded-lg bg-stone-50 focus:bg-white border border-stone-300 focus:border-teal-600 focus:outline-none text-xs sm:text-sm font-bold text-stone-900"
                            />
                            {userLineDictation && (
                              <button
                                type="button"
                                onClick={() =>
                                  setDictationInputs((prev) => ({
                                    ...prev,
                                    [lineDictationKey]: '',
                                  }))
                                }
                                className="px-2 py-1 rounded-lg text-xs font-extrabold text-stone-500 hover:text-rose-600 cursor-pointer whitespace-nowrap shrink-0"
                              >
                                Xoá
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={!userLineDictation.trim()}
                              onClick={() =>
                                handleSaveDictationEvaluation(
                                  activeLine.id,
                                  activeLine.sentence,
                                  speech.number,
                                  currentLineIdx + 1,
                                  speech.titleVi
                                )
                              }
                              className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-black cursor-pointer transition-all whitespace-nowrap shrink-0"
                            >
                              Lưu
                            </button>
                          </div>

                          {renderSavedEvaluationCard(
                            activeLine.id,
                            activeLine.sentence,
                            userLineDictation
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onRequireRegister?.()}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-teal-200/90 hover:border-teal-500 text-stone-600 hover:text-teal-950 text-xs sm:text-sm font-black flex items-center justify-between cursor-pointer transition-all"
                        >
                          <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-teal-700">
                              edit_note
                            </span>
                            <span>Chép chính tả</span>
                          </span>
                          <span className="material-symbols-outlined text-base text-amber-600">
                            lock
                          </span>
                        </button>
                      )}

                      {/* 2. HIỆN CHỮ (Ở DƯỚI) */}
                      {isLineRevealed ? (
                        <div
                          onClick={() => toggleRevealText(activeLine.id)}
                          className="p-3.5 rounded-xl bg-white border border-teal-300 space-y-1.5 cursor-pointer transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm sm:text-base font-black text-stone-900">
                              {activeLine.sentence}
                            </p>
                            <span className="text-xs font-bold text-stone-400 hover:text-stone-700 shrink-0">
                              Ẩn chữ
                            </span>
                          </div>
                          {renderStressRhythmSentence(
                            activeLine.sentence,
                            'teal'
                          )}
                          <p className="text-xs text-stone-600 font-semibold">
                            Nghĩa: {activeLine.meaning}
                          </p>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleRevealText(activeLine.id)}
                          className="w-full py-2.5 px-4 rounded-xl bg-white/95 hover:bg-white border border-dashed border-teal-300 hover:border-teal-600 text-teal-950 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                        >
                          <span className="material-symbols-outlined text-base text-teal-600">
                            visibility
                          </span>
                          <span className="text-xs sm:text-sm font-black text-teal-900">
                            Hiện chữ
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
