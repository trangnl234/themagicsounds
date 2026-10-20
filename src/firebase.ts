import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  collection,
  getDocFromServer,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const ADMIN_EMAIL = 'trangnguyen.asi@gmail.com';

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validation constants matching firebase-blueprint.json & firestore.rules
export const UID_MAX_LENGTH = 128;
export const UID_REGEX = /^[a-zA-Z0-9_\-]+$/;
export const USERNAME_MAX_LENGTH = 60;
export const EMAIL_MAX_LENGTH = 120;

export function sanitizeUsername(raw: string): string {
  const trimmed = raw.trim().slice(0, USERNAME_MAX_LENGTH);
  return trimmed.length > 0 ? trimmed : 'HocVien';
}

export function sanitizeEmail(raw: string): string {
  return raw.trim().toLowerCase().slice(0, EMAIL_MAX_LENGTH);
}

/**
 * Syncs a verified user's public profile (/users/{uid}) and isolated private PII (/users/{uid}/private/info)
 * to Firestore once their email is verified.
 */
export async function syncVerifiedUserProfileToFirestore(
  user: User,
  preferredUsername?: string
): Promise<{
  username: string;
  email: string;
  unlockedTuneIn: boolean;
  unlockedMagicSounds: boolean;
  unlockedSoundCode: boolean;
  unlockedSoundToSpeech: boolean;
}> {
  const uid = user.uid.slice(0, UID_MAX_LENGTH);
  const email = sanitizeEmail(user.email || '');
  const fallbackName =
    preferredUsername ||
    user.displayName ||
    (email ? email.split('@')[0] : 'HocVien');
  const cleanUsername = sanitizeUsername(fallbackName);

  // Only write to Firestore when email is verified (required by security rules)
  if (!user.emailVerified || !UID_REGEX.test(uid)) {
    return {
      username: cleanUsername,
      email,
      unlockedTuneIn: true,
      unlockedMagicSounds: false,
      unlockedSoundCode: false,
      unlockedSoundToSpeech: true,
    };
  }

  const publicPath = `users/${uid}`;
  const publicRef = doc(db, 'users', uid);

  let existingUsername = cleanUsername;
  let existingUnlockedTuneIn = true;
  let existingUnlockedMagicSounds = false;
  let existingUnlockedSoundCode = false;
  let existingUnlockedSoundToSpeech = true;
  let exists = false;

  try {
    const snap = await getDoc(publicRef);
    if (snap.exists()) {
      exists = true;
      const data = snap.data();
      if (typeof data.username === 'string' && data.username.trim()) {
        existingUsername = sanitizeUsername(
          preferredUsername ? preferredUsername : data.username
        );
      }
      if (typeof data.unlockedTuneIn === 'boolean') {
        existingUnlockedTuneIn = data.unlockedTuneIn;
      }
      if (typeof data.unlockedMagicSounds === 'boolean') {
        existingUnlockedMagicSounds = data.unlockedMagicSounds;
      }
      if (typeof data.unlockedSoundCode === 'boolean') {
        existingUnlockedSoundCode = data.unlockedSoundCode;
      }
      if (typeof data.unlockedSoundToSpeech === 'boolean') {
        existingUnlockedSoundToSpeech = data.unlockedSoundToSpeech;
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, publicPath);
  }

  if (!exists) {
    try {
      await setDoc(publicRef, {
        uid,
        username: existingUsername,
        unlockedTuneIn: true,
        unlockedMagicSounds: false,
        unlockedSoundCode: false,
        unlockedSoundToSpeech: true,
        learnedSoundsCount: 0,
        completedBooksCount: 0,
        lastStudiedItem: 'Mới đăng ký tài khoản',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, publicPath);
    }
  } else if (preferredUsername && existingUsername !== cleanUsername) {
    try {
      await updateDoc(publicRef, {
        username: cleanUsername,
        unlockedTuneIn: existingUnlockedTuneIn,
        updatedAt: serverTimestamp(),
      });
      existingUsername = cleanUsername;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, publicPath);
    }
  }

  // Sync isolated PII subcollection (/users/{uid}/private/info) if email is valid
  if (email.length >= 3) {
    const privatePath = `users/${uid}/private/info`;
    const privateRef = doc(db, 'users', uid, 'private', 'info');
    try {
      const privSnap = await getDoc(privateRef);
      if (!privSnap.exists()) {
        await setDoc(privateRef, {
          uid,
          email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, privatePath);
    }
  }

  return {
    username: existingUsername,
    email,
    unlockedTuneIn: existingUnlockedTuneIn,
    unlockedMagicSounds: existingUnlockedMagicSounds,
    unlockedSoundCode: existingUnlockedSoundCode,
    unlockedSoundToSpeech: existingUnlockedSoundToSpeech,
  };
}

/**
 * Syncs student progress summary to their Firestore profile if logged in via Firebase Auth
 */
export async function syncProgressToFirestore(params: {
  unlockedMagicSounds?: boolean;
  unlockedSoundCode?: boolean;
  learnedSoundsCount?: number;
  completedBooksCount?: number;
  lastStudiedItem?: string;
}): Promise<void> {
  const fbUser = auth.currentUser;
  if (!fbUser || !fbUser.emailVerified) return;
  const uid = fbUser.uid.slice(0, UID_MAX_LENGTH);
  if (!UID_REGEX.test(uid)) return;

  const publicPath = `users/${uid}`;
  const publicRef = doc(db, 'users', uid);

  const updatePayload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };
  if (typeof params.unlockedMagicSounds === 'boolean') {
    updatePayload.unlockedMagicSounds = params.unlockedMagicSounds;
  }
  if (typeof params.unlockedSoundCode === 'boolean') {
    updatePayload.unlockedSoundCode = params.unlockedSoundCode;
  }
  if (typeof params.learnedSoundsCount === 'number') {
    updatePayload.learnedSoundsCount = Math.min(500, Math.max(0, Math.floor(params.learnedSoundsCount)));
  }
  if (typeof params.completedBooksCount === 'number') {
    updatePayload.completedBooksCount = Math.min(500, Math.max(0, Math.floor(params.completedBooksCount)));
  }
  if (typeof params.lastStudiedItem === 'string') {
    updatePayload.lastStudiedItem = params.lastStudiedItem.slice(0, 200);
  }

  try {
    await updateDoc(publicRef, updatePayload);
  } catch {
    // Ignore if document wasn't created yet
  }
}

export {
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
  updateDoc,
  serverTimestamp,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged,
};
export type { User };
