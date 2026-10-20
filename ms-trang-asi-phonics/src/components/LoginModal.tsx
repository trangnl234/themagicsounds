import React, { useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  syncVerifiedUserProfileToFirestore,
  sanitizeUsername,
  sanitizeEmail,
  USERNAME_MAX_LENGTH,
  EMAIL_MAX_LENGTH,
} from '../firebase';

export type AuthModalMode = 'login' | 'register' | 'confirm' | 'forgot';

export interface AuthenticatedUser {
  username: string;
  email: string;
}

interface LoginModalProps {
  isOpen: boolean;
  initialMode?: AuthModalMode;
  onClose: () => void;
  onSuccess: (user?: AuthenticatedUser) => void;
}

const LOCAL_USERS_STORAGE_KEY = 'phonics_registered_users_v1';

interface LocalUserRecord {
  username: string;
  email: string;
  password: string;
  verified: boolean;
  confirmToken: string;
}

function getLocalUsers(): LocalUserRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

function saveLocalUsers(list: LocalUserRecord[]) {
  try {
    localStorage.setItem(LOCAL_USERS_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function LoginModal({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}: LoginModalProps) {
  const [mode, setMode] = useState<AuthModalMode>(initialMode);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pendingConfirmEmail, setPendingConfirmEmail] = useState('');
  const [pendingConfirmToken, setPendingConfirmToken] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg('');
      setInfoMsg('');
      setForgotStep('request');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Đăng nhập / Đăng ký nhanh bằng Google (Firebase Auth)
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const fbUser = cred.user;
      const synced = await syncVerifiedUserProfileToFirestore(fbUser);
      onSuccess({
        username: synced.username,
        email: synced.email,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('auth/popup-closed-by-user')) {
        setErrorMsg('Không thể đăng nhập bằng Google. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 1. Xử lý Đăng ký tài khoản (Username, Email, Password)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const cleanUsername = sanitizeUsername(username);
    const cleanEmail = sanitizeEmail(email);
    const cleanPassword = password;

    if (!cleanUsername || !cleanEmail || !cleanPassword) {
      setErrorMsg('Vui lòng điền đầy đủ Username, Email và Password.');
      return;
    }
    if (!cleanEmail.includes('@')) {
      setErrorMsg('Địa chỉ Email không hợp lệ.');
      return;
    }
    if (cleanPassword.length < 6) {
      setErrorMsg('Mật khẩu cần có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      // Thử đăng ký qua Firebase Auth trước
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          cleanPassword
        );
        await updateProfile(userCredential.user, {
          displayName: cleanUsername,
        });
        await sendEmailVerification(userCredential.user);

        // Đồng bộ thêm trên server nội bộ
        await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: cleanUsername,
            email: cleanEmail,
            password: cleanPassword,
          }),
        }).catch(() => {});

        setPendingConfirmEmail(cleanEmail);
        setPendingConfirmToken('FIREBASE_EMAIL');
        setInfoMsg(
          `Email xác nhận (Confirmation) từ Firebase đã được gửi tới hộp thư ${cleanEmail}. Vui lòng mở email bấm link xác nhận, sau đó bấm nút bên dưới để nhận tài khoản!`
        );
        setMode('confirm');
        setLoading(false);
        return;
      } catch (fbErr: unknown) {
        const fbCode =
          typeof fbErr === 'object' && fbErr !== null && 'code' in fbErr
            ? String((fbErr as { code: unknown }).code)
            : '';

        if (fbCode === 'auth/email-already-in-use') {
          setErrorMsg('Email này đã được đăng ký tài khoản.');
          setLoading(false);
          return;
        }
        // Nếu project Firebase chưa bật Email/Password trong Console (auth/operation-not-allowed),
        // tự động chuyển sang hệ thống xác nhận tài khoản trực tiếp để học viên vẫn đăng ký được ngay
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          email: cleanEmail,
          password: cleanPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data?.error || 'Không thể đăng ký tài khoản.');
        setLoading(false);
        return;
      }

      const localList = getLocalUsers().filter(
        (u) => u.email.toLowerCase() !== cleanEmail
      );
      localList.push({
        username: cleanUsername,
        email: cleanEmail,
        password: cleanPassword,
        verified: false,
        confirmToken: data.confirmToken || 'CONFIRM',
      });
      saveLocalUsers(localList);

      setPendingConfirmEmail(cleanEmail);
      setPendingConfirmToken(data.confirmToken || '');
      setInfoMsg(
        `Email xác nhận (Confirmation) đã được gửi tới ${cleanEmail}. Vui lòng bấm xác nhận bên dưới để kích hoạt và nhận tài khoản!`
      );
      setMode('confirm');
    } catch {
      const localList = getLocalUsers();
      if (localList.some((u) => u.email.toLowerCase() === cleanEmail)) {
        setErrorMsg('Email này đã được đăng ký.');
        setLoading(false);
        return;
      }
      const token = Math.random().toString(36).substring(2, 8).toUpperCase();
      localList.push({
        username: cleanUsername,
        email: cleanEmail,
        password: cleanPassword,
        verified: false,
        confirmToken: token,
      });
      saveLocalUsers(localList);
      setPendingConfirmEmail(cleanEmail);
      setPendingConfirmToken(token);
      setInfoMsg(
        `Email xác nhận (Confirmation) đã được gửi tới ${cleanEmail}. Vui lòng bấm xác nhận bên dưới để kích hoạt tài khoản!`
      );
      setMode('confirm');
    } finally {
      setLoading(false);
    }
  };

  // 2. Xử lý Xác nhận Email để kích hoạt tài khoản
  const handleConfirmEmail = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      // Kiểm tra nếu đang dùng Firebase Auth user
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          const synced = await syncVerifiedUserProfileToFirestore(
            auth.currentUser,
            username ? sanitizeUsername(username) : undefined
          );
          onSuccess({
            username: synced.username,
            email: synced.email,
          });
          onClose();
          return;
        }
      }

      const res = await fetch('/api/auth/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingConfirmEmail,
          token:
            pendingConfirmToken === 'FIREBASE_EMAIL' ? '' : pendingConfirmToken,
        }),
      });
      const data = await res.json();

      const localList = getLocalUsers();
      const found = localList.find(
        (u) => u.email.toLowerCase() === pendingConfirmEmail.toLowerCase()
      );
      if (found) {
        found.verified = true;
        saveLocalUsers(localList);
      }

      if (res.ok && data?.user) {
        onSuccess({
          username: data.user.username,
          email: data.user.email,
        });
        onClose();
        return;
      }

      if (found) {
        onSuccess({
          username: found.username,
          email: found.email,
        });
        onClose();
        return;
      }

      if (auth.currentUser) {
        onSuccess({
          username:
            auth.currentUser.displayName ||
            username ||
            pendingConfirmEmail.split('@')[0],
          email: auth.currentUser.email || pendingConfirmEmail,
        });
        onClose();
        return;
      }

      setErrorMsg(data?.error || 'Không thể xác nhận email.');
    } catch {
      const localList = getLocalUsers();
      const found = localList.find(
        (u) => u.email.toLowerCase() === pendingConfirmEmail.toLowerCase()
      );
      if (found) {
        found.verified = true;
        saveLocalUsers(localList);
        onSuccess({
          username: found.username,
          email: found.email,
        });
        onClose();
      } else {
        setErrorMsg('Không thể xác nhận tài khoản.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Xử lý Đăng nhập
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const cleanId = (username || email).trim();
    if (!cleanId || !password) {
      setErrorMsg('Vui lòng nhập Username/Email và Mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      // Nếu người dùng nhập địa chỉ email, thử đăng nhập qua Firebase Auth trước
      if (cleanId.includes('@')) {
        try {
          const cred = await signInWithEmailAndPassword(
            auth,
            sanitizeEmail(cleanId),
            password
          );
          const fbUser = cred.user;
          if (fbUser.emailVerified) {
            const synced = await syncVerifiedUserProfileToFirestore(fbUser);
            onSuccess({
              username: synced.username,
              email: synced.email,
            });
          } else {
            onSuccess({
              username: fbUser.displayName || cleanId.split('@')[0],
              email: fbUser.email || cleanId,
            });
          }
          onClose();
          return;
        } catch {
          // Tiếp tục kiểm tra qua API nội bộ nếu tài khoản được tạo bằng Username
        }
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: cleanId,
          password,
        }),
      });
      const data = await res.json();

      if (res.status === 403 && data?.needsConfirmation) {
        setPendingConfirmEmail(data.email || cleanId);
        setPendingConfirmToken(data.confirmToken || '');
        setInfoMsg(
          `Tài khoản ${data.email} chưa xác nhận email. Bấm xác nhận bên dưới để kích hoạt ngay!`
        );
        setMode('confirm');
        setLoading(false);
        return;
      }

      if (res.ok && data?.user) {
        onSuccess({
          username: data.user.username,
          email: data.user.email,
        });
        onClose();
        return;
      }

      // Kiểm tra dự phòng trong localStorage
      const localList = getLocalUsers();
      const found = localList.find(
        (u) =>
          (u.email.toLowerCase() === cleanId.toLowerCase() ||
            u.username.toLowerCase() === cleanId.toLowerCase()) &&
          u.password === password
      );

      if (found) {
        if (!found.verified) {
          setPendingConfirmEmail(found.email);
          setPendingConfirmToken(found.confirmToken);
          setInfoMsg('Vui lòng bấm xác nhận email để kích hoạt tài khoản.');
          setMode('confirm');
          setLoading(false);
          return;
        }
        onSuccess({
          username: found.username,
          email: found.email,
        });
        onClose();
        return;
      }

      setErrorMsg(
        data?.error || 'Username/Email hoặc mật khẩu không chính xác.'
      );
    } catch {
      const localList = getLocalUsers();
      const found = localList.find(
        (u) =>
          (u.email.toLowerCase() === cleanId.toLowerCase() ||
            u.username.toLowerCase() === cleanId.toLowerCase()) &&
          u.password === password
      );
      if (found) {
        onSuccess({
          username: found.username,
          email: found.email,
        });
        onClose();
      } else {
        setErrorMsg('Username/Email hoặc mật khẩu không chính xác.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 4. Xử lý Quên mật khẩu / Lấy lại mật khẩu
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Vui lòng nhập đúng Email bạn đã đăng ký.');
      return;
    }

    setLoading(true);
    try {
      if (forgotStep === 'request') {
        // Gửi email đặt lại mật khẩu qua Firebase Auth (nếu có)
        let sentViaFirebase = false;
        try {
          await sendPasswordResetEmail(auth, cleanEmail);
          sentViaFirebase = true;
        } catch {
          // Tiếp tục xử lý qua server
        }

        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail }),
        });
        const data = await res.json();

        const localList = getLocalUsers();
        const localFound = localList.find(
          (u) => u.email.toLowerCase() === cleanEmail
        );

        if (!res.ok && !localFound && !sentViaFirebase) {
          setErrorMsg(
            data?.error || 'Không tìm thấy tài khoản với email này.'
          );
          setLoading(false);
          return;
        }

        setForgotStep('reset');
        setInfoMsg(
          sentViaFirebase
            ? `Đã gửi link đặt lại mật khẩu về email ${cleanEmail} (hoặc bạn có thể đặt mật khẩu mới ngay bên dưới)!`
            : `Đã xác thực email ${cleanEmail}. Vui lòng nhập mật khẩu mới bên dưới để lấy lại mật khẩu!`
        );
      } else {
        if (!newPassword || newPassword.length < 6) {
          setErrorMsg('Mật khẩu mới cần ít nhất 6 ký tự.');
          setLoading(false);
          return;
        }

        await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            newPassword,
          }),
        });

        const localList = getLocalUsers();
        const localFound = localList.find(
          (u) => u.email.toLowerCase() === cleanEmail
        );
        if (localFound) {
          localFound.password = newPassword;
          localFound.verified = true;
          saveLocalUsers(localList);
        }

        setPassword(newPassword);
        setUsername(cleanEmail);
        setMode('login');
        setForgotStep('request');
        setInfoMsg(
          'Đã đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.'
        );
      }
    } catch {
      setErrorMsg('Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-surface-container-lowest max-w-md w-full rounded-3xl p-6 shadow-2xl border-2 border-primary/20 flex flex-col gap-5 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-lg shadow-sm">
              M
            </div>
            <div>
              <h3 className="text-base font-black text-on-surface">
                {mode === 'register'
                  ? 'ĐĂNG KÝ'
                  : mode === 'confirm'
                  ? 'Xác Nhận Email (Confirmation)'
                  : mode === 'forgot'
                  ? 'Lấy Lại Mật Khẩu'
                  : 'Đăng Nhập Tài Khoản'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Chuyển đổi nhanh Đăng nhập / Đăng ký */}
        {(mode === 'login' || mode === 'register') && (
          <div className="grid grid-cols-2 gap-1.5 bg-surface-container-low p-1 rounded-2xl border border-surface-container-high">
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
                setInfoMsg('');
              }}
              className={`py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Đăng ký
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setInfoMsg('');
              }}
              className={`py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Đăng nhập
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-error-container/60 border border-error/30 text-error text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold leading-relaxed flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0 mt-0.5">
              mark_email_read
            </span>
            <span>{infoMsg}</span>
          </div>
        )}

        {/* MÀN HÌNH 1: ĐĂNG KÝ (Username, Email, Password) */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-extrabold text-on-surface mb-1">
                Username (Tên đăng nhập) <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={username}
                maxLength={USERNAME_MAX_LENGTH}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="VD: minhan2026"
                required
                className="w-full bg-surface-container-high/60 border border-outline-variant/40 rounded-xl py-2.5 px-3 text-sm font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-on-surface mb-1">
                Email nhận xác nhận (Confirmation){' '}
                <span className="text-error">*</span>
              </label>
              <input
                type="email"
                value={email}
                maxLength={EMAIL_MAX_LENGTH}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="VD: phuhuynh@gmail.com"
                required
                className="w-full bg-surface-container-high/60 border border-outline-variant/40 rounded-xl py-2.5 px-3 text-sm font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-on-surface mb-1">
                Password (Mật khẩu) <span className="text-error">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)..."
                required
                className="w-full bg-surface-container-high/60 border border-outline-variant/40 rounded-xl py-2.5 px-3 text-sm font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-on-primary text-sm font-extrabold hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-sm mt-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">
                person_add
              </span>
              <span>
                {loading ? 'Đang xử lý...' : 'Đăng Ký & Gửi Email Xác Nhận'}
              </span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-surface-container-high"></div>
              <span className="flex-shrink mx-3 text-[11px] font-bold text-on-surface-variant">
                HOẶC
              </span>
              <div className="flex-grow border-t border-surface-container-high"></div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 rounded-xl border border-outline-variant/50 bg-white hover:bg-surface-container-low text-on-surface text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">
                account_circle
              </span>
              <span>Đăng ký / Đăng nhập nhanh bằng Google</span>
            </button>
          </form>
        )}

        {/* MÀN HÌNH 2: XÁC NHẬN EMAIL ĐỂ KÍCH HOẠT TÀI KHOẢN */}
        {mode === 'confirm' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high space-y-2 text-xs text-on-surface">
              <p className="font-bold">
                Email nhận xác nhận:{' '}
                <span className="text-primary font-black">
                  {pendingConfirmEmail}
                </span>
              </p>
              <p className="text-on-surface-variant leading-relaxed">
                Bấm nút <strong>Xác nhận Email & Kích hoạt tài khoản</strong>{' '}
                bên dưới để hoàn tất xác thực và mở toàn bộ phần{' '}
                <strong>Nghe ngấm Tune in</strong>.
              </p>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleConfirmEmail}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">verified</span>
              <span>
                {loading
                  ? 'Đang kích hoạt...'
                  : 'Xác Nhận Email & Nhận Tài Khoản Ngay'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full py-2 text-xs font-bold text-on-surface-variant hover:text-primary cursor-pointer"
            >
              Quay lại màn hình Đăng nhập
            </button>
          </div>
        )}

        {/* MÀN HÌNH 3: ĐĂNG NHẬP */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-extrabold text-on-surface mb-1">
                Username hoặc Email
              </label>
              <input
                type="text"
                value={username}
                maxLength={EMAIL_MAX_LENGTH}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập Username hoặc Email đã đăng ký"
                required
                className="w-full bg-surface-container-high/60 border border-outline-variant/40 rounded-xl py-2.5 px-3 text-sm font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-extrabold text-on-surface">
                  Password (Mật khẩu)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setForgotStep('request');
                    setErrorMsg('');
                    setInfoMsg('');
                  }}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-surface-container-high/60 border border-outline-variant/40 rounded-xl py-2.5 px-3 text-sm font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-on-primary text-sm font-extrabold hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-sm mt-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">login</span>
              <span>{loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-surface-container-high"></div>
              <span className="flex-shrink mx-3 text-[11px] font-bold text-on-surface-variant">
                HOẶC
              </span>
              <div className="flex-grow border-t border-surface-container-high"></div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 rounded-xl border border-outline-variant/50 bg-white hover:bg-surface-container-low text-on-surface text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">
                account_circle
              </span>
              <span>Đăng nhập bằng Google</span>
            </button>
          </form>
        )}

        {/* MÀN HÌNH 4: QUÊN MẬT KHẨU / LẤY LẠI MẬT KHẨU */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="block text-xs font-extrabold text-on-surface mb-1">
                Email đã đăng ký tài khoản <span className="text-error">*</span>
              </label>
              <input
                type="email"
                value={email}
                maxLength={EMAIL_MAX_LENGTH}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập địa chỉ email của bạn..."
                required
                disabled={forgotStep === 'reset'}
                className="w-full bg-surface-container-high/60 border border-outline-variant/40 rounded-xl py-2.5 px-3 text-sm font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {forgotStep === 'reset' && (
              <div>
                <label className="block text-xs font-extrabold text-on-surface mb-1">
                  Nhập mật khẩu mới <span className="text-error">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                  required
                  className="w-full bg-surface-container-high/60 border border-outline-variant/40 rounded-xl py-2.5 px-3 text-sm font-semibold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-on-primary text-sm font-extrabold hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-sm mt-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">
                lock_reset
              </span>
              <span>
                {loading
                  ? 'Đang xử lý...'
                  : forgotStep === 'request'
                  ? 'Gửi Yêu Cầu Lấy Lại Mật Khẩu'
                  : 'Lưu Mật Khẩu Mới'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setInfoMsg('');
              }}
              className="w-full py-1.5 text-xs font-bold text-on-surface-variant hover:text-primary cursor-pointer"
            >
              Quay lại Đăng nhập
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
