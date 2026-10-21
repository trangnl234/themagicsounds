// Audio Player supporting both Custom Uploaded Audio (MP3/WAV/recordings) with Max Volume Boost and Voice Fallback

import { getCachedAudio, getCachedBlendingAudio, getDefaultPhonicsAudio } from './audioStorage';

type ToastCallback = (info: {
  sound: string;
  ipa?: string;
  word?: string;
  subtext?: string;
  active: boolean;
  isCustomAudio?: boolean;
}) => void;

let toastListener: ToastCallback | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeAudioElement: HTMLAudioElement | null = null;
let cachedAiVoice: SpeechSynthesisVoice | null = null;

export function registerToastListener(cb: ToastCallback) {
  toastListener = cb;
}

export function unregisterToastListener() {
  toastListener = null;
}

// Sound effect using Web Audio API for celebratory chime upon completing the drag blend
export function playBlendSuccessChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Chime notes: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz), C6 (1046.5Hz)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.001, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.4);
    });
  } catch (e) {
    console.warn('AudioContext not available for chime:', e);
  }
}

export interface BestVoiceInfo {
  voice: SpeechSynthesisVoice | null;
  lang: string;
}

export function getBestVoiceInfo(): BestVoiceInfo {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return { voice: null, lang: 'en-US' };
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) {
    return { voice: null, lang: 'en-US' };
  }

  const isUs = (v: SpeechSynthesisVoice) => {
    const l = (v.lang || '').toLowerCase().replace(/_/g, '-');
    const n = (v.name || '').toLowerCase();
    return (
      l === 'en-us' ||
      l.startsWith('en-us') ||
      n.includes('united states') ||
      n.includes('us english') ||
      n.includes('(us)') ||
      n.includes('american') ||
      n.includes('samantha') ||
      n.includes('ava') ||
      n.includes('allison') ||
      n.includes('jenny') ||
      n.includes('aria')
    );
  };

  const isFemale = (v: SpeechSynthesisVoice) => {
    const n = (v.name || '').toLowerCase();
    const femaleNames = [
      'female',
      'samantha',
      'ava',
      'allison',
      'jenny',
      'aria',
      'ana',
      'michelle',
      'emma',
      'zira',
      'susan',
      'victoria',
      'karen',
      'libby',
      'sonia',
      'serena'
    ];
    const maleNames = ['male', 'david', 'mark', 'guy', 'christopher', 'eric', 'roger', 'steffan', 'daniel', 'alex'];
    if (femaleNames.some((k) => n.includes(k))) return true;
    if (maleNames.some((k) => n.includes(k))) return false;
    if ((v as any).gender === 'female') return true;
    if ((v as any).gender === 'male') return false;
    return false;
  };

  const isMale = (v: SpeechSynthesisVoice) => {
    const n = (v.name || '').toLowerCase();
    const maleNames = ['male', 'david', 'mark', 'guy', 'christopher', 'eric', 'roger', 'steffan', 'daniel', 'alex'];
    return maleNames.some((k) => n.includes(k)) || (v as any).gender === 'male';
  };

  // 1. Youthful, bright, natural US Female voices (Microsoft Ana/Aria/Ava/Jenny/Emma Natural, Apple Ava/Allison/Nicky/Samantha)
  const youthfulNames = ['ana', 'ava', 'aria', 'jenny', 'emma', 'allison', 'nicky', 'samantha', 'michelle'];
  const usYouthfulNatural = voices.find((v) => {
    const n = (v.name || '').toLowerCase();
    return (
      isUs(v) &&
      youthfulNames.some((yn) => n.includes(yn)) &&
      (n.includes('natural') || n.includes('neural') || n.includes('online') || n.includes('enhanced') || n.includes('premium'))
    );
  });
  if (usYouthfulNatural) return { voice: usYouthfulNatural, lang: 'en-US' };

  // 2. Apple/Microsoft youthful female voices (Samantha, Ava, Allison, Nicky, Ana, Aria, Jenny)
  const usYouthful = voices.find((v) => {
    const n = (v.name || '').toLowerCase();
    return isUs(v) && youthfulNames.some((yn) => n.includes(yn));
  });
  if (usYouthful) return { voice: usYouthful, lang: 'en-US' };

  // 3. Any US Female Natural / Neural / Online voice
  const usFemaleNatural = voices.find((v) => {
    const n = (v.name || '').toLowerCase();
    return (
      isUs(v) &&
      isFemale(v) &&
      (n.includes('natural') || n.includes('neural') || n.includes('online'))
    );
  });
  if (usFemaleNatural) return { voice: usFemaleNatural, lang: 'en-US' };

  // 4. Any explicit US Female voice
  const usFemale = voices.find((v) => isUs(v) && isFemale(v));
  if (usFemale) return { voice: usFemale, lang: 'en-US' };

  // 5. Any US voice that is NOT explicitly male (e.g., Google US English)
  const usNonMale = voices.find((v) => isUs(v) && !isMale(v));
  if (usNonMale) return { voice: usNonMale, lang: 'en-US' };

  // 6. Any US English voice
  const usVoice = voices.find((v) => isUs(v));
  if (usVoice) return { voice: usVoice, lang: 'en-US' };

  // 7. English Female Natural / Google
  const anyFemaleNatural = voices.find((v) => {
    const n = (v.name || '').toLowerCase();
    const l = (v.lang || '').toLowerCase();
    return l.startsWith('en') && isFemale(v) && (n.includes('natural') || n.includes('neural') || n.includes('google'));
  });
  if (anyFemaleNatural) return { voice: anyFemaleNatural, lang: 'en-US' };

  // 8. Any English Female voice
  const anyFemale = voices.find((v) => {
    const l = (v.lang || '').toLowerCase();
    return l.startsWith('en') && isFemale(v);
  });
  if (anyFemale) return { voice: anyFemale, lang: 'en-US' };

  // 9. Any English voice
  const anyEn = voices.find((v) => (v.lang || '').toLowerCase().startsWith('en'));
  if (anyEn) return { voice: anyEn, lang: 'en-US' };

  // 10. Default voice
  const defaultVoice = voices.find((v) => v.default) || voices[0];
  return { voice: defaultVoice || null, lang: 'en-US' };
}

export function getBestAiVoice(): SpeechSynthesisVoice | null {
  return getBestVoiceInfo().voice;
}

export const getBritishVoice = getBestAiVoice;

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  // Pre-load voices so they are ready on first user touch
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

let audioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new AudioCtx();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

/**
 * Phát audio thu âm / tải lên với ÂM LƯỢNG CỰC ĐẠI (Tối đa hóa qua Web Audio API GainNode + Compressor)
 * Tăng cường gain lên 2.8x kèm compressor chống vỡ tiếng, cho âm lượng to, vang và rõ nhất
 */
export function playMaxVolumeCustomAudio(
  audioDataOrUrl: string,
  onEnd?: () => void,
  onError?: () => void,
  durationFraction?: number,
  speed: number = 1.0,
  maxDurationMs?: number
): HTMLAudioElement {
  stopSpeaking();

  const audio = new Audio(audioDataOrUrl);
  audio.volume = 1.0;
  audio.playbackRate = speed;
  activeAudioElement = audio;

  try {
    const ctx = getAudioContext();
    if (ctx) {
      // Đảm bảo audio context được đánh thức khi có tương tác
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      // Tạo MediaElementSource và khuếch đại âm lượng lên mức to nhất
      const source = ctx.createMediaElementSource(audio);
      const gainNode = ctx.createGain();
      gainNode.gain.value = 2.8; // Khuếch đại tối đa (280% volume)

      // Compressor giữ âm thanh sắc nét, to đều và không bị rè/clipping
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-14, ctx.currentTime);
      compressor.knee.setValueAtTime(10, ctx.currentTime);
      compressor.ratio.setValueAtTime(8, ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, ctx.currentTime);
      compressor.release.setValueAtTime(0.25, ctx.currentTime);

      source.connect(gainNode);
      gainNode.connect(compressor);
      compressor.connect(ctx.destination);
    }
  } catch (e) {
    console.warn('AudioContext boost fallback:', e);
  }

  let hasFinished = false;
  let cutoffTimer: number | null = null;

  const finish = () => {
    if (hasFinished) return;
    hasFinished = true;
    if (cutoffTimer !== null) {
      window.clearTimeout(cutoffTimer);
      cutoffTimer = null;
    }
    audio.onended = null;
    audio.onerror = null;
    audio.ontimeupdate = null;
    try {
      audio.pause();
    } catch (_) {}
    if (activeAudioElement === audio) {
      activeAudioElement = null;
    }
    if (onEnd) onEnd();
  };

  audio.onended = finish;
  audio.onerror = () => {
    if (hasFinished) return;
    hasFinished = true;
    if (cutoffTimer !== null) {
      window.clearTimeout(cutoffTimer);
      cutoffTimer = null;
    }
    audio.onended = null;
    audio.onerror = null;
    audio.ontimeupdate = null;
    if (activeAudioElement === audio) {
      activeAudioElement = null;
    }
    if (onError) onError();
  };

  // Cắt tối đa độ trễ hoặc khoảng lặng đuôi khi ghép vần
  if (maxDurationMs && maxDurationMs > 0) {
    cutoffTimer = window.setTimeout(finish, maxDurationMs);
  } else if (durationFraction && durationFraction > 0 && durationFraction < 1) {
    const setupCutoff = () => {
      if (
        audio.duration &&
        Number.isFinite(audio.duration) &&
        audio.duration > 0 &&
        cutoffTimer === null &&
        !hasFinished
      ) {
        const rate = audio.playbackRate || 1.0;
        const cutMs = Math.max(70, (audio.duration / rate) * durationFraction * 1000);
        cutoffTimer = window.setTimeout(finish, cutMs);
      }
    };

    if (audio.readyState >= 1 && audio.duration && Number.isFinite(audio.duration)) {
      setupCutoff();
    } else {
      audio.addEventListener('loadedmetadata', setupCutoff, { once: true });
      audio.addEventListener('canplay', setupCutoff, { once: true });
    }

    audio.ontimeupdate = () => {
      if (
        audio.duration &&
        Number.isFinite(audio.duration) &&
        audio.currentTime >= audio.duration * durationFraction
      ) {
        finish();
      }
    };
  }

  audio.play().catch((err) => {
    console.warn('Play error:', err);
    if (!hasFinished) {
      hasFinished = true;
      if (cutoffTimer !== null) {
        window.clearTimeout(cutoffTimer);
        cutoffTimer = null;
      }
      activeAudioElement = null;
      if (onError) onError();
    }
  });

  return audio;
}

export function stopSpeaking() {
  activeTtsRequestId++;
  if (activeAudioElement) {
    activeAudioElement.pause();
    activeAudioElement.currentTime = 0;
    activeAudioElement = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  activeUtterance = null;
  if (toastListener) {
    toastListener({ sound: '', active: false });
  }
}

export function speakPhonicsSound(
  sound: string,
  ipa: string = '',
  word: string = '',
  customText?: string,
  onEnd?: () => void,
  soundId?: string
) {
  stopSpeaking();

  const idToLookup = soundId || sound;
  // Ưu tiên file giáo viên tự tải lên, sau đó tới file chuẩn Cô Trang có sẵn trong app
  const customAudio =
    getCachedAudio(idToLookup) ||
    getDefaultPhonicsAudio(idToLookup) ||
    getCachedAudio(sound) ||
    getDefaultPhonicsAudio(sound);

  // If custom teacher audio file is uploaded, play that at MAXIMUM volume!
  if (customAudio && customAudio.audioData) {
    if (toastListener) {
      toastListener({
        sound,
        ipa: ipa || `/${sound}/`,
        word: word || `Phonics Sound /${sound}/`,
        subtext: `🔊 Đang phát file thu âm (Âm lượng cực đại): ${customAudio.fileName}`,
        active: true,
        isCustomAudio: true
      });
    }

    playMaxVolumeCustomAudio(
      customAudio.audioData,
      onEnd,
      () => {
        fallbackTTS(sound, ipa, word, customText, onEnd);
      }
    );
    return;
  }

  // Fallback to TTS
  fallbackTTS(sound, ipa, word, customText, onEnd);
}

function fallbackTTS(
  sound: string,
  ipa: string,
  word: string,
  customText?: string,
  onEnd?: () => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not available');
    if (onEnd) onEnd();
    return;
  }

  if (toastListener) {
    toastListener({
      sound,
      ipa: ipa || `/${sound}/`,
      word: word || `Phonics Sound /${sound}/`,
      subtext: `Âm thanh mẫu chuẩn (hoặc bạn có thể tải file thu âm riêng)`,
      active: true,
      isCustomAudio: false
    });
  }

  const textToSay = customText || (word ? `${sound}, ${word}` : sound);
  const utterance = new SpeechSynthesisUtterance(textToSay);
  utterance.lang = 'en-US';
  utterance.rate = 0.85;
  utterance.pitch = 1.02;

  const voice = getBritishVoice();
  if (voice) utterance.voice = voice;

  utterance.onend = () => {
    activeUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    activeUtterance = null;
    if (onEnd) onEnd();
  };

  activeUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function playAudioUrl(url: string, onEnd?: () => void) {
  stopSpeaking();
  const audio = new Audio(url);
  activeAudioElement = audio;
  audio.onended = () => {
    activeAudioElement = null;
    if (onEnd) onEnd();
  };
  audio.onerror = () => {
    activeAudioElement = null;
    if (onEnd) onEnd();
  };
  audio.play();
}

// Ánh xạ âm thay thế và phụ âm đôi về âm gốc trong 42 âm để dùng chung file thu âm chuẩn của giáo viên
const ALT_PHONEME_TO_ROOT_SOUND: Record<string, string> = {
  // Set /ai/
  ay: 'ai',
  a_e: 'ai',
  'a-e': 'ai',
  // Set /ee/
  ea: 'ee',
  e_e: 'ee',
  'e-e': 'ee',
  y_ee: 'ee',
  // Set /ie/
  igh: 'ie',
  i_e: 'ie',
  'i-e': 'ie',
  y_ie: 'ie',
  // Set /oa/
  ow_oa: 'oa',
  o_e: 'oa',
  'o-e': 'oa',
  // Set /ue/
  ew: 'ue',
  u_e: 'ue',
  'u-e': 'ue',
  // Set /er/
  ir: 'er',
  ur: 'er',
  // Set /oi/ & /ou/
  oy: 'oi',
  ow_ou: 'ou',
  // Set /or/
  al: 'or',
  all: 'or',
  au: 'or',
  aw: 'or',
  // Soft c & Soft g
  soft_c: 's',
  ce: 's',
  ci: 's',
  cy: 's',
  soft_g: 'j',
  ge: 'j',
  gi: 'j',
  gy: 'j',
  dge: 'j',
  // ph & wh
  ph: 'f',
  wh: 'w',
  // Phụ âm đôi & âm câm
  ll: 'l',
  ff: 'f',
  ss: 's',
  zz: 'z',
  tt: 't',
  pp: 'p',
  nn: 'n',
  dd: 'd',
  bb: 'b',
  gg: 'g',
  rr: 'r',
  mm: 'm',
  tch: 'ch',
  ve: 'v',
  se: 's',
  ze: 'z',
  le: 'l',
  kn: 'n',
  wr: 'r',
};

export function speakPhoneme(
  phoneme: string,
  onEnd?: () => void,
  speed: number = 1.0,
  durationFraction?: number,
  skipCancel: boolean = false
) {
  if (!skipCancel) {
    stopSpeaking();
  }
  const clean = phoneme.toLowerCase().trim();
  const rootFallback = ALT_PHONEME_TO_ROOT_SOUND[clean];

  // Check if custom audio exists for this phoneme or its root phonics sound -> play with MAXIMUM volume boost!
  // Thứ tự: file tự tải (âm/âm gốc) -> file chuẩn Cô Trang (âm/âm gốc) -> giọng máy TTS
  const customAudio =
    getCachedAudio(clean) ||
    (rootFallback ? getCachedAudio(rootFallback) : undefined) ||
    getDefaultPhonicsAudio(clean) ||
    (rootFallback ? getDefaultPhonicsAudio(rootFallback) : undefined);
  if (customAudio && customAudio.audioData) {
    playMaxVolumeCustomAudio(
      customAudio.audioData,
      onEnd,
      () => {
        speakPhonemeTTS(clean, onEnd, speed, durationFraction);
      },
      durationFraction,
      speed
    );
    return;
  }

  speakPhonemeTTS(clean, onEnd, speed, durationFraction);
}

// Phonetic sounds mapping for Jolly Phonics sounds in TTS
const PHONIC_SOUND_MAP: Record<string, string> = {
  s: 's',
  a: 'a',
  t: 't',
  i: 'ih',
  p: 'p',
  n: 'n',
  c: 'k',
  k: 'k',
  ck: 'k',
  'c-k': 'k',
  'c/k': 'k',
  'c / k / ck': 'k',
  'c, k, ck': 'k',
  'c, k': 'k',
  e: 'eh',
  h: 'h',
  r: 'r',
  m: 'm',
  d: 'd',
  g: 'g',
  o: 'o',
  u: 'uh',
  l: 'l',
  f: 'f',
  b: 'b',
  ai: 'ay',
  ay: 'ay',
  a_e: 'ay',
  'a-e': 'ay',
  j: 'j',
  oa: 'oh',
  ow_oa: 'oh',
  o_e: 'oh',
  'o-e': 'oh',
  ie: 'eye',
  igh: 'eye',
  y_ie: 'eye',
  i_e: 'eye',
  'i-e': 'eye',
  ee: 'ee',
  ea: 'ee',
  e_e: 'ee',
  'e-e': 'ee',
  y_ee: 'ee',
  or: 'or',
  al: 'or',
  all: 'or',
  au: 'or',
  aw: 'or',
  z: 'z',
  w: 'w',
  wh: 'w',
  ng: 'ng',
  v: 'v',
  oo: 'oo',
  y: 'y',
  x: 'ks',
  ch: 'ch',
  tch: 'ch',
  sh: 'sh',
  th: 'th',
  qu: 'kw',
  ou: 'ow',
  ow: 'ow',
  ow_ou: 'ow',
  oi: 'oy',
  oy: 'oy',
  ue: 'you',
  ew: 'you',
  u_e: 'you',
  'u-e': 'you',
  er: 'er',
  ir: 'er',
  ur: 'er',
  ar: 'ar',
  ph: 'f',
  soft_c: 's',
  ce: 's',
  ci: 's',
  cy: 's',
  soft_g: 'j',
  ge: 'j',
  gi: 'j',
  gy: 'j',
  dge: 'j',
  air: 'air',
  are: 'air',
  ear_air: 'air',
  ear: 'ear',
  eer: 'ear',
  ere: 'ear',
  ll: 'l',
  ff: 'f',
  ss: 's',
  zz: 'z',
  tt: 't',
  pp: 'p',
  nn: 'n',
  dd: 'd',
  bb: 'b',
  gg: 'g',
  rr: 'r',
  mm: 'm',
  ve: 'v',
  se: 's',
  ze: 'z',
  le: 'l',
  kn: 'n',
  wr: 'r',
};

function speakPhonemeTTS(
  phoneme: string,
  onEnd?: () => void,
  speed: number = 1.0,
  durationFraction?: number
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  } catch (_) {}

  const textToSay = PHONIC_SOUND_MAP[phoneme] || phoneme;
  const utterance = new SpeechSynthesisUtterance(textToSay);
  const voiceInfo = getBestVoiceInfo();
  if (voiceInfo.voice) {
    utterance.voice = voiceInfo.voice;
  }
  utterance.lang = voiceInfo.lang || 'en-US';
  utterance.rate = speed; // Tốc độ đọc 1.0
  utterance.pitch = 1.02;
  utterance.volume = 1.0;

  let hasEnded = false;
  let cutoffTimer: number | null = null;

  const finish = () => {
    if (hasEnded) return;
    hasEnded = true;
    if (cutoffTimer !== null) {
      window.clearTimeout(cutoffTimer);
      cutoffTimer = null;
    }
    if (activeUtterance === utterance) {
      activeUtterance = null;
    }
    if (onEnd) onEnd();
  };

  utterance.onend = finish;
  utterance.onerror = finish;

  // Nếu có truyền durationFraction < 1 thì mới ngắt sớm, còn mặc định đọc trọn vẹn 100% âm:
  if (durationFraction && durationFraction > 0 && durationFraction < 1) {
    const cutMs = Math.max(90, Math.round((500 / speed) * durationFraction));
    cutoffTimer = window.setTimeout(finish, cutMs);
  }

  activeUtterance = utterance;
  if (typeof window !== 'undefined') {
    (window as any).__activeUtterance = utterance;
  }

  try {
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('speakPhonemeTTS speak error:', err);
    finish();
  }
}

let activeSpeechUtterance: SpeechSynthesisUtterance | null = null;
let speechKeepAliveTimer: number | null = null;

// Phát âm toàn bộ từ bằng GIỌNG ĐỌC MỸ (US) TO, RÕ, CHUẨN XÁC VỚI ÂM LƯỢNG CỰC ĐẠI VÀ TỐC ĐỘ 1.0
export function speakWholeWordAi(
  word: string,
  onEnd?: () => void,
  playChime: boolean = true,
  speed: number = 1.0,
  suppressToast: boolean = false
) {
  const cleanWord = word.trim().toLowerCase();
  if (!cleanWord) {
    if (onEnd) onEnd();
    return;
  }

  // Phát tiếng chuông chúc mừng vui tai
  if (playChime) {
    try {
      playBlendSuccessChime();
    } catch (e) {
      console.warn('Chime error:', e);
    }
  }

  // Dừng file audio thu âm trước đó nếu có
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch (_) {}
    activeAudioElement = null;
  }

  if (toastListener && !suppressToast) {
    toastListener({
      sound: cleanWord,
      ipa: `/${cleanWord}/`,
      word: `Từ "${word}"`,
      subtext: '🔊 Giọng đọc Mỹ (US) phát âm chuẩn trọn vẹn',
      active: true,
      isCustomAudio: false,
    });
  }

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser');
    if (onEnd) onEnd();
    return;
  }

  const startSpeak = () => {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(cleanWord);
      const voiceInfo = getBestVoiceInfo();
      if (voiceInfo.voice) {
        utterance.voice = voiceInfo.voice;
      }
      utterance.lang = voiceInfo.lang || 'en-US';
      utterance.volume = 1.0; // Âm lượng to nhất
      utterance.rate = speed;
      utterance.pitch = 1.02;

      let hasFinished = false;
      const handleFinish = () => {
        if (hasFinished) return;
        hasFinished = true;
        if (speechKeepAliveTimer) {
          window.clearInterval(speechKeepAliveTimer);
          speechKeepAliveTimer = null;
        }
        activeSpeechUtterance = null;
        if (typeof window !== 'undefined') {
          (window as any).__activeUtterance = null;
        }
        if (onEnd) onEnd();
      };

      utterance.onend = handleFinish;
      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        handleFinish();
      };

      activeSpeechUtterance = utterance;
      if (typeof window !== 'undefined') {
        (window as any).__activeUtterance = utterance;
      }

      // Keep-alive chống ngắt tiếng của Chrome trên các từ dài
      if (speechKeepAliveTimer) {
        window.clearInterval(speechKeepAliveTimer);
      }
      speechKeepAliveTimer = window.setInterval(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else {
          if (speechKeepAliveTimer) {
            window.clearInterval(speechKeepAliveTimer);
            speechKeepAliveTimer = null;
          }
        }
      }, 2500);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Fatal SpeechSynthesis error:', err);
      if (onEnd) onEnd();
    }
  };

  // Nếu âm thanh trước đã kết thúc trọn vẹn, phát ngay lập tức từ hoàn chỉnh không gián đoạn
  if (activeUtterance !== null) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
    window.setTimeout(startSpeak, 8);
  } else {
    startSpeak();
  }
}

/**
 * TỰ ĐỘNG PHÁT ÂM KHI BẤM VÀO TỪ / MẶT CHỮ:
 * Ưu tiên phát FILE THU ÂM RIÊNG ĐƯỢC KHUẾCH ĐẠI TỐI ĐA (Âm lượng to nhất).
 * Nếu chưa có file thu âm, phát âm thanh chuẩn của từ.
 */
export function playCustomOrStandardWordAudio(
  soundId: string,
  word: string,
  onEnd?: () => void,
  playChime: boolean = true
) {
  stopSpeaking();
  const cleanWord = word.trim().toLowerCase();
  if (!cleanWord) {
    if (onEnd) onEnd();
    return;
  }

  const customAudio = getCachedBlendingAudio(soundId, cleanWord);
  if (customAudio && customAudio.audioData) {
    if (playChime) {
      playBlendSuccessChime();
    }
    if (toastListener) {
      toastListener({
        sound: cleanWord,
        ipa: `/${cleanWord}/`,
        word: `Từ "${cleanWord}"`,
        subtext: `🔊 Đang phát audio thu âm (Âm lượng cực đại): ${customAudio.fileName}`,
        active: true,
        isCustomAudio: true,
      });
    }

    playMaxVolumeCustomAudio(
      customAudio.audioData,
      onEnd,
      () => {
        speakWholeWordAi(cleanWord, onEnd, false, 1.0);
      },
      undefined,
      1.0
    );
    return;
  }

  // Nếu chưa có file thu âm riêng, phát âm thanh mẫu
  speakWholeWordAi(cleanWord, onEnd, playChime, 1.0);
}

export function speakWord(word: string, onEnd?: () => void, suppressToast: boolean = false) {
  speakWholeWordAi(word, onEnd, false, 1.0, suppressToast);
}

const ttsMemoryCache = new Map<string, string>();
let activeTtsRequestId = 0;

export function speakSentence(
  sentence: string,
  labelOrRate: string | number = 'Đọc câu mẫu',
  onEnd?: () => void,
  rateOrSpeaker: number = 0.85,
  suppressToast: boolean = false,
  speakerIndexArg: number = 0
) {
  if (typeof window === 'undefined') {
    if (onEnd) onEnd();
    return;
  }

  const cleanText = sentence.trim();
  if (!cleanText) {
    if (onEnd) onEnd();
    return;
  }

  const resolvedRate = typeof labelOrRate === 'number' ? labelOrRate : rateOrSpeaker;
  const resolvedLabel = typeof labelOrRate === 'string' ? labelOrRate : 'Đọc câu mẫu';
  const resolvedSpeakerIdx =
    typeof labelOrRate === 'number' && rateOrSpeaker >= 1 && Number.isInteger(rateOrSpeaker)
      ? rateOrSpeaker
      : speakerIndexArg;
  const isSlow = resolvedRate <= 0.85;

  // Dừng file audio thu âm trước đó nếu đang phát
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch (_) {}
    activeAudioElement = null;
  }
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
  }

  const requestId = ++activeTtsRequestId;

  if (toastListener && !suppressToast) {
    toastListener({
      sound: '🔊',
      ipa: 'US Voice',
      word: resolvedLabel,
      subtext: cleanText,
      active: true,
      isCustomAudio: false,
    });
  }

  const voiceSlot = resolvedSpeakerIdx > 0 ? (resolvedSpeakerIdx - 1) % 2 : 0;

  const fallbackToBrowserSpeech = () => {
    if (requestId !== activeTtsRequestId) return;
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    const startSpeak = () => {
      if (requestId !== activeTtsRequestId) return;
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        const voices = window.speechSynthesis.getVoices();
        const usVoices = voices.filter((v) =>
          (v.lang || '').toLowerCase().replace(/_/g, '-').startsWith('en-us')
        );
        const voiceInfo = getBestVoiceInfo();
        if (voiceSlot === 1 && usVoices.length > 1) {
          utterance.voice = usVoices[1];
        } else if (voiceInfo.voice) {
          utterance.voice = voiceInfo.voice;
        }
        utterance.lang = voiceInfo.lang || 'en-US';
        utterance.volume = 1.0;
        utterance.rate = Math.max(0.9, resolvedRate);
        utterance.pitch = 1.0;

        let hasFinished = false;
        const wordCount = cleanText.split(/\s+/).length;
        const maxWaitMs = Math.max(2800, Math.round((wordCount * 520) / Math.max(0.6, utterance.rate)) + 900);

        const handleFinish = () => {
          if (hasFinished) return;
          hasFinished = true;
          window.clearTimeout(watchdogTimer);
          if (speechKeepAliveTimer) {
            window.clearInterval(speechKeepAliveTimer);
            speechKeepAliveTimer = null;
          }
          if (activeUtterance === utterance) {
            activeUtterance = null;
          }
          activeSpeechUtterance = null;
          if (typeof window !== 'undefined') {
            (window as any).__activeUtterance = null;
          }
          if (onEnd) onEnd();
        };

        const watchdogTimer = window.setTimeout(handleFinish, maxWaitMs);

        utterance.onend = handleFinish;
        utterance.onerror = () => {
          handleFinish();
        };

        activeUtterance = utterance;
        activeSpeechUtterance = utterance;
        if (typeof window !== 'undefined') {
          (window as any).__activeUtterance = utterance;
        }

        if (speechKeepAliveTimer) {
          window.clearInterval(speechKeepAliveTimer);
        }
        speechKeepAliveTimer = window.setInterval(() => {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          } else if (speechKeepAliveTimer) {
            window.clearInterval(speechKeepAliveTimer);
            speechKeepAliveTimer = null;
          }
        }, 2500);

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('speakSentence fallback error:', err);
        if (onEnd) onEnd();
      }
    };

    startSpeak();
  };

  const cacheKey = `v6_leda:${cleanText}`;
  const playCleanStudioAudio = (dataUrl: string) => {
    if (requestId !== activeTtsRequestId) return;

    const audio = new Audio(dataUrl);
    audio.volume = 1.0;
    audio.playbackRate = isSlow ? 0.86 : 1.0;
    activeAudioElement = audio;

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      audio.onended = null;
      audio.onerror = null;
      if (activeAudioElement === audio) {
        activeAudioElement = null;
      }
      if (onEnd) onEnd();
    };

    audio.onended = finish;
    audio.onerror = () => {
      if (finished) return;
      finished = true;
      audio.onended = null;
      audio.onerror = null;
      if (activeAudioElement === audio) {
        activeAudioElement = null;
      }
      fallbackToBrowserSpeech();
    };

    audio.play().catch(() => {
      if (!finished) {
        finished = true;
        activeAudioElement = null;
        fallbackToBrowserSpeech();
      }
    });
  };

  const cachedUrl = ttsMemoryCache.get(cacheKey);
  if (cachedUrl) {
    playCleanStudioAudio(cachedUrl);
    return;
  }

  fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: cleanText,
    }),
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);
      const data = await res.json();
      if (!data?.audioDataUrl) throw new Error('Empty audioDataUrl');
      ttsMemoryCache.set(cacheKey, data.audioDataUrl);
      playCleanStudioAudio(data.audioDataUrl);
    })
    .catch(() => {
      fallbackToBrowserSpeech();
    });
}

export function speakSequence(
  items: string[],
  onItemStart?: (index: number) => void,
  onComplete?: () => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  stopSpeaking();

  let index = 0;
  function next() {
    if (index >= items.length) {
      if (onComplete) onComplete();
      return;
    }
    const current = items[index];
    if (onItemStart) onItemStart(index);

    if (toastListener) {
      toastListener({
        sound: current,
        ipa: `(${index + 1}/${items.length})`,
        word: current,
        subtext: 'Đang đọc tuần tự...',
        active: true,
        isCustomAudio: false
      });
    }

    const utterance = new SpeechSynthesisUtterance(current);
    const voiceInfo = getBestVoiceInfo();
    if (voiceInfo.voice) utterance.voice = voiceInfo.voice;
    utterance.lang = voiceInfo.lang || 'en-US';
    utterance.volume = 1.0;
    utterance.rate = 0.85;

    utterance.onend = () => {
      index++;
      setTimeout(next, 350);
    };
    utterance.onerror = () => {
      index++;
      setTimeout(next, 350);
    };

    window.speechSynthesis.speak(utterance);
  }

  next();
}
