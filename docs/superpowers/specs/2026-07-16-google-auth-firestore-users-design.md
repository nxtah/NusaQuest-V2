# Google Sign-In + Firestore Users — Design

Status: Approved. Scope: users/profile only — rooms/games/questions stay on RTDB for this pass.

## Goal

Replace the mock login flow (built earlier, no Firebase) with real Firebase Google Sign-In on `nusaquest-v2-bd551`, storing user profiles in Firestore instead of RTDB. Same UI entry point: click the home page profile icon → login page → "Masuk dengan Google" → real Google OAuth.

## Reference data shape

`nusaquest-d10bb-default-rtdb-export.json` → `users/{uid}` confirms the existing shape is already exactly `AppUser` (`src/types/auth.ts`): `uid`, `email`, `displayName`, `googlePhotoURL`, optional `firebasePhotoURL`, optional `role`. No redesign needed — reuse `AppUser` as the Firestore document shape, add `createdAt`/`updatedAt`.

## Architecture

**Firestore layer** (new, mirrors `src/services/firebase/rtdb/` conventions):
- `src/lib/firebase/client.ts` — add `firebaseFirestore` (null-safe, same pattern as the existing Auth/Database/Storage exports).
- `src/services/firebase/firestore/base.service.ts` — `getDoc`/`setDoc`/`updateDoc` wrappers returning `AppResult<T>` (same result type the RTDB services already use).
- `src/services/firebase/firestore/users.service.ts` — `getUserProfile(uid)`, `upsertUserFromGoogle(firebaseUser)` (create on first login, else sync existing doc into the app), `updateUserProfile(uid, partial)`.

**Auth wiring** (replaces the mock, keeps `useAuth()`'s public shape stable):
- `src/app/providers.tsx` — was an empty passthrough; becomes a real `AuthProvider` subscribing to `onFirebaseAuthStateChanged` once at app root (already implemented in `src/lib/firebase/auth.ts`, just never called). On user present, syncs the Firestore profile into `useAuthStore`; on null, resets it. Handles session restore on page load, not just fresh login.
- `src/features/auth/hooks/useAuth.ts` — `login()` becomes async: calls the existing `signInWithGoogle()`, upserts Firestore, updates the store, returns success/failure. `logout()` calls real `signOutFirebase()`.
- `src/features/auth/components/LoginCard.tsx` — awaits `login()`; redirects to `/home` on success, shows an inline error on failure (popup closed, network error, etc.) instead of assuming success.
- `src/store/useAuthStore.ts` — drop the `persist` middleware added for the mock. Firebase Auth already persists the session itself (IndexedDB/localStorage under its own key); a second localStorage cache risks showing stale data before Firebase's own listener confirms the real state.
- `src/features/auth/constants/mockUser.ts` — deleted, dead code once real auth lands.
- `ProfileHudButton`, `ProfileCard`, `/profile` page — untouched. They already consume `useAuth()`'s `{user, isLoggedIn, login, logout}`; only the hook's internals change underneath them.

**Firestore security rules** — `firestore.rules` at repo root: `users/{uid}` readable/writable only by the matching authenticated uid. Plus minimal `firebase.json` (points at the rules file) and `.firebaserc` (default project `nusaquest-v2-bd551`) so `firebase deploy --only firestore:rules` works if the user runs it themselves. **Not deployed by this work** — requires the user's own Firebase CLI login, out of reach here.

## Explicitly out of scope

- RTDB→Firestore migration for anything other than `users` (rooms, games, questions, chat, achievements, items stay on RTDB).
- Deploying Firestore rules (written + version-controlled, not pushed to Firebase).
- Profile photo re-upload to Firebase Storage (existing `firebasePhotoURL` field stays available for that later; this pass only ever populates `googlePhotoURL` from the Google account).
