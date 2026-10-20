const DB_NAME = 'MsTrangShadowImagesDB';
const STORE_NAME = 'shadow_record_images';
const VIDEO_STORE_NAME = 'shadow_video_lessons';
const CLUSTER_STORE_NAME = 'shadow_clusters';
const DB_VERSION = 3;

export type TuneInSectionType = 'joy1' | 'joy2' | 'free';
export type JoyLessonKind = 'chant' | 'dialogue' | 'song' | 'story' | 'tongue';

export interface VideoShadowSegment {
  id: string;
  index: number;
  startTime: number;
  endTime: number;
  text: string;
}

export interface ShadowCluster {
  id: string;
  name: string; // Tên cụm do người dùng đặt (VD: Hoạt hình Mầm non, Hoạt hình Tiểu học...)
  coverImageUrl?: string; // Ảnh đại diện của cụm (DataURL)
  defaultLevel?: string; // Trình độ mặc định (Mầm non, Tiểu học, A1, A2, B1, B2...)
  isBuiltInTongueTwister?: boolean;
  sectionType?: TuneInSectionType; // 'joy1' | 'joy2' | 'free'
  unitNumber?: number; // 1..8 (dành cho JOY 1 và JOY 2)
  lessonKind?: JoyLessonKind; // 'chant' | 'dialogue' | 'song' | 'story' | 'tongue'
  updatedAt: number;
}

export interface StoredVideoShadowLesson {
  id: string;
  title: string; // Tiêu đề truyện/bài học tự động lấy từ tên file video
  coverImageUrl?: string; // Ảnh bìa riêng của từng truyện/video (DataURL)
  clusterId?: string; // ID của cụm chứa loạt video này (hoặc ID bài học trong Unit JOY, VD: 'joy1-u1-chant')
  groupLabel?: string;
  level?: string; // Phân loại trình độ (Mầm non, Tiểu học, A1, A2, B1, B2...)
  sectionType?: TuneInSectionType;
  unitNumber?: number;
  lessonKind?: JoyLessonKind;
  videoBlob?: Blob;
  videoUrl?: string;
  autoSilenceDetect?: boolean;
  segments: VideoShadowSegment[];
  updatedAt: number;
}

function openShadowImageDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(VIDEO_STORE_NAME)) {
        db.createObjectStore(VIDEO_STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CLUSTER_STORE_NAME)) {
        db.createObjectStore(CLUSTER_STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function loadAllShadowImages(): Promise<Record<string, string>> {
  try {
    const db = await openShadowImageDB();
    return await new Promise<Record<string, string>>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const result: Record<string, string> = {};
      const cursorReq = store.openCursor();

      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (cursor) {
          if (typeof cursor.key === 'string' && typeof cursor.value === 'string') {
            result[cursor.key] = cursor.value;
          }
          cursor.continue();
        } else {
          resolve(result);
        }
      };
      cursorReq.onerror = () => resolve(result);
    });
  } catch {
    return {};
  }
}

export async function saveShadowRecordImage(
  recordId: string,
  dataUrl: string
): Promise<void> {
  try {
    const db = await openShadowImageDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(dataUrl, recordId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to save shadow image:', err);
  }
}

export async function removeShadowRecordImage(recordId: string): Promise<void> {
  try {
    const db = await openShadowImageDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(recordId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to remove shadow image:', err);
  }
}

export function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!rawDataUrl) {
        reject(new Error('Invalid image data'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 960;
          let w = img.naturalWidth || img.width;
          let h = img.naturalHeight || img.height;
          if (w > maxDim || h > maxDim) {
            if (w >= h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, w);
          canvas.height = Math.max(1, h);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressed = canvas.toDataURL('image/webp', 0.9);
          resolve(
            compressed && compressed.startsWith('data:image/')
              ? compressed
              : canvas.toDataURL('image/jpeg', 0.9)
          );
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function loadAllShadowClusters(): Promise<ShadowCluster[]> {
  try {
    const db = await openShadowImageDB();
    return await new Promise<ShadowCluster[]>((resolve) => {
      const tx = db.transaction(CLUSTER_STORE_NAME, 'readonly');
      const store = tx.objectStore(CLUSTER_STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const items: ShadowCluster[] = Array.isArray(req.result) ? req.result : [];
        items.sort((a, b) => a.updatedAt - b.updatedAt);
        resolve(items);
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function saveShadowCluster(cluster: ShadowCluster): Promise<void> {
  try {
    const db = await openShadowImageDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(CLUSTER_STORE_NAME, 'readwrite');
      const store = tx.objectStore(CLUSTER_STORE_NAME);
      store.put(cluster);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to save shadow cluster:', err);
  }
}

export async function deleteShadowCluster(clusterId: string): Promise<void> {
  try {
    const db = await openShadowImageDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(CLUSTER_STORE_NAME, 'readwrite');
      const store = tx.objectStore(CLUSTER_STORE_NAME);
      store.delete(clusterId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to delete shadow cluster:', err);
  }
}

export function getPhonics42ImageKey(soundId: string): string {
  return `phonics42_${soundId}`;
}

export async function savePhonics42SoundImage(
  soundId: string,
  dataUrl: string
): Promise<void> {
  await saveShadowRecordImage(getPhonics42ImageKey(soundId), dataUrl);
  await saveShadowRecordImage(soundId, dataUrl);
}

export async function removePhonics42SoundImage(soundId: string): Promise<void> {
  await removeShadowRecordImage(getPhonics42ImageKey(soundId));
  await removeShadowRecordImage(soundId);
}

function stripViAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export interface SoundImageDistributionItem {
  fileName: string;
  soundId: string;
  soundLabel: string;
  dataUrl: string;
  matchNote: string;
}

const SOUND_KEYWORDS_MAP: Array<{
  soundId: string;
  exactPhonemes: string[];
  keywords: string[];
}> = [
  { soundId: 's', exactPhonemes: ['s', 'sss'], keywords: ['snake', 'con ran', 'ran'] },
  { soundId: 'a', exactPhonemes: ['a'], keywords: ['ant', 'con kien', 'kien'] },
  { soundId: 't', exactPhonemes: ['t'], keywords: ['tennis', 'bong tennis'] },
  { soundId: 'i', exactPhonemes: ['i'], keywords: ['inky', 'inky mouse', 'chuot inky', 'chuot'] },
  { soundId: 'p', exactPhonemes: ['p'], keywords: ['puff', 'candle', 'puff the candle', 'thoi nen', 'nen'] },
  { soundId: 'n', exactPhonemes: ['n', 'nnn'], keywords: ['airplane', 'plane', 'may bay', 'net'] },
  { soundId: 'c-k', exactPhonemes: ['c', 'k', 'ck', 'c-k', 'c_k'], keywords: ['castanets', 'go castanets', 'cat', 'kite'] },
  { soundId: 'e', exactPhonemes: ['e'], keywords: ['egg', 'qua trung', 'trung'] },
  { soundId: 'h', exactPhonemes: ['h'], keywords: ['hand', 'ban tay', 'ban tay am', 'hop'] },
  { soundId: 'r', exactPhonemes: ['r', 'rrr'], keywords: ['rag', 'keo khan', 'rabbit', 'puppy'] },
  { soundId: 'm', exactPhonemes: ['m', 'mmm'], keywords: ['meal', 'xoa bung', 'xoa bung ngon', 'mum'] },
  { soundId: 'd', exactPhonemes: ['d'], keywords: ['drum', 'go trong', 'trong'] },
  { soundId: 'g', exactPhonemes: ['g'], keywords: ['gurgle', 'suc hong', 'water'] },
  { soundId: 'o', exactPhonemes: ['o'], keywords: ['bat cong tac', 'cong tac', 'switch'] },
  { soundId: 'u', exactPhonemes: ['u'], keywords: ['umbrella', 'mo o', 'cai o'] },
  { soundId: 'l', exactPhonemes: ['l', 'lll'], keywords: ['lollipop', 'keo mut'] },
  { soundId: 'f', exactPhonemes: ['f', 'fff'], keywords: ['fish', 'ca xep hoi', 'ca bong'] },
  { soundId: 'b', exactPhonemes: ['b'], keywords: ['bat', 'gay bong chay', 'bong chay', 'ball'] },
  { soundId: 'ai', exactPhonemes: ['ai'], keywords: ['train', 'tau hoa', 'rain', 'snail'] },
  { soundId: 'j', exactPhonemes: ['j'], keywords: ['jelly', 'thach jelly', 'thach'] },
  { soundId: 'oa', exactPhonemes: ['oa'], keywords: ['surprise', 'ngac nhien', 'goat', 'boat', 'oak'] },
  { soundId: 'ie', exactPhonemes: ['ie'], keywords: ['soldier', 'salute', 'nguoi linh', 'pie', 'tie'] },
  { soundId: 'ee', exactPhonemes: ['ee'], keywords: ['donkey ears', 'tai lua', 'tree', 'bee'] },
  { soundId: 'or', exactPhonemes: ['or'], keywords: ['donkey sound', 'tieng lua', 'fork', 'corn', 'storm'] },
  { soundId: 'z', exactPhonemes: ['z', 'zzz'], keywords: ['hai con ong', 'con ong', 'buzz', 'zebra', 'zip'] },
  { soundId: 'w', exactPhonemes: ['w'], keywords: ['wind', 'con gio', 'gio thoi', 'web'] },
  { soundId: 'ng', exactPhonemes: ['ng'], keywords: ['barbell', 'nang ta', 'nguoi nang ta', 'ring', 'strong'] },
  { soundId: 'v', exactPhonemes: ['v', 'vvv'], keywords: ['van', 'xe van', 'drive'] },
  { soundId: 'oo-short', exactPhonemes: ['oo-short', 'oo_short', 'oo1', 'ooshort'], keywords: ['cuc cu ngan', 'cuckoo forward', 'book', 'look', 'cook', 'foot'] },
  { soundId: 'oo-long', exactPhonemes: ['oo-long', 'oo_long', 'oo2', 'oolong', 'oo'], keywords: ['cuc cu dai', 'cuckoo back', 'moon', 'zoo', 'spoon', 'pool'] },
  { soundId: 'y', exactPhonemes: ['y'], keywords: ['yoghurt', 'yogurt', 'an yoghurt', 'sua chua'] },
  { soundId: 'x', exactPhonemes: ['x', 'ks'], keywords: ['xray', 'x-ray', 'chup x-ray', 'fox', 'box', 'six'] },
  { soundId: 'ch', exactPhonemes: ['ch'], keywords: ['train wheels', 'banh xe tau', 'chick', 'chop', 'chin'] },
  { soundId: 'sh', exactPhonemes: ['sh', 'shh'], keywords: ['quiet', 'giu im lang', 'im lang', 'hush', 'ship', 'shop'] },
  { soundId: 'th-unvoiced', exactPhonemes: ['th-unvoiced', 'th_unvoiced', 'th1', 'th_nhe', 'thunvoiced'], keywords: ['thoi nhe', 'chu he thoi nhe', 'thin', 'moth', 'thumb', 'three'] },
  { soundId: 'th-voiced', exactPhonemes: ['th-voiced', 'th_voiced', 'th2', 'th_rung', 'thvoiced', 'th'], keywords: ['co rung', 'chu he co rung', 'this', 'that', 'feather'] },
  { soundId: 'qu', exactPhonemes: ['qu', 'kw'], keywords: ['duck beak', 'mo vit', 'quack', 'queen', 'duck'] },
  { soundId: 'ou', exactPhonemes: ['ou'], keywords: ['ouch', 'kim cham', 'pin prick', 'cloud', 'house', 'mouse'] },
  { soundId: 'oi', exactPhonemes: ['oi'], keywords: ['ship call', 'goi tau', 'ahoy', 'coin', 'oil', 'boil'] },
  { soundId: 'ue', exactPhonemes: ['ue'], keywords: ['point you', 'chi moi nguoi', 'blue', 'glue', 'rescue', 'statue'] },
  { soundId: 'er', exactPhonemes: ['er'], keywords: ['mixer', 'may tron', 'may tron xoay', 'her', 'sister', 'herb'] },
  { soundId: 'ar', exactPhonemes: ['ar'], keywords: ['dentist', 'kham rang', 'nha si', 'star', 'car', 'arm', 'far'] },
];

export function matchSoundIdFromImageFilename(
  fileName: string,
  allSoundIdsInOrder: string[]
): { soundId: string; matchNote: string } | null {
  const noExt = fileName.replace(/\.[^/.]+$/, '').trim();
  const clean = stripViAccents(noExt).toLowerCase();

  // Tránh nhận nhầm tên file mặc định kiểu Screenshot 2026..., IMG_1234, WhatsApp Image...
  const isGenericCameraOrScreenshot =
    /^(screenshot|screen[\s._-]*shot|img|image|dsc|photo|pic|anh[\s._-]*chup|zalo|whatsapp|untitled|copy)/i.test(
      clean
    );

  if (!isGenericCameraOrScreenshot) {
    const cleanedCore = clean
      .replace(/\b(am|sound|phonics|jolly|anh|hinh|card|the|group\s*\d+|nhom\s*\d+|g\d+)\b/g, ' ')
      .replace(/^\d+[\s._-]+/, '')
      .trim();

    const tokens = cleanedCore
      .split(/[\s._\-\(\)\[\]\/]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    // 1. Ưu tiên khớp âm ghép (2+ ký tự) trước để không bị trùng chữ cái đơn
    const multiCharMatchers = SOUND_KEYWORDS_MAP.filter(
      (m) => m.soundId.length > 1
    );
    const singleCharMatchers = SOUND_KEYWORDS_MAP.filter(
      (m) => m.soundId.length === 1
    );

    for (const matcher of [...multiCharMatchers, ...singleCharMatchers]) {
      if (matcher.exactPhonemes.includes(cleanedCore)) {
        return {
          soundId: matcher.soundId,
          matchNote: `Khớp tên âm "${cleanedCore}"`,
        };
      }
      for (const kw of matcher.keywords) {
        if (cleanedCore === kw || clean.includes(kw)) {
          return {
            soundId: matcher.soundId,
            matchNote: `Khớp từ khoá "${kw}"`,
          };
        }
      }
      for (const ph of matcher.exactPhonemes) {
        if (tokens.includes(ph)) {
          return {
            soundId: matcher.soundId,
            matchNote: `Khớp ký hiệu âm "/${ph}/"`,
          };
        }
      }
    }

    // 2. Khớp theo mẫu Nhóm + Vị trí (VD: g1-1, nhom2_3)
    const grpMatch = clean.match(
      /\b(?:g|group|nhom)[\s._-]*([1-7])[\s._-]+([1-6])\b/i
    );
    if (grpMatch) {
      const g = parseInt(grpMatch[1], 10);
      const idx = parseInt(grpMatch[2], 10);
      const globalIdx = (g - 1) * 6 + (idx - 1);
      if (allSoundIdsInOrder[globalIdx]) {
        return {
          soundId: allSoundIdsInOrder[globalIdx],
          matchNote: `Khớp Nhóm ${g} - Âm số ${idx}`,
        };
      }
    }

    // 3. Khớp số thứ tự 1..42 ở đầu tên file (VD: "01.png", "1_s.png", "42.jpg")
    const numMatch = clean.match(/^0?([1-9]|[1-3][0-9]|4[0-2])(?:[\s._-]|$)/);
    if (numMatch) {
      const idx = parseInt(numMatch[1], 10) - 1;
      if (allSoundIdsInOrder[idx]) {
        return {
          soundId: allSoundIdsInOrder[idx],
          matchNote: `Khớp số thứ tự #${idx + 1}`,
        };
      }
    }
  }

  return null;
}

export async function loadAllStoredVideoLessons(): Promise<StoredVideoShadowLesson[]> {
  try {
    const db = await openShadowImageDB();
    return await new Promise<StoredVideoShadowLesson[]>((resolve) => {
      const tx = db.transaction(VIDEO_STORE_NAME, 'readonly');
      const store = tx.objectStore(VIDEO_STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const items: StoredVideoShadowLesson[] = Array.isArray(req.result)
          ? req.result
          : [];
        const hydrated = items.map((item) => {
          if (item.videoBlob instanceof Blob) {
            return {
              ...item,
              videoUrl: URL.createObjectURL(item.videoBlob),
            };
          }
          return item;
        });
        resolve(hydrated);
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function saveStoredVideoLesson(
  lesson: StoredVideoShadowLesson
): Promise<void> {
  try {
    const db = await openShadowImageDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(VIDEO_STORE_NAME, 'readwrite');
      const store = tx.objectStore(VIDEO_STORE_NAME);
      // Không lưu blob URL tạm thời vào DB, chỉ lưu videoBlob gốc
      const toStore: StoredVideoShadowLesson = {
        ...lesson,
        videoUrl:
          lesson.videoUrl && lesson.videoUrl.startsWith('blob:')
            ? ''
            : lesson.videoUrl,
      };
      store.put(toStore);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to save video lesson:', err);
  }
}

export async function deleteStoredVideoLesson(id: string): Promise<void> {
  try {
    const db = await openShadowImageDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(VIDEO_STORE_NAME, 'readwrite');
      const store = tx.objectStore(VIDEO_STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to delete video lesson:', err);
  }
}
