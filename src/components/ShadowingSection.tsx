import React, { useState, useEffect, useRef } from 'react';
import {
  TONGUE_TWISTERS_DATA,
  TongueTwisterRecord,
} from '../data/tongueTwistersData';
import {
  DECODABLE_BOOKS_DATA,
  ADVANCE_BOOKS_DATA,
  EXTENDED_BOOKS_DATA,
} from '../data/decodableBooksData';
import { speakSentence, speakPhoneme, stopSpeaking } from '../utils/audioPlayer';
import {
  loadAllShadowImages,
  saveShadowRecordImage,
  removeShadowRecordImage,
  readImageFileAsDataUrl,
  loadAllStoredVideoLessons,
  saveStoredVideoLesson,
  deleteStoredVideoLesson,
  loadAllShadowClusters,
  saveShadowCluster,
  deleteShadowCluster,
  ShadowCluster,
  StoredVideoShadowLesson,
  VideoShadowSegment,
  TuneInSectionType,
  JoyLessonKind,
} from '../utils/shadowImageStorage';
import { getThumbnailForPhonicsSound } from '../utils/videoFrameExtractor';
import { subscribeVideoUpdates } from '../utils/videoStorage';
import { PHONICS_42_SOUNDS } from '../data/phonicsData';
import { CourseKey } from '../utils/courseCoverStorage';
import {
  redeemOneTimeActivationCode,
  UnlockedCoursesMap,
  StudentDubbingRecord,
  fetchStudentDubbingRecords,
  saveStudentDubbingSegment,
  deleteStudentDubbingSegment,
} from '../utils/studentProgressApi';
import { TuneInNgheNgamSection } from './TuneInNgheNgamSection';

const BUILTIN_TONGUE_CLUSTER_ID = 'cluster-tongue-twisters';
const BUILTIN_PRESCHOOL_CARTOON_ID = 'cluster-cartoon-mam-non';
const BUILTIN_PRIMARY_CARTOON_ID = 'cluster-cartoon-tieu-hoc';
const ZALO_ASI_SUPPORT_URL = 'https://zalo.me/0398612126';

const FREE_LEVEL_PRESETS = ['Mầm non', 'Tiểu học'];

function normalizeCartoonLevel(
  rawLevel?: string,
  nameHint?: string
): 'Mầm non' | 'Tiểu học' {
  const combined = `${nameHint || ''} ${rawLevel || ''}`.trim().toLowerCase();
  if (
    combined.includes('mầm non') ||
    combined.includes('mam non') ||
    combined.includes('pre a1') ||
    combined.includes('pre-a1')
  ) {
    return 'Mầm non';
  }
  if (
    combined.includes('tiểu học') ||
    combined.includes('tieu hoc') ||
    combined.includes('a1') ||
    combined.includes('a2') ||
    combined.includes('b1') ||
    combined.includes('b2')
  ) {
    return 'Tiểu học';
  }
  return 'Mầm non';
}

export interface JoyUnitDef {
  unitIndex: number; // 1..16 (Gộp chung JOY 1 & JOY 2 thành JOY)
  storageLevelKey: 'joy1' | 'joy2';
   unitNumber: number; // 1..8 trong từng storageLevelKey để giữ nguyên dữ liệu video
  unitCode: string; // Maps to JE1-U1..U8 or JE2-U1..U8 in TONGUE_TWISTERS_DATA
  title: string;
  soundsLabel: string;
}

export const JOY_1_UNITS: JoyUnitDef[] = [
  { unitIndex: 1, storageLevelKey: 'joy1', unitNumber: 1, unitCode: 'JE1-U1', title: 'Unit 1', soundsLabel: '/s/ /a/ /t/' },
  { unitIndex: 2, storageLevelKey: 'joy1', unitNumber: 2, unitCode: 'JE1-U2', title: 'Unit 2', soundsLabel: '/i/ /p/ /n/' },
  { unitIndex: 3, storageLevelKey: 'joy1', unitNumber: 3, unitCode: 'JE1-U3', title: 'Unit 3', soundsLabel: '/c k/ /e/ /h/' },
  { unitIndex: 4, storageLevelKey: 'joy1', unitNumber: 4, unitCode: 'JE1-U4', title: 'Unit 4', soundsLabel: '/r/ /m/ /d/' },
  { unitIndex: 5, storageLevelKey: 'joy1', unitNumber: 5, unitCode: 'JE1-U5', title: 'Unit 5', soundsLabel: '/g/ /o/ /u/ /l/' },
  { unitIndex: 6, storageLevelKey: 'joy1', unitNumber: 6, unitCode: 'JE1-U6', title: 'Unit 6', soundsLabel: '/f/ /b/ /ai/' },
  { unitIndex: 7, storageLevelKey: 'joy1', unitNumber: 7, unitCode: 'JE1-U7', title: 'Unit 7', soundsLabel: '/j/ /oa/ /ie/' },
  { unitIndex: 8, storageLevelKey: 'joy1', unitNumber: 8, unitCode: 'JE1-U8', title: 'Unit 8', soundsLabel: '/ee/ /z/ /or/' },
];

export const JOY_2_UNITS: JoyUnitDef[] = [
  { unitIndex: 9, storageLevelKey: 'joy2', unitNumber: 1, unitCode: 'JE2-U1', title: 'Unit 9', soundsLabel: '/w/ /ng/' },
  { unitIndex: 10, storageLevelKey: 'joy2', unitNumber: 2, unitCode: 'JE2-U2', title: 'Unit 10', soundsLabel: '/v/ /oo/' },
  { unitIndex: 11, storageLevelKey: 'joy2', unitNumber: 3, unitCode: 'JE2-U3', title: 'Unit 11', soundsLabel: '/y/ /x/ /ch/' },
  { unitIndex: 12, storageLevelKey: 'joy2', unitNumber: 4, unitCode: 'JE2-U4', title: 'Unit 12', soundsLabel: '/sh/ /th/' },
  { unitIndex: 13, storageLevelKey: 'joy2', unitNumber: 5, unitCode: 'JE2-U5', title: 'Unit 13', soundsLabel: '/qu/ /ou/ /oi/' },
  { unitIndex: 14, storageLevelKey: 'joy2', unitNumber: 6, unitCode: 'JE2-U6', title: 'Unit 14', soundsLabel: '/ue/ /er/ /ar/' },
  { unitIndex: 15, storageLevelKey: 'joy2', unitNumber: 7, unitCode: 'JE2-U7', title: 'Unit 15', soundsLabel: '/i/ /x/ /ng/' },
  { unitIndex: 16, storageLevelKey: 'joy2', unitNumber: 8, unitCode: 'JE2-U8', title: 'Unit 16', soundsLabel: '/ou/ /t/ /r/' },
];

export const ALL_JOY_UNITS: JoyUnitDef[] = [...JOY_1_UNITS, ...JOY_2_UNITS];

export interface JoyLessonTypeDef {
  kind: JoyLessonKind;
  order: number;
  label: string;
  shortDesc: string;
  icon: string;
  badgeColor: string;
}

export const JOY_LESSON_TYPES: JoyLessonTypeDef[] = [
  {
    kind: 'chant',
    order: 1,
    label: '1. Bài vè',
    shortDesc: 'Chant nhịp điệu theo Unit',
    icon: 'lyrics',
    badgeColor: '#e11d48',
  },
  {
    kind: 'dialogue',
    order: 2,
    label: '2. Dialogue',
    shortDesc: 'Hội thoại giao tiếp tự nhiên',
    icon: 'forum',
    badgeColor: '#0284c7',
  },
  {
    kind: 'song',
    order: 3,
    label: '3. Bài hát',
    shortDesc: 'Bài hát giai điệu tiếng Anh',
    icon: 'music_note',
    badgeColor: '#d97706',
  },
  {
    kind: 'story',
    order: 4,
    label: '4. Truyện',
    shortDesc: 'Truyện kể ngữ cảnh Unit',
    icon: 'menu_book',
    badgeColor: '#059669',
  },
  {
    kind: 'tongue',
    order: 5,
    label: '5. Câu ngắn luyện âm',
    shortDesc: 'Câu ngắn luyện âm theo Unit',
    icon: 'record_voice_over',
    badgeColor: '#7c3aed',
  },
];

function stripVietnameseAccentsLocal(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function isShortPronunciationCluster(cluster?: {
  id?: string;
  name?: string;
  isBuiltInTongueTwister?: boolean;
}): boolean {
  if (!cluster) return false;
  if (cluster.id && isJoySlotClusterId(cluster.id)) return false;
  if (cluster.isBuiltInTongueTwister || cluster.id === BUILTIN_TONGUE_CLUSTER_ID) {
    return true;
  }
  const cleanName = stripVietnameseAccentsLocal(cluster.name || '')
    .toLowerCase()
    .trim();
  return (
    cleanName.includes('cau ngan') ||
    cleanName.includes('luyen am') ||
    cleanName.includes('tongue')
  );
}

function matchVideoToJoyUnitForShortPronunciation(
  videoTitle: string,
  indexInCluster: number,
  totalInCluster: number
): JoyUnitDef {
  const clean = stripVietnameseAccentsLocal(videoTitle || '')
    .toLowerCase()
    .trim();

  // 1. Khớp rõ JE2 / Joy 2 + Unit 1..8
  const je2Match = clean.match(/\b(?:je\s*2|joy\s*2)\b[^\d]*(?:unit|u|bai)?\s*([1-8])\b/);
  if (je2Match) {
    const uNum = Number(je2Match[1]);
    const found = JOY_2_UNITS.find((u) => u.unitNumber === uNum);
    if (found) return found;
  }

  // 2. Khớp rõ JE1 / Joy 1 + Unit 1..8
  const je1Match = clean.match(/\b(?:je\s*1|joy\s*1)\b[^\d]*(?:unit|u|bai)?\s*([1-8])\b/);
  if (je1Match) {
    const uNum = Number(je1Match[1]);
    const found = JOY_1_UNITS.find((u) => u.unitNumber === uNum);
    if (found) return found;
  }

  // 3. Khớp Unit 1..16 hoặc U1..U16
  const unitMatch = clean.match(/\b(?:unit|u)\s*(1[0-6]|[1-9])\b/);
  if (unitMatch) {
    const uIdx = Number(unitMatch[1]);
    const found = ALL_JOY_UNITS.find((u) => u.unitIndex === uIdx);
    if (found) return found;
  }

  // 4. Khớp theo nội dung câu trong 49 câu TONGUE_TWISTERS_DATA
  const wordsOnly = clean.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  for (const tt of TONGUE_TWISTERS_DATA) {
    const ttClean = tt.sentence
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (ttClean && (wordsOnly.includes(ttClean) || ttClean.includes(wordsOnly))) {
      if (wordsOnly.length >= 4) {
        const found = ALL_JOY_UNITS.find((u) => u.unitCode === tt.unitCode);
        if (found) return found;
      }
    }
    const sigWords = ttClean.split(' ').filter((w) => w.length >= 4);
    const matchCount = sigWords.filter((w) => wordsOnly.split(' ').includes(w)).length;
    if (sigWords.length >= 2 && matchCount >= 2) {
      const found = ALL_JOY_UNITS.find((u) => u.unitCode === tt.unitCode);
      if (found) return found;
    }
  }

  // 5. Nếu tiêu đề có số thứ tự 1..49 (hoặc tổng số video > 16 tương ứng danh sách 49 câu)
  const leadingNumMatch = clean.match(/(?:^|\b(?:cau|so|tt|bai)\s*)(\d{1,2})\b/);
  if (leadingNumMatch) {
    const num = Number(leadingNumMatch[1]);
    if (totalInCluster > 16 && num >= 1 && num <= TONGUE_TWISTERS_DATA.length) {
      const tt = TONGUE_TWISTERS_DATA[num - 1];
      const found = ALL_JOY_UNITS.find((u) => u.unitCode === tt.unitCode);
      if (found) return found;
    }
    if (num >= 1 && num <= 16) {
      const found = ALL_JOY_UNITS.find((u) => u.unitIndex === num);
      if (found) return found;
    }
  }

  // 6. Nếu tổng số video > 16 (ví dụ bộ 42-49 câu ngắn), phân bổ theo thứ tự câu trong TONGUE_TWISTERS_DATA
  if (totalInCluster > 16) {
    const tt =
      TONGUE_TWISTERS_DATA[
        Math.min(indexInCluster, TONGUE_TWISTERS_DATA.length - 1)
      ];
    const found = ALL_JOY_UNITS.find((u) => u.unitCode === tt.unitCode);
    if (found) return found;
  }

  // 7. Mặc định phân bổ theo thứ tự Unit 1..16
  return ALL_JOY_UNITS[indexInCluster % ALL_JOY_UNITS.length];
}

export function getJoySlotClusterId(
  level: 'joy1' | 'joy2',
  unitNumber: number,
  lessonKind: JoyLessonKind
): string {
  return `${level}-u${unitNumber}-${lessonKind}`;
}

export function isJoySlotClusterId(clusterId?: string): boolean {
  if (!clusterId) return false;
  return /^joy[12]-u[1-8]-(chant|dialogue|song|story|tongue)$/.test(clusterId);
}

/**
 * Tự động lấy tên truyện đẹp, sạch từ tên file video tải lên
 */
function formatAutoStoryTitle(fileName: string): string {
  return fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tự động cắt 1 khung hình thực tế trực tiếp từ trên video để làm ảnh bìa
 */
async function extractCoverFrameFromVideo(
  videoSource: Blob | string
): Promise<string> {
  return new Promise((resolve) => {
    let tempUrl = '';
    const isBlob = typeof videoSource !== 'string';
    try {
      const srcUrl = isBlob
        ? (tempUrl = URL.createObjectURL(videoSource))
        : videoSource;

      const video = document.createElement('video');
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      if (!isBlob && /^https?:/i.test(srcUrl)) {
        video.crossOrigin = 'anonymous';
      }

      let finished = false;
      let triedFallbackSeek = false;

      const cleanup = (result: string) => {
        if (finished) return;
        finished = true;
        clearTimeout(timeoutId);
        video.removeAttribute('src');
        video.load();
        if (tempUrl) {
          URL.revokeObjectURL(tempUrl);
        }
        resolve(result);
      };

      const timeoutId = window.setTimeout(() => {
        cleanup('');
      }, 6000);

      const captureCurrentFrame = (): { dataUrl: string; brightness: number } => {
        const vw = video.videoWidth || 640;
        const vh = video.videoHeight || 360;
        const maxW = 640;
        const scale = vw > maxW ? maxW / vw : 1;
        const cw = Math.max(1, Math.round(vw * scale));
        const ch = Math.max(1, Math.round(vh * scale));

        const canvas = document.createElement('canvas');
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext('2d');
        if (!ctx) return { dataUrl: '', brightness: 128 };

        ctx.drawImage(video, 0, 0, cw, ch);

        let brightness = 128;
        try {
          const sample = ctx.getImageData(
            Math.floor(cw * 0.2),
            Math.floor(ch * 0.2),
            Math.max(1, Math.floor(cw * 0.6)),
            Math.max(1, Math.floor(ch * 0.6))
          ).data;
          let sum = 0;
          const step = Math.max(4, Math.floor(sample.length / 400) * 4);
          let count = 0;
          for (let i = 0; i < sample.length; i += step) {
            sum += (sample[i] + sample[i + 1] + sample[i + 2]) / 3;
            count++;
          }
          if (count > 0) brightness = sum / count;
        } catch {
          // ignore
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        return { dataUrl, brightness };
      };

      video.onloadedmetadata = () => {
        const dur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 4;
        const targetTime = Math.min(1.2, Math.max(0.15, dur * 0.08));
        try {
          video.currentTime = targetTime;
        } catch {
          const { dataUrl } = captureCurrentFrame();
          cleanup(dataUrl);
        }
      };

      video.onseeked = () => {
        const { dataUrl, brightness } = captureCurrentFrame();
        const dur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 4;
        if (!triedFallbackSeek && brightness < 14 && dur > 1.5) {
          triedFallbackSeek = true;
          try {
            video.currentTime = Math.min(2.8, Math.max(1.0, dur * 0.22));
            return;
          } catch {
            // keep current
          }
        }
        cleanup(dataUrl);
      };

      video.onerror = () => {
        cleanup('');
      };

      video.src = srcUrl;
      video.load();
    } catch {
      if (tempUrl) URL.revokeObjectURL(tempUrl);
      resolve('');
    }
  });
}

/**
 * Tự động tìm danh sách câu của truyện nếu tên file video trùng với tên truyện trong hệ thống
 */
function findMatchingStorySentences(rawTitle: string): string[] {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\b(set|nhom|group|book|truyen|\d+)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const target = norm(rawTitle);
  if (!target || target.length < 3) return [];

  const allBooks = [
    ...Object.values(DECODABLE_BOOKS_DATA).flat(),
    ...Object.values(ADVANCE_BOOKS_DATA).flat(),
    ...Object.values(EXTENDED_BOOKS_DATA).flat(),
  ];

  const matched = allBooks.find((b) => {
    const bt = norm(b.title);
    return bt && (bt === target || target.includes(bt) || bt.includes(target));
  });

  if (!matched) return [];

  if (matched.pages && matched.pages.length > 0) {
    return matched.pages
      .map((p) => p.lines.map((l) => l.sentence.trim()).join(' '))
      .filter((s) => s.length > 0);
  }
  return matched.lines.map((l) => l.sentence.trim()).filter((s) => s.length > 0);
}

function parseLinesToVideoSegments(
  rawLines: string,
  defaultSecPerSentence = 0
): VideoShadowSegment[] {
  const lines = rawLines
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const segments: VideoShadowSegment[] = [];
  let cursor = 0;

  lines.forEach((line, idx) => {
    const timeMatch = line.match(
      /^\[?(\d+(?:\.\d+)?|\d+:\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?|\d+:\d+(?:\.\d+)?)\]?[:\s-]+(.+)$/
    );
    if (timeMatch) {
      const toSec = (s: string) => {
        const parts = s.split(':').map(Number);
        return parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0] || 0;
      };
      const st = toSec(timeMatch[1]);
      const et = Math.max(st + 1, toSec(timeMatch[2]));
      segments.push({
        id: `seg-${Date.now()}-${idx + 1}`,
        index: idx + 1,
        startTime: st,
        endTime: et,
        text: timeMatch[3].trim(),
      });
      cursor = et;
    } else {
      const st = defaultSecPerSentence > 0 ? cursor : 0;
      const et = defaultSecPerSentence > 0 ? st + defaultSecPerSentence : 0;
      segments.push({
        id: `seg-${Date.now()}-${idx + 1}`,
        index: idx + 1,
        startTime: st,
        endTime: et,
        text: line,
      });
      cursor = et;
    }
  });

  return segments;
}

function isPlaceholderSegmentText(text?: string): boolean {
  if (!text) return true;
  const t = text.trim();
  if (!t) return true;
  return (
    /^Câu\s+\d+\s*(?:\([\s\S]*\))?$/i.test(t) ||
    /^Đang nhận diện/i.test(t) ||
    /^\d+:\d+/.test(t)
  );
}

function encodeAudioBufferSliceToWavBase64(
  audioBuffer: AudioBuffer,
  startSec: number,
  endSec: number
): string {
  const targetRate = 16000;
  const srcRate = audioBuffer.sampleRate;
  const ch0 = audioBuffer.getChannelData(0);
  const ch1 =
    audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : null;

  const clipStart = Math.max(0, startSec - 0.12);
  const clipEnd = Math.min(
    audioBuffer.duration,
    Math.max(clipStart + 0.35, endSec + 0.22)
  );
  const duration = Math.max(0.25, clipEnd - clipStart);
  const numSamples = Math.max(1, Math.floor(duration * targetRate));

  const monoSamples = new Float32Array(numSamples);
  let peak = 0;

  for (let i = 0; i < numSamples; i++) {
    const t = clipStart + i / targetRate;
    const srcIdx = Math.min(ch0.length - 1, Math.max(0, Math.floor(t * srcRate)));
    const s = ch1 ? (ch0[srcIdx] + ch1[srcIdx]) * 0.5 : ch0[srcIdx];
    monoSamples[i] = s;
    const abs = Math.abs(s);
    if (abs > peak) peak = abs;
  }

  const gain = peak > 0.008 ? Math.min(3.5, 0.85 / peak) : 1.0;

  const dataByteLength = numSamples * 2;
  const wavBuffer = new ArrayBuffer(44 + dataByteLength);
  const view = new DataView(wavBuffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataByteLength, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, targetRate, true);
  view.setUint32(28, targetRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataByteLength, true);

  let byteOffset = 44;
  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, monoSamples[i] * gain));
    const int16 =
      clamped < 0 ? Math.round(clamped * 0x8000) : Math.round(clamped * 0x7fff);
    view.setInt16(byteOffset, int16, true);
    byteOffset += 2;
  }

  const bytes = new Uint8Array(wavBuffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const sub = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(sub));
  }
  return btoa(binary);
}

async function transcribeSegmentsWithAudioBuffer(
  audioBuffer: AudioBuffer,
  segments: VideoShadowSegment[],
  videoTitle = 'English Video'
): Promise<VideoShadowSegment[]> {
  if (segments.length === 0) return segments;

  const indicesToTranscribe = segments.filter((s) =>
    isPlaceholderSegmentText(s.text)
  );
  if (indicesToTranscribe.length === 0) return segments;

  try {
    const payloadSegments = segments
      .map((seg, idx) => ({ seg, idx }))
      .filter(({ seg }) => isPlaceholderSegmentText(seg.text))
      .map(({ seg, idx }) => ({
        index: idx + 1,
        startTime: seg.startTime,
        endTime:
          seg.endTime > seg.startTime
            ? seg.endTime
            : Math.min(audioBuffer.duration, seg.startTime + 3.5),
        wavBase64: encodeAudioBufferSliceToWavBase64(
          audioBuffer,
          seg.startTime,
          seg.endTime > seg.startTime
            ? seg.endTime
            : Math.min(audioBuffer.duration, seg.startTime + 3.5)
        ),
      }));

    const response = await fetch('/api/shadow/transcribe-segments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: videoTitle,
        segments: payloadSegments,
      }),
    });

    if (!response.ok) {
      return segments;
    }

    const data = await response.json();
    const transcripts: Array<{ index: number; text: string }> = Array.isArray(
      data?.transcripts
    )
      ? data.transcripts
      : [];

    if (transcripts.length === 0) return segments;

    const mapByIndex = new Map<number, string>();
    for (const item of transcripts) {
      if (typeof item?.index === 'number' && typeof item?.text === 'string') {
        mapByIndex.set(item.index, item.text.trim());
      }
    }

    const updated = segments.map((seg, idx) => {
      const segNumber = idx + 1;
      const transcribedText = mapByIndex.get(segNumber);
      if (transcribedText && transcribedText.length > 0) {
        return {
          ...seg,
          text: transcribedText,
        };
      }
      return seg;
    });

    const nonEmptyCount = updated.filter(
      (s) => !isPlaceholderSegmentText(s.text)
    ).length;
    if (nonEmptyCount > 0 && nonEmptyCount < updated.length) {
      const onlySpoken = updated
        .filter((_, idx) => {
          const rawT = mapByIndex.get(idx + 1);
          if (rawT === '') return false;
          return true;
        })
        .map((s, idx) => ({
          ...s,
          index: idx + 1,
        }));
      if (onlySpoken.length > 0) {
        return onlySpoken;
      }
    }

    return updated;
  } catch (err) {
    console.warn('Video speech-to-text transcription error:', err);
    return segments;
  }
}

async function transcribeVideoBlobForExistingSegments(
  videoBlob: Blob,
  segments: VideoShadowSegment[],
  videoTitle: string
): Promise<VideoShadowSegment[]> {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return segments;

    const arrayBuffer = await videoBlob.arrayBuffer();
    const tempCtx = new AudioCtx();
    let audioBuffer: AudioBuffer;
    try {
      audioBuffer = await tempCtx.decodeAudioData(arrayBuffer.slice(0));
    } finally {
      tempCtx.close().catch(() => {});
    }

    return await transcribeSegmentsWithAudioBuffer(
      audioBuffer,
      segments,
      videoTitle
    );
  } catch (err) {
    console.warn('Error decoding video blob for transcription:', err);
    return segments;
  }
}

async function analyzeVideoBlobSentences(
  videoBlob: Blob,
  existingTexts: string[] = [],
  strictness = 1.0,
  videoTitle = 'English Video',
  skipCloudTranscribe = false
): Promise<VideoShadowSegment[]> {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return [];

    const arrayBuffer = await videoBlob.arrayBuffer();
    const tempCtx = new AudioCtx();
    let audioBuffer: AudioBuffer;
    try {
      audioBuffer = await tempCtx.decodeAudioData(arrayBuffer.slice(0));
    } finally {
      tempCtx.close().catch(() => {});
    }

    const sampleRate = audioBuffer.sampleRate;
    const ch0 = audioBuffer.getChannelData(0);
    const ch1 =
      audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : null;

    const frameSec = 0.02;
    const frameSamples = Math.max(1, Math.floor(sampleRate * frameSec));
    const numFrames = Math.floor(ch0.length / frameSamples);
    if (numFrames < 30) return [];

    const bassRms = new Float32Array(numFrames);
    const midVocalRms = new Float32Array(numFrames);
    const sideMusicRms = new Float32Array(numFrames);
    const sibilantRms = new Float32Array(numFrames);
    const cleanVocalRms = new Float32Array(numFrames);
    const zcrArr = new Float32Array(numFrames);

    const dt = 1 / sampleRate;
    const alpha220 = dt / (1 / (2 * Math.PI * 220) + dt);
    const alpha380 = dt / (1 / (2 * Math.PI * 380) + dt);
    const alpha2700 = dt / (1 / (2 * Math.PI * 2700) + dt);

    let lp220 = 0;
    let lp380 = 0;
    let lp2700 = 0;
    let sideLp380 = 0;
    let sideLp3200 = 0;
    const alpha3200 = dt / (1 / (2 * Math.PI * 3200) + dt);

    for (let f = 0; f < numFrames; f++) {
      const offset = f * frameSamples;
      let sumBass = 0;
      let sumMidVocal = 0;
      let sumSideMusic = 0;
      let sumSib = 0;
      let zc = 0;
      let prevHp380 = 0;

      for (let i = 0; i < frameSamples; i++) {
        const l = ch0[offset + i];
        const r = ch1 ? ch1[offset + i] : l;
        const mid = 0.5 * (l + r);
        const side = 0.5 * (l - r);

        lp220 += alpha220 * (mid - lp220);
        lp380 += alpha380 * (mid - lp380);
        lp2700 += alpha2700 * (mid - lp2700);

        sideLp380 += alpha380 * (side - sideLp380);
        sideLp3200 += alpha3200 * (side - sideLp3200);

        const bass = lp220;
        const hp380 = mid - lp380;
        const vocal = lp2700 - lp380;
        const sibilant = mid - lp2700;
        const sideMidBand = sideLp3200 - sideLp380;

        sumBass += bass * bass;
        sumMidVocal += vocal * vocal;
        sumSideMusic += sideMidBand * sideMidBand;
        sumSib += sibilant * sibilant;

        if (i > 0 && ((prevHp380 >= 0 && hp380 < 0) || (prevHp380 < 0 && hp380 >= 0))) {
          zc++;
        }
        prevHp380 = hp380;
      }

      const bVal = Math.sqrt(sumBass / frameSamples);
      const mVal = Math.sqrt(sumMidVocal / frameSamples);
      const sVal = Math.sqrt(sumSideMusic / frameSamples);
      const sibVal = Math.sqrt(sumSib / frameSamples);

      bassRms[f] = bVal;
      midVocalRms[f] = mVal;
      sideMusicRms[f] = sVal;
      sibilantRms[f] = sibVal;
      zcrArr[f] = zc / frameSamples;

      cleanVocalRms[f] = Math.max(0, mVal - sVal * 1.18 - bVal * 0.24);
    }

    const smoothVocal = new Float32Array(numFrames);
    for (let f = 0; f < numFrames; f++) {
      const a = cleanVocalRms[Math.max(0, f - 1)];
      const b = cleanVocalRms[f];
      const c = cleanVocalRms[Math.min(numFrames - 1, f + 1)];
      smoothVocal[f] = (a + b * 2 + c) / 4;
    }

    const activeVals: number[] = [];
    for (let f = 0; f < numFrames; f++) {
      if (smoothVocal[f] > 0.001) {
        activeVals.push(smoothVocal[f]);
      }
    }
    if (activeVals.length < 15) return [];
    activeVals.sort((a, b) => a - b);

    const p25 = activeVals[Math.floor(activeVals.length * 0.25)] || 0.003;
    const p50 = activeVals[Math.floor(activeVals.length * 0.5)] || 0.008;
    const p85 = activeVals[Math.floor(activeVals.length * 0.85)] || 0.025;

    const voiceOnThresh =
      Math.max(0.004, Math.min(p50 * 1.15, p25 * 2.0), p85 * 0.16) * strictness;
    const voiceOffThresh = Math.max(0.0022, voiceOnThresh * 0.45);

    const rawSpans: { startFrame: number; endFrame: number }[] = [];
    let inUtterance = false;
    let startF = 0;
    let lastActiveF = 0;
    let utterancePeak = 0;

    for (let f = 0; f < numFrames; f++) {
      const v = smoothVocal[f];
      const b = bassRms[f];
      const m = midVocalRms[f];
      const side = sideMusicRms[f];
      const sib = sibilantRms[f];
      const zcr = zcrArr[f];

      const dynamicFloor = inUtterance
        ? Math.max(voiceOffThresh * 0.6, utterancePeak * 0.08)
        : voiceOnThresh;

      const isVoiceFrame =
        (v >= dynamicFloor && b < m * 1.45 && side < m * 0.72) ||
        (inUtterance && m >= p25 * 0.36 && b < m * 1.55 && side < m * 0.78) ||
        (sib > (inUtterance ? p50 * 0.12 : p85 * 0.14) &&
          zcr > (inUtterance ? 0.085 : 0.115) &&
          b < sib * 1.45 &&
          side < (m + sib) * 0.68);

      if (isVoiceFrame) {
        if (!inUtterance) {
          inUtterance = true;
          startF = f;
          utterancePeak = v;
        } else if (v > utterancePeak) {
          utterancePeak = v;
        }
        lastActiveF = f;
      } else if (inUtterance) {
        const silentFrames = f - lastActiveF;
        if (silentFrames >= 32) {
          rawSpans.push({ startFrame: startF, endFrame: lastActiveF });
          inUtterance = false;
          utterancePeak = 0;
        }
      }
    }
    if (inUtterance && lastActiveF - startF >= 28) {
      rawSpans.push({ startFrame: startF, endFrame: lastActiveF });
    }

    const splitVeryLongSpan = (span: {
      startFrame: number;
      endFrame: number;
    }): { startFrame: number; endFrame: number }[] => {
      const len = span.endFrame - span.startFrame;
      if (len <= 525) return [span];

      let bestDipCenter = -1;
      let minDipEnergy = Infinity;
      const searchStart = span.startFrame + 130;
      const searchEnd = span.endFrame - 120;

      for (let f = searchStart; f <= searchEnd; f++) {
        let sum13 = 0;
        for (let k = -6; k <= 6; k++) {
          sum13 += smoothVocal[f + k] + sibilantRms[f + k] * 0.5;
        }
        const avg13 = sum13 / 13;
        if (avg13 < minDipEnergy) {
          minDipEnergy = avg13;
          bestDipCenter = f;
        }
      }

      if (bestDipCenter > 0 && minDipEnergy < p85 * 0.18) {
        const left = { startFrame: span.startFrame, endFrame: bestDipCenter - 2 };
        const right = { startFrame: bestDipCenter + 2, endFrame: span.endFrame };
        return [...splitVeryLongSpan(left), ...splitVeryLongSpan(right)];
      }
      return [span];
    };

    const candidateSpans = rawSpans.flatMap(splitVeryLongSpan);

    interface ScoredSpan {
      startFrame: number;
      endFrame: number;
      maxCleanVocal: number;
      avgMidVocal: number;
      stereoRatio: number;
      bassRatio: number;
      sustainFloorRatio: number;
      closureDipRatio: number;
      zcrRange: number;
      avgZcrJump: number;
      unvoicedConsonantFrames: number;
      syllablePeaks: number;
      speechConfidence: number;
    }

    const scoredSpans: ScoredSpan[] = [];

    for (const sp of candidateSpans) {
      const framesCount = sp.endFrame - sp.startFrame + 1;
      if (framesCount < 32) continue;

      let sumCleanV = 0;
      let maxCleanV = 0;
      let sumMidV = 0;
      let sumSide = 0;
      let sumBass = 0;
      let sumZcrJump = 0;
      let unvoicedFrames = 0;
      let syllablePeaks = 0;
      let inPeak = false;
      let lastPeakF = -10;

      const spanVocals: number[] = [];
      const spanZcrs: number[] = [];

      const extStart = Math.max(0, sp.startFrame - 3);
      const extEnd = Math.min(numFrames - 1, sp.endFrame + 3);

      for (let f = extStart; f <= extEnd; f++) {
        const z = zcrArr[f];
        const sib = sibilantRms[f];
        const b = bassRms[f];
        const side = sideMusicRms[f];
        const mid = midVocalRms[f];

        if (
          z > 0.11 &&
          sib > 0.003 &&
          sib > b * 0.85 &&
          side < mid * 0.6
        ) {
          unvoicedFrames++;
        }
      }

      for (let f = sp.startFrame; f <= sp.endFrame; f++) {
        const cv = smoothVocal[f];
        const mv = midVocalRms[f];
        const side = sideMusicRms[f];
        const b = bassRms[f];
        const z = zcrArr[f];

        sumCleanV += cv;
        if (cv > maxCleanV) maxCleanV = cv;
        sumMidV += mv;
        sumSide += side;
        sumBass += b;
        spanVocals.push(cv);
        spanZcrs.push(z);

        if (f > sp.startFrame) {
          sumZcrJump += Math.abs(z - zcrArr[f - 1]);
        }

        if (!inPeak && cv > voiceOnThresh * 1.15 && f - lastPeakF >= 6) {
          syllablePeaks++;
          lastPeakF = f;
          inPeak = true;
        } else if (inPeak && cv < voiceOnThresh * 0.82) {
          inPeak = false;
        }
      }

      spanVocals.sort((a, b) => a - b);
      spanZcrs.sort((a, b) => a - b);

      const p15V = spanVocals[Math.floor(spanVocals.length * 0.15)] || 0;
      const p85V = spanVocals[Math.floor(spanVocals.length * 0.85)] || 0.0001;
      const p10Z = spanZcrs[Math.floor(spanZcrs.length * 0.1)] || 0;
      const p90Z = spanZcrs[Math.floor(spanZcrs.length * 0.9)] || 0;

      let dipFrames = 0;
      for (let i = 0; i < spanVocals.length; i++) {
        if (spanVocals[i] < p85V * 0.35) {
          dipFrames++;
        }
      }

      const avgMidVocal = sumMidV / framesCount + 0.0001;
      const stereoRatio = sumSide / framesCount / avgMidVocal;
      const bassRatio = sumBass / framesCount / avgMidVocal;
      const sustainFloorRatio = p15V / p85V;
      const closureDipRatio = dipFrames / framesCount;
      const zcrRange = p90Z - p10Z;
      const avgZcrJump = sumZcrJump / Math.max(1, framesCount - 1);

      const speechConfidence =
        (maxCleanV *
          (zcrRange + 0.01) *
          (avgZcrJump + 0.005) *
          (0.15 + closureDipRatio) *
          (1 + Math.min(8, unvoicedFrames) * 0.18)) /
        ((1 + stereoRatio * 4.0) *
          (1 + bassRatio * 2.5) *
          (0.25 + sustainFloorRatio * 1.5));

      scoredSpans.push({
        startFrame: sp.startFrame,
        endFrame: sp.endFrame,
        maxCleanVocal: maxCleanV,
        avgMidVocal,
        stereoRatio,
        bassRatio,
        sustainFloorRatio,
        closureDipRatio,
        zcrRange,
        avgZcrJump,
        unvoicedConsonantFrames: unvoicedFrames,
        syllablePeaks,
        speechConfidence,
      });
    }

    if (scoredSpans.length === 0) return [];

    const sortedByConf = [...scoredSpans].sort(
      (a, b) => b.speechConfidence - a.speechConfidence
    );
    const topCount = Math.max(1, Math.ceil(sortedByConf.length * 0.5));
    const topNarratorSpans = sortedByConf.slice(0, topCount);

    const refVocalPeak =
      topNarratorSpans.reduce((acc, s) => acc + s.maxCleanVocal, 0) / topCount;
    const refStereoRatio =
      topNarratorSpans.reduce((acc, s) => acc + s.stereoRatio, 0) / topCount;
    const refBassRatio =
      topNarratorSpans.reduce((acc, s) => acc + s.bassRatio, 0) / topCount;
    const refConfidence = topNarratorSpans[Math.floor(topCount / 2)].speechConfidence;

    let speechOnlySpans = scoredSpans.filter((sp) => {
      if (sp.stereoRatio > Math.max(0.32, refStereoRatio * 2.0)) return false;
      if (sp.bassRatio > Math.max(0.75, refBassRatio * 1.9)) return false;
      if (sp.sustainFloorRatio > 0.46 && sp.closureDipRatio < 0.14) return false;
      if (
        sp.zcrRange < 0.032 &&
        sp.avgZcrJump < 0.014 &&
        sp.unvoicedConsonantFrames < 2
      ) {
        return false;
      }

      const isGenuineSpeech =
        sp.syllablePeaks >= 2 &&
        sp.maxCleanVocal >= refVocalPeak * 0.28 &&
        sp.speechConfidence >= refConfidence * (0.18 * strictness);

      return isGenuineSpeech;
    });

    if (
      existingTexts.length > 0 &&
      speechOnlySpans.length > existingTexts.length
    ) {
      const bestMatches = [...speechOnlySpans]
        .sort((a, b) => b.speechConfidence - a.speechConfidence)
        .slice(0, existingTexts.length)
        .sort((a, b) => a.startFrame - b.startFrame);
      speechOnlySpans = bestMatches;
    }

    const totalDuration = audioBuffer.duration;

    const initialSegments: VideoShadowSegment[] = speechOnlySpans.map(
      (sp, idx) => {
        const nextSp = speechOnlySpans[idx + 1];

        let refinedStartFrame = sp.startFrame;
        const minStartLookback = Math.max(0, sp.startFrame - 8);
        for (let f = sp.startFrame; f >= minStartLookback; f--) {
          if (midVocalRms[f] > p25 * 0.28 || sibilantRms[f] > p25 * 0.22) {
            refinedStartFrame = f;
          }
        }

        let refinedEndFrame = sp.endFrame;
        const maxEndLookahead = Math.min(
          numFrames - 1,
          nextSp ? nextSp.startFrame - 6 : sp.endFrame + 28
        );
        for (let f = sp.endFrame + 1; f <= maxEndLookahead; f++) {
          if (
            smoothVocal[f] > p25 * 0.22 ||
            midVocalRms[f] > p25 * 0.3 ||
            (sibilantRms[f] > p25 * 0.2 && zcrArr[f] > 0.08)
          ) {
            refinedEndFrame = f;
          }
        }

        const st = Math.max(
          0,
          Math.round((refinedStartFrame * frameSec - 0.14) * 20) / 20
        );

        const nextStartLimit = nextSp
          ? Math.max(st + 0.6, nextSp.startFrame * frameSec - 0.1)
          : totalDuration;

        const et = Math.min(
          totalDuration,
          nextStartLimit,
          Math.round((refinedEndFrame * frameSec + 0.52) * 20) / 20
        );

        return {
          id: `seg-v7-${Date.now()}-${idx + 1}-${Math.random().toString(36).slice(2, 5)}`,
          index: idx + 1,
          startTime: st,
          endTime: Math.max(st + 0.65, et),
          text:
            existingTexts[idx] && !isPlaceholderSegmentText(existingTexts[idx])
              ? existingTexts[idx]
              : `Câu ${idx + 1} (${st.toFixed(1)}s - ${et.toFixed(1)}s)`,
        };
      }
    );

    if (skipCloudTranscribe) {
      return initialSegments;
    }

    const transcribedSegments = await transcribeSegmentsWithAudioBuffer(
      audioBuffer,
      initialSegments,
      videoTitle
    );

    return transcribedSegments;
  } catch (err) {
    console.warn('Audio waveform sentence analysis error:', err);
    return [];
  }
}

/**
 * Tô đỏ âm mục tiêu trong câu Tongue Twister giống bản gốc PDF khi bấm nút "Hiện chữ"
 */
function renderHighlightedTongueTwister(sentence: string, regexSource: string) {
  try {
    const regex = new RegExp(`(${regexSource})`, 'gi');
    const parts = sentence.split(regex);
    return parts.map((part, idx) => {
      if (regex.test(part)) {
        return (
          <span key={idx} className="text-[#e11d48] font-black">
            {part}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  } catch {
    return <span>{sentence}</span>;
  }
}

interface ShadowingSectionProps {
  isLoggedIn?: boolean;
  hasPurchasedJoy?: boolean;
  currentUserEmail?: string;
  currentUsername?: string;
  displayMode?: 'all' | 'tune-in-only' | 'joy-only';
  onRequireRegister?: () => void;
  onOpenJoyRegisterModal?: () => void;
  onUnlockCourse?: (
    courseKey: CourseKey,
    updatedMap?: UnlockedCoursesMap
  ) => void;
  onOpenAuthModal?: (mode: 'login' | 'register') => void;
}

export function ShadowingSection({
  isLoggedIn = false,
  hasPurchasedJoy = false,
  currentUserEmail = '',
  currentUsername = '',
  displayMode = 'all',
  onRequireRegister,
  onOpenJoyRegisterModal,
  onUnlockCourse,
  onOpenAuthModal,
}: ShadowingSectionProps = {}) {
  // ============================================================================
  // CẤU TRÚC TUNE IN:
  // 1) PHẦN JOY (Gộp JOY 1 & JOY 2 thành JOY): Hiển thị giao diện toàn bộ các Unit,
  //    bấm vào Unit cần mua tài khoản & được cấp mã (đưa lên phần Đăng ký JOY)
  // 2) PHẦN NGHE NGẤM TỰ DO: Hoạt hình Mầm non, Hoạt hình Tiểu học & các hoạt hình đẩy lên
  // ============================================================================
  const [sectionViewFilter] = useState<
    'ALL' | 'joy1' | 'joy2' | 'free'
  >('ALL');

  // Khúc nào đang mở khung Studio phát chính
  const [activeStudioSection, setActiveStudioSection] =
    useState<TuneInSectionType>('free');

  // Trạng thái Unit đang chọn trong phần JOY gộp chung (Unit 1..16)
  const [selectedJoyUnitIndex, setSelectedJoyUnitIndex] = useState<number>(1);
  // Chỉ khi bấm vào Unit nào thì mới hiện ra giao diện bài học của Unit đó
  const [isJoyUnitOpened, setIsJoyUnitOpened] = useState<boolean>(false);
  const [joy1Unit, setJoy1Unit] = useState<number>(1);
  const [joy1LessonKind, setJoy1LessonKind] = useState<JoyLessonKind>('chant');

  const [joy2Unit, setJoy2Unit] = useState<number>(1);
  const [joy2LessonKind, setJoy2LessonKind] = useState<JoyLessonKind>('chant');

  const pointToTopJoyRegisterButton = () => {
    if (onOpenJoyRegisterModal) {
      onOpenJoyRegisterModal();
      return;
    }
    const inlineBtn = document.getElementById('btn-dang-ky-joy-inline');
    if (inlineBtn) {
      inlineBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onRequireRegister?.();
  };

  // Danh sách toàn bộ Cụm (Clusters) & Video từ IndexedDB
  const [clusters, setClusters] = useState<ShadowCluster[]>([]);
  // Cụm đang mở trong phần NGHE NGẤM TỰ DO (null = đang xem lưới các bộ hoạt hình)
  const [selectedFreeClusterId, setSelectedFreeClusterId] = useState<
    string | null
  >(null);

  // Bộ lọc trình độ trong NGHE NGẤM TỰ DO (ALL, Mầm non, Tiểu học, A1, A2, B1, B2...)
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');

  // Form Tạo Bộ Hoạt Hình Mới trong NGHE NGẤM TỰ DO
  const [isCreateClusterModalOpen, setIsCreateClusterModalOpen] =
    useState<boolean>(false);
  const [newClusterName, setNewClusterName] = useState<string>('');
  const [newClusterCoverUrl, setNewClusterCoverUrl] = useState<string>('');
  const [newClusterDefaultLevel, setNewClusterDefaultLevel] =
    useState<string>('Mầm non');

  // Quản lý tải ảnh bìa cho Cụm / Bài học / Video
  const [uploadingCoverForClusterId, setUploadingCoverForClusterId] = useState<
    string | null
  >(null);
  const [dragOverClusterCardId, setDragOverClusterCardId] = useState<
    string | null
  >(null);
  const [uploadingCoverForVideoId, setUploadingCoverForVideoId] = useState<
    string | null
  >(null);
  const [dragOverVideoCardId, setDragOverVideoCardId] = useState<string | null>(
    null
  );
  // Target clusterId khi bấm tải video trực tiếp vào 1 bài học JOY hoặc 1 cụm hoạt hình
  const [pendingUploadTargetClusterId, setPendingUploadTargetClusterId] =
    useState<string | null>(null);

  // ============================================================================
  // PHẦN A: GÓC SHADOW THEO VIDEO & CÂU CHỮ (DÙNG CHUNG CHO MỌI BÀI JOY & NGHE NGẤM TỰ DO)
  // ============================================================================
  const [videoLessons, setVideoLessons] = useState<StoredVideoShadowLesson[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState<number>(0);
  const [isAnalyzingVideoAudio, setIsAnalyzingVideoAudio] = useState<boolean>(false);
  const [isTranscribingVideoText, setIsTranscribingVideoText] = useState<boolean>(false);
  const transcribingLessonIdsRef = useRef<Set<string>>(new Set());

  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [isPausedForShadow, setIsPausedForShadow] = useState<boolean>(false);
  const [detectedAudioKind, setDetectedAudioKind] = useState<
    'silent' | 'music' | 'speech'
  >('silent');

  const [isVideoSentenceRevealed, setIsVideoSentenceRevealed] = useState<boolean>(false);
  const [revealedVideoSegMap, setRevealedVideoSegMap] = useState<Record<string, boolean>>({});

  const [smartAudioAutoPause] = useState<boolean>(true);
  const [musicFilterStrictness] = useState<number>(1.0);
  const [tailExtendSec] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isDraggingBatchVideos, setIsDraggingBatchVideos] = useState<boolean>(false);

  const [isEditTimingsOpen, setIsEditTimingsOpen] = useState<boolean>(false);
  const [bulkSentencesInput, setBulkSentencesInput] = useState<string>('');

  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);
  const videoStudioContainerRef = useRef<HTMLDivElement | null>(null);
  const batchVideoFileInputRef = useRef<HTMLInputElement | null>(null);
  const newClusterVideoInputRef = useRef<HTMLInputElement | null>(null);
  const clusterCoverInputRef = useRef<HTMLInputElement | null>(null);
  const videoCoverInputRef = useRef<HTMLInputElement | null>(null);
  const newClusterCoverInputRef = useRef<HTMLInputElement | null>(null);
  const replaceSingleVideoInputRef = useRef<HTMLInputElement | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaSourceCreatedRef = useRef<WeakSet<HTMLVideoElement>>(new WeakSet());
  const rafSilenceIdRef = useRef<number | null>(null);

  const lastPausedSentenceTimeRef = useRef<number>(0);
  const sentenceStartVideoTimeRef = useRef<number>(0);
  const speechStateRef = useRef<{
    inSpeechUtterance: boolean;
    utteranceStartMs: number;
    lastSpeechFrameMs: number;
    utterancePeakFormant: number;
    syllablePeakCount: number;
    minZcrInSpan: number;
    maxZcrInSpan: number;
    musicFrameCountInSpan: number;
    speechFrameCountInSpan: number;
    inSyllablePeak: boolean;
    hadDipSinceLastPeak: boolean;
    lastSyllablePeakMs: number;
    rollingMusicFloor: number;
  }>({
    inSpeechUtterance: false,
    utteranceStartMs: 0,
    lastSpeechFrameMs: 0,
    utterancePeakFormant: 0,
    syllablePeakCount: 0,
    minZcrInSpan: 1,
    maxZcrInSpan: 0,
    musicFrameCountInSpan: 0,
    speechFrameCountInSpan: 0,
    inSyllablePeak: false,
    hadDipSinceLastPeak: true,
    lastSyllablePeakMs: 0,
    rollingMusicFloor: 16,
  });

  // Xác định clusterId đang mở cho Studio hiện tại
  const currentJoy1SlotClusterId = getJoySlotClusterId(
    'joy1',
    joy1Unit,
    joy1LessonKind
  );
  const currentJoy2SlotClusterId = getJoySlotClusterId(
    'joy2',
    joy2Unit,
    joy2LessonKind
  );

  const effectiveSelectedClusterId: string | null =
    activeStudioSection === 'joy1'
      ? currentJoy1SlotClusterId
      : activeStudioSection === 'joy2'
      ? currentJoy2SlotClusterId
      : selectedFreeClusterId;

  // Cụm hoạt hình tự do (chỉ hiện theo cụm hiện tại, không hiện câu ngắn luyện âm ở phần free)
  const freeCartoonClusters = clusters.filter((c) => {
    if (
      isJoySlotClusterId(c.id) ||
      c.sectionType === 'joy1' ||
      c.sectionType === 'joy2'
    ) {
      return false;
    }
    if (isShortPronunciationCluster(c)) {
      return false;
    }

    const vidsCount = videoLessons.filter((v) => v.clusterId === c.id).length;
    if (vidsCount > 0) return true;

    // Nếu cụm builtin tự sinh mà không có video -> ẩn đi để không bị lặp
    if (
      c.id === BUILTIN_PRESCHOOL_CARTOON_ID ||
      c.id === BUILTIN_PRIMARY_CARTOON_ID
    ) {
      return false;
    }

    // Nếu có cụm khác trùng tên mà đã có video -> bỏ cụm trống bị lặp
    const normName = (c.name || '').trim().toLowerCase();
    const hasNonEmptyDuplicate = clusters.some((other) => {
      if (other.id === c.id || isJoySlotClusterId(other.id)) return false;
      const otherVids = videoLessons.filter((v) => v.clusterId === other.id).length;
      if (otherVids === 0) return false;
      const otherName = (other.name || '').trim().toLowerCase();
      return otherName === normName;
    });

    return !hasNonEmptyDuplicate;
  });

  const activeCluster: ShadowCluster | undefined = clusters.find(
    (c) => c.id === effectiveSelectedClusterId
  );

  const clusterVideosAll = videoLessons.filter(
    (v) => v.clusterId === effectiveSelectedClusterId
  );
  const displayedClusterVideos = clusterVideosAll;

  const activeVideoLesson: StoredVideoShadowLesson | undefined =
    displayedClusterVideos.find((v) => v.id === selectedVideoId) ||
    displayedClusterVideos[0];

  const activeVideoSegment: VideoShadowSegment | undefined =
    activeVideoLesson?.segments[currentSentenceIdx];

  useEffect(() => {
    const videoEl = videoPlayerRef.current;
    if (!videoEl) return;
    videoEl.playbackRate = playbackSpeed;
    if ('preservesPitch' in videoEl) {
      (videoEl as HTMLVideoElement & { preservesPitch?: boolean }).preservesPitch = true;
    }
  }, [playbackSpeed, selectedVideoId, effectiveSelectedClusterId]);

  const resetSpeechDetectorState = (currentVideoTime = 0) => {
    lastPausedSentenceTimeRef.current = currentVideoTime;
    sentenceStartVideoTimeRef.current = currentVideoTime;
    speechStateRef.current = {
      inSpeechUtterance: false,
      utteranceStartMs: 0,
      lastSpeechFrameMs: 0,
      utterancePeakFormant: 0,
      syllablePeakCount: 0,
      minZcrInSpan: 1,
      maxZcrInSpan: 0,
      musicFrameCountInSpan: 0,
      speechFrameCountInSpan: 0,
      inSyllablePeak: false,
      hadDipSinceLastPeak: true,
      lastSyllablePeakMs: 0,
      rollingMusicFloor: 16,
    };
    setDetectedAudioKind('silent');
  };

  // Nạp danh sách Cụm (Clusters) & Video từ IndexedDB
  useEffect(() => {
    Promise.all([loadAllShadowClusters(), loadAllStoredVideoLessons()]).then(
      async ([storedClusters, storedVideos]) => {
        const userUploadedOnly = storedVideos.filter(
          (item) => !item.id.startsWith('vid-story-')
        );

        let nextClusters = [...storedClusters];

        // Xóa bỏ các cụm builtin tự tạo mà không có video để tránh bị lặp
        const emptyBuiltinClusters = nextClusters.filter(
          (c) =>
            (c.id === BUILTIN_PRESCHOOL_CARTOON_ID ||
              c.id === BUILTIN_PRIMARY_CARTOON_ID) &&
            !userUploadedOnly.some((v) => v.clusterId === c.id)
        );
        if (emptyBuiltinClusters.length > 0) {
          for (const emptyC of emptyBuiltinClusters) {
            await deleteShadowCluster(emptyC.id);
          }
          const emptyIds = new Set(emptyBuiltinClusters.map((c) => c.id));
          nextClusters = nextClusters.filter((c) => !emptyIds.has(c.id));
        }

        // Phân phối toàn bộ phần "Câu ngắn luyện âm" / Tongue Twister về đúng Unit của JOY (không mở ở phần free)
        const shortPronunciationClusters = nextClusters.filter((c) =>
          isShortPronunciationCluster(c)
        );
        const shortPronunciationClusterIds = new Set(
          shortPronunciationClusters.map((c) => c.id)
        );

        const videosToDistributeToJoy = userUploadedOnly.filter(
          (v) =>
            !isJoySlotClusterId(v.clusterId) &&
            (shortPronunciationClusterIds.has(v.clusterId || '') ||
              isShortPronunciationCluster({ name: v.groupLabel }))
        );

        if (videosToDistributeToJoy.length > 0) {
          const sortedToDistribute = [...videosToDistributeToJoy].sort((a, b) =>
            a.title.localeCompare(b.title, undefined, { numeric: true })
          );
          for (let idx = 0; idx < sortedToDistribute.length; idx++) {
            const vid = sortedToDistribute[idx];
            const matchedUnit = matchVideoToJoyUnitForShortPronunciation(
              vid.title,
              idx,
              sortedToDistribute.length
            );
            const targetJoySlotId = getJoySlotClusterId(
              matchedUnit.storageLevelKey,
              matchedUnit.unitNumber,
              'tongue'
            );
            const levelLabel =
              matchedUnit.storageLevelKey === 'joy1' ? 'JOY 1' : 'JOY 2';

            let joySlotCluster = nextClusters.find(
              (c) => c.id === targetJoySlotId
            );
            const fallbackCover =
              vid.coverImageUrl ||
              shortPronunciationClusters.find((c) => c.coverImageUrl)
                ?.coverImageUrl;

            if (!joySlotCluster) {
              joySlotCluster = {
                id: targetJoySlotId,
                name: `${levelLabel} - Unit ${matchedUnit.unitNumber} - 5. Câu ngắn luyện âm`,
                coverImageUrl: fallbackCover,
                defaultLevel: levelLabel,
                sectionType: matchedUnit.storageLevelKey,
                unitNumber: matchedUnit.unitNumber,
                lessonKind: 'tongue',
                updatedAt: Date.now(),
              };
              await saveShadowCluster(joySlotCluster);
              nextClusters.push(joySlotCluster);
            } else if (!joySlotCluster.coverImageUrl && fallbackCover) {
              joySlotCluster.coverImageUrl = fallbackCover;
              await saveShadowCluster(joySlotCluster);
            }

            const vIndex = userUploadedOnly.findIndex((x) => x.id === vid.id);
            if (vIndex >= 0) {
              userUploadedOnly[vIndex] = {
                ...userUploadedOnly[vIndex],
                clusterId: targetJoySlotId,
                groupLabel: joySlotCluster.name,
                level: levelLabel,
                sectionType: matchedUnit.storageLevelKey,
                unitNumber: matchedUnit.unitNumber,
                lessonKind: 'tongue',
                updatedAt: Date.now(),
              };
              await saveStoredVideoLesson(userUploadedOnly[vIndex]);
            }
          }
        }

        // Xóa cụm Câu ngắn luyện âm / Tongue Twister khỏi phần free
        if (shortPronunciationClusters.length > 0) {
          for (const sc of shortPronunciationClusters) {
            await deleteShadowCluster(sc.id);
          }
          nextClusters = nextClusters.filter(
            (c) => !shortPronunciationClusterIds.has(c.id)
          );
        }

        // Nếu có video mồ côi chưa thuộc về slot JOY nào hay cụm nào, gắn vào cụm đầu tiên
        const orphanVideos = userUploadedOnly.filter(
          (v) =>
            !v.clusterId ||
            (!isJoySlotClusterId(v.clusterId) &&
              !nextClusters.some((c) => c.id === v.clusterId))
        );
        if (orphanVideos.length > 0) {
          let fallbackCluster = nextClusters.find(
            (c) => !isShortPronunciationCluster(c) && !isJoySlotClusterId(c.id)
          );
          if (!fallbackCluster) {
            fallbackCluster = {
              id: `cluster-${Date.now()}`,
              name: 'Hoạt hình mầm non',
              defaultLevel: 'Mầm non',
              sectionType: 'free',
              updatedAt: Date.now(),
            };
            await saveShadowCluster(fallbackCluster);
            nextClusters = [fallbackCluster, ...nextClusters];
          }

          for (const ov of orphanVideos) {
            ov.clusterId = fallbackCluster.id;
            await saveStoredVideoLesson(ov);
          }
        }

        setClusters(nextClusters);
        setVideoLessons(userUploadedOnly);
        if (userUploadedOnly.length > 0) {
          setSelectedVideoId(userUploadedOnly[0].id);
        }

        // Tự động cắt ảnh bìa trực tiếp từ trên video cho các video chưa có ảnh bìa
        let changed = false;
        let clustersChanged = false;
        const upgradedLessons: StoredVideoShadowLesson[] = [];

        for (const lesson of userUploadedOnly) {
          let currentLesson = lesson;

          const videoSrcForCover =
            currentLesson.videoBlob || currentLesson.videoUrl;
          if (!currentLesson.coverImageUrl && videoSrcForCover) {
            const autoFrameUrl =
              await extractCoverFrameFromVideo(videoSrcForCover);
            if (autoFrameUrl) {
              currentLesson = {
                ...currentLesson,
                coverImageUrl: autoFrameUrl,
                updatedAt: Date.now(),
              };
              await saveStoredVideoLesson(currentLesson);
              setVideoLessons((prev) =>
                prev.map((item) =>
                  item.id === currentLesson.id ? currentLesson : item
                )
              );
              changed = true;
            }
          }

          if (currentLesson.clusterId && currentLesson.coverImageUrl) {
            const parentCluster = nextClusters.find(
              (c) =>
                c.id === currentLesson.clusterId &&
                !c.isBuiltInTongueTwister &&
                !c.coverImageUrl
            );
            if (parentCluster) {
              parentCluster.coverImageUrl = currentLesson.coverImageUrl;
              await saveShadowCluster(parentCluster);
              clustersChanged = true;
            }
          }

          const isV7Analyzed =
            currentLesson.segments.length > 0 &&
            currentLesson.segments.every((s) => s.id.startsWith('seg-v7-'));

          if (!isV7Analyzed && currentLesson.videoBlob) {
            setIsAnalyzingVideoAudio(true);
            const customTexts = currentLesson.segments
              .map((s) => s.text)
              .filter((t) => !isPlaceholderSegmentText(t));

            const nextSegments = await analyzeVideoBlobSentences(
              currentLesson.videoBlob,
              customTexts,
              1.0,
              currentLesson.title,
              true
            );

            if (nextSegments.length > 0) {
              const updated: StoredVideoShadowLesson = {
                ...currentLesson,
                segments: nextSegments,
                updatedAt: Date.now(),
              };
              await saveStoredVideoLesson(updated);
              upgradedLessons.push(updated);
              setVideoLessons((prev) =>
                prev.map((item) => (item.id === updated.id ? updated : item))
              );
              changed = true;
              continue;
            }
          }
          upgradedLessons.push(currentLesson);
        }

        setIsAnalyzingVideoAudio(false);
        setIsTranscribingVideoText(false);
        if (clustersChanged) {
          setClusters([...nextClusters]);
        }
        if (changed) {
          setVideoLessons(upgradedLessons);
        }
      }
    );
  }, []);

  const handleTranscribeCurrentVideoNow = async (
    targetLesson?: StoredVideoShadowLesson
  ) => {
    const lesson = targetLesson || activeVideoLesson;
    if (!lesson || !lesson.videoBlob) return;
    if (transcribingLessonIdsRef.current.has(lesson.id)) return;

    transcribingLessonIdsRef.current.add(lesson.id);
    setIsTranscribingVideoText(true);
    try {
      let nextSegments: VideoShadowSegment[] = [];
      if (lesson.segments.length === 0) {
        nextSegments = await analyzeVideoBlobSentences(
          lesson.videoBlob,
          [],
          musicFilterStrictness,
          lesson.title
        );
      } else {
        const preparedSegs = lesson.segments.map((s, idx) => ({
          ...s,
          text: isPlaceholderSegmentText(s.text)
            ? `Câu ${idx + 1} (${s.startTime.toFixed(1)}s - ${s.endTime.toFixed(1)}s)`
            : s.text,
        }));
        nextSegments = await transcribeVideoBlobForExistingSegments(
          lesson.videoBlob,
          preparedSegs,
          lesson.title
        );
      }

      if (nextSegments.length > 0) {
        const updated: StoredVideoShadowLesson = {
          ...lesson,
          segments: nextSegments,
          updatedAt: Date.now(),
        };
        setVideoLessons((prev) =>
          prev.map((l) => (l.id === updated.id ? updated : l))
        );
        await saveStoredVideoLesson(updated);
      }
    } finally {
      transcribingLessonIdsRef.current.delete(lesson.id);
      setIsTranscribingVideoText(false);
    }
  };

  /**
   * Đảm bảo tồn tại bản ghi ShadowCluster cho 1 slot bài học trong JOY 1 / JOY 2
   */
  const ensureJoySlotClusterExists = async (
    slotClusterId: string,
    fallbackCoverUrl?: string
  ): Promise<ShadowCluster> => {
    const existing = clusters.find((c) => c.id === slotClusterId);
    if (existing) return existing;

    const match = slotClusterId.match(
      /^(joy[12])-u([1-8])-(chant|dialogue|song|story|tongue)$/
    );
    const secType = (match?.[1] as 'joy1' | 'joy2') || 'joy1';
    const unitNum = Number(match?.[2] || 1);
    const kind = (match?.[3] as JoyLessonKind) || 'chant';
    const lessonDef = JOY_LESSON_TYPES.find((t) => t.kind === kind);
    const levelLabel = secType === 'joy1' ? 'JOY 1' : 'JOY 2';

    const created: ShadowCluster = {
      id: slotClusterId,
      name: `${levelLabel} - Unit ${unitNum} - ${lessonDef?.label || kind}`,
      coverImageUrl: fallbackCoverUrl,
      defaultLevel: levelLabel,
      sectionType: secType,
      unitNumber: unitNum,
      lessonKind: kind,
      updatedAt: Date.now(),
    };
    await saveShadowCluster(created);
    setClusters((prev) => [...prev.filter((c) => c.id !== created.id), created]);
    return created;
  };

  /**
   * Tải lên 1 hoặc 1 loạt file video mới vào 1 bài học JOY (Bài vè, Dialogue, Bài hát, Truyện, Tongue)
   * hoặc vào 1 Cụm Hoạt Hình trong NGHE NGẤM TỰ DO
   */
  const handleBatchUploadVideoFiles = async (
    fileList: FileList | File[],
    options?: {
      targetClusterId?: string;
      createClusterName?: string;
      createClusterCoverUrl?: string;
      defaultLevel?: string;
    }
  ) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('video/'));
    if (files.length === 0) return;

    const desiredClusterId =
      options?.targetClusterId ||
      pendingUploadTargetClusterId ||
      (effectiveSelectedClusterId &&
      effectiveSelectedClusterId !== BUILTIN_TONGUE_CLUSTER_ID
        ? effectiveSelectedClusterId
        : undefined);

    let targetCluster: ShadowCluster | undefined;

    if (desiredClusterId && isJoySlotClusterId(desiredClusterId)) {
      targetCluster = await ensureJoySlotClusterExists(desiredClusterId);
    } else if (desiredClusterId) {
      targetCluster = clusters.find((c) => c.id === desiredClusterId);
    }

    const levelToUse = (
      options?.defaultLevel ||
      targetCluster?.defaultLevel ||
      newClusterDefaultLevel ||
      'Mầm non'
    ).trim();

    if (!targetCluster) {
      const videoClusterCount = freeCartoonClusters.filter(
        (c) => !c.isBuiltInTongueTwister
      ).length;
      const clusterTitle =
        (options?.createClusterName || newClusterName).trim() ||
        `Bộ Hoạt Hình ${videoClusterCount + 1}`;
      const newCluster: ShadowCluster = {
        id: `cluster-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        name: clusterTitle,
        coverImageUrl:
          options?.createClusterCoverUrl || newClusterCoverUrl || undefined,
        defaultLevel: levelToUse,
        sectionType: 'free',
        updatedAt: Date.now(),
      };
      await saveShadowCluster(newCluster);
      setClusters((prev) => [...prev, newCluster]);
      targetCluster = newCluster;
    }

    setIsAnalyzingVideoAudio(true);
    setIsTranscribingVideoText(true);
    const newCreatedLessons: StoredVideoShadowLesson[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const cleanTitle = formatAutoStoryTitle(file.name);
      const blobUrl = URL.createObjectURL(file);

      const autoCoverDataUrl = await extractCoverFrameFromVideo(file);
      const matchedSentences = findMatchingStorySentences(cleanTitle);

      const detectedSegments = await analyzeVideoBlobSentences(
        file,
        matchedSentences,
        musicFilterStrictness,
        cleanTitle
      );

      const finalSegments: VideoShadowSegment[] =
        detectedSegments.length > 0
          ? detectedSegments
          : matchedSentences.map((txt, idx) => ({
              id: `seg-${Date.now()}-${i}-${idx + 1}`,
              index: idx + 1,
              startTime: 0,
              endTime: 0,
              text: txt,
            }));

      const lesson: StoredVideoShadowLesson = {
        id: `vid-user-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        title: cleanTitle,
        coverImageUrl: autoCoverDataUrl || undefined,
        clusterId: targetCluster.id,
        groupLabel: targetCluster.name,
        level: levelToUse,
        sectionType: targetCluster.sectionType || 'free',
        unitNumber: targetCluster.unitNumber,
        lessonKind: targetCluster.lessonKind,
        videoBlob: file,
        videoUrl: blobUrl,
        autoSilenceDetect: true,
        segments: finalSegments,
        updatedAt: Date.now() + i,
      };

      if (!targetCluster.coverImageUrl && autoCoverDataUrl) {
        const updatedCluster: ShadowCluster = {
          ...targetCluster,
          coverImageUrl: autoCoverDataUrl,
          updatedAt: Date.now(),
        };
        targetCluster = updatedCluster;
        await saveShadowCluster(updatedCluster);
        setClusters((prev) =>
          prev.map((c) => (c.id === updatedCluster.id ? updatedCluster : c))
        );
      }

      await saveStoredVideoLesson(lesson);
      newCreatedLessons.push(lesson);
    }

    setIsAnalyzingVideoAudio(false);
    setIsTranscribingVideoText(false);
    setPendingUploadTargetClusterId(null);
    setVideoLessons((prev) => [...prev, ...newCreatedLessons]);

    setIsCreateClusterModalOpen(false);
    setNewClusterName('');
    setNewClusterCoverUrl('');

    if (isJoySlotClusterId(targetCluster.id)) {
      const m = targetCluster.id.match(
        /^(joy[12])-u([1-8])-(chant|dialogue|song|story|tongue)$/
      );
      if (m) {
        const sec = m[1] as 'joy1' | 'joy2';
        const uNum = Number(m[2]);
        const kind = m[3] as JoyLessonKind;
        setActiveStudioSection(sec);
        const combinedIdx = sec === 'joy1' ? uNum : uNum + 8;
        setSelectedJoyUnitIndex(combinedIdx);
        setJoy1LessonKind(kind);
        setJoy2LessonKind(kind);
        if (sec === 'joy1') {
          setJoy1Unit(uNum);
        } else {
          setJoy2Unit(uNum);
        }
      }
    } else {
      setActiveStudioSection('free');
      setSelectedFreeClusterId(targetCluster.id);
    }

    if (newCreatedLessons[0]) {
      setSelectedVideoId(newCreatedLessons[0].id);
      setCurrentSentenceIdx(0);
      setIsPausedForShadow(false);
      setIsVideoSentenceRevealed(false);
      resetSpeechDetectorState(0);
    }

    window.dispatchEvent(new CustomEvent('phonics-shadow-image-updated'));
  };

  /**
   * Tạo bài học Shadow bằng danh sách câu chữ (ngay cả khi chưa tải file video lên)
   * giúp Bài vè / Dialogue / Bài hát / Truyện có thể luyện Shadow từng câu ngay lập tức
   */
  const handleCreateTextShadowLessonInSlot = async (
    slotClusterId: string,
    defaultTitle: string,
    rawLinesText: string
  ) => {
    const parsed = parseLinesToVideoSegments(rawLinesText, 0);
    if (parsed.length === 0) return;
    const targetCluster = await ensureJoySlotClusterExists(slotClusterId);

    const newLesson: StoredVideoShadowLesson = {
      id: `vid-user-text-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      title: defaultTitle,
      clusterId: targetCluster.id,
      groupLabel: targetCluster.name,
      level: targetCluster.defaultLevel || 'JOY',
      sectionType: targetCluster.sectionType,
      unitNumber: targetCluster.unitNumber,
      lessonKind: targetCluster.lessonKind,
      autoSilenceDetect: true,
      segments: parsed,
      updatedAt: Date.now(),
    };

    await saveStoredVideoLesson(newLesson);
    setVideoLessons((prev) => [...prev, newLesson]);
    setSelectedVideoId(newLesson.id);
    setCurrentSentenceIdx(0);
    setBulkSentencesInput('');
  };

  const handleCreateEmptyOrReadyCluster = async () => {
    const videoClusterCount = freeCartoonClusters.filter(
      (c) => !c.isBuiltInTongueTwister
    ).length;
    const clusterTitle =
      newClusterName.trim() || `Bộ Hoạt Hình ${videoClusterCount + 1}`;
    const levelToUse = newClusterDefaultLevel.trim() || 'Mầm non';

    const newCluster: ShadowCluster = {
      id: `cluster-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name: clusterTitle,
      coverImageUrl: newClusterCoverUrl || undefined,
      defaultLevel: levelToUse,
      sectionType: 'free',
      updatedAt: Date.now(),
    };
    await saveShadowCluster(newCluster);
    setClusters((prev) => [...prev, newCluster]);
    setIsCreateClusterModalOpen(false);
    setNewClusterName('');
    setNewClusterCoverUrl('');
    setActiveStudioSection('free');
    setSelectedFreeClusterId(newCluster.id);
  };

  const handleApplyClusterCoverFile = async (clusterId: string, file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      let target = clusters.find((c) => c.id === clusterId);
      if (!target && isJoySlotClusterId(clusterId)) {
        target = await ensureJoySlotClusterExists(clusterId, dataUrl);
      }
      if (!target) return;
      const updated: ShadowCluster = {
        ...target,
        coverImageUrl: dataUrl,
        updatedAt: Date.now(),
      };
      setClusters((prev) =>
        prev.some((c) => c.id === clusterId)
          ? prev.map((c) => (c.id === clusterId ? updated : c))
          : [...prev, updated]
      );
      await saveShadowCluster(updated);
      window.dispatchEvent(new CustomEvent('phonics-shadow-image-updated'));
    } catch (err) {
      console.warn('Failed to update cluster cover image:', err);
    }
  };

  const handleUpdateClusterMeta = async (
    clusterId: string,
    patch: Partial<Pick<ShadowCluster, 'name' | 'defaultLevel' | 'coverImageUrl'>>
  ) => {
    let target = clusters.find((c) => c.id === clusterId);
    if (!target && isJoySlotClusterId(clusterId)) {
      target = await ensureJoySlotClusterExists(clusterId);
    }
    if (!target) return;
    const updated: ShadowCluster = {
      ...target,
      ...patch,
      updatedAt: Date.now(),
    };
    setClusters((prev) => prev.map((c) => (c.id === clusterId ? updated : c)));
    await saveShadowCluster(updated);
  };

  const handleDeleteCluster = async (clusterId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = clusters.find((c) => c.id === clusterId);
    if (!target || target.isBuiltInTongueTwister) return;

    if (videoPlayerRef.current) {
      videoPlayerRef.current.pause();
    }

    const videosInCluster = videoLessons.filter((v) => v.clusterId === clusterId);
    for (const v of videosInCluster) {
      await deleteStoredVideoLesson(v.id);
    }
    await deleteShadowCluster(clusterId);

    setVideoLessons((prev) => prev.filter((v) => v.clusterId !== clusterId));
    setClusters((prev) => prev.filter((c) => c.id !== clusterId));
    if (selectedFreeClusterId === clusterId) {
      setSelectedFreeClusterId(null);
    }
  };

  const handleUpdateVideoLevel = async (videoId: string, newLevel: string) => {
    const target = videoLessons.find((v) => v.id === videoId);
    if (!target) return;
    const updated: StoredVideoShadowLesson = {
      ...target,
      level: newLevel,
      updatedAt: Date.now(),
    };
    setVideoLessons((prev) =>
      prev.map((v) => (v.id === videoId ? updated : v))
    );
    await saveStoredVideoLesson(updated);
  };

  const handleMoveVideoToAnotherCluster = async (
    videoId: string,
    newClusterId: string
  ) => {
    const target = videoLessons.find((v) => v.id === videoId);
    if (!target || !newClusterId) return;
    if (isJoySlotClusterId(newClusterId)) {
      await ensureJoySlotClusterExists(newClusterId, target.coverImageUrl);
    }
    const updated: StoredVideoShadowLesson = {
      ...target,
      clusterId: newClusterId,
      updatedAt: Date.now(),
    };
    setVideoLessons((prev) =>
      prev.map((v) => (v.id === videoId ? updated : v))
    );
    await saveStoredVideoLesson(updated);
  };

  const handleApplyVideoCoverFile = async (videoId: string, file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      const target = videoLessons.find((v) => v.id === videoId);
      if (!target) return;
      const updated: StoredVideoShadowLesson = {
        ...target,
        coverImageUrl: dataUrl,
        updatedAt: Date.now(),
      };
      setVideoLessons((prev) =>
        prev.map((v) => (v.id === videoId ? updated : v))
      );
      await saveStoredVideoLesson(updated);
      window.dispatchEvent(new CustomEvent('phonics-shadow-image-updated'));
    } catch (err) {
      console.warn('Failed to update story cover image:', err);
    }
  };

  const handleDeleteVideoLessonById = async (
    videoId: string,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    if (selectedVideoId === videoId && videoPlayerRef.current) {
      videoPlayerRef.current.pause();
    }
    const remaining = videoLessons.filter((l) => l.id !== videoId);
    setVideoLessons(remaining);
    if (selectedVideoId === videoId) {
      const nextInCluster = remaining.find(
        (l) => l.clusterId === effectiveSelectedClusterId
      );
      setSelectedVideoId(nextInCluster?.id || remaining[0]?.id || '');
    }
    await deleteStoredVideoLesson(videoId);
  };

  const handleRescanCurrentVideoSentences = async (customStrictness?: number) => {
    if (!activeVideoLesson?.videoBlob) return;
    setIsAnalyzingVideoAudio(true);
    setIsTranscribingVideoText(true);
    const strictVal = customStrictness ?? musicFilterStrictness;
    const existingTexts = activeVideoLesson.segments
      .map((s) => s.text)
      .filter((t) => !isPlaceholderSegmentText(t));

    const detected = await analyzeVideoBlobSentences(
      activeVideoLesson.videoBlob,
      existingTexts,
      strictVal,
      activeVideoLesson.title
    );
    setIsAnalyzingVideoAudio(false);
    setIsTranscribingVideoText(false);

    if (detected.length > 0) {
      const updated: StoredVideoShadowLesson = {
        ...activeVideoLesson,
        segments: detected,
        updatedAt: Date.now(),
      };
      setVideoLessons((prev) =>
        prev.map((l) => (l.id === updated.id ? updated : l))
      );
      await saveStoredVideoLesson(updated);
      setCurrentSentenceIdx(0);
    }
  };

  const handleSelectVideoLesson = (lessonId: string) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.pause();
      videoPlayerRef.current.currentTime = 0;
    }
    stopAllShadowing();
    setSelectedVideoId(lessonId);
    setCurrentSentenceIdx(0);
    setIsVideoPlaying(false);
    setIsPausedForShadow(false);
    setIsVideoSentenceRevealed(false);
    resetSpeechDetectorState(0);
  };

  const setupVideoAudioAnalyser = () => {
    const videoEl = videoPlayerRef.current;
    if (!videoEl) return;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }

      if (!mediaSourceCreatedRef.current.has(videoEl)) {
        const source = audioCtxRef.current.createMediaElementSource(videoEl);
        const analyser = audioCtxRef.current.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.22;
        source.connect(analyser);
        analyser.connect(audioCtxRef.current.destination);
        analyserRef.current = analyser;
        mediaSourceCreatedRef.current.add(videoEl);
      }
    } catch {
      // Ignore if already connected
    }
  };

  useEffect(() => {
    if (!isVideoPlaying) {
      if (rafSilenceIdRef.current) {
        cancelAnimationFrame(rafSilenceIdRef.current);
        rafSilenceIdRef.current = null;
      }
      return;
    }

    const freqData = new Uint8Array(1024);
    const timeData = new Uint8Array(2048);

    const monitorPlaybackAndSpeech = () => {
      const videoEl = videoPlayerRef.current;
      if (!videoEl || videoEl.paused) {
        rafSilenceIdRef.current = requestAnimationFrame(monitorPlaybackAndSpeech);
        return;
      }

      const nowVideoTime = videoEl.currentTime;

      if (
        smartAudioAutoPause &&
        activeVideoSegment &&
        activeVideoSegment.endTime > activeVideoSegment.startTime + 0.25
      ) {
        if (nowVideoTime < activeVideoSegment.startTime - 0.12) {
          setDetectedAudioKind('music');
        } else {
          setDetectedAudioKind('speech');
        }

        const nextSeg = activeVideoLesson?.segments[currentSentenceIdx + 1];
        const maxSafeEnd =
          nextSeg && nextSeg.startTime > activeVideoSegment.endTime
            ? Math.max(activeVideoSegment.endTime, nextSeg.startTime - 0.05)
            : videoEl.duration || Infinity;
        const effectiveEndTime = Math.min(
          maxSafeEnd,
          activeVideoSegment.endTime + tailExtendSec
        );

        if (nowVideoTime >= effectiveEndTime) {
          videoEl.pause();
          setIsVideoPlaying(false);
          setIsPausedForShadow(true);
          lastPausedSentenceTimeRef.current = nowVideoTime;
          return;
        }

        rafSilenceIdRef.current = requestAnimationFrame(monitorPlaybackAndSpeech);
        return;
      }

      const analyser = analyserRef.current;
      if (!smartAudioAutoPause || !analyser) {
        rafSilenceIdRef.current = requestAnimationFrame(monitorPlaybackAndSpeech);
        return;
      }

      analyser.getByteFrequencyData(freqData);
      analyser.getByteTimeDomainData(timeData);

      const sampleRate = audioCtxRef.current?.sampleRate || 44100;
      const binHz = sampleRate / 2048;

      const avgBand = (minHz: number, maxHz: number) => {
        const startBin = Math.max(1, Math.floor(minHz / binHz));
        const endBin = Math.min(freqData.length - 1, Math.ceil(maxHz / binHz));
        if (endBin < startBin) return 0;
        let sum = 0;
        for (let i = startBin; i <= endBin; i++) {
          sum += freqData[i];
        }
        return sum / (endBin - startBin + 1);
      };

      const subBassEnergy = avgBand(35, 200);
      const speechFormantEnergy = avgBand(320, 2700);
      const consonantEnergy = avgBand(2700, 6200);

      let zeroCrossings = 0;
      let sumSquares = 0;
      for (let i = 1; i < timeData.length; i++) {
        const prev = timeData[i - 1] - 128;
        const curr = timeData[i] - 128;
        if ((prev >= 0 && curr < 0) || (prev < 0 && curr >= 0)) {
          zeroCrossings++;
        }
        const norm = curr / 128;
        sumSquares += norm * norm;
      }
      const zcr = zeroCrossings / timeData.length;
      const rms = Math.sqrt(sumSquares / timeData.length);

      const st = speechStateRef.current;
      const now = performance.now();

      const voiceThreshold =
        Math.max(24, st.rollingMusicFloor + 10) * musicFilterStrictness;

      const activeMaintainThreshold = st.inSpeechUtterance
        ? Math.max(voiceThreshold * 0.62, st.utterancePeakFormant * 0.25)
        : voiceThreshold;

      const isBassHeavyMusic = subBassEnergy > speechFormantEnergy * 0.88;

      const isSpeechFrame =
        rms > 0.011 &&
        !isBassHeavyMusic &&
        ((speechFormantEnergy >= activeMaintainThreshold &&
          speechFormantEnergy > subBassEnergy * 1.08) ||
          (consonantEnergy > 15 && zcr > 0.08 && subBassEnergy < consonantEnergy * 1.35));

      if (!isSpeechFrame) {
        st.rollingMusicFloor =
          st.rollingMusicFloor * 0.96 + Math.min(42, speechFormantEnergy) * 0.04;
      }

      if (isSpeechFrame) {
        setDetectedAudioKind('speech');

        if (!st.inSpeechUtterance) {
          st.inSpeechUtterance = true;
          st.utteranceStartMs = now;
          st.utterancePeakFormant = speechFormantEnergy;
          st.syllablePeakCount = 1;
          st.minZcrInSpan = zcr;
          st.maxZcrInSpan = zcr;
          st.musicFrameCountInSpan = 0;
          st.speechFrameCountInSpan = 1;
          st.hadDipSinceLastPeak = false;
          st.lastSyllablePeakMs = now;
          sentenceStartVideoTimeRef.current = Math.max(
            lastPausedSentenceTimeRef.current,
            nowVideoTime - 0.2
          );
        } else {
          if (speechFormantEnergy > st.utterancePeakFormant) {
            st.utterancePeakFormant = speechFormantEnergy;
          }
          if (zcr < st.minZcrInSpan) st.minZcrInSpan = zcr;
          if (zcr > st.maxZcrInSpan) st.maxZcrInSpan = zcr;
          st.speechFrameCountInSpan += 1;
        }

        st.lastSpeechFrameMs = now;

        if (
          !st.inSyllablePeak &&
          st.hadDipSinceLastPeak &&
          speechFormantEnergy > voiceThreshold + 3
        ) {
          if (now - st.lastSyllablePeakMs >= 130) {
            st.syllablePeakCount += 1;
            st.lastSyllablePeakMs = now;
            st.hadDipSinceLastPeak = false;
          }
          st.inSyllablePeak = true;
        }
      } else {
        if (speechFormantEnergy < activeMaintainThreshold - 3) {
          st.inSyllablePeak = false;
          st.hadDipSinceLastPeak = true;
        }

        if (rms > 0.014 || subBassEnergy > 22) {
          setDetectedAudioKind('music');
          if (st.inSpeechUtterance && isBassHeavyMusic) {
            st.musicFrameCountInSpan += 1;
          }
        } else {
          setDetectedAudioKind('silent');
        }

        if (st.inSpeechUtterance) {
          const silenceAfterSpeechMs = now - st.lastSpeechFrameMs;
          const totalSpeechSpanMs = st.lastSpeechFrameMs - st.utteranceStartMs;
          const zcrContrast = st.maxZcrInSpan - st.minZcrInSpan;
          const requiredSilenceMs = Math.round(520 + tailExtendSec * 550);

          if (silenceAfterSpeechMs >= requiredSilenceMs) {
            const isGenuineSpokenSentence =
              st.syllablePeakCount >= 2 &&
              totalSpeechSpanMs >= 550 &&
              zcrContrast >= 0.02 &&
              st.speechFrameCountInSpan > st.musicFrameCountInSpan &&
              nowVideoTime - lastPausedSentenceTimeRef.current >= 1.1;

            if (isGenuineSpokenSentence) {
              videoEl.pause();
              setIsVideoPlaying(false);
              setIsPausedForShadow(true);
              lastPausedSentenceTimeRef.current = nowVideoTime;
              st.inSpeechUtterance = false;
              return;
            } else {
              st.inSpeechUtterance = false;
            }
          }
        }
      }

      rafSilenceIdRef.current = requestAnimationFrame(monitorPlaybackAndSpeech);
    };

    rafSilenceIdRef.current = requestAnimationFrame(monitorPlaybackAndSpeech);
    return () => {
      if (rafSilenceIdRef.current) {
        cancelAnimationFrame(rafSilenceIdRef.current);
        rafSilenceIdRef.current = null;
      }
    };
  }, [
    isVideoPlaying,
    smartAudioAutoPause,
    musicFilterStrictness,
    tailExtendSec,
    activeVideoSegment,
    activeVideoLesson,
    currentSentenceIdx,
  ]);

  const handleVideoTimeUpdate = () => {
    const videoEl = videoPlayerRef.current;
    if (!videoEl || videoEl.paused || !smartAudioAutoPause) return;

    if (
      activeVideoSegment &&
      activeVideoSegment.endTime > activeVideoSegment.startTime + 0.25
    ) {
      const nextSeg = activeVideoLesson?.segments[currentSentenceIdx + 1];
      const maxSafeEnd =
        nextSeg && nextSeg.startTime > activeVideoSegment.endTime
          ? Math.max(activeVideoSegment.endTime, nextSeg.startTime - 0.05)
          : videoEl.duration || Infinity;
      const effectiveEndTime = Math.min(
        maxSafeEnd,
        activeVideoSegment.endTime + tailExtendSec
      );

      if (videoEl.currentTime >= effectiveEndTime) {
        if (dubPlaybackModeRef.current === 'full') {
          videoEl.pause();
          return;
        }
        if (dubPlaybackModeRef.current === 'single') {
          videoEl.pause();
          videoEl.muted = false;
          setIsVideoPlaying(false);
          setIsPausedForShadow(true);
          return;
        }
        videoEl.pause();
        setIsVideoPlaying(false);
        setIsPausedForShadow(true);
        lastPausedSentenceTimeRef.current = videoEl.currentTime;
      }
    }
  };

  /**
   * Phát câu thứ idx trong Video hoặc bằng giọng đọc mẫu UK nếu bài học chỉ mới nhập câu chữ
   */
  const playVideoSentenceAt = (idx: number, seekToStart = true) => {
    if (!activeVideoLesson) return;
    const seg = activeVideoLesson.segments[idx];
    setCurrentSentenceIdx(idx);
    setIsPausedForShadow(false);
    setIsVideoSentenceRevealed(false);

    const videoEl = videoPlayerRef.current;
    if (videoEl && activeVideoLesson.videoUrl) {
      setupVideoAudioAnalyser();
      videoEl.muted = false;
      videoEl.volume = 1.0;
      videoEl.playbackRate = playbackSpeed;
      if ('preservesPitch' in videoEl) {
        (videoEl as HTMLVideoElement & { preservesPitch?: boolean }).preservesPitch = true;
      }

      if (seekToStart && seg && seg.endTime > seg.startTime) {
        const targetStart = Math.max(0, seg.startTime - 0.12);
        videoEl.currentTime = targetStart;
        resetSpeechDetectorState(targetStart);
      } else {
        resetSpeechDetectorState(videoEl.currentTime);
      }

      videoEl
        .play()
        .then(() => {
          setIsVideoPlaying(true);
        })
        .catch(() => {
          setIsVideoPlaying(false);
        });
      return;
    }

    // Nếu bài học mới dán câu chữ mà chưa có file video -> đọc mẫu chuẩn UK và tự dừng chờ Shadow
    if (seg && seg.text) {
      setIsVideoPlaying(true);
      const ttsRate = Math.max(
        0.45,
        Math.min(1.2, Math.round(playbackSpeed * 0.72 * 100) / 100)
      );
      speakSentence(
        seg.text,
        '',
        () => {
          setIsVideoPlaying(false);
          setIsPausedForShadow(true);
        },
        ttsRate,
        true
      );
    }
  };

  const handleContinueNextSentence = () => {
    if (!activeVideoLesson) return;
    const videoEl = videoPlayerRef.current;

    if (activeVideoLesson.segments.length > 0) {
      if (!isPausedForShadow && !isVideoPlaying) {
        if (videoEl && videoEl.ended) {
          playVideoSentenceAt(0, true);
        } else {
          playVideoSentenceAt(currentSentenceIdx, true);
        }
        return;
      }

      const nextIdx = currentSentenceIdx + 1;
      if (nextIdx < activeVideoLesson.segments.length) {
        playVideoSentenceAt(nextIdx, true);
        return;
      } else {
        playVideoSentenceAt(0, true);
        return;
      }
    }

    if (videoEl && activeVideoLesson.videoUrl) {
      setupVideoAudioAnalyser();
      if (videoEl.ended) {
        videoEl.currentTime = 0;
        setCurrentSentenceIdx(0);
        resetSpeechDetectorState(0);
      } else {
        if (isPausedForShadow) {
          setCurrentSentenceIdx((prev) => prev + 1);
        }
        resetSpeechDetectorState(videoEl.currentTime);
      }
      setIsPausedForShadow(false);
      setIsVideoSentenceRevealed(false);
      videoEl.play().then(() => setIsVideoPlaying(true));
    }
  };

  const handleNextSentence = () => {
    if (!activeVideoLesson) return;
    if (activeVideoLesson.segments.length > 0) {
      const nextIdx =
        currentSentenceIdx + 1 < activeVideoLesson.segments.length
          ? currentSentenceIdx + 1
          : 0;
      playVideoSentenceAt(nextIdx, true);
      return;
    }
    handleContinueNextSentence();
  };

  const handlePreviousSentence = () => {
    if (!activeVideoLesson) return;
    if (activeVideoLesson.segments.length > 0) {
      const prevIdx = currentSentenceIdx > 0 ? currentSentenceIdx - 1 : 0;
      playVideoSentenceAt(prevIdx, true);
      return;
    }
    const videoEl = videoPlayerRef.current;
    if (videoEl && activeVideoLesson.videoUrl) {
      setupVideoAudioAnalyser();
      const targetTime = Math.max(0, videoEl.currentTime - 4);
      videoEl.currentTime = targetTime;
      setCurrentSentenceIdx((prev) => Math.max(0, prev - 1));
      setIsPausedForShadow(false);
      setIsVideoSentenceRevealed(false);
      resetSpeechDetectorState(targetTime);
      videoEl.play().then(() => setIsVideoPlaying(true));
    }
  };

  const handleSkipMusicAndContinue = async () => {
    const videoEl = videoPlayerRef.current;
    const newStrictness = Math.min(1.5, musicFilterStrictness + 0.12);
    setMusicFilterStrictness(newStrictness);

    if (
      activeVideoLesson &&
      activeVideoLesson.segments.length > 1 &&
      currentSentenceIdx < activeVideoLesson.segments.length
    ) {
      const filteredSegs = activeVideoLesson.segments
        .filter((_, idx) => idx !== currentSentenceIdx)
        .map((s, idx) => ({ ...s, index: idx + 1 }));

      const updated: StoredVideoShadowLesson = {
        ...activeVideoLesson,
        segments: filteredSegs,
        updatedAt: Date.now(),
      };
      setVideoLessons((prev) =>
        prev.map((l) => (l.id === updated.id ? updated : l))
      );
      await saveStoredVideoLesson(updated);
    }

    if (videoEl && activeVideoLesson?.videoUrl) {
      setupVideoAudioAnalyser();
      setIsPausedForShadow(false);
      resetSpeechDetectorState(videoEl.currentTime);
      videoEl.play().then(() => setIsVideoPlaying(true));
    }
  };

  const handleReplayCurrentSentence = () => {
    if (!activeVideoLesson) return;
    const videoEl = videoPlayerRef.current;
    if (videoEl && activeVideoLesson.videoUrl) {
      setupVideoAudioAnalyser();
      videoEl.playbackRate = playbackSpeed;
      if ('preservesPitch' in videoEl) {
        (videoEl as HTMLVideoElement & { preservesPitch?: boolean }).preservesPitch = true;
      }
      if (
        activeVideoSegment &&
        activeVideoSegment.endTime > activeVideoSegment.startTime
      ) {
        videoEl.currentTime = Math.max(0, activeVideoSegment.startTime - 0.12);
      } else {
        videoEl.currentTime = Math.max(0, sentenceStartVideoTimeRef.current);
      }
      setIsPausedForShadow(false);
      resetSpeechDetectorState(videoEl.currentTime);
      videoEl.play().then(() => setIsVideoPlaying(true));
      return;
    }

    playVideoSentenceAt(currentSentenceIdx, true);
  };

  const handleReplaceSingleVideoFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !activeVideoLesson) return;
    const blobUrl = URL.createObjectURL(file);

    setIsAnalyzingVideoAudio(true);
    setIsTranscribingVideoText(true);
    const autoCoverDataUrl = await extractCoverFrameFromVideo(file);
    const existingTexts = activeVideoLesson.segments
      .map((s) => s.text)
      .filter((t) => !isPlaceholderSegmentText(t));
    const detectedSegments = await analyzeVideoBlobSentences(
      file,
      existingTexts,
      musicFilterStrictness,
      activeVideoLesson.title
    );
    setIsAnalyzingVideoAudio(false);
    setIsTranscribingVideoText(false);

    const updatedLesson: StoredVideoShadowLesson = {
      ...activeVideoLesson,
      coverImageUrl: autoCoverDataUrl || activeVideoLesson.coverImageUrl,
      videoBlob: file,
      videoUrl: blobUrl,
      segments:
        detectedSegments.length > 0 ? detectedSegments : activeVideoLesson.segments,
      updatedAt: Date.now(),
    };

    setVideoLessons((prev) =>
      prev.map((item) => (item.id === updatedLesson.id ? updatedLesson : item))
    );
    await saveStoredVideoLesson(updatedLesson);
    setCurrentSentenceIdx(0);
    e.target.value = '';
  };

  const handleRenameCurrentVideoTitle = async (newTitle: string) => {
    if (!activeVideoLesson) return;
    const updated: StoredVideoShadowLesson = {
      ...activeVideoLesson,
      title: newTitle,
      updatedAt: Date.now(),
    };
    setVideoLessons((prev) =>
      prev.map((l) => (l.id === updated.id ? updated : l))
    );
    await saveStoredVideoLesson(updated);
  };

  const handleApplyBulkSentencesToCurrentVideo = async () => {
    if (!activeVideoLesson || !bulkSentencesInput.trim()) return;
    const parsed = parseLinesToVideoSegments(bulkSentencesInput, 0);
    const updated: StoredVideoShadowLesson = {
      ...activeVideoLesson,
      segments: parsed,
      updatedAt: Date.now(),
    };
    setVideoLessons((prev) =>
      prev.map((l) => (l.id === updated.id ? updated : l))
    );
    await saveStoredVideoLesson(updated);
    setBulkSentencesInput('');
  };

  const handleMarkCutAtCurrentVideoTime = async () => {
    const videoEl = videoPlayerRef.current;
    if (!videoEl || !activeVideoLesson) return;
    const nowSec = Math.round(videoEl.currentTime * 10) / 10;

    let updatedSegments = [...activeVideoLesson.segments];
    if (updatedSegments.length === 0) {
      updatedSegments = [
        {
          id: `seg-${Date.now()}-1`,
          index: 1,
          startTime: Math.round(sentenceStartVideoTimeRef.current * 10) / 10,
          endTime: nowSec,
          text: 'Câu 1 (Nhập chữ tại mục Chỉnh câu)',
        },
        {
          id: `seg-${Date.now()}-2`,
          index: 2,
          startTime: nowSec,
          endTime: 0,
          text: 'Câu 2 (Nhập chữ tại mục Chỉnh câu)',
        },
      ];
    } else if (activeVideoSegment) {
      updatedSegments = updatedSegments.map((seg, i) => {
        if (i === currentSentenceIdx) {
          return { ...seg, endTime: nowSec };
        }
        if (i === currentSentenceIdx + 1) {
          return {
            ...seg,
            startTime: nowSec,
          };
        }
        return seg;
      });
    }

    const updatedLesson: StoredVideoShadowLesson = {
      ...activeVideoLesson,
      segments: updatedSegments,
      updatedAt: Date.now(),
    };

    setVideoLessons((prev) =>
      prev.map((l) => (l.id === updatedLesson.id ? updatedLesson : l))
    );
    await saveStoredVideoLesson(updatedLesson);
    videoEl.pause();
    setIsVideoPlaying(false);
    setIsPausedForShadow(true);
  };

  const handleUpdateVideoSegmentField = async (
    segId: string,
    field: 'text' | 'startTime' | 'endTime',
    value: string | number
  ) => {
    if (!activeVideoLesson) return;
    const updatedSegments = activeVideoLesson.segments.map((s) =>
      s.id === segId ? { ...s, [field]: value } : s
    );
    const updatedLesson: StoredVideoShadowLesson = {
      ...activeVideoLesson,
      segments: updatedSegments,
      updatedAt: Date.now(),
    };
    setVideoLessons((prev) =>
      prev.map((l) => (l.id === updatedLesson.id ? updatedLesson : l))
    );
    await saveStoredVideoLesson(updatedLesson);
  };

  const handleAddVideoSegmentRow = async () => {
    if (!activeVideoLesson) return;
    const last = activeVideoLesson.segments[activeVideoLesson.segments.length - 1];
    const st = last ? last.endTime : 0;
    const newSeg: VideoShadowSegment = {
      id: `seg-${Date.now()}`,
      index: activeVideoLesson.segments.length + 1,
      startTime: st,
      endTime: 0,
      text: `Câu ${activeVideoLesson.segments.length + 1}`,
    };
    const updatedLesson: StoredVideoShadowLesson = {
      ...activeVideoLesson,
      segments: [...activeVideoLesson.segments, newSeg],
      updatedAt: Date.now(),
    };
    setVideoLessons((prev) =>
      prev.map((l) => (l.id === updatedLesson.id ? updatedLesson : l))
    );
    await saveStoredVideoLesson(updatedLesson);
  };

  // ============================================================================
  // PHẦN B: CÂU NGẮN LUYỆN ÂM THEO ĐÚNG UNIT CỦA JOY (JE1-U1..U8 & JE2-U1..U8)
  // ============================================================================
  const activeJoyUnitForTongue =
    ALL_JOY_UNITS.find((u) => u.unitIndex === selectedJoyUnitIndex) ||
    ALL_JOY_UNITS[0];

  const activeTongueUnitCode = activeJoyUnitForTongue.unitCode;

  const filteredRecords = TONGUE_TWISTERS_DATA.filter(
    (item) => item.unitCode === activeTongueUnitCode
  );

  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [isPlayingModel, setIsPlayingModel] = useState<boolean>(false);
  const [isShadowingWait, setIsShadowingWait] = useState<boolean>(false);
  const [revealedTextMap, setRevealedTextMap] = useState<Record<string, boolean>>({});
  const [userRecordedAudioMap, setUserRecordedAudioMap] = useState<Record<string, string>>({});
  const [recordingRecordId, setRecordingRecordId] = useState<string | null>(null);
  const [savedDubbingRecords, setSavedDubbingRecords] = useState<StudentDubbingRecord[]>([]);
  const [isSavingDubbingKey, setIsSavingDubbingKey] = useState<string | null>(null);
  const [dubSaveBannerMessage, setDubSaveBannerMessage] = useState<string>('');
  const [isDubLibraryOpen, setIsDubLibraryOpen] = useState<boolean>(false);
  const [dubPlaybackMode, setDubPlaybackMode] = useState<'none' | 'single' | 'full'>('none');
  const dubPlaybackModeRef = useRef<'none' | 'single' | 'full'>('none');
  const dubAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fullDubSessionRef = useRef<number>(0);

  const [customImagesMap, setCustomImagesMap] = useState<Record<string, string>>({});
  const [uploadingImageForId, setUploadingImageForId] = useState<string | null>(null);
  const [dragOverRecordId, setDragOverRecordId] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const shadowSessionRef = useRef<number>(0);

  // Tự động tải các bài lồng tiếng đã lưu trong tài khoản khi học viên đăng nhập
  useEffect(() => {
    if (!isLoggedIn || (!currentUserEmail && !currentUsername)) {
      setSavedDubbingRecords([]);
      return;
    }
    let cancelled = false;
    fetchStudentDubbingRecords({
      email: currentUserEmail,
      username: currentUsername,
    }).then(({ records, audioMap }) => {
      if (cancelled) return;
      setSavedDubbingRecords(records);
      if (audioMap && Object.keys(audioMap).length > 0) {
        setUserRecordedAudioMap((prev) => ({
          ...audioMap,
          ...prev,
        }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, currentUserEmail, currentUsername]);

  useEffect(() => {
    let mounted = true;
    const syncAllRedSoundImages = async () => {
      const loaded = await loadAllShadowImages();
      if (!mounted) return;
      setCustomImagesMap(loaded);

      for (const rec of filteredRecords) {
        if (!mounted) return;
        if (!loaded[rec.id]) {
          const matchedSound = PHONICS_42_SOUNDS.find(
            (s) => s.id.toLowerCase() === rec.phonemeKey.toLowerCase()
          );
          const groupId = matchedSound?.group || 1;
          const grpSounds = PHONICS_42_SOUNDS.filter((s) => s.group === groupId);
          const idxInGrp = Math.max(
            0,
            grpSounds.findIndex((s) => s.id === matchedSound?.id)
          );
          const videoCut = await getThumbnailForPhonicsSound(
            rec.phonemeKey,
            groupId,
            idxInGrp,
            loaded
          );
          if (mounted && videoCut) {
            setCustomImagesMap((prev) =>
              prev[rec.id] ? prev : { ...prev, [rec.id]: videoCut }
            );
          }
        }
      }
    };

    syncAllRedSoundImages();
    const unsub = subscribeVideoUpdates(() => {
      syncAllRedSoundImages();
    });
    window.addEventListener('phonics-shadow-image-updated', syncAllRedSoundImages);
    return () => {
      mounted = false;
      unsub();
      window.removeEventListener('phonics-shadow-image-updated', syncAllRedSoundImages);
    };
  }, [activeTongueUnitCode]);

  const stopDubbedVideoPlayback = () => {
    fullDubSessionRef.current += 1;
    dubPlaybackModeRef.current = 'none';
    setDubPlaybackMode('none');
    if (dubAudioPlayerRef.current) {
      dubAudioPlayerRef.current.pause();
      dubAudioPlayerRef.current = null;
    }
    if (videoPlayerRef.current) {
      videoPlayerRef.current.muted = false;
      videoPlayerRef.current.pause();
    }
    setIsVideoPlaying(false);
  };

  const stopAllShadowing = () => {
    shadowSessionRef.current += 1;
    stopDubbedVideoPlayback();
    stopSpeaking();
    setIsPlayingModel(false);
    setIsShadowingWait(false);
    setActiveRecordId(null);
  };

  useEffect(() => {
    return () => {
      stopDubbedVideoPlayback();
      stopSpeaking();
    };
  }, []);

  const toggleRevealText = (recordId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRevealedTextMap((prev) => ({
      ...prev,
      [recordId]: !prev[recordId],
    }));
  };

  const applyImageFileToRecord = async (recordId: string, file: File) => {
    if (!file.type.startsWith('image/')) return;
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      setCustomImagesMap((prev) => ({
        ...prev,
        [recordId]: dataUrl,
      }));
      await saveShadowRecordImage(recordId, dataUrl);
      window.dispatchEvent(new CustomEvent('phonics-shadow-image-updated'));
    } catch (err) {
      console.warn('Error reading uploaded image:', err);
    }
  };

  const handleImageInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingImageForId) {
      await applyImageFileToRecord(uploadingImageForId, file);
    }
    setUploadingImageForId(null);
    e.target.value = '';
  };

  const handleDeleteCustomImage = async (recordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomImagesMap((prev) => {
      const next = { ...prev };
      delete next[recordId];
      return next;
    });
    await removeShadowRecordImage(recordId);
    window.dispatchEvent(new CustomEvent('phonics-shadow-image-updated'));
  };

  const startShadowRecord = (record: TongueTwisterRecord) => {
    shadowSessionRef.current += 1;
    const currentSession = shadowSessionRef.current;

    setActiveRecordId(record.id);
    setIsShadowingWait(false);
    setIsPlayingModel(true);

    setRevealedTextMap((prev) => ({
      ...prev,
      [record.id]: false,
    }));

    const ttsRate = Math.max(0.45, Math.min(1.2, Math.round(playbackSpeed * 0.72 * 100) / 100));

    speakSentence(
      record.sentence,
      record.soundTitle,
      () => {
        if (shadowSessionRef.current !== currentSession) return;
        setIsPlayingModel(false);
        setIsShadowingWait(true);
      },
      ttsRate,
      true
    );
  };

  const handleNextTongueTwisterRecord = (currentRecordId: string) => {
    const idx = filteredRecords.findIndex((r) => r.id === currentRecordId);
    if (idx >= 0 && idx < filteredRecords.length - 1) {
      startShadowRecord(filteredRecords[idx + 1]);
    } else if (filteredRecords.length > 0) {
      startShadowRecord(filteredRecords[0]);
    }
  };

  const handlePrevTongueTwisterRecord = (currentRecordId: string) => {
    const idx = filteredRecords.findIndex((r) => r.id === currentRecordId);
    if (idx > 0) {
      startShadowRecord(filteredRecords[idx - 1]);
    } else if (filteredRecords.length > 0) {
      startShadowRecord(filteredRecords[0]);
    }
  };

  const blobToDataUrl = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ''));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const toggleRecordUserVoice = async (
    recordId: string,
    e?: React.MouseEvent,
    dubContext?: {
      videoLesson?: StoredVideoShadowLesson;
      segment?: VideoShadowSegment;
      segmentIndex?: number;
      clusterId?: string;
      clusterName?: string;
      sentenceText?: string;
    }
  ) => {
    if (e) e.stopPropagation();

    if (!isLoggedIn) {
      if (onOpenAuthModal) {
        onOpenAuthModal('login');
      } else {
        onRequireRegister?.();
      }
      return;
    }

    if (recordingRecordId === recordId && mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (videoPlayerRef.current) {
        videoPlayerRef.current.pause();
        videoPlayerRef.current.muted = false;
        setIsVideoPlaying(false);
      }
      setRecordingRecordId(null);
      return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    stopDubbedVideoPlayback();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      // Nếu đang lồng tiếng cho 1 câu trong video: phát hình video tắt tiếng gốc đúng câu đó để học viên nhìn hình lồng tiếng khớp khẩu hình
      const targetSeg = dubContext?.segment;
      const targetIdx =
        typeof dubContext?.segmentIndex === 'number'
          ? dubContext.segmentIndex
          : currentSentenceIdx;
      const videoEl = videoPlayerRef.current;

      if (typeof dubContext?.segmentIndex === 'number') {
        setCurrentSentenceIdx(dubContext.segmentIndex);
      }

      if (videoEl && (dubContext?.videoLesson?.videoUrl || activeVideoLesson?.videoUrl)) {
        videoEl.pause();
        videoEl.muted = true;
        if (targetSeg && targetSeg.endTime > targetSeg.startTime) {
          videoEl.currentTime = Math.max(0, targetSeg.startTime);
        }
        dubPlaybackModeRef.current = 'single';
        setDubPlaybackMode('single');
        videoEl
          .play()
          .then(() => {
            setIsVideoPlaying(true);
            setIsPausedForShadow(false);
          })
          .catch(() => {});
      }

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) {
          recordedChunksRef.current.push(ev.data);
        }
      };

      recorder.onstop = async () => {
        if (videoPlayerRef.current) {
          videoPlayerRef.current.pause();
          videoPlayerRef.current.muted = false;
        }
        dubPlaybackModeRef.current = 'none';
        setDubPlaybackMode('none');
        setIsVideoPlaying(false);
        setIsPausedForShadow(true);

        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setUserRecordedAudioMap((prev) => ({
          ...prev,
          [recordId]: url,
        }));
        stream.getTracks().forEach((t) => t.stop());
        setRecordingRecordId(null);

        // Lưu bản lồng tiếng của câu này vào tài khoản học viên
        if (isLoggedIn && (currentUserEmail || currentUsername)) {
          setIsSavingDubbingKey(recordId);
          try {
            const dataUrl = await blobToDataUrl(blob);
            const lessonObj = dubContext?.videoLesson || activeVideoLesson;
            const segObj =
              targetSeg || lessonObj?.segments[targetIdx];
            const saved = await saveStudentDubbingSegment({
              email: currentUserEmail,
              username: currentUsername,
              recordKey: recordId,
              videoId: lessonObj?.id || dubContext?.clusterId || 'tongue-twister',
              videoTitle:
                lessonObj?.title ||
                dubContext?.clusterName ||
                'Tune In - Lồng Tiếng',
              clusterId:
                dubContext?.clusterId ||
                lessonObj?.clusterId ||
                effectiveSelectedClusterId ||
                'free',
              clusterName:
                dubContext?.clusterName ||
                activeCluster?.name ||
                'Tune In - Lồng Tiếng',
              segmentId: segObj?.id || recordId,
              segmentIndex: (targetIdx ?? 0) + 1,
              totalSegments: lessonObj?.segments.length || 1,
              sentenceText:
                dubContext?.sentenceText ||
                segObj?.text ||
                `Câu ${(targetIdx ?? 0) + 1}`,
              startTime: segObj?.startTime || 0,
              endTime: segObj?.endTime || 0,
              audioDataUrl: dataUrl,
            });

            if (saved) {
              setSavedDubbingRecords((prev) => {
                const others = prev.filter((r) => r.recordKey !== saved.recordKey);
                return [saved, ...others];
              });
              setDubSaveBannerMessage(
                `✅ Đã lưu bản lồng tiếng Câu ${(targetIdx ?? 0) + 1} vào tài khoản (${currentUsername || currentUserEmail})!`
              );
              setTimeout(() => {
                setDubSaveBannerMessage((prev) =>
                  prev.includes(`Câu ${(targetIdx ?? 0) + 1}`) ? '' : prev
                );
              }, 4500);
            }
          } catch {
            // ignore
          } finally {
            setIsSavingDubbingKey(null);
          }
        }
      };

      recorder.start();
      setRecordingRecordId(recordId);
    } catch {
      setRecordingRecordId(null);
    }
  };

  /**
   * Phát thử 1 câu đã lồng tiếng ghép đồng bộ với hình ảnh video (Tắt tiếng nhân vật gốc, phát giọng của con)
   */
  const playDubbedSentenceWithVideo = (
    segIdx: number,
    audioUrl: string,
    lessonOverride?: StoredVideoShadowLesson
  ) => {
    const lesson = lessonOverride || activeVideoLesson;
    const seg = lesson?.segments[segIdx];
    stopDubbedVideoPlayback();

    setCurrentSentenceIdx(segIdx);
    const videoEl = videoPlayerRef.current;

    const audio = new Audio(audioUrl);
    dubAudioPlayerRef.current = audio;

    if (videoEl && lesson?.videoUrl) {
      videoEl.pause();
      videoEl.muted = true;
      videoEl.playbackRate = 1.0;
      if (seg && seg.endTime > seg.startTime) {
        videoEl.currentTime = Math.max(0, seg.startTime);
      }
      dubPlaybackModeRef.current = 'single';
      setDubPlaybackMode('single');
      setIsPausedForShadow(false);
      videoEl
        .play()
        .then(() => setIsVideoPlaying(true))
        .catch(() => {});
    }

    audio.onended = () => {
      if (videoPlayerRef.current) {
        videoPlayerRef.current.pause();
        videoPlayerRef.current.muted = false;
      }
      dubPlaybackModeRef.current = 'none';
      setDubPlaybackMode('none');
      setIsVideoPlaying(false);
      setIsPausedForShadow(true);
    };

    audio.play().catch(() => {});
  };

  /**
   * Phát TRỌN BỘ VIDEO với giọng lồng tiếng của con cho tất cả các câu đã thu âm
   */
  const startFullVideoDubPlayback = (lesson: StoredVideoShadowLesson) => {
    if (!isLoggedIn) {
      onOpenAuthModal?.('login');
      return;
    }
    if (!lesson || lesson.segments.length === 0) return;

    stopDubbedVideoPlayback();
    fullDubSessionRef.current += 1;
    const session = fullDubSessionRef.current;
    dubPlaybackModeRef.current = 'full';
    setDubPlaybackMode('full');

    const playStep = (idx: number) => {
      if (fullDubSessionRef.current !== session) return;
      if (idx >= lesson.segments.length) {
        stopDubbedVideoPlayback();
        setIsPausedForShadow(true);
        return;
      }

      const seg = lesson.segments[idx];
      const voiceKey = `vidseg-${seg.id}`;
      const userDubUrl = userRecordedAudioMap[voiceKey];
      setCurrentSentenceIdx(idx);
      setIsPausedForShadow(false);

      const videoEl = videoPlayerRef.current;
      const segDurationMs =
        seg.endTime > seg.startTime
          ? Math.max(1200, (seg.endTime - seg.startTime) * 1000)
          : 3000;

      if (userDubUrl) {
        // Câu này học viên ĐÃ lồng tiếng -> Tắt tiếng gốc của video, phát hình + giọng lồng tiếng của con
        let audioFinished = false;
        let sceneFinished = false;

        const checkAdvance = () => {
          if (fullDubSessionRef.current !== session) return;
          if (audioFinished && sceneFinished) {
            playStep(idx + 1);
          }
        };

        const dubAudio = new Audio(userDubUrl);
        dubAudioPlayerRef.current = dubAudio;
        dubAudio.onended = () => {
          audioFinished = true;
          checkAdvance();
        };
        dubAudio.onerror = () => {
          audioFinished = true;
          checkAdvance();
        };

        if (videoEl && lesson.videoUrl) {
          videoEl.muted = true;
          videoEl.playbackRate = 1.0;
          if (seg.endTime > seg.startTime) {
            videoEl.currentTime = Math.max(0, seg.startTime);
          }
          videoEl
            .play()
            .then(() => setIsVideoPlaying(true))
            .catch(() => {});
        }

        dubAudio.play().catch(() => {
          audioFinished = true;
          checkAdvance();
        });

        setTimeout(() => {
          if (fullDubSessionRef.current !== session) return;
          sceneFinished = true;
          if (videoPlayerRef.current) {
            videoPlayerRef.current.pause();
          }
          checkAdvance();
        }, segDurationMs);
      } else {
        // Câu chưa lồng tiếng -> Phát âm thanh gốc của video cho câu đó rồi chuyển sang câu kế tiếp
        if (videoEl && lesson.videoUrl) {
          videoEl.muted = false;
          videoEl.playbackRate = 1.0;
          if (seg.endTime > seg.startTime) {
            videoEl.currentTime = Math.max(0, seg.startTime);
          }
          videoEl
            .play()
            .then(() => setIsVideoPlaying(true))
            .catch(() => {});
        }
        setTimeout(() => {
          if (fullDubSessionRef.current !== session) return;
          if (videoPlayerRef.current) {
            videoPlayerRef.current.pause();
          }
          playStep(idx + 1);
        }, segDurationMs);
      }
    };

    playStep(0);
  };

  const handleDeleteSavedDubbing = async (
    recordKey: string,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    setUserRecordedAudioMap((prev) => {
      const next = { ...prev };
      delete next[recordKey];
      return next;
    });
    setSavedDubbingRecords((prev) =>
      prev.filter((r) => r.recordKey !== recordKey)
    );
    if (isLoggedIn && (currentUserEmail || currentUsername)) {
      await deleteStudentDubbingSegment({
        email: currentUserEmail,
        username: currentUsername,
        recordKey,
      });
    }
  };

  // ============================================================================
  // HÀM RENDER KHUNG STUDIO SHADOWING DÙNG CHUNG CHO MỌI BÀI HỌC
  // (Bài vè, Dialogue, Bài hát, Truyện, Tongue, và các bộ Hoạt hình Nghe ngấm tự do)
  // ============================================================================
  const renderUnifiedShadowingStudio = (options: {
    targetClusterId: string;
    studioTitle: string;
    studioSubtitle?: string;
    isTongueSlot?: boolean;
    unitCodeForTongue?: string;
    showFreeClusterHeader?: boolean;
  }) => {
    const {
      targetClusterId,
      studioTitle,
      studioSubtitle,
      isTongueSlot = false,
      showFreeClusterHeader = false,
    } = options;

    const slotClusterObj = clusters.find((c) => c.id === targetClusterId);
    const videosInSlot = videoLessons.filter(
      (v) => v.clusterId === targetClusterId
    );
    const currentVideoInSlot =
      videosInSlot.find((v) => v.id === selectedVideoId) || videosInSlot[0];
    const currentSegInSlot = currentVideoInSlot?.segments[currentSentenceIdx];
    const activeVoiceRecKey = currentSegInSlot
      ? `vidseg-${currentSegInSlot.id}`
      : `vid-${currentVideoInSlot?.id || targetClusterId}`;
    const isRecordingCurrentSeg = recordingRecordId === activeVoiceRecKey;
    const currentSegUserAudioUrl = userRecordedAudioMap[activeVoiceRecKey];

    return (
      <div
        ref={videoStudioContainerRef}
        className="flex flex-col gap-4 bg-[#f7f4f0] rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-xs"
      >
        {/* Thanh tiêu đề của bài đang mở trong Studio */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              onClick={() => {
                setUploadingCoverForClusterId(targetClusterId);
                clusterCoverInputRef.current?.click();
              }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-rose-50 border border-rose-200 shrink-0 flex items-center justify-center cursor-pointer hover:border-[#e13829] transition-colors relative"
              title="Bấm để tải lên / đổi ảnh đại diện cho bài này"
            >
              {slotClusterObj?.coverImageUrl ||
              currentVideoInSlot?.coverImageUrl ? (
                <img
                  src={
                    slotClusterObj?.coverImageUrl ||
                    currentVideoInSlot?.coverImageUrl
                  }
                  alt={studioTitle}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-2xl text-[#e13829]">
                  add_photo_alternate
                </span>
              )}
            </div>

            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              {showFreeClusterHeader && slotClusterObj ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={slotClusterObj.name}
                    onChange={(e) =>
                      handleUpdateClusterMeta(slotClusterObj.id, {
                        name: e.target.value,
                      })
                    }
                    className="px-3 py-1 rounded-xl bg-stone-50 border border-stone-200 text-base sm:text-lg font-black text-[#d93829] min-w-[180px] focus:outline-none focus:ring-2 focus:ring-[#e13829]"
                  />
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-base sm:text-lg font-black text-[#d93829]">
                    {studioTitle}
                  </h4>
                  {studioSubtitle && (
                    <span className="text-xs font-bold text-stone-500">
                      · {studioSubtitle}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {showFreeClusterHeader && (
              <button
                type="button"
                onClick={() => {
                  if (videoPlayerRef.current) videoPlayerRef.current.pause();
                  setIsVideoPlaying(false);
                  stopAllShadowing();
                  setSelectedFreeClusterId(null);
                }}
                className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 text-xs font-extrabold cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-base">
                  arrow_back
                </span>
                <span>Tất cả bộ hoạt hình</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setPendingUploadTargetClusterId(targetClusterId);
                batchVideoFileInputRef.current?.click();
              }}
              className="px-4 py-2 rounded-2xl bg-[#e13829] hover:bg-[#c82d1f] text-white text-xs sm:text-sm font-black cursor-pointer flex items-center gap-1.5 shadow-[0_3px_0_#991b1b] active:translate-y-0.5 transition-all"
            >
              <span className="material-symbols-outlined text-base">
                upload_file
              </span>
              <span>
                {videosInSlot.length > 0
                  ? '+ Tải thêm Video vào mục này'
                  : '+ Tải Video Shadow lên mục này'}
              </span>
            </button>
          </div>
        </div>

        {/* PHẦN 1: VIDEO / AUDIO SENTENCE SHADOWING STUDIO */}
        {videosInSlot.length === 0 ? (
          !isTongueSlot ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingBatchVideos(true);
              }}
              onDragLeave={() => setIsDraggingBatchVideos(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingBatchVideos(false);
                if (
                  e.dataTransfer?.files &&
                  e.dataTransfer.files.length > 0
                ) {
                  handleBatchUploadVideoFiles(e.dataTransfer.files, {
                    targetClusterId,
                  });
                }
              }}
              className={`rounded-3xl border-2 border-dashed p-6 sm:p-8 text-center flex flex-col items-center justify-center gap-3 transition-all ${
                isDraggingBatchVideos
                  ? 'border-[#e13829] bg-rose-50/40'
                  : 'border-stone-300 bg-white'
              }`}
            >
              <span className="material-symbols-outlined text-4xl text-[#e13829]">
                smart_display
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-stone-900">
                Mục “{studioTitle}” chưa có video Shadowing
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
                Bấm nút bên dưới hoặc kéo thả file video trực tiếp vào đây để hệ thống tự động tách từng câu nói, lọc nhạc nền và dừng sau mỗi câu cho học viên Shadow.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setPendingUploadTargetClusterId(targetClusterId);
                    batchVideoFileInputRef.current?.click();
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-[#e13829] hover:bg-[#c82d1f] text-white text-xs sm:text-sm font-black cursor-pointer flex items-center gap-2 shadow-[0_3px_0_#991b1b]"
                >
                  <span className="material-symbols-outlined text-lg">
                    upload_file
                  </span>
                  <span>+ Chọn Video Cho “{studioTitle}”</span>
                </button>
              </div>

              {/* Cho phép dán nhanh lời Bài vè / Dialogue / Bài hát / Truyện để luyện Shadow ngay cả khi chưa có video */}
              <div className="w-full max-w-xl mt-3 pt-3 border-t border-stone-200 flex flex-col gap-2 text-left">
                <label className="text-xs font-extrabold text-stone-700">
                  Hoặc dán danh sách câu của “{studioTitle}” (mỗi dòng 1 câu) để học viên luyện Shadow ngay:
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <textarea
                    rows={2}
                    value={bulkSentencesInput}
                    onChange={(e) => setBulkSentencesInput(e.target.value)}
                    placeholder="Nhập mỗi dòng 1 câu tiếng Anh (bài vè, hội thoại, lời bài hát, truyện)..."
                    className="flex-1 p-2.5 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleCreateTextShadowLessonInSlot(
                        targetClusterId,
                        studioTitle,
                        bulkSentencesInput
                      )
                    }
                    className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-black cursor-pointer shrink-0"
                  >
                    Tạo bài Shadow
                  </button>
                </div>
              </div>
            </div>
          ) : null
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* CỘT TRÁI (8 CỘT): MÀN HÌNH VIDEO SHADOW + ĐIỀU KHIỂN + DANH SÁCH CÂU */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {currentVideoInSlot && (
                <>
                  <div className="bg-stone-900 text-white rounded-3xl p-4 sm:p-5 border border-stone-800 shadow-md flex flex-col gap-4">
                    {/* Màn hình Video lớn (nếu có videoUrl) */}
                    {currentVideoInSlot.videoUrl ? (
                      <div className="relative aspect-video rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 flex items-center justify-center">
                        <video
                          ref={videoPlayerRef}
                          src={currentVideoInSlot.videoUrl}
                          onClick={() => {
                            if (isVideoPlaying) {
                              videoPlayerRef.current?.pause();
                              setIsVideoPlaying(false);
                              setIsPausedForShadow(true);
                            } else {
                              handleContinueNextSentence();
                            }
                          }}
                          onTimeUpdate={handleVideoTimeUpdate}
                          onPlay={() => {
                            setupVideoAudioAnalyser();
                            setIsVideoPlaying(true);
                            setIsPausedForShadow(false);
                          }}
                          onPause={() => {
                            setIsVideoPlaying(false);
                          }}
                          onEnded={() => {
                            setIsVideoPlaying(false);
                            setIsPausedForShadow(true);
                          }}
                          className="w-full h-full object-contain cursor-pointer"
                          playsInline
                        />

                        {!isVideoPlaying && !isPausedForShadow && (
                          <button
                            type="button"
                            onClick={handleContinueNextSentence}
                            className="absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/35 transition-colors cursor-pointer group"
                          >
                            <div className="w-16 h-16 rounded-full bg-[#e11d48] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                              <span className="material-symbols-outlined text-4xl">
                                play_arrow
                              </span>
                            </div>
                          </button>
                        )}

                        {isVideoPlaying && (
                          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-stone-950/85 backdrop-blur-xs border border-stone-700 text-xs font-extrabold flex items-center gap-1.5">
                            {recordingRecordId ? (
                              <>
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                                <span className="text-red-300">
                                  🎙️ Đang thu lồng tiếng Câu {currentSentenceIdx + 1} (Đã tắt tiếng gốc của video)...
                                </span>
                              </>
                            ) : dubPlaybackMode === 'full' ? (
                              <>
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                                <span className="text-amber-300">
                                  🎬 Đang phát Video Lồng Tiếng Của Con — Câu {currentSentenceIdx + 1}/{currentVideoInSlot.segments.length}
                                </span>
                              </>
                            ) : dubPlaybackMode === 'single' ? (
                              <>
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                                <span className="text-emerald-300">
                                  🎬 Đang xem thử Câu {currentSentenceIdx + 1} với giọng lồng tiếng của con...
                                </span>
                              </>
                            ) : detectedAudioKind === 'speech' ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                <span className="text-emerald-300">
                                  🗣️ Đang đọc câu chữ...
                                </span>
                              </>
                            ) : detectedAudioKind === 'music' ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-sky-400" />
                                <span className="text-sky-300">
                                  🎵 Nhạc nền / Nhạc dạo (Bỏ qua, không dừng)
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-stone-400" />
                                <span className="text-stone-300">
                                  Đang lắng nghe...
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-stone-950 border border-stone-800 p-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-amber-300">
                          <span className="material-symbols-outlined text-lg">
                            record_voice_over
                          </span>
                          <span>
                            Chế độ Luyện Shadow theo từng câu (Bạn có thể bấm gắn thêm Video bất kỳ lúc nào)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            replaceSingleVideoInputRef.current?.click()
                          }
                          className="px-3 py-1.5 rounded-xl bg-[#e13829] text-white text-xs font-black cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">
                            video_call
                          </span>
                          <span>+ Gắn file Video cho bài này</span>
                        </button>
                      </div>
                    )}

                    {/* Điều khiển từng câu + Hiện Chữ + Tốc độ + Thu âm */}
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm sm:text-base font-black text-white">
                            {currentVideoInSlot.title}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-stone-800 text-amber-300 text-xs font-extrabold">
                            {currentVideoInSlot.segments.length > 0
                              ? `Câu ${currentSentenceIdx + 1} / ${currentVideoInSlot.segments.length}`
                              : `Câu ${currentSentenceIdx + 1}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const nextState = !isVideoSentenceRevealed;
                              setIsVideoSentenceRevealed(nextState);
                              if (
                                nextState &&
                                currentSegInSlot &&
                                isPlaceholderSegmentText(currentSegInSlot.text)
                              ) {
                                handleTranscribeCurrentVideoNow();
                              }
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-extrabold cursor-pointer flex items-center gap-1 border transition-all ${
                              isVideoSentenceRevealed
                                ? 'bg-amber-400 text-stone-950 border-amber-300'
                                : 'bg-stone-800 hover:bg-stone-700 text-white border-stone-600'
                            }`}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {isVideoSentenceRevealed
                                ? 'visibility_off'
                                : 'visibility'}
                            </span>
                            <span>
                              {isVideoSentenceRevealed
                                ? 'Ẩn chữ'
                                : 'Hiện chữ'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Ô phụ đề câu hiện tại */}
                      <div className="min-h-[68px] rounded-xl bg-stone-950/90 border border-stone-800 p-3.5 flex items-center justify-center text-center">
                        {isVideoSentenceRevealed ? (
                          currentSegInSlot &&
                          !isPlaceholderSegmentText(currentSegInSlot.text) ? (
                            <p className="text-base sm:text-lg font-extrabold text-amber-300 leading-snug">
                              {currentSegInSlot.text}
                            </p>
                          ) : isTranscribingVideoText ||
                            isAnalyzingVideoAudio ? (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-300 font-bold">
                              <span className="material-symbols-outlined text-base animate-spin">
                                progress_activity
                              </span>
                              <span>
                                Đang nhận diện câu chữ chuẩn từ giọng đọc trong video...
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1.5">
                              <span className="text-xs sm:text-sm text-amber-200 font-bold">
                                Đang lấy lời thoại cho câu này...
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleTranscribeCurrentVideoNow()
                                }
                                className="px-3 py-1 rounded-lg bg-amber-400 text-stone-950 text-xs font-black cursor-pointer hover:bg-amber-300"
                              >
                                ✨ Nhận diện chữ chuẩn từ video ngay
                              </button>
                            </div>
                          )
                        ) : (
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-400 font-semibold">
                            <span className="material-symbols-outlined text-base text-stone-500">
                              visibility_off
                            </span>
                            <span>
                              {isTranscribingVideoText
                                ? '⏳ Đang tự động tách lời thoại chuẩn từ video...'
                                : isVideoPlaying
                                ? detectedAudioKind === 'music'
                                  ? '🎵 Đang qua đoạn nhạc dạo (Hệ thống tự bỏ qua nhạc)...'
                                  : '🗣️ Đang nghe câu chữ mẫu...'
                                : 'Đang ẩn chữ • Bấm “Hiện chữ” nếu muốn xem lời thoại'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Thanh chỉnh TỐC ĐỘ ĐỌC (Chỉ giữ 0.85x và 1x) */}
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-950/80 border border-stone-800 rounded-xl px-3 py-2">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-[11px] font-extrabold text-stone-300 mr-1 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm text-amber-400">
                              speed
                            </span>
                            <span>Tốc độ đọc:</span>
                          </span>
                          {[0.85, 1].map((spd) => {
                            const isSelected =
                              Math.abs(playbackSpeed - spd) < 0.02;
                            return (
                              <button
                                key={spd}
                                type="button"
                                onClick={() => setPlaybackSpeed(spd)}
                                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black cursor-pointer transition-all border ${
                                  isSelected
                                    ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-2xs'
                                    : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                                }`}
                              >
                                {spd}x
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Chỉ khi đã đăng nhập (Log in) mới hiển thị Tiến độ lồng tiếng & nút Xem Video Lồng Tiếng Của Con */}
                      {isLoggedIn &&
                        (() => {
                          const dubbedSegCount =
                            currentVideoInSlot.segments.filter(
                              (s) => !!userRecordedAudioMap[`vidseg-${s.id}`]
                            ).length;
                          return (
                            <div className="rounded-2xl bg-stone-950/90 border border-emerald-500/40 p-3 flex flex-col gap-2.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">
                                      mic
                                    </span>
                                    <span>
                                      Tiến độ lồng tiếng bài này: {dubbedSegCount} /{' '}
                                      {Math.max(
                                        1,
                                        currentVideoInSlot.segments.length
                                      )}{' '}
                                      câu
                                    </span>
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5">
                                  {dubPlaybackMode === 'full' ? (
                                    <button
                                      type="button"
                                      onClick={stopDubbedVideoPlayback}
                                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black cursor-pointer flex items-center gap-1 shadow-xs"
                                    >
                                      <span className="material-symbols-outlined text-sm">
                                        stop_circle
                                      </span>
                                      <span>Dừng phát Video Lồng Tiếng</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        startFullVideoDubPlayback(
                                          currentVideoInSlot
                                        )
                                      }
                                      disabled={dubbedSegCount === 0}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                                        dubbedSegCount > 0
                                          ? 'bg-amber-400 hover:bg-amber-300 text-stone-950 cursor-pointer shadow-xs'
                                          : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                                      }`}
                                      title="Xem lại toàn bộ video hoạt hình với giọng lồng tiếng của con ở các câu đã thu"
                                    >
                                      <span className="material-symbols-outlined text-sm">
                                        movie
                                      </span>
                                      <span>
                                        🎬 Xem Video Lồng Tiếng Của Con (
                                        {dubbedSegCount}/
                                        {Math.max(
                                          1,
                                          currentVideoInSlot.segments.length
                                        )}{' '}
                                        câu)
                                      </span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {dubSaveBannerMessage && (
                                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-xs font-extrabold flex items-center justify-between gap-2">
                                  <span>{dubSaveBannerMessage}</span>
                                  <button
                                    type="button"
                                    onClick={() => setDubSaveBannerMessage('')}
                                    className="text-emerald-200 hover:text-white text-xs font-black cursor-pointer"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                      {/* Cụm nút điều khiển: [1. Nghe câu mẫu] + [2. Lồng tiếng câu này] + [3. Xem thử câu lồng tiếng] + [Câu tiếp theo] */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            stopDubbedVideoPlayback();
                            if (isVideoPlaying) {
                              videoPlayerRef.current?.pause();
                              stopSpeaking();
                              setIsVideoPlaying(false);
                              setIsPausedForShadow(true);
                            } else {
                              handleReplayCurrentSentence();
                            }
                          }}
                          className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-white text-xs font-extrabold cursor-pointer flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-base">
                            {isVideoPlaying && dubPlaybackMode === 'none'
                              ? 'pause'
                              : 'volume_up'}
                          </span>
                          <span>
                            {isVideoPlaying && dubPlaybackMode === 'none'
                              ? 'Dừng nghe'
                              : `1. Nghe mẫu Câu ${currentSentenceIdx + 1}`}
                          </span>
                        </button>

                        {/* Nút LỒNG TIẾNG TỪNG CÂU */}
                        <button
                          type="button"
                          onClick={(e) =>
                            toggleRecordUserVoice(activeVoiceRecKey, e, {
                              videoLesson: currentVideoInSlot,
                              segment: currentSegInSlot,
                              segmentIndex: currentSentenceIdx,
                              clusterId: targetClusterId,
                              clusterName: studioTitle,
                              sentenceText: currentSegInSlot?.text,
                            })
                          }
                          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black cursor-pointer flex items-center gap-1.5 border transition-all shadow-md ${
                            isRecordingCurrentSeg
                              ? 'bg-red-600 text-white border-red-400 animate-pulse'
                              : 'bg-[#e11d48] hover:bg-[#be123c] text-white border-rose-400'
                          }`}
                          title="Bấm để lồng tiếng Câu hiện tại (Video sẽ chạy hình tắt tiếng gốc để con lồng tiếng)"
                        >
                          <span className="material-symbols-outlined text-base">
                            {isRecordingCurrentSeg ? 'stop_circle' : 'mic'}
                          </span>
                          <span>
                            {isRecordingCurrentSeg
                              ? `⏹️ Dừng thu Câu ${currentSentenceIdx + 1}`
                              : isSavingDubbingKey === activeVoiceRecKey
                              ? 'Đang lưu...'
                              : currentSegUserAudioUrl
                              ? `🎙️ Lồng tiếng lại Câu ${currentSentenceIdx + 1}`
                              : `2. 🎙️ Lồng tiếng Câu ${currentSentenceIdx + 1}`}
                          </span>
                        </button>

                        {currentSegUserAudioUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              playDubbedSentenceWithVideo(
                                currentSentenceIdx,
                                currentSegUserAudioUrl,
                                currentVideoInSlot
                              )
                            }
                            className="px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black cursor-pointer flex items-center gap-1 shadow-xs"
                            title="Xem hình video Câu này ghép với giọng lồng tiếng của con"
                          >
                            <span className="material-symbols-outlined text-base">
                              play_circle
                            </span>
                            <span>3. 🎬 Xem Câu {currentSentenceIdx + 1} đã lồng tiếng</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            stopDubbedVideoPlayback();
                            handlePreviousSentence();
                          }}
                          className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-white font-black text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-1 transition-transform active:scale-95"
                          title="Quay về câu trước"
                        >
                          <span className="material-symbols-outlined text-base">
                            skip_previous
                          </span>
                          <span>Lùi</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            stopDubbedVideoPlayback();
                            handleNextSentence();
                          }}
                          className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-1 shadow-md transition-transform active:scale-95"
                          title="Sang câu tiếp theo"
                        >
                          <span>Tiếp</span>
                          <span className="material-symbols-outlined text-base">
                            skip_next
                          </span>
                        </button>

                        {currentVideoInSlot.videoUrl && (
                          <button
                            type="button"
                            onClick={handleMarkCutAtCurrentVideoTime}
                            className="px-2.5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-[11px] font-extrabold cursor-pointer flex items-center gap-1"
                            title="Lưu mốc dừng câu ngay tại giây hiện tại của video"
                          >
                            <span className="material-symbols-outlined text-sm">
                              content_cut
                            </span>
                            <span>Ngắt câu</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* THANH TÁCH CÂU & CHỈNH SỬA CỦA VIDEO ĐANG PHÁT */}
                  <div className="flex flex-wrap items-center justify-end gap-2.5 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {currentVideoInSlot.videoBlob && (
                        <button
                          type="button"
                          onClick={() => handleRescanCurrentVideoSentences()}
                          disabled={
                            isAnalyzingVideoAudio || isTranscribingVideoText
                          }
                          className="px-2.5 py-2 rounded-xl bg-white hover:bg-stone-50 text-emerald-700 border border-emerald-300 text-xs font-extrabold cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">
                            graphic_eq
                          </span>
                          <span>
                            {isAnalyzingVideoAudio || isTranscribingVideoText
                              ? 'Đang lấy chữ & tách câu...'
                              : 'Tự tách câu & Lấy chữ'}
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (!isLoggedIn) {
                            onOpenAuthModal?.('login');
                            return;
                          }
                          setIsEditTimingsOpen((prev) => !prev);
                        }}
                        className={`px-2.5 py-2 rounded-xl text-xs font-extrabold cursor-pointer flex items-center gap-1 border ${
                          isLoggedIn && isEditTimingsOpen
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          edit_note
                        </span>
                        <span>Chỉnh câu / Tiêu đề / Chuyển mục</span>
                      </button>
                    </div>
                  </div>

                  {/* Khung chỉnh sửa nhanh Tiêu đề, Thay video, Chuyển sang mục JOY / Nghe ngấm tự do khác, hoặc Dán danh sách câu */}
                  {isLoggedIn && isEditTimingsOpen && (
                    <div className="bg-white rounded-2xl p-4 border border-amber-300 flex flex-col gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-extrabold text-on-surface">
                            Sửa tiêu đề bài / video:
                          </label>
                          <input
                            type="text"
                            value={currentVideoInSlot.title}
                            onChange={(e) =>
                              handleRenameCurrentVideoTitle(e.target.value)
                            }
                            className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-300 text-xs font-bold"
                          />
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-extrabold text-on-surface">
                            Thay / gắn file video cho bài này:
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              replaceSingleVideoInputRef.current?.click()
                            }
                            className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-300 text-xs font-bold text-primary hover:bg-stone-100 cursor-pointer flex items-center gap-1 w-fit"
                          >
                            <span className="material-symbols-outlined text-sm">
                              swap_horiz
                            </span>
                            <span>Chọn file video</span>
                          </button>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="text-[11px] font-extrabold text-on-surface">
                            Chuyển bài này sang mục khác:
                          </label>
                          <select
                            value={currentVideoInSlot.clusterId || ''}
                            onChange={(e) =>
                              handleMoveVideoToAnotherCluster(
                                currentVideoInSlot.id,
                                e.target.value
                              )
                            }
                            className="px-2.5 py-1.5 rounded-xl bg-stone-50 border border-stone-300 text-xs font-bold"
                          >
                            <optgroup label="Khúc 3: Nghe ngấm tự do (Hoạt hình)">
                              {freeCartoonClusters.map((fc) => (
                                <option key={fc.id} value={fc.id}>
                                  Nghe ngấm tự do: {fc.name}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Khúc 1: JOY 1 (Unit 1 - 8)">
                              {JOY_1_UNITS.flatMap((u) =>
                                JOY_LESSON_TYPES.map((lt) => {
                                  const cid = getJoySlotClusterId(
                                    'joy1',
                                    u.unitNumber,
                                    lt.kind
                                  );
                                  return (
                                    <option key={cid} value={cid}>
                                      JOY 1 - {u.title} - {lt.label}
                                    </option>
                                  );
                                })
                              )}
                            </optgroup>
                            <optgroup label="Khúc 2: JOY 2 (Unit 1 - 8)">
                              {JOY_2_UNITS.flatMap((u) =>
                                JOY_LESSON_TYPES.map((lt) => {
                                  const cid = getJoySlotClusterId(
                                    'joy2',
                                    u.unitNumber,
                                    lt.kind
                                  );
                                  return (
                                    <option key={cid} value={cid}>
                                      JOY 2 - {u.title} - {lt.label}
                                    </option>
                                  );
                                })
                              )}
                            </optgroup>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-extrabold text-on-surface">
                          Dán danh sách câu của bài này (Mỗi dòng 1 câu — mặc định ẩn chữ, bấm “Hiện chữ” mới hiện):
                        </label>
                        <div className="flex gap-2">
                          <textarea
                            rows={2}
                            value={bulkSentencesInput}
                            onChange={(e) =>
                              setBulkSentencesInput(e.target.value)
                            }
                            placeholder="Nhập mỗi dòng 1 câu tiếng Anh rồi bấm Cập nhật câu..."
                            className="flex-1 p-2 rounded-xl bg-stone-50 border border-stone-300 text-xs font-semibold"
                          />
                          <button
                            type="button"
                            onClick={handleApplyBulkSentencesToCurrentVideo}
                            className="px-3.5 py-2 rounded-xl bg-primary text-on-primary text-xs font-extrabold cursor-pointer shrink-0"
                          >
                            Cập nhật câu
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* DANH SÁCH TỪNG CÂU TRONG BÀI ĐANG PHÁT */}
                  {currentVideoInSlot.segments.length > 0 && (
                    <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-0.5">
                      {currentVideoInSlot.segments.map((seg, idx) => {
                        const isCurrentSeg = currentSentenceIdx === idx;
                        const isRowRevealed =
                          !!revealedVideoSegMap[seg.id] ||
                          (isCurrentSeg && isVideoSentenceRevealed);
                        const rowVoiceKey = `vidseg-${seg.id}`;
                        const isRowRecording =
                          recordingRecordId === rowVoiceKey;
                        const rowUserAudio = userRecordedAudioMap[rowVoiceKey];

                        return (
                          <div
                            key={seg.id}
                            className={`px-3.5 py-2.5 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-2.5 ${
                              isCurrentSeg
                                ? 'bg-amber-50/90 border-amber-400 shadow-2xs'
                                : 'bg-white hover:bg-stone-50 border-stone-200'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => playVideoSentenceAt(idx, true)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-black cursor-pointer flex items-center gap-1 shrink-0 ${
                                  isCurrentSeg
                                    ? 'bg-[#e11d48] text-white'
                                    : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                                }`}
                              >
                                <span className="material-symbols-outlined text-sm">
                                  play_arrow
                                </span>
                                <span>Câu {idx + 1}</span>
                              </button>

                              {seg.endTime > seg.startTime && (
                                <span className="text-[11px] font-bold text-stone-500 shrink-0">
                                  {seg.startTime.toFixed(1)}s -{' '}
                                  {seg.endTime.toFixed(1)}s
                                </span>
                              )}

                              {isLoggedIn && isEditTimingsOpen ? (
                                <div className="flex flex-wrap items-center gap-1.5 flex-1">
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={seg.startTime}
                                    onChange={(e) =>
                                      handleUpdateVideoSegmentField(
                                        seg.id,
                                        'startTime',
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="w-16 px-2 py-1 rounded border border-stone-300 bg-white text-xs font-bold"
                                  />
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={seg.endTime}
                                    onChange={(e) =>
                                      handleUpdateVideoSegmentField(
                                        seg.id,
                                        'endTime',
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="w-16 px-2 py-1 rounded border border-stone-300 bg-white text-xs font-bold"
                                  />
                                  <input
                                    type="text"
                                    value={seg.text}
                                    onChange={(e) =>
                                      handleUpdateVideoSegmentField(
                                        seg.id,
                                        'text',
                                        e.target.value
                                      )
                                    }
                                    className="flex-1 min-w-[160px] px-2.5 py-1 rounded border border-stone-300 bg-white text-xs font-bold"
                                  />
                                </div>
                              ) : isRowRevealed ? (
                                !isPlaceholderSegmentText(seg.text) ? (
                                  <span className="text-xs sm:text-sm font-extrabold text-stone-900 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                                    {seg.text}
                                  </span>
                                ) : isTranscribingVideoText ||
                                  isAnalyzingVideoAudio ? (
                                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                                    ⏳ Đang nhận diện câu chữ từ giọng đọc video...
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleTranscribeCurrentVideoNow()
                                    }
                                    className="text-xs font-extrabold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg border border-amber-300 cursor-pointer"
                                  >
                                    ✨ Bấm lấy chữ chuẩn theo video
                                  </button>
                                )
                              ) : (
                                <span
                                  onClick={() => playVideoSentenceAt(idx, true)}
                                  className="text-xs text-stone-500 font-semibold cursor-pointer hover:text-stone-900"
                                >
                                  Đang ẩn chữ câu {idx + 1} • Bấm để nghe & shadow
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const nextRev = !revealedVideoSegMap[seg.id];
                                  setRevealedVideoSegMap((prev) => ({
                                    ...prev,
                                    [seg.id]: nextRev,
                                  }));
                                  if (
                                    nextRev &&
                                    isPlaceholderSegmentText(seg.text)
                                  ) {
                                    handleTranscribeCurrentVideoNow();
                                  }
                                }}
                                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold cursor-pointer flex items-center gap-1 border shrink-0 ${
                                  isRowRevealed
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
                                }`}
                              >
                                <span className="material-symbols-outlined text-xs">
                                  {isRowRevealed
                                    ? 'visibility_off'
                                    : 'visibility'}
                                </span>
                                <span>
                                  {isRowRevealed ? 'Ẩn chữ' : 'Hiện chữ'}
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) =>
                                  toggleRecordUserVoice(rowVoiceKey, e, {
                                    videoLesson: currentVideoInSlot,
                                    segment: seg,
                                    segmentIndex: idx,
                                    clusterId: targetClusterId,
                                    clusterName: studioTitle,
                                    sentenceText: seg.text,
                                  })
                                }
                                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold cursor-pointer flex items-center gap-1 border ${
                                  isRowRecording
                                    ? 'bg-red-600 text-white border-red-600 animate-pulse'
                                    : rowUserAudio
                                    ? 'bg-rose-50 hover:bg-rose-100 text-[#e11d48] border-rose-200'
                                    : 'bg-[#e11d48] hover:bg-[#be123c] text-white border-[#e11d48]'
                                }`}
                                title="Lồng tiếng câu này"
                              >
                                <span className="material-symbols-outlined text-xs">
                                  {isRowRecording ? 'stop' : 'mic'}
                                </span>
                                <span>
                                  {isRowRecording
                                    ? 'Dừng'
                                    : rowUserAudio
                                    ? 'Thu lại'
                                    : 'Lồng tiếng'}
                                </span>
                              </button>

                              {rowUserAudio && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      playDubbedSentenceWithVideo(
                                        idx,
                                        rowUserAudio,
                                        currentVideoInSlot
                                      )
                                    }
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold cursor-pointer flex items-center gap-1 shadow-2xs"
                                    title="Xem hình câu này với giọng lồng tiếng của con"
                                  >
                                    <span className="material-symbols-outlined text-xs">
                                      play_circle
                                    </span>
                                    <span>Đã lồng tiếng</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) =>
                                      handleDeleteSavedDubbing(rowVoiceKey, e)
                                    }
                                    className="p-1 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-400 hover:text-rose-600 text-xs cursor-pointer flex items-center"
                                    title="Xoá bản lồng tiếng câu này"
                                  >
                                    <span className="material-symbols-outlined text-xs">
                                      delete
                                    </span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {isEditTimingsOpen && (
                        <button
                          type="button"
                          onClick={handleAddVideoSegmentRow}
                          className="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-extrabold cursor-pointer flex items-center gap-1 w-fit mt-1"
                        >
                          <span className="material-symbols-outlined text-sm">
                            add
                          </span>
                          <span>+ Thêm dòng câu</span>
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* CỘT PHẢI (4 CỘT): DANH SÁCH VIDEO / TẬP TRONG MỤC ĐANG MỞ */}
            <div className="lg:col-span-4 bg-white/85 rounded-3xl p-3.5 border border-stone-200/90 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-200">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-lg text-[#e13829]">
                    queue_play_next
                  </span>
                  <span className="text-xs sm:text-sm font-black text-stone-900">
                    Danh sách bài / video ({videosInSlot.length})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPendingUploadTargetClusterId(targetClusterId);
                    batchVideoFileInputRef.current?.click();
                  }}
                  className="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#d93829] border border-rose-200 text-xs font-extrabold cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>Thêm video</span>
                </button>
              </div>

              <div className="flex flex-col gap-3 max-h-[680px] overflow-y-auto pr-1">
                {videosInSlot.map((lesson, idx) => {
                  const isLockedForGuest = false;
                  const isSelectedStory = currentVideoInSlot?.id === lesson.id;
                  const isStoryDragOver = dragOverVideoCardId === lesson.id;
                  const storyLevel = isJoySlotClusterId(targetClusterId)
                    ? lesson.level || slotClusterObj?.defaultLevel || 'JOY'
                    : normalizeCartoonLevel(
                        lesson.level || slotClusterObj?.defaultLevel,
                        slotClusterObj?.name || lesson.title
                      );

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => {
                        if (isLockedForGuest) {
                          onRequireRegister?.();
                          return;
                        }
                        handleSelectVideoLesson(lesson.id);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverVideoCardId(lesson.id);
                      }}
                      onDragLeave={() => setDragOverVideoCardId(null)}
                      onDrop={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverVideoCardId(null);
                        const file = e.dataTransfer?.files?.[0];
                        if (file && file.type.startsWith('image/')) {
                          await handleApplyVideoCoverFile(lesson.id, file);
                        }
                      }}
                      className={`group relative rounded-2xl bg-white p-3 border transition-all cursor-pointer flex flex-col gap-2 ${
                        isStoryDragOver
                          ? 'border-2 border-dashed border-[#e13829] bg-rose-50/40'
                          : isSelectedStory
                          ? 'border-2 border-[#e13829] bg-rose-50/25 shadow-[0_4px_0_#e13829]'
                          : 'border-stone-200/90 shadow-[0_4px_0_#d6d3d1] hover:border-[#e13829]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-black ${
                              isSelectedStory
                                ? 'bg-[#e13829] text-white'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            #{idx + 1}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadingCoverForVideoId(lesson.id);
                              videoCoverInputRef.current?.click();
                            }}
                            className="w-7 h-7 rounded-full bg-stone-100 hover:bg-rose-100 text-stone-600 hover:text-[#e13829] flex items-center justify-center transition-colors cursor-pointer"
                            title="Đổi ảnh bìa"
                          >
                            <span className="material-symbols-outlined text-sm">
                              add_photo_alternate
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) =>
                              handleDeleteVideoLessonById(lesson.id, e)
                            }
                            className="w-7 h-7 rounded-full bg-stone-100 hover:bg-rose-100 text-stone-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer"
                            title="Xóa bài này"
                          >
                            <span className="material-symbols-outlined text-sm">
                              delete
                            </span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isLockedForGuest && (
                            <span className="material-symbols-outlined text-[15px] text-stone-500">
                              lock
                            </span>
                          )}
                          {isSelectedStory && !isLockedForGuest && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold">
                              Đang mở
                            </span>
                          )}
                        </div>
                      </div>

                      {(lesson.coverImageUrl || lesson.videoUrl) && (
                        <div className="w-full aspect-video rounded-xl overflow-hidden bg-stone-900 border border-stone-200 flex items-center justify-center relative">
                          {lesson.coverImageUrl ? (
                            <img
                              src={lesson.coverImageUrl}
                              alt={lesson.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              src={`${lesson.videoUrl}#t=0.8`}
                              preload="metadata"
                              muted
                              playsInline
                              className="w-full h-full object-cover pointer-events-none"
                            />
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 pt-0.5 px-0.5">
                        <h4
                          className={`text-sm font-black leading-snug line-clamp-2 ${
                            isSelectedStory
                              ? 'text-[#e13829]'
                              : 'text-stone-900 group-hover:text-[#e13829]'
                          }`}
                        >
                          {lesson.title}
                        </h4>

                        {lesson.segments.length > 0 && (
                          <span className="text-[11px] font-bold text-stone-500 shrink-0">
                            {lesson.segments.length} câu
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* PHẦN 2: NẾU ĐANG Ở MỤC 5. TONGUE CỦA UNIT HOẶC CỤM TONGUE TWISTER -> HIỂN THỊ CÁC CÂU TONGUE TWISTERS THEO ÂM */}
        {isTongueSlot && (
          <div className="flex flex-col gap-3 bg-white rounded-3xl p-4 border border-stone-200 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-rose-50 text-[#e11d48] border border-rose-200 text-xs font-black">
                  Luyện Tongue Twister theo từng âm ({filteredRecords.length}{' '}
                  câu)
                </span>
                <span className="text-xs font-bold text-stone-500">
                  Bấm vào âm màu đỏ để nghe âm · Bấm Shadow để nghe mẫu & đọc nhại
                </span>
              </div>

              <div className="flex items-center gap-1 bg-stone-50 px-2.5 py-1 rounded-xl border border-stone-200">
                <span className="material-symbols-outlined text-sm text-primary">
                  speed
                </span>
                <span className="text-[11px] font-extrabold text-on-surface mr-1">
                  Tốc độ đọc:
                </span>
                {[0.85, 1].map((spd) => {
                  const isSelected = Math.abs(playbackSpeed - spd) < 0.02;
                  return (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-black cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-primary text-on-primary shadow-2xs'
                          : 'bg-white text-on-surface-variant hover:text-on-surface border border-surface-container-high'
                      }`}
                    >
                      {spd}x
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[440px] overflow-y-auto pr-0.5">
              {filteredRecords.map((record, idx) => {
                const isLockedGuestRecord = false;
                const isCurrent = activeRecordId === record.id;
                const isCurrentPlaying = isCurrent && isPlayingModel;
                const isCurrentWaiting = isCurrent && isShadowingWait;
                const isTextRevealed = !!revealedTextMap[record.id];
                const isRecordingThis = recordingRecordId === record.id;
                const userAudioUrl = userRecordedAudioMap[record.id];
                const customImgUrl = customImagesMap[record.id];
                const isDragOver = dragOverRecordId === record.id;

                return (
                  <div
                    key={record.id}
                    onClick={() => {
                      if (isLockedGuestRecord) {
                        onRequireRegister?.();
                      }
                    }}
                    onPaste={(e) => {
                      const items = e.clipboardData?.items;
                      if (!items) return;
                      for (let i = 0; i < items.length; i++) {
                        if (items[i].type.startsWith('image/')) {
                          const blob = items[i].getAsFile();
                          if (blob) {
                            applyImageFileToRecord(record.id, blob);
                          }
                          break;
                        }
                      }
                    }}
                    className={`px-3.5 py-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isLockedGuestRecord
                        ? 'bg-stone-100/80 border-stone-200 opacity-80 hover:opacity-100 cursor-pointer'
                        : isCurrentWaiting
                        ? 'bg-emerald-50/90 border-emerald-500 shadow-2xs'
                        : isCurrentPlaying
                        ? 'bg-rose-50/90 border-[#e11d48] shadow-2xs'
                        : 'bg-stone-50/60 hover:bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isLockedGuestRecord) {
                            onRequireRegister?.();
                            return;
                          }
                          speakPhoneme(record.phonemeKey);
                        }}
                        className="w-16 shrink-0 py-2.5 rounded-xl bg-white border border-rose-200 text-[#e11d48] font-black text-xl sm:text-2xl text-center shadow-2xs hover:scale-105 transition-transform cursor-pointer"
                        title={`Nghe âm lẻ ${record.soundTitle}`}
                      >
                        {record.soundTitle}
                      </button>

                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverRecordId(record.id);
                        }}
                        onDragLeave={() => setDragOverRecordId(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOverRecordId(null);
                          const file = e.dataTransfer?.files?.[0];
                          if (file) {
                            applyImageFileToRecord(record.id, file);
                          }
                        }}
                        className={`relative w-28 h-20 sm:w-32 sm:h-22 rounded-xl overflow-hidden shrink-0 transition-all group ${
                          customImgUrl
                            ? 'bg-white border border-stone-200 shadow-2xs'
                            : isDragOver
                            ? 'bg-primary/10 border-2 border-dashed border-primary'
                            : 'bg-white hover:bg-stone-50 border-2 border-dashed border-stone-300 hover:border-primary/60'
                        }`}
                      >
                        {customImgUrl ? (
                          <>
                            <img
                              src={customImgUrl}
                              alt={`Minh họa ${record.soundTitle}`}
                              onClick={() => startShadowRecord(record)}
                              className="w-full h-full object-contain cursor-pointer"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setUploadingImageForId(record.id);
                                  imageInputRef.current?.click();
                                }}
                                className="px-2 py-1 rounded-lg bg-white text-stone-900 text-[10px] font-extrabold cursor-pointer hover:bg-amber-100 flex items-center gap-0.5 shadow-xs"
                              >
                                <span className="material-symbols-outlined text-xs">
                                  edit
                                </span>
                                <span>Đổi</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) =>
                                  handleDeleteCustomImage(record.id, e)
                                }
                                className="p-1 rounded-lg bg-rose-600 text-white text-[10px] font-extrabold cursor-pointer hover:bg-rose-700 flex items-center justify-center shadow-xs"
                              >
                                <span className="material-symbols-outlined text-xs">
                                  delete
                                </span>
                              </button>
                            </div>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setUploadingImageForId(record.id);
                              imageInputRef.current?.click();
                            }}
                            className="w-full h-full flex flex-col items-center justify-center gap-1 text-stone-500 hover:text-primary cursor-pointer p-1 text-center"
                          >
                            <span className="material-symbols-outlined text-xl">
                              add_photo_alternate
                            </span>
                            <span className="text-[10px] font-extrabold leading-tight">
                              + Tải ảnh
                            </span>
                          </button>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        {isTextRevealed ? (
                          <p className="text-base sm:text-lg font-extrabold text-stone-900 leading-snug bg-white px-3 py-1.5 rounded-xl border border-amber-200">
                            {renderHighlightedTongueTwister(
                              record.sentence,
                              record.highlightRegex
                            )}
                          </p>
                        ) : (
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            {isCurrentPlaying ? (
                              <span className="font-extrabold text-[#e11d48] flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base animate-pulse">
                                  volume_up
                                </span>
                                <span>
                                  Đang đọc mẫu UK ({playbackSpeed}x)... Hãy nghe kỹ!
                                </span>
                              </span>
                            ) : (
                              <span className="font-semibold text-on-surface-variant flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm text-stone-400">
                                  visibility_off
                                </span>
                                <span>
                                  Đang ẩn chữ • Bấm Shadow để nghe & đọc nhại
                                </span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isLockedGuestRecord) {
                            onRequireRegister?.();
                            return;
                          }
                          if (isCurrentPlaying) {
                            stopAllShadowing();
                          } else {
                            startShadowRecord(record);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer flex items-center gap-1 transition-all ${
                          isCurrentPlaying
                            ? 'bg-[#e11d48] text-white shadow-2xs'
                            : isCurrentWaiting
                            ? 'bg-white text-primary border border-primary hover:bg-primary/5'
                            : 'bg-primary text-on-primary hover:opacity-95'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {isLockedGuestRecord
                            ? 'lock'
                            : isCurrentPlaying
                            ? 'stop'
                            : isCurrentWaiting
                            ? 'replay'
                            : 'play_arrow'}
                        </span>
                        <span>
                          {isCurrentPlaying
                            ? 'Đang đọc...'
                            : isCurrentWaiting
                            ? 'Nghe lại'
                            : 'Shadow'}
                        </span>
                      </button>

                      {isCurrentWaiting && !isLockedGuestRecord && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              handlePrevTongueTwisterRecord(record.id)
                            }
                            className="px-2.5 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-extrabold cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <span>Lùi</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleNextTongueTwisterRecord(record.id)
                            }
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <span>Tiếp</span>
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          if (isLockedGuestRecord) {
                            e.stopPropagation();
                            onRequireRegister?.();
                            return;
                          }
                          toggleRevealText(record.id, e);
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer flex items-center gap-1 border transition-all ${
                          isTextRevealed
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-white hover:bg-surface-container text-on-surface border-surface-container-high'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {isLockedGuestRecord
                            ? 'lock'
                            : isTextRevealed
                            ? 'visibility_off'
                            : 'visibility'}
                        </span>
                        <span>{isTextRevealed ? 'Ẩn chữ' : 'Hiện chữ'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          if (isLockedGuestRecord) {
                            e.stopPropagation();
                            onRequireRegister?.();
                            return;
                          }
                          toggleRecordUserVoice(record.id, e);
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer flex items-center gap-1 border transition-all ${
                          isRecordingThis
                            ? 'bg-red-600 text-white border-red-600 animate-pulse'
                            : 'bg-white hover:bg-surface-container text-on-surface-variant border-surface-container-high'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {isLockedGuestRecord
                            ? 'lock'
                            : isRecordingThis
                            ? 'stop'
                            : 'mic'}
                        </span>
                        <span className="hidden md:inline">
                          {isRecordingThis ? 'Dừng' : 'Thu'}
                        </span>
                      </button>

                      {userAudioUrl && !isLockedGuestRecord && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const audio = new Audio(userAudioUrl);
                            audio.play();
                          }}
                          className="px-2 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-extrabold cursor-pointer flex items-center gap-0.5"
                        >
                          <span className="material-symbols-outlined text-sm">
                            play_circle
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // PHẦN 1: NGHE NGẤM ÂM - JOY
  // ============================================================================
  const renderUnifiedJoyBlock = () => {
    const activeUnitDef =
      ALL_JOY_UNITS.find((u) => u.unitIndex === selectedJoyUnitIndex) ||
      ALL_JOY_UNITS[0];
    const isJoyStudioActive =
      activeStudioSection === 'joy1' || activeStudioSection === 'joy2';
    const currentKind =
      activeUnitDef.storageLevelKey === 'joy1' ? joy1LessonKind : joy2LessonKind;
    const activeSlotClusterId = getJoySlotClusterId(
      activeUnitDef.storageLevelKey,
      activeUnitDef.unitNumber,
      currentKind
    );
    const activeLessonTypeDef =
      JOY_LESSON_TYPES.find((t) => t.kind === currentKind) ||
      JOY_LESSON_TYPES[0];

    return (
      <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-[#e13829]/30 shadow-sm flex flex-col gap-5">
        {/* NGHE CẢM ÂM JOY bên cạnh có thêm nút Đăng ký */}
        <div className="pb-3 border-b border-stone-200/80 flex flex-wrap items-center gap-3">
          <span className="px-4 py-2 rounded-2xl bg-[#e13829] text-white font-black text-sm sm:text-base shadow-[0_3px_0_#991b1b] inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">
              auto_stories
            </span>
            <span>NGHE CẢM ÂM JOY</span>
          </span>

          <button
            id="btn-dang-ky-joy-inline"
            type="button"
            onClick={() => onOpenJoyRegisterModal?.()}
            className="px-4 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-[#e13829] text-[#c8281b] font-black text-sm sm:text-base shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <span className="material-symbols-outlined text-lg">
              how_to_reg
            </span>
            <span>Đăng ký</span>
          </button>
        </div>

        {/* Lưới 16 Unit của NGHE NGẤM ÂM - JOY */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {ALL_JOY_UNITS.map((u) => {
            const isSelectedUnit =
              isJoyUnitOpened && selectedJoyUnitIndex === u.unitIndex;
            const isLockedUnit = !hasPurchasedJoy;

            return (
              <button
                key={u.unitIndex}
                type="button"
                onClick={() => {
                  if (isLockedUnit) {
                    pointToTopJoyRegisterButton();
                    return;
                  }
                  if (videoPlayerRef.current) videoPlayerRef.current.pause();
                  setIsVideoPlaying(false);
                  stopAllShadowing();
                  setSelectedJoyUnitIndex(u.unitIndex);
                  setIsJoyUnitOpened(true);
                  setActiveStudioSection(u.storageLevelKey);
                  if (u.storageLevelKey === 'joy1') {
                    setJoy1Unit(u.unitNumber);
                  } else {
                    setJoy2Unit(u.unitNumber);
                  }
                  const nextCid = getJoySlotClusterId(
                    u.storageLevelKey,
                    u.unitNumber,
                    currentKind
                  );
                  const firstVid = videoLessons.find(
                    (v) => v.clusterId === nextCid
                  );
                  setSelectedVideoId(firstVid?.id || '');
                  setCurrentSentenceIdx(0);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 min-h-[96px] ${
                  isSelectedUnit && isJoyStudioActive && hasPurchasedJoy
                    ? 'bg-rose-50/90 border-2 border-[#e13829] shadow-[0_3px_0_#e13829]'
                    : 'bg-stone-50/80 hover:bg-rose-50/40 hover:border-[#e13829]/40 border-stone-200/90'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-xs sm:text-sm font-black ${
                      isSelectedUnit && hasPurchasedJoy
                        ? 'text-[#e13829]'
                        : 'text-stone-900'
                    }`}
                  >
                    {u.title}
                  </span>
                  {isLockedUnit && (
                    <span className="w-6 h-6 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[15px] text-[#e13829]">
                        lock
                      </span>
                    </span>
                  )}
                </div>

                <span className="text-base sm:text-xl font-black text-[#c8281b] tracking-wide leading-snug break-words">
                  {u.soundsLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Chỉ khi bấm vào Unit nào (đã mở khoá) thì mới hiện ra giao diện 5 bài học & Studio của Unit đó */}
        {hasPurchasedJoy && isJoyUnitOpened && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-2 border-t border-stone-200/80">
              {JOY_LESSON_TYPES.map((lt) => {
                const slotCid = getJoySlotClusterId(
                  activeUnitDef.storageLevelKey,
                  activeUnitDef.unitNumber,
                  lt.kind
                );
                const slotCluster = clusters.find((c) => c.id === slotCid);
                const slotVideos = videoLessons.filter(
                  (v) => v.clusterId === slotCid
                );
                const isSelectedKind =
                  isJoyStudioActive && currentKind === lt.kind;
                const isCardDragOver = dragOverClusterCardId === slotCid;
                const coverImg =
                  slotCluster?.coverImageUrl || slotVideos[0]?.coverImageUrl;
                const previewVidUrl = slotVideos[0]?.videoUrl;

                return (
                  <div
                    key={lt.kind}
                    onClick={() => {
                      if (videoPlayerRef.current) videoPlayerRef.current.pause();
                      setIsVideoPlaying(false);
                      stopAllShadowing();
                      setJoy1LessonKind(lt.kind);
                      setJoy2LessonKind(lt.kind);
                      setActiveStudioSection(activeUnitDef.storageLevelKey);
                      if (slotVideos[0]) {
                        setSelectedVideoId(slotVideos[0].id);
                      } else {
                        setSelectedVideoId('');
                      }
                      setCurrentSentenceIdx(0);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverClusterCardId(slotCid);
                    }}
                    onDragLeave={() => setDragOverClusterCardId(null)}
                    onDrop={async (e) => {
                      e.preventDefault();
                      setDragOverClusterCardId(null);
                      const files = e.dataTransfer?.files;
                      if (!files || files.length === 0) return;
                      const firstImg = Array.from(files).find((f) =>
                        f.type.startsWith('image/')
                      );
                      const videoFiles = Array.from(files).filter((f) =>
                        f.type.startsWith('video/')
                      );
                      if (firstImg) {
                        await handleApplyClusterCoverFile(slotCid, firstImg);
                      }
                      if (videoFiles.length > 0) {
                        await handleBatchUploadVideoFiles(videoFiles, {
                          targetClusterId: slotCid,
                        });
                      }
                    }}
                    className={`group rounded-2xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                      isCardDragOver
                        ? 'border-2 border-dashed border-[#e13829] bg-rose-50/40'
                        : isSelectedKind
                        ? 'bg-rose-50/35 border-2 border-[#e13829] shadow-[0_5px_0_#e13829]'
                        : 'bg-white hover:bg-stone-50 border-stone-200/90 shadow-[0_4px_0_#e7e5e4]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        className="px-2.5 py-1 rounded-xl text-white text-xs font-black flex items-center gap-1"
                        style={{ backgroundColor: lt.badgeColor }}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {lt.icon}
                        </span>
                        <span>{lt.label}</span>
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadingCoverForClusterId(slotCid);
                            clusterCoverInputRef.current?.click();
                          }}
                          className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
                          title="Đổi ảnh đại diện mục này"
                        >
                          <span className="material-symbols-outlined text-sm">
                            add_photo_alternate
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPendingUploadTargetClusterId(slotCid);
                            batchVideoFileInputRef.current?.click();
                          }}
                          className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-100 text-[#e13829] flex items-center justify-center cursor-pointer"
                          title={`Tải video lên ${lt.label}`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            upload_file
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="w-full h-24 rounded-xl overflow-hidden bg-stone-100 border border-stone-200/80 flex items-center justify-center relative">
                      {coverImg ? (
                        <img
                          src={coverImg}
                          alt={lt.label}
                          className="w-full h-full object-cover"
                        />
                      ) : previewVidUrl ? (
                        <video
                          src={`${previewVidUrl}#t=0.8`}
                          preload="metadata"
                          muted
                          playsInline
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1 text-stone-400 p-2 text-center">
                          <span
                            className="material-symbols-outlined text-2xl"
                            style={{ color: lt.badgeColor }}
                          >
                            {lt.icon}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-1 pt-0.5">
                      <span className="text-[11px] font-extrabold text-stone-600">
                        {lt.kind === 'tongue'
                          ? slotVideos.length > 0
                            ? `${slotVideos.length} video • ${
                                TONGUE_TWISTERS_DATA.filter(
                                  (r) => r.unitCode === activeUnitDef.unitCode
                                ).length
                              } câu`
                            : `${
                                TONGUE_TWISTERS_DATA.filter(
                                  (r) => r.unitCode === activeUnitDef.unitCode
                                ).length
                              } câu luyện âm`
                          : slotVideos.length > 0
                          ? `${slotVideos.length} video`
                          : 'Mở học'}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-0.5 ${
                          isSelectedKind
                            ? 'bg-[#e13829] text-white'
                            : 'bg-stone-100 text-stone-700 group-hover:bg-rose-100 group-hover:text-[#e13829]'
                        }`}
                      >
                        {isSelectedKind ? 'Đang mở' : 'Mở →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {renderUnifiedShadowingStudio({
              targetClusterId: activeSlotClusterId,
              studioTitle: `${activeUnitDef.title} (${activeUnitDef.soundsLabel}) — ${activeLessonTypeDef.label}`,
              studioSubtitle: activeLessonTypeDef.shortDesc,
              isTongueSlot: currentKind === 'tongue',
              unitCodeForTongue: activeUnitDef.unitCode,
            })}
          </>
        )}
      </div>
    );
  };

  return (
    <section id="luyen-shadowing" className="w-full">
      {/* Input ẩn tải ảnh từng dòng Tongue Twisters */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageInputChange}
        className="hidden"
      />

      {/* Input ẩn đổi ảnh đại diện cho 1 Cụm / Mục bài học */}
      <input
        ref={clusterCoverInputRef}
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file && uploadingCoverForClusterId) {
            await handleApplyClusterCoverFile(uploadingCoverForClusterId, file);
          }
          setUploadingCoverForClusterId(null);
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* Input ẩn tải ảnh bìa cho từng truyện / video */}
      <input
        ref={videoCoverInputRef}
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file && uploadingCoverForVideoId) {
            await handleApplyVideoCoverFile(uploadingCoverForVideoId, file);
          }
          setUploadingCoverForVideoId(null);
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* Input ẩn chọn ảnh đại diện khi tạo Cụm Hoạt Hình mới */}
      <input
        ref={newClusterCoverInputRef}
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file && file.type.startsWith('image/')) {
            const url = await readImageFileAsDataUrl(file);
            setNewClusterCoverUrl(url);
          }
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* Input ẩn tải HÀNG LOẠT file video vào Mục / Cụm đang mở */}
      <input
        ref={batchVideoFileInputRef}
        type="file"
        multiple
        accept="video/mp4,video/webm,video/quicktime,video/*"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleBatchUploadVideoFiles(e.target.files, {
              targetClusterId:
                pendingUploadTargetClusterId ||
                (effectiveSelectedClusterId &&
                effectiveSelectedClusterId !== BUILTIN_TONGUE_CLUSTER_ID
                  ? effectiveSelectedClusterId
                  : undefined),
            });
          }
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* Input ẩn tải HÀNG LOẠT file video khi bấm từ khung Tạo Bộ Hoạt Hình Mới */}
      <input
        ref={newClusterVideoInputRef}
        type="file"
        multiple
        accept="video/mp4,video/webm,video/quicktime,video/*"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleBatchUploadVideoFiles(e.target.files, {
              createClusterName: newClusterName,
              createClusterCoverUrl: newClusterCoverUrl,
              defaultLevel: newClusterDefaultLevel,
            });
          }
          e.target.value = '';
        }}
        className="hidden"
      />

      {/* Input ẩn đổi 1 file video cho tiêu đề đang chọn */}
      <input
        ref={replaceSingleVideoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/*"
        onChange={handleReplaceSingleVideoFile}
        className="hidden"
      />

      <div className="w-full flex flex-col gap-6">
        {/* ========================================================================== */}
        {/* 1. TUNE IN - NGHE NGẤM (CÁC Ô KÊNH YOUTUBE + TÍCH LUỸ GIỜ NGHE MỖI NGÀY)   */}
        {/* ========================================================================== */}
        {displayMode !== 'joy-only' && (
          <TuneInNgheNgamSection
            isLoggedIn={isLoggedIn}
            currentUserEmail={currentUserEmail}
            currentUsername={currentUsername}
            onOpenAuthModal={onOpenAuthModal}
          />
        )}

        {/* ========================================================================== */}
        {/* 2. TUNE IN - LỒNG TIẾNG (LỒNG TIẾNG TỪNG CÂU CHO VIDEO HOẠT HÌNH)          */}
        {/* ========================================================================== */}
        {displayMode !== 'joy-only' &&
          (sectionViewFilter === 'ALL' || sectionViewFilter === 'free') && (
          <div
            id="tune-in-khuc-free"
            className="bg-[#f7f4f0] rounded-3xl p-4 sm:p-6 border-2 border-stone-200 shadow-sm flex flex-col gap-5 scroll-mt-24"
          >
            {/* Header TUNE IN - LỒNG TIẾNG + Bộ lọc Level + Trạng thái đăng nhập lưu bài lồng tiếng */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-stone-200/80">
              <div className="flex flex-wrap items-center gap-3">
                <div
                  onClick={() => {
                    if (videoPlayerRef.current) videoPlayerRef.current.pause();
                    setIsVideoPlaying(false);
                    stopAllShadowing();
                    setActiveStudioSection('free');
                    setSelectedFreeClusterId(null);
                  }}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <span className="px-4 py-1.5 rounded-2xl bg-[#059669] text-white font-black text-base sm:text-lg shadow-xs group-hover:scale-105 transition-transform flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl">
                      record_voice_over
                    </span>
                    <span>TUNE IN - LỒNG TIẾNG</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={() => setIsDubLibraryOpen((prev) => !prev)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-black cursor-pointer flex items-center gap-1.5 border transition-all ${
                      isDubLibraryOpen
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-white hover:bg-amber-50 text-stone-800 border-amber-300 shadow-2xs'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base text-amber-600">
                      folder_Shared
                    </span>
                    <span>
                      📂 Bài Lồng Tiếng Đã Lưu ({savedDubbingRecords.length} câu)
                    </span>
                  </button>
                )}

                {selectedFreeClusterId && activeStudioSection === 'free' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (videoPlayerRef.current)
                        videoPlayerRef.current.pause();
                      setIsVideoPlaying(false);
                      stopAllShadowing();
                      setSelectedFreeClusterId(null);
                    }}
                    className="px-3.5 py-2 rounded-2xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-extrabold cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-base">
                      grid_view
                    </span>
                    <span>
                      ← Tất cả Bộ Hoạt Hình ({freeCartoonClusters.length})
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setActiveStudioSection('free');
                    setIsCreateClusterModalOpen((prev) => !prev);
                  }}
                  className="px-4 py-2 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white text-xs sm:text-sm font-black cursor-pointer flex items-center gap-1.5 shadow-[0_4px_0_#065f46] active:translate-y-0.5 transition-all"
                >
                  <span className="material-symbols-outlined text-base">
                    create_new_folder
                  </span>
                  <span>+ Đẩy Bộ Hoạt Hình Mới Lên</span>
                </button>
              </div>
            </div>

            {/* Khung Kho Bài Lồng Tiếng Đã Lưu Trong Tài Khoản Học Viên */}
            {isLoggedIn && isDubLibraryOpen && (
              <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-300 shadow-sm flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-600">
                      library_music
                    </span>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-stone-900">
                        Kho Bài Lồng Tiếng Của Tài Khoản ({currentUsername || currentUserEmail})
                      </h3>
                      <p className="text-xs font-semibold text-stone-500">
                        Toàn bộ các câu con đã lồng tiếng được lưu tự động vào tài khoản. Bấm vào để nghe lại hoặc mở bài video tương ứng.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDubLibraryOpen(false)}
                    className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-500 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">
                      close
                    </span>
                  </button>
                </div>

                {savedDubbingRecords.length === 0 ? (
                  <div className="p-6 text-center text-xs sm:text-sm font-bold text-stone-500 bg-stone-50 rounded-2xl border border-stone-200">
                    Tài khoản của bạn chưa có bản thu lồng tiếng nào. Hãy mở 1 bộ video hoạt hình bên dưới và bấm <strong>🎙️ Lồng tiếng</strong> ở từng câu nhé!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
                    {savedDubbingRecords.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black">
                              Câu {rec.segmentIndex}/{rec.totalSegments}
                            </span>
                            <span className="text-xs font-black text-stone-900 truncate">
                              {rec.videoTitle}
                            </span>
                          </div>
                          {rec.sentenceText &&
                            !isPlaceholderSegmentText(rec.sentenceText) && (
                              <p className="text-xs font-bold text-stone-600 truncate mt-0.5">
                                “{rec.sentenceText}”
                              </p>
                            )}
                          <span className="text-[10px] font-semibold text-stone-400">
                            Lưu lúc:{' '}
                            {new Date(rec.updatedAt).toLocaleString('vi-VN')}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const audio = new Audio(rec.audioUrl);
                              audio.play();
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer flex items-center gap-1"
                            title="Nghe lại giọng lồng tiếng của con"
                          >
                            <span className="material-symbols-outlined text-sm">
                              play_circle
                            </span>
                            <span>Nghe</span>
                          </button>

                          {rec.clusterId && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveStudioSection('free');
                                setSelectedFreeClusterId(rec.clusterId);
                                if (rec.videoId) {
                                  handleSelectVideoLesson(rec.videoId);
                                }
                                setIsDubLibraryOpen(false);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-extrabold cursor-pointer"
                              title="Mở video bài này"
                            >
                              Mở bài
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) =>
                              handleDeleteSavedDubbing(rec.recordKey, e)
                            }
                            className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-stone-400 hover:text-rose-600 border border-stone-200 cursor-pointer"
                            title="Xoá bản lồng tiếng này"
                          >
                            <span className="material-symbols-outlined text-sm">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Khung Tạo Bộ Hoạt Hình Mới trong NGHE NGẤM TỰ DO- TUNE IN */}
            {isCreateClusterModalOpen && (
              <div
                onPaste={async (e) => {
                  const items = e.clipboardData?.items;
                  if (!items) return;
                  for (let i = 0; i < items.length; i++) {
                    if (items[i].type.startsWith('image/')) {
                      const blob = items[i].getAsFile();
                      if (blob) {
                        const url = await readImageFileAsDataUrl(blob);
                        setNewClusterCoverUrl(url);
                      }
                      break;
                    }
                  }
                }}
                className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#059669]/40 shadow-md flex flex-col gap-4"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#059669]">
                      folder_special
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-stone-900">
                      Đẩy Bộ Video Hoạt Hình Shadowing Mới Lên
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCreateClusterModalOpen(false)}
                    className="p-1 rounded-lg hover:bg-stone-100 text-stone-500 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">
                      close
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-4 flex flex-col items-center gap-2">
                    <div
                      onClick={() => newClusterCoverInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={async (e) => {
                        e.preventDefault();
                        const file = e.dataTransfer?.files?.[0];
                        if (file && file.type.startsWith('image/')) {
                          const url = await readImageFileAsDataUrl(file);
                          setNewClusterCoverUrl(url);
                        }
                      }}
                      className="w-full h-36 rounded-2xl border-2 border-dashed border-stone-300 hover:border-[#059669] bg-stone-50 flex flex-col items-center justify-center gap-1.5 cursor-pointer overflow-hidden relative group"
                    >
                      {newClusterCoverUrl ? (
                        <>
                          <img
                            src={newClusterCoverUrl}
                            alt="Ảnh đại diện bộ hoạt hình"
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                            Đổi ảnh đại diện
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-3xl text-[#059669]">
                            add_photo_alternate
                          </span>
                          <span className="text-xs font-extrabold text-stone-700 text-center px-2">
                            + Chọn hoặc Kéo thả Ảnh đại diện Bộ Hoạt Hình (hoặc tự cắt từ video)
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-8 flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-extrabold text-stone-700">
                        1. Tên bộ hoạt hình:
                      </label>
                      <input
                        type="text"
                        value={newClusterName}
                        onChange={(e) => setNewClusterName(e.target.value)}
                        placeholder="Nhập tên bộ hoạt hình..."
                        className="px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-300 text-sm font-extrabold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#059669]"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => newClusterVideoInputRef.current?.click()}
                        className="flex-1 py-2.5 px-4 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-black text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_0_#065f46]"
                      >
                        <span className="material-symbols-outlined text-lg">
                          video_library
                        </span>
                        <span>
                          3. Chọn Loạt Video Hoạt Hình Đẩy Lên Bộ Này
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCreateEmptyOrReadyCluster}
                        className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-xs cursor-pointer border border-stone-300"
                      >
                        Chỉ tạo thẻ Bộ Hoạt Hình trước
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LƯỚI CÁC BỘ VIDEO HOẠT HÌNH TRONG TUNE IN - LỒNG TIẾNG */}
            {(!selectedFreeClusterId || activeStudioSection !== 'free') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {freeCartoonClusters.map((cluster) => {
                  const vidsInCluster = videoLessons.filter(
                    (v) => v.clusterId === cluster.id
                  );
                  const isCardDragOver = dragOverClusterCardId === cluster.id;

                  return (
                    <div
                      key={cluster.id}
                      onClick={() => {
                        if (videoPlayerRef.current)
                          videoPlayerRef.current.pause();
                        setIsVideoPlaying(false);
                        stopAllShadowing();
                        setActiveStudioSection('free');
                        setSelectedFreeClusterId(cluster.id);
                        const firstVid = vidsInCluster[0];
                        if (firstVid) {
                          handleSelectVideoLesson(firstVid.id);
                        }
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOverClusterCardId(cluster.id);
                      }}
                      onDragLeave={() => setDragOverClusterCardId(null)}
                      onDrop={async (e) => {
                        e.preventDefault();
                        setDragOverClusterCardId(null);
                        const files = e.dataTransfer?.files;
                        if (!files || files.length === 0) return;
                        const firstImg = Array.from(files).find((f) =>
                          f.type.startsWith('image/')
                        );
                        const videoFiles = Array.from(files).filter((f) =>
                          f.type.startsWith('video/')
                        );
                        if (firstImg) {
                          await handleApplyClusterCoverFile(
                            cluster.id,
                            firstImg
                          );
                        }
                        if (videoFiles.length > 0) {
                          await handleBatchUploadVideoFiles(videoFiles, {
                            targetClusterId: cluster.id,
                          });
                        }
                      }}
                      className={`group relative rounded-[28px] bg-white p-5 border transition-all cursor-pointer flex flex-col justify-between min-h-[215px] ${
                        isCardDragOver
                          ? 'border-2 border-dashed border-[#059669] bg-emerald-50/30 shadow-[0_8px_0_#059669]'
                          : 'border-stone-200/90 shadow-[0_7px_0_#d6d3d1] hover:shadow-[0_9px_0_#c7c3c0] hover:-translate-y-0.5'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadingCoverForClusterId(cluster.id);
                              clusterCoverInputRef.current?.click();
                            }}
                            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
                            title="Đổi ảnh đại diện bộ hoạt hình"
                          >
                            <span className="material-symbols-outlined text-lg">
                              add_photo_alternate
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPendingUploadTargetClusterId(cluster.id);
                              batchVideoFileInputRef.current?.click();
                            }}
                            className="w-9 h-9 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#059669] flex items-center justify-center transition-colors cursor-pointer"
                            title="Đẩy thêm video hoạt hình vào bộ này"
                          >
                            <span className="material-symbols-outlined text-lg">
                              upload_file
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteCluster(cluster.id, e)}
                            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-rose-100 text-stone-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer"
                            title="Xóa bộ hoạt hình này"
                          >
                            <span className="material-symbols-outlined text-base">
                              delete
                            </span>
                          </button>
                        </div>

                        <span className="px-3 py-1 rounded-full bg-[#e6f7ef] border border-[#6ee7b7] text-[#047857] text-xs font-extrabold flex items-center gap-1.5 shadow-2xs">
                          <span className="material-symbols-outlined text-sm">
                            smart_display
                          </span>
                          <span>Video ({vidsInCluster.length})</span>
                        </span>
                      </div>

                      <div className="my-3 flex flex-col items-center justify-center gap-2.5 text-center">
                        {cluster.coverImageUrl ||
                        vidsInCluster[0]?.coverImageUrl ? (
                          <div className="w-full h-32 rounded-2xl overflow-hidden bg-stone-900 border border-stone-200 flex items-center justify-center">
                            <img
                              src={
                                cluster.coverImageUrl ||
                                vidsInCluster[0]?.coverImageUrl
                              }
                              alt={cluster.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : vidsInCluster[0]?.videoUrl ? (
                          <div className="w-full h-32 rounded-2xl overflow-hidden bg-stone-900 border border-stone-200 flex items-center justify-center">
                            <video
                              src={`${vidsInCluster[0].videoUrl}#t=0.8`}
                              preload="metadata"
                              muted
                              playsInline
                              className="w-full h-full object-cover pointer-events-none"
                            />
                          </div>
                        ) : null}

                        <h3 className="text-2xl sm:text-3xl font-black text-[#d93829] tracking-tight leading-tight line-clamp-2 px-1">
                          {cluster.name}
                        </h3>
                      </div>
                    </div>
                  );
                })}

                {/* Thẻ "+ Đẩy Thêm Bộ Hoạt Hình Mới" */}
                <div
                  onClick={() => {
                    setActiveStudioSection('free');
                    setIsCreateClusterModalOpen(true);
                  }}
                  className="rounded-[28px] bg-white/70 hover:bg-white p-5 border-2 border-dashed border-stone-300 hover:border-[#059669] shadow-[0_7px_0_#e7e5e4] transition-all cursor-pointer flex flex-col items-center justify-center gap-2 min-h-[215px] text-center group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#059669] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">
                      add_circle
                    </span>
                  </div>
                  <span className="text-base sm:text-lg font-black text-stone-800 group-hover:text-[#059669]">
                    + Đẩy Bộ Hoạt Hình Mới Lên
                  </span>
                </div>
              </div>
            )}

            {/* KHI ĐANG MỞ 1 BỘ HOẠT HÌNH TRONG TUNE IN - LỒNG TIẾNG */}
            {selectedFreeClusterId &&
              activeStudioSection === 'free' &&
              activeCluster &&
              renderUnifiedShadowingStudio({
                targetClusterId: activeCluster.id,
                studioTitle: activeCluster.name,
                isTongueSlot: false,
                showFreeClusterHeader: true,
              })}
          </div>
        )}

        {/* ========================================================================== */}
        {/* JOY- NGHE CẢM ÂM (CÓ MÃ CODE JOY RIÊNG)                                     */}
        {/* ========================================================================== */}
        {displayMode !== 'tune-in-only' &&
          (sectionViewFilter === 'ALL' ||
            sectionViewFilter === 'joy1' ||
            sectionViewFilter === 'joy2') && (
            <div id="tune-in-khuc-joy" className="scroll-mt-24">
              {renderUnifiedJoyBlock()}
            </div>
          )}
      </div>
    </section>
  );
}
