import React, { useState, useEffect } from 'react';
import {
  fetchAdminOverview,
  generateOneTimeActivationCode,
  adminToggleStudentCourse,
  AdminStudentRecord,
  ActivationCodeRecord,
} from '../utils/studentProgressApi';
import { CourseKey } from '../utils/courseCoverStorage';
import { ADMIN_EMAIL } from '../firebase';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string;
}

const STORAGE_KEY_ADMIN_UNLOCKED = 'phonics_admin_session_unlocked_v2';

export function AdminDashboardModal({
  isOpen,
  onClose,
}: AdminDashboardModalProps) {
  const [isAdminVerified, setIsAdminVerified] = useState<boolean>(false);
  const [adminEmailInput, setAdminEmailInput] = useState<string>('');
  const [adminPinInput, setAdminPinInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'students' | 'codes'>('students');
  const [students, setStudents] = useState<AdminStudentRecord[]>([]);
  const [codes, setCodes] = useState<ActivationCodeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form tạo mã kích hoạt 1 lần gắn với Email
  const [targetEmail, setTargetEmail] = useState<string>('');
  const [selectedCourseKey, setSelectedCourseKey] =
    useState<CourseKey>('magic-sounds');
  const [codeNote, setCodeNote] = useState<string>('');
  const [newlyCreatedCode, setNewlyCreatedCode] =
    useState<ActivationCodeRecord | null>(null);
  const [formMsg, setFormMsg] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);
  const [copiedCodeStr, setCopiedCodeStr] = useState<string | null>(null);
  const [expandedStudentEmail, setExpandedStudentEmail] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!isOpen) return;
    let savedAdmin = false;
    try {
      savedAdmin = localStorage.getItem(STORAGE_KEY_ADMIN_UNLOCKED) === 'true';
    } catch {
      // ignore
    }
    if (savedAdmin) {
      setIsAdminVerified(true);
      loadOverviewData();
    }
  }, [isOpen]);

  const loadOverviewData = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminOverview();
      setStudents(data.students);
      setCodes(data.activationCodes);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const cleanEmail = adminEmailInput.trim().toLowerCase();
    const cleanPin = adminPinInput.trim();

    if (
      cleanEmail === ADMIN_EMAIL.toLowerCase() &&
      cleanPin === 'Asi12345@'
    ) {
      setIsAdminVerified(true);
      try {
        localStorage.setItem(STORAGE_KEY_ADMIN_UNLOCKED, 'true');
      } catch {
        // ignore
      }
      loadOverviewData();
      return;
    }

    setAuthError('Email hoặc mật khẩu quản trị không chính xác.');
  };

  const handleCreateCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);
    const cleanEmail = targetEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFormMsg({
        text: 'Vui lòng nhập đúng địa chỉ Email của học viên đã chuyển khoản.',
        type: 'error',
      });
      return;
    }

    const res = await generateOneTimeActivationCode(
      cleanEmail,
      selectedCourseKey,
      codeNote.trim()
    );
    if (!res.ok || !res.activationCode) {
      setFormMsg({
        text: res.error || 'Không thể tạo mã kích hoạt.',
        type: 'error',
      });
      return;
    }

    setNewlyCreatedCode(res.activationCode);
    setTargetEmail('');
    setCodeNote('');
    setFormMsg({
      text: `Đã tạo mã kích hoạt 1 lần [${res.activationCode.code}] cho email ${cleanEmail}!`,
      type: 'success',
    });
    loadOverviewData();
  };

  const handleQuickIssueCodeForStudent = async (
    studentEmail: string,
    courseKey: CourseKey = 'magic-sounds'
  ) => {
    const res = await generateOneTimeActivationCode(
      studentEmail,
      courseKey,
      'Cấp nhanh từ danh sách học viên'
    );
    if (res.ok && res.activationCode) {
      setNewlyCreatedCode(res.activationCode);
      setActiveTab('codes');
      copyActivationForZalo(res.activationCode);
      loadOverviewData();
    }
  };

  const handleToggleStudentCourse = async (
    email: string,
    courseKey: CourseKey,
    currentVal: boolean
  ) => {
    await adminToggleStudentCourse(email, courseKey, !currentVal);
    loadOverviewData();
  };

  const copyActivationForZalo = (item: ActivationCodeRecord) => {
    const courseName =
      item.courseKey === 'magic-sounds'
        ? 'MAGIC SOUNDS - ĐÁNH VẦN TIẾNG ANH (Mã code Magic riêng)'
        : item.courseKey === 'sound-code'
        ? 'SOUND CODE'
        : item.courseKey === 'tune-in'
        ? 'JOY - NGHE CẢM ÂM (Mã code JOY riêng)'
        : item.courseKey.toUpperCase();
    const message = `Chào bạn, tài khoản phần ${courseName} đã được xác nhận thành công!\n- Email tài khoản được kích hoạt: ${item.targetEmail}\n- Mã kích hoạt (chỉ dùng 1 lần duy nhất cho Email trên): ${item.code}\nBạn vui lòng vào khoá Magic Sounds trên web, nhập Email và Mã kích hoạt này vào đúng mục tương ứng để mở khoá học nhé!`;
    navigator.clipboard?.writeText(message).catch(() => {});
    setCopiedCodeStr(item.code);
    setTimeout(() => setCopiedCodeStr(null), 3000);
  };

  const filteredStudents = students.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.username.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  });

  const formatTime = (ts?: number) => {
    if (!ts) return '—';
    try {
      return new Date(ts).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-white max-w-6xl w-full rounded-3xl p-5 sm:p-7 shadow-2xl border border-stone-200 flex flex-col gap-5 relative my-auto max-h-[92vh] overflow-y-auto">
        {/* Nút Đóng */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer z-10"
          title="Đóng bảng quản trị"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Header Quản trị */}
        <div className="flex flex-wrap items-center justify-between gap-3 pr-10 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#e13829] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-2xl">
                admin_panel_settings
              </span>
            </div>
            <div>
              <span className="text-sm font-black uppercase tracking-wider text-[#c8281b]">
                TÀI KHOẢN QUẢN TRỊ • THE MAGIC SOUNDS
              </span>
            </div>
          </div>

          {isAdminVerified && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadOverviewData}
                className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">
                  refresh
                </span>
                <span>Làm mới dữ liệu</span>
              </button>
            </div>
          )}
        </div>

        {!isAdminVerified ? (
          /* Khung xác thực Quản trị viên */
          <form
            onSubmit={handleAdminLoginSubmit}
            className="max-w-md mx-auto w-full py-6 space-y-4"
            autoComplete="off"
          >
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-stone-700">
                Email Quản trị viên:
              </label>
              <input
                type="email"
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                placeholder="Nhập email quản trị..."
                autoComplete="off"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm font-bold text-stone-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-stone-700">
                Mật khẩu Quản trị:
              </label>
              <input
                type="password"
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                placeholder="Nhập mật khẩu..."
                autoComplete="new-password"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-300 text-sm font-bold text-stone-900"
              />
            </div>

            {authError && (
              <p className="text-xs font-bold text-rose-600">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#e13829] hover:bg-[#c8281b] text-white font-black text-sm cursor-pointer shadow-sm"
            >
              Vào Bảng Quản Trị Học Viên
            </button>
          </form>
        ) : (
          /* Giao diện chính của Quản trị viên */
          <div className="space-y-5">
            {/* Thống kê tổng quan + Chuyển Tab */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('students')}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer transition-all ${
                    activeTab === 'students'
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    school
                  </span>
                  <span>
                    Tài khoản & Tiến trình Học viên ({students.length})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('codes')}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer transition-all ${
                    activeTab === 'codes'
                      ? 'bg-[#e13829] text-white shadow-sm'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    vpn_key
                  </span>
                  <span>
                    Cấp Mã Kích Hoạt 1 Lần Theo Email ({codes.length})
                  </span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold text-stone-600">
                <span className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-900 border border-rose-200">
                  JOY Full:{' '}
                  {
                    students.filter((s) => s.unlockedCourses?.['tune-in'])
                      .length
                  }{' '}
                  học viên
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-900 border border-blue-200">
                  Magic Sounds Full:{' '}
                  {
                    students.filter((s) => s.unlockedCourses?.['magic-sounds'])
                      .length
                  }{' '}
                  học viên
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200">
                  Mã đã dùng: {codes.filter((c) => c.used).length} /{' '}
                  {codes.length}
                </span>
              </div>
            </div>

            {activeTab === 'students' ? (
              /* ============================================================== */
              /* TAB 1: DANH SÁCH HỌC VIÊN & TIẾN TRÌNH HỌC TẬP ĐÃ HỌC TỚI ĐÂU */
              /* ============================================================== */
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <span className="material-symbols-outlined text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">
                      search
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm học viên theo Tên (Username) hoặc Email..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-xs sm:text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <p className="text-xs font-semibold text-stone-500">
                    Bấm vào từng học viên để xem chi tiết bé đã học được những
                    âm nào, cuốn truyện nào.
                  </p>
                </div>

                {loading ? (
                  <div className="py-12 text-center text-sm font-bold text-stone-500">
                    Đang tải danh sách học viên và tiến trình học...
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-stone-50 border border-stone-200 text-center space-y-2">
                    <span className="material-symbols-outlined text-4xl text-stone-400">
                      group
                    </span>
                    <p className="text-sm font-extrabold text-stone-700">
                      Chưa có học viên nào khớp với tìm kiếm.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredStudents.map((stu) => {
                      const isExpanded = expandedStudentEmail === stu.email;
                      const learnedSoundsCount =
                        stu.progress?.learnedSounds?.length || 0;
                      const learnedAltCount =
                        stu.progress?.learnedAltSets?.length || 0;
                      const learnedTrickyCount =
                        stu.progress?.learnedTrickyGroups?.length || 0;
                      const completedBooksCount =
                        stu.progress?.completedBooks?.length || 0;
                      const tuneInCount =
                        stu.progress?.tuneInCompletedCount || 0;
                      const hasJoyFull =
                        !!stu.unlockedCourses?.['tune-in'];
                      const hasMagicFull =
                        !!stu.unlockedCourses?.['magic-sounds'];
                      const hasSoundCodeFull =
                        !!stu.unlockedCourses?.['sound-code'];

                      return (
                        <div
                          key={stu.email}
                          className="rounded-2xl border border-stone-200 bg-stone-50/60 hover:bg-white transition-all overflow-hidden shadow-2xs"
                        >
                          {/* Hàng tóm tắt học viên */}
                          <div
                            onClick={() =>
                              setExpandedStudentEmail(
                                isExpanded ? null : stu.email
                              )
                            }
                            className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer"
                          >
                            {/* Thông tin học viên & Bài học gần nhất */}
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-base font-black text-stone-900">
                                  {stu.username}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-lg bg-stone-200/80 text-stone-800 text-xs font-bold">
                                  {stu.email}
                                </span>
                                {hasJoyFull && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-[#c8281b] border border-rose-300 text-[11px] font-black">
                                    ✓ Đã mở Full JOY
                                  </span>
                                )}
                                {hasMagicFull ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-black">
                                    ✓ Đã mở Full MAGIC SOUNDS
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold">
                                    Tài khoản Free (Nhóm 1)
                                  </span>
                                )}
                                {hasSoundCodeFull && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300 text-[11px] font-black">
                                    ✓ Đã mở Full SOUND CODE
                                  </span>
                                )}
                              </div>

                              <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">
                                  history_edu
                                </span>
                                <span>
                                  Đang học tới:{' '}
                                  <strong>
                                    {stu.progress?.lastStudiedItem ||
                                      'Mới đăng ký tài khoản'}
                                  </strong>
                                </span>
                                <span className="text-stone-400">•</span>
                                <span className="text-stone-500 font-medium">
                                  Hoạt động:{' '}
                                  {formatTime(
                                    stu.progress?.lastActiveAt || stu.createdAt
                                  )}
                                </span>
                              </p>
                            </div>

                            {/* Chỉ số Tiến trình học tập */}
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <div className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-center">
                                <span className="text-[10px] font-bold text-stone-500 block">
                                  42 Âm cơ bản
                                </span>
                                <span className="text-xs font-black text-primary">
                                  {learnedSoundsCount} / 42 âm
                                </span>
                              </div>

                              <div className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-center">
                                <span className="text-[10px] font-bold text-stone-500 block">
                                  Truyện đọc
                                </span>
                                <span className="text-xs font-black text-emerald-700">
                                  {completedBooksCount} / 70 cuốn
                                </span>
                              </div>

                              <div className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-center">
                                <span className="text-[10px] font-bold text-stone-500 block">
                                  Tune In Shadow
                                </span>
                                <span className="text-xs font-black text-[#e13829]">
                                  {tuneInCount} lần luyện
                                </span>
                              </div>

                              <div
                                className="flex items-center gap-1.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuickIssueCodeForStudent(
                                      stu.email,
                                      'tune-in'
                                    )
                                  }
                                  className="px-2.5 py-2 rounded-xl bg-[#e13829] hover:bg-[#c8281b] text-white text-xs font-black cursor-pointer flex items-center gap-1 shadow-2xs"
                                  title="Tạo mã code JOY riêng (JOY-...) cho email này và copy gửi Zalo"
                                >
                                  <span className="material-symbols-outlined text-sm">
                                    vpn_key
                                  </span>
                                  <span>Cấp mã JOY</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuickIssueCodeForStudent(
                                      stu.email,
                                      'magic-sounds'
                                    )
                                  }
                                  className="px-2.5 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-black cursor-pointer flex items-center gap-1 shadow-2xs"
                                  title="Tạo mã code Magic riêng (MS-...) cho email này và copy gửi Zalo"
                                >
                                  <span className="material-symbols-outlined text-sm">
                                    vpn_key
                                  </span>
                                  <span>Cấp mã Magic</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedStudentEmail(
                                      isExpanded ? null : stu.email
                                    )
                                  }
                                  className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-base">
                                    {isExpanded ? 'expand_less' : 'expand_more'}
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Khung mở rộng: Chi tiết học viên đã học tới đâu + Mở/Khoá khoá học */}
                          {isExpanded && (
                            <div className="p-4 pt-3 border-t border-stone-200 bg-white grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                              <div className="space-y-2 p-3 rounded-xl bg-stone-50 border border-stone-200">
                                <div className="font-black text-stone-900 uppercase tracking-wider">
                                  1. Tiến trình Khoá MAGIC SOUNDS
                                </div>
                                <p className="font-semibold text-stone-700">
                                  • <strong>Các âm đã học ({learnedSoundsCount}/42):</strong>{' '}
                                  {stu.progress?.learnedSounds?.length
                                    ? stu.progress.learnedSounds
                                        .map((s) => `/${s}/`)
                                        .join(', ')
                                    : 'Chưa học âm nào'}
                                </p>
                                <p className="font-semibold text-stone-700">
                                  • <strong>Âm thay thế ({learnedAltCount}/12 Set):</strong>{' '}
                                  {stu.progress?.learnedAltSets?.length
                                    ? stu.progress.learnedAltSets.join(', ')
                                    : 'Chưa học'}
                                </p>
                                <p className="font-semibold text-stone-700">
                                  • <strong>Tricky Words ({learnedTrickyCount}/6 Nhóm):</strong>{' '}
                                  {stu.progress?.learnedTrickyGroups?.length
                                    ? stu.progress.learnedTrickyGroups
                                        .map((g) => `Nhóm ${g}`)
                                        .join(', ')
                                    : 'Chưa học'}
                                </p>
                              </div>

                              <div className="space-y-2 p-3 rounded-xl bg-stone-50 border border-stone-200">
                                <div className="font-black text-stone-900 uppercase tracking-wider">
                                  2. Truyện đọc & Các khoá khác
                                </div>
                                <p className="font-semibold text-stone-700">
                                  • <strong>Truyện đã đọc xong ({completedBooksCount}/70):</strong>{' '}
                                  {stu.progress?.completedBooks?.length
                                    ? stu.progress.completedBooks.join(' • ')
                                    : 'Chưa hoàn thành cuốn nào'}
                                </p>
                                <p className="font-semibold text-stone-700">
                                  • <strong>Tune In (Nghe ngấm):</strong>{' '}
                                  {Math.floor(
                                    (stu.progress?.tuneInListeningSeconds || 0) /
                                      3600
                                  ) > 0
                                    ? `${Math.floor(
                                        (stu.progress?.tuneInListeningSeconds ||
                                          0) / 3600
                                      )} giờ ${Math.floor(
                                        ((stu.progress?.tuneInListeningSeconds ||
                                          0) %
                                          3600) /
                                          60
                                      )} phút`
                                    : `${Math.floor(
                                        (stu.progress?.tuneInListeningSeconds ||
                                          0) / 60
                                      )} phút ${
                                        (stu.progress?.tuneInListeningSeconds ||
                                          0) % 60
                                      } giây`}
                                </p>
                                <p className="font-semibold text-stone-700">
                                  • <strong>Tune In (Lồng tiếng):</strong> Đã lưu{' '}
                                  {tuneInCount} câu/bài lồng tiếng
                                </p>
                                <p className="font-semibold text-stone-700">
                                  • <strong>Mimic:</strong>{' '}
                                  {stu.progress?.soundToSpeechLearned?.length || 0}{' '}
                                  bài
                                </p>
                                <p className="font-semibold text-stone-700">
                                  • <strong>Kim cương thưởng:</strong> 💎{' '}
                                  {stu.progress?.diamonds ?? 60}
                                </p>
                              </div>

                              <div className="space-y-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                                <div className="space-y-1">
                                  <div className="font-black text-stone-900 uppercase tracking-wider">
                                    3. Quản lý Quyền Mở Khoá Học
                                  </div>
                                  <p className="text-[11px] text-stone-500">
                                    Cấp mã kích hoạt 1 lần cho email{' '}
                                    <strong>{stu.email}</strong> hoặc bật/tắt
                                    quyền học trực tiếp:
                                  </p>
                                </div>

                                <div className="flex flex-col gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleToggleStudentCourse(
                                        stu.email,
                                        'tune-in',
                                        hasJoyFull
                                      )
                                    }
                                    className={`w-full py-2 px-3 rounded-xl font-extrabold text-xs cursor-pointer transition-colors ${
                                      hasJoyFull
                                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                        : 'bg-[#e13829] hover:bg-[#c8281b] text-white'
                                    }`}
                                  >
                                    {hasJoyFull
                                      ? 'Thu hồi quyền Full JOY'
                                      : 'Mở Full trực tiếp JOY (Tune In)'}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleToggleStudentCourse(
                                        stu.email,
                                        'magic-sounds',
                                        hasMagicFull
                                      )
                                    }
                                    className={`w-full py-2 px-3 rounded-xl font-extrabold text-xs cursor-pointer transition-colors ${
                                      hasMagicFull
                                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                        : 'bg-primary hover:bg-primary-container text-white'
                                    }`}
                                  >
                                    {hasMagicFull
                                      ? 'Thu hồi quyền Full MAGIC SOUNDS'
                                      : 'Mở Full trực tiếp MAGIC SOUNDS'}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleToggleStudentCourse(
                                        stu.email,
                                        'sound-code',
                                        hasSoundCodeFull
                                      )
                                    }
                                    className={`w-full py-2 px-3 rounded-xl font-extrabold text-xs cursor-pointer transition-colors ${
                                      hasSoundCodeFull
                                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                                    }`}
                                  >
                                    {hasSoundCodeFull
                                      ? 'Thu hồi quyền Full SOUND CODE'
                                      : 'Mở Full trực tiếp SOUND CODE'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* ============================================================== */
              /* TAB 2: TẠO & QUẢN LÝ MÃ KÍCH HOẠT 1 LẦN GẮN VỚI EMAIL          */
              /* ============================================================== */
              <div className="space-y-5">
                {/* Form Tạo mã kích hoạt 1 lần theo Email đã chuyển khoản */}
                <form
                  onSubmit={handleCreateCodeSubmit}
                  className="bg-stone-50 border-2 border-stone-200 rounded-3xl p-4 sm:p-5 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#e13829] text-xl">
                      add_Moderator
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-stone-900">
                      Tạo Mã Kích Hoạt (Chỉ dùng 1 lần duy nhất cho đúng Email
                      học viên đã chuyển khoản)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-5">
                      <label className="block text-[11px] font-extrabold text-stone-600 mb-1">
                        Email học viên đã gửi qua Zalo sau khi chuyển khoản:
                      </label>
                      <input
                        type="email"
                        value={targetEmail}
                        onChange={(e) => setTargetEmail(e.target.value)}
                        placeholder="VD: hocvien@gmail.com..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-xs sm:text-sm font-bold text-stone-900"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-extrabold text-stone-600 mb-1">
                        Khoá học kích hoạt:
                      </label>
                      <select
                        value={selectedCourseKey}
                        onChange={(e) =>
                          setSelectedCourseKey(e.target.value as CourseKey)
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-xs sm:text-sm font-bold text-stone-900"
                      >
                        <option value="tune-in">
                          JOY - NGHE CẢM ÂM (Mã code JOY riêng)
                        </option>
                        <option value="magic-sounds">
                          MAGIC SOUNDS - ĐÁNH VẦN TIẾNG ANH (Mã code Magic riêng)
                        </option>
                        <option value="sound-code">Sound Code (Full)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-4 flex items-end">
                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 rounded-xl bg-[#e13829] hover:bg-[#c8281b] text-white text-xs sm:text-sm font-black cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <span className="material-symbols-outlined text-base">
                          vpn_key
                        </span>
                        <span>Tạo Mã Kích Hoạt 1 Lần</span>
                      </button>
                    </div>
                  </div>

                  {formMsg && (
                    <p
                      className={`text-xs font-bold ${
                        formMsg.type === 'success'
                          ? 'text-emerald-700'
                          : 'text-rose-600'
                      }`}
                    >
                      {formMsg.text}
                    </p>
                  )}

                  {newlyCreatedCode && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-extrabold text-emerald-800 uppercase">
                          Mã kích hoạt 1 lần vừa tạo cho{' '}
                          {newlyCreatedCode.targetEmail}:
                        </span>
                        <div className="text-xl font-black text-emerald-950 tracking-wider">
                          {newlyCreatedCode.code}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => copyActivationForZalo(newlyCreatedCode)}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <span className="material-symbols-outlined text-sm">
                          content_copy
                        </span>
                        <span>
                          {copiedCodeStr === newlyCreatedCode.code
                            ? 'Đã copy tin nhắn gửi Zalo!'
                            : 'Copy Mã & Tin nhắn gửi Zalo cho học viên'}
                        </span>
                      </button>
                    </div>
                  )}
                </form>

                {/* Danh sách toàn bộ Mã kích hoạt */}
                <div className="space-y-2.5">
                  <h4 className="text-sm font-black text-stone-900">
                    Danh sách Mã kích hoạt đã cấp ({codes.length})
                  </h4>

                  {codes.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 text-center text-xs font-bold text-stone-500">
                      Chưa có mã kích hoạt nào được tạo. Hãy nhập Email học viên
                      ở trên để cấp mã!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {codes.map((c) => (
                        <div
                          key={c.code}
                          className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="px-3 py-1 rounded-xl bg-white border border-stone-300 font-black text-sm text-stone-900 tracking-wider">
                              {c.code}
                            </span>
                            <span className="font-extrabold text-primary">
                              Email: {c.targetEmail}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-lg bg-stone-200 text-stone-800 font-bold uppercase text-[10px]">
                              {c.courseKey}
                            </span>
                            {c.used ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-700 font-extrabold text-[11px]">
                                Đã sử dụng 1/1 ({formatTime(c.usedAt)})
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[11px]">
                                Chưa sử dụng (Còn hiệu lực 1 lần)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-stone-400 font-medium">
                              Tạo lúc: {formatTime(c.createdAt)}
                            </span>
                            {!c.used && (
                              <button
                                type="button"
                                onClick={() => copyActivationForZalo(c)}
                                className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 font-extrabold cursor-pointer flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-xs">
                                  content_copy
                                </span>
                                <span>
                                  {copiedCodeStr === c.code
                                    ? 'Đã copy!'
                                    : 'Copy gửi Zalo'}
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
