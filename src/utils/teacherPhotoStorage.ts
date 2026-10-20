/**
 * Lưu trữ & xử lý tách nền thông minh (Flood-Fill Matting) cho ảnh Cô Trang ASI
 * Giúp biến ảnh chụp phông trắng studio thành ảnh chụp tự nhiên trong lớp học / bối cảnh thực tế để đăng bài web.
 */

const DB_NAME = 'MsTrangPhonicsTeacherPhotoDB';
const STORE_NAME = 'teacher_photos';
const PHOTO_RECORD_KEY = 'ms_trang_asi_direct_photo_v3';
const LEGACY_RECORD_KEY = 'main_teacher_photo';
const DB_VERSION = 1;

/**
 * URL mặc định trỏ tới file ảnh gốc /ms-trang-asi.png (nếu đã lưu trên server) hoặc chuỗi rỗng để hiển thị khung chọn ảnh gốc 100%
 */
export const DEFAULT_MS_TRANG_ASI_SVG_DATA_URL = '';

export interface ScenePreset {
  id: string;
  name: string;
  desc: string;
  badgeText?: string;
  drawBackground: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  warmOverlayColor: string;
}

export interface StoredTeacherPhotoData {
  rawDataUrl: string; // Ảnh gốc 100% người dùng tải lên (không chỉnh sửa)
  compositedSquareUrl: string;
  compositedPortraitUrl: string;
  compositedBannerUrl: string;
  selectedSceneId: string;
  updatedAt: number;
}

let cachedPhotoData: StoredTeacherPhotoData | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

export function subscribeTeacherPhotoUpdates(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function openDB(): Promise<IDBDatabase> {
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

async function syncRawPhotoToServer(dataUrl: string): Promise<void> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return;
  try {
    await fetch('/api/teacher-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl }),
    });
  } catch {
    // Ignore network error if static build
  }
}

export async function initTeacherPhotoStorage(): Promise<StoredTeacherPhotoData | null> {
  try {
    const db = await openDB();
    const fromIdb = await new Promise<StoredTeacherPhotoData | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const reqPrimary = store.get(PHOTO_RECORD_KEY);

      reqPrimary.onsuccess = () => {
        if (reqPrimary.result && reqPrimary.result.rawDataUrl) {
          const raw = reqPrimary.result.rawDataUrl;
          resolve({
            rawDataUrl: raw,
            compositedSquareUrl: raw,
            compositedPortraitUrl: raw,
            compositedBannerUrl: raw,
            selectedSceneId: 'original',
            updatedAt: reqPrimary.result.updatedAt || Date.now(),
          });
          return;
        }

        // Kiểm tra cả khóa cũ 'main_teacher_photo' nếu người dùng đã tải ảnh lên trước đó
        const reqLegacy = store.get(LEGACY_RECORD_KEY);
        reqLegacy.onsuccess = () => {
          if (reqLegacy.result && reqLegacy.result.rawDataUrl) {
            const raw = reqLegacy.result.rawDataUrl;
            resolve({
              rawDataUrl: raw,
              compositedSquareUrl: raw,
              compositedPortraitUrl: raw,
              compositedBannerUrl: raw,
              selectedSceneId: 'original',
              updatedAt: reqLegacy.result.updatedAt || Date.now(),
            });
          } else {
            resolve(null);
          }
        };
        reqLegacy.onerror = () => resolve(null);
      };
      reqPrimary.onerror = () => resolve(null);
    });

    if (fromIdb?.rawDataUrl) {
      cachedPhotoData = fromIdb;
      notifyListeners();
      syncRawPhotoToServer(fromIdb.rawDataUrl);
      return cachedPhotoData;
    }
  } catch {
    // Ignore IDB errors
  }

  // Kiểm tra xem trên server đã có file /ms-trang-asi.png chưa
  try {
    const res = await fetch('/api/teacher-photo');
    if (res.ok) {
      const info = await res.json();
      if (info?.exists && info?.url) {
        cachedPhotoData = {
          rawDataUrl: info.url,
          compositedSquareUrl: info.url,
          compositedPortraitUrl: info.url,
          compositedBannerUrl: info.url,
          selectedSceneId: 'original',
          updatedAt: Date.now(),
        };
        notifyListeners();
        return cachedPhotoData;
      }
    }
  } catch {
    // Ignore
  }

  return cachedPhotoData;
}

export function getLoadedTeacherPhoto(): StoredTeacherPhotoData | null {
  return cachedPhotoData;
}

export async function saveTeacherPhotoData(data: StoredTeacherPhotoData): Promise<void> {
  // Luôn giữ nguyên 100% ảnh gốc rawDataUrl cho hiển thị trên web
  const originalOnly: StoredTeacherPhotoData = {
    ...data,
    compositedSquareUrl: data.rawDataUrl,
    compositedPortraitUrl: data.rawDataUrl,
    compositedBannerUrl: data.rawDataUrl,
    selectedSceneId: 'original',
  };
  cachedPhotoData = originalOnly;
  notifyListeners();
  syncRawPhotoToServer(originalOnly.rawDataUrl);

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(originalOnly, PHOTO_RECORD_KEY);
      store.put(originalOnly, LEGACY_RECORD_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Could not persist teacher photo to IndexedDB:', err);
  }
}

/**
 * Thuật toán Flood-Fill từ viền ảnh để tách nền trắng studio mà giữ nguyên 100% chi tiết bên trong
 * (kể cả viền trắng trên cổ áo xanh, tay áo và ánh mắt).
 */
export function removeWhiteBackdropFloodFill(img: HTMLImageElement): HTMLCanvasElement {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.drawImage(img, 0, 0, w, h);
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  const total = w * h;
  const isBg = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const isWhiteBackdropPixel = (idx: number): boolean => {
    const p = idx * 4;
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    const a = data[p + 3];
    if (a < 30) return true;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    // Nền trắng hoặc xám cực sáng đồng nhất ngoài viền
    return min >= 224 && max - min <= 26;
  };

  // Seed từ 3 cạnh: trên, trái, phải và phần dưới hai bên
  for (let x = 0; x < w; x++) {
    const topIdx = x;
    if (!isBg[topIdx] && isWhiteBackdropPixel(topIdx)) {
      isBg[topIdx] = 1;
      queue[tail++] = topIdx;
    }
  }
  for (let y = 0; y < h; y++) {
    const leftIdx = y * w;
    if (!isBg[leftIdx] && isWhiteBackdropPixel(leftIdx)) {
      isBg[leftIdx] = 1;
      queue[tail++] = leftIdx;
    }
    const rightIdx = y * w + (w - 1);
    if (!isBg[rightIdx] && isWhiteBackdropPixel(rightIdx)) {
      isBg[rightIdx] = 1;
      queue[tail++] = rightIdx;
    }
  }

  // BFS lan truyền vùng nền trắng bên ngoài
  while (head < tail) {
    const curr = queue[head++];
    const cx = curr % w;
    const cy = (curr - cx) / w;

    // 4 hướng
    if (cx > 0) {
      const n = curr - 1;
      if (!isBg[n] && isWhiteBackdropPixel(n)) {
        isBg[n] = 1;
        queue[tail++] = n;
      }
    }
    if (cx < w - 1) {
      const n = curr + 1;
      if (!isBg[n] && isWhiteBackdropPixel(n)) {
        isBg[n] = 1;
        queue[tail++] = n;
      }
    }
    if (cy > 0) {
      const n = curr - w;
      if (!isBg[n] && isWhiteBackdropPixel(n)) {
        isBg[n] = 1;
        queue[tail++] = n;
      }
    }
    if (cy < h - 1) {
      const n = curr + w;
      if (!isBg[n] && isWhiteBackdropPixel(n)) {
        isBg[n] = 1;
        queue[tail++] = n;
      }
    }
  }

  // Xử lý làm mềm biên (Feathering & Spill Suppression) để tóc và viền áo hòa tự nhiên vào nền mới
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const p = idx * 4;

      if (isBg[idx] === 1) {
        data[p + 3] = 0;
        continue;
      }

      // Kiểm tra xem điểm ảnh này có sát biên nền trắng không
      const neighborBgCount =
        isBg[idx - 1] +
        isBg[idx + 1] +
        isBg[idx - w] +
        isBg[idx + w] +
        isBg[idx - w - 1] +
        isBg[idx - w + 1] +
        isBg[idx + w - 1] +
        isBg[idx + w + 1];

      if (neighborBgCount > 0) {
        const r = data[p];
        const g = data[p + 1];
        const b = data[p + 2];
        const lum = (r + g + b) / 3;

        // Khử viền sáng trắng (de-fringe) ở mép tóc và mép áo
        if (lum > 200) {
          const factor = Math.max(0.15, (250 - lum) / 55);
          data[p + 3] = Math.round(data[p + 3] * factor);
        } else {
          data[p + 3] = Math.round(data[p + 3] * (1 - neighborBgCount * 0.06));
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * 6 Bối cảnh tự nhiên, ấm áp, có chiều sâu bokeh quang học để ghép ảnh Cô Trang ASI đăng bài web
 */
export const NATURAL_SCENE_PRESETS: ScenePreset[] = [
  {
    id: 'warm-classroom',
    name: 'Lớp Học Phonics Nắng Ấm',
    desc: 'Ánh nắng tự nhiên qua cửa sổ, kệ sách gỗ bokeh mờ nhẹ ấm áp',
    warmOverlayColor: 'rgba(255, 238, 210, 0.09)',
    drawBackground: (ctx, w, h) => {
      // Nền tường lớp học kem ấm áp tự nhiên
      const wallGrad = ctx.createLinearGradient(0, 0, w, h);
      wallGrad.addColorStop(0, '#fdf8f0');
      wallGrad.addColorStop(0.5, '#f6ede0');
      wallGrad.addColorStop(1, '#eadbc8');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, w, h);

      // Ánh nắng tự nhiên chiếu xiên từ cửa sổ bên trái
      ctx.save();
      const sunGrad = ctx.createRadialGradient(w * 0.15, h * 0.15, 10, w * 0.25, h * 0.35, w * 0.85);
      sunGrad.addColorStop(0, 'rgba(255, 248, 225, 0.85)');
      sunGrad.addColorStop(0.5, 'rgba(255, 236, 195, 0.35)');
      sunGrad.addColorStop(1, 'rgba(255, 236, 195, 0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // Kệ gỗ mờ hậu cảnh (Bokeh)
      ctx.save();
      ctx.fillStyle = 'rgba(212, 180, 140, 0.32)';
      ctx.fillRect(0, h * 0.58, w, h * 0.035);
      ctx.fillRect(0, h * 0.82, w, h * 0.035);

      // Những quyển sách sắc màu mờ bokeh trên kệ
      const bookColors = [
        'rgba(239, 68, 68, 0.22)',
        'rgba(59, 130, 246, 0.22)',
        'rgba(16, 185, 129, 0.22)',
        'rgba(245, 158, 11, 0.25)',
        'rgba(168, 85, 247, 0.20)',
      ];
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = bookColors[i % bookColors.length];
        const bx = w * 0.05 + i * (w * 0.06);
        const bh = h * (0.12 + (i % 3) * 0.025);
        ctx.beginPath();
        ctx.roundRect(bx, h * 0.58 - bh, w * 0.045, bh, 6);
        ctx.fill();
      }

      // Cây xanh bokeh góc phải
      const leafColors = ['rgba(74, 160, 104, 0.22)', 'rgba(110, 190, 130, 0.26)', 'rgba(52, 135, 85, 0.18)'];
      for (let i = 0; i < 12; i++) {
        ctx.fillStyle = leafColors[i % leafColors.length];
        ctx.beginPath();
        ctx.arc(
          w * (0.82 + Math.sin(i * 1.7) * 0.12),
          h * (0.25 + (i / 12) * 0.45),
          w * (0.04 + (i % 3) * 0.018),
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // Bokeh ánh nắng lung linh nhẹ
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      [
        [0.18, 0.22, 0.035],
        [0.28, 0.16, 0.025],
        [0.78, 0.2, 0.04],
        [0.88, 0.32, 0.03],
        [0.12, 0.42, 0.028],
      ].forEach(([rx, ry, rr]) => {
        ctx.beginPath();
        ctx.arc(w * rx, h * ry, w * rr, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    },
  },
  {
    id: 'sunlit-library',
    name: 'Thư Viện Sách Anh Quốc',
    desc: 'Không gian học thuật trang nhã, sáng sủa, chuyên nghiệp',
    warmOverlayColor: 'rgba(255, 244, 228, 0.08)',
    drawBackground: (ctx, w, h) => {
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#f4f7fb');
      bgGrad.addColorStop(0.6, '#e9eff6');
      bgGrad.addColorStop(1, '#dce5f0');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Khung cửa sổ sáng mờ phía sau
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.roundRect(w * 0.08, h * 0.08, w * 0.34, h * 0.55, 16);
      ctx.fill();

      // Ánh sáng tỏa từ cửa sổ
      const glow = ctx.createRadialGradient(w * 0.25, h * 0.3, 10, w * 0.3, h * 0.35, w * 0.7);
      glow.addColorStop(0, 'rgba(255, 252, 240, 0.75)');
      glow.addColorStop(1, 'rgba(255, 252, 240, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // Bảng trắng học tập mờ bên phải
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.5)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(w * 0.56, h * 0.12, w * 0.38, h * 0.45, 16);
      ctx.fill();
      ctx.stroke();

      // Thẻ âm Phonics màu pastel mờ trên bảng
      const cardColors = ['rgba(239, 68, 68, 0.16)', 'rgba(59, 130, 246, 0.16)', 'rgba(16, 185, 129, 0.16)'];
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = cardColors[i];
        ctx.beginPath();
        ctx.roundRect(w * (0.6 + i * 0.1), h * 0.2, w * 0.08, h * 0.1, 8);
        ctx.fill();
      }
      ctx.restore();
    },
  },
  {
    id: 'natural-garden',
    name: 'Khuôn Viên Xanh Tự Nhiên',
    desc: 'Nền cây xanh và nắng sớm ngoài trời tươi tắn, gần gũi',
    warmOverlayColor: 'rgba(255, 245, 215, 0.1)',
    drawBackground: (ctx, w, h) => {
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#eef7f2');
      skyGrad.addColorStop(0.5, '#dff0e5');
      skyGrad.addColorStop(1, '#c9e4d2');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Bokeh lá cây xanh nắng vàng
      const circles = [
        { x: 0.15, y: 0.2, r: 0.16, c: 'rgba(134, 209, 156, 0.35)' },
        { x: 0.85, y: 0.22, r: 0.18, c: 'rgba(110, 195, 138, 0.35)' },
        { x: 0.25, y: 0.65, r: 0.2, c: 'rgba(167, 226, 180, 0.3)' },
        { x: 0.8, y: 0.7, r: 0.22, c: 'rgba(92, 178, 122, 0.28)' },
        { x: 0.5, y: 0.15, r: 0.15, c: 'rgba(253, 242, 185, 0.45)' },
        { x: 0.2, y: 0.3, r: 0.06, c: 'rgba(255, 255, 255, 0.5)' },
        { x: 0.72, y: 0.28, r: 0.05, c: 'rgba(255, 255, 255, 0.45)' },
        { x: 0.88, y: 0.42, r: 0.04, c: 'rgba(255, 250, 210, 0.5)' },
      ];
      circles.forEach((b) => {
        ctx.fillStyle = b.c;
        ctx.beginPath();
        ctx.arc(w * b.x, h * b.y, w * b.r, 0, Math.PI * 2);
        ctx.fill();
      });
    },
  },
  {
    id: 'editorial-cream',
    name: 'Studio Kem Ấm Đăng Web',
    desc: 'Phông nền biên tập tạp chí giáo dục sang trọng, nổi bật áo vàng ASI',
    warmOverlayColor: 'rgba(255, 240, 220, 0.06)',
    drawBackground: (ctx, w, h) => {
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.38, w * 0.05, w * 0.5, h * 0.5, w * 0.85);
      grad.addColorStop(0, '#fffdf9');
      grad.addColorStop(0.55, '#f5ece0');
      grad.addColorStop(1, '#e5d5c3');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Vòng tròn hào quang ấm nhẹ phía sau lưng cô
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.42, w * 0.34, 0, Math.PI * 2);
      ctx.fill();
    },
  },
];

export interface ComposeOptions {
  sceneId: string;
  aspect: '3:4' | '16:9' | '1:1';
  showBadge: boolean;
  headlineText?: string;
  subText?: string;
}

/**
 * Kết xuất ảnh Cô Trang ASI hoàn chỉnh với bối cảnh tự nhiên, ánh sáng ấm và đổ bóng mềm
 */
export function renderNaturalTeacherComposite(
  mattedSubjectCanvas: HTMLCanvasElement,
  options: ComposeOptions
): string {
  const scene =
    NATURAL_SCENE_PRESETS.find((s) => s.id === options.sceneId) || NATURAL_SCENE_PRESETS[0];

  let width = 900;
  let height = 1200;
  if (options.aspect === '16:9') {
    width = 1280;
    height = 720;
  } else if (options.aspect === '1:1') {
    width = 900;
    height = 900;
  }

  const outCanvas = document.createElement('canvas');
  outCanvas.width = width;
  outCanvas.height = height;
  const ctx = outCanvas.getContext('2d');
  if (!ctx) return '';

  // 1. Vẽ hậu cảnh tự nhiên
  scene.drawBackground(ctx, width, height);

  // 2. Tính toán kích thước & vị trí Cô Trang tự nhiên nhất theo tỷ lệ khung hình
  const subjW = mattedSubjectCanvas.width;
  const subjH = mattedSubjectCanvas.height;
  const subjRatio = subjW / subjH;

  let drawH = height * 0.92;
  let drawW = drawH * subjRatio;
  let drawX = (width - drawW) / 2;
  let drawY = height - drawH;

  if (options.aspect === '16:9') {
    drawH = height * 0.96;
    drawW = drawH * subjRatio;
    drawX = options.showBadge ? width * 0.52 - drawW * 0.35 : (width - drawW) / 2;
    drawY = height - drawH;
  } else if (options.aspect === '1:1') {
    drawH = height * 0.95;
    drawW = drawH * subjRatio;
    drawX = (width - drawW) / 2;
    drawY = height - drawH;
  }

  // 3. Vẽ bóng đổ tự nhiên mềm mại phía sau cô
  ctx.save();
  ctx.shadowColor = 'rgba(45, 35, 25, 0.18)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 12;
  ctx.drawImage(mattedSubjectCanvas, drawX, drawY, drawW, drawH);
  ctx.restore();

  // 4. Phủ lớp ánh sáng nắng ấm đồng bộ (Color Harmonization) lên toàn khung hình
  ctx.save();
  ctx.fillStyle = scene.warmOverlayColor;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // 5. Nếu bật nhãn bài viết Web (cho ảnh 16:9 hoặc 3:4 khi đăng bài)
  if (options.showBadge) {
    ctx.save();
    if (options.aspect === '16:9') {
      // Khung thông tin bên trái cho banner 16:9 đăng bài web
      const cardX = width * 0.05;
      const cardY = height * 0.16;
      const cardW = width * 0.44;
      const cardH = height * 0.68;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.90)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 28);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Badge nhỏ
      ctx.fillStyle = '#DF413E';
      ctx.beginPath();
      ctx.roundRect(cardX + 28, cardY + 28, 230, 38, 19);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 17px sans-serif';
      ctx.fillText('JOLLY PHONICS UK', cardX + 50, cardY + 53);

      // Tiêu đề chính
      ctx.fillStyle = '#1e293b';
      ctx.font = '900 38px sans-serif';
      const title = options.headlineText || 'Ms Trang ASI';
      ctx.fillText(title, cardX + 28, cardY + 115);

      ctx.fillStyle = '#0f4c81';
      ctx.font = 'bold 24px sans-serif';
      const sub = options.subText || 'Đánh Vần Tiếng Anh Tự Nhiên';
      ctx.fillText(sub, cardX + 28, cardY + 155);

      // Các dòng cam kết
      const bullets = [
        '✓ 42 Âm chuẩn & 12 Set Âm Thay Thế',
        '✓ Đánh vần từ vựng Jolly Phonics Word Book',
        '✓ 70 Truyện đọc Decodable độc lập 100%',
      ];
      ctx.fillStyle = '#334155';
      ctx.font = '600 20px sans-serif';
      bullets.forEach((b, idx) => {
        ctx.fillText(b, cardX + 28, cardY + 215 + idx * 42);
      });

      // Chân trang nhỏ
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.roundRect(cardX + 28, cardY + cardH - 68, 260, 42, 14);
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Hotline: 0972.349.900', cardX + 52, cardY + cardH - 41);
    } else {
      // Băng rôn nhỏ gọn tinh tế ở góc dưới cho ảnh 3:4 hoặc 1:1
      const barH = 92;
      const barY = height - barH - 22;
      const barX = 24;
      const barW = width - 48;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, 22);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#1e293b';
      ctx.font = '900 28px sans-serif';
      ctx.fillText(options.headlineText || 'Ms Trang ASI • Jolly Phonics', barX + 24, barY + 42);

      ctx.fillStyle = '#475569';
      ctx.font = '600 20px sans-serif';
      ctx.fillText(
        options.subText || 'Hệ Thống Đánh Vần Tiếng Anh Tự Nhiên Chuẩn Anh Quốc',
        barX + 24,
        barY + 72
      );
    }
    ctx.restore();
  }

  return outCanvas.toDataURL('image/jpeg', 0.94);
}

/**
 * Lưu trực tiếp file ảnh đã có nền tự nhiên (như image.png của cô Trang) nguyên bản 100%
 */
export async function saveDirectTeacherPhotoFile(file: File): Promise<StoredTeacherPhotoData> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const payload: StoredTeacherPhotoData = {
    rawDataUrl,
    compositedSquareUrl: rawDataUrl,
    compositedPortraitUrl: rawDataUrl,
    compositedBannerUrl: rawDataUrl,
    selectedSceneId: 'original',
    updatedAt: Date.now(),
  };

  await saveTeacherPhotoData(payload);
  return payload;
}

export async function processAndSaveUploadedTeacherPhoto(
  file: File,
  _sceneId: string = 'original'
): Promise<StoredTeacherPhotoData> {
  return saveDirectTeacherPhotoFile(file);
}

export async function generateAllCompositesFromRawUrl(
  rawDataUrl: string,
  _sceneId: string = 'original'
): Promise<StoredTeacherPhotoData> {
  const payload: StoredTeacherPhotoData = {
    rawDataUrl,
    compositedSquareUrl: rawDataUrl,
    compositedPortraitUrl: rawDataUrl,
    compositedBannerUrl: rawDataUrl,
    selectedSceneId: 'original',
    updatedAt: Date.now(),
  };

  await saveTeacherPhotoData(payload);
  return payload;
}
