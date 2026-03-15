# FILE_GUIDE.md
## NusaQuest Next.js - Penjelasan Fungsi Tiap File

Dokumen ini menjelaskan fungsi file/folder utama pada project NusaQuest versi Next.js + TypeScript.
Tujuannya agar semua anggota tim cepat paham "file ini buat apa" sebelum mulai coding.

---

## 1. Root Files

### `package.json`
- Menyimpan dependency project.
- Menyimpan script utama (`dev`, `build`, `start`, `lint`, `type-check`).

### `tsconfig.json`
- Konfigurasi TypeScript.
- Menentukan strict mode, path alias, target compiler.

### `next.config.ts`
- Konfigurasi Next.js.
- Tempat setup image domains, headers, redirects, experimental flags.

### `.env.local`
- Menyimpan environment variables private.
- Contoh: Firebase keys, Cloudinary keys.

### `.env.example`
- Template environment variables untuk tim.
- Tidak berisi secret asli.

### `eslint.config.mjs`
- Aturan linting agar kualitas code konsisten.

### `prettier.config.mjs`
- Aturan formatting agar style code seragam.

### `middleware.ts`
- Guard global route (cek auth/token/role).
- Menentukan route mana yang harus login/admin.

---

## 2. Public Assets

### `public/images/**`
- Menyimpan gambar statis.

### `public/audio/**`
- Menyimpan audio game (SFX/BGM).

### `public/icons/**`
- Icon favicon/PWA.

### `public/manifest.webmanifest`
- Konfigurasi PWA.

### `public/robots.txt`
- Aturan crawler search engine.

### `public/sitemap.xml`
- Daftar URL untuk SEO.

---

## 3. App Router Core (`src/app`)

### `src/app/layout.tsx`
- Root layout seluruh aplikasi.
- Tempat set global HTML structure, font, dan wrapper dasar.

### `src/app/providers.tsx`
- Tempat gabung provider global:
  - Auth provider
  - Toast provider
  - Theme provider (jika ada)

### `src/app/globals.css`
- CSS global aplikasi.

### `src/app/loading.tsx`
- UI loading default saat route transition.

### `src/app/not-found.tsx`
- Halaman 404.

### `src/app/global-error.tsx`
- Error boundary global.

---

## 4. Route Group Public (`src/app/(public)`)

### `src/app/(public)/home/page.tsx`
- Halaman Home.

### `src/app/(public)/login/page.tsx`
- Halaman Login.

### `src/app/(public)/information/page.tsx`
- Halaman informasi destinasi/topik.

### `src/app/(public)/destination/[id]/page.tsx`
- Halaman detail destinasi berdasarkan id.

### `src/app/(public)/credit/page.tsx`
- Halaman credit/tim.

---

## 5. Route Group Protected (`src/app/(protected)`)

### `src/app/(protected)/layout.tsx`
- Layout untuk halaman yang butuh login.
- Bisa include auth guard logic.

### `src/app/(protected)/profile/page.tsx`
- Halaman profile user.

### `src/app/(protected)/lobby/[topicID]/[gameID]/page.tsx`
- Halaman lobby pemilihan room.

### `src/app/(protected)/room/[gameID]/[topicID]/[roomID]/page.tsx`
- Halaman room sebelum mulai game.

### `src/app/(protected)/play/[gameID]/[topicID]/[roomID]/nusa-card/page.tsx`
- Halaman game NusaCard multiplayer.

### `src/app/(protected)/play/[gameID]/[topicID]/[roomID]/nusa-card-vs-ai/page.tsx`
- Halaman game NusaCard vs AI.

### `src/app/(protected)/play/[gameID]/[topicID]/[roomID]/ular-tangga/page.tsx`
- Halaman game Ular Tangga multiplayer.

### `src/app/(protected)/play/[gameID]/[topicID]/[roomID]/ular-tangga-vs-ai/page.tsx`
- Halaman game Ular Tangga vs AI.

---

## 6. Admin Area (`src/app/admin`)

### `src/app/admin/layout.tsx`
- Layout admin + role guard admin.

### `src/app/admin/page.tsx`
- Dashboard admin utama.

### `src/app/admin/questions/page.tsx`
- CRUD pertanyaan game.

### `src/app/admin/games/page.tsx`
- Pengaturan game.

### `src/app/admin/topics/page.tsx`
- Pengaturan topik.

### `src/app/admin/users/page.tsx`
- Manajemen user/role.

---

## 7. API Routes (`src/app/api`)

### `src/app/api/auth/session/route.ts`
- Endpoint server untuk session/auth validation.

### `src/app/api/upload/signature/route.ts`
- Endpoint signature upload Cloudinary (kalau signed upload).

### `src/app/api/admin/questions/route.ts`
- Endpoint admin CRUD pertanyaan (opsional server-side handling).

---

## 8. Features (`src/features`)

## `src/features/auth/`
### `components/ProtectedRoute.tsx`
- Komponen pembatas akses halaman khusus login.

### `components/AuthGuard.tsx`
- Guard reusable untuk role/permission logic.

### `hooks/useAuth.ts`
- Hook akses state auth.

### `context/AuthContext.tsx`
- Menyimpan state auth global (user, login status, loading auth).

### `services/auth.service.ts`
- Fungsi login/logout/getCurrentUser/updateSession.

### `types.ts`
- Type khusus domain auth.

## `src/features/destination/`
### `components/CardInformation.tsx`
- Card UI info destinasi.

### `components/NusaMaps.tsx`
- Peta topik interaktif.

### `services/destination.service.ts`
- Fetch topics/destinations dari backend.

### `types.ts`
- Type destination/topic.

## `src/features/lobby/`
### `components/RoomSelect.tsx`
- UI pemilihan room.

### `components/CardPlayer.tsx`
- Card pemain di room.

### `components/CardVsAi.tsx`
- Card mode vs AI.

### `components/ChatPlayer.tsx`
- Chat antarpemain.

### `services/room.service.ts`
- Operasi room: fetch/create/reset room.

### `services/player.service.ts`
- Operasi player: join/leave/sync player room.

### `types.ts`
- Type room/player state.

## `src/features/game-nuca/`
### `components/GameArea.tsx`
- Area gameplay NusaCard.

### `components/QuestionModal.tsx`
- Modal pertanyaan saat gameplay.

### `components/PlayerHandCards.tsx`
- Kartu pemain.

### `components/PlayerProfileNuca.tsx`
- Panel status pemain.

### `hooks/useNucaGame.ts`
- Hook orchestration state game NusaCard.

### `hooks/useNucaTimer.ts`
- Hook timer game NusaCard.

### `services/nuca-game.service.ts`
- Integrasi backend/firebase state NusaCard.

### `utils/nuca-rules.ts`
- Pure logic aturan NusaCard.

### `types.ts`
- Type state/data NusaCard.

## `src/features/game-ular-tangga/`
### `components/Board.tsx`
- UI board ular tangga.

### `components/Dice.tsx`
- Komponen dadu.

### `components/PlayerList.tsx`
- Daftar pemain dan status.

### `components/PlayerTurnBox.tsx`
- Info giliran pemain.

### `hooks/useUlarTanggaGame.ts`
- Hook orchestration game ular tangga.

### `hooks/useUlarTanggaTimer.ts`
- Hook timer ular tangga.

### `services/ular-tangga-game.service.ts`
- Integrasi backend state ular tangga.

### `utils/board-rules.ts`
- Pure logic tangga/ular/movement.

### `types.ts`
- Type state/data ular tangga.

## `src/features/achievements/`
### `services/achievement.service.ts`
- Operasi achievement user.

### `types.ts`
- Type achievement.

## `src/features/inventory/`
### `components/Potion.tsx`
- UI item potion.

### `services/item.service.ts`
- Operasi inventory/potion user.

### `types.ts`
- Type item inventory.

## `src/features/admin/`
### `components/*`
- Komponen UI dashboard admin.

### `services/admin-question.service.ts`
- Service CRUD pertanyaan khusus admin.

### `types.ts`
- Type domain admin.

---

## 9. Shared Components (`src/components`)

## `src/components/ui/`
### `Button.tsx`
- Tombol reusable global.

### `Modal.tsx`
- Modal reusable global.

### `Toast.tsx`
- Notifikasi reusable global.

### `Loader.tsx`
- Loading indicator global.

## `src/components/layout/`
### `Header.tsx`
- Header halaman non-game.

### `Footer.tsx`
- Footer global.

## `src/components/game-shared/`
### `HeaderGame.tsx`
- Header khusus game.

### `VictoryOverlay.tsx`
- Overlay saat menang.

### `LoseOverlay.tsx`
- Overlay saat kalah.

---

## 10. Libraries & Utilities (`src/lib`)

## `src/lib/firebase/`
### `client.ts`
- Inisialisasi Firebase client SDK.

### `auth.ts`
- Helper auth Firebase.

### `db.ts`
- Helper database Firebase.

### `storage.ts`
- Helper storage Firebase.

### `admin.ts` (optional)
- Firebase Admin SDK server-side.

## `src/lib/cloudinary/`
### `client.ts`
- Konfigurasi Cloudinary client usage.

### `upload.ts`
- Helper upload/transform gambar.

## `src/lib/constants/`
### `routes.ts`
- Konstanta semua route agar tidak hardcoded.

### `game.ts`
- Konstanta game (timer, player limit, dsb).

### `asset-map.ts`
- Mapping nama asset ke URL CDN/public.

## `src/lib/schemas/`
### `auth.schema.ts`
- Validasi payload auth.

### `game.schema.ts`
- Validasi payload gameState.

### `question.schema.ts`
- Validasi payload pertanyaan.

## `src/lib/utils/`
### `cn.ts`
- Helper merge className.

### `timer.ts`
- Helper timer generik.

### `local-storage.ts`
- Wrapper localStorage aman.

### `session.ts`
- Helper session timeout/refresh.

---

## 11. Stores (`src/store`)

### `useAuthStore.ts`
- State auth global client (jika pakai Zustand).

### `useLobbyStore.ts`
- State sementara untuk flow lobby.

### `useGameStore.ts`
- State UI game lokal client.

---

## 12. Global Types (`src/types`)

### `auth.ts`
- Type auth/user session.

### `user.ts`
- Type user profile.

### `room.ts`
- Type room dan pemain.

### `question.ts`
- Type pertanyaan.

### `game.ts`
- Type game state umum.

---

## 13. Styles (`src/styles`)

### `tokens.css`
- Variabel desain global (warna, spacing, radius, font).

### `animations.css`
- Animasi global.

### `game/nuca.css`
- Style khusus NusaCard.

### `game/ular-tangga.css`
- Style khusus Ular Tangga.

---

## 14. Rule of Thumb untuk Tim
1. Kalau file terkait halaman, cek `src/app/**/page.tsx`.
2. Kalau file terkait logic fitur, cek `src/features/<feature>/hooks` atau `services`.
3. Kalau file terkait Firebase/init/config, cek `src/lib/firebase`.
4. Kalau butuh komponen reusable, cek `src/components/ui`.
5. Jangan langsung taruh logic berat di `page.tsx`, pindahkan ke hooks/services.
