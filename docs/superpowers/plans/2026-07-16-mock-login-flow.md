# Mock Login Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gate the home page's profile button behind a fully mocked login flow (no Firebase calls), so profile access requires "logging in" first, and the profile page reflects the mock session with a working logout.

**Architecture:** Extend the existing `useAuthStore` (zustand) with `persist` middleware (localStorage) instead of adding a new store. New `src/features/auth/` feature folder holds the mock login logic (`useAuth` hook + mock user constant) and UI (`LoginCard`, `ProfileHudButton`), following the same `components/hooks/constants` layout already used by other features in this repo (e.g. `src/features/lobby/`). New `/login` route reuses the layered-background "scene" pattern already established on `/profile` (`background.laut` + `background.landprofile`) so it matches the existing visual language.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Zustand 5 (`persist` middleware from `zustand/middleware`), Tailwind (utility classes) + plain CSS files (existing per-page convention), `lucide-react` for the person icon.

## Global Constraints

- No Firebase SDK calls anywhere in this feature — mock only. `src/lib/firebase/auth.ts` stays untouched.
- No `any` types (TypeScript strict, per `CLAUDE.md`).
- Firebase access only through the service layer — N/A here since nothing touches Firebase.
- Routes come from `src/lib/constants/routes.ts` (`ROUTES.public.login`, `ROUTES.public.home`) — no hardcoded path strings in components.
- Cloudinary assets only via `src/assets/images/*/cloudinaryAssets.ts` getters — no hardcoded Cloudinary URLs.
- No `console.log` left in final code.
- 300-line file limit — split if a file grows past it.
- **This codebase has no automated test runner** (`package.json` has no `jest`/`vitest`/test script — confirmed by reading `package.json`). Per `CLAUDE.md` §"Sebelum Selesai", verification here means running the dev server and driving the flow in a real browser, not writing unit tests. Every task below ends with a manual browser-verification step instead of an automated test step — this is a deliberate deviation from the default TDD step shape, matching this repo's actual convention.
- Scope is exactly what's in `docs/superpowers/specs/2026-07-16-mock-login-flow-design.md` — no middleware-wide route protection, no real Firebase wiring, no admin auth changes.

---

### Task 1: Persist the auth store

**Files:**
- Modify: `src/store/useAuthStore.ts`

**Interfaces:**
- Produces: `useAuthStore` keeps its existing shape (`user`, `isInitialized`, `isLoading`, `setUser`, `setInitialized`, `setLoading`, `reset`) — only the creation wrapper changes. Later tasks import `useAuthStore` exactly as before.

- [ ] **Step 1: Add `persist` middleware**

Replace the full contents of `src/store/useAuthStore.ts` with:

```typescript
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {AppUser} from '@/src/types/auth';

interface AuthStoreState {
  user: AppUser | null;
  isInitialized: boolean;
  isLoading: boolean;
  setUser: (user: AppUser | null) => void;
  setInitialized: (isInitialized: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      user: null,
      isInitialized: false,
      isLoading: false,
      setUser: (user) => set({user}),
      setInitialized: (isInitialized) => set({isInitialized}),
      setLoading: (isLoading) => set({isLoading}),
      reset: () =>
        set({
          user: null,
          isInitialized: false,
          isLoading: false,
        }),
    }),
    {
      name: 'nusaquest-auth-storage',
      partialize: (state) => ({user: state.user}),
    },
  ),
);
```

Note: `partialize` persists only `user` — `isLoading`/`isInitialized` stay transient and always start fresh on load, which is correct since they describe in-flight state, not session state.

- [ ] **Step 2: Verify no other file breaks**

Run: `npm run lint`
Expected: no new errors referencing `useAuthStore.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/store/useAuthStore.ts
git commit -m "feat: persist auth store ke localStorage"
```

---

### Task 2: Mock auth hook + mock user

**Files:**
- Create: `src/features/auth/constants/mockUser.ts`
- Create: `src/features/auth/hooks/useAuth.ts`

**Interfaces:**
- Consumes: `useAuthStore` from `src/store/useAuthStore.ts` (Task 1) — `user`, `setUser`, `reset`.
- Produces: `useAuth()` hook returning `{ user: AppUser | null, isLoggedIn: boolean, login: () => void, logout: () => void }`. Later tasks (`ProfileHudButton`, `LoginCard`, `/profile` page) import this exact shape from `@/src/features/auth/hooks/useAuth`.

- [ ] **Step 1: Create the mock user constant**

```typescript
// src/features/auth/constants/mockUser.ts
import type {AppUser} from '@/src/types/auth';

export const MOCK_USER: AppUser = {
  uid: 'mock-user-1',
  email: 'nusaplayer@gmail.com',
  displayName: 'Nusa Player',
  googlePhotoURL: null,
  firebasePhotoURL: null,
  role: 'user',
};
```

- [ ] **Step 2: Create the `useAuth` hook**

```typescript
// src/features/auth/hooks/useAuth.ts
'use client';

import {useAuthStore} from '@/src/store/useAuthStore';
import {MOCK_USER} from '../constants/mockUser';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const reset = useAuthStore((state) => state.reset);

  return {
    user,
    isLoggedIn: user !== null,
    login: () => setUser(MOCK_USER),
    logout: () => reset(),
  };
}
```

- [ ] **Step 3: Verify types compile**

Run: `npm run lint`
Expected: no errors in `src/features/auth/`.

- [ ] **Step 4: Commit**

```bash
git add src/features/auth/constants/mockUser.ts src/features/auth/hooks/useAuth.ts
git commit -m "feat: tambah mock auth hook"
```

---

### Task 3: Profile HUD button — person icon + login gate

**Files:**
- Create: `src/features/auth/components/ProfileHudButton.tsx`
- Modify: `src/app/(public)/home/HomePageContent.tsx:96-100`

**Interfaces:**
- Consumes: `useAuth()` from Task 2 (`isLoggedIn`); `ROUTES` from `src/lib/constants/routes.ts`.
- Produces: `<ProfileHudButton />` — no props, self-contained. Replaces the existing inline HUD block.

- [ ] **Step 1: Read the current HUD block to confirm exact text to replace**

Run: `Grep -n "home-hud-profile" -A 6 "src/app/(public)/home/HomePageContent.tsx"`
Expected output includes:
```
      <div className="home-hud-profile">
        <Link href="/profile" className="block transition-transform hover:scale-105">
          <div className="h-[clamp(2.8rem,3.4vw,4rem)] w-[clamp(2.8rem,3.4vw,4rem)] rounded-full border-2 border-white/60 shadow-lg bg-blue-400 flex items-center justify-center text-white font-bold text-base">
            N
          </div>
        </Link>
      </div>
```

- [ ] **Step 2: Create `ProfileHudButton`**

```tsx
// src/features/auth/components/ProfileHudButton.tsx
'use client';

import {useRouter} from 'next/navigation';
import {User} from 'lucide-react';
import {useAuth} from '../hooks/useAuth';
import {ROUTES} from '@/src/lib/constants/routes';

export default function ProfileHudButton() {
  const router = useRouter();
  const {isLoggedIn} = useAuth();

  const handleClick = () => {
    router.push(isLoggedIn ? ROUTES.protected.profile : ROUTES.public.login);
  };

  return (
    <div className="home-hud-profile">
      <button
        type="button"
        onClick={handleClick}
        aria-label={isLoggedIn ? 'Buka profil' : 'Masuk ke akun'}
        className="block transition-transform hover:scale-105"
      >
        <div className="h-[clamp(2.8rem,3.4vw,4rem)] w-[clamp(2.8rem,3.4vw,4rem)] rounded-full border-2 border-white/60 shadow-lg bg-blue-400 flex items-center justify-center text-white">
          <User className="h-[55%] w-[55%]" strokeWidth={2.4} />
        </div>
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Wire it into `HomePageContent.tsx`**

In `src/app/(public)/home/HomePageContent.tsx`, add the import near the other component imports:

```typescript
import ProfileHudButton from '@/src/features/auth/components/ProfileHudButton';
```

Replace the block found in Step 1:

```tsx
      <div className="home-hud-profile">
        <Link href="/profile" className="block transition-transform hover:scale-105">
          <div className="h-[clamp(2.8rem,3.4vw,4rem)] w-[clamp(2.8rem,3.4vw,4rem)] rounded-full border-2 border-white/60 shadow-lg bg-blue-400 flex items-center justify-center text-white font-bold text-base">
            N
          </div>
        </Link>
      </div>
```

with:

```tsx
      <ProfileHudButton />
```

- [ ] **Step 4: Manual browser verification**

Run: `npm run dev`, navigate to `http://localhost:3000/home`.
Expected: top-right circle shows a person-outline icon (not "N"). Click it → redirected to `/login` (page doesn't exist yet until Task 4 — a 404 here is expected and fine for now; confirms the routing decision works).

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/components/ProfileHudButton.tsx "src/app/(public)/home/HomePageContent.tsx"
git commit -m "feat: ganti ikon profil jadi orang, gate ke login"
```

---

### Task 4: Login page

**Files:**
- Create: `src/features/auth/components/LoginCard.tsx`
- Create: `src/app/(public)/login/page.tsx`
- Create: `src/app/(public)/login/login.css`

**Interfaces:**
- Consumes: `useAuth()` from Task 2 (`login`); `ROUTES.public.home`; `background.laut` / `background.landprofile` from `src/assets/images/background/cloudinaryAssets.ts`; `logo.nusaquest` from `src/assets/images/home/cloudinaryAssets.ts`; `background.kayu` for the card texture; `BackButton` from `src/components/ui/BackButton.tsx`.
- Produces: `/login` route, reachable, no props needed from outside.

- [ ] **Step 1: Create `LoginCard`**

```tsx
// src/features/auth/components/LoginCard.tsx
'use client';

import Image from 'next/image';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
import {getLogoImage} from '@/src/assets/images/home/cloudinaryAssets';
import {getBackgroundImage} from '@/src/assets/images/background/cloudinaryAssets';
import {ROUTES} from '@/src/lib/constants/routes';
import {useAuth} from '../hooks/useAuth';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.4 0-13.8 4.1-17.1 10.2z"/>
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.6l-6.5-5.5C29.6 34.7 26.9 36 24 36c-5.2 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.2 39.7 16 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.5C40.9 36.8 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z"/>
    </svg>
  );
}

export default function LoginCard() {
  const router = useRouter();
  const {login} = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      login();
      router.push(ROUTES.public.home);
    }, 600);
  };

  return (
    <section className="login-card">
      <div className="login-card-bg">
        <Image src={getBackgroundImage('kayu')} alt="" fill className="login-card-image" />
      </div>

      <div className="login-card-shell">
        <Image
          src={getLogoImage('nusaquest')}
          alt="NusaQuest"
          width={140}
          height={70}
          className="login-logo"
        />

        <h1 className="login-title poppins-bold">Masuk ke NusaQuest</h1>
        <p className="login-subtitle poppins-bold">
          Lanjutkan petualangan budaya Nusantara-mu
        </p>

        <button
          type="button"
          className="login-google-btn"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <GoogleIcon />
          {isLoading ? 'Memproses...' : 'Masuk dengan Google'}
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `login.css`**

```css
/* src/app/(public)/login/login.css */

.login-scene {
  min-height: 100dvh;
  position: relative;
  width: 100%;
  overflow: hidden;
  background-color: #4ab8d4;
}

.login-bg-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.login-land-layer {
  position: absolute;
  z-index: 10;
  width: 100%;
  height: 80vh;
  bottom: -8vh;
  left: 0;
  right: 0;
}

.login-scene-image {
  object-fit: cover;
}

.login-ui-layer {
  position: absolute;
  inset: 0;
  z-index: 25;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
}

.login-card {
  position: relative;
  width: min(420px, 100%);
  border-radius: 25px;
  overflow: hidden;
}

.login-card-bg {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.login-card-image {
  object-fit: cover;
}

.login-card-shell {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: clamp(2rem, 5vw, 3rem) clamp(1.5rem, 5vw, 2.5rem);
  border: 1px solid rgba(244, 232, 198, 0.6);
  background: rgba(20, 11, 2, 0.25);
}

.login-logo {
  height: auto;
  width: clamp(100px, 22vw, 140px);
  margin-bottom: 0.5rem;
}

.login-title {
  margin: 0;
  color: #fff7df;
  font-size: clamp(1.2rem, 3vw, 1.65rem);
  text-align: center;
  text-shadow: 0 3px 0 rgba(70, 35, 9, 0.7);
}

.login-subtitle {
  margin: 0 0 0.5rem;
  color: #f9f1dd;
  font-size: clamp(0.8rem, 2vw, 0.95rem);
  text-align: center;
}

.login-google-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  background: #ffffff;
  color: #1f2937;
  border: none;
  border-radius: 999px;
  padding: 0.85rem 1.25rem;
  font-size: clamp(0.85rem, 2vw, 1rem);
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 0 rgba(0, 0, 0, 0.2);
  transition: transform 160ms ease;
}

.login-google-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.login-google-btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.login-back-button {
  position: absolute;
  top: 2rem;
  left: 2rem;
  z-index: 50;
}
```

- [ ] **Step 3: Create the page**

```tsx
// src/app/(public)/login/page.tsx
import Image from 'next/image';
import LoginCard from '@/src/features/auth/components/LoginCard';
import BackButton from '@/src/components/ui/BackButton';
import {getBackgroundImage} from '@/src/assets/images/background/cloudinaryAssets';
import './login.css';

export default function LoginPage() {
  return (
    <div className="login-scene">
      <div className="login-bg-layer">
        <Image
          src={getBackgroundImage('laut')}
          alt="Laut"
          fill
          sizes="100vw"
          className="login-scene-image"
          priority
        />
      </div>

      <div className="login-land-layer">
        <Image
          src={getBackgroundImage('landprofile')}
          alt="Daratan"
          fill
          sizes="100vw"
          className="login-scene-image"
          priority
        />
      </div>

      <div className="login-back-button">
        <BackButton href="/home" />
      </div>

      <div className="login-ui-layer">
        <LoginCard />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Manual browser verification**

Run: `npm run dev`, navigate to `http://localhost:3000/login`.
Expected: laut+land themed background, wood-panel card centered with NusaQuest logo, heading, subtitle, white "Masuk dengan Google" pill button. Click button → button shows "Memproses..." briefly → redirected to `/home`.

From `/home`, click the profile icon (Task 3) → now redirected to `/profile` instead of `/login` (since `login()` set the mock user). Refresh the browser at `/home` → click profile icon again → still goes to `/profile` (localStorage persistence working).

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/components/LoginCard.tsx "src/app/(public)/login/page.tsx" "src/app/(public)/login/login.css"
git commit -m "feat: tambah halaman login mock"
```

---

### Task 5: Wire `/profile` to the real mock session + logout

**Files:**
- Modify: `src/app/profile/page.tsx`
- Modify: `src/components/profile/ProfileCard.tsx`
- Modify: `src/app/profile/profile.css:208-212`

**Interfaces:**
- Consumes: `useAuth()` from Task 2 (`user`, `logout`).
- Produces: `ProfileCard` gains a new required prop `onLogout: () => void`, replacing the old always-disabled logout button. Any other caller of `ProfileCard` must pass this prop — grep confirms `src/app/profile/page.tsx` is the only caller.

- [ ] **Step 1: Confirm `ProfileCard` has no other callers**

Run: `Grep -rn "<ProfileCard" src`
Expected: only one match, in `src/app/profile/page.tsx`.

- [ ] **Step 2: Update `ProfileCard` to accept and use `onLogout`**

In `src/components/profile/ProfileCard.tsx`, change the props type (currently lines 9-14):

```typescript
type ProfileCardProps = {
  username: string;
  email: string;
  avatarSrc: string;
  woodSrc: string;
  onLogout: () => void;
};
```

Update the function signature (currently line 16):

```typescript
export default function ProfileCard({ username, email, avatarSrc, woodSrc, onLogout }: ProfileCardProps) {
```

Replace the disabled logout button (currently lines 54-60):

```tsx
              <button
                type="button"
                className="profile-action-btn logout poppins-bold"
                disabled
              >
                Login (coming soon)
              </button>
```

with:

```tsx
              <button
                type="button"
                id="btn-logout"
                className="profile-action-btn logout poppins-bold"
                onClick={onLogout}
              >
                Keluar
              </button>
```

- [ ] **Step 3: Wire `/profile` page to real user data**

Replace the full contents of `src/app/profile/page.tsx` with:

```tsx
'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { background } from '../../assets/images/background/cloudinaryAssets';
import { information } from '../../assets/images/information/cloudinaryAssets';
import { ROUTES } from '../../lib/constants/routes';
import { useAuth } from '../../features/auth/hooks/useAuth';
import BackButton from '../../components/ui/BackButton';
import AchievementSection from '../../components/profile/AchievementSection';
import AttributeSection from '../../components/profile/AttributeSection';
import BadgeSection from '../../components/profile/BadgeSection';
import ProfileCard from '../../components/profile/ProfileCard';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfilePanel from '../../components/profile/ProfilePanel';
import './profile.css';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const avatarSrc = user?.firebasePhotoURL || user?.googlePhotoURL || information.kertas;
  const username  = user?.displayName ?? 'Nusa Player';
  const email     = user?.email ?? '';

  const handleLogout = () => {
    logout();
    router.push(ROUTES.public.home);
  };

  return (
    <div className="profile-scene">
      <div className="profile-bg-layer">
        <Image
          src={background.laut}
          alt="Laut"
          fill
          sizes="100vw"
          className="profile-image"
          priority
        />
      </div>

      <div className="profile-land-layer">
        <Image
          src={background.landprofile}
          alt="Land"
          fill
          sizes="100vw"
          className="profile-image"
          priority
        />
      </div>

      <div className="profile-ui-layer">
        <div style={{ position: 'absolute', top: '2rem', left: '3rem', zIndex: 50, pointerEvents: 'auto' }}>
          <BackButton href="/home" />
        </div>
        <div className="profile-main-layout">

          <div className="profile-left-region">
            <ProfileCard
              username={username}
              email={email}
              avatarSrc={avatarSrc}
              woodSrc={background.kayu}
              onLogout={handleLogout}
            />
          </div>

          <div className="profile-right-region">
            <ProfileHeader
              boardSrc={information.board1}
              branchLeftSrc={information.tanamankiri}
              branchRightSrc={information.tanamankanan}
              plantSrc={information.tanaman2}
              title="Profile"
            />
            <ProfilePanel woodSrc={background.kayu} title="Profile">
              <BadgeSection />
              <AttributeSection />
              <AchievementSection />
            </ProfilePanel>
          </div>

        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Restyle the logout button color (optional polish, keep existing red — no CSS change needed)**

The existing `.profile-action-btn.logout` rule in `src/app/profile/profile.css:208-212` already styles a red button (`#f72727`), which now applies to a real, enabled "Keluar" button instead of a disabled placeholder. No CSS edit needed — confirm visually in Step 5.

- [ ] **Step 5: Manual browser verification**

Run: `npm run dev`. From `/home`, click the profile icon while logged out → `/login` → click "Masuk dengan Google" → redirected to `/home`. Click profile icon again → `/profile`.
Expected: card shows "Nusa Player" / "nusaplayer@gmail.com" (from the mock user, not hardcoded). Click "Keluar" → redirected to `/home`. Click profile icon again → back to `/login` (session cleared).

- [ ] **Step 6: Commit**

```bash
git add src/app/profile/page.tsx src/components/profile/ProfileCard.tsx
git commit -m "feat: hubungkan halaman profil ke sesi mock, aktifkan logout"
```

---

### Task 6: Full-flow regression pass

**Files:** none (verification only)

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: no errors in any file touched by Tasks 1-5. (Pre-existing errors elsewhere in the repo, e.g. `EditProfileModal.tsx`'s undefined `uploadPhoto`/`updateUserData` references, are out of scope for this plan — do not fix them here.)

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build succeeds for all files touched by this plan. If it fails on a file this plan didn't touch, that's pre-existing and out of scope — report it, don't fix it here.

- [ ] **Step 3: Full manual flow in browser**

Run: `npm run dev`, then in order:
1. `/home` → profile icon shows person icon, not "N".
2. Click it while logged out → lands on `/login`.
3. Click "Masuk dengan Google" → brief loading → lands on `/home`.
4. Click profile icon again → lands on `/profile`, shows "Nusa Player" / "nusaplayer@gmail.com".
5. Refresh the page at `/profile` → still shows the same user (persisted).
6. Click "Keluar" → lands on `/home`.
7. Click profile icon again → back to `/login` (session cleared, confirms logout worked).

- [ ] **Step 4: Update `TASK.md`**

Append an entry documenting this feature (mock login flow, no Firebase) per `CLAUDE.md` §"Sebelum Selesai" item 5.

- [ ] **Step 5: Commit**

```bash
git add TASK.md
git commit -m "docs: catat pekerjaan mock login flow di TASK.md"
```
