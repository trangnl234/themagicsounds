export interface CustomAudioRecord {
  soundId: string;
  audioData: string; // Base64 data URL
  fileName: string;
  sourceType: 'upload' | 'record' | 'url';
  duration?: number;
  updatedAt: string;
}

export interface BlendingWordItem {
  id: string;
  soundId: string;
  word: string;
  phonemes: string[];
  audioData?: string;
  fileName?: string;
  sourceType?: 'upload' | 'record' | 'url';
  updatedAt?: string;
}

const DB_NAME = 'MsTrangPhonicsAudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'custom_audios';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'soundId' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

// Mapping alias cho các âm Phonics có nhiều cách biểu diễn mặt chữ (đặc biệt là c, k, ck đều chung 1 âm /k/)
export const SOUND_ID_ALIASES: Record<string, string> = {
  // Âm /k/ - 3 mặt chữ c, k, ck đều chung 1 âm
  c: 'c-k',
  k: 'c-k',
  ck: 'c-k',
  'c/k': 'c-k',
  'c_k': 'c-k',
  'c-k': 'c-k',
  'c k': 'c-k',
  'c,k': 'c-k',
  'c, k': 'c-k',
  'c k ck': 'c-k',

  // oo ngắn & dài
  'oo-short': 'oo-short',
  oo_short: 'oo-short',
  oo: 'oo-short',
  'oo-long': 'oo-long',
  oo_long: 'oo-long',

  // th không rung & rung
  'th-unvoiced': 'th-unvoiced',
  th_unvoiced: 'th-unvoiced',
  th: 'th-unvoiced',
  'th-voiced': 'th-voiced',
  th_voiced: 'th-voiced',
};

export function normalizeSoundId(id: string): string {
  if (!id) return '';
  const clean = id.toLowerCase().trim();
  return SOUND_ID_ALIASES[clean] || SOUND_ID_ALIASES[clean.replace(/[\/\\]/g, '-')] || clean;
}

// In-memory cache for ultra-fast audio playback checks
const audioCache: Map<string, CustomAudioRecord> = new Map();
let cacheInitialized = false;
const WIPE_FLAG_KEY = 'mstrang_warehouse_cleared_request_v1';

export async function initAudioStorage(): Promise<Map<string, CustomAudioRecord>> {
  // Thực hiện xoá sạch tổng kho âm thanh theo yêu cầu của người dùng để chuẩn bị nạp lại từ đầu
  if (typeof window !== 'undefined') {
    try {
      if (localStorage.getItem(WIPE_FLAG_KEY) !== 'done') {
        localStorage.setItem(WIPE_FLAG_KEY, 'done');
        await clearAllAudios();
        cacheInitialized = true;
        return audioCache;
      }
    } catch (e) {
      console.warn('Auto wipe error:', e);
    }
  }

  if (cacheInitialized) return audioCache;
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const records: CustomAudioRecord[] = request.result || [];
        audioCache.clear();
        for (const rec of records) {
          const canonical = normalizeSoundId(rec.soundId);
          audioCache.set(rec.soundId, rec);
          if (canonical && canonical !== rec.soundId) {
            audioCache.set(canonical, rec);
          }
          // Nếu là âm /k/ (c-k), đồng bộ cho toàn bộ các mặt chữ c, k, ck
          if (canonical === 'c-k' || rec.soundId === 'c-k' || rec.soundId === 'c' || rec.soundId === 'k' || rec.soundId === 'ck') {
            audioCache.set('c-k', rec);
            audioCache.set('c', rec);
            audioCache.set('k', rec);
            audioCache.set('ck', rec);
            audioCache.set('c/k', rec);
            audioCache.set('c_k', rec);
          }
        }
        cacheInitialized = true;
        resolve(audioCache);
      };
      request.onerror = () => {
        cacheInitialized = true;
        resolve(audioCache);
      };
    });
  } catch (err) {
    console.warn('Could not initialize audio IndexedDB, falling back to cache:', err);
    cacheInitialized = true;
    return audioCache;
  }
}

export function getCachedAudio(soundId: string): CustomAudioRecord | undefined {
  if (!soundId) return undefined;
  const direct = audioCache.get(soundId);
  if (direct) return direct;

  const clean = soundId.toLowerCase().trim();
  // Nếu là bất kỳ mặt chữ nào của âm /k/ (c, k, ck, c-k, c/k)
  if (['c', 'k', 'ck', 'c-k', 'c/k', 'c_k', 'c,k', 'c, k', 'c k'].includes(clean)) {
    return (
      audioCache.get('c-k') ||
      audioCache.get('c/k') ||
      audioCache.get('c') ||
      audioCache.get('k') ||
      audioCache.get('ck')
    );
  }

  const normalized = normalizeSoundId(clean);
  if (normalized && normalized !== clean) {
    const fromNorm = audioCache.get(normalized);
    if (fromNorm) return fromNorm;
  }

  return undefined;
}

export function getAllCachedAudios(): Map<string, CustomAudioRecord> {
  return audioCache;
}

export async function saveCustomAudio(
  soundId: string,
  record: Omit<CustomAudioRecord, 'soundId' | 'updatedAt'>
): Promise<CustomAudioRecord> {
  const cleanId = soundId.toLowerCase().trim();
  const canonicalId = normalizeSoundId(cleanId);

  const completeRecord: CustomAudioRecord = {
    ...record,
    soundId: canonicalId,
    updatedAt: new Date().toISOString(),
  };

  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(completeRecord);

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    audioCache.set(canonicalId, completeRecord);
    // Đồng bộ tức thì cho tất cả các mặt chữ liên quan nếu là âm /k/ (c, k, ck)
    if (canonicalId === 'c-k') {
      audioCache.set('c', completeRecord);
      audioCache.set('k', completeRecord);
      audioCache.set('ck', completeRecord);
      audioCache.set('c/k', completeRecord);
      audioCache.set('c_k', completeRecord);
      audioCache.set('c-k', completeRecord);
    }

    window.dispatchEvent(
      new CustomEvent('phonics-audio-updated', { detail: { soundId: canonicalId, record: completeRecord } })
    );
    return completeRecord;
  } catch (err) {
    console.error('Failed to save audio to IndexedDB, saving to memory only:', err);
    audioCache.set(canonicalId, completeRecord);
    if (canonicalId === 'c-k') {
      audioCache.set('c', completeRecord);
      audioCache.set('k', completeRecord);
      audioCache.set('ck', completeRecord);
      audioCache.set('c/k', completeRecord);
      audioCache.set('c_k', completeRecord);
      audioCache.set('c-k', completeRecord);
    }
    window.dispatchEvent(
      new CustomEvent('phonics-audio-updated', { detail: { soundId: canonicalId, record: completeRecord } })
    );
    return completeRecord;
  }
}

export async function deleteCustomAudio(soundId: string): Promise<void> {
  const cleanId = soundId.toLowerCase().trim();
  const canonicalId = normalizeSoundId(cleanId);
  const idsToDelete = canonicalId === 'c-k' ? ['c-k', 'c', 'k', 'ck', 'c/k', 'c_k'] : [canonicalId];

  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const id of idsToDelete) {
      store.delete(id);
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to delete audio from IndexedDB:', err);
  }

  for (const id of idsToDelete) {
    audioCache.delete(id);
    window.dispatchEvent(
      new CustomEvent('phonics-audio-updated', { detail: { soundId: id, record: null } })
    );
  }
}

export async function clearAllAudios(): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Failed to clear audio DB:', err);
  }

  audioCache.clear();

  // Xóa danh sách từ tùy chỉnh ghép vần trong localStorage nếu có
  if (typeof window !== 'undefined') {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(BLENDING_LIST_STORAGE_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (_) {}

    window.dispatchEvent(
      new CustomEvent('phonics-audio-updated', { detail: { soundId: 'all', record: null } })
    );
  }
}

// ==================== BLENDING WORDS & BLENDING AUDIO STORAGE ====================

export function getBlendingAudioKey(soundId: string, word: string): string {
  return `blending_${soundId}_${word.toLowerCase().trim()}`;
}

export async function saveBlendingAudio(
  soundId: string,
  word: string,
  audioData: string,
  fileName: string,
  sourceType: 'upload' | 'record' | 'url' = 'upload'
): Promise<CustomAudioRecord> {
  const cleanWord = word.toLowerCase().trim();
  const key = getBlendingAudioKey(soundId, cleanWord);
  // Đồng thời lưu vào global word key để phân phối rộng khắp
  await saveCustomAudio(`blending_word_${cleanWord}`, {
    audioData,
    fileName,
    sourceType,
  });
  return saveCustomAudio(key, {
    audioData,
    fileName,
    sourceType,
  });
}

export async function saveGlobalWordAudio(
  word: string,
  audioData: string,
  fileName: string,
  sourceType: 'upload' | 'record' | 'url' = 'upload'
): Promise<CustomAudioRecord> {
  const cleanWord = word.toLowerCase().trim();
  return saveCustomAudio(`blending_word_${cleanWord}`, {
    audioData,
    fileName,
    sourceType,
  });
}

export function getCachedBlendingAudio(soundId: string, word: string): CustomAudioRecord | undefined {
  const cleanWord = word.toLowerCase().trim();
  const key = getBlendingAudioKey(soundId, cleanWord);
  const bySound = getCachedAudio(key);
  if (bySound) return bySound;
  return getCachedAudio(`blending_word_${cleanWord}`);
}

export async function deleteBlendingAudio(soundId: string, word: string): Promise<void> {
  const cleanWord = word.toLowerCase().trim();
  const key = getBlendingAudioKey(soundId, cleanWord);
  await deleteCustomAudio(key);
  await deleteCustomAudio(`blending_word_${cleanWord}`);
}

const BLENDING_LIST_STORAGE_PREFIX = 'phonics_blending_words_';

export function getStoredBlendingWordsList(soundId: string): BlendingWordItem[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${BLENDING_LIST_STORAGE_PREFIX}${soundId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading blending words list:', e);
  }
  return null;
}

export function saveStoredBlendingWordsList(soundId: string, list: BlendingWordItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${BLENDING_LIST_STORAGE_PREFIX}${soundId}`, JSON.stringify(list));
    window.dispatchEvent(
      new CustomEvent('phonics-blending-words-updated', { detail: { soundId, list } })
    );
  } catch (e) {
    console.warn('Error saving blending words list:', e);
  }
}

// Convert File / Blob to Base64
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('FileReader result is not a string'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Export backup
export function exportAudiosBackup(): string {
  const allObj: Record<string, CustomAudioRecord> = {};
  audioCache.forEach((value, key) => {
    allObj[key] = value;
  });
  return JSON.stringify(allObj, null, 2);
}

// Import backup
export async function importAudiosBackup(jsonStr: string): Promise<number> {
  try {
    const parsed = JSON.parse(jsonStr) as Record<string, CustomAudioRecord>;
    let count = 0;
    for (const [soundId, record] of Object.entries(parsed)) {
      if (record && record.audioData) {
        await saveCustomAudio(soundId, {
          audioData: record.audioData,
          fileName: record.fileName || `${soundId}.mp3`,
          sourceType: record.sourceType || 'upload',
        });
        count++;
      }
    }
    return count;
  } catch (err) {
    throw new Error('Định dạng file sao lưu không hợp lệ');
  }
}
