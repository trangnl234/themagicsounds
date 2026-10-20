import { CourseKey } from './courseCoverStorage';
import { syncProgressToFirestore } from '../firebase';

export interface StudentLearningProgress {
  learnedSounds: string[];
  learnedAltSets: string[];
  learnedTrickyGroups: number[];
  completedBooks: string[];
  tuneInCompletedCount: number;
  tuneInListeningSeconds?: number;
  tuneInDailySeconds?: Record<string, number>;
  soundCodeLearned: string[];
  soundToSpeechLearned: string[];
  diamonds: number;
  lastStudiedItem: string;
  lastActiveAt: number;
}

export type UnlockedCoursesMap = Record<CourseKey, boolean>;

export interface AdminStudentRecord {
  username: string;
  email: string;
  verified: boolean;
  createdAt: number;
  unlockedCourses: UnlockedCoursesMap;
  progress: StudentLearningProgress;
}

export interface ActivationCodeRecord {
  code: string;
  targetEmail: string;
  courseKey: CourseKey;
  used: boolean;
  usedAt?: number;
  createdAt: number;
  note?: string;
}

export async function syncStudentAccountOnLogin(
  email: string,
  username: string
): Promise<{
  unlockedCourses: UnlockedCoursesMap;
  progress: StudentLearningProgress;
} | null> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) return null;

  try {
    const res = await fetch('/api/auth/sync-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, username: username.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.user) {
        return {
          unlockedCourses: data.user.unlockedCourses,
          progress: data.user.progress,
        };
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export async function recordStudentProgress(params: {
  email: string;
  username: string;
  soundId?: string;
  altSetId?: string;
  trickyGroup?: number;
  bookTitle?: string;
  tuneInIncrement?: number;
  tuneInListeningSecondsAdd?: number;
  tuneInDailyDate?: string;
  soundCodeId?: string;
  soundToSpeechId?: string;
  diamonds?: number;
  lastStudiedItem?: string;
}): Promise<StudentLearningProgress | null> {
  if (!params.email && !params.username) return null;

  try {
    const res = await fetch('/api/progress/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.progress) {
        syncProgressToFirestore({
          learnedSoundsCount: data.progress.learnedSounds?.length ?? 0,
          completedBooksCount: data.progress.completedBooks?.length ?? 0,
          lastStudiedItem: data.progress.lastStudiedItem,
        }).catch(() => {});
        return data.progress as StudentLearningProgress;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export async function redeemOneTimeActivationCode(
  code: string,
  email: string,
  expectedCourseKey?: CourseKey
): Promise<{
  ok: boolean;
  courseKey?: CourseKey;
  unlockedCourses?: UnlockedCoursesMap;
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch('/api/activation/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code.trim().toUpperCase(),
        email: email.trim().toLowerCase(),
        expectedCourseKey,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        ok: false,
        error:
          data?.error ||
          'Mã kích hoạt không hợp lệ hoặc đã được sử dụng.',
      };
    }

    if (data?.courseKey === 'magic-sounds') {
      syncProgressToFirestore({
        unlockedMagicSounds: true,
        lastStudiedItem: `Kích hoạt Full MAGIC SOUNDS (${code.trim().toUpperCase()})`,
      }).catch(() => {});
    } else if (data?.courseKey === 'sound-code') {
      syncProgressToFirestore({
        unlockedSoundCode: true,
        lastStudiedItem: `Kích hoạt Full SOUND CODE (${code.trim().toUpperCase()})`,
      }).catch(() => {});
    } else if (data?.courseKey === 'tune-in') {
      syncProgressToFirestore({
        lastStudiedItem: `Kích hoạt Full JOY (${code.trim().toUpperCase()})`,
      }).catch(() => {});
    }

    return {
      ok: true,
      courseKey: data.courseKey,
      unlockedCourses: data.unlockedCourses,
      message: data.message,
    };
  } catch {
    return {
      ok: false,
      error: 'Không thể kết nối máy chủ để kiểm tra mã kích hoạt. Vui lòng thử lại.',
    };
  }
}

export async function fetchAdminOverview(): Promise<{
  students: AdminStudentRecord[];
  activationCodes: ActivationCodeRecord[];
}> {
  try {
    const res = await fetch('/api/admin/overview');
    if (res.ok) {
      const data = await res.json();
      return {
        students: Array.isArray(data?.students) ? data.students : [],
        activationCodes: Array.isArray(data?.activationCodes)
          ? data.activationCodes
          : [],
      };
    }
  } catch {
    // ignore
  }
  return { students: [], activationCodes: [] };
}

export async function generateOneTimeActivationCode(
  targetEmail: string,
  courseKey: CourseKey = 'magic-sounds',
  note?: string
): Promise<{
  ok: boolean;
  activationCode?: ActivationCodeRecord;
  error?: string;
}> {
  try {
    const res = await fetch('/api/admin/generate-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetEmail: targetEmail.trim().toLowerCase(),
        courseKey,
        note,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        ok: false,
        error: data?.error || 'Không thể tạo mã kích hoạt.',
      };
    }
    return {
      ok: true,
      activationCode: data.activationCode,
    };
  } catch {
    return {
      ok: false,
      error: 'Lỗi kết nối khi tạo mã kích hoạt.',
    };
  }
}

export async function adminToggleStudentCourse(
  email: string,
  courseKey: CourseKey,
  unlocked: boolean
): Promise<UnlockedCoursesMap | null> {
  try {
    const res = await fetch('/api/admin/toggle-course', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, courseKey, unlocked }),
    });
    if (res.ok) {
      const data = await res.json();
      return data?.unlockedCourses || null;
    }
  } catch {
    // ignore
  }
  return null;
}

export interface StudentDubbingRecord {
  id: string;
  email: string;
  username: string;
  recordKey: string;
  videoId: string;
  videoTitle: string;
  clusterId: string;
  clusterName: string;
  segmentId: string;
  segmentIndex: number;
  totalSegments: number;
  sentenceText: string;
  startTime: number;
  endTime: number;
  audioUrl: string;
  updatedAt: number;
}

export async function fetchStudentDubbingRecords(params: {
  email: string;
  username?: string;
}): Promise<{
  records: StudentDubbingRecord[];
  audioMap: Record<string, string>;
}> {
  const cleanEmail = (params.email || '').trim().toLowerCase();
  const cleanUser = (params.username || '').trim();
  if (!cleanEmail && !cleanUser) {
    return { records: [], audioMap: {} };
  }
  try {
    const qs = new URLSearchParams();
    if (cleanEmail) qs.set('email', cleanEmail);
    if (cleanUser) qs.set('username', cleanUser);
    const res = await fetch(`/api/dubbing/list?${qs.toString()}`);
    if (res.ok) {
      const data = await res.json();
      return {
        records: Array.isArray(data?.records) ? data.records : [],
        audioMap:
          data?.audioMap && typeof data.audioMap === 'object'
            ? data.audioMap
            : {},
      };
    }
  } catch {
    // ignore
  }
  return { records: [], audioMap: {} };
}

export async function saveStudentDubbingSegment(params: {
  email: string;
  username: string;
  recordKey: string;
  videoId: string;
  videoTitle: string;
  clusterId: string;
  clusterName: string;
  segmentId: string;
  segmentIndex: number;
  totalSegments: number;
  sentenceText: string;
  startTime: number;
  endTime: number;
  audioDataUrl: string;
}): Promise<StudentDubbingRecord | null> {
  try {
    const res = await fetch('/api/dubbing/save-segment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.record) {
        syncProgressToFirestore({
          lastStudiedItem: `Lồng tiếng: ${params.videoTitle} (Câu ${params.segmentIndex}/${params.totalSegments})`,
        }).catch(() => {});
        return data.record as StudentDubbingRecord;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export async function deleteStudentDubbingSegment(params: {
  email: string;
  username?: string;
  recordKey: string;
}): Promise<boolean> {
  try {
    const res = await fetch('/api/dubbing/delete-segment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.ok;
  } catch {
    return false;
  }
}

