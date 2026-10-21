import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ALTERNATIVE_SPELLINGS_DATA,
  AlternativeSpellingTopic,
  AlternativeSpellingItem,
} from '../data/alternativeSpellingsData';
import {
  speakPhonicsSound,
  speakSentence,
  speakPhoneme,
  speakWholeWordAi,
  playBlendSuccessChime,
  stopSpeaking,
} from '../utils/audioPlayer';
import { getSyllableSplit } from '../utils/syllableHelper';
import {
  initVideoStorage,
  getLoadedAltSetVideos,
  saveAltSetVideo,
  deleteAltSetVideo,
  subscribeVideoUpdates,
  autoDistributeVideoBatch,
  LoadedVideoItem,
  VideoDistributionReport,
} from '../utils/videoStorage';

// ============================================================================
// BỘ PHÂN TÍCH PHONEME & HIỂN THỊ TRỰC QUAN CHO ÂM THAY THẾ (BAO GỒM MAGIC E)
// ============================================================================

export interface AltVisualUnit {
  type: 'single' | 'digraph' | 'split-digraph';
  text?: string;
  stepIndex?: number;
  phonemeAudio?: string;
  vowelChar?: string;
  midChar?: string;
  silentEChar?: string;
  vowelStepIndex?: number;
  midStepIndex?: number;
  vowelAudio?: string;
  midAudio?: string;
}

export interface ParsedAltWord {
  word: string;
  units: AltVisualUnit[];
  audioSteps: string[];
  flatPhonemesForSyllable: string[];
  unitEndPhonemeIndices: number[];
}

const SPLIT_DIGRAPH_WORDS_SET = new Set([
  // a_e
  'cake', 'bake', 'lake', 'make', 'rake', 'take', 'came', 'game', 'name', 'same',
  'gate', 'late', 'date', 'cave', 'save', 'wave', 'snake', 'shake', 'plate', 'skate',
  'spade', 'shade', 'grape', 'flame', 'pancake', 'cupcake', 'whale', 'phase', 'phrase',
  'face', 'lace', 'pace', 'race', 'space', 'place', 'age', 'cage', 'page', 'rage', 'sage', 'wage', 'stage',
  // e_e
  'eve', 'pete', 'steve', 'these', 'theme', 'gene', 'scene', 'complete', 'athlete',
  'extreme', 'concrete', 'delete', 'compete', 'stampede',
  // i_e
  'bike', 'like', 'hike', 'time', 'lime', 'line', 'mine', 'nine', 'fine', 'pine',
  'ride', 'hide', 'side', 'wide', 'kite', 'five', 'slide', 'smile', 'shine', 'spine',
  'drive', 'prize', 'bride', 'inside', 'sunshine', 'bedtime', 'white', 'while', 'whine',
  'ice', 'mice', 'nice', 'rice', 'dice', 'slice', 'price',
  // o_e
  'bone', 'cone', 'tone', 'home', 'dome', 'rope', 'hope', 'hole', 'mole', 'pole',
  'note', 'vote', 'rode', 'code', 'nose', 'rose', 'stone', 'throne', 'slope', 'globe',
  'smoke', 'spoke', 'broke', 'froze', 'tadpole', 'alone', 'phone',
  // u_e
  'cube', 'tube', 'tune', 'dune', 'june', 'use', 'fuse', 'cute', 'mute', 'mule',
  'flute', 'rule', 'fume', 'plume', 'chute', 'excuse', 'refuse', 'costume', 'perfume', 'compute', 'huge',
]);

// Các cụm đa chữ cái khớp ở mọi vị trí trong từ
const SPECIAL_MULTI_GRAPHEMES = [
  'igh', 'air', 'are', 'ear', 'eer', 'ere', 'dge', 'tch',
  'ay', 'ea', 'ew', 'ir', 'ur', 'oy', 'ow', 'au', 'aw', 'al',
  'ph', 'wh', 'sh', 'ch', 'th', 'qu', 'ng', 'ck',
  'ai', 'ee', 'ie', 'oa', 'ue', 'er', 'ar', 'or', 'ou', 'oi', 'oo',
  'll', 'ff', 'ss', 'zz', 'pp', 'nn', 'tt', 'dd', 'bb', 'rr', 'mm',
];

// Các cụm phụ âm + e câm chỉ khớp khi nằm ở CUỐI TỪ (vd: dance, fence, large, orange, nurse, circle)
const END_OF_WORD_SILENT_E_DIGRAPHS = ['ce', 'ge', 'se', 'ze', 've', 'le'];

function getPhonemeSoundForToken(token: string, altItemId: string, word: string, isLastToken: boolean): string {
  const t = token.toLowerCase();

  // Xử lý âm <ow>: đọc /oa/ hay /ou/ tùy theo nhóm âm
  if (t === 'ow') {
    if (altItemId === 'ow_oa') return 'ow_oa';
    if (altItemId === 'ow_ou') return 'ow_ou';
    const oaWords = new Set([
      'low', 'bow', 'mow', 'row', 'sow', 'tow', 'blow', 'crow', 'flow', 'glow',
      'slow', 'snow', 'show', 'grow', 'throw', 'bowl', 'yellow', 'pillow',
      'window', 'shadow', 'rainbow', 'elbow', 'snowman', 'snowball',
    ]);
    return oaWords.has(word) ? 'ow_oa' : 'ow_ou';
  }

  // Xử lý âm <y>: đọc /ee/ hay /ie/
  if (t === 'y') {
    if (isLastToken) {
      if (altItemId === 'y_ee') return 'y_ee';
      if (altItemId === 'y_ie') return 'y_ie';
      return word.length <= 3 || ['reply', 'supply', 'deny', 'rely', 'july'].includes(word) ? 'y_ie' : 'y_ee';
    }
    // <y> ở giữa từ: đọc /aɪ/ trong cycle, cyber; đọc /ɪ/ trong gym, gypsy, cymbal, cylinder
    if (['cycle', 'cyber', 'cyclone', 'cypress', 'pylon', 'python'].includes(word)) {
      return 'y_ie';
    }
    return 'i';
  }

  // Xử lý soft c / soft g
  if (t === 'c' && ['cy', 'ce', 'ci', 'soft_c'].includes(altItemId)) return 'soft_c';
  if (t === 'g' && ['gy', 'ge', 'gi', 'soft_g'].includes(altItemId)) return 'soft_g';

  return t;
}

function tokenizePlainSegment(segment: string, altItemId: string, fullWord: string, isAtWordEnd: boolean): { text: string; audio: string }[] {
  const res: { text: string; audio: string }[] = [];
  let i = 0;
  while (i < segment.length) {
    const rem = segment.length - i;
    let matched = '';

    // Ưu tiên khớp cụm 3 chữ cái -> 2 chữ cái
    if (rem >= 3) {
      const tri = segment.slice(i, i + 3);
      if (SPECIAL_MULTI_GRAPHEMES.includes(tri)) {
        matched = tri;
      }
    }
    if (!matched && rem >= 2) {
      const di = segment.slice(i, i + 2);
      const isAtEndOfFullWord = isAtWordEnd && i + 2 === segment.length;
      if (
        SPECIAL_MULTI_GRAPHEMES.includes(di) ||
        (isAtEndOfFullWord && END_OF_WORD_SILENT_E_DIGRAPHS.includes(di))
      ) {
        matched = di;
      }
    }

    if (matched) {
      const isLast = isAtWordEnd && i + matched.length === segment.length;
      res.push({
        text: matched,
        audio: getPhonemeSoundForToken(matched, altItemId, fullWord, isLast),
      });
      i += matched.length;
    } else {
      const ch = segment[i];
      const nextCh = segment[i + 1] || '';
      const isLast = isAtWordEnd && i + 1 === segment.length;
      let audio = getPhonemeSoundForToken(ch, altItemId, fullWord, isLast);

      // Tự động nhận diện soft c / soft g khi đứng trước e, i, y
      if (ch === 'c' && ['e', 'i', 'y'].includes(nextCh)) {
        audio = 'soft_c';
      } else if (
        ch === 'g' &&
        ['e', 'i', 'y'].includes(nextCh) &&
        (['gy', 'ge', 'gi', 'soft_g'].includes(altItemId) ||
          [
            'gem', 'gym', 'gypsy', 'energy', 'allergy', 'apology', 'biology', 'geology', 'prodigy', 'stingy', 'spongy',
            'giant', 'giraffe', 'ginger', 'magic', 'digit', 'logic', 'tragic', 'rigid', 'margin', 'engine',
            'orange', 'village', 'cage', 'page', 'stage', 'huge', 'large', 'barge', 'charge', 'age', 'rage', 'sage', 'wage',
          ].includes(fullWord))
      ) {
        audio = 'soft_g';
      } else if (ch === 'i' && ['icy', 'spicy', 'cider', 'giant'].includes(fullWord) && i <= 2) {
        audio = 'ie';
      } else if (ch === 'a' && ['lacy', 'racy'].includes(fullWord) && i === 1) {
        audio = 'ai';
      }

      res.push({ text: ch, audio });
      i += 1;
    }
  }
  return res;
}

export function parseAltWordToVisualUnits(rawWord: string, altItemId: string): ParsedAltWord {
  const clean = rawWord.toLowerCase().trim().replace(/[^a-z]/g, '');
  if (!clean) {
    return {
      word: '',
      units: [],
      audioSteps: [],
      flatPhonemesForSyllable: [],
      unitEndPhonemeIndices: [],
    };
  }

  const isSplitDigraph =
    SPLIT_DIGRAPH_WORDS_SET.has(clean) ||
    (['a_e', 'e_e', 'i_e', 'o_e', 'u_e'].includes(altItemId) &&
      clean.length >= 3 &&
      clean.endsWith('e') &&
      'aeiou'.includes(clean[clean.length - 3]) &&
      !'aeiou'.includes(clean[clean.length - 2]));

  const units: AltVisualUnit[] = [];
  const audioSteps: string[] = [];
  const flatPhonemesForSyllable: string[] = [];
  const unitEndPhonemeIndices: number[] = [];

  if (isSplitDigraph && clean.length >= 3) {
    const prefix = clean.slice(0, clean.length - 3);
    const vowelChar = clean[clean.length - 3];
    const midChar = clean[clean.length - 2];
    const silentEChar = 'e';

    const prefixTokens = tokenizePlainSegment(prefix, altItemId, clean, false);
    for (const tk of prefixTokens) {
      const stepIdx = audioSteps.length;
      audioSteps.push(tk.audio);
      flatPhonemesForSyllable.push(tk.text);
      units.push({
        type: tk.text.length >= 2 ? 'digraph' : 'single',
        text: tk.text,
        stepIndex: stepIdx,
        phonemeAudio: tk.audio,
      });
      unitEndPhonemeIndices.push(flatPhonemesForSyllable.length - 1);
    }

    const vowelMap: Record<string, string> = {
      a: 'a_e',
      e: 'e_e',
      i: 'i_e',
      o: 'o_e',
      u: 'u_e',
    };
    const vowelAudio = vowelMap[vowelChar] || 'ai';
    let midAudio = midChar;
    if (midChar === 'c') midAudio = 'soft_c';
    else if (midChar === 'g') midAudio = 'soft_g';
    else if (midChar === 's' && ['these', 'use', 'fuse', 'excuse', 'refuse', 'nose', 'rose', 'phase', 'phrase'].includes(clean)) {
      midAudio = 'z';
    }

    const vowelStepIndex = audioSteps.length;
    audioSteps.push(vowelAudio);
    const midStepIndex = audioSteps.length;
    audioSteps.push(midAudio);

    flatPhonemesForSyllable.push(`${vowelChar}${midChar}${silentEChar}`);
    units.push({
      type: 'split-digraph',
      vowelChar,
      midChar,
      silentEChar,
      vowelStepIndex,
      midStepIndex,
      vowelAudio,
      midAudio,
    });
    unitEndPhonemeIndices.push(flatPhonemesForSyllable.length - 1);
  } else {
    const tokens = tokenizePlainSegment(clean, altItemId, clean, true);
    for (const tk of tokens) {
      const stepIdx = audioSteps.length;
      audioSteps.push(tk.audio);
      flatPhonemesForSyllable.push(tk.text);
      units.push({
        type: tk.text.length >= 2 ? 'digraph' : 'single',
        text: tk.text,
        stepIndex: stepIdx,
        phonemeAudio: tk.audio,
      });
      unitEndPhonemeIndices.push(flatPhonemesForSyllable.length - 1);
    }
  }

  return {
    word: clean,
    units,
    audioSteps,
    flatPhonemesForSyllable,
    unitEndPhonemeIndices,
  };
}

function getWordSizeConfig(letterCount: number) {
  if (letterCount <= 4) {
    return {
      textSize: 'text-7xl sm:text-8xl md:text-9xl lg:text-[9.5rem]',
      gapClass: 'gap-4 sm:gap-6 md:gap-8',
      gapCss: 'clamp(1rem, 2.4vw, 1.75rem)',
      dotSize: 'w-5 h-5 sm:w-6 sm:h-6',
      digraphMinWidth: 'min-w-[52px] sm:min-w-[66px]',
      digraphHeight: 'h-3.5 sm:h-4',
      dotMarginTop: 'mt-4 sm:mt-6',
      dotContainerHeight: 'h-8',
    };
  }
  if (letterCount <= 6) {
    return {
      textSize: 'text-6xl sm:text-7xl md:text-8xl lg:text-[7.5rem]',
      gapClass: 'gap-3 sm:gap-4.5 md:gap-6',
      gapCss: 'clamp(0.8rem, 2vw, 1.4rem)',
      dotSize: 'w-4.5 h-4.5 sm:w-5.5 sm:h-5.5',
      digraphMinWidth: 'min-w-[42px] sm:min-w-[54px]',
      digraphHeight: 'h-3 sm:h-3.5',
      dotMarginTop: 'mt-3.5 sm:mt-5',
      dotContainerHeight: 'h-7',
    };
  }
  return {
    textSize: 'text-4xl sm:text-6xl md:text-7xl lg:text-[5.75rem]',
    gapClass: 'gap-2 sm:gap-3.5 md:gap-4.5',
    gapCss: 'clamp(0.6rem, 1.5vw, 1.1rem)',
    dotSize: 'w-4 h-4 sm:w-4.5 sm:h-4.5',
    digraphMinWidth: 'min-w-[32px] sm:min-w-[42px]',
    digraphHeight: 'h-2.5 sm:h-3',
    dotMarginTop: 'mt-3 sm:mt-4',
    dotContainerHeight: 'h-6',
  };
}

// ============================================================================
// MAIN SECTION COMPONENT: ĐÚNG Y HỆT 12 SET (GROUP 1 & GROUP 2)
// ============================================================================

interface AlternativeSpellingsSectionProps {
  hasPurchasedCourse?: boolean;
  onRequireCourseRegister?: () => void;
  onStudyAltSet?: (altSetTitle: string, label: string) => void;
}

export function AlternativeSpellingsSection({
  hasPurchasedCourse = false,
  onRequireCourseRegister,
  onStudyAltSet,
}: AlternativeSpellingsSectionProps = {}) {
  const [altVideosMap, setAltVideosMap] = useState<Record<string, LoadedVideoItem[]>>({});
  const [uploadingTopicId, setUploadingTopicId] = useState<string | null>(null);
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [isBannerDragOver, setIsBannerDragOver] = useState(false);
  const [batchReport, setBatchReport] = useState<VideoDistributionReport | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // State mở Modal Luyện Đánh Vần (Word Book) & Video cho từng Set Âm Thay Thế
  const [modalState, setModalState] = useState<{
    topic: AlternativeSpellingTopic;
    initialAltItemId?: string;
    initialWord?: string;
    openVideoDirectly?: boolean;
  } | null>(null);

  const singleFileInputRef = useRef<HTMLInputElement | null>(null);
  const batchFileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingUploadTargetRef = useRef<{
    topicId: string;
    mode: 'replace' | 'append';
    replaceIndex?: number;
  } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const refreshAllAltVideos = () => {
    const nextMap: Record<string, LoadedVideoItem[]> = {};
    for (const topic of ALTERNATIVE_SPELLINGS_DATA) {
      nextMap[topic.id] = getLoadedAltSetVideos(topic.id);
    }
    setAltVideosMap(nextMap);
  };

  useEffect(() => {
    let mounted = true;
    initVideoStorage().then(() => {
      if (mounted) refreshAllAltVideos();
    });

    const unsub = subscribeVideoUpdates(() => {
      if (mounted) refreshAllAltVideos();
    });

    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const handlePlaySound = (topic: AlternativeSpellingTopic, e: React.MouseEvent) => {
    e.stopPropagation();
    speakPhonicsSound(
      topic.rootSound,
      topic.ipa,
      topic.soundTitle,
      `Alternative spelling focus: ${topic.soundTitle}. Sound ${topic.ipa}`,
      undefined,
      topic.id
    );
  };

  const triggerSingleUpload = (
    topicId: string,
    mode: 'replace' | 'append' = 'replace',
    replaceIndex?: number
  ) => {
    pendingUploadTargetRef.current = { topicId, mode, replaceIndex };
    if (singleFileInputRef.current) {
      singleFileInputRef.current.value = '';
      singleFileInputRef.current.click();
    }
  };

  const handleSingleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const target = pendingUploadTargetRef.current;
    if (!files || files.length === 0 || !target) return;

    setUploadingTopicId(target.topicId);
    try {
      if (files.length === 1) {
        const file = files[0];
        await saveAltSetVideo(target.topicId, file, file.name, target.mode, target.replaceIndex);
        const topic = ALTERNATIVE_SPELLINGS_DATA.find((t) => t.id === target.topicId);
        showToast(`Đã lưu video cho Set /${topic?.soundTitle || target.topicId}/!`, 'success');
      } else {
        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          await saveAltSetVideo(
            target.topicId,
            f,
            f.name,
            i === 0 && target.mode === 'replace' ? 'replace' : 'append'
          );
        }
        const topic = ALTERNATIVE_SPELLINGS_DATA.find((t) => t.id === target.topicId);
        showToast(`Đã lưu ${files.length} video vào Set /${topic?.soundTitle || target.topicId}/!`, 'success');
      }
      refreshAllAltVideos();
    } catch (err) {
      console.error(err);
      showToast('Không thể lưu video. Vui lòng kiểm tra lại định dạng tệp!', 'error');
    } finally {
      setUploadingTopicId(null);
      pendingUploadTargetRef.current = null;
      e.target.value = '';
    }
  };

  const handleDropOnCard = async (topicId: string, droppedFiles: FileList) => {
    if (!droppedFiles || droppedFiles.length === 0) return;
    setUploadingTopicId(topicId);
    try {
      for (let i = 0; i < droppedFiles.length; i++) {
        const file = droppedFiles[i];
        if (!file.type.startsWith('video/') && !/\.(mp4|mov|webm|ogg|m4v|mkv)$/i.test(file.name)) {
          continue;
        }
        await saveAltSetVideo(topicId, file, file.name, i === 0 ? 'replace' : 'append');
      }
      refreshAllAltVideos();
      const topic = ALTERNATIVE_SPELLINGS_DATA.find((t) => t.id === topicId);
      showToast(`Đã tải video lên Set /${topic?.soundTitle || topicId}/!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi tải video!', 'error');
    } finally {
      setUploadingTopicId(null);
    }
  };

  const processBatchVideoFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsBatchUploading(true);
    try {
      const report = await autoDistributeVideoBatch(files, 'alt-only');
      refreshAllAltVideos();
      if (report.totalFiles > 0) {
        setBatchReport(report);
        showToast(
          `Đã tự động phân phối thành công ${report.totalFiles} video về chuẩn vị trí 12 Set Âm Thay Thế!`,
          'success'
        );
      } else {
        showToast('Không tìm thấy tệp định dạng video hợp lệ (.mp4, .mov, .webm).', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra khi phân phối kho video!', 'error');
    } finally {
      setIsBatchUploading(false);
    }
  };

  const handleBatchInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processBatchVideoFiles(e.target.files);
    }
    e.target.value = '';
  };

  const handleReassignFromReport = async (itemIndex: number, newTopicId: string) => {
    if (!batchReport) return;
    const item = batchReport.items[itemIndex];
    if (!item || item.targetId === newTopicId) return;

    const oldTopicId = item.targetId;
    try {
      const oldList = getLoadedAltSetVideos(oldTopicId);
      const oldIdx = oldList.findIndex((v) => v.fileName === item.fileName);
      if (oldIdx >= 0) {
        await deleteAltSetVideo(oldTopicId, oldIdx);
      }

      await saveAltSetVideo(newTopicId, item.file, item.file.name, 'append');
      const newTopic = ALTERNATIVE_SPELLINGS_DATA.find((t) => t.id === newTopicId);

      const updatedItems = [...batchReport.items];
      updatedItems[itemIndex] = {
        ...item,
        targetId: newTopicId,
        targetTitle: `Set Âm Thay Thế: /${newTopic?.soundTitle || newTopicId}/`,
        matchNote: 'Đã chuyển thủ công',
      };
      setBatchReport({ ...batchReport, items: updatedItems });
      refreshAllAltVideos();
      showToast(`Đã chuyển "${item.fileName}" sang Set /${newTopic?.soundTitle}/!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Không thể chuyển vị trí video!', 'error');
    }
  };

  const handleDeleteVideo = async (topic: AlternativeSpellingTopic, videoIndex?: number) => {
    const videos = altVideosMap[topic.id] || [];
    const label =
      typeof videoIndex === 'number' && videos.length > 1
        ? `video #${videoIndex + 1} của Set /${topic.soundTitle}/`
        : `video của Set /${topic.soundTitle}/`;
    if (!window.confirm(`Bạn có chắc muốn xóa ${label}?`)) return;

    await deleteAltSetVideo(topic.id, videoIndex);
    refreshAllAltVideos();
    showToast(`Đã xóa ${label}!`, 'success');
  };

  const [selectedAltGroup, setSelectedAltGroup] = useState<1 | 2 | 'all'>(1);

  const setsWithVideoCount = ALTERNATIVE_SPELLINGS_DATA.filter(
    (t) => (altVideosMap[t.id]?.length || 0) > 0
  ).length;
  const totalSetsCount = ALTERNATIVE_SPELLINGS_DATA.length;

  const group1Topics = ALTERNATIVE_SPELLINGS_DATA.filter((t) => t.group === 1);
  const group2Topics = ALTERNATIVE_SPELLINGS_DATA.filter((t) => t.group === 2);

  const renderGroupCard = (topic: AlternativeSpellingTopic, textColor: string) => {
    const videos = altVideosMap[topic.id] || [];
    const hasVideo = videos.length > 0;
    const isUploadingThis = uploadingTopicId === topic.id;
    const isTopicUnlocked =
      hasPurchasedCourse || topic.id === 'ai' || topic.id === 'ue';

    const handleOpenTopic = (initialAltItemId?: string, openVideoDirectly = true) => {
      if (!isTopicUnlocked) {
        onRequireCourseRegister?.();
        return;
      }
      onStudyAltSet?.(
        topic.soundTitle,
        `Magic Sounds: Set Âm thay thế /${topic.soundTitle}/`
      );
      setModalState({
        topic,
        initialAltItemId: initialAltItemId || topic.items[0]?.id,
        openVideoDirectly,
      });
    };

    return (
      <div
        key={topic.id}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleDropOnCard(topic.id, e.dataTransfer.files);
          }
        }}
        onClick={() => handleOpenTopic(topic.items[0]?.id, true)}
        className="relative bg-white rounded-2xl border border-stone-200/80 border-b-[6px] border-b-[#bcbcbc] hover:border-b-[#a3a3a3] active:border-b-[3px] active:translate-y-[2px] p-3.5 flex flex-col items-center justify-between cursor-pointer select-none transition-all shadow-2xs hover:shadow-md group"
      >
        {/* Hàng trên: Nút Loa nghe âm gốc & Nút Video */}
        <div className="w-full flex items-center justify-between gap-1">
          <button
            type="button"
            onClick={(e) => {
              if (!isTopicUnlocked) {
                e.stopPropagation();
                onRequireCourseRegister?.();
                return;
              }
              handlePlaySound(topic, e);
            }}
            className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-all cursor-pointer shrink-0"
            title={isTopicUnlocked ? `Nghe phát âm /${topic.soundTitle}/` : 'Bấm để đăng ký mở khoá'}
          >
            <span className="material-symbols-outlined text-[15px]">
              {isTopicUnlocked ? 'volume_up' : 'lock'}
            </span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!isTopicUnlocked) {
                onRequireCourseRegister?.();
                return;
              }
              if (hasVideo) {
                setModalState({
                  topic,
                  initialAltItemId: topic.items[0]?.id,
                  openVideoDirectly: true,
                });
              } else {
                triggerSingleUpload(topic.id, 'replace');
              }
            }}
            className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer ${
              hasVideo
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
            }`}
            title={hasVideo ? `Xem video Set /${topic.soundTitle}/` : `Tải video lên cho Set /${topic.soundTitle}/`}
          >
            {isUploadingThis ? (
              <span className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined text-[13px]">
                  {hasVideo ? 'smart_display' : 'video_call'}
                </span>
                <span>{hasVideo ? `Video (${videos.length})` : 'Video'}</span>
              </>
            )}
          </button>
        </div>

        {/* Chữ Âm Chính Giữa Gọn Rõ */}
        <span
          className="text-3xl sm:text-4xl font-black leading-none tracking-tight my-2.5 group-hover:scale-105 transition-transform"
          style={{ color: textColor }}
        >
          {topic.soundTitle}
        </span>

        {/* Các âm thay thế bên trong Set */}
        <div className="flex flex-wrap items-center justify-center gap-1">
          {topic.items.map((it) => (
            <span
              key={it.id}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenTopic(it.id, false);
              }}
              className="px-2 py-0.5 rounded-lg text-xs font-black border transition-all hover:scale-105"
              style={{
                backgroundColor: `${textColor}14`,
                color: textColor,
                borderColor: `${textColor}35`,
              }}
            >
              {it.displayGrapheme}
            </span>
          ))}
        </div>

        {/* Nút Học âm */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenTopic(topic.items[0]?.id, true);
          }}
          className="mt-2.5 w-full py-1.5 rounded-xl bg-stone-100 hover:bg-primary hover:text-on-primary text-stone-800 text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer group-hover:bg-primary group-hover:text-on-primary"
        >
          {!isTopicUnlocked && (
            <span className="material-symbols-outlined text-[13px]">lock</span>
          )}
          <span>Học âm</span>
          {isTopicUnlocked && (
            <span className="material-symbols-outlined text-[14px]">
              arrow_forward
            </span>
          )}
        </button>
      </div>
    );
  };

  return (
    <section className="w-full py-5 bg-[#f5f3ef] rounded-3xl px-4 sm:px-6 border border-stone-200/80" id="am-thay-the">
      {/* Hidden File Inputs */}
      <input
        ref={singleFileInputRef}
        type="file"
        multiple
        accept="video/mp4,video/quicktime,video/webm,video/ogg,video/*"
        onChange={handleSingleFileChange}
        className="hidden"
      />
      <input
        ref={batchFileInputRef}
        type="file"
        multiple
        accept="video/mp4,video/quicktime,video/webm,video/ogg,video/*"
        onChange={handleBatchInputChange}
        className="hidden"
      />

      <div className="w-full space-y-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e13829] text-white font-black text-base sm:text-lg shadow-[0_3px_0_#991b1b]">
              <span className="material-symbols-outlined text-lg">
                swap_horiz
              </span>
              <span>Alternatives: Âm thay thế</span>
            </h2>
          </div>
        </div>

        {/* Thanh chuyển nhanh Group 1 / Group 2 / Xem cả 12 Set */}
        <div className="bg-white/80 p-2 rounded-2xl border border-stone-200/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedAltGroup(1)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 border ${
                selectedAltGroup === 1
                  ? 'bg-[#DF413E] text-white border-[#DF413E] shadow-xs scale-[1.02]'
                  : 'bg-white text-on-surface hover:bg-stone-100 border-stone-200'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: selectedAltGroup === 1 ? '#ffffff' : '#DF413E' }}
              />
              <span>Group 1:</span>
              <span className={selectedAltGroup === 1 ? 'text-white/95 font-bold' : 'text-on-surface-variant font-semibold'}>
                ai, ue, oa, oi, ie, or
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!hasPurchasedCourse) {
                  onRequireCourseRegister?.();
                  return;
                }
                setSelectedAltGroup(2);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 border ${
                selectedAltGroup === 2
                  ? 'bg-[#9F4BE3] text-white border-[#9F4BE3] shadow-xs scale-[1.02]'
                  : 'bg-white text-on-surface hover:bg-stone-100 border-stone-200'
              }`}
            >
              {!hasPurchasedCourse ? (
                <span className="material-symbols-outlined text-[13px] text-stone-500">
                  lock
                </span>
              ) : (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: selectedAltGroup === 2 ? '#ffffff' : '#9F4BE3' }}
                />
              )}
              <span>Group 2:</span>
              <span className={selectedAltGroup === 2 ? 'text-white/95 font-bold' : 'text-on-surface-variant font-semibold'}>
                s, ou, j, ee, er, f
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!hasPurchasedCourse) {
                onRequireCourseRegister?.();
                return;
              }
              setSelectedAltGroup(selectedAltGroup === 'all' ? 1 : 'all');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 border ${
              selectedAltGroup === 'all'
                ? 'bg-primary text-on-primary border-primary shadow-xs'
                : 'bg-white text-primary border-primary/30 hover:bg-primary/5'
            }`}
          >
            {!hasPurchasedCourse && (
              <span className="material-symbols-outlined text-[14px]">lock</span>
            )}
            <span className="material-symbols-outlined text-[16px]">
              {selectedAltGroup === 'all' ? 'view_carousel' : 'grid_view'}
            </span>
            <span>
              {selectedAltGroup === 'all' ? 'Xem theo từng nhóm' : 'Xem cả 12 Set'}
            </span>
          </button>
        </div>

        {/* Toast thông báo */}
        {toast && (
          <div
            className={`p-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-200 ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                : 'bg-red-50 text-red-900 border border-red-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">
                {toast.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span>{toast.msg}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        )}

        {/* Bảng kết quả phân phối tự động */}
        {batchReport && batchReport.items.length > 0 && (
          <div className="bg-white p-4 rounded-3xl border-2 border-emerald-400/60 shadow-md space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-xl">auto_awesome</span>
                <h3 className="text-xs sm:text-sm font-black text-on-surface">
                  Đã tự động phân phối {batchReport.totalFiles} video về 12 Set:
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBatchReport(null)}
                className="px-3 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 cursor-pointer"
              >
                Thu gọn
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {batchReport.items.map((it, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="material-symbols-outlined text-sm text-primary shrink-0">movie</span>
                    <span className="font-bold text-on-surface truncate" title={it.fileName}>
                      {it.fileName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] text-emerald-700 font-semibold truncate">
                      {it.matchNote}
                    </span>
                    <select
                      value={it.targetId}
                      onChange={(e) => handleReassignFromReport(idx, e.target.value)}
                      className="px-2 py-1 rounded-lg bg-white border border-stone-300 font-bold text-[11px] text-primary cursor-pointer outline-none"
                    >
                      {ALTERNATIVE_SPELLINGS_DATA.map((t, i) => (
                        <option key={t.id} value={t.id}>
                          Set {i + 1} (Group {t.group}): {t.soundTitle}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HIỂN THỊ GỌN 6 THẺ TRÊN 1 HÀNG CHO GROUP ĐANG CHỌN (HOẶC CẢ 2 GROUP KHI CHỌN XEM CẢ 12 SET) */}
        <div className="space-y-4">
          {(selectedAltGroup === 1 || selectedAltGroup === 'all') && (
            <div className="bg-white/60 rounded-3xl p-4 border border-stone-200/80">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {group1Topics.map((topic) => renderGroupCard(topic, '#DF413E'))}
              </div>
            </div>
          )}

          {(selectedAltGroup === 2 || selectedAltGroup === 'all') && (
            <div className="bg-white/60 rounded-3xl p-4 border border-stone-200/80">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {group2Topics.map((topic) => renderGroupCard(topic, '#9F4BE3'))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL CHI TIẾT TỪNG SET TRONG 12 SET ALTERNATIVES */}
      {modalState && (
        <AlternativeSpellingDetailModal
          topic={modalState.topic}
          initialAltItemId={modalState.initialAltItemId}
          initialWord={modalState.initialWord}
          openVideoDirectly={modalState.openVideoDirectly}
          videos={altVideosMap[modalState.topic.id] || []}
          onClose={() => {
            stopSpeaking();
            setModalState(null);
          }}
          onUploadReplace={(idx) => triggerSingleUpload(modalState.topic.id, 'replace', idx)}
          onUploadAdd={() => triggerSingleUpload(modalState.topic.id, 'append')}
          onDeleteVideo={(idx) => handleDeleteVideo(modalState.topic, idx)}
        />
      )}
    </section>
  );
}

// ============================================================================
// MODAL CHI TIẾT: HIỂN THỊ ÂM GỐC -> CÁC ÂM THAY THẾ CHUẨN -> 10 TỪ WORDBOOK
// ============================================================================

interface AlternativeSpellingDetailModalProps {
  topic: AlternativeSpellingTopic;
  initialAltItemId?: string;
  initialWord?: string;
  openVideoDirectly?: boolean;
  videos: LoadedVideoItem[];
  onClose: () => void;
  onUploadReplace: (idx: number) => void;
  onUploadAdd: () => void;
  onDeleteVideo: (idx: number) => void;
}

function AlternativeSpellingDetailModal({
  topic,
  initialAltItemId,
  initialWord,
  openVideoDirectly = true,
  videos,
  onClose,
  onUploadReplace,
  onUploadAdd,
  onDeleteVideo,
}: AlternativeSpellingDetailModalProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>(
    initialAltItemId || topic.items[0]?.id || ''
  );

  // Danh sách 10 từ chuẩn 7-8 tuổi của âm thay thế đang chọn
  const [wordsList, setWordsList] = useState<string[]>([]);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(0);

  // Thêm từ tùy chỉnh
  const [isAddingWord, setIsAddingWord] = useState<boolean>(false);
  const [newWordInput, setNewWordInput] = useState<string>('');

  // Trạng thái Đánh Vần Tương Tác (Auto-Blend)
  const [activeAudioStepIndex, setActiveAudioStepIndex] = useState<number | null>(null);
  const [isBlendingWholeWord, setIsBlendingWholeWord] = useState<boolean>(false);
  const [isAutoBlending, setIsAutoBlending] = useState<boolean>(false);
  const [isSlashRevealed, setIsSlashRevealed] = useState<boolean>(false);

  // Trạng thái khung Video Bài Học Set Âm (Mặc định hiện luôn video âm chủ khi mở vào)
  const [showVideoSection, setShowVideoSection] = useState<boolean>(openVideoDirectly);
  const [activeVideoIdx, setActiveVideoIdx] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const autoBlendTimeoutRef = useRef<number | null>(null);

  const activeAltItem: AlternativeSpellingItem =
    topic.items.find((it) => it.id === selectedItemId) || topic.items[0];

  useEffect(() => {
    if (!activeAltItem) return;

    const targetWords = activeAltItem.words || [];
    setWordsList([...targetWords]);

    if (initialWord && activeAltItem.id === initialAltItemId) {
      const cleanInit = initialWord.toLowerCase().trim();
      const foundIdx = targetWords.indexOf(cleanInit);
      setSelectedWordIndex(foundIdx >= 0 ? foundIdx : 0);
    } else {
      setSelectedWordIndex(0);
    }

    setActiveAudioStepIndex(null);
    setIsBlendingWholeWord(false);
    setIsAutoBlending(false);
    setIsSlashRevealed(false);
    stopSpeaking();
  }, [selectedItemId]);

  useEffect(() => {
    return () => {
      if (autoBlendTimeoutRef.current) {
        window.clearTimeout(autoBlendTimeoutRef.current);
      }
      stopSpeaking();
    };
  }, []);

  const currentWordStr = wordsList[selectedWordIndex] || wordsList[0] || '';
  const parsedWord = parseAltWordToVisualUnits(currentWordStr, activeAltItem?.id || '');
  const syllableSplit = currentWordStr
    ? getSyllableSplit(currentWordStr, parsedWord.flatPhonemesForSyllable)
    : null;
  const sizeConfig = getWordSizeConfig(currentWordStr.length);

  // Chạy đánh vần tự động từng âm -> đọc cả từ + pháo hoa
  const handleRunAutoBlend = () => {
    if (!parsedWord.word || parsedWord.audioSteps.length === 0) return;

    if (autoBlendTimeoutRef.current) {
      window.clearTimeout(autoBlendTimeoutRef.current);
      autoBlendTimeoutRef.current = null;
    }
    stopSpeaking();

    setIsAutoBlending(true);
    setIsBlendingWholeWord(false);
    setIsSlashRevealed(false);

    const steps = parsedWord.audioSteps;
    const totalSteps = steps.length;
    let idx = 0;

    const playWholeWordNow = () => {
      setActiveAudioStepIndex(null);
      setIsBlendingWholeWord(true);
      if (syllableSplit) {
        setIsSlashRevealed(true);
      }

      speakWholeWordAi(
        parsedWord.word,
        () => {
          try {
            confetti({
              particleCount: 85,
              spread: 95,
              origin: { y: 0.6 },
              colors: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
            });
            playBlendSuccessChime();
          } catch (_) {}

          autoBlendTimeoutRef.current = window.setTimeout(() => {
            setIsAutoBlending(false);
            setIsBlendingWholeWord(false);
          }, 1200);
        },
        false,
        1.0
      );
    };

    const playNextStep = () => {
      if (idx < totalSteps) {
        setActiveAudioStepIndex(idx);
        setIsBlendingWholeWord(false);

        const phonemeAudioKey = steps[idx];
        let advanced = false;

        const advance = () => {
          if (advanced) return;
          advanced = true;
          if (watchdogTimer) {
            window.clearTimeout(watchdogTimer);
          }
          idx++;
          if (idx < totalSteps) {
            playNextStep();
          } else {
            playWholeWordNow();
          }
        };

        const watchdogTimer = window.setTimeout(advance, 2400);

        speakPhoneme(
          phonemeAudioKey,
          () => {
            advance();
          },
          1.0,
          undefined,
          true
        );
      } else {
        playWholeWordNow();
      }
    };

    playNextStep();
  };

  const handleAddNewWord = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newWordInput.trim().toLowerCase().replace(/[^a-z]/g, '');
    if (!clean) return;
    const updated = [...wordsList, clean];
    setWordsList(updated);
    setSelectedWordIndex(updated.length - 1);
    setNewWordInput('');
    setIsAddingWord(false);
  };

  const handleResetStandardWords = () => {
    const standard = activeAltItem?.words || [];
    setWordsList([...standard]);
    setSelectedWordIndex(0);
    setActiveAudioStepIndex(null);
    setIsBlendingWholeWord(false);
    setIsSlashRevealed(false);
    stopSpeaking();
  };

  const safeVideoIdx = Math.min(activeVideoIdx, Math.max(0, videos.length - 1));
  const currentVideo = videos[safeVideoIdx];

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in">
      <div className="bg-[#f5f3ef] max-w-3xl w-full rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-stone-200 flex flex-col gap-5 max-h-[94vh] overflow-y-auto relative">
        {/* Nút đóng & Nút Video ở góc trên */}
        <div className="flex items-center justify-between">
          <span
            className="px-4 py-1.5 rounded-full text-white font-black text-xs sm:text-sm"
            style={{ backgroundColor: topic.color }}
          >
            Group {topic.group} • Alternatives
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowVideoSection((prev) => !prev)}
              className={`py-2 px-3.5 rounded-2xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                showVideoSection
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-white hover:bg-stone-100 text-primary border border-stone-300'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">smart_display</span>
              <span>
                {showVideoSection
                  ? 'Quay Lại Đánh Vần'
                  : `Video Học Set /${topic.soundTitle}/ (${videos.length > 0 ? videos.length : 'Tải lên'})`}
              </span>
            </button>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white hover:bg-stone-200 flex items-center justify-center text-stone-600 hover:text-stone-900 cursor-pointer border border-stone-300"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>
        </div>

        {/* SƠ ĐỒ ÂM GỐC (TRÊN) VÀ CÁC ÂM THAY THẾ CHUẨN (DƯỚI) ĐÚNG Y HỆT ẢNH MẪU */}
        <div className="flex flex-col items-center gap-4 py-1">
          {/* Ô Âm Gốc ở trên (Màu Đỏ cho Group 1 / Màu Tím cho Group 2) -> Bấm vào hiện luôn Video Âm Chủ + phát âm */}
          <button
            type="button"
            onClick={() => {
              setShowVideoSection(true);
              speakPhonicsSound(
                topic.rootSound,
                topic.ipa,
                topic.soundTitle,
                `Sound ${topic.soundTitle}`,
                undefined,
                topic.id
              );
            }}
            className={`min-w-[160px] sm:min-w-[200px] py-4 px-8 rounded-[28px] text-white font-black text-5xl sm:text-6xl flex items-center justify-center shadow-md border-b-[8px] border-black/20 active:translate-y-[2px] transition-all cursor-pointer ${
              showVideoSection ? 'scale-105 ring-4 ring-black/15' : 'opacity-90 hover:opacity-100'
            }`}
            style={{ backgroundColor: topic.color }}
            title={`Xem video & nghe âm chủ /${topic.soundTitle}/`}
          >
            {topic.soundTitle}
          </button>

          {/* Hàng các Ô Âm Thay Thế ở dưới (Nền trắng 3D, chữ màu theo Group) */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 w-full">
            {topic.items.map((item) => {
              const isSelected = item.id === activeAltItem?.id && !showVideoSection;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedItemId(item.id);
                    setShowVideoSection(false);
                    speakPhoneme(item.id);
                  }}
                  className={`min-w-[125px] sm:min-w-[155px] py-4 px-6 rounded-[28px] bg-white font-black text-4xl sm:text-5xl flex items-center justify-center transition-all cursor-pointer border-2 border-b-[8px] ${
                    isSelected
                      ? 'scale-105 shadow-lg ring-4'
                      : 'border-stone-200 border-b-[#bcbcbc] opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    color: topic.color,
                    borderColor: isSelected ? topic.color : undefined,
                    borderBottomColor: isSelected ? topic.color : '#bcbcbc',
                    ['--tw-ring-color' as any]: `${topic.color}30`,
                  }}
                >
                  {item.displayGrapheme}
                </button>
              );
            })}
          </div>
        </div>

        {/* NẾU ĐANG MỞ KHUNG VIDEO BÀI HỌC SET ÂM */}
        {showVideoSection ? (
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 space-y-3 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">smart_display</span>
                <span className="text-xs sm:text-sm font-black text-on-surface">
                  Video Học Set Âm /{topic.soundTitle}/
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onUploadAdd}
                  className="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-primary/90"
                >
                  <span className="material-symbols-outlined text-sm">upload</span>
                  <span>{currentVideo ? 'Thêm Video Vào Set' : 'Tải Video Lên'}</span>
                </button>
                {currentVideo && (
                  <>
                    <button
                      type="button"
                      onClick={() => onUploadReplace(safeVideoIdx)}
                      className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-on-surface text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      <span>Đổi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteVideo(safeVideoIdx)}
                      className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      <span>Xóa</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {videos.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {videos.map((v, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveVideoIdx(idx)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      safeVideoIdx === idx
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-stone-100 text-on-surface-variant hover:bg-stone-200'
                    }`}
                  >
                    {v.label || v.fileName || `Video ${idx + 1}`}
                  </button>
                ))}
              </div>
            )}

            {currentVideo ? (
              <div className="space-y-2">
                <div className="w-full aspect-video max-h-[360px] bg-black rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
                  <video
                    ref={videoRef}
                    key={currentVideo.playUrl}
                    src={currentVideo.playUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                        videoRef.current.play();
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">replay</span>
                    <span>Xem lại từ đầu</span>
                  </button>

                  <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => handleRateChange(1.0)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                        playbackRate === 1.0 ? 'bg-primary text-white' : 'text-on-surface'
                      }`}
                    >
                      1.0x
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRateChange(0.75)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                        playbackRate === 0.75 ? 'bg-primary text-white' : 'text-on-surface'
                      }`}
                    >
                      0.75x Chậm
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={onUploadAdd}
                className="w-full h-48 rounded-2xl border-2 border-dashed border-stone-300 hover:border-primary bg-stone-50 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-3xl text-primary">upload_file</span>
                <span className="text-xs sm:text-sm font-bold text-on-surface">
                  Chưa có video cho Set /{topic.soundTitle}/ — Bấm để tải video lên
                </span>
              </div>
            )}
          </div>
        ) : (
          /* GIAO DIỆN 10 TỪ ĐÁNH VẦN CHUẨN WORDBOOK CỦA ÂM THAY THẾ ĐANG CHỌN */
          activeAltItem && (
            <div className="flex flex-col gap-4 animate-in fade-in">
              {/* Thanh tiêu đề 10 từ & Nạp từ mới */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-on-surface uppercase tracking-wider">
                    10 Từ Đánh Vần Âm &lt;{activeAltItem.displayGrapheme}&gt;:
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetStandardWords}
                    className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-on-surface text-xs font-bold hover:bg-stone-100 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm text-primary">restart_alt</span>
                    <span>10 Từ Chuẩn</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingWord((prev) => !prev)}
                    className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    <span>Thêm Từ</span>
                  </button>
                </div>
              </div>

              {/* 10 Từ Vựng Selector Pills */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {wordsList.map((w, idx) => {
                  const isSelected = idx === selectedWordIndex;
                  return (
                    <button
                      key={`${w}_${idx}`}
                      type="button"
                      onClick={() => {
                        setSelectedWordIndex(idx);
                        setActiveAudioStepIndex(null);
                        setIsBlendingWholeWord(false);
                        setIsSlashRevealed(false);
                        stopSpeaking();
                      }}
                      className={`py-2 px-1.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center cursor-pointer border ${
                        isSelected
                          ? 'text-white shadow-sm scale-105'
                          : 'bg-white hover:bg-stone-100 text-on-surface border-stone-300'
                      }`}
                      style={
                        isSelected
                          ? { backgroundColor: topic.color, borderColor: topic.color }
                          : undefined
                      }
                    >
                      <span className="truncate">{w}</span>
                    </button>
                  );
                })}
              </div>

              {/* Form nạp từ mới */}
              {isAddingWord && (
                <form
                  onSubmit={handleAddNewWord}
                  className="p-3.5 rounded-2xl bg-white border border-stone-300 flex items-center gap-3 animate-in fade-in"
                >
                  <input
                    type="text"
                    value={newWordInput}
                    onChange={(e) => setNewWordInput(e.target.value)}
                    placeholder={`Nhập từ có chứa <${activeAltItem.grapheme}>...`}
                    className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm font-bold focus:outline-none focus:border-primary"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold cursor-pointer"
                  >
                    Lưu Từ
                  </button>
                </form>
              )}

              {/* BẢNG CHỮ TO TƯƠNG TÁC ĐỂ ĐÁNH VẦN TỪNG TỪ */}
              {parsedWord.word && (
                <div
                  onClick={handleRunAutoBlend}
                  className={`w-full bg-white rounded-3xl p-5 sm:p-9 border-2 border-b-[8px] transition-all relative overflow-hidden select-none cursor-pointer transform active:scale-[0.99] flex flex-col items-center justify-center ${
                    isBlendingWholeWord
                      ? 'border-emerald-500 border-b-emerald-600 shadow-2xl ring-4 ring-emerald-300/60 bg-gradient-to-b from-emerald-50/40 via-white to-white'
                      : isAutoBlending
                      ? 'border-primary border-b-primary shadow-xl ring-4 ring-primary/25 bg-gradient-to-b from-rose-50/30 via-white to-white'
                      : 'border-stone-200 border-b-[#bcbcbc] shadow-xs hover:border-stone-300 hover:shadow-md'
                  }`}
                  title="Bấm vào chữ để đánh vần từng âm rồi đọc nguyên từ"
                >
                  <div className="w-full flex items-center justify-center overflow-x-auto py-4 sm:py-6 scrollbar-none px-1">
                    <div
                      className={`flex items-end justify-center flex-nowrap whitespace-nowrap shrink-0 max-w-full ${sizeConfig.gapClass}`}
                      style={{
                        ['--letter-gap' as any]: sizeConfig.gapCss,
                      }}
                    >
                      {parsedWord.units.map((unit, uIdx) => {
                        const endPhonemeIdx = parsedWord.unitEndPhonemeIndices[uIdx];
                        const showSlashAfterThisUnit =
                          syllableSplit &&
                          endPhonemeIdx === syllableSplit.splitPhonemeIndex &&
                          isSlashRevealed;

                        if (unit.type === 'split-digraph') {
                          const isVowelHighlighted =
                            activeAudioStepIndex === unit.vowelStepIndex || isBlendingWholeWord;
                          const isMidHighlighted =
                            activeAudioStepIndex === unit.midStepIndex || isBlendingWholeWord;

                          return (
                            <div
                              key={uIdx}
                              className={`relative flex items-end shrink-0 ${sizeConfig.gapClass}`}
                            >
                              {/* Nguyên âm đầu của Magic e */}
                              <div
                                className={`flex flex-col items-center transition-all duration-200 ${
                                  isVowelHighlighted ? 'scale-105 -translate-y-1' : ''
                                }`}
                              >
                                <span
                                  className={`${sizeConfig.textSize} font-black leading-none font-sans select-none ${
                                    isVowelHighlighted
                                      ? 'text-[#e11d48] drop-shadow-md'
                                      : 'text-[#2e3440]'
                                  }`}
                                >
                                  {unit.vowelChar}
                                </span>
                                <div
                                  className={`${sizeConfig.dotContainerHeight} ${sizeConfig.dotMarginTop} w-full`}
                                />
                              </div>

                              {/* Phụ âm ở giữa */}
                              <div
                                className={`flex flex-col items-center transition-all duration-200 z-10 ${
                                  isMidHighlighted ? 'scale-105 -translate-y-1' : ''
                                }`}
                              >
                                <span
                                  className={`${sizeConfig.textSize} font-black leading-none font-sans select-none ${
                                    isMidHighlighted
                                      ? 'text-[#e11d48] drop-shadow-md'
                                      : 'text-[#2e3440]'
                                  }`}
                                >
                                  {unit.midChar}
                                </span>
                                <div
                                  className={`${sizeConfig.dotContainerHeight} flex items-center justify-center ${sizeConfig.dotMarginTop} w-full`}
                                >
                                  <div
                                    className={`${sizeConfig.dotSize} rounded-full transition-all duration-200 ${
                                      isMidHighlighted
                                        ? 'bg-[#fb7185] ring-4 ring-[#fecdd3] shadow-md scale-110'
                                        : 'bg-[#fcd4dc]'
                                    }`}
                                  />
                                </div>
                              </div>

                              {/* Chữ e câm ở cuối */}
                              <div
                                className={`flex flex-col items-center transition-all duration-200 ${
                                  isVowelHighlighted ? 'scale-105 -translate-y-1' : ''
                                }`}
                              >
                                <span
                                  className={`${sizeConfig.textSize} font-black leading-none font-sans select-none ${
                                    isVowelHighlighted
                                      ? 'text-[#e11d48] drop-shadow-md'
                                      : 'text-[#2e3440]'
                                  }`}
                                >
                                  {unit.silentEChar}
                                </span>
                                <div
                                  className={`${sizeConfig.dotContainerHeight} ${sizeConfig.dotMarginTop} w-full`}
                                />
                              </div>

                              {/* VÒNG CUNG MAGIC E */}
                              <svg
                                className="absolute left-0 right-0 bottom-0 w-full h-9 sm:h-11 pointer-events-none overflow-visible"
                                viewBox="0 0 100 36"
                                preserveAspectRatio="none"
                              >
                                <path
                                  d="M 14 4 Q 50 35 86 4"
                                  fill="none"
                                  stroke={isVowelHighlighted ? '#fb7185' : '#f9a8d4'}
                                  strokeWidth={isVowelHighlighted ? '6' : '4.5'}
                                  strokeLinecap="round"
                                />
                              </svg>
                            </div>
                          );
                        }

                        const isDigraph = unit.type === 'digraph';
                        const isHighlighted =
                          activeAudioStepIndex === unit.stepIndex || isBlendingWholeWord;

                        return (
                          <div
                            key={uIdx}
                            className={`relative flex flex-col items-center cursor-pointer transition-all duration-200 transform shrink-0 ${
                              isHighlighted ? 'scale-105 -translate-y-1' : 'hover:scale-102'
                            }`}
                          >
                            <span
                              className={`${sizeConfig.textSize} font-black leading-none tracking-normal font-sans transition-colors duration-200 select-none ${
                                isHighlighted
                                  ? 'text-[#e11d48] drop-shadow-md'
                                  : 'text-[#2e3440]'
                              }`}
                              style={{ letterSpacing: '0.01em' }}
                            >
                              {unit.text}
                            </span>

                            <div
                              className={`${sizeConfig.dotContainerHeight} flex items-center justify-center ${sizeConfig.dotMarginTop} w-full`}
                            >
                              {isDigraph ? (
                                <div
                                  className={`${sizeConfig.digraphHeight} ${sizeConfig.digraphMinWidth} w-full rounded-full transition-all duration-200 ${
                                    isHighlighted
                                      ? 'bg-[#fb7185] ring-4 ring-[#fecdd3] shadow-md scale-105'
                                      : 'bg-[#fcd4dc]'
                                  }`}
                                />
                              ) : (
                                <div
                                  className={`${sizeConfig.dotSize} rounded-full transition-all duration-200 ${
                                    isHighlighted
                                      ? 'bg-[#fb7185] ring-4 ring-[#fecdd3] shadow-md scale-110'
                                      : 'bg-[#fcd4dc]'
                                  }`}
                                />
                              )}
                            </div>

                            {/* DẤU XUỘC PHÂN TÁCH 2 ÂM TIẾT */}
                            {showSlashAfterThisUnit && syllableSplit && (
                              <div
                                className="absolute top-0 bottom-0 pointer-events-none select-none z-20 flex flex-col items-center justify-center animate-in fade-in zoom-in-75 duration-200"
                                style={{
                                  left: 'calc(100% + var(--letter-gap) / 2)',
                                  transform: 'translateX(-50%)',
                                }}
                                title={`Phân tách 2 âm tiết: ${syllableSplit.syllable1} / ${syllableSplit.syllable2}`}
                              >
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
                                <div
                                  className={`${sizeConfig.dotContainerHeight} ${sizeConfig.dotMarginTop} shrink-0`}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
