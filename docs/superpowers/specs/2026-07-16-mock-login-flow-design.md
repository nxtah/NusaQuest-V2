# Mock Login Flow — Design

Status: Approved. Scope: this feature only, no other work bundled in.

## Goal

Home page profile button currently links straight to `/profile` with a hardcoded "N" letter avatar and no auth gate. Add a login gate in front of it, using a **fully mocked** auth flow (no Firebase calls) so the UX can be validated before real Google OAuth is wired in. Real Firebase auth (`src/lib/firebase/auth.ts`) already exists and is untouched by this work — mock login must not call it.

## Behavior

1. Home HUD profile button: person-silhouette icon (not "N" letter).
2. Click profile button:
   - Not logged in → navigate to `/login`.
   - Logged in → navigate to `/profile`.
3. `/login` page: single "Masuk dengan Google" button. Click → ~600ms fake loading state → mock user set in store → redirect to `/home`. No real OAuth popup.
4. `/profile` page: becomes the "edit profile" view — reads username/email/avatar from the real auth store instead of hardcoded `"Nusa Player"` / `"player@nusaquest.com"`. Adds a **Keluar** (logout) action.
5. Logout: clears store, redirects to `/home`. Next click on the profile button requires login again (per step 2).
6. Session persists across browser refresh via `localStorage` (zustand `persist` middleware), so the mock login doesn't reset every reload.

## Architecture

**Reuse, don't duplicate**: `src/store/useAuthStore.ts` already has `user` / `setUser` / `reset`. Add `persist` middleware to it — no new store.

New feature folder `src/features/auth/` (mirrors existing `features/*` pattern — components/hooks/constants):
- `hooks/useAuth.ts` — thin hook wrapping the store: `{ user, isLoggedIn, login, logout }`. `login()` sets the mock user; `logout()` calls `store.reset()`.
- `constants/mockUser.ts` — the fake `AppUser` object returned by `login()` (uid, displayName, email, role: 'user', placeholder photo).
- `components/LoginCard.tsx` — Google button + card UI for the `/login` page.
- `components/ProfileHudButton.tsx` — replaces the hardcoded `<Link>` in the home HUD; reads `isLoggedIn`, routes accordingly, renders the person icon.

Routes:
- `src/app/(public)/login/page.tsx` — new, thin page composing `LoginCard` with a themed background (laut + land layers, consistent with `/profile`'s existing scene pattern).
- `src/app/(public)/home/HomePageContent.tsx` — swap the hardcoded profile `<Link>` block for `<ProfileHudButton />`.
- `src/app/profile/page.tsx` — read `user` from `useAuth()` instead of hardcoded strings; add logout button.

## Visual design (`/login`)

Reuses the existing "scene" composition already established on `/profile` (background.laut + background.landprofile layered, wood-panel card via `background.kayu` / `information.board1`) so it reads as the same visual language, not a bolted-on page. Card: NusaQuest logo, heading, single white pill Google button (G icon + "Masuk dengan Google" label). No other sign-in methods.

## Explicitly out of scope

- No Firebase Auth wiring (tracked separately per `CLAUDE.md` "Auth belum terpasang penuh").
- No `middleware.ts` / route-group-wide protection — only the profile button gate described above.
- No changes to legacy admin auth (`AdminLogin.tsx`) or `src/lib/firebase/auth.ts`.
- No new social/friend features.
