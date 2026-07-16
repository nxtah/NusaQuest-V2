# TASK.md — Pekerjaan yang Telah Selesai

Dokumen ini mencatat pekerjaan NusaQuest V2 yang **sudah selesai dikerjakan** sampai 15 Juli 2026.

Seluruh item di bawah sudah ada di dalam basis kode. Rencana pekerjaan lanjutan tidak dicatat di sini — lihat `PRD.md` §10.

---

## 1. Fondasi Proyek

- [x] Inisialisasi proyek Next.js 16 dengan App Router
- [x] Setup React 19 dan TypeScript dengan mode `strict`
- [x] Konfigurasi path alias `@/*` ke root proyek (`tsconfig.json`)
- [x] Setup Tailwind CSS beserta content globs untuk `src/app`, `src/components`, dan `src/features`
- [x] Konfigurasi ESLint 9 flat config (`eslint-config-next`: core-web-vitals + typescript)
- [x] Konfigurasi Prettier (single quotes, semicolon, trailing comma, printWidth 100)
- [x] Konfigurasi `next.config.ts` dengan `images.remotePatterns` untuk Cloudinary, Firebase Storage, Google user content, dan Unsplash
- [x] Setup font kustom Bauhaus (`public/fonts/Bauhaus.otf`, `@font-face` di `src/styles/fonts.css`, diimpor lewat `globals.css`)
- [x] Setup file global App Router: `layout.tsx`, `providers.tsx`, `globals.css`, `loading.tsx`, `not-found.tsx`, `global-error.tsx`

## 2. Arsitektur & Struktur Folder

- [x] Penerapan struktur feature-first di `src/features/*` (`components/`, `hooks/`, `services/`, `utils/`, `types.ts`)
- [x] Pemisahan route group `(public)` dan `(protected)` di App Router
- [x] Layer UI bersama di `src/components/` (`ui/`, `layout/`, `game-shared/`)
- [x] Layer service Firebase terpusat di `src/services/firebase/`
- [x] Layer library di `src/lib/` (`firebase/`, `cloudinary/`, `constants/`, `schemas/`, `utils/`)
- [x] Konstanta route terpusat di `src/lib/constants/routes.ts` (public, protected, admin)
- [x] Konstanta proteksi route di `src/lib/constants/auth-security.ts` (`PROTECTED_PATH_PREFIXES`, `ADMIN_PATH_PREFIXES`, `PROTECTED_API_PREFIXES`)
- [x] Definisi tipe global di `src/types/` (`auth.ts`, `firebase.types.ts`, `game.ts`, `question.ts`, `room.ts`, `user.ts`)

## 3. Halaman Publik

- [x] Root page dengan redirect ke `/home`
- [x] Homepage dengan peta Indonesia interaktif (`HomePageClient.tsx`, `HomePageContent.tsx`)
- [x] Halaman Informasi dengan filter kategori dan pencarian lewat searchParams (UI selesai; sumber data masih dummy — penyambungan ke database tercatat di `PRD.md` §10)
- [x] Halaman detail Informasi (`/information/[id]` dan `/information/[id]/detail`)
- [x] Halaman detail Destinasi (`/destination/[id]`) dengan subscribe real-time ke Firebase
- [x] Halaman Credit beserta layout-nya
- [x] Halaman Profil dengan tampilan data pengguna, achievement, dan inventory (UI selesai; sumber data masih dummy — penyambungan ke database tercatat di `PRD.md` §10)

## 4. Alur Pemilihan Game dari Peta Pulau

- [x] Komponen `InteractiveIslandLabel` — label pulau yang dapat diklik di homepage
- [x] Komponen `GameSelectionModal` — pemilihan jenis permainan (NusaCard / Ular Tangga)
- [x] Komponen `ProvinceSelectionModal` — pemilihan provinsi dari 34 provinsi Indonesia
- [x] `GameFlowContext` dan hook `useGameFlow` untuk orkestrasi state alur pemilihan
- [x] Styling modal di `modal-games.css`
- [x] Navigasi hasil pemilihan ke `/lobby/{provinsi}/{gameType}`

## 5. Lobby & Room

- [x] Halaman Lobby (`/lobby/[topicID]/[gameID]`)
- [x] Komponen `RoomSelect` — diorama rumah sebagai representasi Room 1–4 dan opsi Vs AI
- [x] Halaman Room (`/room/[gameID]/[topicID]/[roomID]`) sebagai ruang tunggu pra-permainan
- [x] Service lobby (`lobby.service.ts`) dengan join/leave room memakai `runTransaction`
- [x] Logika kapasitas room dan pembersihan ghost room
- [x] Pengelolaan `gameStatus` dan `gameStarted` pada room
- [x] Chat real-time di dalam room
- [x] Zustand store `useLobbyStore`

## 6. Game — Ular Tangga

- [x] Halaman multiplayer (`/play/[gameID]/[topicID]/[roomID]/ular-tangga`)
- [x] Halaman Vs AI (`/play/[gameID]/[topicID]/[roomID]/ular-tangga-vs-ai`)
- [x] Aturan papan di `utils/board-rules.ts` (`LADDERS`, `getLadderTarget`, `isLadderStart`)
- [x] Hook `useUlarTanggaGame` — orkestrasi lempar dadu, gerak pion, modal soal, validasi jawaban, dan pergantian giliran
- [x] Hook `useUlarTanggaTimer` — timer per giliran
- [x] Service `ular-tangga-game.service.ts` — `listenToGameState`, `updateGameState`, `movePawn`, `submitAnswer`, `nextTurn`
- [x] Sinkronisasi posisi pion, state dadu, dan aktivitas pemain (heartbeat) via Firebase
- [x] Penghapusan fitur ular dari permainan (hanya tangga yang tersisa)
- [x] Rendering papan permainan berbasis Konva

## 7. Game — NusaCard

- [x] Halaman multiplayer (`/play/[gameID]/[topicID]/[roomID]/nusa-card`)
- [x] Halaman Vs AI (`/play/[gameID]/[topicID]/[roomID]/nusa-card-vs-ai`)
- [x] Komponen `GameArea` — area permainan
- [x] Komponen `PlayerHandCards` — kartu di tangan pemain
- [x] Komponen `QuestionModal` — modal soal
- [x] Komponen `PlayerProfileNuca` — profil pemain dalam permainan
- [x] Hook `useNucaGame` — orkestrasi permainan
- [x] Hook `useNucaTimer` — timer per giliran
- [x] Service `nuca-game.service.ts` — sinkronisasi state permainan

## 8. Layer Game Bersama

- [x] Hook `useGameBootstrap` — pemuatan pemain saat mount, redirect ke home jika belum login, redirect ke lobby saat error
- [x] Hook `useGameLifecycle` — siklus hidup permainan
- [x] Service `game.service.ts` — layer bersama untuk kedua jenis permainan
- [x] Komponen `HeaderGame`, `VictoryOverlay`, `LoseOverlay` di `components/game-shared/`
- [x] Komponen `PauseModal`, `RotateDeviceOverlay`, `SettingButton` di `components/layout/`
- [x] Zustand store `useGameStore`

## 9. Dashboard Admin (admin-v2)

- [x] Halaman `/admin` yang merender `AdminDashboard`
- [x] Komponen `Sidebar` dengan menu Pertanyaan & Jawaban, Informasi, dan Kota & Provinsi
- [x] Komponen `DashboardHeader`
- [x] **Pertanyaan & Jawaban** — `QuestionsTable` dengan CRUD penuh, ter-scope per game (game1 Ular Tangga, game2 NusaCard) dan per topik (DAERAH, KULINER, MUSIK, TARI, SEJARAH, ALAM, OLAHRAGA, TRADISI)
- [x] **Informasi** — `InformasiTable` dengan CRUD penuh beserta kategori (Tutorial, Panduan, Tips, Berita, Peraturan, FAQ, Lainnya)
- [x] **Kota & Provinsi** — `KotaProvinsTable` dengan CRUD penuh untuk data destinasi (nama, provinsi dari 34 provinsi, tipe destinasi, gambar, deskripsi)
- [x] Komponen `Modal` dan `FormField` bersama untuk form tambah dan ubah data

## 10. Layer Data Firebase (RTDB)

- [x] Inisialisasi Firebase client di `src/lib/firebase/client.ts` (Auth, Realtime Database, Storage) dengan guard `assertFirebaseClientConfigured()` agar tidak throw saat konfigurasi kosong
- [x] Inisialisasi Firebase Admin SDK di `src/lib/firebase/admin.ts` (Auth + Database, mendukung service account trio maupun base64)
- [x] Wrapper typed di `src/lib/firebase/db.ts` (`dbRef`, `dbGet`, `dbSet`, `dbUpdate`, `dbPush`, `dbRemove`, `dbOnValue`)
- [x] Wrapper typed di `src/lib/firebase/storage.ts`
- [x] `base.service.ts` — wrapper CRUD generik yang mengembalikan `AppResult<T>` beserta definisi path kanonik
- [x] `users.service.ts` — CRUD profil pengguna
- [x] `rooms.service.ts` — CRUD dokumen room
- [x] `game-state.service.ts` — baca/tulis state permainan
- [x] `chat.service.ts` — pesan chat room
- [x] `admin.questions.service.ts` — CRUD soal
- [x] `admin.informasi.service.ts` — CRUD konten informasi
- [x] `admin.destination.service.ts` — CRUD data destinasi beserta tipe `KotaProvinsi`
- [x] `profile-photo.service.ts` — upload dan hapus foto profil di Firebase Storage
- [x] Hook `useUserProfile` dan `useRoomSync` di `src/hooks/firebase/`

## 11. Autentikasi (Layer Server)

- [x] Wrapper Google Sign-In di `src/lib/firebase/auth.ts` (`signInWithGoogle` dengan popup dan fallback redirect, `getAuthRedirectResult`, `signOutFirebase`, `onFirebaseAuthStateChanged`)
- [x] API route session (`/api/auth/session`) — POST menerbitkan session cookie httpOnly `nq_session` berumur 8 jam via `createSessionCookie`, GET memverifikasi session, DELETE menghapus cookie
- [x] Verifikasi ID token via `adminAuth.verifyIdToken`
- [x] Helper `withAuth(handler, { requireAdmin })` di `src/lib/utils/auth-api.ts` untuk memproteksi API route
- [x] Helper `verifyServerSession` di `src/lib/utils/server-session.ts` untuk penggunaan sisi server
- [x] Custom claim role (`role: 'admin' | 'user'`) via `getUserRoleClaim` dan `updateUserRoleClaim`
- [x] API route `/api/admin/users/role` untuk pengelolaan role
- [x] Zustand store `useAuthStore` beserta tipe `AppUser`

## 12. API Routes

- [x] `/api/auth/session` — penerbitan, verifikasi, dan penghapusan session cookie
- [x] `/api/admin/questions` — endpoint soal untuk admin
- [x] `/api/admin/users/role` — pengelolaan role pengguna
- [x] `/api/upload/signature` — pembuatan signature signed upload Cloudinary, ter-scope ke folder `nusaquest/users/{uid}`
- [x] `/api/health` — endpoint health check

## 13. Cloudinary

- [x] Integrasi Cloudinary sebagai sumber utama aset gambar
- [x] Peta aset per kategori di `src/assets/images/*/cloudinaryAssets.ts` — background, badge, game, information, loading, nuca, pause, room, dan ular-tangga
- [x] Fungsi getter aset (contoh: `getPulauImage`, `getAwanImage`)
- [x] Helper pembentuk URL di `src/lib/cloudinaryHelper.ts`
- [x] Whitelist `res.cloudinary.com` pada `next.config.ts`

## 14. Fitur Pendukung

- [x] Service achievement (`achievement.service.ts`) — record `key`, `progress`, `unlocked`, `updatedAt` per pengguna
- [x] Service inventory (`item.service.ts`) — item/potion dengan `item_name`, `item_count`, `item_img` per pengguna
- [x] Service destinasi (`destination.service.ts`) — pembacaan data destinasi dan topik
- [x] Komponen `NusaMaps` — peta topik interaktif
- [x] Service profil (`profile.service.ts`) — subscribe dan update profil, achievement, serta inventory

## 15. Komponen UI Bersama

- [x] `Button`, `Modal`, `Toast`, `Loader`, `BackButton` di `components/ui/`
- [x] `Header`, `Footer` di `components/layout/`
- [x] Komponen per halaman di `components/home/`, `components/information/`, `components/profile/`, `components/credit/`

## 16. Validasi

- [x] Skema Zod untuk domain auth (`src/lib/schemas/auth`)
- [x] Skema Zod untuk domain game (`src/lib/schemas/game`)
- [x] Skema Zod untuk domain question (`src/lib/schemas/question`)

## 17. Script Maintenance

- [x] `scripts/firebase-admin-bootstrap.mjs` — bootstrap Admin SDK untuk script Node
- [x] `scripts/rtdb-backfill.mjs` — normalisasi dan penulisan data legacy ke node RTDB (`users`, `achievements`, `items`, `rooms`, `questions`, `games`, `destination`)
- [x] `scripts/rtdb-parity-check.mjs` — smoke test CRUD RTDB
- [x] `scripts/legacy-export.sample.json` — contoh data ekspor legacy

## 18. Dokumentasi

- [x] `docs/PROJECT_CONTEXT.md` — konteks proyek, alur, aturan engineering, dan pembagian fase
- [x] `docs/FILE_GUIDE.md` — referensi arsitektur file dan folder
- [x] `docs/GAME_FLOW_GUIDE.md` — dokumentasi alur Island Interactive Selection
- [x] `docs/IMPLEMENTATION_SUMMARY.md` — ringkasan implementasi alur pemilihan game
- [x] `docs/FONTS_GUIDE.md` — panduan setup font kustom
- [x] Pemindahan seluruh dokumentasi dari root ke folder `docs/`
- [x] `PRD.md` — Product Requirements Document
- [x] `AGENTS.md` — panduan kerja untuk kontributor dan agen AI
- [x] `TASK.md` — catatan pekerjaan yang telah selesai

## 19. Maintenance

- [x] Penamaan file environment disesuaikan ke standar Next.js (`_env.local` menjadi `.env.local`)
- [x] Peningkatan versi Firebase client SDK ke `^12.16.0`

## 20. Autentikasi Google Asli + Profil di Firestore

- [x] `src/lib/firebase/client.ts` — tambah export `firebaseFirestore` (null-safe, pola sama seperti Auth/Database/Storage); `assertFirebaseClientConfigured()` tidak lagi mensyaratkan RTDB (opsional/belum di-setup di project baru)
- [x] `src/lib/firebase/auth.ts` — `signInWithGoogle()` sekarang mengembalikan `User` hasil sign-in langsung; fallback ke redirect hanya untuk `auth/popup-blocked`, bukan semua error (dulu popup ditutup pengguna pun ikut fallback ke redirect, sekarang errornya benar-benar dilempar ke caller)
- [x] `src/services/firebase/firestore/` — `base.service.ts` (wrapper `getDoc`/`setDoc`/`updateDoc` dengan `AppResult<T>`, pola sama seperti `services/firebase/rtdb/`), `users.service.ts` (`getUserProfile`, `upsertUserFromGoogle`, `updateUserProfile`) — koleksi `users/{uid}` di Firestore, skema mengikuti `AppUser` yang sudah ada
- [x] `src/app/providers.tsx` — `AuthProvider` nyata: subscribe `onFirebaseAuthStateChanged` sekali di root, sinkronkan profil Firestore ke `useAuthStore` (menangani restore sesi saat reload, bukan cuma login baru)
- [x] `src/features/auth/hooks/useAuth.ts` — `login()`/`logout()` async, panggil `signInWithGoogle`/`signOutFirebase` asli; `useAuthStore` tidak lagi di-persist ke localStorage (Firebase Auth sudah menyimpan sesinya sendiri)
- [x] `src/features/auth/components/LoginCard.tsx` — `await login()`, tampilkan pesan error kalau gagal (popup ditutup, jaringan, dll) alih-alih asumsi selalu berhasil
- [x] `firestore.rules` + `firebase.json` + `.firebaserc` — aturan `users/{uid}` hanya bisa dibaca/ditulis oleh uid yang sama; **belum di-deploy**, perlu `firebase deploy --only firestore:rules` manual
- [x] Dihapus: `src/features/auth/constants/mockUser.ts` (mock user, sudah tidak dipakai)

Catatan: RTDB belum tersedia di project Firebase baru (`nusaquest-v2-bd551`) — fitur yang masih bergantung RTDB (lobby, room, chat, admin tables) akan gagal-graceful (state kosong/error), bukan crash, sampai RTDB di-provision. Migrasi RTDB→Firestore untuk selain `users` belum dikerjakan (bertahap, sesuai permintaan).

**PENTING — diverifikasi 2026-07-16:** Firestore project `nusaquest-v2-bd551` saat ini menolak SEMUA baca/tulis dengan `403 PERMISSION_DENIED` (dicek langsung via REST API, bukan dari kode aplikasi) — rules yang tertulis di `firestore.rules` belum ter-deploy, jadi database masih pakai rules default (kemungkinan besar deny-all mode produksi). Ini artinya: (1) profil Google login tidak pernah benar-benar tersimpan ke Firestore meski popup Google-nya sendiri berhasil — makanya foto profil belum muncul di HUD, dan (2) `/information` page akan selalu kosong. Kedua hal ini BUKAN bug kode, akan langsung jalan begitu rules di-deploy. Cara paling cepat tanpa Firebase CLI: buka Firebase Console → Firestore Database → Rules, paste isi `firestore.rules`, klik Publish.

## 21. Halaman Information Berbasis Firestore

- [x] `src/services/firebase/firestore/base.service.ts` — tambah `getCollectionDocs`, `addDocument`, `deleteDocument` (sebelumnya cuma get/set/update by id)
- [x] `src/services/firebase/firestore/information.service.ts` — koleksi `informationItems` (tab, sectionTitle, title, description, imageUrl, order), CRUD + `getInformationItemsByTab` + `groupInformationItemsBySection`
- [x] `src/features/admin-v2/components/InformasiTable.tsx` — isi diganti total (bukan lagi Tutorial/FAQ): form Tab (5 pilihan tetap) + Judul Baris + Judul Kartu + Deskripsi + Image URL (wajib link Cloudinary, divalidasi client-side)
- [x] `src/app/(public)/information/page.tsx`, `[id]/page.tsx`, `[id]/detail/page.tsx` — `dummyDatabase` dihapus, diganti baca Firestore asli. Desain visual (font, frame kartu, frame popup) tidak berubah.
- [x] `src/components/information/CardList.tsx` — grid diganti dari `flex flex-wrap` ke CSS grid (max 6 kolom di desktop, otomatis turun baris)
- [x] `firestore.rules` — tambah `informationItems`: baca publik, tulis terbuka (admin panel masih password hardcode tanpa Firebase Auth asli, jadi rules gak bisa bedain admin vs pengguna lain — sama seperti tabel admin RTDB yang lain, bukan regresi baru)

Catatan: RTDB node `informasi` lama (Tutorial/Panduan/dll) dan service filenya (`admin.informasi.service.ts`) dibiarkan ada, cuma sudah gak dipanggil dari UI manapun.
