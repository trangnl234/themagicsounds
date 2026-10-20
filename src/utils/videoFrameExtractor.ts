import {
  initVideoStorage,
  getAllLoadedVideos,
  getLoadedSoundVideos,
  getLoadedAltSetVideos,
  getPhonicsGroupVideoKey,
} from './videoStorage';
import {
  loadAllShadowImages,
  loadAllShadowClusters,
  loadAllStoredVideoLessons,
} from './shadowImageStorage';
import { TONGUE_TWISTERS_DATA } from '../data/tongueTwistersData';
import { PHONICS_42_SOUNDS } from '../data/phonicsData';

const FRAME_CACHE_PREFIX = 'phonics_video_frame_v3_';
const memoryFrameCache = new Map<string, { dataUrl: string; score: number }>();
const courseCoverMemoryCache = new Map<string, string>();

/**
 * Xoá bộ nhớ đệm ảnh bìa khi có ảnh/video mới được cập nhật
 */
export function invalidateVideoFrameCache() {
  courseCoverMemoryCache.clear();
}

/**
 * Tính điểm tươi sáng, rực rỡ màu sắc và ưu tiên khung hình có biểu tượng phát âm nhỏ màu đỏ
 */
export function computeCanvasVibranceScore(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): { brightness: number; saturation: number; redAccentRatio: number; score: number } {
  try {
    const sample = ctx.getImageData(0, 0, w, h).data;
    let sumB = 0;
    let sumS = 0;
    let redPixels = 0;
    let count = 0;
    const step = Math.max(4, Math.floor(sample.length / 600) * 4);

    for (let i = 0; i < sample.length; i += step) {
      const a = sample[i + 3];
      if (a < 40) continue;
      const r = sample[i] / 255;
      const g = sample[i + 1] / 255;
      const b = sample[i + 2] / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = (max + min) / 2;
      const d = max - min;
      const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

      if (r > 0.68 && g < 0.36 && b < 0.36 && r - Math.max(g, b) > 0.32) {
        redPixels++;
      }

      sumB += l;
      sumS += s;
      count++;
    }

    if (count === 0) {
      return { brightness: 0, saturation: 0, redAccentRatio: 0, score: 0 };
    }

    const avgB = sumB / count;
    const avgS = sumS / count;
    const redAccentRatio = redPixels / count;

    if (avgB < 0.1) {
      return {
        brightness: avgB * 255,
        saturation: avgS,
        redAccentRatio,
        score: avgB * 20,
      };
    }

    const adjustedB = avgB > 0.96 ? 0.65 : avgB;
    const redBonus =
      redAccentRatio >= 0.004 && redAccentRatio <= 0.3
        ? Math.min(45, redAccentRatio * 450)
        : 0;

    const score = adjustedB * 100 + avgS * 135 + redBonus;
    return {
      brightness: avgB * 255,
      saturation: avgS,
      redAccentRatio,
      score,
    };
  } catch {
    return { brightness: 128, saturation: 0.5, redAccentRatio: 0, score: 60 };
  }
}

/**
 * Chấm điểm độ tươi sáng & điểm nhấn âm màu đỏ của 1 DataURL hoặc Image URL bất kỳ
 */
export async function scoreImageDataUrl(srcUrl: string): Promise<number> {
  if (!srcUrl) return -1;
  const cached = memoryFrameCache.get(`score_${srcUrl.slice(0, 120)}`);
  if (cached) return cached.score;

  return new Promise((resolve) => {
    const img = new Image();
    if (/^https?:/i.test(srcUrl)) {
      img.crossOrigin = 'anonymous';
    }
    const timer = window.setTimeout(() => resolve(0), 1500);

    img.onload = () => {
      window.clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 48;
        canvas.height = 36;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(50);
          return;
        }
        ctx.drawImage(img, 0, 0, 48, 36);
        const { score } = computeCanvasVibranceScore(ctx, 48, 36);
        memoryFrameCache.set(`score_${srcUrl.slice(0, 120)}`, {
          dataUrl: '',
          score,
        });
        resolve(score);
      } catch {
        resolve(50);
      }
    };

    img.onerror = () => {
      window.clearTimeout(timer);
      resolve(-1);
    };

    img.src = srcUrl;
  });
}

/**
 * Đọc nhanh khung hình đã lưu trong bộ nhớ hoặc localStorage (0ms, không tạo thẻ video)
 */
export function getCachedVideoFrameSync(
  cacheKey: string,
  seekRatio = 0.35
): string {
  const key = `${cacheKey}_${seekRatio}`;
  const mem = memoryFrameCache.get(key);
  if (mem?.dataUrl) return mem.dataUrl;

  try {
    const saved = localStorage.getItem(FRAME_CACHE_PREFIX + key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.dataUrl) {
        memoryFrameCache.set(key, parsed);
        return parsed.dataUrl;
      }
    }
  } catch {
    // ignore
  }
  return '';
}

/**
 * Tự động cắt 1 khung hình tươi sáng từ URL video
 */
export async function extractFrameFromVideoUrl(
  videoUrl: string,
  cacheKey?: string,
  seekRatio = 0.35
): Promise<{ dataUrl: string; score: number }> {
  if (!videoUrl) return { dataUrl: '', score: -1 };

  const key = cacheKey ? `${cacheKey}_${seekRatio}` : videoUrl;
  const mem = memoryFrameCache.get(key);
  if (mem && mem.dataUrl) {
    return mem;
  }

  if (cacheKey) {
    const cachedUrl = getCachedVideoFrameSync(cacheKey, seekRatio);
    if (cachedUrl) {
      return memoryFrameCache.get(key) || { dataUrl: cachedUrl, score: 80 };
    }
  }

  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    if (/^https?:/i.test(videoUrl)) {
      video.crossOrigin = 'anonymous';
    }

    let finished = false;

    const finish = (res: { dataUrl: string; score: number }) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeoutId);
      try {
        video.removeAttribute('src');
        video.load();
      } catch {
        // ignore
      }
      if (res.dataUrl) {
        memoryFrameCache.set(key, res);
        if (cacheKey) {
          try {
            localStorage.setItem(FRAME_CACHE_PREFIX + key, JSON.stringify(res));
          } catch {
            // ignore quota errors
          }
        }
      }
      resolve(res);
    };

    const timeoutId = window.setTimeout(() => {
      finish({ dataUrl: '', score: -1 });
    }, 2500);

    const captureCurrent = (): { dataUrl: string; score: number } => {
      const vw = video.videoWidth || 360;
      const vh = video.videoHeight || 202;
      const maxW = 360;
      const scale = vw > maxW ? maxW / vw : 1;
      const cw = Math.max(1, Math.round(vw * scale));
      const ch = Math.max(1, Math.round(vh * scale));

      const canvas = document.createElement('canvas');
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext('2d');
      if (!ctx) return { dataUrl: '', score: -1 };

      ctx.drawImage(video, 0, 0, cw, ch);
      const { score } = computeCanvasVibranceScore(ctx, cw, ch);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      return { dataUrl, score };
    };

    video.onloadedmetadata = () => {
      const dur =
        Number.isFinite(video.duration) && video.duration > 0
          ? video.duration
          : 4;
      const targetTime = Math.min(
        Math.max(0.3, dur * seekRatio),
        Math.max(0.3, dur - 0.15)
      );
      try {
        video.currentTime = targetTime;
      } catch {
        finish(captureCurrent());
      }
    };

    video.onseeked = () => {
      finish(captureCurrent());
    };

    video.onerror = () => {
      finish({ dataUrl: '', score: -1 });
    };

    video.src = videoUrl;
  });
}

/**
 * Tìm mã recordId ('tt-01'..'tt-49') tương ứng với 1 âm trong 42 âm cơ bản
 */
export function findMatchingTongueTwisterRecordId(soundId: string): string {
  const clean = (soundId || '').toLowerCase().trim();
  if (!clean) return 'tt-01';
  if (clean === 'c-k') return 'tt-07';
  if (clean === 'oo-short' || clean === 'oo-long') return 'tt-29';
  if (clean === 'th-unvoiced' || clean === 'th-voiced') return 'tt-34';

  const match = TONGUE_TWISTERS_DATA.find(
    (r) =>
      (r.phonemeKey || '').toLowerCase() === clean ||
      (r.soundTitle || '').replace(/\//g, '').toLowerCase() === clean
  );
  return match?.id || 'tt-01';
}

/**
 * Nạp siêu nhanh toàn bộ hình đại diện đã có cho 42 âm (chỉ mở IndexedDB đúng 1 lần duy nhất, 0 độ trễ)
 * Ưu tiên số 1: Ảnh đại diện riêng được tải lên cho từng âm trong 42 Sounds (`phonics42_${s.id}` hoặc `s.id`)
 */
export async function loadFastSoundThumbnailsMap(): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  try {
    const shadowImages = await loadAllShadowImages();
    for (const s of PHONICS_42_SOUNDS) {
      const dedicatedKey = `phonics42_${s.id}`;
      if (shadowImages[dedicatedKey]) {
        result[s.id] = shadowImages[dedicatedKey];
      } else if (shadowImages[s.id]) {
        result[s.id] = shadowImages[s.id];
      } else {
        const cached = getCachedVideoFrameSync(`sound_${s.id}`, 0.35);
        if (cached) {
          result[s.id] = cached;
        }
      }
    }
  } catch {
    // ignore
  }
  return result;
}

/**
 * Lấy ảnh đại diện cho 1 âm cụ thể trong 42 Sounds
 */
export async function getThumbnailForPhonicsSound(
  soundId: string,
  groupId: number,
  indexInGroup: number,
  preloadedShadowImages?: Record<string, string>
): Promise<string> {
  try {
    const shadowImages = preloadedShadowImages || (await loadAllShadowImages());
    const dedicatedKey = `phonics42_${soundId}`;
    if (shadowImages[dedicatedKey]) {
      return shadowImages[dedicatedKey];
    }
    if (shadowImages[soundId]) {
      return shadowImages[soundId];
    }

    const cachedDirect = getCachedVideoFrameSync(`sound_${soundId}`, 0.35);
    if (cachedDirect) return cachedDirect;

    const soundVideos = getLoadedSoundVideos(soundId);
    const directVideoUrl =
      soundVideos?.actionVideo?.playUrl || soundVideos?.mouthVideo?.playUrl;
    if (directVideoUrl) {
      const extracted = await extractFrameFromVideoUrl(
        directVideoUrl,
        `sound_${soundId}`,
        0.35
      );
      if (extracted.dataUrl) return extracted.dataUrl;
    }

    const ratio = Math.min(0.88, Math.max(0.12, (indexInGroup + 0.5) / 6));
    const cachedGrp = getCachedVideoFrameSync(
      `grp_${groupId}_idx_${indexInGroup}`,
      ratio
    );
    if (cachedGrp) return cachedGrp;
  } catch {
    // ignore
  }
  return '';
}

/**
 * Quét nhanh các hình cắt từ video (ở chỗ phát ra âm nhỏ màu đỏ & kho video bài học)
 * và chọn ra bức hình có màu sắc tươi sáng nhất cho Tune In và Magic Sounds.
 */
export async function findBrightestVideoCutThumbnail(
  courseKey: 'tune-in' | 'magic-sounds'
): Promise<string> {
  const cachedCover = courseCoverMemoryCache.get(courseKey);
  if (cachedCover) return cachedCover;

  try {
    const [shadowImgs, clusters, videoLessons] = await Promise.all([
      loadAllShadowImages(),
      loadAllShadowClusters(),
      loadAllStoredVideoLessons(),
    ]);

    const candidateUrls: string[] = [];

    Object.values(shadowImgs || {}).forEach((dataUrl) => {
      if (dataUrl && typeof dataUrl === 'string') {
        candidateUrls.push(dataUrl);
      }
    });

    (videoLessons || []).forEach((lesson) => {
      if (lesson?.coverImageUrl) {
        candidateUrls.push(lesson.coverImageUrl);
      }
    });
    (clusters || []).forEach((cluster) => {
      if (cluster?.coverImageUrl) {
        candidateUrls.push(cluster.coverImageUrl);
      }
    });

    if (candidateUrls.length === 0) return '';

    const scored: { url: string; score: number }[] = [];
    for (const url of candidateUrls.slice(0, 12)) {
      const score = await scoreImageDataUrl(url);
      if (score > 0) {
        scored.push({ url, score });
      }
    }

    if (scored.length === 0) return candidateUrls[0] || '';

    scored.sort((a, b) => b.score - a.score);

    const tuneInBest = scored[0].url;
    const magicSoundsBest = (scored[1] || scored[0]).url;

    courseCoverMemoryCache.set('tune-in', tuneInBest);
    courseCoverMemoryCache.set('magic-sounds', magicSoundsBest);

    return courseKey === 'tune-in' ? tuneInBest : magicSoundsBest;
  } catch {
    return '';
  }
}
