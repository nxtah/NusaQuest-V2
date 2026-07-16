# Admin Login Gate — Design

Status: Approved.

## Goal

`/admin` currently renders `AdminDashboard` (sidebar + Pertanyaan & Jawaban / Informasi / Kota & Provinsi + logout) with no gate at all — anyone with the URL gets in. Add a login gate in front of it using a fixed username/password (`admin` / `225`), no backend, no Firebase. Reuse the existing (currently unwired) `AdminLogin.tsx` component and the existing `AdminDashboard` rather than building either from scratch.

## Behavior

1. Visiting `/admin` while not logged in shows the login form (username + password only — no Google, no email).
2. Correct credentials (`admin` / `225`) → dashboard renders at the same URL.
3. Wrong credentials → inline error message, form stays.
4. Session persists across refresh via `localStorage`, so the admin doesn't need to relogin every reload.
5. Logout (existing sidebar button) clears the session → back to the login form.

## Architecture

New `src/features/admin-v2/auth/` subfolder — auth is one cohesive concern, kept together rather than scattered across `admin-v2/components/`:

- `constants/credentials.ts` — `ADMIN_USERNAME`, `ADMIN_PASSWORD`. Isolated in one file with a comment flagging this is a hardcoded client-side gate (visible in the JS bundle), not real authentication — intentional per the current ask, not a placeholder for something more secure.
- `store/useAdminAuthStore.ts` — zustand + `persist` middleware, holds only `isLoggedIn: boolean`. No new pattern — mirrors `useAuthStore`'s existing `persist` usage.
- `hooks/useAdminAuth.ts` — wraps the store: `{ isLoggedIn, login(username, password): boolean, logout() }`. `login` checks credentials and flips the store; components never see the password constants directly.
- `components/AdminLogin.tsx` — moved from `admin-v2/components/` (deleted from its old location, not duplicated). Redesigned: hardcoded Cloudinary URLs replaced with the existing `getBackgroundImage`/`getLogoImage` getters, refined spacing/typography, loading + shake-on-error states. Uses `useAdminAuth().login`.

`src/app/admin/page.tsx` becomes a thin client gate:

```tsx
const { isLoggedIn, logout } = useAdminAuth();
return isLoggedIn
  ? <AdminDashboard onLogout={logout} />
  : <AdminLogin />;
```

No new route — login and dashboard both live at `/admin`.

`AdminDashboard`, `Sidebar`, and the three CRUD tables are untouched.

## Explicitly out of scope

- No Firebase Auth, no real backend credential check.
- No `middleware.ts` / server-side route protection for `/admin` (client-side gate only, same limitation as the rest of the app's auth per `CLAUDE.md`).
- No changes to `AdminDashboard`'s menu content, CRUD tables, or the legacy `src/app/admin/{games,questions,topics,users}` pages (untouched, still dead per `CLAUDE.md`).
