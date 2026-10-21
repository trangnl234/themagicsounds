import { useState, useRef, useMemo } from 'react';
import { PHONICS_42_SOUNDS, PHONICS_GROUPS, PhonicsSound } from '../data/phonicsData';
import {
  CustomAudioRecord,
  saveCustomAudio,
  deleteCustomAudio,
  clearAllAudios,
  blobToBase64,
  exportAudiosBackup,
  importAudiosBackup,
  saveGlobalWordAudio,
  saveBlendingAudio,
  deleteBlendingAudio,
  getCachedBlendingAudio,
  getStoredBlendingWordsList,
  getCachedAudio,
  getDefaultPhonicsAudio,
} from '../utils/audioStorage';
import {
  speakPhonicsSound,
  playCustomOrStandardWordAudio,
  stopSpeaking,
} from '../utils/audioPlayer';
import { MicrophoneRecorderModal } from './MicrophoneRecorderModal';
import { parseWordToPhonemes } from './BlendingManagerTab';
import { VideoManagerTab } from './VideoManagerTab';
import { WORDBANK_BY_SOUND } from '../data/wordBankData';

interface AudioManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customAudios: Map<string, CustomAudioRecord>;
  onRefresh: () => void;
}

export function AudioManagerModal({
  isOpen,
  onClose,
  customAudios,
  onRefresh,
}: AudioManagerModalProps) {
  const [activeTab, setActiveTab] = useState<'phonics' | 'blending' | 'videos'>('phonics');
  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Mic Record Target
  const [micTarget, setMicTarget] = useState<{
    type: 'sound' | 'word';
    soundId: string;
    word?: string;
    name: string;
  } | null>(null);

  // Manual Assign Modal
  const [manualAssignFile, setManualAssignFile] = useState<File | null>(null);
  const [manualTargetType, setManualTargetType] = useState<'sound' | 'word'>('sound');
  const [manualTargetSoundId, setManualTargetSoundId] = useState<string>('s');
  const [manualTargetWord, setManualTargetWord] = useState<string>('sat');

  // Input refs
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const batchFileInputRef = useRef<HTMLInputElement | null>(null);
  const restoreFileInputRef = useRef<HTMLInputElement | null>(null);
  const manualFileInputRef = useRef<HTMLInputElement | null>(null);

  const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Tổng hợp danh sách tất cả các từ ghép vần theo chuẩn Jolly Phonics Word Book (từ WORDBANK_BY_SOUND) và từ người dùng lưu
  const allBlendingWords = useMemo(() => {
    const map = new Map<string, { word: string; defaultSoundId: string; phonemes: string[] }>();

    // Nạp từ chuẩn theo thứ tự 42 âm từ WORDBANK_BY_SOUND
    for (const s of PHONICS_42_SOUNDS) {
      const bank = WORDBANK_BY_SOUND[s.id];
      if (bank) {
        const allLevelWords = [...bank.age_5_6, ...bank.age_7_8, ...bank.age_9_10];
        for (const w of allLevelWords) {
          const clean = w.toLowerCase().trim();
          if (!map.has(clean)) {
            map.set(clean, {
              word: clean,
              defaultSoundId: s.id,
              phonemes: parseWordToPhonemes(clean),
            });
          }
        }
      }

      // Nạp từ đã lưu trong localStorage cho âm này
      const stored = getStoredBlendingWordsList(s.id);
      if (stored) {
        for (const it of stored) {
          const clean = it.word.toLowerCase().trim();
          if (!map.has(clean)) {
            map.set(clean, {
              word: clean,
              defaultSoundId: s.id,
              phonemes: it.phonemes || parseWordToPhonemes(clean),
            });
          }
        }
      }
    }

    return Array.from(map.values());
  }, []);

  // Filter 42 Sounds
  const filteredSounds = PHONICS_42_SOUNDS.filter((sound) => {
    const matchGroup = selectedGroup === 'all' || sound.group === selectedGroup;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchGroup;

    // Đặc biệt: tìm kiếm 'c', 'k', 'ck', 'c-k', 'c/k' đều khớp âm c-k (âm /k/)
    const isCkSearch =
      sound.id === 'c-k' &&
      ['c', 'k', 'ck', 'c-k', 'c/k', 'c_k', 'c k', 'c,k', 'c, k', 'castanets'].includes(q);

    const matchSearch =
      isCkSearch ||
      sound.sound.toLowerCase().includes(q) ||
      sound.id.toLowerCase().includes(q) ||
      sound.nameVi.toLowerCase().includes(q) ||
      sound.nameEn.toLowerCase().includes(q);
    return matchGroup && matchSearch;
  });

  // Filter Blending Words
  const filteredWords = allBlendingWords.filter((w) => {
    return w.word.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalSoundsUploaded = PHONICS_42_SOUNDS.filter(
    (s) => customAudios.has(s.id) || !!getCachedAudio(s.id) || !!getDefaultPhonicsAudio(s.id)
  ).length;
  const totalWordsUploaded = allBlendingWords.filter((w) => !!getCachedBlendingAudio(w.defaultSoundId, w.word)).length;

  // ==================== BỘ TỰ ĐỘNG PHÂN PHỐI TỔNG KHO ====================
  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let matchedSoundsCount = 0;
    let matchedWordsCount = 0;
    const soundList = PHONICS_42_SOUNDS;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Tách tên file: loại bỏ phần mở rộng, chuyển chữ thường, loại bỏ khoảng trắng
      const cleanName = file.name.toLowerCase().replace(/\.[^/.]+$/, '').trim();

      // Bỏ các tiền tố phổ biến: "07_", "sound_", "am_", "audio_", "phonics_", "group2_"
      const normalizedCore = cleanName
        .replace(/^(group\s*\d+|g\d+)[\s._-]+/i, '')
        .replace(/^\d+[\s._-]+/, '')
        .replace(/^(sound|am|audio|phonics)[\s._-]+/i, '')
        .trim();

      // 1. Kiểm tra khớp với 42 Âm Phonics
      const matchedSound = soundList.find((s) => {
        // Đặc biệt: 3 mặt chữ c, k, ck ĐỀU CHUNG 1 ÂM /k/ (ID: 'c-k')
        if (s.id === 'c-k') {
          const ckAliases = [
            'c', 'k', 'ck',
            'c-k', 'c_k', 'c/k', 'c k', 'c,k', 'c, k',
            'c k ck', 'c-k-ck', 'c_k_ck',
            'sound_c', 'sound_k', 'sound_ck', 'sound_c-k',
            'am_c', 'am_k', 'am_ck', 'am_c-k',
            'am-c', 'am-k', 'am-ck', 'am-c-k',
            'castanets',
          ];
          if (
            ckAliases.includes(cleanName) ||
            ckAliases.includes(normalizedCore) ||
            cleanName === 'c' ||
            cleanName === 'k' ||
            cleanName === 'ck' ||
            normalizedCore === 'c' ||
            normalizedCore === 'k' ||
            normalizedCore === 'ck'
          ) {
            return true;
          }
        }

        const sClean = s.id.toLowerCase();
        const soundText = s.sound.toLowerCase().replace(/[\/\s,]+/g, '-');
        const sAliases = [
          sClean,
          soundText,
          s.sound.toLowerCase(),
          s.nameEn.toLowerCase(),
        ];
        if (s.id === 'oo-short') sAliases.push('oo', 'oo_short', 'oo-short', 'oo_ngan');
        if (s.id === 'oo-long') sAliases.push('oo_long', 'oo-long', 'oo_dai');
        if (s.id === 'th-unvoiced') sAliases.push('th', 'th_unvoiced', 'th-unvoiced', 'th_nhe');
        if (s.id === 'th-voiced') sAliases.push('th_voiced', 'th-voiced', 'th_rung');

        return (
          sAliases.includes(cleanName) ||
          sAliases.includes(normalizedCore) ||
          cleanName === `sound_${sClean}` ||
          cleanName === `sound_${soundText}` ||
          cleanName === `am_${sClean}` ||
          cleanName === `am-${sClean}` ||
          cleanName.startsWith(`${sClean}_`) ||
          cleanName.startsWith(`${soundText}_`)
        );
      });

      if (matchedSound) {
        try {
          const base64 = await blobToBase64(file);
          await saveCustomAudio(matchedSound.id, {
            audioData: base64,
            fileName: file.name,
            sourceType: 'upload',
          });
          matchedSoundsCount++;
          continue; // Khớp âm xong thì chuyển file tiếp theo
        } catch (err) {
          console.error(`Lỗi tải file âm thanh ${file.name}:`, err);
        }
      }

      // 2. Kiểm tra khớp với Từ Ghép Vần (Blending Word)
      // Loại bỏ tiền tố nếu có: word_sat, tu_sat, blending_sat
      let wordCandidate = cleanName;
      if (wordCandidate.startsWith('word_')) wordCandidate = wordCandidate.replace('word_', '');
      if (wordCandidate.startsWith('tu_')) wordCandidate = wordCandidate.replace('tu_', '');
      if (wordCandidate.startsWith('blending_')) wordCandidate = wordCandidate.replace('blending_', '');

      // Tìm từ trong kho từ hoặc phân phối trực tiếp theo tên file
      const foundWord = allBlendingWords.find((w) => w.word.toLowerCase() === wordCandidate);

      try {
        const base64 = await blobToBase64(file);
        // Lưu vào global word audio để tự động dùng ở mọi nơi từ này xuất hiện
        await saveGlobalWordAudio(wordCandidate, base64, file.name, 'upload');
        if (foundWord) {
          await saveBlendingAudio(foundWord.defaultSoundId, foundWord.word, base64, file.name, 'upload');
        }
        matchedWordsCount++;
      } catch (err) {
        console.error(`Lỗi phân phối file từ ${file.name}:`, err);
      }
    }

    onRefresh();
    const total = matchedSoundsCount + matchedWordsCount;
    if (total > 0) {
      showNotify(
        `🎉 Tổng kho đã phân phối thành công ${total} file! (${matchedSoundsCount} âm Phonics, ${matchedWordsCount} từ ghép vần).`,
        'success'
      );
    } else {
      showNotify('Không tìm thấy file nào khớp tên với âm hoặc từ vựng.', 'error');
    }

    e.target.value = '';
  };

  // Upload cho 1 âm đơn lẻ
  const handleSingleSoundUpload = async (soundId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await blobToBase64(file);
      await saveCustomAudio(soundId, {
        audioData: base64,
        fileName: file.name,
        sourceType: 'upload',
      });
      onRefresh();
      showNotify(`Đã tải thành công file âm thanh cho âm /${soundId}/!`);
    } catch (err) {
      console.error(err);
      showNotify('Có lỗi khi tải file âm thanh', 'error');
    }
    e.target.value = '';
  };

  // Upload cho 1 từ ghép vần đơn lẻ
  const handleSingleWordUpload = async (soundId: string, word: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await blobToBase64(file);
      await saveBlendingAudio(soundId, word, base64, file.name, 'upload');
      onRefresh();
      showNotify(`Đã nạp file audio cho từ "${word}"!`);
    } catch (err) {
      console.error(err);
      showNotify('Có lỗi khi nạp file audio cho từ', 'error');
    }
    e.target.value = '';
  };

  // Xóa âm
  const handleDeleteSound = async (soundId: string) => {
    if (confirm(`Xóa file thu âm riêng của âm /${soundId}/ và quay lại âm mặc định?`)) {
      await deleteCustomAudio(soundId);
      onRefresh();
      showNotify(`Đã xóa file âm thanh của âm /${soundId}/!`);
    }
  };

  // Xóa từ
  const handleDeleteWord = async (soundId: string, word: string) => {
    if (confirm(`Xóa file thu âm riêng của từ "${word}"?`)) {
      await deleteBlendingAudio(soundId, word);
      onRefresh();
      showNotify(`Đã xóa file audio của từ "${word}"!`);
    }
  };

  // Xóa toàn bộ Tổng Kho Âm Thanh để chuẩn bị nạp lại từ đầu
  const handleClearAllWarehouse = async () => {
    const total = customAudios.size;
    const confirmed = window.confirm(
      `⚠️ BẠN CÓ CHẮC CHẮN MUỐN XÓA TOÀN BỘ TỔNG KHO ÂM THANH?\n\n` +
      `• Hiện có ${total} file âm thanh đã nạp trong kho.\n` +
      `• Toàn bộ file thu âm của 42 âm và các từ ghép vần sẽ được xóa sạch.\n` +
      `• Tổng kho sẽ trở về trạng thái trống (0 file) để sẵn sàng nạp lại từ đầu.\n\n` +
      `Nhấn OK để xóa sạch toàn bộ kho ngay bây giờ.`
    );

    if (!confirmed) return;

    try {
      await clearAllAudios();
      onRefresh();
      showNotify('🗑️ Đã xóa sạch toàn bộ Tổng Kho Âm Thanh! Sẵn sàng nạp lại từ đầu.', 'success');
    } catch (err) {
      console.error(err);
      showNotify('Có lỗi xảy ra khi xóa kho âm thanh', 'error');
    }
  };

  // Xuất file sao lưu
  const handleExportBackup = () => {
    const json = exportAudiosBackup();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MsTrangASI_TongKho_Audio_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotify('Đã xuất toàn bộ Tổng Kho Âm Thanh thành file sao lưu JSON!');
  };

  // Khôi phục sao lưu
  const handleRestoreBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const count = await importAudiosBackup(text);
      onRefresh();
      showNotify(`Đã khôi phục thành công ${count} file âm thanh vào Tổng Kho!`);
    } catch (err) {
      console.error(err);
      showNotify('Lỗi khi khôi phục bản sao lưu', 'error');
    }
    e.target.value = '';
  };

  // Xử lý Gán Thủ Công
  const handleExecuteManualAssign = async () => {
    if (!manualAssignFile) {
      showNotify('Vui lòng chọn file audio để gán', 'error');
      return;
    }

    try {
      const base64 = await blobToBase64(manualAssignFile);
      if (manualTargetType === 'sound') {
        await saveCustomAudio(manualTargetSoundId, {
          audioData: base64,
          fileName: manualAssignFile.name,
          sourceType: 'upload',
        });
        showNotify(`Đã gán file "${manualAssignFile.name}" cho âm /${manualTargetSoundId}/!`);
      } else {
        await saveBlendingAudio(manualTargetSoundId, manualTargetWord.toLowerCase().trim(), base64, manualAssignFile.name, 'upload');
        showNotify(`Đã gán file "${manualAssignFile.name}" cho từ "${manualTargetWord}"!`);
      }
      onRefresh();
      setManualAssignFile(null);
    } catch (err) {
      console.error(err);
      showNotify('Lỗi khi gán thủ công', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in">
      <div className="bg-surface-container-lowest max-w-5xl w-full rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-primary/20 flex flex-col gap-4 relative overflow-hidden max-h-[92vh]">
        {/* Header Modal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-surface-container gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-rose-600 text-white flex items-center justify-center text-2xl shadow-sm shrink-0">
              <span className="material-symbols-outlined text-2xl">inventory_2</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-on-surface">
                  Tổng Kho Phân Phối Âm Thanh
                </h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  ⚡ Auto-Distributor
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Nạp hàng loạt file thu âm (.mp3, .wav) • Hệ thống tự phân phối về 42 âm và các từ ghép vần
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Xóa Toàn Bộ Kho */}
            <button
              onClick={handleClearAllWarehouse}
              className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-300 text-xs font-black transition-all flex items-center gap-1 shadow-xs cursor-pointer hover:scale-105 active:scale-95"
              title="Xóa toàn bộ tất cả file âm thanh trong kho để chuẩn bị nạp lại từ đầu"
            >
              <span className="material-symbols-outlined text-[16px] text-red-600">delete_forever</span>
              <span className="hidden sm:inline">Xóa Sạch Kho</span>
            </button>

            {/* Sao lưu */}
            <button
              onClick={handleExportBackup}
              className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
              title="Sao lưu toàn bộ âm thanh đã tải thành file JSON"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span className="hidden sm:inline">Sao Lưu</span>
            </button>

            {/* Khôi phục */}
            <input
              type="file"
              ref={restoreFileInputRef}
              onChange={handleRestoreBackup}
              accept="application/json"
              className="hidden"
            />
            <button
              onClick={() => restoreFileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
              title="Khôi phục danh sách âm thanh từ file JSON đã sao lưu"
            >
              <span className="material-symbols-outlined text-[16px]">restore</span>
              <span className="hidden sm:inline">Khôi Phục</span>
            </button>

            {/* Nút Đóng */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        {/* KHU VỰC NẠP HÀNG LOẠT VÀO TỔNG KHO (BATCH DROPZONE) */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border-2 border-red-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-red-200 flex items-center justify-center text-red-500 shadow-xs shrink-0">
              <span className="material-symbols-outlined text-2xl">cloud_upload</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm font-black text-on-surface uppercase tracking-wide">
                  Nạp Hàng Loạt Vào Tổng Kho (Tự Phân Phối Theo Tên File)
                </h4>
                {customAudios.size === 0 ? (
                  <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">check_circle</span>
                    <span>Kho đang trống (0 file) • Đã sẵn sàng nạp mới!</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                    Đang có {customAudios.size} file đã nạp
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                Chọn nhiều file cùng lúc: Tên <code>s.mp3</code>, <code>a.wav</code> sẽ về 42 âm; Tên <code>sat.mp3</code>, <code>pin.mp3</code>, <code>sun.wav</code> sẽ về các từ ghép vần.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            <input
              type="file"
              ref={batchFileInputRef}
              onChange={handleBatchUpload}
              multiple
              accept="audio/*"
              className="hidden"
            />
            <button
              onClick={() => batchFileInputRef.current?.click()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-extrabold text-xs sm:text-sm hover:from-red-600 hover:to-rose-700 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">drive_folder_upload</span>
              <span>Chọn File Nạp Hàng Loạt</span>
            </button>

            {/* Nút mở hộp gán thủ công */}
            <input
              type="file"
              ref={manualFileInputRef}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setManualAssignFile(e.target.files[0]);
                }
              }}
              accept="audio/*"
              className="hidden"
            />
            <button
              onClick={() => manualFileInputRef.current?.click()}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-red-200 text-on-surface hover:bg-surface-container font-bold text-xs transition-all flex items-center gap-1 shadow-2xs cursor-pointer whitespace-nowrap"
              title="Chọn 1 file và chủ động chỉ định gán vào âm hoặc từ nào"
            >
              <span className="material-symbols-outlined text-base text-secondary">tune</span>
              <span className="hidden md:inline">Gán Thủ Công</span>
            </button>

            {/* Nút Xóa Toàn Bộ Kho Nhanh khi đã có file */}
            {customAudios.size > 0 && (
              <button
                onClick={handleClearAllWarehouse}
                className="px-3.5 py-2.5 rounded-xl bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 hover:text-red-800 font-extrabold text-xs transition-all flex items-center gap-1 shadow-2xs cursor-pointer whitespace-nowrap hover:scale-105 active:scale-95"
                title="Xóa toàn bộ kho để chuẩn bị nạp lại từ đầu"
              >
                <span className="material-symbols-outlined text-base text-red-600">delete_forever</span>
                <span>Xóa Kho ({customAudios.size})</span>
              </button>
            )}
          </div>
        </div>

        {/* MODAL / DIALOG GÁN THỦ CÔNG KHI CÓ FILE ĐƯỢC CHỌN */}
        {manualAssignFile && (
          <div className="p-4 rounded-2xl bg-surface-container border-2 border-secondary/40 flex flex-col gap-3 shadow-md animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-2">
              <span className="text-xs font-black text-secondary flex items-center gap-1.5 uppercase">
                <span className="material-symbols-outlined text-base">tune</span>
                <span>Gán Thủ Công File: "{manualAssignFile.name}"</span>
              </span>
              <button
                onClick={() => setManualAssignFile(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                  Mục tiêu gán đến:
                </label>
                <select
                  value={manualTargetType}
                  onChange={(e) => setManualTargetType(e.target.value as 'sound' | 'word')}
                  className="w-full bg-white border border-surface-container-high rounded-xl p-2 text-xs font-bold"
                >
                  <option value="sound">Gán vào 1 trong 42 Âm Phonics</option>
                  <option value="word">Gán vào Từ Ghép Vần (Blending)</option>
                </select>
              </div>

              {manualTargetType === 'sound' ? (
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                    Chọn Âm Phonics:
                  </label>
                  <select
                    value={manualTargetSoundId}
                    onChange={(e) => setManualTargetSoundId(e.target.value)}
                    className="w-full bg-white border border-surface-container-high rounded-xl p-2 text-xs font-bold"
                  >
                    {PHONICS_42_SOUNDS.map((s) => (
                      <option key={s.id} value={s.id}>
                        Âm /{s.sound}/ ({s.nameVi})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                    Nhập tên từ ghép vần:
                  </label>
                  <input
                    type="text"
                    value={manualTargetWord}
                    onChange={(e) => setManualTargetWord(e.target.value)}
                    placeholder="VD: sat, sun, rain..."
                    className="w-full bg-white border border-surface-container-high rounded-xl p-2 text-xs font-bold"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExecuteManualAssign}
                  className="flex-1 py-2 px-4 rounded-xl bg-secondary-container text-on-secondary-container font-black text-xs hover:bg-secondary hover:text-on-secondary transition-all cursor-pointer shadow-xs"
                >
                  Xác Nhận Gán File
                </button>
                <button
                  onClick={() => setManualAssignFile(null)}
                  className="py-2 px-3 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-high cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Thông báo Notification */}
        {notification && (
          <div
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 shadow-sm animate-in fade-in ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-error-container text-on-error-container border border-error/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">
                {notification.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="p-1 cursor-pointer">
              <span className="material-symbols-outlined text-xs">close</span>
            </button>
          </div>
        )}

        {/* TABS CHUYỂN ĐỔI: KHO 42 ÂM vs KHO TỪ GHÉP VẦN */}
        <div className="flex items-center justify-between border-b border-surface-container pb-2 gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('phonics')}
              className={`py-2 px-4 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'phonics'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-base">record_voice_over</span>
              <span>Kho 42 Âm Phonics</span>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
                {totalSoundsUploaded}/42
              </span>
            </button>

            <button
              onClick={() => setActiveTab('blending')}
              className={`py-2 px-4 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'blending'
                  ? 'bg-secondary-container text-on-secondary-container shadow-xs ring-2 ring-secondary/30'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-base">join_inner</span>
              <span>Kho Từ Đánh Vần (Blending)</span>
              <span className="px-2 py-0.5 rounded-full bg-white/40 text-[10px] font-mono">
                {totalWordsUploaded}/{allBlendingWords.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('videos')}
              className={`py-2 px-4 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'videos'
                  ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-300'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-base">play_circle</span>
              <span>Kho Video Mô Phỏng</span>
            </button>
          </div>

          {/* Ô Tìm Kiếm */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'phonics'
                  ? 'Tìm âm (s, ai, ch...)'
                  : activeTab === 'blending'
                  ? 'Tìm từ (sat, rain...)'
                  : 'Tìm âm để xem/tải video...'
              }
              className="bg-surface-container border border-surface-container-high rounded-xl py-1.5 pl-8 pr-3 text-xs w-44 sm:w-60 focus:outline-none focus:border-primary font-bold"
            />
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant absolute left-2.5 top-2">
              search
            </span>
          </div>
        </div>

        {/* TAB 1: KHO 42 ÂM PHONICS */}
        {activeTab === 'phonics' && (
          <div className="flex flex-col gap-3 flex-1 overflow-hidden">
            {/* Bộ lọc nhóm 1 - 7 */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
              <button
                onClick={() => setSelectedGroup('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedGroup === 'all'
                    ? 'bg-primary text-on-primary shadow-2xs'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Tất cả 42 Âm
              </button>
              {PHONICS_GROUPS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGroup(g.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedGroup === g.id
                      ? 'bg-primary text-on-primary shadow-2xs'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {g.shortName}
                </button>
              ))}
            </div>

            {/* Danh sách 42 Âm */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[50vh]">
              {filteredSounds.map((sound) => {
                const customRecord =
                  customAudios.get(sound.id) || getCachedAudio(sound.id) || getDefaultPhonicsAudio(sound.id);

                return (
                  <div
                    key={sound.id}
                    className="p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container/70 border border-surface-container transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    {/* Thông tin âm */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-12 h-11 rounded-xl flex items-center justify-center font-black text-xl shadow-2xs shrink-0 select-none text-center"
                        style={{ backgroundColor: `${sound.groupColor}20`, color: sound.groupColor }}
                      >
                        {sound.id === 'c-k' ? 'c/k' : sound.sound}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-on-surface truncate">
                            Âm /{sound.sound}/ • {sound.nameVi}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container font-mono font-bold text-primary shrink-0">
                            {sound.ipa}
                          </span>
                          {sound.id === 'c-k' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 font-bold shrink-0">
                              Chung 1 âm: c, k, ck
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          {customRecord ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <span className="material-symbols-outlined text-[13px]">verified</span>
                              <span>Đã có file: {customRecord.fileName}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-on-surface-variant/80 bg-surface-container px-2 py-0.5 rounded-full">
                              <span>Chưa có file thu âm riêng (Hỗ trợ nhận diện file c, k, ck)</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Nút hành động */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* Nghe thử */}
                      <button
                        onClick={() => speakPhonicsSound(sound.sound, sound.ipa, sound.nameVi, undefined, undefined, sound.id)}
                        className="px-3 py-1.5 rounded-xl bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-on-secondary text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="Nghe phát âm chuẩn của âm này (âm lượng to nhất)"
                      >
                        <span className="material-symbols-outlined text-[16px]">play_circle</span>
                        <span>Nghe To Nhất</span>
                      </button>

                      {/* File upload input */}
                      <input
                        type="file"
                        ref={(el) => {
                          fileInputRefs.current[sound.id] = el;
                        }}
                        onChange={(e) => handleSingleSoundUpload(sound.id, e)}
                        accept="audio/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRefs.current[sound.id]?.click()}
                        className="px-3 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="Tải file âm thanh cho âm này"
                      >
                        <span className="material-symbols-outlined text-[16px]">upload</span>
                        <span>Tải File</span>
                      </button>

                      {/* Thu âm micro */}
                      <button
                        onClick={() => setMicTarget({ type: 'sound', soundId: sound.id, name: `Âm /${sound.sound}/` })}
                        className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer border border-primary/20"
                        title="Kết nối micro thu âm trực tiếp"
                      >
                        <span className="material-symbols-outlined text-[16px] text-error">mic</span>
                        <span>Thu Âm</span>
                      </button>

                      {/* Xóa */}
                      {customRecord && (
                        <button
                          onClick={() => handleDeleteSound(sound.id)}
                          className="p-1.5 rounded-xl hover:bg-error/15 text-error transition-colors cursor-pointer"
                          title="Xóa file riêng này"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: KHO TỪ ĐÁNH VẦN (BLENDING) */}
        {activeTab === 'blending' && (
          <div className="flex flex-col gap-3 flex-1 overflow-hidden">
            <div className="flex items-center justify-between text-xs text-on-surface-variant px-1 shrink-0">
              <span>
                Tổng cộng <strong>{filteredWords.length}</strong> từ đánh vần trong hệ thống. File tải lên với tên từ (vd <code>sat.mp3</code>) được tự động phân phối vào đây.
              </span>
            </div>

            {/* Danh sách từ đánh vần */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[50vh]">
              {filteredWords.map((item) => {
                const customWordAudio = getCachedBlendingAudio(item.defaultSoundId, item.word);

                return (
                  <div
                    key={item.word}
                    className="p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container/70 border border-surface-container transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    {/* Từ & Âm phân tách */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="px-3.5 py-2 rounded-xl bg-secondary-container text-on-secondary-container font-black text-lg tracking-wide shadow-2xs shrink-0 select-none">
                        {item.word}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-on-surface">
                            Từ "{item.word}"
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container font-mono text-primary font-bold">
                            {item.phonemes.map((ph) => `/${ph}/`).join(' ')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          {customWordAudio ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <span className="material-symbols-outlined text-[13px]">verified</span>
                              <span>Đã có audio: {customWordAudio.fileName}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-on-surface-variant/80 bg-surface-container px-2 py-0.5 rounded-full">
                              <span>Chưa có file audio thu âm riêng</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {/* Nghe thử */}
                      <button
                        onClick={() => playCustomOrStandardWordAudio(item.defaultSoundId, item.word)}
                        className="px-3 py-1.5 rounded-xl bg-secondary-container text-on-secondary-container hover:bg-secondary hover:text-on-secondary text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="Nghe phát âm từ này ở âm lượng to nhất"
                      >
                        <span className="material-symbols-outlined text-[16px]">volume_up</span>
                        <span>Nghe Thử</span>
                      </button>

                      {/* Upload */}
                      <input
                        type="file"
                        ref={(el) => {
                          fileInputRefs.current[`word_${item.word}`] = el;
                        }}
                        onChange={(e) => handleSingleWordUpload(item.defaultSoundId, item.word, e)}
                        accept="audio/*"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRefs.current[`word_${item.word}`]?.click()}
                        className="px-3 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        title={`Tải file audio cho từ "${item.word}"`}
                      >
                        <span className="material-symbols-outlined text-[16px]">upload</span>
                        <span>Tải File</span>
                      </button>

                      {/* Thu âm micro */}
                      <button
                        onClick={() => setMicTarget({
                          type: 'word',
                          soundId: item.defaultSoundId,
                          word: item.word,
                          name: `Từ "${item.word}"`,
                        })}
                        className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer border border-primary/20"
                        title={`Kết nối micro thu âm trực tiếp cho từ "${item.word}"`}
                      >
                        <span className="material-symbols-outlined text-[16px] text-error">mic</span>
                        <span>Thu Âm</span>
                      </button>

                      {/* Xóa */}
                      {customWordAudio && (
                        <button
                          onClick={() => handleDeleteWord(item.defaultSoundId, item.word)}
                          className="p-1.5 rounded-xl hover:bg-error/15 text-error transition-colors cursor-pointer"
                          title="Xóa audio riêng của từ này"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: KHO VIDEO MÔ PHỎNG (HÀNH ĐỘNG & KHẨU HÌNH) */}
        {activeTab === 'videos' && (
          <VideoManagerTab searchQuery={searchQuery} />
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary">info</span>
            <span>
              Tất cả âm thanh nạp vào Tổng Kho được tự động khuếch đại <strong>Max Volume</strong> để phát to rõ nhất khi học sinh chạm vào chữ!
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary-container transition-colors cursor-pointer shadow-xs"
          >
            Đóng Tổng Kho
          </button>
        </div>
      </div>

      {/* Modal Thu Âm Micro Cho Âm Hoặc Từ */}
      {micTarget && (
        <MicrophoneRecorderModal
          isOpen={!!micTarget}
          onClose={() => setMicTarget(null)}
          title={`Thu Âm Trực Tiếp Cho ${micTarget.name}`}
          targetName={micTarget.name}
          onSaveAudio={async (base64, fileName) => {
            if (micTarget.type === 'sound') {
              await saveCustomAudio(micTarget.soundId, {
                audioData: base64,
                fileName,
                sourceType: 'record',
              });
              showNotify(`Đã lưu bản thu âm cho ${micTarget.name}!`);
            } else if (micTarget.word) {
              await saveBlendingAudio(micTarget.soundId, micTarget.word, base64, fileName, 'record');
              showNotify(`Đã lưu bản thu âm cho ${micTarget.name}!`);
            }
            onRefresh();
            setMicTarget(null);
          }}
        />
      )}
    </div>
  );
}
