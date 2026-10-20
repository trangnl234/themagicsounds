import { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { PhonicsSound, PHONICS_42_SOUNDS } from '../data/phonicsData';
import { getWordBankForSound, BlendingLevelKey } from '../data/wordBankData';
import { parseWordToPhonemes } from './BlendingManagerTab';
import { speakPhoneme, speakWord, stopSpeaking, playBlendSuccessChime } from '../utils/audioPlayer';

// 4 Mã nhóm kỹ năng chuẩn mực và đồng nhất cho mọi lứa tuổi
export type ExerciseCategoryKey =
  | 'single_phoneme'       // Nhóm 1: Âm Đơn Lẻ (Mã màu Xanh Lam - Blue #3B82F6)
  | 'count_phonemes'       // Nhóm 2: Đếm Số Âm Vị (Mã màu Cam Hổ Phách - Amber #F59E0B)
  | 'segment_spelling'     // Nhóm 3: Đánh Vần Từng Âm (Mã màu Tím - Purple #8B5CF6)
  | 'whole_word_dictation';// Nhóm 4: Chính Tả Toàn Từ (Mã màu Xanh Lục - Emerald #10B981)

export interface CategoryTheme {
  key: ExerciseCategoryKey;
  name: string;
  badgeLabel: string;
  icon: string;
  hex: string;
  dotBg: string;
  legendBg: string;
  legendText: string;
  legendBorder: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  activeBtnBg: string;
  activeBtnRing: string;
  accentBg: string;
  speakerBg: string;
  speakerRing: string;
  cardBorder: string;
}

// Bảng mã màu đồng nhất cho các dạng bài xuyên suốt mọi lứa tuổi
export const CATEGORY_THEMES: Record<ExerciseCategoryKey, CategoryTheme> = {
  single_phoneme: {
    key: 'single_phoneme',
    name: 'Âm Đơn Lẻ',
    badgeLabel: 'Âm Đơn Lẻ',
    icon: 'graphic_eq',
    hex: '#3B82F6',
    dotBg: 'bg-blue-500',
    legendBg: 'bg-blue-50',
    legendText: 'text-blue-700',
    legendBorder: 'border-blue-200',
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-300/60',
    activeBtnBg: 'bg-blue-600 text-white border-blue-600',
    activeBtnRing: 'ring-blue-400/50',
    accentBg: 'bg-blue-600 hover:bg-blue-700',
    speakerBg: 'bg-blue-600',
    speakerRing: 'ring-blue-300/50',
    cardBorder: 'border-blue-300/40',
  },
  count_phonemes: {
    key: 'count_phonemes',
    name: 'Đếm Số Âm Vị',
    badgeLabel: 'Đếm Số Âm Vị',
    icon: 'format_list_numbered',
    hex: '#F59E0B',
    dotBg: 'bg-amber-500',
    legendBg: 'bg-amber-50',
    legendText: 'text-amber-800',
    legendBorder: 'border-amber-200',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-300/60',
    activeBtnBg: 'bg-amber-500 text-white border-amber-500',
    activeBtnRing: 'ring-amber-400/50',
    accentBg: 'bg-amber-500 hover:bg-amber-600',
    speakerBg: 'bg-amber-500',
    speakerRing: 'ring-amber-300/50',
    cardBorder: 'border-amber-300/40',
  },
  segment_spelling: {
    key: 'segment_spelling',
    name: 'Đánh Vần Từng Âm',
    badgeLabel: 'Tách & Ghép Âm',
    icon: 'call_split',
    hex: '#8B5CF6',
    dotBg: 'bg-purple-500',
    legendBg: 'bg-purple-50',
    legendText: 'text-purple-800',
    legendBorder: 'border-purple-200',
    badgeBg: 'bg-purple-500/15',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-300/60',
    activeBtnBg: 'bg-purple-600 text-white border-purple-600',
    activeBtnRing: 'ring-purple-400/50',
    accentBg: 'bg-purple-600 hover:bg-purple-700',
    speakerBg: 'bg-purple-600',
    speakerRing: 'ring-purple-300/50',
    cardBorder: 'border-purple-300/40',
  },
  whole_word_dictation: {
    key: 'whole_word_dictation',
    name: 'Chính Tả Toàn Từ',
    badgeLabel: 'Chính Tả Toàn Từ',
    icon: 'spellcheck',
    hex: '#10B981',
    dotBg: 'bg-emerald-500',
    legendBg: 'bg-emerald-50',
    legendText: 'text-emerald-800',
    legendBorder: 'border-emerald-200',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-300/60',
    activeBtnBg: 'bg-emerald-600 text-white border-emerald-600',
    activeBtnRing: 'ring-emerald-400/50',
    accentBg: 'bg-emerald-600 hover:bg-emerald-700',
    speakerBg: 'bg-emerald-600',
    speakerRing: 'ring-emerald-300/50',
    cardBorder: 'border-emerald-300/40',
  },
};

export type ExerciseType =
  | 'phoneme_mc'             // 5-6t (Bài 1-3): Nghe âm đơn lẻ, chọn mặt chữ (tick chọn)
  | 'count_phonemes'         // CẢ 2 ĐỘ TUỔI (Bài 4-6): Nghe từ, đếm số âm vị và chọn số bên dưới (2, 3, 4, 5)
  | 'phoneme_input'          // >=7t (Bài 1-3) & 5-6t (Bài 7-8): Nghe âm đơn lẻ, gõ xuống
  | 'spell_to_word_input'    // >=7t (Bài 7-8): Nghe đánh vần từng âm (/c/-/a/-/t/), gõ từ
  | 'whole_word_input'       // >=7t (Bài 9-10): Nghe đọc nguyên từ, gõ từ
  | 'spell_then_word_input'; // 5-6t (Bài 9-10): Đánh vần từng âm và cả từ cho chép chính tả, gõ từ

export interface SegmentingExercise {
  id: string;
  orderNumber: number; // 1 to 10
  title: string;
  categoryKey: ExerciseCategoryKey;
  categoryBadge: string;
  instruction: string;
  type: ExerciseType;
  audioTarget: {
    kind: 'phoneme' | 'word_whole' | 'word_spell' | 'word_spell_and_whole';
    phoneme?: string;
    word?: string;
    phonemes?: string[];
  };
  options?: string[]; // for multiple-choice (4 choices)
  correctAnswer: string;
  acceptedAnswers: string[];
  hint: string;
}

interface SegmentingPracticeTabProps {
  sound: PhonicsSound;
}

// Lấy danh sách các âm đã học tính đến âm hiện tại
function getLearnedSounds(currentSound: PhonicsSound): PhonicsSound[] {
  const currentIndex = PHONICS_42_SOUNDS.findIndex((s) => s.id === currentSound.id);
  const endIdx = currentIndex >= 0 ? currentIndex + 1 : 1;
  return PHONICS_42_SOUNDS.slice(0, Math.max(1, endIdx));
}

// Chuẩn hóa câu trả lời để so sánh (bỏ khoảng trắng, dấu ngoặc, chữ hoa)
function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/[\/,\s-]/g, '');
}

// Kiểm tra xem câu trả lời của học sinh có đúng không (hỗ trợ toàn diện alias c, k, ck)
function checkAnswerCorrect(userAns: string, accepted: string[]): boolean {
  const cleanUser = normalizeText(userAns);
  if (!cleanUser) return false;

  return accepted.some((acc) => {
    const cleanAcc = normalizeText(acc);
    if (cleanUser === cleanAcc) return true;
    // Xử lý biến thể âm /k/: c, k, ck (cùng chung 1 âm theo phản hồi của giáo viên)
    const kVariants = ['c', 'k', 'ck', 'c-k', 'c/k', 'k/c'];
    if (kVariants.includes(cleanAcc) && ['c', 'k', 'ck'].includes(cleanUser)) {
      return true;
    }
    return false;
  });
}

// Xây dựng các bài tập tách âm & chính tả chuẩn mực theo yêu cầu:
// - BẮT BUỘC chỉ lấy từ trong cuốn Jolly Phonics Word Book (WORDBANK_BY_SOUND) của âm hiện tại
// - Học tới âm nào thì chỉ giới hạn các âm và các từ chứa các âm đã học theo đúng thứ tự lũy tiến
// - NẾU KHÔNG ĐỦ TỪ HOẶC ÂM MÀ BỊ TRÙNG THÌ CHỈ DÙNG 1 LẦN DUY NHẤT (TUYỆT ĐỐI KHÔNG LẶP LẠI TỪ HAY ÂM)
function buildExercises(sound: PhonicsSound, level: BlendingLevelKey): SegmentingExercise[] {
  const learned = getLearnedSounds(sound);
  const rawWords = getWordBankForSound(sound.id, level);

  // Khử trùng lặp tuyệt đối danh sách từ vựng (mỗi từ chỉ xuất hiện 1 lần duy nhất)
  const uniqueWords = Array.from(new Set(rawWords.map((w) => w.toLowerCase().trim()).filter(Boolean)));

  // Chuẩn bị danh sách âm đã học làm lựa chọn nhiễu (chỉ giới hạn trong các âm đã học, không trùng)
  const learnedSoundKeys = Array.from(new Set(learned.map((s) => s.sound.split('/')[0].trim())));

  // Helper tạo các lựa chọn cho trắc nghiệm mặt chữ: chỉ lấy trong các âm đã học, không trùng
  const makePhonemeOptions = (correct: string): string[] => {
    const pool = learnedSoundKeys.filter((s) => normalizeText(s) !== normalizeText(correct));
    const shuffledPool = [...pool].sort(() => 0.5 - Math.random());
    const distractors = shuffledPool.slice(0, 3);
    const combined = [correct, ...distractors];
    return combined.sort(() => 0.5 - Math.random());
  };

  // Chọn tối đa 3 âm đơn lẻ KHÔNG TRÙNG LẶP từ các âm đã học (luôn bao gồm âm hiện tại)
  const otherLearned = learned.filter((s) => s.id !== sound.id);
  const shuffledOtherLearned = [...otherLearned].sort(() => 0.5 - Math.random());
  const uniqueSoundTargets = [sound, ...shuffledOtherLearned.slice(0, 2)].sort(() => 0.5 - Math.random());

  const exercises: SegmentingExercise[] = [];

  // =========================================================================
  // DẠNG BÀI CHO HỌC SINH 5-6 TUỔI (MẦM NON / TIỀN TIỂU HỌC - CHỈ CHỌN MẶT CHỮ / SỐ, KHÔNG GÕ XUỐNG)
  // =========================================================================
  if (level === 'age_5_6') {
    // PHẦN 1 (Tối đa 3 bài): Nghe âm đơn lẻ (mỗi âm chỉ xuất hiện 1 lần, không trùng lặp)
    for (let i = 0; i < uniqueSoundTargets.length; i++) {
      const target = uniqueSoundTargets[i];
      const correctKey = target.sound.split('/')[0].trim();
      const accepted = [target.sound, target.id, correctKey];
      if (['c-k', 'c', 'k', 'ck'].includes(target.id) || ['c', 'k', 'ck'].includes(correctKey)) {
        accepted.push('c', 'k', 'ck', 'c-k');
      }

      exercises.push({
        id: `ex_5_6_${exercises.length + 1}`,
        orderNumber: exercises.length + 1,
        title: `Bài ${exercises.length + 1}: Nghe Âm Đơn Lẻ (Chọn Thẻ Chữ)`,
        categoryKey: 'single_phoneme',
        categoryBadge: 'Âm Đơn Lẻ (Chọn Thẻ)',
        instruction: 'Bấm nút loa nghe âm thanh (không hiện mặt chữ), sau đó bấm chọn thẻ chữ cái đúng bên dưới nhé!',
        type: 'phoneme_mc',
        audioTarget: { kind: 'phoneme', phoneme: target.id },
        options: makePhonemeOptions(correctKey),
        correctAnswer: correctKey,
        acceptedAnswers: accepted,
        hint: target.id === sound.id ? `Đây chính là âm /${sound.sound}/ bé đang học đấy!` : 'Bé hãy lắng nghe kỹ âm thanh phát ra nhé.',
      });
    }

    // PHẦN 2 (Tối đa 3 bài): Đếm số âm vị (Phonemes) của từ trong Word Book
    // Mỗi từ chỉ dùng ĐÚNG 1 LẦN, có bao nhiêu từ thì tạo bấy nhiêu bài (tối đa 3 bài), tuyệt đối không lặp lại từ
    const countWords = uniqueWords.slice(0, 3);
    for (let i = 0; i < countWords.length; i++) {
      const word = countWords[i];
      const phonemes = parseWordToPhonemes(word);
      const count = phonemes.length;
      const numOptions = count <= 4 ? ['2', '3', '4', '5'] : ['3', '4', '5', '6'];

      exercises.push({
        id: `ex_5_6_${exercises.length + 1}`,
        orderNumber: exercises.length + 1,
        title: `Bài ${exercises.length + 1}: Đếm Số Âm Vị (Chọn Số)`,
        categoryKey: 'count_phonemes',
        categoryBadge: 'Đếm Số Âm Vị',
        instruction: 'Bấm nút loa nghe từ trong Word Book (không hiện mặt chữ), giơ từng ngón tay đếm xem từ có mấy âm vị và bấm chọn số bên dưới nhé!',
        type: 'count_phonemes',
        audioTarget: { kind: 'word_whole', word, phonemes },
        options: numOptions,
        correctAnswer: String(count),
        acceptedAnswers: [String(count)],
        hint: `Bé đếm lại nhé: từ "${word}" có ${count} âm vị tách rời (${phonemes.join(' - ')}).`,
      });
    }
  }

  // =========================================================================
  // DẠNG BÀI CHO HỌC SINH TRÊN 7 TUỔI (7-8 TUỔI & 9-10 TUỔI)
  // Từ vựng BẮT BUỘC lấy 100% từ danh sách Word Book của âm đang học.
  // Mỗi từ chỉ dùng ĐÚNG 1 LẦN DUY NHẤT xuyên suốt các bài tập (không bao giờ dùng % để lặp lại từ cũ).
  // =========================================================================
  else {
    // PHẦN 1 (Tối đa 3 bài): Các âm đơn lẻ chọn trong số các âm đã học (không trùng lặp âm)
    for (let i = 0; i < uniqueSoundTargets.length; i++) {
      const target = uniqueSoundTargets[i];
      const correctKey = target.sound.split('/')[0].trim();
      const accepted = [target.sound, target.id, correctKey];
      if (['c-k', 'c', 'k', 'ck'].includes(target.id) || ['c', 'k', 'ck'].includes(correctKey)) {
        accepted.push('c', 'k', 'ck', 'c-k');
      }

      exercises.push({
        id: `ex_older_${exercises.length + 1}`,
        orderNumber: exercises.length + 1,
        title: `Bài ${exercises.length + 1}: Nghe & Viết Âm Đơn Lẻ`,
        categoryKey: 'single_phoneme',
        categoryBadge: 'Âm Đơn Lẻ',
        instruction: 'Lắng nghe âm thanh phát ra (không hiện mặt chữ) và viết chính xác âm đó xuống ô bên dưới.',
        type: 'phoneme_input',
        audioTarget: { kind: 'phoneme', phoneme: target.id },
        correctAnswer: correctKey,
        acceptedAnswers: accepted,
        hint: target.id === sound.id ? `Gợi ý: Đây chính là âm /${sound.sound}/ bạn đang học.` : `Gợi ý: Âm này nằm trong nhóm các âm đã học từ trước đến nay.`,
      });
    }

    // Con trỏ lấy từ tuần tự từ uniqueWords để đảm bảo MỖI TỪ CHỈ DÙNG 1 LẦN DUY NHẤT
    let wordCursor = 0;

    // PHẦN 2 (Tối đa 3 bài): Đếm số âm vị (Phonemes) của từ trong Word Book (Mã màu Cam Hổ Phách - count_phonemes)
    const countWords = uniqueWords.slice(wordCursor, wordCursor + 3);
    wordCursor += countWords.length;

    for (let i = 0; i < countWords.length; i++) {
      const word = countWords[i];
      const phonemes = parseWordToPhonemes(word);
      const count = phonemes.length;
      const numOptions = count <= 4 ? ['2', '3', '4', '5'] : ['3', '4', '5', '6'];

      exercises.push({
        id: `ex_older_${exercises.length + 1}`,
        orderNumber: exercises.length + 1,
        title: `Bài ${exercises.length + 1}: Đếm Số Âm Vị (Phonemes)`,
        categoryKey: 'count_phonemes',
        categoryBadge: 'Đếm Số Âm Vị',
        instruction: 'Lắng nghe phát âm của từ trong Word Book (không hiện mặt chữ), tự giơ ngón tay đếm xem từ có mấy âm vị và bấm chọn số tương ứng bên dưới.',
        type: 'count_phonemes',
        audioTarget: { kind: 'word_whole', word, phonemes },
        options: numOptions,
        correctAnswer: String(count),
        acceptedAnswers: [String(count)],
        hint: `Tự đếm trên ngón tay: từ "${word}" gồm ${count} âm vị tách rời (${phonemes.join(' - ')}).`,
      });
    }

    // PHẦN 3 (Tối đa 2 bài): Đánh vần 1 từ trong Word Book và yêu cầu viết xuống từ đó (Mã màu Tím - segment_spelling)
    const spellWords = uniqueWords.slice(wordCursor, wordCursor + 2);
    wordCursor += spellWords.length;

    for (let i = 0; i < spellWords.length; i++) {
      const word = spellWords[i];
      const phonemes = parseWordToPhonemes(word);

      exercises.push({
        id: `ex_older_${exercises.length + 1}`,
        orderNumber: exercises.length + 1,
        title: `Bài ${exercises.length + 1}: Đánh Vần Từng Âm → Viết Từ`,
        categoryKey: 'segment_spelling',
        categoryBadge: 'Đánh Vần Từng Âm',
        instruction: 'Lắng nghe từng âm rời rạc được đọc chậm rãi, ghép các âm lại trong đầu và viết từ hoàn chỉnh xuống.',
        type: 'spell_to_word_input',
        audioTarget: { kind: 'word_spell', word, phonemes },
        correctAnswer: word,
        acceptedAnswers: [word],
        hint: `Từ này gồm ${phonemes.length} âm vị riêng biệt trong Word Book.`,
      });
    }

    // PHẦN 4 (Tối đa 2 bài): Đọc nguyên 1 từ trong Word Book và yêu cầu viết xuống từ đó (Mã màu Xanh Lục - whole_word_dictation)
    const wholeWords = uniqueWords.slice(wordCursor, wordCursor + 2);
    wordCursor += wholeWords.length;

    for (let i = 0; i < wholeWords.length; i++) {
      const word = wholeWords[i];
      const phonemes = parseWordToPhonemes(word);

      exercises.push({
        id: `ex_older_${exercises.length + 1}`,
        orderNumber: exercises.length + 1,
        title: `Bài ${exercises.length + 1}: Chính Tả Toàn Từ`,
        categoryKey: 'whole_word_dictation',
        categoryBadge: 'Chính Tả Toàn Từ',
        instruction: 'Lắng nghe phát âm chuẩn của toàn bộ từ trong Word Book và tự tách âm trong đầu để viết chính xác từ đó xuống.',
        type: 'whole_word_input',
        audioTarget: { kind: 'word_whole', word, phonemes },
        correctAnswer: word,
        acceptedAnswers: [word],
        hint: `Tự đếm số âm vị trên ngón tay để viết đúng chính tả từng con chữ nhé (${phonemes.length} âm vị).`,
      });
    }
  }

  return exercises;
}

export function SegmentingPracticeTab({ sound }: SegmentingPracticeTabProps) {
  // Lựa chọn độ tuổi
  const [selectedLevel, setSelectedLevel] = useState<BlendingLevelKey>('age_7_8');

  // Danh sách 10 bài tập
  const exercises = useMemo(() => {
    return buildExercises(sound, selectedLevel);
  }, [sound, selectedLevel]);

  // Bài tập đang làm (0-indexed: 0 đến 9)
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Câu trả lời của người dùng cho bài hiện tại
  const [userInput, setUserInput] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Trạng thái kiểm tra câu trả lời
  const [isAnswerChecked, setIsAnswerChecked] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [wrongAttempts, setWrongAttempts] = useState<number>(0);

  // Tiến độ hoàn thành bài tập (lưu id những bài đã đúng)
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());

  // Trạng thái âm thanh đang phát
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  // Đã hoàn thành toàn bộ 10 bài
  const [isAllCompleted, setIsAllCompleted] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const audioSequenceTimeoutRef = useRef<number | null>(null);

  const activeExercise = exercises[currentIndex] || exercises[0];
  const currentTheme = CATEGORY_THEMES[activeExercise.categoryKey];

  // Khi chuyển bài hoặc chuyển level, reset input và trạng thái
  useEffect(() => {
    setUserInput('');
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setWrongAttempts(0);
    stopSpeaking();
    if (audioSequenceTimeoutRef.current) {
      window.clearTimeout(audioSequenceTimeoutRef.current);
    }
    // Tự động focus vào ô nhập nếu là dạng bài gõ
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 150);
  }, [currentIndex, selectedLevel]);

  // Clean up audio timeout on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (audioSequenceTimeoutRef.current) {
        window.clearTimeout(audioSequenceTimeoutRef.current);
      }
    };
  }, []);

  // Đổi trình độ từ vựng
  const handleSelectLevel = (level: BlendingLevelKey) => {
    setSelectedLevel(level);
    setCurrentIndex(0);
    setCompletedExercises(new Set());
    setIsAllCompleted(false);
    stopSpeaking();
  };

  // PHÁT ÂM THANH THEO ĐÚNG DẠNG BÀI (KHÔNG HIỆN MẶT CHỮ)
  const handlePlayExerciseAudio = () => {
    if (!activeExercise) return;
    stopSpeaking();
    if (audioSequenceTimeoutRef.current) {
      window.clearTimeout(audioSequenceTimeoutRef.current);
      audioSequenceTimeoutRef.current = null;
    }

    setIsPlayingAudio(true);
    const target = activeExercise.audioTarget;

    // 1. Phát âm đơn lẻ
    if (target.kind === 'phoneme' && target.phoneme) {
      speakPhoneme(target.phoneme, () => {
        setIsPlayingAudio(false);
      }, 1.0);
    }
    // 2. Phát từ hoàn chỉnh (đối với đếm số âm vị hoặc chính tả nguyên từ)
    else if (target.kind === 'word_whole' && target.word) {
      speakWord(target.word, () => {
        setIsPlayingAudio(false);
      }, true); // suppressToast = true để không hiện chữ
    }
    // 3. Đánh vần từng âm rời rạc của từ
    else if (target.kind === 'word_spell' && target.phonemes) {
      const phs = target.phonemes;
      let idx = 0;
      const playNextPh = () => {
        if (idx < phs.length) {
          speakPhoneme(phs[idx], () => {
            idx++;
            audioSequenceTimeoutRef.current = window.setTimeout(playNextPh, 450);
          }, 0.95);
        } else {
          setIsPlayingAudio(false);
        }
      };
      playNextPh();
    }
    // 4. Đánh vần từng âm VÀ đọc cả từ (dành cho bé 5-6 tuổi chép chính tả)
    else if (target.kind === 'word_spell_and_whole' && target.word && target.phonemes) {
      const phs = target.phonemes;
      let idx = 0;
      const playNextPh = () => {
        if (idx < phs.length) {
          speakPhoneme(phs[idx], () => {
            idx++;
            audioSequenceTimeoutRef.current = window.setTimeout(playNextPh, 400);
          }, 1.0);
        } else {
          // Nghỉ 600ms rồi đọc nguyên từ
          audioSequenceTimeoutRef.current = window.setTimeout(() => {
            speakWord(target.word!, () => {
              setIsPlayingAudio(false);
            }, true);
          }, 600);
        }
      };
      playNextPh();
    } else {
      setIsPlayingAudio(false);
    }
  };

  // Tự động phát âm thanh khi chuyển sang bài mới
  useEffect(() => {
    const timer = setTimeout(() => {
      handlePlayExerciseAudio();
    }, 350);
    return () => clearTimeout(timer);
  }, [currentIndex, selectedLevel]);

  // KIỂM TRA ĐÁP ÁN (Hỗ trợ cả click nút số và nhập text)
  const handleCheckAnswer = (overrideValue?: string) => {
    if (!activeExercise) return;

    let userVal = overrideValue !== undefined ? overrideValue : userInput.trim();
    if ((activeExercise.type === 'phoneme_mc' || activeExercise.type === 'count_phonemes') && selectedOption && overrideValue === undefined) {
      userVal = selectedOption;
    }
    if (!userVal) return;

    const correct = checkAnswerCorrect(userVal, activeExercise.acceptedAnswers);
    setIsAnswerChecked(true);
    setIsCorrect(correct);

    if (correct) {
      try {
        playBlendSuccessChime();
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#10B981', '#3B82F6', '#F59E0B'],
        });
      } catch (_) {}

      const updated = new Set(completedExercises);
      updated.add(currentIndex);
      setCompletedExercises(updated);

      // Nếu đã hoàn thành bài 10 (tất cả 10 bài)
      if (updated.size === exercises.length) {
        setTimeout(() => {
          setIsAllCompleted(true);
          try {
            confetti({
              particleCount: 120,
              spread: 100,
              origin: { y: 0.5 },
            });
          } catch (_) {}
        }, 1200);
      }
    } else {
      setWrongAttempts((prev) => prev + 1);
    }
  };

  // Bấm chọn trực tiếp số âm vị (Bài 4-6)
  const handleSelectNumberOption = (numStr: string) => {
    if (isAnswerChecked && isCorrect) return;
    setSelectedOption(numStr);
    setIsAnswerChecked(false);
  };

  // Chuyển sang bài tiếp theo
  const handleNextExercise = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((curr) => curr + 1);
    } else {
      setIsAllCompleted(true);
    }
  };

  // Luyện tập lại từ đầu
  const handleRestart = () => {
    setCurrentIndex(0);
    setCompletedExercises(new Set());
    setIsAllCompleted(false);
    setUserInput('');
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setWrongAttempts(0);
  };

  return (
    <div className="flex flex-col gap-5 select-none">
      {/* HEADER & LỰA CHỌN TRÌNH ĐỘ TÁCH ÂM */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-surface-container border border-surface-container-high flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-black shadow-sm shrink-0">
            <span className="material-symbols-outlined text-xl">hearing</span>
          </div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm sm:text-base font-black text-on-surface uppercase tracking-wide">
              Luyện Tách Âm & Chính Tả – Âm /{sound.sound}/
            </h4>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/20 text-primary font-black">
              {exercises.length} Bài Tập
            </span>
          </div>
        </div>

        {/* Level Switcher */}
        <div className="flex items-center gap-1.5 bg-surface-container-high/60 p-1 rounded-xl border border-outline-variant/30">
          <button
            onClick={() => handleSelectLevel('age_5_6')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedLevel === 'age_5_6'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            5–6 tuổi
          </button>
          <button
            onClick={() => handleSelectLevel('age_7_8')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedLevel === 'age_7_8'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            7–8 tuổi
          </button>
          <button
            onClick={() => handleSelectLevel('age_9_10')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedLevel === 'age_9_10'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            9–10 tuổi
          </button>
        </div>
      </div>

      {/* THANH TIẾN TRÌNH 10 BÀI TẬP VỚI MÃ MÀU TRỰC QUAN */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
        {exercises.map((ex, idx) => {
          const isCurrent = idx === currentIndex;
          const isDone = completedExercises.has(idx);
          const theme = CATEGORY_THEMES[ex.categoryKey];

          return (
            <button
              key={ex.id}
              onClick={() => setCurrentIndex(idx)}
              className={`flex-1 min-w-[36px] sm:min-w-[44px] py-2 sm:py-2.5 rounded-2xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 cursor-pointer border-2 relative overflow-hidden ${
                isCurrent
                  ? `${theme.activeBtnBg} ring-4 ${theme.activeBtnRing} scale-105 shadow-md z-10`
                  : isDone
                  ? 'bg-emerald-500/15 text-emerald-800 border-emerald-400 font-bold hover:scale-102'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high border-surface-container hover:scale-102'
              }`}
            >
              {/* Dot mã màu nhóm bài */}
              <span
                className={`w-2 h-2 rounded-full transition-transform ${theme.dotBg} ${
                  isCurrent ? 'ring-2 ring-white scale-125' : ''
                }`}
                title={theme.name}
              />

              <div className="flex items-center gap-0.5">
                <span className="leading-none">{idx + 1}</span>
                {isDone && (
                  <span className="text-[10px] text-emerald-600 font-black leading-none">✓</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* GIAO DIỆN CHÍNH CỦA BÀI TẬP */}
      {!isAllCompleted ? (
        <div
          className={`bg-surface-container-low p-6 sm:p-8 rounded-3xl border-2 flex flex-col items-center gap-6 shadow-sm transition-all relative overflow-hidden`}
          style={{
            borderTopWidth: '6px',
            borderTopColor: currentTheme.hex,
          }}
        >
          {/* Badge & Title */}
          <div className="w-full flex items-center justify-between border-b border-surface-container pb-3.5">
            <div className="flex items-center gap-2">
              {/* Badge nhóm bài đồng nhất mã màu */}
              <span
                className={`text-xs font-black px-3.5 py-1.5 rounded-full flex items-center gap-1.5 border shadow-2xs ${currentTheme.badgeBg} ${currentTheme.badgeText} ${currentTheme.badgeBorder}`}
              >
                <span className="material-symbols-outlined text-sm">{currentTheme.icon}</span>
                <span>{activeExercise.categoryBadge}</span>
              </span>

              <span className="text-xs font-bold text-on-surface-variant hidden sm:inline-block">
                • {completedExercises.size}/{exercises.length} bài hoàn thành
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-surface-container text-on-surface">
                Bài {activeExercise.orderNumber} / {exercises.length}
              </span>
            </div>
          </div>

          {/* LỜI DẪN BÀI TẬP */}
          <div className="text-center max-w-lg">
            <h3 className="text-base sm:text-lg font-black text-on-surface">
              {activeExercise.title}
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1 leading-relaxed">
              {activeExercise.instruction}
            </p>
          </div>

          {/* KHUNG PHÁT ÂM THANH BÍ MẬT: NÚT LOA TO, KHÔNG HIỆN MẶT CHỮ */}
          <div className="w-full max-w-md p-6 rounded-3xl bg-white border-2 border-surface-container flex flex-col items-center justify-center gap-4 shadow-sm">
            <button
              onClick={handlePlayExerciseAudio}
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer transform active:scale-95 shadow-md ${
                isPlayingAudio
                  ? `${currentTheme.speakerBg} text-white ring-8 ${currentTheme.speakerRing} scale-105 animate-pulse`
                  : 'bg-primary text-on-primary hover:bg-primary-container hover:scale-105 hover:shadow-lg'
              }`}
              title="Bấm để nghe âm thanh"
            >
              <span className="material-symbols-outlined text-4xl sm:text-5xl">
                {isPlayingAudio ? 'volume_up' : 'play_arrow'}
              </span>
              <span className="text-[11px] font-bold mt-1">
                {isPlayingAudio ? 'Đang phát...' : 'Bấm nghe âm'}
              </span>
            </button>

            {/* Hiệu ứng sóng âm thanh mô phỏng & ẩn mặt chữ */}
            <div className="flex items-center gap-1.5 h-6">
              {[1, 2, 3, 4, 5].map((bar) => (
                <div
                  key={bar}
                  className={`w-1 rounded-full transition-all ${
                    isPlayingAudio
                      ? `${currentTheme.dotBg} animate-bounce h-5`
                      : 'bg-slate-300 h-2 opacity-50'
                  }`}
                  style={{ animationDelay: `${bar * 120}ms` }}
                />
              ))}
            </div>

            <span className="text-xs text-on-surface-variant font-medium text-center">
              🎧 Mặt chữ được giữ bí mật để bé tự vận dụng kỹ năng tách âm bằng đôi tai
            </span>
          </div>

          {/* PHẦN TRẢ LỜI CỦA HỌC SINH */}
          <div className="w-full max-w-md flex flex-col items-center gap-4">
            {/* DẠNG 1: BÀI 4-6: ĐẾM SỐ ÂM VỊ (CÓ CÁC LỰA CHỌN SỐ TO ĐỂ CHỌN LUÔN) */}
            {activeExercise.type === 'count_phonemes' && (
              <div className="w-full flex flex-col items-center gap-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 shadow-2xs">
                  <span className="material-symbols-outlined text-sm text-amber-600">pan_tool</span>
                  <span>Từ này có mấy âm vị? Bé hãy giơ ngón tay đếm và chọn số:</span>
                </div>

                <div className="grid grid-cols-4 gap-3 w-full">
                  {activeExercise.options?.map((numStr) => {
                    const isSelected = selectedOption === numStr;
                    const isAnsweredCorrect = isAnswerChecked && isCorrect && isSelected;
                    const isAnsweredWrong = isAnswerChecked && !isCorrect && isSelected;

                    return (
                      <button
                        key={numStr}
                        type="button"
                        onClick={() => handleSelectNumberOption(numStr)}
                        className={`py-4 sm:py-5 px-3 rounded-2xl font-black text-3xl sm:text-4xl transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer border-2 shadow-xs transform active:scale-95 ${
                          isAnsweredCorrect
                            ? 'bg-emerald-500 text-white border-emerald-600 ring-4 ring-emerald-300'
                            : isAnsweredWrong
                            ? 'bg-rose-500 text-white border-rose-600 ring-4 ring-rose-300'
                            : isSelected
                            ? 'bg-amber-500 text-white border-amber-600 ring-4 ring-amber-300/60 scale-105 shadow-md'
                            : 'bg-white hover:bg-amber-50/80 text-on-surface border-surface-container hover:border-amber-300 hover:scale-102'
                        }`}
                      >
                        <span className="leading-none">{numStr}</span>
                        <span className="text-[10px] uppercase font-bold opacity-75">âm</span>
                      </button>
                    );
                  })}
                </div>

                {/* Nút kiểm tra đáp án đếm số âm vị */}
                <button
                  type="button"
                  onClick={() => handleCheckAnswer()}
                  disabled={!selectedOption || (isAnswerChecked && isCorrect)}
                  className="w-full py-3.5 rounded-2xl text-white font-black text-sm transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed mt-1 bg-amber-500 hover:bg-amber-600"
                >
                  Kiểm Tra Số Âm Vị
                </button>

                {/* Khi trả lời ĐÚNG: Hiện ngay các âm vị tách rời để bé học hỏi */}
                {isAnswerChecked && isCorrect && activeExercise.audioTarget.phonemes && (
                  <div className="w-full p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col items-center gap-2.5 animate-in zoom-in-95">
                    <span className="text-xs font-black text-amber-900 uppercase tracking-wide">
                      🎉 {activeExercise.audioTarget.phonemes.length} Âm Vị Tách Rời Của Từ:
                    </span>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {activeExercise.audioTarget.phonemes.map((ph, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => speakPhoneme(ph)}
                          className="px-4 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 font-black text-lg shadow-xs hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5"
                          title="Bấm để nghe âm này"
                        >
                          <span>/{ph}/</span>
                          <span className="material-symbols-outlined text-xs text-amber-600">volume_up</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DẠNG 2: TRẮC NGHIỆM CHỌN MẶT CHỮ (BÀI 1-3 CHO BÉ 5-6 TUỔI) */}
            {activeExercise.type === 'phoneme_mc' && activeExercise.options && (
              <div className="w-full flex flex-col items-center gap-3">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Bấm chọn mặt chữ tương ứng:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                  {activeExercise.options.map((opt, i) => {
                    const isSelected = selectedOption === opt;
                    const isAnsweredCorrect = isAnswerChecked && isCorrect && isSelected;
                    const isAnsweredWrong = isAnswerChecked && !isCorrect && isSelected;

                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (isAnswerChecked && isCorrect) return;
                          setSelectedOption(opt);
                          setIsAnswerChecked(false);
                        }}
                        className={`py-4 px-3 rounded-2xl font-black text-2xl sm:text-3xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer border-2 shadow-xs ${
                          isAnsweredCorrect
                            ? 'bg-emerald-500 text-white border-emerald-600 ring-4 ring-emerald-300'
                            : isAnsweredWrong
                            ? 'bg-rose-500 text-white border-rose-600 ring-4 ring-rose-300'
                            : isSelected
                            ? `${currentTheme.badgeBg} ${currentTheme.badgeText} ${currentTheme.badgeBorder} ring-4 ${currentTheme.activeBtnRing} scale-105`
                            : 'bg-white hover:bg-surface-container text-on-surface border-surface-container hover:scale-102'
                        }`}
                      >
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => handleCheckAnswer()}
                  disabled={!selectedOption || (isAnswerChecked && isCorrect)}
                  className={`w-full py-3.5 rounded-2xl text-white font-black text-sm transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed mt-1 ${currentTheme.accentBg}`}
                >
                  Kiểm Tra Đáp Án
                </button>
              </div>
            )}

            {/* DẠNG 3: GÕ VÀO Ô NHẬP VĂN BẢN (CHÍNH TẢ BÀI 1-3 & 7-10) */}
            {activeExercise.type.endsWith('_input') && (
              <div className="w-full flex flex-col items-center gap-3">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Viết câu trả lời của bạn xuống đây:
                </label>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCheckAnswer();
                  }}
                  className="w-full flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={(e) => {
                      setUserInput(e.target.value);
                      setIsAnswerChecked(false);
                    }}
                    placeholder={
                      activeExercise.type.includes('phoneme')
                        ? 'Nhập âm bạn nghe được...'
                        : 'Viết từ hoàn chỉnh...'
                    }
                    disabled={isAnswerChecked && isCorrect}
                    className={`flex-1 bg-white border-2 rounded-2xl px-5 py-3.5 text-center font-black text-2xl sm:text-3xl tracking-wide focus:outline-none transition-all shadow-xs ${
                      isAnswerChecked && isCorrect
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800'
                        : isAnswerChecked && !isCorrect
                        ? 'border-rose-500 bg-rose-50/50 text-rose-800'
                        : `border-surface-container focus:border-current focus:ring-4 ${currentTheme.activeBtnRing} text-on-surface`
                    }`}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />

                  <button
                    type="submit"
                    disabled={!userInput.trim() || (isAnswerChecked && isCorrect)}
                    className={`px-5 py-4 rounded-2xl font-bold text-sm text-white transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ${currentTheme.accentBg}`}
                  >
                    Kiểm Tra
                  </button>
                </form>
              </div>
            )}

            {/* THÔNG BÁO KẾT QUẢ ĐÚNG / SAI */}
            {isAnswerChecked && (
              <div
                className={`w-full p-4 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
                  isCorrect
                    ? 'bg-emerald-500/15 border-2 border-emerald-500 text-emerald-900'
                    : 'bg-rose-500/15 border-2 border-rose-500 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-2xl">
                    {isCorrect ? 'check_circle' : 'cancel'}
                  </span>
                  <div>
                    <h5 className="font-black text-sm">
                      {isCorrect ? '🎉 Tuyệt vời! Chính xác!' : 'Chưa chính xác rồi bé ơi!'}
                    </h5>
                    <p className="text-xs opacity-80">
                      {isCorrect
                        ? activeExercise.type === 'count_phonemes'
                          ? `Từ này có đúng ${activeExercise.correctAnswer} âm vị!`
                          : `Đáp án đúng là: "${activeExercise.correctAnswer}"`
                        : wrongAttempts >= 2
                        ? `Gợi ý: ${activeExercise.hint}`
                        : 'Bé hãy bấm nút loa nghe lại thật kỹ và thử lại lần nữa nhé!'}
                    </p>
                  </div>
                </div>

                {isCorrect ? (
                  <button
                    onClick={handleNextExercise}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all cursor-pointer shadow-xs shrink-0 flex items-center gap-1"
                  >
                    <span>Bài tiếp</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                ) : (
                  <button
                    onClick={handlePlayExerciseAudio}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-all cursor-pointer shadow-xs shrink-0 flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">replay</span>
                    <span>Nghe lại</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* MÀN HÌNH HOÀN THÀNH TẤT CẢ CÁC BÀI TẬP */
        <div className="p-8 sm:p-12 rounded-3xl bg-surface-container-low border-2 border-emerald-400 flex flex-col items-center justify-center text-center gap-5 shadow-sm animate-in zoom-in-95">
          <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg animate-bounce">
            <span className="material-symbols-outlined text-5xl">military_tech</span>
          </div>

          <div>
            <h3 className="text-2xl font-black text-on-surface">
              Xuất Sắc! Bé Đã Hoàn Thành Trọn Vẹn {exercises.length} Bài Tách Âm!
            </h3>
            <p className="text-sm text-on-surface-variant max-w-md mt-1">
              Bé đã làm chủ kỹ năng đếm âm vị và chính tả cho âm /{sound.sound}/ theo chuẩn Jolly Phonics UK!
            </p>
          </div>

          <div className="flex items-center gap-6 p-4 rounded-2xl bg-white border border-surface-container shadow-xs">
            <div className="text-center">
              <span className="block text-2xl font-black text-emerald-600">
                {exercises.length}/{exercises.length}
              </span>
              <span className="text-[11px] text-on-surface-variant font-bold uppercase">
                Bài Hoàn Thành
              </span>
            </div>
            <div className="w-px h-8 bg-surface-container" />
            <div className="text-center">
              <span className="block text-2xl font-black text-amber-500">
                +{exercises.length} 💎
              </span>
              <span className="text-[11px] text-on-surface-variant font-bold uppercase">
                Kim Cương Thưởng
              </span>
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="px-8 py-3.5 rounded-2xl bg-primary text-on-primary font-black text-sm hover:bg-primary-container transition-all cursor-pointer shadow-md flex items-center gap-2 mt-2"
          >
            <span className="material-symbols-outlined text-lg">replay</span>
            <span>Luyện Tập Lại Vòng Mới</span>
          </button>
        </div>
      )}
    </div>
  );
}
