/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CourseBannerHeader } from './components/CourseBannerHeader';
import { Phonics42Section } from './components/Phonics42Section';
import { AlternativeSpellingsSection } from './components/AlternativeSpellingsSection';
import { TrickyWordsSection } from './components/TrickyWordsSection';
import { DecodableReadersSection } from './components/DecodableReadersSection';
import { ShadowingSection } from './components/ShadowingSection';
import {
  SoundCodeWorkspace,
  SoundToSpeechWorkspace,
} from './components/AdditionalCoursesContent';
import { Footer } from './components/Footer';
import { SoundDetailModal } from './components/SoundDetailModal';
import { DiamondRewardModal } from './components/DiamondRewardModal';
import { LoginModal, AuthModalMode } from './components/LoginModal';
import { LockedGroupModal } from './components/LockedGroupModal';
import { AudioManagerModal } from './components/AudioManagerModal';
import {
  CourseAccessModal,
  CourseAccessPromptType,
} from './components/CourseAccessModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { PhonicsSound } from './data/phonicsData';
import { MicrophoneRecorderModal } from './components/MicrophoneRecorderModal';
import {
  initAudioStorage,
  getAllCachedAudios,
  CustomAudioRecord,
} from './utils/audioStorage';
import { CourseKey } from './utils/courseCoverStorage';
import {
  syncStudentAccountOnLogin,
  recordStudentProgress,
  UnlockedCoursesMap,
} from './utils/studentProgressApi';
import {
  auth,
  ADMIN_EMAIL,
  onAuthStateChanged,
  signOut,
  syncVerifiedUserProfileToFirestore,
} from './firebase';

const STORAGE_KEY_CURRENT_USER = 'phonics_current_authenticated_user_v1';
const STORAGE_KEY_PURCHASED_COURSES = 'phonics_purchased_courses_v5';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');
  const [diamonds, setDiamonds] = useState<number>(60);
  const [selectedSound, setSelectedSound] = useState<PhonicsSound | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isDiamondModalOpen, setIsDiamondModalOpen] = useState<boolean>(false);
  const [isAudioManagerOpen, setIsAudioManagerOpen] = useState<boolean>(false);
  const [isGlobalMicModalOpen, setIsGlobalMicModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [rewardedBookTitle, setRewardedBookTitle] = useState<string>('Book 06: Tap, Tap, Tap!');
  const [lockedGroupNumber, setLockedGroupNumber] = useState<number | null>(null);
  const [customAudios, setCustomAudios] = useState<Map<string, CustomAudioRecord>>(new Map());

  // Giao diện hiện tại: null = Trang chủ, hoặc CourseKey = Giao diện riêng chỉ có khoá học đó
  const [activeCoursePage, setActiveCoursePage] = useState<CourseKey | null>(null);

  // Modal thông báo đăng ký tài khoản / mua khoá học theo quy định từng khoá
  const [accessPrompt, setAccessPrompt] = useState<CourseAccessPromptType | null>(null);

  // Hiệu ứng làm nổi bật nút "Đăng ký [TÊN KHOÁ]" khi học viên bấm vào bài học đang khoá và được tự động cuộn lên
  const [highlightRegisterButton, setHighlightRegisterButton] = useState<boolean>(false);
  const highlightTimeoutRef = useRef<number | null>(null);

  // Trạng thái đã mua / kích hoạt full các khoá có phí
  const [purchasedCourses, setPurchasedCourses] = useState<Record<CourseKey, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PURCHASED_COURSES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      'tune-in': false,
      'magic-sounds': false,
      'sound-code': false,
      'sound-to-speech': false,
    };
  });

  const handleUnlockCourse = (
    courseKey: CourseKey,
    updatedMap?: UnlockedCoursesMap
  ) => {
    setPurchasedCourses((prev) => {
      const next = updatedMap
        ? { ...prev, ...updatedMap, [courseKey]: true }
        : { ...prev, [courseKey]: true };
      try {
        localStorage.setItem(STORAGE_KEY_PURCHASED_COURSES, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const applyServerAccountSync = async (email: string, username: string) => {
    const synced = await syncStudentAccountOnLogin(email, username);
    if (synced) {
      setPurchasedCourses((prev) => {
        const next = { ...prev, ...synced.unlockedCourses };
        try {
          localStorage.setItem(
            STORAGE_KEY_PURCHASED_COURSES,
            JSON.stringify(next)
          );
        } catch {
          // ignore
        }
        return next;
      });
      if (typeof synced.progress?.diamonds === 'number') {
        setDiamonds(synced.progress.diamonds);
      }
    }
  };

  const handleOpenCoursePage = (courseKey: CourseKey) => {
    setActiveCoursePage(courseKey);
    setHighlightRegisterButton(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleGoHome = () => {
    setActiveCoursePage(null);
    setHighlightRegisterButton(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const isAdminAccount =
    currentUserEmail.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

  /**
   * Khi học viên bấm vào nút Học âm / bài học có hình ổ khoá:
   * Tự động cuộn lên nút "Đăng ký [TÊN KHOÁ]" ở đầu trang khoá học và làm nổi bật nút đó
   */
  const scrollToCourseRegisterButton = () => {
    const bannerEl =
      document.getElementById('course-subpage-banner') ||
      document.getElementById('btn-dang-ky-khoa-hoc');

    if (bannerEl) {
      bannerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setHighlightRegisterButton(true);
    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }
    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightRegisterButton(false);
    }, 5500);
  };

  /**
   * Khi học viên bấm vào nút "Đăng ký [TÊN KHOÁ]" trên banner đầu trang con
   */
  const handleRegisterCourseClick = (courseKey: CourseKey) => {
    setHighlightRegisterButton(false);
    switch (courseKey) {
      case 'tune-in':
        setAccessPrompt('tune-in-register');
        break;
      case 'magic-sounds':
        if (!isLoggedIn) {
          setAccessPrompt('magic-sounds-register');
        } else {
          setAccessPrompt('magic-sounds-purchase');
        }
        break;
      case 'sound-code':
        setAccessPrompt('sound-code-purchase');
        break;
      case 'sound-to-speech':
        setAccessPrompt('sound-to-speech-register');
        break;
    }
  };

  // Restore saved session or listen to Firebase Auth state changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.username) {
          setIsLoggedIn(true);
          setCurrentUsername(parsed.username);
          const savedEmail = parsed.email || '';
          setCurrentUserEmail(savedEmail);
          if (savedEmail) {
            applyServerAccountSync(savedEmail, parsed.username);
          }
        }
      }
    } catch {
      // ignore
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && fbUser.emailVerified) {
        try {
          const synced = await syncVerifiedUserProfileToFirestore(fbUser);
          setIsLoggedIn(true);
          setCurrentUsername(synced.username);
          setCurrentUserEmail(synced.email);
          localStorage.setItem(
            STORAGE_KEY_CURRENT_USER,
            JSON.stringify({ username: synced.username, email: synced.email })
          );
          applyServerAccountSync(synced.email, synced.username);
        } catch {
          const fallbackName =
            fbUser.displayName || fbUser.email?.split('@')[0] || 'Học viên';
          const fallbackEmail = fbUser.email || '';
          setIsLoggedIn(true);
          setCurrentUsername(fallbackName);
          setCurrentUserEmail(fallbackEmail);
          if (fallbackEmail) {
            applyServerAccountSync(fallbackEmail, fallbackName);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Initialize Audio storage on mount
  useEffect(() => {
    initAudioStorage().then((cache) => {
      setCustomAudios(new Map(cache));
    });

    const handleAudioUpdated = () => {
      setCustomAudios(new Map(getAllCachedAudios()));
    };

    window.addEventListener('phonics-audio-updated', handleAudioUpdated);
    return () => {
      window.removeEventListener('phonics-audio-updated', handleAudioUpdated);
    };
  }, []);

  const refreshCustomAudios = () => {
    setCustomAudios(new Map(getAllCachedAudios()));
  };

  const handleSelectSoundAndTrack = (sound: PhonicsSound) => {
    setSelectedSound(sound);
    if (isLoggedIn && (currentUserEmail || currentUsername)) {
      recordStudentProgress({
        email: currentUserEmail,
        username: currentUsername,
        soundId: sound.id,
        lastStudiedItem: `Magic Sounds: Âm /${sound.sound}/ (${sound.nameEn})`,
      });
    }
  };

  const handleRewardDiamond = (bookTitle: string) => {
    setDiamonds((prev) => {
      const nextDiamonds = prev + 10;
      if (isLoggedIn && (currentUserEmail || currentUsername)) {
        recordStudentProgress({
          email: currentUserEmail,
          username: currentUsername,
          bookTitle,
          diamonds: nextDiamonds,
          lastStudiedItem: `Đọc hoàn thành truyện: ${bookTitle}`,
        });
      }
      return nextDiamonds;
    });
    setRewardedBookTitle(bookTitle);
  };

  const handleSetAuth = async (status: boolean) => {
    if (!status) {
      setIsLoggedIn(false);
      setCurrentUsername('');
      setCurrentUserEmail('');
      try {
        localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
        await signOut(auth);
      } catch {
        // ignore
      }
    } else {
      setIsLoggedIn(true);
    }
  };

  const COURSE_CONFIGS: Record<
    CourseKey,
    {
      stepNumber: string;
      title: string;
      subtitleLine1: string;
      subtitleLine2: string;
      accentColor: 'rose' | 'blue' | 'indigo' | 'emerald';
      introDescription: string;
      accessSummary: string;
      bulletPoints: string[];
    }
  > = {
    'tune-in': {
      stepNumber: '01',
      title: 'Tune In',
      subtitleLine1: 'Nghe ngấm & Lồng tiếng tiếng Anh mỗi ngày',
      subtitleLine2: 'Trẻ 0–6 tuổi • Khoá hoàn toàn miễn phí',
      accentColor: 'rose',
      introDescription:
        'TUNE IN - NGHE NGẤM (các kênh YouTube Primary chọn lọc cho trẻ 0–3 tuổi và 3–6 tuổi kèm tích luỹ giờ nghe) và TUNE IN - LỒNG TIẾNG hoạt hình từng câu hoàn toàn miễn phí.',
      accessSummary:
        'Khoá Tune In hoàn toàn miễn phí 100%! Hiện chữ bài đọc miễn phí không cần đăng nhập. Đăng nhập tài khoản để lồng tiếng từng câu và lưu bài lồng tiếng vào tài khoản.',
      bulletPoints: [
        'TUNE IN - NGHE NGẤM: Kênh YouTube Primary chọn lọc cho khung 0–3 tuổi (ca nhạc vui) & 3–6 tuổi (tới A1)',
        'Theo dõi & tích luỹ số phút nghe ngấm tiếng Anh mỗi ngày của con',
        'TUNE IN - LỒNG TIẾNG: Xem hoạt hình, hiện chữ miễn phí & điều chỉnh tốc độ 0.85x / 1x',
        'Đăng nhập tài khoản để thu âm lồng tiếng từng câu và lưu vào kho bài lồng tiếng của con',
      ],
    },
    'magic-sounds': {
      stepNumber: '02',
      title: 'Magic Sounds',
      subtitleLine1: 'Đánh vần – tập đọc tiếng Anh',
      subtitleLine2: 'Trẻ 6–12 tuổi',
      accentColor: 'blue',
      introDescription: '',
      accessSummary: '',
      bulletPoints: [],
    },
    'sound-code': {
      stepNumber: '03',
      title: 'Sound Code',
      subtitleLine1: 'Giải mã cách đọc bằng hệ thống âm IPA',
      subtitleLine2: 'Từ 12 tuổi - người lớn',
      accentColor: 'indigo',
      introDescription:
        'Khoá học giải mã toàn diện hệ thống phiên âm quốc tế IPA kết hợp quy tắc mặt chữ (Graphemes), tách âm tiết và đặt trọng âm từ đa âm tiết dành cho học viên từ 12 tuổi - người lớn.',
      accessSummary:
        'Khoá học có phí (Mua Full, không học free) • Có sẵn bài Demo học thử trực tiếp trong khoá.',
      bulletPoints: [
        'Làm chủ bảng âm IPA: Nguyên âm đơn, Nguyên âm đôi và Phụ âm tiếng Anh',
        'Giải mã quy tắc nhìn mặt chữ đoán cách đọc và tách âm tiết từ dài',
        'Nắm vững quy tắc nhấn trọng âm từ và nhịp điệu câu học thuật',
        'Sửa tận gốc các lỗi phát âm sai tích tụ lâu năm',
      ],
    },
    'sound-to-speech': {
      stepNumber: '04',
      title: 'Mimic',
      subtitleLine1: 'Nghe đúng nhịp điệu – nói tự nhiên',
      subtitleLine2: 'Từ 7 tuổi - người lớn',
      accentColor: 'emerald',
      introDescription: '',
      accessSummary: '',
      bulletPoints: [],
    },
  };

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface antialiased flex flex-col">
      {/* Fixed Sticky Header */}
      <Header
        isLoggedIn={isLoggedIn}
        currentUsername={currentUsername}
        currentUserEmail={currentUserEmail}
        onSetAuth={handleSetAuth}
        diamonds={diamonds}
        uploadedAudioCount={customAudios.size}
        onOpenLogin={(mode = 'login') => {
          setAuthModalMode(mode);
          setIsLoginModalOpen(true);
        }}
        onOpenDiamondModal={() => setIsDiamondModalOpen(true)}
        onOpenAudioManager={() => setIsAudioManagerOpen(true)}
        onOpenMicrophone={() => setIsGlobalMicModalOpen(true)}
        onOpenAdminDashboard={() => setIsAdminModalOpen(true)}
        onGoHome={handleGoHome}
        activeCoursePage={activeCoursePage}
        onSelectCourse={handleOpenCoursePage}
      />

      {/* Main Content */}
      <main className="w-full pt-20 bg-surface flex-1">
        {activeCoursePage === null ? (
          /* ================================================================== */
          /* GIAO DIỆN TRANG CHỦ: GIỚI THIỆU + 4 CHƯƠNG TRÌNH HỌC + SOUND TEST */
          /* ================================================================== */
          <div className="flex flex-col w-full">
            <Hero onSelectCourse={handleOpenCoursePage} />
            <Footer />
          </div>
        ) : (
          /* ================================================================== */
          /* GIAO DIỆN RIÊNG CỦA TỪNG KHOÁ HỌC KHI BẤM VÀO                      */
          /* ================================================================== */
          <div className="flex flex-col w-full">
            {/* Banner thông tin khoá học đang mở (Tên rõ ràng + Mô tả ngắn gọn + Nút Đăng ký) */}
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 pt-6 pb-2">
              <CourseBannerHeader
                courseKey={activeCoursePage}
                {...COURSE_CONFIGS[activeCoursePage]}
                onOpenCoursePage={() => {}}
                isSubpage={true}
                onRegisterCourseClick={() =>
                  handleRegisterCourseClick(activeCoursePage)
                }
                highlightRegisterButton={highlightRegisterButton}
              />
            </div>

            {/* NỘI DUNG CHI TIẾT CHỈ CỦA KHOÁ ĐANG CHỌN */}
            {activeCoursePage === 'tune-in' && (
              <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-6">
                <ShadowingSection
                  displayMode="tune-in-only"
                  isLoggedIn={isLoggedIn || isAdminAccount}
                  hasPurchasedJoy={
                    purchasedCourses['tune-in'] || isAdminAccount
                  }
                  currentUserEmail={currentUserEmail}
                  currentUsername={currentUsername}
                  onRequireRegister={() => {
                    setAuthModalMode('login');
                    setIsLoginModalOpen(true);
                  }}
                  onOpenJoyRegisterModal={() =>
                    setAccessPrompt('tune-in-register')
                  }
                  onUnlockCourse={handleUnlockCourse}
                  onOpenAuthModal={(mode) => {
                    setAuthModalMode(mode);
                    setIsLoginModalOpen(true);
                  }}
                />
              </div>
            )}

            {activeCoursePage === 'magic-sounds' && (
              <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-4 space-y-6">
                {/* ============================================================== */}
                {/* KHU VỰC 1 (Ở NGAY ĐẦU): KHUNG JOY (ĐĂNG KÝ NGHE CẢM ÂM JOY)    */}
                {/* ============================================================== */}
                <ShadowingSection
                  displayMode="joy-only"
                  isLoggedIn={isLoggedIn}
                  hasPurchasedJoy={purchasedCourses['tune-in']}
                  currentUserEmail={currentUserEmail}
                  currentUsername={currentUsername}
                  onRequireRegister={() =>
                    setAccessPrompt('tune-in-register')
                  }
                  onOpenJoyRegisterModal={() =>
                    setAccessPrompt('tune-in-register')
                  }
                  onUnlockCourse={handleUnlockCourse}
                  onOpenAuthModal={(mode) => {
                    setAuthModalMode(mode);
                    setIsLoginModalOpen(true);
                  }}
                />

                {/* ============================================================== */}
                {/* KHU VỰC 2: KHUNG BAO TRỌN MAGIC SOUNDS (GỒM CẢ 4 PHẦN BÊN DƯỚI) */}
                {/* ============================================================== */}
                <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-[#1d4ed8]/30 shadow-sm flex flex-col gap-6">
                  {/* ĐÁNH VẦN TIẾNG ANH MAGIC SOUNDS bên cạnh có thêm nút Đăng ký */}
                  <div className="pb-3 border-b border-stone-200/80 flex flex-wrap items-center gap-3">
                    <span className="px-4 py-2 rounded-2xl bg-[#1d4ed8] text-white font-black text-sm sm:text-base shadow-[0_3px_0_#1e3a8a] inline-flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">
                        record_voice_over
                      </span>
                      <span>ĐÁNH VẦN TIẾNG ANH MAGIC SOUNDS</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setAccessPrompt('magic-sounds-purchase')}
                      className="px-4 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-[#1d4ed8] text-[#1d4ed8] font-black text-sm sm:text-base shadow-2xs inline-flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <span className="material-symbols-outlined text-lg">
                        how_to_reg
                      </span>
                      <span>Đăng ký</span>
                    </button>
                  </div>

                  {/* Phần 1: 42 Sounds */}
                  <Phonics42Section
                    onSelectSound={handleSelectSoundAndTrack}
                    customAudios={customAudios}
                    onOpenAudioManager={() => setIsAudioManagerOpen(true)}
                    onRefreshAudios={refreshCustomAudios}
                    isLoggedIn={isLoggedIn}
                    hasPurchasedCourse={purchasedCourses['magic-sounds']}
                    onRequireRegister={() =>
                      setAccessPrompt('magic-sounds-purchase')
                    }
                    onRequirePurchase={() =>
                      setAccessPrompt('magic-sounds-purchase')
                    }
                  />

                  {/* Phần 2: Alternatives (Âm thay thế) */}
                  <AlternativeSpellingsSection
                    hasPurchasedCourse={purchasedCourses['magic-sounds']}
                    onRequireCourseRegister={() =>
                      setAccessPrompt('magic-sounds-purchase')
                    }
                    onStudyAltSet={(altSetTitle, label) => {
                      if (isLoggedIn && (currentUserEmail || currentUsername)) {
                        recordStudentProgress({
                          email: currentUserEmail,
                          username: currentUsername,
                          altSetId: altSetTitle,
                          lastStudiedItem: label,
                        });
                      }
                    }}
                  />

                  {/* Phần 3: Tricky Words (Từ khó) */}
                  <TrickyWordsSection
                    hasPurchasedCourse={purchasedCourses['magic-sounds']}
                    onRequireCourseRegister={() =>
                      setAccessPrompt('magic-sounds-purchase')
                    }
                    onStudyTrickyGroup={(groupNumber, label) => {
                      if (isLoggedIn && (currentUserEmail || currentUsername)) {
                        recordStudentProgress({
                          email: currentUserEmail,
                          username: currentUsername,
                          trickyGroup: groupNumber,
                          lastStudiedItem: label,
                        });
                      }
                    }}
                  />

                  {/* Phần 4: Decodable Readers (Truyện đọc đánh vần) */}
                  <DecodableReadersSection
                    isLoggedIn={isLoggedIn}
                    hasPurchasedCourse={purchasedCourses['magic-sounds']}
                    onRequireLogin={() =>
                      setAccessPrompt('magic-sounds-purchase')
                    }
                    onRewardDiamond={handleRewardDiamond}
                  />
                </div>
              </div>
            )}

            {/* Sound Code: Giấu toàn bộ phần bài học bên dưới, chỉ hiển thị khung giới thiệu ở trên */}

            {activeCoursePage === 'sound-to-speech' && (
              <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-6">
                <SoundToSpeechWorkspace
                  isLoggedIn={isLoggedIn || isAdminAccount}
                  currentUserEmail={currentUserEmail}
                  currentUsername={currentUsername}
                  diamonds={diamonds}
                  onRequireRegister={() => {
                    setAuthModalMode('login');
                    setIsLoginModalOpen(true);
                  }}
                  onStudyLesson={(chunkId, label) => {
                    if (isLoggedIn && (currentUserEmail || currentUsername)) {
                      recordStudentProgress({
                        email: currentUserEmail,
                        username: currentUsername,
                        soundToSpeechId: chunkId,
                        lastStudiedItem: label,
                      });
                    }
                  }}
                  onRewardDictationPoints={({ pointsAdded, lineId, label }) => {
                    setDiamonds((prev) => {
                      const nextDiamonds = prev + Math.max(0, pointsAdded);
                      if (
                        (isLoggedIn || isAdminAccount) &&
                        (currentUserEmail || currentUsername)
                      ) {
                        recordStudentProgress({
                          email: currentUserEmail,
                          username: currentUsername,
                          soundToSpeechId: lineId,
                          diamonds: nextDiamonds,
                          lastStudiedItem: label,
                        });
                      }
                      return nextDiamonds;
                    });
                  }}
                />
              </div>
            )}

            <Footer />
          </div>
        )}
      </main>

      {/* Course Access / Registration / Purchase Modal */}
      <CourseAccessModal
        promptType={accessPrompt}
        isLoggedIn={isLoggedIn}
        currentUserEmail={currentUserEmail}
        onClose={() => setAccessPrompt(null)}
        onOpenAuthModal={(mode) => {
          setAuthModalMode(mode);
          setIsLoginModalOpen(true);
        }}
        onUnlockCourse={handleUnlockCourse}
      />

      {/* Admin Dashboard Modal: Quản lý Tài khoản Học viên, Tiến trình Học & Mã kích hoạt 1 lần */}
      <AdminDashboardModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        currentUserEmail={currentUserEmail}
      />

      {/* Sound Practice 3-Step Drill Modal */}
      <SoundDetailModal
        sound={selectedSound}
        onClose={() => setSelectedSound(null)}
        onOpenAudioManager={() => setIsAudioManagerOpen(true)}
      />

      {/* Audio Manager & Upload Modal */}
      <AudioManagerModal
        isOpen={isAudioManagerOpen}
        onClose={() => setIsAudioManagerOpen(false)}
        customAudios={customAudios}
        onRefresh={refreshCustomAudios}
      />

      {/* Diamond Celebration Modal */}
      <DiamondRewardModal
        isOpen={isDiamondModalOpen}
        onClose={() => setIsDiamondModalOpen(false)}
        diamonds={diamonds}
        bookTitle={rewardedBookTitle}
      />

      {/* Login & Registration Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={(user) => {
          setIsLoggedIn(true);
          if (user?.username) {
            setCurrentUsername(user.username);
            const emailStr = user.email || '';
            setCurrentUserEmail(emailStr);
            try {
              localStorage.setItem(
                STORAGE_KEY_CURRENT_USER,
                JSON.stringify(user)
              );
            } catch {
              // ignore
            }
            if (emailStr) {
              applyServerAccountSync(emailStr, user.username);
            }
          }
        }}
      />

      {/* Locked Group Modal */}
      <LockedGroupModal
        isOpen={lockedGroupNumber !== null}
        onClose={() => setLockedGroupNumber(null)}
        onOpenLogin={() => {
          setAuthModalMode('register');
          setIsLoginModalOpen(true);
        }}
        groupNumber={lockedGroupNumber || 2}
      />

      {/* Global Microphone Connection & Test Modal */}
      <MicrophoneRecorderModal
        isOpen={isGlobalMicModalOpen}
        onClose={() => setIsGlobalMicModalOpen(false)}
        title="Kết Nối & Kiểm Tra Micro Trực Tiếp"
        targetName="Kiểm Tra Micro Giọng Nói"
        onSaveAudio={() => {}}
      />
    </div>
  );
}
