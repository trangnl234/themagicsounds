import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SegmentAudioInput {
  index: number;
  startTime: number;
  endTime: number;
  wavBase64: string;
}

interface TranscribedSegmentOutput {
  index: number;
  text: string;
}

function getGenAIClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function parseJsonTranscriptArray(
  rawText: string,
  expectedIndices: number[]
): TranscribedSegmentOutput[] {
  if (!rawText) return [];

  // Strip markdown code fences if present
  const cleaned = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item, idx) => ({
          index:
            typeof item?.index === 'number'
              ? item.index
              : expectedIndices[idx] ?? idx + 1,
          text: typeof item?.text === 'string' ? item.text.trim() : '',
        }))
        .filter((item) => typeof item.index === 'number');
    }
  } catch {
    // Try extracting JSON array substring
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed)) {
          return parsed.map((item, idx) => ({
            index:
              typeof item?.index === 'number'
                ? item.index
                : expectedIndices[idx] ?? idx + 1,
            text: typeof item?.text === 'string' ? item.text.trim() : '',
          }));
        }
      } catch {
        // Fallback to line-by-line parsing below
      }
    }
  }

  // Fallback: if plain lines were returned
  const lines = cleaned
    .split(/\r?\n/)
    .map((l) =>
      l
        .replace(/^(?:Segment|Clip|Câu)\s*#?\d+\s*(?:\([^)]*\))?\s*[:.-]\s*/i, '')
        .replace(/^\d+[.)]\s*/, '')
        .trim()
    )
    .filter(Boolean);

  if (lines.length > 0 && expectedIndices.length === 1) {
    return [{ index: expectedIndices[0], text: lines.join(' ') }];
  }

  if (lines.length === expectedIndices.length) {
    return expectedIndices.map((segIdx, i) => ({
      index: segIdx,
      text: lines[i] || '',
    }));
  }

  return [];
}

const modelCooldownUntil = new Map<string, number>();

function isQuotaOrRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err || '');
  return (
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('Quota exceeded') ||
    msg.includes('rate limit')
  );
}

async function transcribeBatchWithGemini(
  ai: GoogleGenAI,
  parts: Array<
    { text: string } | { inlineData: { mimeType: string; data: string } }
  >,
  expectedIndices: number[]
): Promise<TranscribedSegmentOutput[]> {
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        index: {
          type: Type.INTEGER,
          description: 'The segment index number.',
        },
        text: {
          type: Type.STRING,
          description:
            'The exact spoken words in this audio segment, or empty string if only music/silence.',
        },
      },
      required: ['index', 'text'],
    },
  };

  const modelsToTry = [
    'gemini-3.5-transcribe',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-3.8-flash',
  ];

  const now = Date.now();

  for (const modelName of modelsToTry) {
    const cooldownUntil = modelCooldownUntil.get(modelName) || 0;
    if (now < cooldownUntil) {
      continue;
    }

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });
      const rawText = (response.text || '').trim();
      const parsed = parseJsonTranscriptArray(rawText, expectedIndices);
      if (parsed.length > 0) {
        return parsed;
      }
    } catch (err) {
      if (isQuotaOrRateLimitError(err)) {
        // Put rate-limited model on cooldown for 30 minutes and try the next model immediately
        modelCooldownUntil.set(modelName, Date.now() + 30 * 60 * 1000);
        continue;
      }
    }

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts },
        config: {
          temperature: 0.1,
        },
      });
      const rawText = (response.text || '').trim();
      const parsed = parseJsonTranscriptArray(rawText, expectedIndices);
      if (parsed.length > 0) {
        return parsed;
      }
    } catch (err) {
      if (isQuotaOrRateLimitError(err)) {
        modelCooldownUntil.set(modelName, Date.now() + 30 * 60 * 1000);
        continue;
      }
    }
  }

  return [];
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));

  // 1. Teacher photo API
  app.get('/api/teacher-photo', (_req, res) => {
    const publicPhotoPath = path.resolve(__dirname, 'public/ms-trang-asi.png');
    const exists = fs.existsSync(publicPhotoPath);
    res.json({
      exists,
      url: exists ? `/ms-trang-asi.png?t=${Date.now()}` : null,
    });
  });

  app.post('/api/teacher-photo', (req, res) => {
    try {
      const publicPhotoPath = path.resolve(__dirname, 'public/ms-trang-asi.png');
      const dataUrl: string = req.body?.dataUrl || '';
      const match = dataUrl.match(/^data:image\/[a-zA-Z0-9+.-]+;base64,(.+)$/);
      if (!match) {
        res.status(400).json({ error: 'Invalid dataUrl' });
        return;
      }
      const buffer = Buffer.from(match[1], 'base64');
      fs.mkdirSync(path.dirname(publicPhotoPath), { recursive: true });
      fs.writeFileSync(publicPhotoPath, buffer);
      res.json({ ok: true, url: `/ms-trang-asi.png?t=${Date.now()}` });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // 1b. User Accounts, Learning Progress & One-Time Activation Codes API
  interface StudentLearningProgress {
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

  interface UnlockedCoursesMap {
    'tune-in': boolean;
    'magic-sounds': boolean;
    'sound-code': boolean;
    'sound-to-speech': boolean;
  }

  interface StoredUserAccount {
    username: string;
    email: string;
    password: string;
    verified: boolean;
    confirmToken: string;
    resetToken?: string;
    createdAt: number;
    unlockedCourses?: UnlockedCoursesMap;
    progress?: StudentLearningProgress;
  }

  interface StoredActivationCode {
    code: string;
    targetEmail: string;
    courseKey: 'magic-sounds' | 'sound-code' | 'tune-in' | 'sound-to-speech';
    used: boolean;
    usedAt?: number;
    createdAt: number;
    note?: string;
  }

  const usersFilePath = path.resolve(__dirname, 'public/users-db.json');
  const codesFilePath = path.resolve(__dirname, 'public/activation-codes-db.json');

  function createDefaultUnlockedCourses(): UnlockedCoursesMap {
    return {
      'tune-in': false,
      'magic-sounds': false,
      'sound-code': false,
      'sound-to-speech': true,
    };
  }

  function createDefaultProgress(): StudentLearningProgress {
    return {
      learnedSounds: [],
      learnedAltSets: [],
      learnedTrickyGroups: [],
      completedBooks: [],
      tuneInCompletedCount: 0,
      tuneInListeningSeconds: 0,
      tuneInDailySeconds: {},
      soundCodeLearned: [],
      soundToSpeechLearned: [],
      diamonds: 60,
      lastStudiedItem: 'Mới đăng ký tài khoản',
      lastActiveAt: Date.now(),
    };
  }

  function ensureUserDefaults(u: StoredUserAccount): StoredUserAccount {
    if (!u.unlockedCourses) {
      u.unlockedCourses = createDefaultUnlockedCourses();
    } else {
      u.unlockedCourses['tune-in'] = Boolean(u.unlockedCourses['tune-in']);
      u.unlockedCourses['magic-sounds'] = Boolean(u.unlockedCourses['magic-sounds']);
      u.unlockedCourses['sound-code'] = Boolean(u.unlockedCourses['sound-code']);
      u.unlockedCourses['sound-to-speech'] = true;
    }
    if (!u.progress) {
      u.progress = createDefaultProgress();
    } else {
      u.progress.learnedSounds = Array.isArray(u.progress.learnedSounds)
        ? u.progress.learnedSounds
        : [];
      u.progress.learnedAltSets = Array.isArray(u.progress.learnedAltSets)
        ? u.progress.learnedAltSets
        : [];
      u.progress.learnedTrickyGroups = Array.isArray(u.progress.learnedTrickyGroups)
        ? u.progress.learnedTrickyGroups
        : [];
      u.progress.completedBooks = Array.isArray(u.progress.completedBooks)
        ? u.progress.completedBooks
        : [];
      u.progress.soundCodeLearned = Array.isArray(u.progress.soundCodeLearned)
        ? u.progress.soundCodeLearned
        : [];
      u.progress.soundToSpeechLearned = Array.isArray(u.progress.soundToSpeechLearned)
        ? u.progress.soundToSpeechLearned
        : [];
      u.progress.tuneInCompletedCount =
        typeof u.progress.tuneInCompletedCount === 'number'
          ? u.progress.tuneInCompletedCount
          : 0;
      u.progress.tuneInListeningSeconds =
        typeof u.progress.tuneInListeningSeconds === 'number'
          ? u.progress.tuneInListeningSeconds
          : 0;
      u.progress.tuneInDailySeconds =
        u.progress.tuneInDailySeconds &&
        typeof u.progress.tuneInDailySeconds === 'object'
          ? u.progress.tuneInDailySeconds
          : {};
      u.progress.diamonds =
        typeof u.progress.diamonds === 'number' ? u.progress.diamonds : 60;
      u.progress.lastStudiedItem =
        typeof u.progress.lastStudiedItem === 'string'
          ? u.progress.lastStudiedItem
          : '';
      u.progress.lastActiveAt =
        typeof u.progress.lastActiveAt === 'number'
          ? u.progress.lastActiveAt
          : u.createdAt || Date.now();
    }
    return u;
  }

  function readUsersDb(): StoredUserAccount[] {
    try {
      if (fs.existsSync(usersFilePath)) {
        const raw = fs.readFileSync(usersFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map((u) => ensureUserDefaults(u));
        }
      }
    } catch {
      // ignore
    }
    return [];
  }

  function writeUsersDb(users: StoredUserAccount[]): void {
    try {
      fs.mkdirSync(path.dirname(usersFilePath), { recursive: true });
      fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
    } catch {
      // ignore
    }
  }

  function readCodesDb(): StoredActivationCode[] {
    try {
      if (fs.existsSync(codesFilePath)) {
        const raw = fs.readFileSync(codesFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  }

  function writeCodesDb(codes: StoredActivationCode[]): void {
    try {
      fs.mkdirSync(path.dirname(codesFilePath), { recursive: true });
      fs.writeFileSync(codesFilePath, JSON.stringify(codes, null, 2), 'utf-8');
    } catch {
      // ignore
    }
  }

  app.post('/api/auth/register', (req, res) => {
    const username = String(req.body?.username || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!username || !email || !password) {
      res.status(400).json({ error: 'Vui lòng điền đầy đủ Username, Email và Mật khẩu.' });
      return;
    }

    const users = readUsersDb();
    const existingEmail = users.find((u) => u.email.toLowerCase() === email);
    if (existingEmail) {
      res.status(400).json({ error: 'Email này đã được đăng ký tài khoản.' });
      return;
    }
    const existingUsername = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
    if (existingUsername) {
      res.status(400).json({ error: 'Username này đã có người sử dụng.' });
      return;
    }

    const confirmToken = Math.random().toString(36).substring(2, 10).toUpperCase();
    const newUser: StoredUserAccount = ensureUserDefaults({
      username,
      email,
      password,
      verified: false,
      confirmToken,
      createdAt: Date.now(),
      unlockedCourses: createDefaultUnlockedCourses(),
      progress: createDefaultProgress(),
    });

    users.push(newUser);
    writeUsersDb(users);

    res.json({
      ok: true,
      message: `Đã gửi email xác nhận tới ${email}. Vui lòng bấm xác nhận để kích hoạt tài khoản.`,
      confirmToken,
      user: {
        username,
        email,
        verified: false,
        unlockedCourses: newUser.unlockedCourses,
        progress: newUser.progress,
      },
    });
  });

  app.post('/api/auth/confirm', (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const token = String(req.body?.token || '').trim().toUpperCase();

    const users = readUsersDb();
    const user = users.find((u) => u.email.toLowerCase() === email);
    if (!user) {
      res.status(404).json({ error: 'Không tìm thấy tài khoản với email này.' });
      return;
    }
    if (token && user.confirmToken && user.confirmToken !== token) {
      res.status(400).json({ error: 'Mã xác nhận email không đúng.' });
      return;
    }

    user.verified = true;
    ensureUserDefaults(user);
    writeUsersDb(users);

    res.json({
      ok: true,
      user: {
        username: user.username,
        email: user.email,
        verified: true,
        unlockedCourses: user.unlockedCourses,
        progress: user.progress,
      },
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const identifier = String(req.body?.identifier || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    const users = readUsersDb();
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === identifier ||
        u.username.toLowerCase() === identifier
    );

    if (!user || user.password !== password) {
      res.status(401).json({ error: 'Username/Email hoặc mật khẩu không chính xác.' });
      return;
    }

    if (!user.verified) {
      res.status(403).json({
        error: 'Tài khoản chưa được xác nhận email. Vui lòng bấm xác nhận email để kích hoạt tài khoản.',
        needsConfirmation: true,
        email: user.email,
        confirmToken: user.confirmToken,
      });
      return;
    }

    ensureUserDefaults(user);
    user.progress!.lastActiveAt = Date.now();
    writeUsersDb(users);

    res.json({
      ok: true,
      user: {
        username: user.username,
        email: user.email,
        verified: true,
        unlockedCourses: user.unlockedCourses,
        progress: user.progress,
      },
    });
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const newPassword = String(req.body?.newPassword || '');

    const users = readUsersDb();
    const user = users.find((u) => u.email.toLowerCase() === email);
    if (!user) {
      res.status(404).json({ error: 'Không tìm thấy tài khoản nào đăng ký với email này.' });
      return;
    }

    if (newPassword) {
      user.password = newPassword;
      user.verified = true;
      ensureUserDefaults(user);
      writeUsersDb(users);
      res.json({
        ok: true,
        message: 'Đã đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.',
        user: {
          username: user.username,
          email: user.email,
          unlockedCourses: user.unlockedCourses,
          progress: user.progress,
        },
      });
      return;
    }

    const resetToken = Math.random().toString(36).substring(2, 8).toUpperCase();
    user.resetToken = resetToken;
    writeUsersDb(users);

    res.json({
      ok: true,
      message: `Đã gửi hướng dẫn lấy lại mật khẩu về email ${email}.`,
      resetToken,
      username: user.username,
    });
  });

  // Đồng bộ tài khoản học viên (bao gồm học viên đăng nhập bằng Google / Firebase)
  app.post('/api/auth/sync-user', (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const username = String(req.body?.username || '').trim();
    if (!email) {
      res.status(400).json({ error: 'Thiếu email học viên.' });
      return;
    }

    const users = readUsersDb();
    let user = users.find((u) => u.email.toLowerCase() === email);
    if (!user) {
      user = ensureUserDefaults({
        username: username || email.split('@')[0] || 'Học viên',
        email,
        password: '',
        verified: true,
        confirmToken: 'GOOGLE_VERIFIED',
        createdAt: Date.now(),
        unlockedCourses: createDefaultUnlockedCourses(),
        progress: createDefaultProgress(),
      });
      users.push(user);
    } else {
      ensureUserDefaults(user);
      user.verified = true;
      if (username && !user.username) {
        user.username = username;
      }
      user.progress!.lastActiveAt = Date.now();
    }

    writeUsersDb(users);

    res.json({
      ok: true,
      user: {
        username: user.username,
        email: user.email,
        verified: user.verified,
        unlockedCourses: user.unlockedCourses,
        progress: user.progress,
      },
    });
  });

  // Cập nhật tiến trình học tập của học viên theo thời gian thực
  app.post('/api/progress/update', (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const username = String(req.body?.username || '').trim();
    if (!email && !username) {
      res.status(400).json({ error: 'Thiếu thông tin học viên.' });
      return;
    }

    const users = readUsersDb();
    let user = users.find(
      (u) =>
        (email && u.email.toLowerCase() === email) ||
        (!email && username && u.username.toLowerCase() === username.toLowerCase())
    );

    if (!user && email) {
      user = ensureUserDefaults({
        username: username || email.split('@')[0] || 'Học viên',
        email,
        password: '',
        verified: true,
        confirmToken: 'SYNC',
        createdAt: Date.now(),
        unlockedCourses: createDefaultUnlockedCourses(),
        progress: createDefaultProgress(),
      });
      users.push(user);
    }

    if (!user) {
      res.status(404).json({ error: 'Không tìm thấy học viên.' });
      return;
    }

    ensureUserDefaults(user);
    const p = user.progress!;
    p.lastActiveAt = Date.now();

    const soundId = String(req.body?.soundId || '').trim();
    if (soundId && !p.learnedSounds.includes(soundId)) {
      p.learnedSounds.push(soundId);
    }

    const altSetId = String(req.body?.altSetId || '').trim();
    if (altSetId && !p.learnedAltSets.includes(altSetId)) {
      p.learnedAltSets.push(altSetId);
    }

    const trickyGroup = Number(req.body?.trickyGroup || 0);
    if (trickyGroup > 0 && !p.learnedTrickyGroups.includes(trickyGroup)) {
      p.learnedTrickyGroups.push(trickyGroup);
    }

    const bookTitle = String(req.body?.bookTitle || '').trim();
    if (bookTitle && !p.completedBooks.includes(bookTitle)) {
      p.completedBooks.push(bookTitle);
    }

    const tuneInIncrement = Number(req.body?.tuneInIncrement || 0);
    if (tuneInIncrement > 0) {
      p.tuneInCompletedCount += tuneInIncrement;
    }

    const tuneInListeningSecondsAdd = Number(
      req.body?.tuneInListeningSecondsAdd || 0
    );
    if (tuneInListeningSecondsAdd > 0) {
      p.tuneInListeningSeconds =
        (p.tuneInListeningSeconds || 0) + Math.round(tuneInListeningSecondsAdd);
      const dailyDate =
        String(req.body?.tuneInDailyDate || '').trim() ||
        new Date().toISOString().slice(0, 10);
      if (!p.tuneInDailySeconds) {
        p.tuneInDailySeconds = {};
      }
      p.tuneInDailySeconds[dailyDate] =
        (p.tuneInDailySeconds[dailyDate] || 0) +
        Math.round(tuneInListeningSecondsAdd);
    }

    const soundCodeId = String(req.body?.soundCodeId || '').trim();
    if (soundCodeId && !p.soundCodeLearned.includes(soundCodeId)) {
      p.soundCodeLearned.push(soundCodeId);
    }

    const soundToSpeechId = String(req.body?.soundToSpeechId || '').trim();
    if (soundToSpeechId && !p.soundToSpeechLearned.includes(soundToSpeechId)) {
      p.soundToSpeechLearned.push(soundToSpeechId);
    }

    if (typeof req.body?.diamonds === 'number') {
      p.diamonds = req.body.diamonds;
    }

    const lastStudiedItem = String(req.body?.lastStudiedItem || '').trim();
    if (lastStudiedItem) {
      p.lastStudiedItem = lastStudiedItem.slice(0, 200);
    }

    writeUsersDb(users);

    res.json({
      ok: true,
      progress: p,
      unlockedCourses: user.unlockedCourses,
    });
  });

  // Kích hoạt khoá học bằng Mã Kích Hoạt 1 Lần gắn với đúng Email đã chuyển khoản
  app.post('/api/activation/redeem', (req, res) => {
    const code = String(req.body?.code || '')
      .trim()
      .toUpperCase();
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    const expectedCourseKey = String(req.body?.expectedCourseKey || '').trim();

    if (!code) {
      res.status(400).json({ error: 'Vui lòng nhập mã kích hoạt khoá học.' });
      return;
    }
    if (!email || !email.includes('@')) {
      res.status(400).json({
        error:
          'Vui lòng đăng nhập tài khoản học viên (hoặc nhập đúng Email tài khoản của bạn) để đối chiếu mã kích hoạt.',
      });
      return;
    }

    const codes = readCodesDb();
    const matchedCode = codes.find((c) => c.code.toUpperCase() === code);

    if (!matchedCode) {
      res.status(404).json({
        error:
          'Mã kích hoạt không tồn tại hoặc chưa chính xác. Sau khi chuyển khoản, vui lòng bấm nút Zalo hỗ trợ và gửi Email của bạn để nhận mã kích hoạt tương ứng!',
      });
      return;
    }

    if (
      expectedCourseKey &&
      matchedCode.courseKey !== expectedCourseKey
    ) {
      if (expectedCourseKey === 'tune-in') {
        res.status(400).json({
          error:
            'Mã này không phải mã code của phần JOY - NGHE CẢM ÂM. Vui lòng nhập đúng Mã code JOY riêng (VD: JOY-XXXXXX)!',
        });
        return;
      }
      if (expectedCourseKey === 'magic-sounds') {
        res.status(400).json({
          error:
            'Mã này không phải mã code của phần MAGIC SOUNDS - ĐÁNH VẦN TIẾNG ANH. Vui lòng nhập đúng Mã code Magic riêng (VD: MS-XXXXXX)!',
        });
        return;
      }
      res.status(400).json({
        error:
          'Mã kích hoạt này dành cho phần học khác. Vui lòng nhập đúng mã code của phần học này!',
      });
      return;
    }

    if (matchedCode.targetEmail.toLowerCase() !== email) {
      res.status(403).json({
        error: `Mã kích hoạt này được cấp riêng cho email "${matchedCode.targetEmail}" (không khớp với email "${email}"). Vui lòng đăng nhập đúng tài khoản email đã gửi qua Zalo!`,
      });
      return;
    }

    if (matchedCode.used) {
      res.status(400).json({
        error:
          'Mã kích hoạt này đã được sử dụng trước đó. Mỗi mã kích hoạt chỉ được sử dụng 1 lần duy nhất!',
      });
      return;
    }

    // Đánh dấu mã đã sử dụng (1 lần duy nhất)
    matchedCode.used = true;
    matchedCode.usedAt = Date.now();
    writeCodesDb(codes);

    // Mở khoá học tương ứng cho tài khoản học viên có email này
    const users = readUsersDb();
    let user = users.find((u) => u.email.toLowerCase() === email);
    if (!user) {
      user = ensureUserDefaults({
        username: email.split('@')[0] || 'Học viên',
        email,
        password: '',
        verified: true,
        confirmToken: 'ACTIVATED',
        createdAt: Date.now(),
        unlockedCourses: createDefaultUnlockedCourses(),
        progress: createDefaultProgress(),
      });
      users.push(user);
    } else {
      ensureUserDefaults(user);
    }

    user.unlockedCourses![matchedCode.courseKey] = true;
    user.progress!.lastStudiedItem = `Đã kích hoạt Full khoá ${matchedCode.courseKey.toUpperCase()} bằng mã ${matchedCode.code}`;
    user.progress!.lastActiveAt = Date.now();
    writeUsersDb(users);

    res.json({
      ok: true,
      courseKey: matchedCode.courseKey,
      unlockedCourses: user.unlockedCourses,
      message: `Kích hoạt thành công khoá học cho tài khoản ${email}!`,
    });
  });

  // API Quản trị viên: Xem toàn bộ danh sách học viên, tiến trình học & danh sách mã kích hoạt
  app.get('/api/admin/overview', (_req, res) => {
    const users = readUsersDb();
    const codes = readCodesDb();

    const students = users
      .map((u) => {
        ensureUserDefaults(u);
        return {
          username: u.username,
          email: u.email,
          verified: u.verified,
          createdAt: u.createdAt,
          unlockedCourses: u.unlockedCourses!,
          progress: u.progress!,
        };
      })
      .sort(
        (a, b) =>
          (b.progress.lastActiveAt || b.createdAt) -
          (a.progress.lastActiveAt || a.createdAt)
      );

    const sortedCodes = [...codes].sort((a, b) => b.createdAt - a.createdAt);

    res.json({
      ok: true,
      students,
      activationCodes: sortedCodes,
    });
  });

  // API Quản trị viên: Tạo mã kích hoạt dùng 1 lần gắn với Email học viên đã chuyển khoản
  app.post('/api/admin/generate-code', (req, res) => {
    const targetEmail = String(req.body?.targetEmail || '')
      .trim()
      .toLowerCase();
    const rawCourseKey = String(req.body?.courseKey || 'magic-sounds').trim();
    const note = String(req.body?.note || '').trim();

    if (!targetEmail || !targetEmail.includes('@')) {
      res.status(400).json({
        error: 'Vui lòng nhập địa chỉ Email hợp lệ của học viên đã chuyển khoản.',
      });
      return;
    }

    const courseKey = (
      ['magic-sounds', 'sound-code', 'tune-in', 'sound-to-speech'].includes(
        rawCourseKey
      )
        ? rawCourseKey
        : 'magic-sounds'
    ) as 'magic-sounds' | 'sound-code' | 'tune-in' | 'sound-to-speech';

    const prefix =
      courseKey === 'magic-sounds'
        ? 'MS'
        : courseKey === 'sound-code'
        ? 'SC'
        : courseKey === 'tune-in'
        ? 'JOY'
        : 'STS';

    const codes = readCodesDb();
    let newCodeStr = '';
    do {
      const rand = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, 'X');
      newCodeStr = `${prefix}-${rand}`;
    } while (codes.some((c) => c.code === newCodeStr));

    const newRecord: StoredActivationCode = {
      code: newCodeStr,
      targetEmail,
      courseKey,
      used: false,
      createdAt: Date.now(),
      note: note || undefined,
    };

    codes.push(newRecord);
    writeCodesDb(codes);

    res.json({
      ok: true,
      activationCode: newRecord,
    });
  });

  // API Quản trị viên: Mở / Khoá trực tiếp khoá học cho học viên
  app.post('/api/admin/toggle-course', (req, res) => {
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    const courseKey = String(req.body?.courseKey || 'magic-sounds') as
      | 'magic-sounds'
      | 'sound-code'
      | 'tune-in'
      | 'sound-to-speech';
    const unlocked = Boolean(req.body?.unlocked);

    const users = readUsersDb();
    const user = users.find((u) => u.email.toLowerCase() === email);
    if (!user) {
      res.status(404).json({ error: 'Không tìm thấy học viên với email này.' });
      return;
    }

    ensureUserDefaults(user);
    user.unlockedCourses![courseKey] = unlocked;
    writeUsersDb(users);

    res.json({
      ok: true,
      unlockedCourses: user.unlockedCourses,
    });
  });

  // 1b-2. Tune In Lồng Tiếng (Lưu & tải các bản lồng tiếng từng câu vào tài khoản học viên)
  interface StoredDubbingSegmentRecord {
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

  const dubbingsDbPath = path.resolve(__dirname, 'public/user-dubbings-db.json');
  const dubbingAudioDir = path.resolve(__dirname, 'public/dubbing-audio');

  function readDubbingsDb(): StoredDubbingSegmentRecord[] {
    try {
      if (fs.existsSync(dubbingsDbPath)) {
        const raw = fs.readFileSync(dubbingsDbPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  }

  function writeDubbingsDb(records: StoredDubbingSegmentRecord[]): void {
    try {
      fs.mkdirSync(path.dirname(dubbingsDbPath), { recursive: true });
      fs.writeFileSync(dubbingsDbPath, JSON.stringify(records, null, 2), 'utf-8');
    } catch {
      // ignore
    }
  }

  app.get('/api/dubbing/list', (req, res) => {
    const email = String(req.query?.email || '')
      .trim()
      .toLowerCase();
    const username = String(req.query?.username || '')
      .trim()
      .toLowerCase();

    if (!email && !username) {
      res.json({ ok: true, records: [], audioMap: {} });
      return;
    }

    const all = readDubbingsDb();
    const matched = all
      .filter((r) => {
        if (email && r.email.toLowerCase() === email) return true;
        if (!email && username && r.username.toLowerCase() === username) return true;
        return false;
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);

    const audioMap: Record<string, string> = {};
    for (const item of matched) {
      if (item.recordKey && item.audioUrl) {
        audioMap[item.recordKey] = item.audioUrl;
      }
    }

    res.json({
      ok: true,
      records: matched,
      audioMap,
    });
  });

  app.post('/api/dubbing/save-segment', (req, res) => {
    try {
      const email = String(req.body?.email || '')
        .trim()
        .toLowerCase();
      const username = String(req.body?.username || '').trim();
      const recordKey = String(req.body?.recordKey || '').trim();
      const audioDataUrl = String(req.body?.audioDataUrl || '').trim();

      if (!email && !username) {
        res.status(401).json({
          error: 'Vui lòng đăng nhập tài khoản để lưu bài lồng tiếng.',
        });
        return;
      }

      if (!recordKey || !audioDataUrl) {
        res.status(400).json({
          error: 'Thiếu dữ liệu bản thu âm lồng tiếng.',
        });
        return;
      }

      const match = audioDataUrl.match(
        /^data:(audio\/[a-zA-Z0-9+.-]+)(?:;[^,]*)?;base64,(.+)$/
      );
      let finalAudioUrl = audioDataUrl;

      if (match) {
        const mimeType = match[1].toLowerCase();
        const base64Data = match[2];
        const ext = mimeType.includes('mp4') || mimeType.includes('m4a')
          ? 'm4a'
          : mimeType.includes('ogg')
          ? 'ogg'
          : mimeType.includes('wav')
          ? 'wav'
          : 'webm';
        const safeUser = (email || username)
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .slice(0, 40);
        const safeKey = recordKey.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60);
        const fileName = `${safeUser}_${safeKey}_${Date.now()}.${ext}`;

        fs.mkdirSync(dubbingAudioDir, { recursive: true });
        const filePath = path.join(dubbingAudioDir, fileName);
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        finalAudioUrl = `/dubbing-audio/${fileName}`;
      }

      const videoId = String(req.body?.videoId || '').trim();
      const videoTitle = String(req.body?.videoTitle || 'Bài lồng tiếng').trim();
      const clusterId = String(req.body?.clusterId || '').trim();
      const clusterName = String(req.body?.clusterName || 'Tune In - Lồng Tiếng').trim();
      const segmentId = String(req.body?.segmentId || recordKey).trim();
      const segmentIndex = Math.max(1, Number(req.body?.segmentIndex || 1));
      const totalSegments = Math.max(1, Number(req.body?.totalSegments || 1));
      const sentenceText = String(req.body?.sentenceText || '').trim();
      const startTime = Number(req.body?.startTime || 0);
      const endTime = Number(req.body?.endTime || 0);

      const all = readDubbingsDb();
      const existingIdx = all.findIndex(
        (r) =>
          r.recordKey === recordKey &&
          ((email && r.email.toLowerCase() === email) ||
            (!email && username && r.username.toLowerCase() === username.toLowerCase()))
      );

      const newEntry: StoredDubbingSegmentRecord = {
        id:
          existingIdx >= 0
            ? all[existingIdx].id
            : `dub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        email: email || `${username.toLowerCase()}@local`,
        username: username || email.split('@')[0] || 'Học viên',
        recordKey,
        videoId,
        videoTitle,
        clusterId,
        clusterName,
        segmentId,
        segmentIndex,
        totalSegments,
        sentenceText,
        startTime,
        endTime,
        audioUrl: finalAudioUrl,
        updatedAt: Date.now(),
      };

      if (existingIdx >= 0) {
        all[existingIdx] = newEntry;
      } else {
        all.push(newEntry);
      }
      writeDubbingsDb(all);

      // Đồng thời ghi nhận vào tiến trình tài khoản học viên
      const users = readUsersDb();
      let user = users.find(
        (u) =>
          (email && u.email.toLowerCase() === email) ||
          (!email && username && u.username.toLowerCase() === username.toLowerCase())
      );
      if (!user && email) {
        user = ensureUserDefaults({
          username: username || email.split('@')[0] || 'Học viên',
          email,
          password: '',
          verified: true,
          confirmToken: 'SYNC',
          createdAt: Date.now(),
          unlockedCourses: createDefaultUnlockedCourses(),
          progress: createDefaultProgress(),
        });
        users.push(user);
      }
      if (user) {
        ensureUserDefaults(user);
        if (existingIdx < 0) {
          user.progress!.tuneInCompletedCount =
            (user.progress!.tuneInCompletedCount || 0) + 1;
        }
        user.progress!.lastStudiedItem =
          `Lồng tiếng: ${videoTitle} (Câu ${segmentIndex}/${totalSegments})`.slice(
            0,
            200
          );
        user.progress!.lastActiveAt = Date.now();
        writeUsersDb(users);
      }

      res.json({
        ok: true,
        record: newEntry,
      });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.post('/api/dubbing/delete-segment', (req, res) => {
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    const username = String(req.body?.username || '')
      .trim()
      .toLowerCase();
    const recordKey = String(req.body?.recordKey || '').trim();

    if (!recordKey || (!email && !username)) {
      res.status(400).json({ error: 'Thiếu thông tin bản lồng tiếng cần xoá.' });
      return;
    }

    const all = readDubbingsDb();
    const filtered = all.filter(
      (r) =>
        !(
          r.recordKey === recordKey &&
          ((email && r.email.toLowerCase() === email) ||
            (!email && username && r.username.toLowerCase() === username))
        )
    );
    writeDubbingsDb(filtered);
    res.json({ ok: true });
  });

  // 1c. Tune In Nghe Ngấm - Danh sách các ô Kênh YouTube
  const youtubeChannelsFilePath = path.resolve(
    __dirname,
    'public/tunein-youtube-channels.json'
  );

  app.get('/api/tunein/youtube-channels', (_req, res) => {
    try {
      if (fs.existsSync(youtubeChannelsFilePath)) {
        const raw = fs.readFileSync(youtubeChannelsFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          res.json({ ok: true, channels: parsed });
          return;
        }
      }
    } catch {
      // ignore
    }
    res.json({ ok: true, channels: null });
  });

  app.post('/api/tunein/youtube-channels', (req, res) => {
    try {
      const channels = req.body?.channels;
      if (!Array.isArray(channels)) {
        res.status(400).json({ error: 'Invalid channels array' });
        return;
      }
      fs.mkdirSync(path.dirname(youtubeChannelsFilePath), { recursive: true });
      fs.writeFileSync(
        youtubeChannelsFilePath,
        JSON.stringify(channels, null, 2),
        'utf-8'
      );
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  // Hỗ trợ tự động lấy Uploads Playlist ID (UU...) hoặc Video ID từ link kênh YouTube (@Handle / channel)
  app.post('/api/tunein/resolve-youtube', async (req, res) => {
    try {
      const rawUrl = String(req.body?.url || '').trim();
      if (!rawUrl) {
        res.json({ ok: false });
        return;
      }
      const response = await fetch(rawUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      const html = await response.text();
      // Tìm channelId dạng UC... trong mã nguồn trang kênh YouTube
      const channelIdMatch =
        html.match(/"externalId":"(UC[a-zA-Z0-9_-]{22})"/) ||
        html.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/) ||
        html.match(/channel\/(UC[a-zA-Z0-9_-]{22})/);

      // Tìm videoIds nổi bật trên kênh
      const videoIdMatches = Array.from(
        html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)
      ).map((m) => m[1]);
      const uniqueVideoIds = Array.from(new Set(videoIdMatches)).slice(0, 12);

      // Tìm tiêu đề kênh và avatar/banner nếu có
      const titleMatch =
        html.match(/<meta property="og:title" content="([^"]+)"/) ||
        html.match(/<title>([^<]+)<\/title>/);
      const imageMatch = html.match(
        /<meta property="og:image" content="([^"]+)"/
      );

      const channelId = channelIdMatch ? channelIdMatch[1] : '';
      const uploadsPlaylistId = channelId
        ? 'UU' + channelId.slice(2)
        : '';

      res.json({
        ok: true,
        channelId,
        uploadsPlaylistId,
        videoIds: uniqueVideoIds,
        channelTitle: titleMatch
          ? titleMatch[1].replace(/\s*-\s*YouTube$/i, '').trim()
          : '',
        thumbnailUrl: imageMatch ? imageMatch[1] : '',
      });
    } catch {
      res.json({ ok: false });
    }
  });

  // 1c. Lấy danh sách kho video đầy đủ (hoặc tìm kiếm video) CHỈ TRONG CÙNG 1 KÊNH YOUTUBE
  const ytChannelCacheDir = path.resolve(__dirname, '.youtube-channel-cache');
  fs.mkdirSync(ytChannelCacheDir, { recursive: true });

  interface ExtractedChannelVideo {
    videoId: string;
    title: string;
    duration?: string;
    publishedTime?: string;
  }

  function extractTextFromYtNode(node: any): string {
    if (!node) return '';
    if (typeof node === 'string') return node;
    if (typeof node.simpleText === 'string') return node.simpleText;
    if (Array.isArray(node.runs)) {
      return node.runs.map((r: any) => r?.text || '').join('');
    }
    return '';
  }

  function extractVideosFromYtHtml(html: string): ExtractedChannelVideo[] {
    const results: ExtractedChannelVideo[] = [];
    const seen = new Set<string>();

    const addVideo = (
      videoId: string,
      title: string,
      duration?: string,
      publishedTime?: string
    ) => {
      const cleanId = (videoId || '').trim();
      if (!/^[a-zA-Z0-9_-]{11}$/.test(cleanId) || seen.has(cleanId)) return;
      seen.add(cleanId);
      results.push({
        videoId: cleanId,
        title: (title || '').trim(),
        duration: (duration || '').trim() || undefined,
        publishedTime: (publishedTime || '').trim() || undefined,
      });
    };

    // 1. Parse ytInitialData JSON if present
    const marker = 'var ytInitialData = ';
    const startIdx = html.indexOf(marker);
    if (startIdx !== -1) {
      const jsonStart = startIdx + marker.length;
      const scriptEnd = html.indexOf(';</script>', jsonStart);
      if (scriptEnd !== -1) {
        const rawJson = html.slice(jsonStart, scriptEnd).trim();
        try {
          const data = JSON.parse(rawJson);
          const walk = (obj: any) => {
            if (!obj || typeof obj !== 'object') return;
            const vr =
              obj.videoRenderer ||
              obj.gridVideoRenderer ||
              obj.playlistVideoRenderer ||
              obj.compactVideoRenderer;
            if (vr && typeof vr.videoId === 'string') {
              const title =
                extractTextFromYtNode(vr.title) ||
                extractTextFromYtNode(vr.headline);
              const duration =
                extractTextFromYtNode(vr.lengthText) ||
                extractTextFromYtNode(
                  vr.thumbnailOverlays?.[0]
                    ?.thumbnailOverlayTimeStatusRenderer?.text
                );
              const publishedTime = extractTextFromYtNode(
                vr.publishedTimeText
              );
              addVideo(vr.videoId, title, duration, publishedTime);
            }
            if (Array.isArray(obj)) {
              for (const item of obj) walk(item);
            } else {
              for (const k of Object.keys(obj)) {
                walk(obj[k]);
              }
            }
          };
          walk(data);
        } catch {
          // fallback below
        }
      }
    }

    // 2. Regex fallback if needed
    if (results.length < 10) {
      const regex =
        /"videoRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})"[\s\S]{0,600}?"title":\{"runs":\[\{"text":"([^"]+)"/g;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(html)) !== null) {
        addVideo(match[1], match[2].replace(/\\u0026/g, '&'));
      }
      const idMatches = Array.from(
        html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)
      ).map((m) => m[1]);
      for (const vid of idMatches) {
        addVideo(vid, '');
      }
    }

    return results;
  }

  app.post('/api/tunein/channel-videos', async (req, res) => {
    try {
      const rawUrl = String(req.body?.channelUrl || '').trim().replace(/\/+$/, '');
      const searchQuery = String(req.body?.searchQuery || '').trim();
      if (!rawUrl) {
        res.json({ ok: false, videos: [] });
        return;
      }

      const cacheKey = crypto
        .createHash('sha256')
        .update(`v1|${rawUrl}|${searchQuery.toLowerCase()}`)
        .digest('hex')
        .slice(0, 32);
      const cacheFile = path.join(ytChannelCacheDir, `${cacheKey}.json`);

      if (fs.existsSync(cacheFile)) {
        try {
          const stat = fs.statSync(cacheFile);
          // Cache valid for 6 hours
          if (Date.now() - stat.mtimeMs < 6 * 3600 * 1000) {
            const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
            if (Array.isArray(cached?.videos) && cached.videos.length > 0) {
              res.json({ ok: true, ...cached });
              return;
            }
          }
        } catch {
          // ignore
        }
      }

      const headers = {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      };

      const targetUrls = searchQuery
        ? [`${rawUrl}/search?query=${encodeURIComponent(searchQuery)}`]
        : [`${rawUrl}/videos`, `${rawUrl}/streams`];

      const htmlPages = await Promise.all(
        targetUrls.map((u) =>
          fetch(u, { headers })
            .then((r) => (r.ok ? r.text() : ''))
            .catch(() => '')
        )
      );

      let channelId = '';
      const mergedVideos: ExtractedChannelVideo[] = [];
      const seenIds = new Set<string>();

      for (const html of htmlPages) {
        if (!html) continue;
        if (!channelId) {
          const cidMatch =
            html.match(/"externalId":"(UC[a-zA-Z0-9_-]{22})"/) ||
            html.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/) ||
            html.match(/channel\/(UC[a-zA-Z0-9_-]{22})/);
          if (cidMatch) channelId = cidMatch[1];
        }
        const extracted = extractVideosFromYtHtml(html);
        for (const v of extracted) {
          if (!seenIds.has(v.videoId)) {
            seenIds.add(v.videoId);
            mergedVideos.push(v);
          }
        }
      }

      const uploadsPlaylistId = channelId ? 'UU' + channelId.slice(2) : '';
      const payload = {
        channelId,
        uploadsPlaylistId,
        videos: mergedVideos.slice(0, 80),
      };

      if (payload.videos.length > 0) {
        try {
          fs.writeFileSync(cacheFile, JSON.stringify(payload), 'utf-8');
        } catch {
          // ignore
        }
      }

      res.json({ ok: true, ...payload });
    } catch {
      res.json({ ok: false, videos: [] });
    }
  });

  // 2. Video Shadowing Speech-to-Text Transcription API (with disk cache & multi-model fallback)
  const transcriptCacheDir = path.resolve(__dirname, '.transcript-cache');
  fs.mkdirSync(transcriptCacheDir, { recursive: true });

  app.post('/api/shadow/transcribe-segments', async (req, res) => {
    try {
      const title: string = req.body?.title || 'English Shadowing Video';
      const segments: SegmentAudioInput[] = Array.isArray(req.body?.segments)
        ? req.body.segments
        : [];

      if (segments.length === 0) {
        res.json({ transcripts: [] });
        return;
      }

      // Check segment-level disk cache first so already-transcribed segments never hit Gemini API again
      const allTranscripts: TranscribedSegmentOutput[] = [];
      const uncachedSegments: Array<{ seg: SegmentAudioInput; cacheFile: string }> = [];

      for (const seg of segments) {
        const hash = crypto
          .createHash('sha256')
          .update(`${title}|${seg.startTime.toFixed(1)}|${seg.endTime.toFixed(1)}|${(seg.wavBase64 || '').slice(0, 4096)}`)
          .digest('hex')
          .slice(0, 40);
        const cacheFile = path.join(transcriptCacheDir, `${hash}.json`);
        if (fs.existsSync(cacheFile)) {
          try {
            const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
            if (typeof cached?.text === 'string' && cached.text.trim().length > 0) {
              allTranscripts.push({
                index: seg.index,
                text: cached.text.trim(),
              });
              continue;
            }
          } catch {
            // Ignore corrupt cache file
          }
        }
        uncachedSegments.push({ seg, cacheFile });
      }

      if (uncachedSegments.length === 0) {
        res.json({ transcripts: allTranscripts });
        return;
      }

      const ai = getGenAIClient();
      const batchSize = 20;

      for (let i = 0; i < uncachedSegments.length; i += batchSize) {
        const batchItems = uncachedSegments.slice(i, i + batchSize);
        const batch = batchItems.map((item) => item.seg);
        const expectedIndices = batch.map((b) => b.index);

        const parts: Array<
          { text: string } | { inlineData: { mimeType: string; data: string } }
        > = [
          {
            text:
              `You are an accurate speech-to-text transcriber for an English phonics, storytelling, and tongue-twister learning application.\n` +
              `Video title: "${title}".\n` +
              `Below are ${batch.length} sequential spoken audio segments extracted from the video.\n` +
              `Listen carefully to each audio segment and transcribe the EXACT spoken words/sentence.\n` +
              `Important rules:\n` +
              `1. Output ONLY the actual spoken words in the audio clip with proper capitalization and punctuation.\n` +
              `2. NEVER output timestamps, durations, or placeholder labels like "Câu 1" or "(0.5s - 2.5s)".\n` +
              `3. Ignore background music, intro jingles, or sound effects.\n` +
              `4. Because these clips are consecutive sentences from the same video, if a boundary word slightly overlaps between two adjacent clips, assign each complete spoken sentence cleanly to its main segment without duplicating boundary words.\n` +
              `5. If a clip contains ONLY instrumental music or silence with no spoken words at all, return "" (empty string) for its text.\n` +
              `6. Return a JSON array of objects: [{ "index": <number>, "text": "<exact spoken sentence>" }].`,
          },
        ];

        for (const seg of batch) {
          parts.push({
            text: `Segment index=${seg.index} (${seg.startTime.toFixed(1)}s - ${seg.endTime.toFixed(1)}s):`,
          });
          parts.push({
            inlineData: {
              mimeType: 'audio/wav',
              data: seg.wavBase64,
            },
          });
        }

        const batchResult = await transcribeBatchWithGemini(
          ai,
          parts,
          expectedIndices
        );

        for (const resItem of batchResult) {
          allTranscripts.push(resItem);
          const matched = batchItems.find((b) => b.seg.index === resItem.index);
          if (matched && resItem.text && resItem.text.trim().length > 0) {
            try {
              fs.writeFileSync(
                matched.cacheFile,
                JSON.stringify({ text: resItem.text.trim() }),
                'utf-8'
              );
            } catch {
              // Ignore cache write errors
            }
          }
        }
      }

      res.json({ transcripts: allTranscripts });
    } catch {
      res.json({ transcripts: [] });
    }
  });

  // 3. Youthful, Crystal-Clear Natural American Voice TTS API (Leda with multi-model fallback & disk cache)
  const ttsCacheDir = path.resolve(__dirname, '.tts-cache');
  fs.mkdirSync(ttsCacheDir, { recursive: true });

  function wrapPcm24kMonoToWav(pcmBuffer: Buffer): Buffer {
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const dataSize = pcmBuffer.length;
    const header = Buffer.alloc(44);

    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataSize, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // Subchunk1Size (PCM)
    header.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(byteRate, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(bitsPerSample, 34);
    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);

    return Buffer.concat([header, pcmBuffer]);
  }

  let modelRoundRobin = 0;

  app.post('/api/tts', async (req, res) => {
    try {
      const text = String(req.body?.text || '').trim();
      if (!text) {
        res.status(400).json({ error: 'Missing text' });
        return;
      }

      // Dùng chung 1 giọng nữ Mỹ trẻ trung, trong trẻo, tự nhiên (Leda) cho toàn bộ bài nói ngắn
      const voiceName = 'Leda';

      const cacheKey = Buffer.from(`v6_leda:${text}`)
        .toString('base64')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .slice(0, 96);
      const cacheFile = path.join(ttsCacheDir, `${cacheKey}.wav`);

      if (fs.existsSync(cacheFile)) {
        const cachedBase64 = fs.readFileSync(cacheFile).toString('base64');
        res.json({ audioDataUrl: `data:audio/wav;base64,${cachedBase64}` });
        return;
      }

      const ai = getGenAIClient();
      const baseModels = [
        'gemini-3.8-flash-lite-tts',
        'gemini-2.5-flash-preview-tts',
        'gemini-3.8-flash-tts',
      ];
      // Chia tải luân phiên giữa 3 model TTS để không bao giờ chạm giới hạn RPM
      const startIdx = modelRoundRobin++ % baseModels.length;
      const orderedModels = [
        ...baseModels.slice(startIdx),
        ...baseModels.slice(0, startIdx),
      ];

      let wavBuffer: Buffer | null = null;

      for (const ttsModel of orderedModels) {
        try {
          const response = await ai.models.generateContent({
            model: ttsModel,
            contents: [
              {
                role: 'user',
                parts: [{ text }],
              },
            ],
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName },
                },
              },
            },
          });

          const inlineData =
            response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
          if (inlineData?.data) {
            const rawBuf = Buffer.from(inlineData.data, 'base64');
            const mime = (inlineData.mimeType || '').toLowerCase();
            if (
              mime.includes('l16') ||
              mime.includes('pcm') ||
              rawBuf.slice(0, 4).toString('ascii') !== 'RIFF'
            ) {
              wavBuffer = wrapPcm24kMonoToWav(rawBuf);
            } else {
              wavBuffer = rawBuf;
            }
            break;
          }
        } catch {
          // Thử model tiếp theo trong danh sách
        }
      }

      if (wavBuffer) {
        try {
          fs.writeFileSync(cacheFile, wavBuffer);
        } catch {
          // Ignore cache write errors
        }
        res.json({
          audioDataUrl: `data:audio/wav;base64,${wavBuffer.toString('base64')}`,
        });
        return;
      }

      // Dự phòng mạng (Google US English) để không bao giờ bị rơi về giọng máy local của trình duyệt
      const gUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        text
      )}&tl=en-US&client=tw-ob`;
      const gResp = await fetch(gUrl);
      if (gResp.ok) {
        const arrBuf = await gResp.arrayBuffer();
        const mp3Base64 = Buffer.from(arrBuf).toString('base64');
        res.json({ audioDataUrl: `data:audio/mpeg;base64,${mp3Base64}` });
        return;
      }

      throw new Error('TTS generation failed');
    } catch (err) {
      console.warn('TTS API fallback error:', err);
      res.status(500).json({
        error: err instanceof Error ? err.message : 'TTS generation failed',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
