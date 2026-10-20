/**
 * Firestore Security Rules Test Suite verifying that all "Dirty Dozen" payloads
 * return PERMISSION_DENIED.
 */

export interface DirtyPayloadTestCase {
  id: number;
  name: string;
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TEST_CASES: DirtyPayloadTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Write',
    path: '/users/user_1',
    operation: 'create',
    auth: null,
    payload: { uid: 'user_1', username: 'alice', unlockedTuneIn: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Email Write',
    path: '/users/user_1',
    operation: 'create',
    auth: { uid: 'user_1', email_verified: false },
    payload: { uid: 'user_1', username: 'alice', unlockedTuneIn: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Cross-User Identity Spoofing',
    path: '/users/victim',
    operation: 'create',
    auth: { uid: 'attacker', email_verified: true },
    payload: { uid: 'victim', username: 'alice', unlockedTuneIn: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Payload UID Mismatch',
    path: '/users/user_1',
    operation: 'create',
    auth: { uid: 'user_1', email_verified: true },
    payload: { uid: 'user_2', username: 'alice', unlockedTuneIn: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Shadow / Ghost Field Injection',
    path: '/users/user_1',
    operation: 'create',
    auth: { uid: 'user_1', email_verified: true },
    payload: { uid: 'user_1', username: 'alice', unlockedTuneIn: true, isAdmin: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Oversized Username (> 60 chars)',
    path: '/users/user_1',
    operation: 'create',
    auth: { uid: 'user_1', email_verified: true },
    payload: { uid: 'user_1', username: 'a'.repeat(65), unlockedTuneIn: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Invalid ID Poisoning',
    path: '/users/bad$id!',
    operation: 'create',
    auth: { uid: 'bad$id!', email_verified: true },
    payload: { uid: 'bad$id!', username: 'alice', unlockedTuneIn: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Forged Client Timestamp on Create',
    path: '/users/user_1',
    operation: 'create',
    auth: { uid: 'user_1', email_verified: true },
    payload: { uid: 'user_1', username: 'alice', unlockedTuneIn: true, createdAt: '1999-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Mutating Immutable createdAt on Update',
    path: '/users/user_1',
    operation: 'update',
    auth: { uid: 'user_1', email_verified: true },
    payload: { createdAt: '2099-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Mutating Immutable uid on Update',
    path: '/users/user_1',
    operation: 'update',
    auth: { uid: 'user_1', email_verified: true },
    payload: { uid: 'user_2' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'PII Leak (Non-Owner Read)',
    path: '/users/user_1/private/info',
    operation: 'get',
    auth: { uid: 'attacker', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Orphaned Subcollection Write',
    path: '/users/non_existent_user/private/info',
    operation: 'create',
    auth: { uid: 'non_existent_user', email_verified: true },
    payload: { uid: 'non_existent_user', email: 'test@example.com' },
    expectedResult: 'PERMISSION_DENIED',
  },
];
