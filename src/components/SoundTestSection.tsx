import React, { useState, useRef, useEffect } from 'react';
import { PHONICS_42_SOUNDS, PhonicsSound } from '../data/phonicsData';
import { speakPhonicsSound } from '../utils/audioPlayer';
import {
  initTeacherPhotoStorage,
  getLoadedTeacherPhoto,
  subscribeTeacherPhotoUpdates,
  saveDirectTeacherPhotoFile,
} from '../utils/teacherPhotoStorage';

// Danh sách 14 từ bài đọc đánh giá năng lực ghép vần (theo đúng danh sách chuẩn cô Trang gửi)
export const READING_TEST_WORDS: string[] = [
  'lig',
  'mep',
  'gax',
  'emp',
  'beff',
  'shup',
  'doil',
  'charb',
  'frex',
  'criff',
  'haps',
  'barst',
  'chin',
  'deck',
];

// Danh sách 14 âm chuẩn cho phần Bài test Nghe và Nhại lại
const LISTEN_REPEAT_SOUND_IDS: string[] = [
  's',
  'a',
  't',
  'p',
  'n',
  'e',
  'm',
  'g',
  'b',
  'sh',
  'ch',
  'th-unvoiced',
  'ai',
  'oa',
];

export type SoundTestMode = 'under_7_listen_only' | 'age_8_plus_combined';

interface StudentRegistration {
  studentName: string;
  studentAge: number;
  parentPhone: string;
  parentEmail: string;
}

const STORAGE_KEY_STUDENT = 'phonics_sound_test_student_v1';
const STORAGE_KEY_SOUND_TEST_PHOTO = 'phonics_sound_test_teacher_photo_v1';

export function SoundTestSection() {
  const [isTestOpen, setIsTestOpen] = useState<boolean>(false);
  const [studentInfo, setStudentInfo] = useState<StudentRegistration | null>(null);

  // Ảnh Cô Trang trong phần Sound Test (đồng bộ với ảnh Cô Trang hoặc tải riêng trực tiếp)
  const [teacherPhotoUrl, setTeacherPhotoUrl] = useState<string>('');
  const [isDraggingPhoto, setIsDraggingPhoto] = useState<boolean>(false);
  const teacherPhotoInputRef = useRef<HTMLInputElement | null>(null);

  // Form fields
  const [nameInput, setNameInput] = useState<string>('');
  const [ageInput, setAgeInput] = useState<string>('');
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Test mode: automatically defaulted by age (< 8 -> listen only, >= 8 -> 50% listen + 50% reading)
  const [testMode, setTestMode] = useState<SoundTestMode>('under_7_listen_only');
  const [activePartTab, setActivePartTab] = useState<'listen' | 'reading' | 'both'>('both');

  // Attempt tracking for Listen & Repeat (14 items) and Reading Words (14 words)
  const [listenAttempted, setListenAttempted] = useState<Record<string, boolean>>({});
  const [readingAttempted, setReadingAttempted] = useState<Record<string, boolean>>({});
  const [activeReadingWord, setActiveReadingWord] = useState<string | null>(null);
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Built-in Camera Video Recorder states
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string>('');

  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const sectionWorkspaceRef = useRef<HTMLDivElement | null>(null);

  // Load saved student registration & teacher photo if available
  useEffect(() => {
    try {
      const savedCustomPhoto = localStorage.getItem(STORAGE_KEY_SOUND_TEST_PHOTO);
      if (savedCustomPhoto) {
        setTeacherPhotoUrl(savedCustomPhoto);
      }
    } catch {
      // ignore
    }

    const syncPhoto = () => {
      try {
        const savedCustomPhoto = localStorage.getItem(STORAGE_KEY_SOUND_TEST_PHOTO);
        if (savedCustomPhoto) {
          setTeacherPhotoUrl(savedCustomPhoto);
          return;
        }
      } catch {
        // ignore
      }
      const loaded = getLoadedTeacherPhoto();
      if (loaded?.rawDataUrl) {
        setTeacherPhotoUrl(loaded.rawDataUrl);
      }
    };

    initTeacherPhotoStorage().then(syncPhoto);
    const unsubPhoto = subscribeTeacherPhotoUpdates(syncPhoto);

    try {
      const raw = localStorage.getItem(STORAGE_KEY_STUDENT);
      if (raw) {
        const parsed = JSON.parse(raw) as StudentRegistration;
        if (
          parsed &&
          parsed.studentName &&
          parsed.studentAge &&
          parsed.parentPhone &&
          parsed.parentEmail
        ) {
          setNameInput(parsed.studentName);
          setAgeInput(String(parsed.studentAge));
          setPhoneInput(parsed.parentPhone);
          setEmailInput(parsed.parentEmail);
        }
      }
    } catch {
      // ignore
    }

    return () => {
      unsubPhoto();
    };
  }, []);

  const handleUploadTeacherPhoto = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (dataUrl) {
        setTeacherPhotoUrl(dataUrl);
        try {
          localStorage.setItem(STORAGE_KEY_SOUND_TEST_PHOTO, dataUrl);
        } catch {
          // ignore quota error
        }
      }
    };
    reader.readAsDataURL(file);
    await saveDirectTeacherPhotoFile(file);
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsRecording(false);
    setIsCameraOpen(false);
  };

  const handleOpenAssessmentClick = () => {
    setIsTestOpen(true);
    setTimeout(() => {
      sectionWorkspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handleStartTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const trimmedName = nameInput.trim();
    const trimmedPhone = phoneInput.trim();
    const trimmedEmail = emailInput.trim();
    const parsedAge = Number(ageInput);

    if (!trimmedName) {
      setFormError('Vui lòng điền họ và tên của con.');
      return;
    }
    if (!ageInput || isNaN(parsedAge) || parsedAge < 2 || parsedAge > 18) {
      setFormError('Vui lòng điền tuổi hợp lệ của con (từ 2 đến 18 tuổi).');
      return;
    }
    if (!trimmedPhone || trimmedPhone.replace(/\D/g, '').length < 8) {
      setFormError('Vui lòng điền số điện thoại phụ huynh hợp lệ.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setFormError('Vui lòng điền địa chỉ Email phụ huynh hợp lệ.');
      return;
    }

    const registration: StudentRegistration = {
      studentName: trimmedName,
      studentAge: parsedAge,
      parentPhone: trimmedPhone,
      parentEmail: trimmedEmail,
    };

    try {
      localStorage.setItem(STORAGE_KEY_STUDENT, JSON.stringify(registration));
    } catch {
      // ignore
    }

    setStudentInfo(registration);

    // Dựa vào tuổi mặc định luôn bài test:
    // Dưới 7 tuổi (<= 7): Bài test nghe và nhại lại
    // Từ 8 tuổi trở lên (>= 8): Bài test nghe và nhại lại (50%) + Đọc và quay video đọc từ (50%)
    if (parsedAge >= 8) {
      setTestMode('age_8_plus_combined');
      setActivePartTab('both');
    } else {
      setTestMode('under_7_listen_only');
      setActivePartTab('listen');
    }
  };

  const listenSounds = LISTEN_REPEAT_SOUND_IDS.map((id) =>
    PHONICS_42_SOUNDS.find((s) => s.id === id)
  ).filter((s): s is PhonicsSound => Boolean(s));

  const handlePlayListenSound = (sound: PhonicsSound) => {
    setPlayingSoundId(sound.id);
    speakPhonicsSound(
      sound.sound,
      sound.ipa,
      `${sound.nameEn} (${sound.nameVi})`,
      sound.spokenText,
      () => setPlayingSoundId(null),
      sound.id
    );
  };

  const toggleListenAttempt = (soundId: string) => {
    setListenAttempted((prev) => ({
      ...prev,
      [soundId]: !prev[soundId],
    }));
  };

  const toggleReadingWordAttempt = (word: string) => {
    setActiveReadingWord(word);
    setReadingAttempted((prev) => ({
      ...prev,
      [word]: !prev[word],
    }));
  };

  // Start webcam & microphone recording
  const handleStartCameraRecording = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      mediaStreamRef.current = stream;
      setIsCameraOpen(true);

      setTimeout(() => {
        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = stream;
          liveVideoRef.current.play().catch(() => {});
        }
      }, 50);

      recordedChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : '';

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          recordedChunksRef.current.push(ev.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: recorder.mimeType || 'video/webm',
        });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return url;
        });
      };

      mediaRecorderRef.current = recorder;
      recorder.start(500);
      setIsRecording(true);
      setRecordingSeconds(0);

      if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      setCameraError(
        'Không thể truy cập Camera/Micro trên trình duyệt. Ba mẹ có thể dùng trực tiếp điện thoại để quay video con làm bài và gửi qua Zalo cho cô nhé!'
      );
    }
  };

  const handleStopRecording = () => {
    stopCameraStream();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const listenDoneCount = Object.values(listenAttempted).filter(Boolean).length;
  const readingDoneCount = Object.values(readingAttempted).filter(Boolean).length;

  const previewAgeNumber = Number(ageInput);
  const isAge8PlusPreview = !isNaN(previewAgeNumber) && previewAgeNumber >= 8;

  const handleCopyStudentSummary = () => {
    if (!studentInfo) return;
    const modeLabel =
      testMode === 'under_7_listen_only'
        ? 'Bài test Nghe và nhại lại (100%)'
        : 'Bài test Nghe & nhại lại (50%) + Đọc từ & quay video (50%)';
    const summaryText = `THÔNG TIN ĐÁNH GIÁ SOUND TEST - CÔ TRANG ASI\n- Học sinh: ${studentInfo.studentName}\n- Tuổi: ${studentInfo.studentAge} tuổi\n- SĐT phụ huynh: ${studentInfo.parentPhone}\n- Email: ${studentInfo.parentEmail}\n- Bài đánh giá: ${modeLabel}\n- Tiến độ: Nghe & nhại lại (${listenDoneCount}/${listenSounds.length}), Đọc từ (${readingDoneCount}/${READING_TEST_WORDS.length})`;

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 3000);
    });
  };

  return (
    <section id="sound-test" className="w-full py-10 bg-surface scroll-mt-24">
      <input
        ref={teacherPhotoInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleUploadTeacherPhoto(f);
          e.target.value = '';
        }}
        className="hidden"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 space-y-6">
        {/* Khối Banner chính màu xanh đậm kèm Ảnh Cô Trang bên phải */}
        <div className="bg-primary rounded-3xl p-6 sm:p-8 text-on-primary shadow-xl border border-primary-container">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Cột trái: Nội dung Sound Test + Nút Làm bài đánh giá + Liên hệ nhỏ bên dưới */}
            <div className="flex-1 space-y-5 w-full">
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-black text-on-primary tracking-tight leading-tight">
                  Sound test: Đánh giá năng lực nhận biết âm
                </h2>

                {/* Hàng ngang: Dưới 7 tuổi / Trên 7 tuổi nằm ngang cùng với nút Làm bài đánh giá */}
                <div className="flex flex-wrap items-center gap-6 pt-1">
                  <div className="space-y-1 text-sm sm:text-base font-semibold text-on-primary/95">
                    <p>Dưới 7 tuổi: Nghe - Nhắc lại</p>
                    <p>Trên 7 tuổi: Nghe - Đọc</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenAssessmentClick}
                    className="px-7 py-3.5 rounded-2xl bg-secondary-container text-on-secondary-container font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-secondary hover:text-on-secondary transition-all shadow-md hover:scale-105 cursor-pointer shrink-0"
                  >
                    <span className="material-symbols-outlined">fact_check</span>
                    <span>Làm bài đánh giá</span>
                  </button>
                </div>
              </div>

              {/* Phần Tư vấn, giải đáp • LIÊN HỆ: Zalo Anh Ngữ ASI lên trước, FACEBOOK CÔ TRANG ASI xuống sau */}
              <div className="pt-3.5 border-t border-on-primary/15 flex flex-wrap items-center gap-3 text-xs text-on-primary/90">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-on-primary/85">Tư vấn, giải đáp</span>
                  <span className="text-on-primary/40">•</span>
                  <span className="font-black uppercase tracking-wider text-on-primary">LIÊN HỆ:</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="https://zalo.me/0398612126"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-on-primary/15 hover:bg-secondary-container hover:text-on-secondary-container text-on-primary font-extrabold text-xs flex items-center gap-1.5 transition-all border border-on-primary/25"
                  >
                    <span className="material-symbols-outlined text-[15px]">chat</span>
                    <span>Zalo Anh Ngữ ASI</span>
                  </a>

                  <a
                    href="https://www.facebook.com/trang.asi.jollyphonics/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-on-primary/15 hover:bg-on-primary hover:text-primary text-on-primary font-extrabold text-xs flex items-center gap-1.5 transition-all border border-on-primary/25"
                  >
                    <span className="material-symbols-outlined text-[15px]">public</span>
                    <span>FACEBOOK CÔ TRANG ASI</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Cột phải: Ảnh Cô Trang ASI cỡ lớn */}
            {teacherPhotoUrl && (
              <div className="shrink-0 self-center md:self-auto">
                <div className="w-56 sm:w-64 lg:w-72 rounded-2xl overflow-hidden shadow-lg border-2 border-white/90 bg-white">
                  <img
                    src={teacherPhotoUrl}
                    alt="THE MAGIC SOUNDS"
                    className="w-full h-auto block object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Khu vực làm bài đánh giá (Mở ra khi bấm "Làm bài đánh giá") */}
        {isTestOpen && (
          <div
            ref={sectionWorkspaceRef}
            className="bg-surface-container-lowest rounded-3xl border-2 border-primary/20 shadow-lg overflow-hidden transition-all"
          >
            {!studentInfo ? (
              <div className="p-6 sm:p-8 lg:p-10 max-w-3xl mx-auto">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <h3 className="text-xl sm:text-2xl font-black text-on-surface">
                    Thông tin học sinh
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsTestOpen(false)}
                    className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
                    title="Đóng"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <form onSubmit={handleStartTestSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-on-surface uppercase tracking-wider mb-1.5">
                        Họ và tên học sinh <span className="text-error">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Ví dụ: Nguyễn Minh An"
                        className="w-full px-4 py-3 rounded-xl border-2 border-surface-container-high bg-surface focus:border-primary focus:outline-none text-sm font-semibold text-on-surface"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-on-surface uppercase tracking-wider mb-1.5">
                        Tuổi của con <span className="text-error">*</span>
                      </label>
                      <input
                        type="number"
                        min={2}
                        max={18}
                        required
                        value={ageInput}
                        onChange={(e) => setAgeInput(e.target.value)}
                        placeholder="Nhập số tuổi (VD: 5, 6, 8, 9...)"
                        className="w-full px-4 py-3 rounded-xl border-2 border-surface-container-high bg-surface focus:border-primary focus:outline-none text-sm font-semibold text-on-surface"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-on-surface uppercase tracking-wider mb-1.5">
                        Số điện thoại phụ huynh <span className="text-error">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="Ví dụ: 0912345678"
                        className="w-full px-4 py-3 rounded-xl border-2 border-surface-container-high bg-surface focus:border-primary focus:outline-none text-sm font-semibold text-on-surface"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-on-surface uppercase tracking-wider mb-1.5">
                        Email phụ huynh <span className="text-error">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="Ví dụ: phuhuynh@gmail.com"
                        className="w-full px-4 py-3 rounded-xl border-2 border-surface-container-high bg-surface focus:border-primary focus:outline-none text-sm font-semibold text-on-surface"
                      />
                    </div>
                  </div>

                  {formError && (
                    <div className="p-3 rounded-xl bg-error-container/60 border border-error/30 text-error text-xs font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">error</span>
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-on-surface-variant font-medium">
                      Gửi video bài làm qua Zalo cô Trang:{' '}
                      <strong className="text-primary font-extrabold">0398612126</strong>
                    </p>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-primary hover:bg-primary-container text-on-primary font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <span>Vào làm bài đánh giá</span>
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Giao diện làm bài Sound Test */
              <div className="p-5 sm:p-8 space-y-6">
                {/* Thanh thông tin học sinh & chuyển đổi loại bài test */}
                <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 border border-surface-container-high flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-primary text-on-primary text-xs font-extrabold">
                      {studentInfo.studentName} ({studentInfo.studentAge} tuổi)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface text-xs font-bold">
                      SĐT: {studentInfo.parentPhone}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface text-xs font-bold">
                      Email: {studentInfo.parentEmail}
                    </span>
                    <button
                      type="button"
                      onClick={() => setStudentInfo(null)}
                      className="text-xs font-bold text-primary hover:underline cursor-pointer ml-1"
                    >
                      Sửa thông tin
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setTestMode('under_7_listen_only');
                        setActivePartTab('listen');
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                        testMode === 'under_7_listen_only'
                          ? 'bg-primary text-on-primary border-primary shadow-xs'
                          : 'bg-surface-container-lowest text-on-surface-variant border-surface-container-high hover:border-primary/40'
                      }`}
                    >
                      Dưới 7 tuổi: Nghe - Nhắc lại
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTestMode('age_8_plus_combined');
                        setActivePartTab('both');
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                        testMode === 'age_8_plus_combined'
                          ? 'bg-primary text-on-primary border-primary shadow-xs'
                          : 'bg-surface-container-lowest text-on-surface-variant border-surface-container-high hover:border-primary/40'
                      }`}
                    >
                      Trên 7 tuổi: Nghe - Đọc
                    </button>
                  </div>
                </div>

                {/* Khung Quay Video Làm Bài & Gửi Zalo */}
                <div className="bg-primary/5 rounded-2xl p-4 sm:p-5 border-2 border-primary/20 space-y-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-primary font-black text-sm sm:text-base">
                      <span className="material-symbols-outlined text-[20px]">videocam</span>
                      <span>Quay video bài làm & gửi Zalo: 0398612126</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      {!isRecording ? (
                        <button
                          type="button"
                          onClick={handleStartCameraRecording}
                          className="px-4 py-2.5 rounded-xl bg-error text-on-error font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm hover:opacity-95 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            fiber_manual_record
                          </span>
                          <span>Quay video trực tiếp</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleStopRecording}
                          className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm animate-pulse cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px] text-red-400">
                            stop_circle
                          </span>
                          <span>Dừng quay ({formatTime(recordingSeconds)})</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleCopyStudentSummary}
                        className="px-3.5 py-2.5 rounded-xl bg-surface-container-lowest border border-primary/30 text-primary font-extrabold text-xs sm:text-sm flex items-center gap-1.5 hover:bg-primary/5 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {copiedSummary ? 'check' : 'content_copy'}
                        </span>
                        <span>{copiedSummary ? 'Đã chép thông tin' : 'Chép thông tin'}</span>
                      </button>

                      <a
                        href="https://zalo.me/0398612126"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm hover:bg-primary-container transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">send</span>
                        <span>Gửi qua Zalo</span>
                      </a>
                    </div>
                  </div>

                  {cameraError && (
                    <p className="text-xs font-bold text-error bg-error-container/40 px-3.5 py-2 rounded-xl">
                      {cameraError}
                    </p>
                  )}

                  {/* Khung hiển thị Camera đang quay hoặc Video đã quay xong */}
                  {(isCameraOpen || recordedVideoUrl) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {isCameraOpen && (
                        <div className="bg-slate-950 rounded-2xl overflow-hidden relative aspect-video border-2 border-red-500">
                          <video
                            ref={liveVideoRef}
                            muted
                            playsInline
                            className="w-full h-full object-cover scale-x-[-1]"
                          />
                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-black flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                            <span>ĐANG QUAY • {formatTime(recordingSeconds)}</span>
                          </div>
                        </div>
                      )}

                      {recordedVideoUrl && (
                        <div className="bg-surface-container-lowest rounded-2xl p-3 border border-surface-container-high space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-extrabold text-on-surface flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[18px] text-emerald-600">
                                check_circle
                              </span>
                              Video bài làm của {studentInfo.studentName}
                            </span>
                            <a
                              href={recordedVideoUrl}
                              download={`sound-test-${studentInfo.studentName.replace(/\s+/g, '-')}.webm`}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-extrabold flex items-center gap-1 hover:bg-emerald-700 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                download
                              </span>
                              <span>Tải video</span>
                            </a>
                          </div>
                          <video
                            src={recordedVideoUrl}
                            controls
                            playsInline
                            className="w-full rounded-xl aspect-video bg-black"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bộ lọc khi ở chế độ Trên 7 tuổi */}
                {testMode === 'age_8_plus_combined' && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-container-high pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActivePartTab('both')}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                          activePartTab === 'both'
                            ? 'bg-primary text-on-primary shadow-xs'
                            : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        Tất cả
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePartTab('listen')}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                          activePartTab === 'listen'
                            ? 'bg-primary text-on-primary shadow-xs'
                            : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        Nghe và nhắc lại ({listenDoneCount}/{listenSounds.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivePartTab('reading')}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                          activePartTab === 'reading'
                            ? 'bg-primary text-on-primary shadow-xs'
                            : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        Đọc từ ({readingDoneCount}/{READING_TEST_WORDS.length})
                      </button>
                    </div>
                  </div>
                )}

                {/* Nội dung 2 phần bài test */}
                <div
                  className={`grid gap-6 ${
                    testMode === 'age_8_plus_combined' && activePartTab === 'both'
                      ? 'grid-cols-1 lg:grid-cols-2'
                      : 'grid-cols-1 max-w-3xl mx-auto'
                  }`}
                >
                  {(testMode === 'under_7_listen_only' ||
                    activePartTab === 'listen' ||
                    activePartTab === 'both') && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                      <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
                        <h4 className="text-base sm:text-lg font-black text-slate-900">
                          Nghe và nhắc lại âm
                        </h4>
                        <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs font-black shrink-0">
                          {listenDoneCount}/{listenSounds.length} âm
                        </span>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {listenSounds.map((snd, idx) => {
                          const isAttempted = Boolean(listenAttempted[snd.id]);
                          const isPlaying = playingSoundId === snd.id;

                          return (
                            <div
                              key={snd.id}
                              className={`px-5 py-3.5 flex items-center justify-between gap-4 transition-colors ${
                                isAttempted ? 'bg-emerald-50/40' : 'hover:bg-slate-50/80'
                              }`}
                            >
                              <div className="flex items-center gap-3.5">
                                <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 text-xs font-extrabold flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handlePlayListenSound(snd)}
                                  className={`px-4 py-2 rounded-xl font-extrabold text-sm flex items-center gap-2 transition-all cursor-pointer border ${
                                    isPlaying
                                      ? 'bg-primary text-on-primary border-primary shadow-sm scale-105'
                                      : 'bg-primary/5 hover:bg-primary/15 text-primary border-primary/25'
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    volume_up
                                  </span>
                                  <span>Nghe âm {idx + 1}</span>
                                  <span className="text-xs opacity-75 font-bold">
                                    (/{snd.sound}/)
                                  </span>
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => toggleListenAttempt(snd.id)}
                                className={`text-sm font-medium transition-colors cursor-pointer px-3 py-1.5 rounded-lg ${
                                  isAttempted
                                    ? 'text-emerald-700 bg-emerald-100/80 font-bold'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                                }`}
                              >
                                {isAttempted ? 'Completed' : 'Not Attempted'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {testMode === 'age_8_plus_combined' &&
                    (activePartTab === 'reading' || activePartTab === 'both') && (
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
                          <h4 className="text-base sm:text-lg font-black text-slate-900">
                            Đọc từ
                          </h4>
                          <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs font-black shrink-0">
                            {readingDoneCount}/{READING_TEST_WORDS.length} từ
                          </span>
                        </div>

                        {/* Giao diện bảng đọc 14 chữ giống hệt cấu trúc ảnh mẫu cô Trang gửi */}
                        <div className="divide-y divide-slate-100">
                          {READING_TEST_WORDS.map((word) => {
                            const isAttempted = Boolean(readingAttempted[word]);
                            const isSelected = activeReadingWord === word;

                            return (
                              <div
                                key={word}
                                onClick={() => toggleReadingWordAttempt(word)}
                                className={`px-6 py-4 flex items-center justify-between gap-4 cursor-pointer transition-colors select-none ${
                                  isSelected
                                    ? 'bg-primary/5'
                                    : isAttempted
                                    ? 'bg-emerald-50/40'
                                    : 'hover:bg-slate-50'
                                }`}
                              >
                                <span className="text-2xl sm:text-[26px] font-medium text-slate-800 tracking-normal">
                                  {word}
                                </span>

                                <span
                                  className={`text-sm sm:text-base transition-colors ${
                                    isAttempted
                                      ? 'text-emerald-600 font-bold'
                                      : 'text-slate-500 font-normal'
                                  }`}
                                >
                                  {isAttempted ? 'Completed' : 'Not Attempted'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
