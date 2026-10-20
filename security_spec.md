# Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Default Deny**: All unmatched paths are strictly denied (`allow read, write: if false;`).
2. **Verified Identity**: All write operations require `request.auth != null` and `request.auth.token.email_verified == true`.
3. **Owner Isolation**: A user document at `/users/{userId}` can only be read, created, or updated by `request.auth.uid == userId`, and `incoming().uid == request.auth.uid`.
4. **PII Split Collection Isolation**: Email PII is stored solely in `/users/{userId}/private/{infoId}` where `infoId == 'info'` and requires relational parent existence (`exists(/databases/$(database)/documents/users/$(userId))`) and owner match (`request.auth.uid == userId`).
5. **Temporal Integrity**: `createdAt` must equal `request.time` on create and remain immutable (`incoming().createdAt == existing().createdAt`) on update; `updatedAt` must equal `request.time` on both create and update.
6. **Strict Schema & Volumetric Limits**: All string fields have strict `.size()` bounds (`uid <= 128`, `username <= 60`, `email <= 120`) and `hasOnly` key allowlists.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Write**: `auth = null`, creating `/users/user_1` -> `PERMISSION_DENIED`.
2. **Unverified Email Write**: `auth = { uid: 'user_1', token: { email_verified: false } }`, creating `/users/user_1` -> `PERMISSION_DENIED`.
3. **Cross-User Identity Spoofing**: `auth.uid = 'attacker'`, creating `/users/victim` with `uid: 'victim'` -> `PERMISSION_DENIED`.
4. **Payload UID Mismatch**: `auth.uid = 'user_1'`, creating `/users/user_1` with `uid: 'user_2'` -> `PERMISSION_DENIED`.
5. **Shadow / Ghost Field Injection**: Creating `/users/user_1` with extra field `isAdmin: true` -> `PERMISSION_DENIED`.
6. **Oversized Username (Denial of Wallet)**: Creating `/users/user_1` with a 500-character `username` (> 60 limit) -> `PERMISSION_DENIED`.
7. **Invalid ID Poisoning**: Creating `/users/bad$id!` failing `isValidId` regex -> `PERMISSION_DENIED`.
8. **Forged Client Timestamp on Create**: Creating `/users/user_1` with `createdAt` not matching `request.time` -> `PERMISSION_DENIED`.
9. **Mutating Immutable `createdAt` on Update**: Updating `/users/user_1` with modified `createdAt` -> `PERMISSION_DENIED`.
10. **Mutating Immutable `uid` on Update**: Updating `/users/user_1` with modified `uid` -> `PERMISSION_DENIED`.
11. **PII Leak (Non-Owner Read)**: `auth.uid = 'attacker'` reading `/users/user_1/private/info` -> `PERMISSION_DENIED`.
12. **Orphaned Subcollection Write**: Creating `/users/user_1/private/info` when parent `/users/user_1` does not exist -> `PERMISSION_DENIED`.
