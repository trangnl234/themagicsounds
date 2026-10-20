export type CourseKey =
  | 'tune-in'
  | 'magic-sounds'
  | 'sound-code'
  | 'sound-to-speech';

const DB_NAME = 'phonics_course_covers_db';
const STORE_NAME = 'course_covers';
const DB_VERSION = 1;
const LOCAL_PREFIX = 'phonics_course_cover_v1_';

function openCoverDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function getStorageSlot(courseKey: CourseKey): string {
  // Dùng slot mới 'mimic_v2' cho khoá Mimic để xoá ảnh cũ có chữ "Sound to Speech" đã lưu trong bộ nhớ trình duyệt
  return courseKey === 'sound-to-speech' ? 'mimic_v2' : courseKey;
}

export async function loadCourseCover(courseKey: CourseKey): Promise<string> {
  const slot = getStorageSlot(courseKey);
  try {
    const db = await openCoverDb();
    const fromIdb = await new Promise<string>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(slot);
      req.onsuccess = () =>
        resolve(typeof req.result === 'string' ? req.result : '');
      req.onerror = () => resolve('');
    });
    if (fromIdb) return fromIdb;
  } catch {
    // ignore
  }

  try {
    return localStorage.getItem(LOCAL_PREFIX + slot) || '';
  } catch {
    return '';
  }
}

export const ALL_COURSE_KEYS: CourseKey[] = [
  'tune-in',
  'magic-sounds',
  'sound-code',
  'sound-to-speech',
];

export async function saveCourseCoverDataUrl(
  courseKey: CourseKey,
  dataUrl: string
): Promise<string> {
  if (!dataUrl) return '';
  const slot = getStorageSlot(courseKey);

  try {
    const db = await openCoverDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(dataUrl, slot);
      tx.oncomplete = () => resolve();
      reqErrorIgnore(tx);
      function reqErrorIgnore(t: IDBTransaction) {
        t.onerror = () => resolve();
      }
    });
  } catch {
    // ignore
  }

  try {
    localStorage.setItem(LOCAL_PREFIX + slot, dataUrl);
  } catch {
    // ignore quota errors
  }

  window.dispatchEvent(new CustomEvent('phonics-course-cover-updated'));
  return dataUrl;
}

export async function clearCourseCover(courseKey: CourseKey): Promise<void> {
  const slot = getStorageSlot(courseKey);
  try {
    const db = await openCoverDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(slot);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // ignore
  }

  try {
    localStorage.removeItem(LOCAL_PREFIX + slot);
  } catch {
    // ignore
  }

  window.dispatchEvent(new CustomEvent('phonics-course-cover-updated'));
}

export async function saveCourseCoverFile(
  courseKey: CourseKey,
  file: File
): Promise<string> {
  if (!file || !file.type.startsWith('image/')) return '';

  const dataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });

  if (!dataUrl) return '';
  return saveCourseCoverDataUrl(courseKey, dataUrl);
}

/**
 * Nhận diện tên file ảnh thuộc chương trình nào trong 4 chương trình
 */
function detectCourseKeyFromFilename(fileName: string): CourseKey | null {
  const norm = fileName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (
    norm.includes('mimic') ||
    norm.includes('speech') ||
    norm.includes('to-speech') ||
    norm.includes('tospeech') ||
    norm.includes('khoi am') ||
    norm.includes('khoi-am') ||
    /(?:^|[^0-9])0?4(?:[^0-9]|$)/.test(norm)
  ) {
    return 'sound-to-speech';
  }

  if (
    norm.includes('code') ||
    norm.includes('ipa') ||
    norm.includes('giai ma') ||
    norm.includes('giai-ma') ||
    /(?:^|[^0-9])0?3(?:[^0-9]|$)/.test(norm)
  ) {
    return 'sound-code';
  }

  if (
    norm.includes('magic') ||
    norm.includes('danh van') ||
    norm.includes('danh-van') ||
    norm.includes('tap doc') ||
    norm.includes('42') ||
    /(?:^|[^0-9])0?2(?:[^0-9]|$)/.test(norm)
  ) {
    return 'magic-sounds';
  }

  if (
    norm.includes('tune') ||
    norm.includes('joy') ||
    norm.includes('nghe ngam') ||
    norm.includes('nghe-ngam') ||
    /(?:^|[^0-9])0?1(?:[^0-9]|$)/.test(norm)
  ) {
    return 'tune-in';
  }

  return null;
}

/**
 * Tự động phân phối danh sách ảnh (tối đa 4 ảnh cùng lúc) vào đúng 4 chương trình:
 * 1. Tune In
 * 2. Magic Sounds
 * 3. Sound Code
 * 4. Mimic
 */
export async function distributeCourseCoverFiles(
  fileList: FileList | File[]
): Promise<Record<CourseKey, string>> {
  const files = Array.from(fileList)
    .filter((f) => f && f.type.startsWith('image/'))
    .slice(0, 4);

  const assignedFiles: Partial<Record<CourseKey, File>> = {};
  const unmatchedFiles: File[] = [];

  for (const file of files) {
    const matchedKey = detectCourseKeyFromFilename(file.name);
    if (matchedKey && !assignedFiles[matchedKey]) {
      assignedFiles[matchedKey] = file;
    } else {
      unmatchedFiles.push(file);
    }
  }

  // Các file còn lại phân bổ lần lượt theo đúng thứ tự Chương trình 1 -> 2 -> 3 -> 4
  for (const file of unmatchedFiles) {
    const nextEmptyKey = ALL_COURSE_KEYS.find((k) => !assignedFiles[k]);
    if (nextEmptyKey) {
      assignedFiles[nextEmptyKey] = file;
    }
  }

  const result: Record<CourseKey, string> = {
    'tune-in': '',
    'magic-sounds': '',
    'sound-code': '',
    'sound-to-speech': '',
  };

  for (const key of ALL_COURSE_KEYS) {
    const f = assignedFiles[key];
    if (f) {
      result[key] = await saveCourseCoverFile(key, f);
    } else {
      result[key] = await loadCourseCover(key);
    }
  }

  window.dispatchEvent(new CustomEvent('phonics-course-cover-updated'));
  return result;
}

