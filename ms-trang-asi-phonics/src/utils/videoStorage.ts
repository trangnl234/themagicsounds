/**
 * Quản lý lưu trữ Video Mô Phỏng Âm (42 Âm Phonics: Hành Động & Khẩu Hình + 8 Set Âm Thay Thế)
 * Hỗ trợ lưu trực tiếp tệp Video (Blob/File) vào IndexedDB dung lượng lớn,
 * tạo ObjectURL phát trực tiếp không giật lag và tự động phân phối cả kho video về chuẩn vị trí.
 */

import { ALTERNATIVE_SPELLINGS_DATA } from '../data/alternativeSpellingsData';
import { PHONICS_42_SOUNDS, PHONICS_GROUPS } from '../data/phonicsData';
import { TRICKY_WORDS_DATA } from '../data/trickyWordsData';

export interface StoredVideoEntry {
  blob?: Blob;
  url?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  label?: string;
  sourceType: 'upload' | 'url';
  updatedAt: string;
}

export interface StoredSoundVideosRecord {
  soundId: string;
  actionVideo?: StoredVideoEntry; // 1 video hành động âm (hoặc video chính của Set Âm Thay Thế)
  mouthVideo?: StoredVideoEntry;  // 1 video khẩu hình miệng
  altVideos?: StoredVideoEntry[]; // Danh sách video học Set Âm Thay Thế (hỗ trợ 1 hoặc nhiều video/set)
}

export interface LoadedVideoItem {
  playUrl: string; // ObjectURL hoặc external URL
  fileName?: string;
  fileSize?: number;
  label?: string;
  sourceType: 'upload' | 'url';
  updatedAt: string;
}

export interface LoadedSoundVideos {
  soundId: string;
  actionVideo?: LoadedVideoItem;
  mouthVideo?: LoadedVideoItem;
  altVideos?: LoadedVideoItem[];
}

export interface VideoDistributionItem {
  file: File;
  fileName: string;
  targetCategory: 'alt-set' | 'phonics-action' | 'phonics-mouth';
  targetId: string;
  targetTitle: string;
  matchNote: string;
}

export interface VideoDistributionReport {
  totalFiles: number;
  altSetCount: number;
  phonicsActionCount: number;
  phonicsMouthCount: number;
  items: VideoDistributionItem[];
}

const DB_NAME = 'MsTrangPhonicsVideoDB';
const DB_VERSION = 1;
const STORE_NAME = 'sound_videos';

let dbPromise: Promise<IDBDatabase> | null = null;

function getVideoDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
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

export function getAltKey(topicId: string): string {
  const clean = topicId.toLowerCase().trim().replace(/^alt_/, '');
  return `alt_${clean}`;
}

// Chuẩn hóa alias cho âm (đặc biệt c, k, ck -> c-k)
export function normalizeVideoSoundId(id: string): string {
  if (!id) return '';
  const clean = id.toLowerCase().trim();
  if (clean.startsWith('alt_')) return clean;
  if (['c', 'k', 'ck', 'c/k', 'c_k', 'c-k', 'c,k', 'c, k', 'c k'].includes(clean)) {
    return 'c-k';
  }
  if (clean === 'oo' || clean === 'oo_short') return 'oo-short';
  if (clean === 'oo_long') return 'oo-long';
  if (clean === 'th' || clean === 'th_unvoiced') return 'th-unvoiced';
  if (clean === 'th_voiced') return 'th-voiced';
  return clean.replace(/[\/\\]/g, '-');
}

// In-memory cache với ObjectURL đã tạo sẵn
const videoCache: Map<string, LoadedSoundVideos> = new Map();
const rawRecordsCache: Map<string, StoredSoundVideosRecord> = new Map();
let isInitialized = false;
let initPromise: Promise<Map<string, LoadedSoundVideos>> | null = null;

// Trình lắng nghe thay đổi
const listeners = new Set<(soundId: string) => void>();

export function subscribeVideoUpdates(callback: (soundId: string) => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifyUpdate(soundId: string) {
  listeners.forEach((cb) => {
    try {
      cb(soundId);
    } catch (e) {
      console.error('Error in video update listener:', e);
    }
  });
}

function buildLoadedItem(entry?: StoredVideoEntry, existingPlayUrl?: string): LoadedVideoItem | undefined {
  if (!entry) return undefined;
  let playUrl = '';
  if (entry.sourceType === 'url' && entry.url) {
    playUrl = entry.url;
  } else if (entry.blob) {
    playUrl = URL.createObjectURL(entry.blob);
  } else if (entry.url) {
    playUrl = entry.url;
  }

  if (!playUrl) return undefined;

  // Thu hồi url cũ nếu có
  if (existingPlayUrl && existingPlayUrl.startsWith('blob:') && existingPlayUrl !== playUrl) {
    try {
      URL.revokeObjectURL(existingPlayUrl);
    } catch {}
  }

  return {
    playUrl,
    fileName: entry.fileName,
    fileSize: entry.fileSize,
    label: entry.label,
    sourceType: entry.sourceType,
    updatedAt: entry.updatedAt,
  };
}

function buildLoadedRecord(rec: StoredSoundVideosRecord, prev?: LoadedSoundVideos): LoadedSoundVideos {
  const loadedAltVideos: LoadedVideoItem[] = [];
  if (rec.altVideos && rec.altVideos.length > 0) {
    rec.altVideos.forEach((entry, idx) => {
      const prevUrl = prev?.altVideos?.[idx]?.playUrl;
      const item = buildLoadedItem(entry, prevUrl);
      if (item) loadedAltVideos.push(item);
    });
  } else if (rec.soundId.startsWith('alt_') && rec.actionVideo) {
    const item = buildLoadedItem(rec.actionVideo, prev?.actionVideo?.playUrl);
    if (item) loadedAltVideos.push(item);
  }

  const primaryAction =
    rec.actionVideo
      ? buildLoadedItem(rec.actionVideo, prev?.actionVideo?.playUrl)
      : loadedAltVideos[0];

  return {
    soundId: rec.soundId,
    actionVideo: primaryAction,
    mouthVideo: buildLoadedItem(rec.mouthVideo, prev?.mouthVideo?.playUrl),
    altVideos: loadedAltVideos.length > 0 ? loadedAltVideos : undefined,
  };
}

export async function initVideoStorage(): Promise<Map<string, LoadedSoundVideos>> {
  if (isInitialized) return videoCache;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const db = await getVideoDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      return await new Promise<Map<string, LoadedSoundVideos>>((resolve) => {
        request.onsuccess = () => {
          const records: StoredSoundVideosRecord[] = request.result || [];
          videoCache.clear();
          rawRecordsCache.clear();

          for (const rec of records) {
            rawRecordsCache.set(rec.soundId, rec);
            const loaded = buildLoadedRecord(rec);
            videoCache.set(rec.soundId, loaded);

            // Đồng bộ các alias
            const canonical = normalizeVideoSoundId(rec.soundId);
            if (canonical && canonical !== rec.soundId) {
              videoCache.set(canonical, loaded);
            }
            if (canonical === 'c-k') {
              videoCache.set('c', loaded);
              videoCache.set('k', loaded);
              videoCache.set('ck', loaded);
            }
          }

          isInitialized = true;
          resolve(videoCache);
        };

        request.onerror = () => {
          console.warn('Failed to load videos from IndexedDB');
          isInitialized = true;
          resolve(videoCache);
        };
      });
    } catch (err) {
      console.warn('Video IndexedDB initialization failed:', err);
      isInitialized = true;
      return videoCache;
    }
  })();

  return initPromise;
}

export function getLoadedSoundVideos(soundId: string): LoadedSoundVideos | undefined {
  if (!soundId) return undefined;
  const canonical = normalizeVideoSoundId(soundId);
  return videoCache.get(canonical) || videoCache.get(soundId);
}

export function getLoadedAltSetVideos(topicId: string): LoadedVideoItem[] {
  if (!topicId) return [];
  const key = getAltKey(topicId);
  const record = videoCache.get(key);
  if (!record) return [];
  if (record.altVideos && record.altVideos.length > 0) {
    return record.altVideos;
  }
  if (record.actionVideo) {
    return [record.actionVideo];
  }
  return [];
}

export async function saveSoundVideo(
  soundId: string,
  videoType: 'action' | 'mouth',
  fileOrUrl: File | Blob | string,
  fileName?: string
): Promise<LoadedSoundVideos> {
  const canonicalId = normalizeVideoSoundId(soundId);
  const db = await getVideoDB();

  let currentRec = rawRecordsCache.get(canonicalId);
  if (!currentRec) {
    currentRec = { soundId: canonicalId };
  }

  let newEntry: StoredVideoEntry;

  if (typeof fileOrUrl === 'string') {
    newEntry = {
      url: fileOrUrl.trim(),
      fileName: fileName || (fileOrUrl.length > 40 ? fileOrUrl.slice(0, 37) + '...' : fileOrUrl),
      sourceType: 'url',
      updatedAt: new Date().toISOString(),
    };
  } else {
    const isFile = fileOrUrl instanceof File;
    newEntry = {
      blob: fileOrUrl,
      fileName: isFile ? fileOrUrl.name : (fileName || `${canonicalId}_${videoType}.mp4`),
      fileSize: fileOrUrl.size,
      mimeType: fileOrUrl.type || 'video/mp4',
      sourceType: 'upload',
      updatedAt: new Date().toISOString(),
    };
  }

  if (videoType === 'action') {
    currentRec.actionVideo = newEntry;
  } else {
    currentRec.mouthVideo = newEntry;
  }

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(currentRec);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  rawRecordsCache.set(canonicalId, currentRec);

  const prevLoaded = videoCache.get(canonicalId);
  const updatedLoaded = buildLoadedRecord(currentRec, prevLoaded);

  videoCache.set(canonicalId, updatedLoaded);
  if (canonicalId === 'c-k') {
    videoCache.set('c', updatedLoaded);
    videoCache.set('k', updatedLoaded);
    videoCache.set('ck', updatedLoaded);
  }

  notifyUpdate(canonicalId);
  return updatedLoaded;
}

/**
 * Lưu video cho 1 Set Âm Thay Thế (Alternative Spelling Topic)
 * - mode = 'replace': Thay thế video tại replaceIndex (hoặc đặt làm video duy nhất của Set nếu không truyền replaceIndex)
 * - mode = 'append': Thêm vào danh sách video của Set (nếu trùng tên file thì cập nhật file đó)
 */
export async function saveAltSetVideo(
  topicId: string,
  fileOrUrl: File | Blob | string,
  fileName?: string,
  mode: 'replace' | 'append' = 'replace',
  replaceIndex?: number,
  label?: string
): Promise<LoadedSoundVideos> {
  const key = getAltKey(topicId);
  const db = await getVideoDB();

  let currentRec = rawRecordsCache.get(key);
  if (!currentRec) {
    currentRec = { soundId: key, altVideos: [] };
  }

  const existingList: StoredVideoEntry[] = currentRec.altVideos
    ? [...currentRec.altVideos]
    : currentRec.actionVideo
    ? [currentRec.actionVideo]
    : [];

  let newEntry: StoredVideoEntry;
  if (typeof fileOrUrl === 'string') {
    newEntry = {
      url: fileOrUrl.trim(),
      fileName: fileName || (fileOrUrl.length > 40 ? fileOrUrl.slice(0, 37) + '...' : fileOrUrl),
      label,
      sourceType: 'url',
      updatedAt: new Date().toISOString(),
    };
  } else {
    const isFile = fileOrUrl instanceof File;
    const resolvedName = isFile ? fileOrUrl.name : (fileName || `${key}.mp4`);
    newEntry = {
      blob: fileOrUrl,
      fileName: resolvedName,
      fileSize: fileOrUrl.size,
      mimeType: fileOrUrl.type || 'video/mp4',
      label: label || resolvedName.replace(/\.[^/.]+$/, ''),
      sourceType: 'upload',
      updatedAt: new Date().toISOString(),
    };
  }

  if (mode === 'replace') {
    if (typeof replaceIndex === 'number' && replaceIndex >= 0 && replaceIndex < existingList.length) {
      existingList[replaceIndex] = newEntry;
      currentRec.altVideos = existingList;
    } else {
      currentRec.altVideos = [newEntry];
    }
  } else {
    // mode === 'append'
    const sameNameIdx = existingList.findIndex(
      (item) => item.fileName && newEntry.fileName && item.fileName.toLowerCase() === newEntry.fileName.toLowerCase()
    );
    if (sameNameIdx >= 0) {
      existingList[sameNameIdx] = newEntry;
    } else {
      existingList.push(newEntry);
    }
    currentRec.altVideos = existingList;
  }

  currentRec.actionVideo = currentRec.altVideos[0];

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(currentRec);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  rawRecordsCache.set(key, currentRec);
  const prevLoaded = videoCache.get(key);
  const updatedLoaded = buildLoadedRecord(currentRec, prevLoaded);
  videoCache.set(key, updatedLoaded);

  notifyUpdate(key);
  return updatedLoaded;
}

export async function deleteAltSetVideo(topicId: string, index?: number): Promise<void> {
  const key = getAltKey(topicId);
  const db = await getVideoDB();
  const currentRec = rawRecordsCache.get(key);
  if (!currentRec) return;

  const prevLoaded = videoCache.get(key);
  const existingList: StoredVideoEntry[] = currentRec.altVideos
    ? [...currentRec.altVideos]
    : currentRec.actionVideo
    ? [currentRec.actionVideo]
    : [];

  if (typeof index === 'number' && index >= 0 && index < existingList.length && existingList.length > 1) {
    const removedLoaded = prevLoaded?.altVideos?.[index];
    if (removedLoaded?.playUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(removedLoaded.playUrl);
      } catch {}
    }
    existingList.splice(index, 1);
    currentRec.altVideos = existingList;
    currentRec.actionVideo = existingList[0];

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(currentRec);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    rawRecordsCache.set(key, currentRec);
    const updatedLoaded = buildLoadedRecord(currentRec);
    videoCache.set(key, updatedLoaded);
    notifyUpdate(key);
    return;
  }

  // Xóa toàn bộ video của Set này
  if (prevLoaded?.altVideos) {
    for (const v of prevLoaded.altVideos) {
      if (v.playUrl.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(v.playUrl);
        } catch {}
      }
    }
  }
  if (prevLoaded?.actionVideo?.playUrl.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(prevLoaded.actionVideo.playUrl);
    } catch {}
  }

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  rawRecordsCache.delete(key);
  videoCache.delete(key);
  notifyUpdate(key);
}

export async function deleteSoundVideo(
  soundId: string,
  videoType: 'action' | 'mouth'
): Promise<void> {
  const canonicalId = normalizeVideoSoundId(soundId);
  const db = await getVideoDB();
  const currentRec = rawRecordsCache.get(canonicalId);
  if (!currentRec) return;

  const prevLoaded = videoCache.get(canonicalId);
  if (videoType === 'action') {
    if (prevLoaded?.actionVideo?.playUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(prevLoaded.actionVideo.playUrl);
      } catch {}
    }
    delete currentRec.actionVideo;
  } else {
    if (prevLoaded?.mouthVideo?.playUrl.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(prevLoaded.mouthVideo.playUrl);
      } catch {}
    }
    delete currentRec.mouthVideo;
  }

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    if (!currentRec.actionVideo && !currentRec.mouthVideo && (!currentRec.altVideos || currentRec.altVideos.length === 0)) {
      const req = store.delete(canonicalId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    } else {
      const req = store.put(currentRec);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    }
  });

  if (!currentRec.actionVideo && !currentRec.mouthVideo && (!currentRec.altVideos || currentRec.altVideos.length === 0)) {
    rawRecordsCache.delete(canonicalId);
    videoCache.delete(canonicalId);
    if (canonicalId === 'c-k') {
      videoCache.delete('c');
      videoCache.delete('k');
      videoCache.delete('ck');
    }
  } else {
    const updatedLoaded = buildLoadedRecord(currentRec, prevLoaded);
    videoCache.set(canonicalId, updatedLoaded);
    if (canonicalId === 'c-k') {
      videoCache.set('c', updatedLoaded);
      videoCache.set('k', updatedLoaded);
      videoCache.set('ck', updatedLoaded);
    }
  }

  notifyUpdate(canonicalId);
}

export function getAllLoadedVideos(): Map<string, LoadedSoundVideos> {
  return videoCache;
}

// ==================== BỘ TỰ ĐỘNG PHÂN PHỐI KHO VIDEO VỀ ĐÚNG VỊ TRÍ ====================

function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

const ALT_SET_MATCHERS: {
  topicId: string;
  setIndex: number; // 1..12
  exactTokens: string[];
  containsPatterns: RegExp[];
}[] = [
  {
    topicId: 'ai',
    setIndex: 1,
    exactTokens: ['ai', 'ay', 'a_e', 'a-e', 'ae', 'ai-ay', 'ai_ay', 'long-a', 'long_a'],
    containsPatterns: [
      /\ba[_\s-]*e\b/i,
      /\b(ai|ay)\b/i,
      /\blong[\s._-]*a\b/i,
      /\b(day|play|stay|tray|cake|game|name|bake|snake|plate)\b/i,
    ],
  },
  {
    topicId: 'ue',
    setIndex: 2,
    exactTokens: ['ue', 'ew', 'u_e', 'u-e', 'ue-ew', 'ue_ew', 'long-u', 'long_u'],
    containsPatterns: [
      /\bu[_\s-]*e\b/i,
      /\b(ue|ew)\b/i,
      /\blong[\s._-]*u\b/i,
      /\b(new|few|stew|grew|flew|cube|tube|tune|flute)\b/i,
    ],
  },
  {
    topicId: 'oa',
    setIndex: 3,
    exactTokens: ['oa', 'ow_oa', 'o_e', 'o-e', 'oa-ow', 'oa_ow', 'long-o', 'long_o'],
    containsPatterns: [
      /\bo[_\s-]*e\b/i,
      /\b(oa)\b/i,
      /\blong[\s._-]*o\b/i,
      /\b(snow|blow|grow|window|yellow|bone|home|rope|stone)\b/i,
    ],
  },
  {
    topicId: 'oi',
    setIndex: 4,
    exactTokens: ['oi', 'oy', 'oi-oy', 'oi_oy'],
    containsPatterns: [
      /\b(oi|oy)\b/i,
      /\b(boy|toy|joy|enjoy|royal|cowboy)\b/i,
    ],
  },
  {
    topicId: 'ie',
    setIndex: 5,
    exactTokens: ['ie', 'igh', 'i_e', 'i-e', 'y_ie', 'ie-igh', 'ie_igh', 'long-i', 'long_i'],
    containsPatterns: [
      /\bi[_\s-]*e\b/i,
      /\b(ie|igh)\b/i,
      /\blong[\s._-]*i\b/i,
      /\b(high|night|light|bright|bike|time|kite|sky|fly|cry)\b/i,
    ],
  },
  {
    topicId: 'or',
    setIndex: 6,
    exactTokens: ['or', 'al', 'all', 'au', 'aw', 'or-al-au-aw'],
    containsPatterns: [
      /\b(or|al|all|au|aw)\b/i,
      /\b(ball|tall|small|talk|walk|haul|sauce|autumn|saw|paw|draw|straw)\b/i,
    ],
  },
  {
    topicId: 's',
    setIndex: 7,
    exactTokens: ['s', 'cy', 'ce', 'ci', 'soft-c', 'soft_c', 'softc', 'cy-ce-ci'],
    containsPatterns: [
      /\bsoft[\s._-]*c\b/i,
      /\b(cy|ce|ci)\b/i,
      /\b(city|pencil|circle|circus|cycle|mice|nice|rice|face|dance)\b/i,
    ],
  },
  {
    topicId: 'ou',
    setIndex: 8,
    exactTokens: ['ou', 'ow_ou', 'ou-ow', 'ou_ow'],
    containsPatterns: [
      /\b(ou|ow)\b/i,
      /\b(cow|how|now|owl|down|town|brown|flower)\b/i,
    ],
  },
  {
    topicId: 'j',
    setIndex: 9,
    exactTokens: ['j', 'gy', 'ge', 'gi', 'soft-g', 'soft_g', 'softg', 'gy-ge-gi'],
    containsPatterns: [
      /\bsoft[\s._-]*g\b/i,
      /\b(gy|ge|gi)\b/i,
      /\b(gym|energy|cage|page|stage|large|orange|giant|magic|giraffe)\b/i,
    ],
  },
  {
    topicId: 'ee',
    setIndex: 10,
    exactTokens: ['ee', 'ea', 'e_e', 'e-e', 'y_ee', 'ee-ea', 'ee_ea', 'long-e', 'long_e'],
    containsPatterns: [
      /\be[_\s-]*e\b/i,
      /\b(ee|ea)\b/i,
      /\blong[\s._-]*e\b/i,
      /\b(eat|sea|leaf|team|read|these|pete|happy|sunny|baby)\b/i,
    ],
  },
  {
    topicId: 'er',
    setIndex: 11,
    exactTokens: ['er', 'ir', 'ur', 'er-ir-ur', 'er_ir_ur', 'er-ir', 'er_ir'],
    containsPatterns: [
      /\b(er|ir|ur)\b/i,
      /\b(bird|girl|shirt|skirt|first|fur|burn|turn|surf|nurse|turtle)\b/i,
    ],
  },
  {
    topicId: 'f',
    setIndex: 12,
    exactTokens: ['f', 'ph', 'f-ph', 'f_ph'],
    containsPatterns: [
      /\b(ph)\b/i,
      /\b(phone|photo|graph|dolphin|elephant|nephew|orphan|phonics)\b/i,
    ],
  },
];

function matchAltSetFromFilename(fileName: string): { topicId: string; matchNote: string } | null {
  const noExt = fileName.replace(/\.[^/.]+$/, '').trim();
  const normalized = removeVietnameseTones(noExt).toLowerCase();

  // Tách các token ngăn cách bởi dấu cách, gạch dưới, gạch ngang, dấu chấm, ngoặc
  const tokens = normalized
    .split(/[\s._\-\(\)\[\]\/]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  // 1. Kiểm tra khớp token chính xác với các mã âm / biến thể của các Set
  for (const matcher of ALT_SET_MATCHERS) {
    if (matcher.exactTokens.includes(normalized)) {
      return { topicId: matcher.topicId, matchNote: `Khớp tên âm "${normalized}"` };
    }
    for (const tk of matcher.exactTokens) {
      if (tokens.includes(tk)) {
        return { topicId: matcher.topicId, matchNote: `Khớp mã âm "${tk}" trong tên file` };
      }
    }
  }

  // 2. Kiểm tra biểu thức chính quy (chứa cụm a_e, i_e, o_e, u_e, e_e, từ mẫu, v.v.)
  for (const matcher of ALT_SET_MATCHERS) {
    for (const regex of matcher.containsPatterns) {
      const m = normalized.match(regex);
      if (m) {
        return { topicId: matcher.topicId, matchNote: `Khớp quy tắc "${m[0]}"` };
      }
    }
  }

  // 3. Kiểm tra theo số thứ tự Set 1..12 (ví dụ: set 1, set_2, bai 3, chuyen de 4, 01, 1...)
  const setNumMatch =
    normalized.match(/\b(?:set|bai|chuyende|chuyen[\s._-]*de|nhom|group|part|tap|phan)[\s._-]*0?(\d{1,2})\b/i) ||
    normalized.match(/^0?(\d{1,2})(?:[\s._-]|$)/);

  if (setNumMatch) {
    const idx = parseInt(setNumMatch[1], 10);
    const topic = ALTERNATIVE_SPELLINGS_DATA[idx - 1];
    if (topic) {
      return { topicId: topic.id, matchNote: `Khớp số thứ tự Set ${idx} (${topic.soundTitle})` };
    }
  }

  return null;
}

function matchPhonics42FromFilename(
  fileName: string
): { soundId: string; soundLabel: string; explicitType?: 'action' | 'mouth'; matchNote: string } | null {
  const noExt = fileName.replace(/\.[^/.]+$/, '').trim();
  const normalized = removeVietnameseTones(noExt).toLowerCase();

  // Phát hiện loại video (Hành động vs Khẩu hình)
  let explicitType: 'action' | 'mouth' | undefined = undefined;
  if (/\b(mouth|khauhinh|khau[\s._-]*hinh|mieng|kh|step[\s._-]*2|buoc[\s._-]*2)\b/i.test(normalized)) {
    explicitType = 'mouth';
  } else if (/\b(action|hanhdong|hanh[\s._-]*dong|cuchi|cu[\s._-]*chi|hd|step[\s._-]*1|buoc[\s._-]*1)\b/i.test(normalized)) {
    explicitType = 'action';
  } else if (/[_\s\-\(]2\)?$/.test(normalized)) {
    explicitType = 'mouth';
  } else if (/[_\s\-\(]1\)?$/.test(normalized)) {
    explicitType = 'action';
  }

  // Làm sạch các từ khóa phụ để lấy lõi tên âm
  const core = normalized
    .replace(/\b(video|vid|clip|sound|am|phonics|jolly|uk|group\s*\d+|nhom\s*\d+|g\d+)\b/gi, ' ')
    .replace(/\b(mouth|khauhinh|khau[\s._-]*hinh|mieng|kh|action|hanhdong|hanh[\s._-]*dong|cuchi|cu[\s._-]*chi|hd|step\s*\d+|buoc\s*\d+)\b/gi, ' ')
    .replace(/^\d+[\s._-]+/, '')
    .replace(/[_\s\-\(][12]\)?$/, '')
    .trim();

  const tokens = core
    .split(/[\s._\-\(\)\[\]\/]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  // Kiểm tra các âm 2-3 ký tự trước (tránh khớp nhầm chữ cái đơn)
  const sortedSounds = [...PHONICS_42_SOUNDS].sort((a, b) => b.sound.length - a.sound.length);

  for (const s of sortedSounds) {
    if (s.id === 'c-k') {
      const ckAliases = ['c-k', 'c_k', 'ck', 'c', 'k', 'castanets'];
      if (ckAliases.includes(core) || tokens.some((t) => ckAliases.includes(t))) {
        return {
          soundId: 'c-k',
          soundLabel: `Âm /${s.sound}/`,
          explicitType,
          matchNote: `Khớp âm /${s.sound}/`,
        };
      }
      continue;
    }

    const sId = s.id.toLowerCase();
    const sSound = s.sound.toLowerCase();
    const aliases = [sId, sSound];
    if (sId === 'oo-short') aliases.push('oo', 'oo_short', 'oo_ngan', 'ooshort');
    if (sId === 'oo-long') aliases.push('oo_long', 'oo_dai', 'oolong');
    if (sId === 'th-unvoiced') aliases.push('th', 'th_unvoiced', 'th_nhe', 'thunvoiced');
    if (sId === 'th-voiced') aliases.push('th_voiced', 'th_rung', 'thvoiced');

    if (aliases.includes(core) || tokens.some((t) => aliases.includes(t))) {
      return {
        soundId: s.id,
        soundLabel: `Âm /${s.sound}/`,
        explicitType,
        matchNote: `Khớp âm /${s.sound}/`,
      };
    }
  }

  return null;
}

/**
 * Tự động phân phối cả kho video người dùng chọn lên chuẩn vị trí:
 * - Nếu defaultScope === 'alt-only': Phân phối toàn bộ vào 8 Set Âm Thay Thế (ưu tiên khớp tên âm/biến thể -> số thứ tự Set -> điền tự động vào Set còn trống).
 * - Nếu defaultScope === 'all' | 'phonics-action' | 'phonics-mouth': Nhận diện thông minh cả 8 Set Âm Thay Thế lẫn 42 Âm Phonics (Hành Động & Khẩu Hình).
 */
export async function autoDistributeVideoBatch(
  filesInput: FileList | File[],
  defaultScope: 'alt-only' | 'all' | 'phonics-action' | 'phonics-mouth' = 'all'
): Promise<VideoDistributionReport> {
  await initVideoStorage();

  const files = Array.from(filesInput).filter(
    (f) => f.type.startsWith('video/') || /\.(mp4|mov|webm|ogg|m4v|mkv)$/i.test(f.name)
  );

  const report: VideoDistributionReport = {
    totalFiles: files.length,
    altSetCount: 0,
    phonicsActionCount: 0,
    phonicsMouthCount: 0,
    items: [],
  };

  if (files.length === 0) return report;

  // Theo dõi các Set hoặc Âm đã được gán trong cùng 1 đợt upload hàng loạt
  const touchedAltSetsInBatch = new Set<string>();
  const touchedPhonicsActionInBatch = new Set<string>();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const lowerName = removeVietnameseTones(file.name.toLowerCase());

    // 1. Chế độ chuyên biệt cho Hệ Thống Âm Thay Thế (8 Set)
    if (defaultScope === 'alt-only') {
      const matchedAlt = matchAltSetFromFilename(file.name);
      let targetTopicId = matchedAlt?.topicId;
      let matchNote = matchedAlt?.matchNote || '';

      if (!targetTopicId) {
        // Nếu tên file không chứa ký hiệu âm (ví dụ VID_001.mp4), tự động phân vào Set chưa có video theo thứ tự 1 -> 8
        const emptyTopic =
          ALTERNATIVE_SPELLINGS_DATA.find(
            (t) => !touchedAltSetsInBatch.has(t.id) && getLoadedAltSetVideos(t.id).length === 0
          ) ||
          ALTERNATIVE_SPELLINGS_DATA.find((t) => !touchedAltSetsInBatch.has(t.id)) ||
          ALTERNATIVE_SPELLINGS_DATA[i % ALTERNATIVE_SPELLINGS_DATA.length];

        targetTopicId = emptyTopic.id;
        matchNote = `Phân phối theo thứ tự vào ${emptyTopic.soundTitle}`;
      }

      const topicObj = ALTERNATIVE_SPELLINGS_DATA.find((t) => t.id === targetTopicId)!;
      const isFirstForThisSetInBatch = !touchedAltSetsInBatch.has(targetTopicId);
      touchedAltSetsInBatch.add(targetTopicId);

      // Nếu là file đầu tiên khớp Set này trong đợt upload thì ghi mới, nếu có nhiều file cùng thuộc 1 Set (vd oi.mp4 & ou.mp4) thì thêm vào cùng Set
      await saveAltSetVideo(
        targetTopicId,
        file,
        file.name,
        isFirstForThisSetInBatch ? 'replace' : 'append'
      );

      report.altSetCount++;
      report.items.push({
        file,
        fileName: file.name,
        targetCategory: 'alt-set',
        targetId: targetTopicId,
        targetTitle: `Set Âm Thay Thế: ${topicObj.soundTitle}`,
        matchNote,
      });
      continue;
    }

    // 2. Chế độ Tổng Kho Video ('all' | 'phonics-action' | 'phonics-mouth')
    // Kiểm tra xem file có đánh dấu thuộc Âm Thay Thế (alt, set, chuyen de, a_e, i_e, o_e, u_e, soft c, soft g, ay, ea, igh, ow, ew, ir, ur, oy...) không
    const hasExplicitAltKeyword =
      /\b(alt|alternative|thay[\s._-]*the|chuyen[\s._-]*de|set[\s._-]*[1-8]?|magic[\s._-]*e|soft[\s._-]*[cg]|[aeiou][_\s-]e|ay|ea|igh|ow|oe|ew|ir|ur|oy|oi[\s._-]ou)\b/i.test(
        lowerName
      );

    if (hasExplicitAltKeyword && defaultScope === 'all') {
      const matchedAlt = matchAltSetFromFilename(file.name);
      if (matchedAlt) {
        const topicObj = ALTERNATIVE_SPELLINGS_DATA.find((t) => t.id === matchedAlt.topicId)!;
        const isFirst = !touchedAltSetsInBatch.has(matchedAlt.topicId);
        touchedAltSetsInBatch.add(matchedAlt.topicId);

        await saveAltSetVideo(
          matchedAlt.topicId,
          file,
          file.name,
          isFirst ? 'replace' : 'append'
        );

        report.altSetCount++;
        report.items.push({
          file,
          fileName: file.name,
          targetCategory: 'alt-set',
          targetId: matchedAlt.topicId,
          targetTitle: `Set Âm Thay Thế: ${topicObj.soundTitle}`,
          matchNote: matchedAlt.matchNote,
        });
        continue;
      }
    }

    // Kiểm tra khớp 42 Âm Phonics
    const matched42 = matchPhonics42FromFilename(file.name);
    if (matched42) {
      let videoType: 'action' | 'mouth' = 'action';
      if (defaultScope === 'phonics-action') {
        videoType = 'action';
      } else if (defaultScope === 'phonics-mouth') {
        videoType = 'mouth';
      } else if (matched42.explicitType) {
        videoType = matched42.explicitType;
      } else {
        // Nếu người dùng tải 2 file cho cùng 1 âm (vd: s_1.mp4, s_2.mp4 hoặc s.mp4, s_copy.mp4)
        if (touchedPhonicsActionInBatch.has(matched42.soundId)) {
          videoType = 'mouth';
        } else {
          videoType = 'action';
        }
      }

      if (videoType === 'action') {
        touchedPhonicsActionInBatch.add(matched42.soundId);
        report.phonicsActionCount++;
      } else {
        report.phonicsMouthCount++;
      }

      await saveSoundVideo(matched42.soundId, videoType, file, file.name);
      report.items.push({
        file,
        fileName: file.name,
        targetCategory: videoType === 'action' ? 'phonics-action' : 'phonics-mouth',
        targetId: matched42.soundId,
        targetTitle: `${matched42.soundLabel} (${videoType === 'action' ? 'Bước 1: Hành Động' : 'Bước 2: Khẩu Hình'})`,
        matchNote: matched42.matchNote,
      });
      continue;
    }

    // Nếu không khớp 42 âm đơn thì thử khớp sang 8 Set Âm Thay Thế
    const fallbackAlt = matchAltSetFromFilename(file.name);
    if (fallbackAlt) {
      const topicObj = ALTERNATIVE_SPELLINGS_DATA.find((t) => t.id === fallbackAlt.topicId)!;
      const isFirst = !touchedAltSetsInBatch.has(fallbackAlt.topicId);
      touchedAltSetsInBatch.add(fallbackAlt.topicId);

      await saveAltSetVideo(
        fallbackAlt.topicId,
        file,
        file.name,
        isFirst ? 'replace' : 'append'
      );

      report.altSetCount++;
      report.items.push({
        file,
        fileName: file.name,
        targetCategory: 'alt-set',
        targetId: fallbackAlt.topicId,
        targetTitle: `Set Âm Thay Thế: ${topicObj.soundTitle}`,
        matchNote: fallbackAlt.matchNote,
      });
      continue;
    }

    // Fallback cuối cùng: phân vào Set Âm Thay Thế còn trống
    const fallbackTopic =
      ALTERNATIVE_SPELLINGS_DATA.find(
        (t) => !touchedAltSetsInBatch.has(t.id) && getLoadedAltSetVideos(t.id).length === 0
      ) || ALTERNATIVE_SPELLINGS_DATA[i % ALTERNATIVE_SPELLINGS_DATA.length];

    touchedAltSetsInBatch.add(fallbackTopic.id);
    await saveAltSetVideo(fallbackTopic.id, file, file.name, 'append');
    report.altSetCount++;
    report.items.push({
      file,
      fileName: file.name,
      targetCategory: 'alt-set',
      targetId: fallbackTopic.id,
      targetTitle: `Set Âm Thay Thế: ${fallbackTopic.soundTitle}`,
      matchNote: `Tự động xếp vào ${fallbackTopic.soundTitle}`,
    });
  }

  return report;
}

export function getPhonicsGroupVideoKey(groupId: number | string): string {
  return `phonics_group_${groupId}`;
}

export function getTrickyGroupVideoKey(groupId: number | string): string {
  return `tricky_group_${groupId}`;
}

/**
 * Tự động phân phối kho video học theo từng Nhóm:
 * - 'phonics-7-groups': 7 Nhóm Âm Cơ Bản (Nhóm 1 -> Nhóm 7)
 * - 'tricky-6-groups': 6 Nhóm Tricky Words (Nhóm 1 -> Nhóm 6)
 */
export async function autoDistributeGroupVideos(
  filesInput: FileList | File[],
  groupType: 'phonics-7-groups' | 'tricky-6-groups'
): Promise<VideoDistributionReport> {
  await initVideoStorage();

  const files = Array.from(filesInput).filter(
    (f) => f.type.startsWith('video/') || /\.(mp4|mov|webm|ogg|m4v|mkv)$/i.test(f.name)
  );

  const report: VideoDistributionReport = {
    totalFiles: files.length,
    altSetCount: 0,
    phonicsActionCount: 0,
    phonicsMouthCount: 0,
    items: [],
  };

  if (files.length === 0) return report;

  const maxGroup = groupType === 'phonics-7-groups' ? 7 : 6;
  const touchedGroups = new Set<number>();

  const phonicsGroupSoundPatterns: Record<number, RegExp> = {
    1: /\b(satipn|s[\s._-]*a[\s._-]*t|group[\s._-]*1|nhom[\s._-]*1)\b/i,
    2: /\b(ckehrmd|c[\s._-]*k[\s._-]*e|group[\s._-]*2|nhom[\s._-]*2)\b/i,
    3: /\b(goulfb|g[\s._-]*o[\s._-]*u|group[\s._-]*3|nhom[\s._-]*3)\b/i,
    4: /\b(aijoaieeor|ai[\s._-]*j[\s._-]*oa|group[\s._-]*4|nhom[\s._-]*4)\b/i,
    5: /\b(zwngvoo|z[\s._-]*w[\s._-]*ng|group[\s._-]*5|nhom[\s._-]*5)\b/i,
    6: /\b(yxchsh|y[\s._-]*x[\s._-]*ch|group[\s._-]*6|nhom[\s._-]*6)\b/i,
    7: /\b(quouoiueerar|qu[\s._-]*ou[\s._-]*oi|group[\s._-]*7|nhom[\s._-]*7)\b/i,
  };

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const noExt = file.name.replace(/\.[^/.]+$/, '').trim();
    const normalized = removeVietnameseTones(noExt).toLowerCase();

    let matchedGroupNum: number | null = null;
    let matchNote = '';

    // 1. Tìm số nhóm trực tiếp trong tên file: nhom 1, group 2, g3, set 4, bai 5, hoặc số 1..7 ở đầu/cuối
    const numMatch =
      normalized.match(
        new RegExp(`\\b(?:nhom|group|grp|g|set|bai|part|phan|tap)[\\s._-]*0?([1-${maxGroup}])\\b`, 'i')
      ) ||
      normalized.match(new RegExp(`^0?([1-${maxGroup}])(?:[\\s._-]|$)`)) ||
      normalized.match(new RegExp(`(?:[\\s._-])0?([1-${maxGroup}])$`));

    if (numMatch) {
      matchedGroupNum = parseInt(numMatch[1], 10);
      matchNote = `Khớp số Nhóm ${matchedGroupNum} trong tên file`;
    }

    // 2. Nếu chưa khớp số, thử khớp theo cụm âm hoặc từ Tricky Words
    if (!matchedGroupNum) {
      if (groupType === 'phonics-7-groups') {
        for (let g = 1; g <= 7; g++) {
          if (phonicsGroupSoundPatterns[g].test(normalized)) {
            matchedGroupNum = g;
            matchNote = `Khớp bộ âm Nhóm ${g}`;
            break;
          }
        }
      } else {
        // Tricky words 1..6
        const tokens = normalized.split(/[\s._\-\(\)\[\]]+/).filter(Boolean);
        for (let g = 1; g <= 6; g++) {
          const grpData = TRICKY_WORDS_DATA[g];
          const allWords = [...grpData.set1, ...grpData.set2].map((w) => w.toLowerCase());
          const hit = tokens.find((t) => t.length >= 2 && allWords.includes(t));
          if (hit) {
            matchedGroupNum = g;
            matchNote = `Khớp từ "${hit}" thuộc Nhóm ${g}`;
            break;
          }
        }
      }
    }

    // 3. Nếu vẫn chưa khớp, tự động xếp theo thứ tự vào Nhóm còn trống
    if (!matchedGroupNum) {
      const groupNums = Array.from({ length: maxGroup }, (_, idx) => idx + 1);
      const emptyGrp =
        groupNums.find((g) => {
          const key =
            groupType === 'phonics-7-groups' ? getPhonicsGroupVideoKey(g) : getTrickyGroupVideoKey(g);
          return !touchedGroups.has(g) && getLoadedAltSetVideos(key).length === 0;
        }) ||
        groupNums.find((g) => !touchedGroups.has(g)) ||
        ((i % maxGroup) + 1);

      matchedGroupNum = emptyGrp;
      matchNote = `Tự động xếp theo thứ tự vào Nhóm ${matchedGroupNum}`;
    }

    const storageKey =
      groupType === 'phonics-7-groups'
        ? getPhonicsGroupVideoKey(matchedGroupNum)
        : getTrickyGroupVideoKey(matchedGroupNum);

    const isFirstForGroupInBatch = !touchedGroups.has(matchedGroupNum);
    touchedGroups.add(matchedGroupNum);

    await saveAltSetVideo(
      storageKey,
      file,
      file.name,
      isFirstForGroupInBatch ? 'replace' : 'append'
    );

    const groupTitle =
      groupType === 'phonics-7-groups'
        ? PHONICS_GROUPS.find((g) => g.id === matchedGroupNum)?.name || `Nhóm ${matchedGroupNum}`
        : `Tricky Words Nhóm ${matchedGroupNum}`;

    report.altSetCount++;
    report.items.push({
      file,
      fileName: file.name,
      targetCategory: 'alt-set',
      targetId: String(matchedGroupNum),
      targetTitle: groupTitle,
      matchNote,
    });
  }

  return report;
}

