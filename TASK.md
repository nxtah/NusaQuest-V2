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

## 22. Perbaikan Auth Wiring &amp; Rules Pasca-Migrasi Firestore

Migrasi RTDB→Firestore yang lebih besar (rooms, gameStates, chat, questions, destinations, topics, maps, regions) sudah dikerjakan di sesi lain sebelum entri ini — RTDB sudah nggak dipakai lagi di sisi client. Entri ini nyatetin perbaikan bug yang ditemukan pas audit hasil migrasi tersebut:

- [x] `firestore.rules` — tambah `topics` (baca publik, tulis admin) dan `destinations` (baca publik, tulis butuh login — `isAuth()`, bukan `isAdmin()`, karena admin-v2 belum pakai Firebase Auth admin role beneran; dikonfirmasi ke user sebelum deploy, dipilih `isAuth()` daripada dibiarkan terbuka tanpa login). Fix rule `rooms/{roomId}` update: sebelumnya cuma `isRoomParticipant()` yang lolos, padahal itu bikin proses join room baru (nambahin diri sendiri ke `players` map) selalu ke-reject karena UID belum jadi participant. Sekarang diizinin juga kalau user nambahin dirinya sendiri dan sebelumnya belum ada di map.
- [x] Rules & indexes di-deploy ke project `nusaquest-v2-bd551` lewat Firebase CLI (`firebase deploy --only firestore:rules,firestore:indexes`) — ini deploy rules pertama buat project ini, sebelumnya database masih default deny-all. `firestore.indexes.json` juga dibersihin (hapus index single-field `users.totalPoints` yang redundant, Firestore udah otomatis nge-index single field).
- [x] **RTDB dihapus total.** `src/lib/firebase/admin.ts` — `getFirebaseAdminDb`/`getDatabase` (`firebase-admin/database`) diganti `getFirebaseAdminFirestore` (`firebase-admin/firestore`); `databaseURL` gak dipakai lagi buat init admin app.
- [x] `src/app/api/admin/questions/route.ts` — satu-satunya pemakai RTDB tersisa. Ditulis ulang total dari `getDatabase().ref('questions')` (skema legacy `question_text`/`multiple_choices`) jadi Firestore Admin SDK di koleksi `questions` dengan skema `Question` yang asli (`text`/`options`/`correctIndex`/`mapId`/`regionId`). Endpoint ini gak pernah dipanggil dari client (session cookie gak pernah di-set), tapi dipertahanin (bukan dihapus) karena ini satu-satunya jalur admin yang beneran diverifikasi server-side (`withAuth` + custom claim), beda dari admin-v2 yang password hardcode.
- [x] `src/lib/schemas/question.schema.ts` — ditulis ulang total mengikuti skema `Question` asli (sebelumnya cuma dipakai route di atas, gak ada consumer lain).
- [x] `src/lib/firebase/config.ts` — `NEXT_PUBLIC_FIREBASE_DATABASE_URL` dihapus dari `requiredClientEnv`/`firebaseClientConfig` (vestigial, gak ada consumer). `PRD.md` §11 disesuaikan.
- [x] Verifikasi: `grep -rn "firebase/database\|firebase-admin/database\|getDatabase" src/` return kosong — gak ada RTDB tersisa sama sekali di source code.
- [x] **Seed data awal ke Firestore production** (`nusaquest-v2-bd551`) — sebelumnya collection `maps`/`regions`/`questions`/`destinations` kosong total meski rules udah di-deploy (rules dan data itu dua hal beda). `scripts/seed-firestore.ts` diupdate biar bisa baca credential dari `.env.local` (`FIREBASE_ADMIN_*`) alih-alih wajib `scripts/service-account.json` yang gak ada; ditambah guard idempotent (skip kalau collection udah ada isinya) buat `questions`/`destinations`/`informationItems`. Hasil: 5 maps, 59 regions, 5 questions, 5 destinations ke-seed.
- [x] Fix bug di seed script: kode region `su` kepake dobel di map "Daerah" (Sumatera Utara & Sulawesi Utara), bikin salah satu ke-timpa karena doc ID sama (`daerah_su`). Sulawesi Utara diganti kode `sv`.
- [ ] **Belum dikerjakan — butuh keputusan:** `src/features/destination/services/destination.service.ts` (dipakai `/destination/[id]`) punya tipe `Destination`/`Topic` (`name`/`description`/`topic`) yang beda total dari `admin-destination.service.ts` (`KotaProvinsi`: `nama`/`provinsi`/`deskripsi`) yang datanya barusan di-seed ke collection `destinations` yang sama. Dua service baca collection sama dengan field beda — salah satu gak bakal kebaca bener. Collection `topics` juga gak ada skema/data referensi sama sekali. **Update:** dicek ulang, ternyata seluruh `features/destination` module (termasuk `NusaMaps.tsx`, `/destination/[id]`) gak diimpor dari manapun di `src/app` yang jalan — dead code, gak berdampak ke flow live. User pilih dibiarkan dulu, gak diprioritaskan.

## 23. Fix Bug Fatal: Alur Pilih-Provinsi Home Page Gak Nyambung ke Firestore

Ditemukan pas verifikasi end-to-end pakai browser beneran (bukan cuma baca kode) — modal "Pilih Provinsi" di home page (`ProvinceSelectionModal.tsx`) ternyata baca list statis hardcode (`PROVINCES` di `features/home/types.ts`, 34 provinsi id angka 1-34), sama persis apapun pulau/map yang diklik. ID angka itu diteruskan sebagai `topicID` ke `/lobby/${topicID}/${gameType}` lalu ke lobby/room/play — padahal soal kuis di Firestore diidentifikasi pakai `mapId`+`regionId` string (`daerah_ac`, `kuliner_jw`, dst). Akibatnya: **game bisa dimulai tapi gak akan pernah dapet soal kuis sama sekali** — `getQuestions` di `ular-tangga-game.service.ts` dan `game/services/game.service.ts` juga sama-sama pakai `topicID` yang sama buat parameter `mapId` DAN `regionId` (yang seharusnya beda nilai).

- [x] `src/features/home/types.ts` — hapus `PROVINCES`/`Province` hardcode; tambah `ISLAND_TO_MAP_ID` (map 5 label pulau statis di home page ke `mapId` Firestore, sesuai slug yang dipakai `scripts/seed-firestore.ts`).
- [x] `src/features/destination/services/regions.service.ts` — `getRegions()` sekarang terima param opsional `mapId` buat filter per-map; `getRegionById()` diganti dari fetch-semua-lalu-filter jadi direct `getDoc` by ID (lebih efisien, dipanggil tiap kali mulai game).
- [x] `src/components/home/ProvinceSelectionModal.tsx` — ganti dari render `PROVINCES` statis jadi fetch `regions` Firestore asli (scoped ke `mapId` pulau yang diklik), dengan loading/error/empty state.
- [x] `src/features/home/hooks/useGameFlow.ts` + `types.ts` — `selectedDestinationId: number` diganti `selectedRegionId: string` (regionId Firestore asli).
- [x] `src/app/(public)/home/HomePageClient.tsx` — derive `mapId` dari `islandLabel` via `ISLAND_TO_MAP_ID`, teruskan ke modal; `handleProvinceSelect` sekarang push `/lobby/${regionId}/${gameType}` pakai regionId Firestore asli, bukan angka.
- [x] Fix bug `getQuestions(topicID, topicID, ...)` (double-parameter) di `ular-tangga-game.service.ts` dan `game/services/game.service.ts` — sekarang resolve `mapId` asli lewat `getRegionById(topicID)` dulu sebelum query soal.
- [x] `firestore.indexes.json` — tambah composite index `regions` (`isActive`+`mapId`+`name`) buat query region-per-map, deploy ke production.
- [x] Verifikasi end-to-end pakai Playwright (headless Brave) langsung ke dev server: klik pulau "Kuliner Jawa Barat" → pilih "Ular Tangga" → modal provinsi nunjukin 6 wilayah kuliner asli dari Firestore (Sumatera/Jawa/Kalimantan/Sulawesi/Bali & Nusa Tenggara/Maluku & Papua), bukan lagi 34 provinsi hardcode. Klik salah satu region → URL akhir `/lobby/kuliner_sm/ular-tangga` (regionId Firestore asli). Gak ada console error atau failed request.

**Catatan — gap yang masih ada, belum dibenerin ronde ini:** NusaCard vs-AI (`nusa-card-vs-ai/page.tsx`) baca `gameState.questions`/`gameState.currentQuestionIndex` dari `game/services/game.service.ts`'s `subscribeToTypedGameState`, tapi field itu **gak pernah ada** di dokumen `GameState` Firestore asli (`types/firestore.ts` cuma punya `playerStates`/`currentPlayerIndex`/`round`/`questionsUsed`) — `subscribeToTypedGameState` cuma nge-cast paksa (`state as unknown as TGameState`) tanpa transformasi data beneran. Ini bikin progres soal NusaCard vs-AI kemungkinan besar masih rusak (selalu `undefined`/`[]`) meski bug ID di atas udah kefix. Butuh kerjaan terpisah buat nyambungin `questions`/`currentQuestionIndex` ke skema `GameState` yang beneran, atau redesign adapter-nya. Ular Tangga vs-AI lebih ringan kena dampaknya (cuma baca `gameState.pionPositions` dengan fallback ke state lokal).
- [x] `src/features/lobby/services/lobby.service.ts` — hapus `subscribeLobbyData`/`LobbyData`/`LOBBIES_COLLECTION` (dead code, koleksi `lobbies` gak pernah diisi dan gak ada pemanggilnya)
- [x] `src/types/firestore.ts` — `RoomPlayer` tambah field `name`/`photoURL` opsional
- [x] `src/features/lobby/services/rooms.service.ts` — `createRoom`/`joinRoom` sekarang nyimpen nama & foto pemain; `joinRoom` idempotent kalau UID udah ada di room (cegah "Room is full" palsu pas effect re-run)
- [x] `src/features/lobby/services/lobby.service.ts` — `getCurrentPlayers` baca `name`/`photoURL` asli, sebelumnya hardcode `''`/`undefined` jadi nama pemain di room selalu kosong
- [x] 3 halaman game — `ular-tangga/page.tsx`, `ular-tangga-vs-ai/page.tsx`, `nusa-card-vs-ai/page.tsx`: sebelumnya `const user = null as AppUser | null` di-hardcode (sisa dari refactor sebelumnya), bikin vs-AI selalu redirect balik ke `/home` (guard `useGameBootstrap` fire duluan sebelum auth resolve) dan ular-tangga multiplayer gak pernah join room. Diganti pakai `useAuth()` beneran.
- [x] `src/app/(protected)/room/[gameID]/[topicID]/[roomID]/page.tsx` — sebelumnya `playerUID` random (`guest-xxxxx` tiap mount) dan `playerName` statis `'Player'`. Diganti pakai UID/nama dari `useAuth()`.

Catatan: gap yang sengaja belum dibenerin ronde ini — `firebase-admin/database` (RTDB) masih dipakai `src/lib/firebase/admin.ts` + `/api/admin/questions/route.ts`; dua model game-state (`types/firestore.ts` generik vs `ular-tangga-game.service.ts` konkret) belum disatuin; admin-v2 masih password hardcode belum nyambung ke Firebase Auth admin role. Rules baru butuh deploy manual ke Firebase Console sebelum efektif.

## 24. Verifikasi Login + Bangun NusaCard vs-AI dari Nol

### Verifikasi login end-to-end (tanpa OAuth manual)
Google OAuth gak bisa diotomasi browser headless. Diverifikasi setara lewat Firebase Admin SDK: bikin test user disposable, mint custom token, sign-in via Firebase client SDK standalone (persis kayak yang app lakuin abis Google OAuth beneran), lalu exercise pola tulis/baca Firestore yang sama kayak service asli (join room, resolve regionId→mapId, query soal, tulis gameState) — semua lolos di bawah rules production yang sekarang aktif. Data test dihapus lagi pakai Admin SDK setelahnya (rules sengaja nolak `delete` room/gameState/user dari user biasa — itu rules jalan bener, bukan bug, jadi cleanup butuh Admin SDK yang bypass rules).

### NusaCard vs-AI — sebelumnya cuma placeholder debug
Ternyata `nusa-card-vs-ai/page.tsx` **bukan cuma salah skema field** — halamannya sendiri masih debug scaffold (`<p>Total Questions: X</p>`, tombol "Draw Card" polos, teks literal "Game Component will be rendered here"), belum pernah dibangun jadi tampilan kartu beneran. `QuestionModal.tsx` juga masih hardcode pertanyaan default ("Apa ibu kota Indonesia?") dan tombol jawabannya cuma `onClose`, gak ada logic benar/salah. **Catatan: `ular-tangga-vs-ai/page.tsx` punya masalah yang persis sama (halaman debug placeholder juga) — belum dibenerin, di luar scope kali ini.**

- [x] `src/features/game-nuca/services/nusa-card-game.service.ts` (baru) — service self-contained mengikuti pola `ular-tangga-game.service.ts` yang udah kebukti jalan (bukan reuse `game/services/game.service.ts` yang schema-nya gak nyambung ke Firestore asli). Skema `NusaCardGameState`: `players`, `playerHands` (kartu soal per player), `throwerUID` (giliran main kartu), `activeQuestion`/`answeringUID` (giliran jawab — di game ini yang jawab adalah LAWAN dari yang main kartu, sesuai desain UI `GameArea.tsx` yang udah ada), `correctCounts`/`wrongCounts`, `gameStatus`, `winnerUID`.
- [x] `initializeNusaCardGameState` — fetch soal asli (resolve `mapId` dari `regionId` dulu, pola sama kayak fix §23), bagi rata ke tangan tiap pemain (round-robin).
- [x] `playCard`/`submitAnswer` — main kartu mindahin ke `activeQuestion` + set lawan jadi `answeringUID`; submit jawaban ngecek `correctIndex`, update skor, giliran main-kartu pindah ke yang baru jawab; kalau kartu abis di kedua tangan → `gameStatus:'finished'` + `winnerUID` (skor benar terbanyak).
- [x] `src/features/game-nuca/components/QuestionModal.tsx` — tambah prop opsional `onSelectChoice`/`disabled` (backward-compatible, `GameArea.tsx` yang belum disentuh tetep jalan sama seperti sebelumnya karena prop baru opsional).
- [x] `nusa-card-vs-ai/page.tsx` — ditulis ulang total: reuse `PlayerHandCards`/`PlayerProfileNuca`/`QuestionModal` (bukan bikin komponen baru) buat layout 2-pemain (user vs AI), chrome sama kayak `nusa-card/page.tsx` (`GameBackground`, `RotateDeviceOverlay`, `PauseModal`, `SettingButton`). Bot AI: main kartu random dari tangannya setelah delay, jawab dengan ~65% peluang benar setelah delay — meniru "kesulitan" bot sederhana.
- [x] Verifikasi: `tsc --noEmit` bersih, `npm run build` sukses, lint gak ada error baru. Integration test (custom-token, pola sama kayak verifikasi login) nge-exercise pola tulis `playCard`/`submitAnswer` di bawah rules production asli — lolos semua. Browser check: route compile HTTP 200, ke-gate dengan benar di `(protected)` layout (belum login → "Memuat..." lalu redirect), gak ada console error. **Belum bisa diverifikasi visual penuh** (tampilan kartu beneran, animasi, dst) karena butuh sesi login OAuth asli yang gak bisa diotomasi — perlu dicoba manual oleh user.

**Belum dikerjakan (scope selanjutnya, sesuai urutan yang disepakati):** NusaCard multiplayer (`GameArea.tsx` masih 100% state lokal hardcode, `nusa-card/page.tsx` gak ada wiring Firestore sama sekali) dan admin-v2 → Firebase Auth admin role.

## 25. Fix Ular Tangga vs-AI (placeholder debug → UI beneran) + Bug Ketemu Selama Ngerjain

### Ular Tangga vs-AI ternyata sama kayak NusaCard vs-AI — placeholder debug
`ular-tangga-vs-ai/page.tsx` juga cuma scaffold debug (`<p>Total Questions: X</p>`, tombol "Roll Dice" polos), belum pernah dibangun jadi papan+dadu beneran.

- [x] `ular-tangga-vs-ai/page.tsx` ditulis ulang total — **reuse `Board`/`PlayerTurnBox`/`GameBackground` dari multiplayer** (`ular-tangga/page.tsx`) yang emang udah jadi & bagus, bukan bikin dari nol. Gak pakai adapter `game/services/game.service.ts` yang schema-nya gak nyambung (sama kasusnya kayak NusaCard) — langsung pakai `ular-tangga-game.service.ts` yang udah kebukti jalan.
- [x] **Trik reuse bot-takeover:** service ini udah punya mekanisme "kalau pemain offline >60 detik, pemain online lain drive giliran dia secara acak" (buat handle disconnect di multiplayer). AI opponent di vs-AI cukup di-set `playerActivity.isActive:false` permanen sejak awal — mekanisme bot-takeover yang SUDAH ADA otomatis nge-drive giliran AI (dadu + jawab acak), gak perlu logic AI baru sama sekali.

### Bug lebih dalam ketemu pas nyoba reuse: Ular Tangga (multiplayer DAN vs-AI) gak pernah punya soal kuis / kondisi menang
Field `showQuestion`/`waitingForAnswer`/`isCorrect` udah ada di skema dan di komponen (`PlayerTurnBox` udah siap render soal), tapi **gak ada satupun kode yang pernah nyalain `showQuestion:true`**, dan **gak ada cek "posisi capai 100 = menang"** di manapun. Dadu jalan, pion gerak, tangga naik otomatis tanpa syarat — tapi kuis gak pernah muncul dan game gak pernah berakhir. Ini bug di kode yang udah ada dari sebelumnya (multiplayer juga kena, bukan cuma vs-AI), dikonfirmasi dulu ke user sebelum dibenerin (nyerempet larangan CLAUDE.md soal "kondisi menang" — tapi ini nambahin yang belum ada, bukan ubah yang ada).

- [x] `ular-tangga-game.service.ts` — `movePawn`: posisi capai ≥100 → `gameStatus:'finished'`. Landing di pangkal tangga (`isLadderStart`) → **gak langsung naik otomatis**, munculin soal random dulu (`showQuestion:true`, `waitingForAnswer:true`).
- [x] `submitAnswer` — jawaban benar di pangkal tangga → baru naik ke ujung tangga (`getLadderTarget`); kalau climb sampai ≥100 juga trigger `finished`.
- [x] Berlaku otomatis buat multiplayer (`ular-tangga/page.tsx`, gak disentuh sama sekali, tetep pakai fungsi yang sama) DAN vs-AI sekaligus — satu service, satu sumber kebenaran.

### Bug ketemu & dibenerin: gak ada satupun mode vs-AI yang bisa dijangkau lewat UI
Tombol "Mulai Game" di `room/[gameID]/[topicID]/[roomID]/page.tsx` **selalu** `disabled={players.length < 2}` — gak ada pengecualian buat room vs-AI (yang emang cuma 1 pemain manusia). Field `isSinglePlayer` udah ada di skema room tapi gak pernah di-set true atau dibaca di manapun (vestigial). Efeknya: **NusaCard vs-AI yang dibangun di langkah sebelumnya, dan Ular Tangga vs-AI, dua-duanya gak bisa dijangkau sama sekali lewat alur normal** — tombol mulai permanen ke-disable.

- [x] `room/[gameID]/[topicID]/[roomID]/page.tsx` — deteksi `isVsAi` dari `gameID` (`nusa-card-vs-ai`/`ular-tangga-vs-ai`/alias lama), room dibuat dengan `isSinglePlayer:true, capacity:1`, tombol "Mulai Game" gak nunggu pemain ke-2 kalau `isVsAi`.

### Verifikasi
- [x] `tsc --noEmit` bersih, `npm run build` sukses, lint gak ada error baru (2 warning kecil di file yang disentuh langsung dibenerin: unused var, missing effect dependency).
- [x] Integration test (custom-token, pola sama kayak sebelumnya): bikin room vs-AI, fetch soal asli, simulasi `movePawn` landing di pangkal tangga → `showQuestion:true`, simulasi jawaban benar → pion naik tangga (1→60), simulasi posisi capai 100 → `gameStatus:'finished'`, simulasi set `playerActivity` AI offline — semua pola tulis lolos di bawah rules production asli.
- [ ] **Belum diverifikasi visual** (papan, animasi dadu, tampilan soal) — butuh login OAuth asli yang gak bisa diotomasi. Perlu dicoba manual oleh user.

## 26. NusaCard Multiplayer — Sambungin `GameArea.tsx` ke Firestore

`GameArea.tsx` sebelumnya 100% state lokal hardcode (`players` array statis 4 orang, `initialCards` hardcode, `throwerId=1` hardcode) dan `nusa-card/page.tsx` cuma render `<GameArea />` tanpa props sama sekali — nol koneksi Firestore.

- [x] `nusa-card-game.service.ts` digeneralisasi dari 2-pemain (vs-AI) jadi N-pemain (2-4): `throwerUID` → `throwerIndex` (posisi di array `players`, muter cyclic), `answeringUID` tunggal → `answeringQueue`/`currentAnsweringUID`/`answeredUIDs` (antrean giliran jawab — semua pemain LAIN selain yang main kartu jawab bergantian sesuai urutan, baru abis itu giliran main-kartu pindah). `nusa-card-vs-ai/page.tsx` (langkah 24) disesuaikan ke field baru — 2 pemain otomatis jadi kasus sederhana dari logic queue yang sama.
- [x] `GameArea.tsx` ditulis ulang total jadi **fully prop-driven** (bukan internal state lagi) — visual/animasi kartu dipertahankan persis (reuse `PlayerHandCards`/`PlayerProfileNuca`/`QuestionModal`), cuma sumber datanya sekarang props dari parent. Slot pemain (bawah/kiri/atas/kanan) di-guard buat 2-4 pemain (bukan cuma 4 kayak sebelumnya).
- [x] `UlarTanggaLobby.tsx` — tipe prop `players` dilonggarin dari `GamePlayer` (impor spesifik ular-tangga) jadi interface generik `{uid, displayName?, name?, photoURL?}` biar bisa dipakai ulang buat lobby NusaCard juga tanpa duplikasi komponen.
- [x] `nusa-card/page.tsx` ditulis ulang total — mirror struktur `ular-tangga/page.tsx`: join room, `UlarTanggaLobby` (reused) buat nunggu pemain + tombol mulai host, bootstrap `initializeNusaCardGameState`, subscribe `listenToGameState`, urutan pemain di-rotate biar "aku" selalu di slot bawah. Reuse `fetchGamePlayers`/`listenToGameStart`/`setGameStartStatus` dari `ular-tangga-game.service.ts` (fungsi-fungsi itu generik banget — cuma baca/tulis dokumen `rooms/{roomId}`, gak spesifik ular tangga — daripada duplikasi ulang).
- [x] Verifikasi: `tsc --noEmit` bersih, `npm run build` sukses, lint gak ada error baru (cuma warning `<img>` yang pre-existing di semua file game-nuca). Integration test 3-pemain (custom-token) nge-exercise `playCard`→antrean jawab [P2, P3]→submitAnswer P2 (queue maju ke P3)→submitAnswer P3 (ronde kelar, hand abis → `finished`) — semua pola tulis lolos di bawah rules production asli.
- [ ] **Belum diverifikasi visual** — sama seperti langkah sebelumnya, butuh login OAuth asli (idealnya 2+ akun buat multiplayer beneran) yang gak bisa diotomasi.

## 27. Redesign 5 Topik Game + Hapus Header Putih di Home

### Hapus header putih di home
`src/app/(public)/layout.tsx` — header lama (bg putih, logo + tombol Login, dari sistem auth legacy `onAuthStateChanged` manual) nabrak tema immersive home page (peta pulau full-bleed). Disembunyikan khusus buat route `/home` (`usePathname() === '/home'`), tetep tampil di halaman publik lain (`/login`, `/information`, dst).

### Redesign topik dari 5 topik lama jadi 5 topik baru yang lebih menarik buat turis + lokal
Brainstorming bareng user: topik lama (Daerah, Kuliner, Bahari, Pariwisata Darat, Permainan Daerah) diganti jadi **Kuliner, Pariwisata, Sejarah & Legenda, Budaya, Alam & Satwa** — dipilih karena tiap provinsi punya konten kaya dan menarik buat wisatawan yang penasaran soal Indonesia, sekaligus edukatif buat orang Indonesia sendiri.

**Koreksi penting user di tengah kerjaan:** rencana awal salah — bukan tiap topik pakai 6 wilayah makro (Sumatera/Jawa/dst), tapi **semua topik pakai ke-38 provinsi Indonesia yang sama sebagai region-nya**. Jadi struktur datanya 38 provinsi × 5 topik = 190 dokumen region (bukan 30).

- [x] `src/app/(public)/home/HomePageContent.tsx` — 5 label pulau diganti: "Daerah Jawa Barat"→"Sejarah & Legenda", "Pariwisata Bahari"→"Pariwisata", "Kuliner Jawa Barat"→"Kuliner", "Permainan Daerah"→"Alam & Satwa", "Pariwisata Darat"→"Budaya". Label "Credit" gak disentuh.
- [x] `src/features/home/types.ts` — `ISLAND_TO_MAP_ID` diupdate ke 5 mapId baru: `kuliner`, `pariwisata`, `sejarah-legenda`, `budaya`, `alam-satwa`.
- [x] `scripts/seed-firestore.ts` ditulis ulang total: `MAPS` (5 topik baru), `PROVINCES` (38 provinsi, reuse daftar kode yang udah ada), `PROVINCE_QUESTIONS` (190 soal — 1 per topik per provinsi, ditulis manual berbasis pengetahuan umum, bukan generate AI), `deleteOldTopicData()` (hapus `maps`/`regions`/`questions` topik lama sebelum seed ulang, dijalanin otomatis tiap run).
- [x] **Bug ketemu & dibenerin saat eksekusi:** fungsi slug nama-topik-ke-mapId salah — `"Sejarah & Legenda".replace(/\s+/g,'-').replace(/&/g,'')` hasilnya `"sejarah--legenda"` (dobel strip, karena spasi di sekitar `&` disisain), gak match sama `ISLAND_TO_MAP_ID` yang gua tulis manual (`"sejarah-legenda"`, single strip) — nyaris keulang bug ID-mismatch yang sama kayak sesi sebelumnya. Ketauan pas gua sanity-check hasil seed sebelum lanjut, dibenerin jadi `.replace(/\s*&\s*/g,'-').replace(/\s+/g,'-')`.
- [x] **Duplikasi soal ketemu & dibenerin:** karena `seedQuestions()` gak idempotent (pakai `addDoc`, bukan `set` by fixed id) dan sempet dijalanin 2x pas proses fix bug slug di atas, soal `kuliner`/`pariwisata`/`budaya` sempet dobel (77/76/76 padahal harusnya 38). Dibersihin total (hapus 5 topik baru) terus seed ulang sekali dari nol — hasil akhir persis 38 region + 38 soal per topik, 190/190 total, diverifikasi lewat query count.
- [x] Verifikasi: `tsc --noEmit` bersih, `npm run build` sukses. Browser check (Playwright headless Brave): label pulau baru muncul bener, header putih hilang di `/home`, modal "Pilih Provinsi" nunjukin ke-38 provinsi asli (Aceh s.d. Sumatera Utara alfabetis) bukan lagi 6 wilayah makro, gak ada console error.

**Catatan:** `informationItems` (buat halaman `/information`, koleksi terpisah dari topik game) TIDAK diupdate — masih pakai tab lama (Daerah/Kuliner/Bahari/dst) karena `seedInformationItems()` skip kalau koleksi udah ada isinya, dan ini di luar scope yang diminta (soal topik game, bukan halaman informasi). Gap ini dicatat, bukan dibenerin sesi ini.

## 28. Fix Bug Fatal: Slot Room Gak Ke-detect + Real-Time Lobby + Responsive Mobile

User lapor: pas masuk room, slot pemain gak ke-detect — baik diri sendiri maupun orang lain yang join.

### Akar masalah: bug di Firestore rules dari sesi sebelumnya (§22)
Fix rule self-join `rooms/{roomId}` yang gua tulis sebelumnya (`resource.data.players[uid] == null`) ternyata **selalu gagal** untuk KASUS PALING UMUM: orang pertama join room baru. Kenapa: di Firestore Security Rules (beda dari JS), bracket-indexing `map[key]` ke key yang belum ada di map **throw error**, bukan return `null`/`undefined`. Room baru punya `players: {}` (map kosong) — begitu ada yang coba join, `resource.data.players[uid]` langsung throw, seluruh rule dianggap gagal, ditolak `PERMISSION_DENIED`. Ini kejadian ke SEMUA percobaan join room baru — bug fatal yang lolos dari verifikasi sesi sebelumnya karena script verifikasi waktu itu bikin room lewat `addDoc` dengan `players` udah keisi dari awal (pakai rule `create`, bukan `update` self-join), gak pernah nge-tes jalur yang paling umum (`update` ke room kosong).

- [x] `firestore.rules` — `isRoomParticipant()` dan rule self-join `rooms/{roomId}` ditulis ulang pakai helper `hasPlayer(data, uid)` yang cek `'players' in data && uid in data.players` — aman baik pas field `players` gak ada sama sekali maupun map-nya kosong.
- [x] **Bug susulan ketemu pas testing race condition** (2 orang join room baru barengan): kalau `players` field bener-bener gak ada di dokumen (bukan cuma kosong), rule versi pertama masih throw juga. Perlu `hasPlayer()` cek keberadaan field `'players' in data` dulu sebelum cek key di dalamnya.
- [x] `src/app/(protected)/room/[gameID]/[topicID]/[roomID]/page.tsx` — `setDoc` bikin dokumen room dasar sekarang **gak** ikut nulis `players: {}` (biar gak nimpa punya orang lain kalau ada yang join barengan), dan dibungkus try/catch sendiri yang non-fatal (kalau gagal karena room-nya udah keburu dibuat orang lain, itu wajar, lanjut aja ke proses join — bukan dianggap error).
- [x] `src/features/lobby/services/rooms.service.ts` — `joinRoom` di-guard `room.players?.[userId]` dan `room.maxPlayers != null && ...` (gak crash kalau field belum ada).
- [x] Diverifikasi lewat integration test (custom-token, 2-3 test user paralel): join room baru sendirian ✅, 2 orang join room baru BARENGAN (race condition) — dua-duanya kedetect ✅, orang ke-3 join room yang udah settle ✅.

### Polling → real-time listener (biar kayak lobby game pada umumnya)
Sebelumnya slot di-update lewat `setInterval` polling tiap 3 detik (`getCurrentPlayers`) — delay sampai 3 detik buat ke-detect, bukan instant kayak lobby game beneran. Juga nampilin pemain yang UDAH LEAVE (cuma di-set `isActive:false`, gak pernah difilter).

- [x] `src/features/lobby/services/lobby.service.ts` — fungsi baru `listenToRoomPlayers(roomID, callback)`: `onSnapshot` real-time di dokumen room, auto-update tiap ada perubahan (join/leave), filter `isActive !== false` (pemain yang leave gak nongol lagi), dan diurutkan by `joinedAt` (host = yang join paling duluan, gak gantung urutan field object yang gak dijamin stabil).
- [x] Room page: ganti `setInterval`+`getCurrentPlayers` jadi `listenToRoomPlayers`. `isFirstPlayer`/host ditentuin dari `players[0]` (hasil sort by joinedAt), bukan state terpisah yang gak akurat (`isFirstPlayer` versi lama nge-set true buat SEMUA orang kalau `players.length <= 1`, gak pernah bener-bener identifikasi host).
- [x] Dead code dibuang: `subscribeRooms`/`roomData` (query broken — filter `mapId`/`gameType` yang gak pernah match struktur room yang dibuat di halaman ini) dan hardcoded check `roomID === 'room5'` yang gak jelas asalnya.
- [x] Error join sekarang ditampilin ke user (`joinError` state + `.room-join-error` style) — sebelumnya silent `catch {}`, gagal join gak kelihatan sama sekali.

### Responsive mobile portrait
Slot 2×2 grid di mobile portrait bikin konten kepanjangan — header "RUANG N" dan tombol "Mulai Game"/"Kembali ke Lobby" ke-cut dari viewport (gak ada scroll yang kepake dengan baik dalam praktiknya). Diverifikasi lewat harness HTML statis (reuse `room.css` asli, screenshot Playwright di beberapa ukuran viewport) karena halaman room butuh login buat diakses.

- [x] `room.css` — tambah media query baru `@media (max-width: 639px)`: grid dipaksa `repeat(4, 1fr)` (sejajar 1 baris, sama kayak desktop) dengan ukuran avatar/font di-scale down proporsional, BUKAN nge-stack 2×2. Media query desktop (`min-width:640px`) dan landscape mobile yang udah ada sebelumnya **tidak disentuh sama sekali**.
- [x] Diverifikasi visual: mobile portrait (390×844) sekarang nampilin 4 slot sejajar + header + tombol semua keliatan dalam satu layar tanpa scroll. Tablet & landscape mobile dicek gak kesenggol perubahan.

### Verifikasi
`tsc --noEmit` bersih, `npm run build` sukses. Rules baru udah di-deploy ke production (2x — sekali buat fix awal, sekali lagi buat fix susulan pas ketauan lewat testing race condition).

## 29. Fix Bug Fatal: Game-State Kosong Pas Masuk ke Halaman Play (NusaCard & Ular Tangga)

User tes pake 2 akun beneran, berhasil masuk lobby & room, tapi di NusaCard pemain gak ke-detect sama sekali (termasuk diri sendiri) begitu masuk ke halaman game.

### Akar masalah: room page nge-flip status room SEBELUM game-state yang bener sempet dibikin
Tombol "Mulai Game" di `room/[gameID]/[topicID]/[roomID]/page.tsx` sebelumnya manggil `startGameInRoom` → `rooms.service.ts`'s `startGame()`, yang (a) langsung nulis `status:'playing'` ke room, dan (b) nyoba bikin dokumen `gameStates` pake skema generik lama (`types/firestore.ts`, `playerStates`) yang gak dipake game manapun — dan bahkan itu pun gagal-diam (fallback `addDoc` bikin ID random, bukan `roomId`, jadi gak pernah kebaca siapapun).

Sementara itu, `initializeNusaCardGameState`/`initializeUlarTanggaGameState` (yang beneran ngisi soal + urutan pemain) cuma dipanggil dari tombol "Mulai Permainan" masing-masing DI DALAM halaman `/play/.../nusa-card` dan `/play/.../ular-tangga` sendiri — yang cuma muncul kalau `gameStarted` masih `false`. Karena room udah keburu nge-set `status:'playing'` SEBELUM redirect ke situ, begitu halaman itu dimuat, `gameStarted` langsung `true`, tombol "Mulai Permainan" versi masing-masing game gak pernah kepencet, dan `gameState` tetep `null` selamanya.

**Kenapa cuma NusaCard yang keliatan rusak, Ular Tangga kesannya "jalan":** `ular-tangga/page.tsx` fallback ke data pemain dari room (`fetchGamePlayers`) buat nampilin profil pemain di `PlayerTurnBox` walau `gameState` kosong — jadi kelihatan "orangnya ke-detect" padahal sebenernya dadu/soal/gameplay-nya juga sama rusaknya (gameState-nya tetep gak pernah ke-init). NusaCard gak kebagian fallback yang sama karena butuh `gameState.playerHands` buat nampilin kartu di tangan.

- [x] `room/[gameID]/[topicID]/[roomID]/page.tsx` — tombol "Mulai Game" sekarang manggil bootstrap yang BENERAN sesuai `gameID` (`initializeUlarTanggaGameState` atau `initializeNusaCardGameState`, lengkap dengan fetch+shuffle soal beneran) SEBELUM nge-flip status room ke `'playing'`. vs-AI tetep pakai `startGameInRoom` (gak kena bug ini karena vs-AI page bootstrap sendiri, gak nunggu status room).
- [x] Tambah state `starting` buat feedback tombol ("Menyiapkan game...") selama fetch soal + init berlangsung (bisa agak lama).
- [x] Diverifikasi lewat integration test 2-pemain (custom-token): host + pemain kedua join room, host "mulai game" — gameState NusaCard beneran ke-init dengan 2 pemain asli SEBELUM status room jadi `'playing'`, dan pas "halaman play" baca gameState-nya, datanya udah lengkap.
- [x] `tsc --noEmit` bersih, `npm run build` sukses.

**Catatan:** tombol "Mulai Permainan" versi lama di dalam `ular-tangga/page.tsx`/`nusa-card/page.tsx` (dengan `UlarTanggaLobby`) sekarang jadi dead code buat alur normal (lewat room page) — dibiarin sebagai fallback, gak dihapus, karena masih bisa kepake kalau ada jalur lain yang langsung ke `/play/...` tanpa lewat `/room/...`. Belum diverifikasi visual (butuh 2 akun login asli) — user diminta coba lagi.

## 30. Fix Bug Fatal: Dokumen Room/GameState Numpuk Antar-Game (Cross-Game Collision)

User coba lagi pake 2 akun beneran, kena crash runtime: `Cannot read properties of undefined (reading '<uid>')` di `gameState.playerHands[myUID]`.

### Akar masalah: Firestore document ID room cuma pake slug mentah, gak di-scope per game
`rooms/{roomID}` dan `gameStates/{roomID}` selama ini pakai ID dokumen = slug URL mentah (`"room1"`, `"room2"`, ..., `"roomvs-ai"`) — **TIDAK** menyertakan `gameID`/`topicID`. Padahal slot room (`room1`-`room4`, `roomvs-ai`) dipakai ULANG buat game apapun (`RoomSelect.tsx` selalu nawarin `room1`-`room4` + `vs-ai` gak peduli lagi maen Ular Tangga atau NusaCard). Akibatnya: sesi Ular Tangga di "room1" dan sesi NusaCard di "room1" (topik sama atau beda) baca-tulis ke **dokumen Firestore yang identik**. Kejadian nyata: user tes Ular Tangga duluan di room1 (nyisain `gameStates/room1` dengan skema Ular Tangga: `pionPositions`, `playerStates`, dst, status room ketinggalan `'playing'`), terus tes NusaCard di room1 juga — halaman baca dokumen gameState lama itu, yang gak punya `playerHands` sama sekali (field itu cuma ada di skema NusaCard) → crash.

- [x] **Bersihin data lama yang nyangkut** — dikonfirmasi dulu ke user sebelum hapus (`room1`-`room4` + `gameStates` terkait) via Admin SDK, karena ini data production real (bukan skenario yang di-assume aman dihapus sepihak).
- [x] **Fix struktural**: tiap halaman yang baca/tulis room atau gameState (`room/[gameID]/[topicID]/[roomID]/page.tsx`, `play/.../ular-tangga/page.tsx`, `play/.../ular-tangga-vs-ai/page.tsx`, `play/.../nusa-card/page.tsx`, `play/.../nusa-card-vs-ai/page.tsx`) sekarang hitung `roomKey = \`${gameID}_${topicID}_${roomID}\`` dan pakai `roomKey` itu (bukan `roomID` mentah) buat SEMUA pemanggilan service yang baca/tulis Firestore (`playerJoinRoom`, `fetchGamePlayers`, `listenToGameStart`, `initializeXGameState`, `listenToGameState`, `movePawn`, `submitAnswer`, dst). `roomID` mentah tetap dipakai buat URL (`resolveGameRoute`, `router.push`) dan display (label "RUANG 1") — TIDAK pernah bocor ke path URL, cuma internal buat Firestore doc ID.
- [x] Diverifikasi lewat integration test: bikin sesi Ular Tangga "selesai" (status `'playing'`) di scoped-key slot `room1`, terus coba baca/tulis slot NusaCard di slug mentah yang sama — dokumennya kebukti BEDA (gak numpuk), NusaCard dapet room/gameState fresh (`status` bukan `'playing'` warisan, gameState gak eksis).
- [x] **Lapis pertahanan tambahan**: `gameState.playerHands[myUID]` dan `gameState.players[gameState.throwerIndex]` di `nusa-card/page.tsx` dan `nusa-card-vs-ai/page.tsx` di-guard pake optional chaining (`?.`) — kalaupun suatu saat ada gameState yang formatnya gak sesuai (skenario tak terduga lain), halaman fallback ke array kosong / `null` alih-alih crash total.
- [x] `tsc --noEmit` bersih, `npm run build` sukses, lint gak ada error baru (cuma warning exhaustive-deps yang harmless karena `roomID` dipertahankan di dependency array meski cuma dipakai buat guard, bukan lagi buat query).

## 31. Fix Layout Room Lobby Rusak di Mobile Landscape

User konfirmasi fix §30 berhasil, lanjut lapor: mobile portrait udah bener (hasil §28), tapi mobile **landscape** desainnya hancur.

### Akar masalah: dua override di media query landscape yang gak konsisten sama layout barunya
`@media (max-height: 600px) and (orientation: landscape)` di `room.css` ngubah `.room-player-slot` dari kolom (avatar atas, nama bawah) jadi row (avatar-nama sejajar horizontal) — tapi dua hal gak ikut disesuaikan:

1. `clip-path: polygon(...)` (bentuk "bendera" lancip di bawah, didesain buat box tinggi vertikal) tetap kewarisin dari base rule apa adanya. Diterapkan ke box pendek-lebar hasil `flex-direction: row`, bentuknya jadi motong konten dan nampilin garis bawah bergelombang/pecah di sepanjang baris 4 slot.
2. `.room-actions` diubah row (`flex-direction: row`), tapi `.room-btn-start`/`.room-btn-back` gak di-override `width` — base rule (buat kolom) masing-masing punya `width:100%`. Dua elemen `width:100%` berdampingan dalam satu row container rebutan tempat, bikin tombol "Mulai Game" ke-squeeze kecil dan teksnya wrap dua baris di sebelah "Kembali ke Lobby".

**Percobaan pertama salah arah:** ronde pertama fix ini ngubah bentuk slot landscape jadi row/kotak biasa (`clip-path:none`) biar gak nabrak lagi — secara teknis gak "pecah" lagi, tapi user gak mau tampilannya BEDA dari desktop, maunya sama persis cuma diskalain kecil. Diulang dengan pendekatan yang bener.

- [x] `room.css` — dalam blok `@media (max-height: 600px) and (orientation: landscape)` SAJA: **dipertahankan** `flex-direction: column` + `clip-path` bendera bawaan dari base rule (gak di-override sama sekali, jadi bentuknya identik sama desktop) — cuma `padding`/`min-height`/ukuran avatar/font di-`clamp()` jauh lebih kecil biar muat di viewport pendek. `.room-actions` juga dikembalikan ke `flex-direction: column` (ikut base rule, sama kayak desktop — tombol "Mulai Game" di atas "Kembali ke Lobby", bukan sejajar), cuma lebar di-cap `max-width:260px` dan font/padding diperkecil.
- [x] Base rule (dipakai desktop & portrait), media query `min-width:640px` (desktop), dan media query `max-width:639px` (portrait, hasil §28) **tidak disentuh sama sekali**.
- [x] Diverifikasi visual pakai harness HTML statis (reuse `room.css` asli) + screenshot Playwright headless Brave, dibandingin langsung side-by-side: desktop (1280×800), iPhone SE landscape (667×375), iPhone 14 landscape (844×390), mobile portrait (390×844, regresi check) — landscape sekarang secara visual identik sama desktop (bentuk bendera, avatar bulat di atas nama, tombol bertumpuk vertikal), cuma versi mini yang muat tanpa scroll.
- [x] `tsc --noEmit` bersih.

**Catatan:** belum diverifikasi di device fisik beneran (cuma emulasi viewport browser) — disaranin user cek langsung di HP.

## 32. Hapus Header Putih Global di Semua Halaman Public

Fix §27 sebelumnya cuma nyembunyiin header putih khusus di `/home`. User laporan header putih itu masih nongol di halaman Informasi dan Login, minta dihapus di semua halaman.

### Akar masalah
`src/app/(public)/layout.tsx` render `<header>` literal (`bg-white`, sticky top, logo + tombol Login/Logout/Lobby dari sistem auth manual `onAuthStateChanged`) yang wrap SEMUA route dalam route group `(public)`. Cuma `/home` yang di-special-case skip. Halaman lain (`/login`, `/information`, `/information/[id]`, `/credit`, `/destination/[id]`) semua kebagian header putih ini, nabrak tema masing-masing.

- [x] Dicek dulu tiap halaman `(public)` sebelum hapus header: `login`, `credit`, `information`, `information/[id]` semua udah punya `BackButton`/`Link` sendiri ke `/home` (lewat `NavBar`/komponen masing-masing) — navigasi balik gak ilang. Fungsi login/logout juga udah ditangani sendiri di UI `/home`.
- [x] `src/app/(public)/layout.tsx` disederhanain total — hapus `<header>` beserta logic auth-state/logout yang cuma dipakai buat header itu, tinggal `return <>{children}</>`. Perlakuan yang sebelumnya khusus `/home` sekarang berlaku semua halaman public.
- [x] `tsc --noEmit` bersih, `npm run lint` gak nambah error/warning baru (error yang ada di output lint semua pre-existing di file lain, gak terkait perubahan ini).

**Catatan:** `npm run build` belum dijalanin ulang buat perubahan ini (diskip atas permintaan user). Disaranin cek visual langsung di browser buat pastiin gak ada halaman public yang kehilangan cara navigasi balik.

## 33. Overlay "Putar HP" Berlaku Global + Redesign Sesuai Tema

User minta overlay instruksi landscape (`RotateDeviceOverlay`) berlaku di **seluruh web**, bukan cuma di beberapa halaman, dan didesain ulang biar cocok sama tema game (bukan lagi kotak polos cyan generik).

### Sebelumnya: cuma dipasang manual di 7 halaman, desain generik
`RotateDeviceOverlay.tsx` cuma solid `bg-cyan-900` + ikon HP muter polos, dan dipasang manual satu-satu di `nusa-card`, `ular-tangga`, `nusa-card-vs-ai`, `ular-tangga-vs-ai`, `information`, `information/[id]`, `information/[id]/detail` — halaman lain (`/home`, `/login`, `/credit`, `/lobby`, `/room`, `/destination/[id]`, `/profile`, `/admin`) sama sekali gak ada proteksi landscape.

- [x] `src/components/layout/RotateDeviceOverlay.tsx` didesain ulang — pakai `background.bgNusa` (aset yang sama dipakai halaman lain) diblur sebagai backdrop + overlay gradasi hijau tua, kartu tengah bergaya "papan kayu" (`font-bauhaus` heading, palet cream/coklat konsisten sama `PauseModal`/`PageHeader`), ikon HP muter diselimutin cincin kompas (conic-gradient CSS, motif eksplorasi peta khas tema NusaQuest) sebagai elemen signature, animasi rotate custom (`nq-rotate-phone`) — semua pakai `motion-safe:` (otomatis hormat `prefers-reduced-motion`).
- [x] Overlay dipindah dari dipasang manual per-halaman jadi **satu implementasi** di `src/app/layout.tsx` (root layout, di luar `<Providers>`) — otomatis berlaku ke SEMUA route termasuk yang sebelumnya gak kebagian (`/home`, `/login`, dst).
- [x] Hapus import + JSX `<RotateDeviceOverlay />` yang lama dari 7 halaman yang sebelumnya pasang manual (termasuk 2 pemakaian dobel di `nusa-card/page.tsx` dan `ular-tangga/page.tsx` — dua return branch beda) — biar gak dobel render.
- [x] `tsc --noEmit` bersih, lint gak nambah masalah baru di file yang disentuh.
- [x] Diverifikasi visual via `npm run dev` + Playwright headless Brave: viewport portrait (390×844) di `/login` DAN `/home` (halaman yang sebelumnya gak ada overlay sama sekali) sama-sama nampilin overlay baru; landscape (844×390) dan desktop (1280×800) overlay-nya gak muncul, halaman render normal.

**Catatan:** `npm run build` belum dijalanin ulang.

## 34. Satukan Semua Animasi Loading Jadi Satu Desain (Langit + Awan)

User minta animasi loading di SELURUH halaman web pakai satu desain aja — yang "langit" (gradient biru + dua awan animasi + teks "LOADING NUSAQUEST..."), yang sebelumnya cuma jadi `src/app/loading.tsx` (loading route-level Next.js bawaan, otomatis kepake beberapa tempat via Suspense).

### Sebelumnya: 5+ desain loading beda-beda tersebar di berbagai halaman
- `(protected)/layout.tsx` — render `<div className="loader" />` tapi class `.loader` **gak pernah didefinisikan di CSS manapun** (bug lama, gate auth semua halaman protected jadi cuma nampilin teks "Memuat..." tanpa animasi sama sekali).
- `(protected)/lobby/page.tsx` — emoji ⏳ raw dikasih `animate-spin`.
- `room/[gameID]/[topicID]/[roomID]/page.tsx` — spinner custom CSS (`.room-loading-spinner`, ring putih muter) di `room.css`.
- 4 halaman play (`nusa-card`, `nusa-card-vs-ai`, `ular-tangga`, `ular-tangga-vs-ai`) — masing-masing spinner ring putih (`border-4 border-white border-t-transparent animate-spin`) atau (di `nusa-card-vs-ai`) malah cuma teks tanpa animasi.

- [x] `src/components/ui/Loader.tsx` — sebelumnya stub kosong (`return null`, gak dipakai di manapun), diisi jadi komponen desain langit yang di-reuse (dipindah dari `src/app/loading.tsx`), lengkap dengan `Loader.module.css` (animasi awan masuk + teks fade). Ditambah prop `message` (custom teks) dan `fullScreen` (default `true` — full-bleed `min-h-screen`; `false` — versi ringkas buat ditempel inline di dalam section halaman yang kontennya lain udah kebuka, pakai animasi "bob" ringan sendiri karena animasi awan versi full-screen pakai unit `vw`/`vh` yang gak masuk akal diterapkan ke container kecil).
- [x] `src/app/loading.tsx` sekarang cuma `return <Loader />` — satu sumber desain, `loading.module.css` lama di root `app/` dihapus (duplikat, udah pindah ke `components/ui/Loader.module.css`).
- [x] Ganti semua loading state custom di atas jadi pakai `<Loader />` (full-screen) buat yang gate seluruh halaman (`(protected)/layout.tsx`, `room/.../page.tsx`, 4 halaman play), dan `<Loader fullScreen={false} />` buat yang cuma bagian dari halaman yang udah kebuka (`lobby/page.tsx` — list ruangan). CSS mati (`.room-loading`, `.room-loading-spinner`, `@keyframes spin` custom di `room.css`) dihapus.
- [x] `src/components/auth/ProtectedRoute.tsx` (punya spinner ⏳ sendiri juga) **sengaja gak disentuh** — dicek dulu, komponen ini gak diimpor dari manapun (dead code), jadi gak kepake di halaman manapun yang beneran jalan.
- [x] `tsc --noEmit` bersih, `npm run lint` gak nambah error/warning baru dari file yang disentuh (131 problems yang ada semua pre-existing di file lain).
- [x] Diverifikasi visual: bikin route sementara buat render `<Loader />` (full-screen) dan `<Loader fullScreen={false} />` (compact) lewat `npm run dev` + screenshot Playwright headless Brave — dua-duanya render bener (gradient langit, dua awan, teks), route sementara dihapus lagi setelah itu.

**Catatan:** `npm run build` sengaja SKIP (permintaan user, lama). `tsc --noEmit` + lint + verifikasi visual komponen dipakai sebagai pengganti. Halaman yang gated auth beneran (butuh login OAuth asli) belum diverifikasi end-to-end di browser — cuma komponennya sendiri yang dicek visual.

## 35. Fix Proporsi Modal "Pilih Game" di Mobile — Kartu Kepentok Nempel Pinggir Parchment

User lapor: popup pilih game di mobile keliatan "lebar banget" dan kartu opsinya (Ular Tangga/Nusa Card) juga lebar/kurang bagus dibanding desktop. Diminta screenshot dulu buat bandingin sebelum benerin, dan desktop gak boleh diubah.

### Diagnosa lewat screenshot + pengukuran DOM langsung (bukan nebak dari baca CSS)
`src/components/home/GameSelectionModal.tsx` (yang dipakai — ada juga `components/modals/GameSelectionModal.tsx` yang gak diimpor dari manapun, dead code, gak disentuh) pakai `.game-modal-container`/`.game-option-card` dari `src/components/home/home-modals.css`. Diukur pakai Playwright (`getBoundingClientRect`) di viewport 390px vs desktop 1280px:
- Desktop: container 800px, padding 64px, kartu 310×197px (banyak jarak/parchment kelihatan di sekeliling kartu).
- Mobile (sebelum fix): container 342px (87% dari lebar layar — nyaris penuh), padding cuma 20px/16px (dari override `@media(max-width:480px)`), kartu 136×124px nyaris nempel ke tepi kertas robek. Beda proporsi jauh dari desktop, itu yang kerasa "lebar/kurang bagus" — bukan bug lebar-overflow, tapi memang di-desain kepepet di breakpoint mobile lama.

- [x] `src/components/home/home-modals.css` — HANYA di dalam `@media (max-width: 480px)` dan `@media (max-width: 360px)` (base rule & breakpoint desktop/tablet tidak disentuh): naikin `margin`/`padding` container (0.5rem→1rem margin, 1.25rem/1rem→1.75rem/1.25rem/2rem padding) biar parchment kelihatan lagi di sekeliling kartu; naikin `min-height` kartu (100px→128px di ≤480px, 90px→104px di ≤360px) biar bentuknya gak nyaris kotak sempurna; gap grid dinaikin ke 1rem.
- [x] Setelah fix, diukur ulang: mobile container 326px (turun dari 342px, lebih banyak jarak dari tepi layar), kartu 123×147px (lebih tinggi dari lebar, gak lagi berbentuk blok kotak nempel edge).
- [x] Diverifikasi visual — screenshot Playwright headless Brave 4 viewport: mobile 390×844, small phone 360×740, tablet 768×1024, desktop 1280×800. Desktop dicek pixel-sama kayak sebelum perubahan (gak kesentuh). Mobile & small phone sekarang punya jarak parchment yang jelas kelihatan di sekeliling kartu, proporsinya lebih mirip desktop.
- [x] `tsc --noEmit` bersih (CSS-only, gak ada file TS/TSX yang disentuh).

**Catatan:** `npm run build` belum dijalanin ulang.

## 36. Redesign Modal "Pilih Game" di Mobile — Kertas & Tombol Masih Kerasa Lebar, Ikon Kurang Gede

Setelah fix §35 (nambah jarak/padding), user masih ngerasa kertasnya kelebaran dan dua tombol game (Ular Tangga/Nusa Card) juga lebar, dan minta ikonnya gede jangan kecil. Diminta pakai frontend-design skill khusus buat mikirin ulang layout-nya, tetep gak boleh ubah desktop.

### Root cause struktural, bukan cuma soal ukuran
Grid 2-kolom side-by-side (`.game-options-grid { grid-template-columns: repeat(auto-fit, minmax(100px,1fr)) }`) di kertas yang sempit maksa tiap kartu jadi sempit-tinggi, dan ikon (`clamp(56px,16vw,110px)`) jadi kelihatan kecil relatif ke kartunya. Nambah padding doang (§35) gak nyelesain masalah struktural ini — kartu tetep berdampingan sempit.

- [x] `src/components/home/home-modals.css`, HANYA di dalam `@media (max-width: 480px)` dan `@media (max-width: 360px)`, khusus modal "Pilih Game" (diisolasi pakai selector `.game-modal-container:not(.game-modal-container--large)` biar modal provinsi yang pakai `--large` — lebih lebar, gak kepenuhin masalah yang sama — tetep sama sekali gak kesentuh):
  - Kertas modal dipersempit eksplisit (`max-width: 300px` di ≤480px, `260px` di ≤360px) — lebih jauh dari lebar layar, gak lagi "nyaris penuh layar".
  - Grid opsi game diubah dari 2-kolom sempit jadi **1-kolom bertumpuk**: tiap tombol full-width kertas, layout row (ikon besar di kiri, label besar di kanan) — bukan kartu kotak sempit lagi.
  - Ikon game (`.game-option-icon-img`) di-set ukuran tetap besar (68px di ≤480px, 56px di ≤360px, gak pakai clamp berbasis vw lagi) biar konsisten gede, gak ikut menyusut ngikutin lebar kartu.
  - Efek samping ke-detect sendiri & dibenerin: kertas yang lebih sempit bikin judul "Pilih Game" nabrak tombol close bulat di pojok — font judul/subjudul dikecilin dikit + `padding-right` khusus modal ini biar gak tabrakan.
- [x] Diverifikasi visual — screenshot Playwright headless Brave 4 breakpoint (360, 390, 414, dan desktop 1280) + modal provinsi di mobile (buat mastiin `--large` gak ke-affect). Hasil: kertas jelas lebih sempit & gak nempel edge, dua tombol game full-width bertumpuk dengan ikon gede jelas kelihatan, judul gak nabrak close button di semua ukuran phone yang dites. Desktop & modal provinsi pixel-sama kayak sebelumnya.
- [x] `tsc --noEmit` bersih (CSS-only).

**Catatan:** `npm run build` belum dijalanin ulang.

## 37. Redesign Warna & Hover "Papan Informasi" di Home

User minta hapus dulu animasi hover papan "Informasi" di home (`papan1-wrapper`, `home.css`), lalu diminta lagi buat balikin tapi versi lebih halus: rotasi ke KIRI (bukan ke kanan kayak sebelumnya) dan cuma aktif di desktop (device yang beneran punya mouse).

- [x] `src/app/(public)/home/home.css` — rule hover `.papan1-wrapper:hover .papan1-image`/`.papan1-wrapper:hover .papan1-text` sempat dihapus total, lalu ditambah ulang dibungkus `@media (hover: hover)` (gak nyangkut di HP/tablet sentuh) dengan rotasi `-14deg` (base `-8deg` → makin miring ke kiri, arah yang sama, bukan lompat ke arah berlawanan kayak sebelumnya) — dipakai ANGKA YANG SAMA persis buat papan (`.papan1-image`) dan teks (`.papan1-text`) biar teksnya keliatan nempel di papan pas dirotasi, bukan gerak sendiri gak sinkron.

## 38. Redesign BackButton — Claymorphism 3D Kuning

User minta redesign komponen `BackButton` (dipakai di `login`, `credit`, `profile`, navbar Informasi, `RoomSelect`) jadi bulat kuning gaya claymorphism 3D, tanpa jalanin `npm run build`.

- [x] `src/components/ui/BackButton.tsx` — style lama (glass translucent putih) diganti gradasi kuning puffy (`linear-gradient(150deg,#ffe28a,#ffc93c,#f5a916)`) + box-shadow berlapis: slab bawah `0 5px 0 #c6841a` (ala tombol game lain di app ini), ambient drop shadow, plus inset highlight/shadow buat kesan "clay" empuk. Hover naik dikit + terang, `:active` turun + shadow ngempis (efek ketekan). Dipindah dari inline `style` prop ke class + `<style>` tag scoped (pola yang sama kayak `RotateDeviceOverlay`) karena `:hover`/`:active` gak bisa didefinisikan lewat inline style React.
- [x] Dicek dulu: semua 5 pemanggil `<BackButton>` gak ada yang override `className`, jadi redesign ini otomatis konsisten di semua tempat tanpa perlu nyentuh file lain.
- [x] `tsc --noEmit` bersih, diverifikasi visual via screenshot (halaman login) — gradasi & shadow 3D-nya kebukti render bener.

## 39. Cache Header buat Asset Statis (Font/Icon) + Image Cache TTL

User nanya soal caching biar asset gak perlu di-render ulang tiap buka web lagi. Dijelasin dulu: login persistence itu udah otomatis (`browserLocalPersistence` default Firebase Auth), dan gambar Cloudinary (`<img>` biasa) udah di-cache sendiri sama CDN Cloudinary — yang beneran bisa dioptimasi dari sisi kita cuma cache header buat asset statis `/public` dan TTL cache `next/image`. User minta yang aman aja, gak ganggu logic.

- [x] `next.config.ts` — `images.minimumCacheTTL` dinaikin dari default 60 detik ke 1 tahun (31536000) — aman karena semua URL Cloudinary di app ini udah versioned (`v1774.../`), jadi kalau asset ganti, URL-nya ikut ganti (gak bakal ke-stuck liat gambar basi).
- [x] Ditambah `headers()` buat `/fonts/:path*` dan `/icons/:path*` (font Bauhaus, logo, logo UPJ/SIF) — `Cache-Control: public, max-age=604800, stale-while-revalidate=86400` (7 hari, bukan "immutable" selamanya, biar kalau file-nya diganti manual suatu saat user gak kejebak kelamaan).
- [x] Sengaja gak nyentuh gambar Cloudinary yang dipanggil lewat `<img>` biasa (mayoritas app) — itu udah di-cache CDN Cloudinary sendiri di luar kontrol kita, nambahin apa-apa di sisi kita gak ada gunanya.
- [x] Dijelasin ke user: ini gak butuh pop-up consent apapun — beda sama cookie consent (yang wajib buat tracking/identifikasi user), HTTP cache cuma nyimpen file statis, gak ada data pribadi yang disimpen.
- [x] `tsc --noEmit` bersih, diverifikasi langsung header-nya kebaca lewat `curl -I` ke `/fonts/Bauhaus.otf` dan `/icons/logo.webp` (dev server yang lagi jalan otomatis reload config), halaman `/home`/`/login` masih 200 normal.

**Catatan:** `npm run build` sengaja SKIP terus di sesi ini (permintaan eksplisit user, lama). Semua verifikasi CSS/config pakai `tsc --noEmit` + curl/screenshot langsung.

## 40. Fix Breakpoint Modal "Pilih Game" — Masih Lebar di Simulator Mobile User

User kirim screenshot dari simulator/preview mobile yang lagi dipakainya — ternyata modal "Pilih Game" MASIH kelihatan 2 kolom lebar (versi lama, sebelum fix §36), bukan versi 1-kolom yang udah dibikin. Root cause: breakpoint redesign sebelumnya `@media (max-width: 480px)`, tapi lebar viewport simulator yang dipakai user ternyata di rentang 480–640px — gak kena breakpoint itu sama sekali, jadi jatuh balik ke grid 2-kolom bawaan.

- [x] `src/components/home/home-modals.css` — breakpoint redesign modal "Pilih Game" dilebarin dari `max-width: 480px` ke `max-width: 640px`, disamain sama breakpoint mobile/desktop yang udah dipakai di tempat lain di app ini (`room.css` pakai `min-width:640px` buat desktop). `@media (max-width: 360px)` (extra-kecil) gak diubah, tetap nested valid di dalam 640.
- [x] Sekalian nuruti request tambahan: tinggi tombol game (`.game-option-card`) dinaikin lagi (92px → 112px) dan ikon (`.game-option-icon-img`) dibesarin (68px → 78px) biar makin jelas kelihatan; judul "Pilih Game" dibesarin (1.3rem → 1.55rem), `padding-right` header dinaikin ke 2.5rem biar tetep gak nabrak tombol close meski teksnya lebih gede.
- [x] Diverifikasi visual — screenshot 4 lebar: 390px (HP asli), 600px & 640px (nyimulasiin rentang yang bikin user ngalamin bug ini), dan desktop 1280px. Hasil: 600 & 640 sekarang ikutan render versi 1-kolom yang benar (sebelumnya di lebar segini masih 2-kolom lebar), desktop pixel-sama kayak sebelumnya.
- [x] `tsc --noEmit` bersih (CSS-only).

**Catatan:** `npm run build` gak dijalanin (skip terus sesuai permintaan user).

## 41. Merge Branch `Lintar` (Ular Tangga: Ular, Aturan Menang, Extra Roll) + Fix Bug Bot Macet

Temen user (Lintar) bikin branch `origin/Lintar` nyabang dari tip `natah` (`80fb57a`), isinya khusus perbaikan Ular Tangga. Direview dulu sebelum merge — dicek satu-satu tiap file diff-nya lewat `git diff 80fb57a..915471a`.

### Yang di-review — bug fix (aman) vs perubahan ATURAN MAIN (butuh persetujuan, per CLAUDE.md)
- **Bug fix valid**: `currentPlayerUID` yang sebelumnya selalu ke-set `undefined` di `nextTurn()` (dibenerin pakai field baru `playerUIDs`); urutan pemain yang bisa berantakan gara-gara `Object.entries()` Firestore gak stabil urutannya; race condition di `Dice.tsx` (state `isLocalRolling` di dependency array sendiri, diganti ref); room yang nyangkut status `'playing'` padahal sesi sebelumnya udah `finished`/`abandoned` (nambah `checkAndResetAbandonedRoom`); bug rejoin room abis leave di `rooms.service.ts`; lobby dobel (`UlarTanggaLobby` di dalam halaman play, redundan sama `/room/...`) dihapus total — sebelumnya udah dicatat di TASK.md sebagai dead code/fallback lama.
- **Perubahan aturan main** (CLAUDE.md: *"Jangan mengubah aturan permainan... tanpa persetujuan lead"*): fitur **ular dihidupin lagi** (CLAUDE.md nyatet fitur ular "sudah dihapus, hanya tangga tersisa" — ternyata `Board.tsx` udah lama punya kode render ular yang gak kepake/dead code, Lintar cuma nyambungin data ke situ), **kondisi menang berubah** dari "≥100" jadi "harus pas 100" (kelebihan langkah = pion diem, giliran abis), dan **aturan baru dadu 6 = lempar lagi**.
- User dikasih pilihan (a) cuma bug fix, (b) semuanya termasuk perubahan aturan, (c) skip dulu — **user pilih (b)**, ambil semuanya, sambil minta dicek bug lain.

- [x] Dicek dulu potensi konflik merge (`git merge-tree`) — bersih, 0 konflik (Lintar nyabang langsung dari tip natah, bukan dari `main` yang jauh ketinggalan kayak insiden merge sebelumnya). `git merge origin/Lintar` — fast-forward mulus, semua editan lokal sesi ini (yang belum ke-commit) gak kesenggol karena beda baris sama diff Lintar.
- [x] **Bug ketemu & dibenerin**: sempet salah duga ada collision data kotak 68 (ternyata itu dari data lama yang salah inget, dicek ulang pakai file asli — gak ada collision beneran di LADDERS/SNAKES). Bug yang BENERAN ketemu: kalau **bot** (AI takeover pas pemain offline) dapet **extra roll** dari dadu 6, bot itu macet gak pernah lempar lagi. Sebab: guard anti-double-roll bot (`lastBotTurnRef` di halaman play) cuma ke-reset kalau `turnCounter` berubah, tapi cabang extra-roll di `nextTurn()` (`ular-tangga-game.service.ts`) sengaja gak naikin `turnCounter` — jadi guard-nya nyangkut gak pernah lepas. Kalau kejadian pas semua pemain manusia offline (full bot takeover), room bisa macet total. Dibenerin: `turnCounter` dinaikin juga di cabang extra-roll — dicek dulu gak ada consumer lain yang gantungin makna spesifik `turnCounter` (cuma dipakai guard ini), jadi aman.
- [x] Dicek juga: `ular-tangga-vs-ai/page.tsx` pakai `nextTurn()` yang sama dari service, jadi fix ke-bawa otomatis, gak perlu ubah file itu.
- [x] `tsc --noEmit` bersih, `npm run lint` gak nambah error/warning baru di file yang disentuh (118 problems yang ada semua pre-existing di file lain, gak berubah dari sebelum merge).

**Catatan:** `npm run build` gak dijalanin. Belum diverifikasi visual/gameplay end-to-end di browser (butuh 2+ akun buat multiplayer beneran, atau skenario offline-takeover buat mastiin fix extra-roll-nya kerja) — disaranin user coba langsung.

## 42. Ganti Font "Bauhaus" Jadi Tanker

User udah taro `Tanker.ttf` di `public/fonts/`, minta font Bauhaus yang dipakai di seluruh web diganti ke situ.

- [x] Font di app ini dimuat lewat 2 mekanisme beda yang kepake bareng: `@font-face` global (`src/styles/fonts.css`, dipakai lewat class `.font-bauhaus`/`.font-irish`/`.profiletitle` dan `font-family:'Bauhaus'` langsung di banyak file CSS) + 3 instance `next/font/local` terpisah per-komponen (`credit/page.tsx`, `information/[id]/detail/page.tsx`, `components/information/PageHeader.tsx`).
- [x] Cukup ganti `src` di keempat titik itu dari `Bauhaus.otf` ke `Tanker.ttf` — nama `font-family: 'Bauhaus'` dan semua class/variable consumer (`.font-bauhaus`, `--font-bauhaus-lace`, dll) sengaja DIBIARKAN gak berubah, biar gak perlu nyentuh belasan file lain yang cuma refer ke nama font (mereka otomatis kebawa karena cuma nunjuk ke nama, bukan file-nya langsung).
- [x] Dicek `grep -rn "Bauhaus.otf"` di `src/` — kosong, gak ada sumber font yang kelewat.
- [x] `tsc --noEmit` bersih. Diverifikasi visual via screenshot (modal "Pilih Game" di home, halaman Credit "TIM NUSAQUEST") — bentuk hurufnya kebukti berubah ke Tanker di kedua tempat.

**Catatan:** ada 1 reference font yang udah lama patah dari sebelumnya (`var(--font-bauhaus)` di `ular-tangga/page.tsx` baris "Akses Ditolak" — CSS variable itu gak pernah didefinisikan di manapun, beda sama `--font-bauhaus-lace` yang emang ada). Ini bug lama, gak berhubungan sama penggantian font kali ini, dibiarkan gak disentuh (di luar scope). `npm run build` gak dijalanin.

## 43. Follow-up Font Tanker: Fix Reference Patah, Outline Hijau, Ukuran & Posisi Papan Informasi

Tindak lanjut dari §42 — 4 permintaan sekaligus.

- [x] **`var(--font-bauhaus)` yang patah** (dicatat di §42) — dibenerin di `ular-tangga/page.tsx` baris "Akses Ditolak": inline `style={{fontFamily:'var(--font-bauhaus)'}}` (variable yang gak pernah didefinisikan, jadi selama ini diam-diam fallback ke font default) diganti pakai class `font-bauhaus` yang udah ada globalnya di `globals.css`.
- [x] **Outline hijau di judul modal "Pilih Game"/"Pilih Provinsi"** — `-webkit-text-stroke: 2.5px #059669` di `.game-modal-title` (`home-modals.css`) dihapus. Satu class dipakai bareng sama modal provinsi (`--large`), jadi kehapus di dua-duanya sekaligus sesuai yang diminta.
- [x] **Font di papan "Informasi" dibesarin** — `PageHeader.tsx`, `text-base sm:text-xl lg:text-3xl` → `text-lg sm:text-2xl lg:text-4xl`.
- [x] **Teks papan kuning "INFORMASI" ketarik ke bawah gara-gara font baru** — sempet gak yakin elemen mana yang dimaksud ("header kuning"), dicek screenshot halaman `/information` beneran buat mastiin (papan emas/kuning "INFORMASI" di atas, itu `PageHeader.tsx` yang sama dengan poin sebelumnya). Akar masalah: posisi teks dulu pakai `-translate-y-[120%]` — nudge berbasis PERSENTASE TINGGI TEKS ITU SENDIRI, jadi pas font ganti (tinggi baris render beda), jarak gesernya ikut berubah dan teks jadi nempel ke tepi bawah papan. Diganti `top-[46%] -translate-y-1/2` — persentase relatif ke tinggi PAPAN (independen dari font), jadi gak akan geser lagi kalau font diganti-ganti lagi ke depannya.
- [x] `tsc --noEmit` bersih. Diverifikasi visual lewat screenshot `/information` sebelum-sesudah — teks "INFORMASI" sekarang center di tengah papan, gak nempel bawah lagi.

**Catatan:** `npm run build` gak dijalanin.

## 44. Full Revamp Modal "Pilih Game" & "Pilih Provinsi" — Bingkai Papan Game, Responsive Mobile Landscape

User minta full revamp visual kedua modal ini biar "kerasa game", pakai aset yang udah ada di folder asset, isi/fungsi gak berubah, dan wajib responsive di mobile landscape.

### Desain
- Kertas robek (`kertas.webp`) diganti bingkai papan kayu berukir sulur+bunga dengan pita emas buat judul (`pauseAssets.board_paused`, aset yang sebelumnya cuma dipakai di modal Settings/`PauseModal`) — sekarang "bahasa visual game panel" ini konsisten dipakai ulang buat modal lain, bukan reinvent.
- Judul dipindah dari flow normal jadi `position:absolute` biar bisa didudukin persis di pita emas, independen dari tinggi konten di bawahnya (subjudul tetap di flow normal, di bawah pita emas).
- Tombol close diganti gradasi kuning claymorphism — resep sama persis kayak `BackButton` (§38) biar konsisten satu bahasa visual "tombol bulat 3D kuning" di app ini.
- Tombol game dikasih identitas warna sendiri per game (bukan biru generik semua): Ular Tangga oranye-merah (senada dadu+tangga di ikonnya), Nusa Card biru indigo (senada warna belakang kartu) — via modifier class `.game-option-card--ular-tangga`/`.game-option-card--nusa-card` (`GameSelectionModal.tsx`).
- Tombol provinsi diganti hijau (senada sulur/daun di bingkai), gantiin biru generik.

### Bug yang ke-detect & dibenerin selama build (semua ketauan dari screenshot iteratif, bukan tebakan)
- Padding atas/bawah lama (dituning buat kertas robek) gak cocok sama proporsi bingkai papan baru — kalau dibiarin, baris provinsi terakhir numpuk di atas sulur dekoratif bawah, dan judul kepotong pita emas. Semua breakpoint (`≤768px`, `≤640px`, `≤360px`, landscape `≤500px height`) dituning ulang padding top/bottom-nya berdasarkan proporsi gambar baru (pita emas ~18% tinggi, sulur bawah ~16%).
- Rule padding mobile base sempat gak ke-scope (`:not(.game-modal-container--large)`), jadi modal provinsi ikut kepakein padding kecil punya modal "Pilih Game" — subjudul jadi ketutup pita emas. Dipisah jadi override sendiri-sendiri per modal.
- Tombol close di mobile portrait/landscape awalnya nempatin diri di `top` yang terlalu kecil (nyaris 0), jatuh di area transparan di atas lengkung bingkai (bukan di atas kayu) karena lengkung papan di pojok kanan lebih rendah dari titik tengah atas (tempat pita emas menonjol). Digeser turun.
- `tsc --noEmit` bersih, `npm run lint` gak nambah error/warning baru (118 problems yang ada semua pre-existing).

- [x] Diverifikasi visual iteratif — desktop 1280×800, mobile portrait 390×844, mobile landscape 844×390 & 667×375 (fokus utama sesuai permintaan, karena `RotateDeviceOverlay` §33 blokir portrait maksa user ke landscape), HP kecil 340×700. Kedua modal ("Pilih Game" & "Pilih Provinsi") dicek di semua ukuran itu, beberapa ronde fix sampai bersih (gak ada elemen numpuk/kepotong) di semua ukuran.

**Catatan:** `npm run build` gak dijalanin.

## 45. Follow-up Revamp Modal: Isi Konten Disesuaikan Bingkai + Fix Bug Overflow Beneran

User suka banget sama bingkai papan barunya (§44), tapi isi kontennya (khususnya modal Pilih Provinsi) belum nyatu — search bar masih putih generik, tombol provinsi kekecilan, dan ada konten yang keluar dari bingkai (jelek).

### Redesign isi konten
- Search bar diganti gaya "ukiran di kayu" — cream pudar + inset shadow (kesan dicukil ke papan), border coklat, bukan kotak putih form generik.
- Panel daftar provinsi (`.game-provinces-list`) dikasih background+border+inset-shadow sendiri — jadi "panel cekungan" yang jelas keliatan sengaja dibatasin di situ, bukan grid ngambang telanjang yang kesannya tumpah.
- Tombol provinsi dibesarin (`min-height` 60px→76-92px tergantung breakpoint, font lebih gede, kolom grid minimal 150px bukan 110px).

### Bug overflow beneran ke-detect & dibenerin (bukan salah duga kayak sebelumnya)
Sempet salah duga ada collision data (dicabut lagi setelah dicek ulang) — bug ASLINYA ternyata: **padding kiri-kanan modal provinsi (`--large`) jauh lebih tipis dari yang beneran dibutuhin bingkai papan**. Dibuktiin dengan ukur pixel gambar `board_pause.webp` langsung pakai Python/PIL (bukan tebak dari screenshot) — area beige "aman" cuma ada di x:16.8%–83.2% dari lebar bingkai (butuh ~17% padding tiap sisi), padahal padding yang kepake sebelumnya cuma ~5-8vw (jauh lebih tipis). Grid provinsi yang lebar (banyak kolom) jadi nabrak/nutupin sulur di pinggir bingkai karena padding-nya ketipisan itu.

- [x] `.game-modal-container--large` padding kiri-kanan dinaikin drastis (`clamp(2rem,5vw,3rem)` → `clamp(3rem,16vw,10rem)`), termasuk override khusus di breakpoint landscape (`clamp(2rem,12vw,5rem)`) yang tadinya juga ketipisan (gak ke-scope ke `--large` secara spesifik).
- [x] Diverifikasi ulang di 4 breakpoint (desktop, mobile portrait, 2 mobile landscape) — sulur di pinggir bingkai sekarang keliatan jelas ada JARAK dari grid provinsi, gak ketimpa/kepotong lagi.
- [x] Modal "Pilih Game" (non-`--large`) dicek ulang, dipastikan gak kesenggol perubahan ini (padding-nya di-scope terpisah dari awal).
- [x] `tsc --noEmit` bersih, `npm run lint` gak nambah error/warning baru (118 problems yang ada semua pre-existing).

**Catatan:** `npm run build` gak dijalanin. Pas verifikasi screenshot sempet kejebak sekali sama indikator "Compiling..." Next.js dev yang keburu di-capture sebelum CSS baru fully applied — ketauan pas angka hasil ukur DOM gak nyambung sama yang keliatan di screenshot, jadi nambahin `sleep` sebelum re-screenshot ronde berikutnya buat mastiin gak keulang.

## 46. Fix Akar Masalah Overflow Beneran: `box-sizing` + Redesign Search Bar Claymorphism + Kecilin Judul Provinsi

User masih ngerasa search bar kelebaran dan tombol provinsi "ngelewatin" modal meski udah di-fix di §45 (padding kiri-kanan). Ternyata itu ronde sebelumnya cuma nutupin gejala (nambah padding), bukan benerin akar masalahnya.

### Akar masalah beneran: gak ada `box-sizing: border-box` di modal ini
`globals.css` dicek — gak ada reset `box-sizing` global di app ini sama sekali. `.game-search-input` dan `.game-province-item` sama-sama pakai `width:100%` DITAMBAH `padding` DITAMBAH `border` tanpa `box-sizing:border-box` — default browser (`content-box`) bikin padding+border itu NUMPUK di atas `width:100%`, jadi elemennya beneran lebih lebar dari slot yang dikasih ke dia. Ini kenapa search bar kelihatan "ngelewatin" lebar panel, dan kenapa tombol provinsi kayak "DI Yogyakarta" teksnya kepotong ngelewatin tepi tombolnya sendiri di mobile (2 kolom sempit).

- [x] Ditambah 1 rule di paling atas file: `.game-modal-overlay, .game-modal-overlay *, *::before, *::after { box-sizing: border-box; }` — scoped ke dalam modal ini doang (gak nyentuh CSS di luar modal), nutup KELAS bug ini secara menyeluruh buat semua elemen di dalam kedua modal, bukan cuma nge-patch satu-satu.
- [x] Search bar didesain ulang jadi **claymorphism** sesuai request: gradasi krem puffy (`linear-gradient(150deg,#fff6e0,#f2dfae)`) + shadow berlapis (outer lembut + inset highlight/shadow), bentuk pill (`border-radius:999px`), lebar SEDANG (`max-width:22rem`, bukan 100%) dan center (`.game-search-container` jadi `flex;justify-content:center`).
- [x] Judul "PILIH PROVINSI" dikecilin khusus buat modal provinsi (`.game-modal-container--large .game-modal-title { font-size: clamp(0.85rem,2.6vw,1.25rem) }`, sebelumnya `clamp(1rem,3.6vw,1.5rem)` sama kayak modal "Pilih Game") — teksnya lebih panjang dari "PILIH GAME" jadi butuh ukuran lebih kecil biar muat rapi & gak sesak di pita emas. Modal "Pilih Game" gak kesentuh sama sekali.
- [x] Diverifikasi visual — desktop, mobile portrait, 2 mobile landscape: "DI Yogyakarta" (kasus paling parah sebelumnya) sekarang rapi di dalam tombolnya sendiri di semua ukuran, search bar keliatan medium+claymorphism, judul pas di pita emas. Modal "Pilih Game" dicek ulang, gak ada regresi.
- [x] `tsc --noEmit` bersih, `npm run lint` gak nambah error/warning baru.

**Catatan:** `npm run build` gak dijalanin.

## 47. Modal Provinsi: List Jadi Paginated (Prev/Next) + Fix Ukuran Judul

User suka sama hasil search bar §46, tapi minta: list provinsi jangan scroll panjang, pakai tombol Next/Prev buat lihat provinsi lain (satu halaman jangan banyak-banyak), dan judul "PILIH PROVINSI" kekecilan dibanding pita emasnya. Diminta liat screenshot dulu sebelum edit — dicek, kebukti kedua masalah itu nyata.

- [x] `ProvinceSelectionModal.tsx` — ditambah pagination: `PROVINCES_PER_PAGE = 6`, state `page`, di-slice dari `filteredRegions`. Grid diubah dari `auto-fill` responsif jadi kolom TETAP (3 kolom desktop, 2 kolom mobile) biar jumlah "provinsi per halaman" predictable di semua breakpoint. Tombol Prev/Next + indikator "X / Y" ditambah di bawah grid, styling claymorphism krem senada search bar.
- [x] Reset ke halaman 1 tiap kali `searchTerm` berubah (biar gak kejebak di halaman kosong pas hasil pencarian menyusut) — awalnya pakai `useEffect(() => setPage(0), [searchTerm])`, ternyata kena lint ERROR baru (`react-hooks`: "Calling setState synchronously within an effect can trigger cascading renders"). Diganti ke pola yang React sendiri rekomendasiin buat kasus "reset state pas dependency berubah": adjust state langsung pas render (`if (searchTerm !== prevSearchTerm) { setPrevSearchTerm(searchTerm); setPage(0); }`), bukan lewat effect.
- [x] `.game-provinces-list` gak butuh `overflow-y:auto`/`max-height` lagi (dihapus) — halaman udah fixed 6 item, otomatis muat tanpa scroll.
- [x] Judul modal provinsi (`.game-modal-container--large .game-modal-title`) dibesarin dari `clamp(0.85rem,2.6vw,1.25rem)` (ronde sebelumnya, salah — nyusutin berdasarkan jumlah karakter doang tanpa itung kertas `--large` yang jauh lebih lebar) jadi `clamp(1.15rem,2.8vw,1.75rem)` di desktop, dengan override terpisah lebih kecil khusus mobile (`clamp(0.85rem,4.4vw,1.05rem)`) biar proporsinya tetep pas di kertas yang jauh lebih sempit.
- [x] Nambah baris Prev/Next di bawah grid butuh clearance bawah ekstra (biar gak nabrak sulur papan) — padding-bottom `--large` di mobile dinaikin lagi (`clamp(5.5rem,20vh,7.5rem)` → `clamp(8rem,30vh,10rem)`), tinggi kartu provinsi & gap dikecilin dikit buat nyisain ruang.
- [x] Diverifikasi visual di desktop, mobile portrait, 2 mobile landscape — judul pas ngisi pita emas, cuma 6 provinsi per halaman, Prev/Next gak nabrak sulur di semua ukuran. Modal "Pilih Game" dicek ulang, gak kesenggol.
- [x] Diverifikasi fungsional (bukan cuma visual): navigasi 2× Next → halaman 3/7, ketik di search → otomatis balik ke halaman 1/7 — behavior reset kebukti jalan bener setelah migrasi dari `useEffect` ke adjust-during-render.
- [x] `tsc --noEmit` bersih, `npm run lint` balik ke 118 problems (baseline sebelum sesi ini, gak nambah baru — sempet nambah 1 gara-gara pola `useEffect` di atas, udah dibenerin).

**Catatan:** `npm run build` gak dijalanin.

## 48. Persempit Kertas & Grid Provinsi, Besarin Judul, Translate Prev/Next

Follow-up §47 — user suka sama pagination-nya, tapi: (1) grid provinsi masih ngerentang penuh selebar kertas (padahal search bar udah medium-width), (2) pita emas + judulnya kerasa gak proporsional (banner kegedean vs teks kekecilan), (3) tombol Prev/Next diminta Bahasa Indonesia.

- [x] `.game-modal-container--large` max-width diciutin dari 1400px → 950px — otomatis bikin pita emas judul (bagian dari background image yang sama, ke-stretch proporsional ke ukuran container) ikut lebih compact di layar lebar, alih-alih sekadar utak-atik ukuran teks doang.
- [x] `.game-provinces-list` dikasih `max-width:30rem; margin:0 auto` — sekarang medium-width & center, filosofi sama kayak search bar (§46), bukan ngerentang penuh ngikutin kertas.
- [x] Judul modal provinsi dibesarin lagi (`clamp(1.15rem,2.8vw,1.75rem)` → `clamp(1.3rem,3.4vw,2.1rem)`) — sekalian ngisi pita emas yang sekarang lebih compact, hasilnya lebih proporsional (bukan ngambang kecil di ruang kosong kayak sebelumnya).
- [x] `ProvinceSelectionModal.tsx` — "‹ Prev" / "Next ›" diganti "‹ Sebelumnya" / "Selanjutnya ›". Teks Indonesia lebih panjang, sempet ke-wrap 2 baris di tombol pas mobile — dibenerin dengan ngecilin padding/font pagination khusus breakpoint ≤640px.
- [x] Diverifikasi visual di desktop, mobile portrait, 2 mobile landscape — kertas & pita emas kerasa lebih compact, grid provinsi medium-width center, tombol Sebelumnya/Selanjutnya muat rapi satu baris di semua ukuran. Modal "Pilih Game" dicek ulang, gak kesenggol (base rule beda dari `--large`).
- [x] `tsc --noEmit` bersih, `npm run lint` gak nambah masalah baru (118 problems, sama kayak baseline).

**Catatan:** `npm run build` gak dijalanin.

## 49. Subjudul Pindah ke Pita Emas (Kedua Modal) + Besarin Modal "Pilih Game"

Follow-up §48 — user minta: (1) judul provinsi masih kurang center (dicek pakai analisis pixel, ternyata udah center matematis — kemungkinan ilusi visual dari bentuk pita, gak diapa-apain lagi), (2) subjudul kecil dipindah ke pita emas (kedua modal), (3) modal "Pilih Game" dibesarin biar 2 kartu game-nya gak ngelewatin bingkai.

### Bug ganda ke-detect pas eksekusi mindahin subjudul ke pita
- **Pita emas ternyata gak cukup tinggi buat 2 baris teks** (judul+subjudul) kalau judul tetep di posisi vertikal lama (di tengah pita) — subjudul jadi separuh nongol ke area beige di bawah pita, bukan beneran "di dalam" pita. Ketauan dari ukur pixel gambar (banner cuma ~63px tinggi di container biasa, judul sendiri udah makan hampir semua ruangnya). Solusinya: judul digeser LEBIH KE ATAS (top dikecilin) + font judul diciutin dikit, baru subjudul kebagian tempat di bawahnya, masih di dalam pita yang sama.
- **Breakpoint landscape sempet numpuk** (judul & subjudul overlap gak kebaca) — subjudul lama posisinya lebih tinggi dari titik akhir judul. Diurutin ulang: `top` subjudul digeser ke bawah `top+tinggi` judul, di kedua modal.
- **Salah baca screenshot di tengah proses**: pas verifikasi awal, sempet nge-read file screenshot yang SALAH (stale dari script sebelumnya yang gak nge-overwrite file yang lagi dicek), bikin sempet kesimpulan "perubahan gak ngaruh" padahal CSS-nya udah bener — ketauan pas re-run script yang bener & compare ulang.
- [x] `.game-modal-title` — `top` diturunin (`clamp(1.35rem,4.2vw,2.05rem)` → `clamp(0.7rem,2.6vw,1.2rem)`), font dikit lebih kecil, biar nyisain ruang buat subjudul di bawahnya dalam pita yang sama.
- [x] `.game-modal-subtitle` — dipindah dari flow normal (di beige, di bawah papan) jadi `position:absolute` juga, didudukin tepat di bawah judul, di dalam pita emas. Warna diganti dari abu-abu (`#6b7280`, didesain buat background putih lama) ke coklat tua (`#6b3f0a`) biar kebaca di atas kuning.
- [x] Override khusus per breakpoint (mobile ≤640px, ≤360px, landscape) buat title+subtitle dua-duanya, biar proporsinya tetep pas & gak numpuk di kertas yang jauh lebih kecil/pendek dari desktop.
- [x] `.game-modal-container` (modal "Pilih Game", non-`--large`) — sisi kiri-kanan digedein (`clamp(3rem,6vw,4rem)` → `clamp(3rem,15vw,7rem)`, sama akar masalahnya kayak §46: padding lama ketipisan buat area aman bingkai ~17%) dan max-width dinaikin (`800px` → `1000px`) — 2 kartu game sekarang muat rapi tanpa nabrak/ngelewatin tepi papan.
- [x] Diverifikasi visual di desktop, mobile portrait, dan 2 ukuran landscape (844×390, 667×375), untuk KEDUA modal — subjudul kebukti di dalam pita emas di semua ukuran, gak numpuk sama judul, 2 kartu game gak ngelewatin bingkai lagi.
- [x] Diverifikasi ulang lewat analisis pixel (bukan cuma mata) — judul "Pilih Provinsi" kebukti center matematis presisi (selisih <1px antara center pita, center box judul, dan center teks beneran).
- [x] `tsc --noEmit` bersih, `npm run lint` gak nambah masalah baru.

**Catatan:** `npm run build` gak dijalanin.

## 50. Round Perbaikan UI: Modal Game/Provinsi, Papan Informasi, NavBar Claymorphism, Background Profile, z-index Pulau

Follow-up §49 — 8 item polish dari user dalam satu batch, dikerjakan satu-satu.

- [x] **Hydration error `bis_skin_checked` di console** — diinvestigasi, bukan bug kode. Atribut itu di-inject browser extension (antivirus/security suite) ke DOM sebelum React hydrate, muncul di hampir semua `div` tanpa pola — gak ada di source (`grep` nihil). Gak diapa-apain di kode; solusinya buka di incognito/browser tanpa extension.
- [x] `home-modals.css` — `.game-options-grid` dikasih `max-width:34rem; margin:0 auto` biar 2 kartu game gak selebar penuh dan center, sekalian bikin sulur tanaman (`PageHeader`-style dekorasi, z-index lebih tinggi) gak ketutup kartu.
- [x] `home-modals.css` — modal "Pilih Game": kertas dipersempit+ditinggiin (`padding`/`max-width`/`min-height` diubah), judul & subjudul dibesarin (`.game-modal-title`, `.game-modal-subtitle` base rule), biar sebanding sama gaya modal provinsi.
- [x] `home-modals.css` — modal provinsi (`--large`): judul dibesarin lagi + lebar box judul dilebarin dikit (`width:min(58%,24rem)`), subjudul digeser turun biar gak numpuk.
- [x] `PageHeader.tsx` (judul "INFORMASI") — dicek centering-nya diduga miring, ternyata pixel-scan sebelumnya false-positive (kepancing tekstur kayu, bukan glyph beneran). Diverifikasi pakai `Range.getClientRects()` (metode akurat, bukan scan warna) — judul sudah center matematis presisi. **Gak ada perubahan kode**, cuma dikonfirmasi ulang.
- [x] `home.css` — `.papan1-text` (teks "INFORMASI" di papan penunjuk home screen, beda dari judul halaman `/information`) `font-size` dibesarin `1rem` → `1.3rem`.
- [x] `NavBar.tsx` (halaman `/information`) — filter kategori & search bar diganti dari glass/translucent putih generik jadi claymorphism (resep sama kayak search bar modal provinsi/`BackButton`: gradasi krem puffy + shadow berlapis, pill aktif dikasih gradasi hijau-teal). Ikon search diganti warna coklat tua biar kebaca di atas background terang baru.
- [x] `profile/page.tsx` — background diganti dari `background.laut` (air) ke `background.langit` (langit), aset yang udah ada di `cloudinaryAssets.ts`, dipakai di tempat lain juga.
- [x] `home.css` — `.island-tr` (pulau Kuliner) `z-index` dinaikin `12` → `20`, biar jelas di atas `.island-tl` (pulau Sejarah & Legenda, `z-index:10`) yang secara visual masih kerasa numpuk walau angkanya udah lebih tinggi sebelumnya.
- [x] Semua perubahan diverifikasi visual via screenshot (Playwright + Brave headless) di `/home`, modal game, modal provinsi, `/information`, `/profile`.
- [x] `tsc --noEmit` bersih di tiap langkah. `npm run lint` tetap di baseline (14 error/104 warning pre-existing, semua di file yang gak disentuh round ini — gak ada yang baru).

**Catatan:** `npm run build` gak dijalanin.

## 51. Satukan Halaman Detail Informasi (Gambar + Teks Sekaligus) + Sugesti + Fix Scroll Landscape

User gak cocok sama alur 2-langkah lama: `/information/[id]` cuma nunjukin gambar, klik "Selanjutnya" baru pindah ke `/information/[id]/detail` buat baca teksnya. Diminta digabung jadi satu halaman (gambar di atas, isi deskripsi di bawah), ditambah sugesti "Lihat Informasi Lainnya" di bagian bawah, dan tombol kembali ke `/information`. Wajib responsive di mobile landscape.

- [x] `information/[id]/page.tsx` ditulis ulang total: satu kartu berisi gambar (atas, `object-cover` di dalam frame rounded) + deskripsi (bawah, background kertas/parchment `information.kertas`, judul pakai font Tanker/bauhaus). Tombol kembali pakai `BackButton` (claymorphism) ke `ROUTES.public.information`, bukan hardcode string.
- [x] Sugesti item lain diambil dari `getInformationItemsByTab(currentItem.tab)` (item lain di tab yang sama, dikecualikan item aktif, dibatasi 6), dirender pakai `CardList` yang **sudah ada** (bukan bikin komponen kartu baru) — sesuai aturan "satu implementasi per kebutuhan".
- [x] `information/[id]/detail/page.tsx` (route lama, langkah ke-2 dari alur 2-halaman) **dihapus** (`git rm`) — udah gak ada yang nge-link ke sana lagi setelah digabung, nyisain jadi dead code kalau dibiarin.
- [x] **Bug tersembunyi ketemu pas verifikasi**: konten halaman (deskripsi + sugesti) gak muncul sama sekali di screenshot pertama — ternyata `globals.css` ngunci `html, body { height:100%; overflow:hidden }` secara global (buat kanvas game), jadi `min-h-screen` di halaman baru ini gak bisa discroll — kepotong invisible. Diperbaiki dengan bikin `<main>` sendiri yang jadi scroll container (`h-[100dvh] overflow-y-auto`), TANPA nyentuh `globals.css` (biar gak ganggu halaman game yang emang butuh body dikunci).
- [x] Diverifikasi scroll beneran jalan (bukan cuma keliatan cukup) — dicek `main.scrollHeight` lebih tinggi dari viewport, di-scroll manual ke bawah lewat `page.evaluate`, dan discreenshot: konten deskripsi + grid sugesti (4 kolom di landscape) kebukti muncul lengkap.
- [x] Diverifikasi di mobile landscape (844×390, orientasi yang emang didukung app — portrait mobile sengaja diblokir global `RotateDeviceOverlay` yang udah ada duluan, bukan bagian dari perubahan ini) dan desktop (1280×900) — gambar+teks+sugesti+tombol kembali semua rapi, gak ada yang kepotong.
- [x] `tsc --noEmit` bersih, `npm run lint` gak nambah masalah baru (tetap di baseline 118 problems, 14 error/104 warning, semua pre-existing).

**Catatan:** `npm run build` gak dijalanin. Dev server dinyalain sendiri sementara cuma buat verifikasi visual, dimatikan lagi setelahnya — mulai sesi ini user run dev server manual sendiri di port 3000.

## 52. Revamp Desain Halaman Detail Informasi — "Entri Jurnal Penjelajah"

User bilang desain hasil §51 (kartu putih rounded generik) jelek. Diminta revamp pakai aset-aset yang udah ada di folder assets, bukan bikin tampilan generik lagi.

- [x] Konsep baru: **kartu jurnal penjelajah** — foto konten dipasang miring (rotate -3deg) di dalam bingkai ornamen asli (`information.imagePopup` + `imagePopupMask`, teknik masking yang sama persis kayak halaman gambar lama), nongol di atas papan kayu (`background.kayu`) diapit sulur tanaman kiri-kanan (`tanamankiri`/`tanamankanan`), dengan label kategori gaya gantungan emas claymorphism (resep sama kayak `BackButton`) nempel di pojok.
- [x] Judul + deskripsi dipindah ke inset kertas (`information.kertas`) di dalam papan kayu, dikasih 2 aksen bunga melati di sudut kertas (bukan 3 tersebar random kayak sebelumnya — dikurangi biar gak menuh-menuhin, sesuai prinsip "boldness di satu tempat" karena foto+sulur+label udah jadi pusat perhatian).
- [x] Sugesti "Jelajahi Lainnya" diganti dari grid kartu biru generik (`CardList`, gaya buat listing utama) jadi **postcard kertas kecil miring-miring** (rotasi selang-seling per index), nempel gaya foto ditempel, tegak lurus + naik dikit pas di-hover/focus — visual language beda dari listing utama karena halaman detail ini sekarang punya identitas sendiri (jurnal), bukan drop-in generik dari halaman lain.
- [x] Ditambah animasi masuk halus (`nq-journal-in`, fade+rise) buat kartu jurnal pas halaman dimuat, dan transition hover/focus buat postcard — dua-duanya respect `prefers-reduced-motion: reduce`.
- [x] Diverifikasi visual di desktop (1280×900) dan mobile landscape (844×390, termasuk discroll ke tengah & bawah) — bingkai foto, papan kayu, kertas, label kategori, dan grid postcard semua kebukti render rapi & gak kepotong.
- [x] `tsc --noEmit` bersih, `npm run lint` tetap di baseline (118 problems, gak nambah).

**Catatan:** `npm run build` gak dijalanin. Verifikasi pakai dev server yang user run manual sendiri (bukan Claude yang nyalain).

## 53. Perbesar Foto & Deskripsi di Entri Jurnal + Polish Tambahan

Follow-up §52 — user suka arah desainnya, minta foto & isi deskripsi diperbesar lagi. Postcard sugesti di bawah dikonfirmasi udah bagus (gak disentuh).

- [x] Kartu jurnal `max-w-2xl` → `max-w-3xl`, foto `max-w-sm` (24rem) → `max-w-xl` (36rem) dengan lebar persentase juga dinaikin (`w-[72%]/[65%]` → `w-[88%]/[78%]`) — foto sekarang jauh lebih dominan, bingkai ornamen oranyenya (`imagePopup`) ikutan lebih jelas kebaca karena lebih besar.
- [x] Judul (`text-xl→2xl→3xl` jadi `2xl→3xl→4xl`) dan deskripsi (`text-sm→base→lg` jadi `base→lg→xl`) dibesarin, padding kertas & papan kayu ikut disesuaikan (lebih lapang) biar proporsional sama konten yang lebih besar.
- [x] Polish tambahan: ditambah elips shadow blur (`nq-photo-shadow`, radial gradient) persis di bawah foto — ngasih kesan foto "nempel ngambang" di atas papan kayu, bukan cuma numpuk flat kayak sebelumnya.
- [x] Diverifikasi visual desktop (1280×900) dan mobile landscape (844×390, top + scroll ke tengah) — foto & kertas kebukti lebih besar & proporsional, gak ada yang kepotong atau nabrak sulur/label kategori.
- [x] `tsc --noEmit` bersih, `npm run lint` tetap di baseline (118 problems).

**Catatan:** `npm run build` gak dijalanin. Verifikasi pakai dev server yang user run manual sendiri.

## 54. Fix Hydration Warning (Suppress Terarah) + Fitur Okupansi & Lock Room

Follow-up laporan console error hydration (`bis_skin_checked`/`bis_register`) + laporan fungsional: user tes Ular Tangga 2 akun, cek pakai akun ke-3 — gak ada tanda room/provinsi udah kepake, dan room yang game-nya udah mulai masih bisa di-klik orang baru.

### Bagian 1 — Hydration error
- Dikonfirmasi ulang (`grep -rn "bis_skin_checked\|bis_register" src`) nihil di source — atribut di-inject browser extension ke DOM sebelum React hydrate, sama persis kasusnya kayak investigasi `/information` sebelumnya.
- [x] Ditambah `suppressHydrationWarning` ke 2 elemen yang eksplisit disebut di stack trace user dan render di setiap halaman: `<body>` (`src/app/layout.tsx`) dan div root `RotateDeviceOverlay.tsx`. Ini scoped ke elemen itu doang (gak menjalar ke children per semantik React), jadi bug hydration beneran di tempat lain (termasuk div di `Loader.tsx` yang juga muncul di pesan error user) tetap bakal ke-flag kalau ada — dijelasin ke user kalau ini gak bisa 100% bikin console sepi selama extension-nya aktif, karena extension bisa nyuntik ke div manapun yang gak kita kontrol.

### Bagian 2 — Okupansi & lock room
Ditelusuri dulu (3 subagent paralel) alur asli home→lobby→room ternyata pakai skema room ad-hoc (`rooms/{gameID}_{regionID}_room{N}`, field `status`/`players`/`capacity`) yang BEDA dari model `Room` bertipe di `types/firestore.ts` (dipakai halaman `/lobby` lama yang udah gak ke-reach dari flow home). Ketemu juga bug nyata: `RoomPage` sebelumnya join+redirect user baru ke room yang `status`-nya udah `'playing'` tanpa cek, bikin mereka nyasar ke `/play/...` dengan game-state yang gak pernah di-init buat mereka.

- [x] `src/features/lobby/services/rooms.service.ts` — fungsi baru `getRoomsOccupancy(roomIds)`: batched query `documentId() in [...]` (chunk 10), balikin `{status, activeCount}` per room id. `activeCount` dihitung dari `players` yang `isActive !== false`, bukan field `currentPlayers` yang gak reliable (gak didekrement pas leave).
- [x] `src/features/lobby/components/RoomSelect.tsx` — subscribe real-time (`listenToRoom`, udah ada sebelumnya tapi gak dipakai) ke 4 room multiplayer (`vs-ai` dikecualikan, single-player). Room dianggap "locked" kalau `status==='playing'` DAN `activeCount>0` (kalau 0 dianggap ditinggal/available lagi, bukan permanen ke-lock). Locked → gambar rumah di-dim, overlay ikon gembok + "Sedang Bermain • N orang", tombol non-interaktif. Ada orang tapi belum mulai → badge kecil "N orang", tetap bisa diklik.
- [x] `src/styles/lobby.css` (dicek dulu file mana yang beneran ke-import — ada 2 file `lobby.css` identik-nama, cuma yang di `src/styles/` yang aktif) — style badge/overlay pakai resep claymorphism yang sama kayak `BackButton`/`NavBar` (gradasi krem + shadow berlapis), varian merah buat status terkunci.
- [x] `room/[gameID]/[topicID]/[roomID]/page.tsx` — ditambah guard: kalau room udah ada dan `status==='playing'` dan user BUKAN salah satu `players` yang udah gabung, gak di-join — tampilin pesan "Room ini sedang dipakai • N orang bermain" + tombol kembali, bukan slot kosong. Ini sekalian nutup bug redirect-ke-game-kosong yang ketemu pas nelusurin kode.
- [x] `src/components/home/ProvinceSelectionModal.tsx` — sekali fetch (bukan real-time, biar gak buka puluhan listener tiap modal dibuka-tutup) `getRoomsOccupancy` buat 4 room × provinsi yang lagi ketampil di halaman itu (≤6), badge kecil pojok kanan-atas nama provinsi kalau totalnya >0, gak nongol sama sekali kalau kosong (gak ganggu tampilan provinsi lain).
- [x] `src/components/home/home-modals.css` — style badge okupansi provinsi, kecil & di pojok, gradasi emas.
- **Sengaja gak disentuh** (di luar cakupan diminta, risikonya lebih gede): `firestore.rules` (baca `rooms` udah public, jadi gak perlu diubah buat nampilin; ngeblok write server-side pas room udah `playing` itu perubahan rules terpisah yang butuh audit sendiri — guard client-side di atas udah nutup permintaan "gak bisa di-klik"), halaman `/lobby` lama yang gak ke-reach, dan titik pemicu `checkAndResetAbandonedRoom` (tetap cuma jalan pas ada yang buka halaman room-nya sendiri).
- [x] Diverifikasi: `tsc --noEmit` bersih, `npm run lint` gak nambah error/warning baru di file yang disentuh. Screenshot modal provinsi lewat dev server sementara (dimatikan lagi setelah selesai) nunjukin badge okupansi beneran muncul pakai data asli dari sesi tes 2-akun user sendiri ("Aceh" nongol badge "2"), gak ada console error, dan halaman `/lobby`/`/room` tetap ke-redirect ke `/login` kayak biasa buat visitor belum login (gak ke-review visual buat status locked/room-select karena butuh 2+ akun login beneran yang Claude gak punya kredensialnya — disaranin user lanjut tes manual pakai 2-3 akun kayak sebelumnya buat konfirmasi behavior lock/badge di RoomSelect & RoomPage).

**Catatan:** `npm run build` gak dijalanin. Dev server dinyalain sementara cuma buat verifikasi visual (province modal + redirect check), dimatikan lagi setelahnya.

## 55. Ular Tangga: Auto-Win Kalau Tinggal 1 Pemain Aktif + Win Modal + Room Kebuka Lagi

User tes Ular Tangga 2 akun, salah satu keluar tab sebelum game selesai — gak ada feedback sama sekali (baik menang normal maupun tinggal 1 pemain), dan room yang udah dipakai gak langsung kebuka lagi buat orang lain.

Ditelusuri dulu (1 Explore agent + baca manual `ular-tangga-game.service.ts` & halaman play): **gak ada win modal sama sekali** — baik menang normal (kotak 100) maupun kalau ditambah menang-karena-ditinggal, dua-duanya cuma `router.push('/')` instan tanpa UI. Field `gameWinnerUID`/`gameWinnerDisplayName`/`gameWonAt` udah ada di tipe `UlarTanggaGameState` tapi gak pernah keisi. Gak ada asset "menang" spesifik — dipakai `badge.gold1` (GOLD_1) yang paling cocok secara tematik.

**Catatan**: ini nyentuh "kondisi menang" (area yang secara default gak boleh diubah tanpa persetujuan lead per `AGENTS.md`) — dilanjutkan karena instruksi eksplisit user. Aturan dadu/tangga/ular/giliran/timer/papan **gak diubah sama sekali**, cuma ditambah 1 cara menang baru (lawan hilang, tinggal 1 aktif) + modal feedback yang sebelumnya emang gak ada buat kedua jenis menang. Scope Ular Tangga aja (yang ditest) — NusaCard gak disentuh.

- [x] `ular-tangga-game.service.ts` — helper baru `reopenRoom(roomID)` (`updateDoc` room ke `status:'waiting', gameStarted:false`, persis logic reset yang udah ada di `checkAndResetAbandonedRoom`, sekarang dipanggil PROAKTIF pas game beneran selesai, bukan nunggu ada yang kebetulan visit ulang halaman room).
- [x] `movePawn()` & `submitAnswer()` — di titik menang normal (pion pas ke kotak 100), sekarang ngisi `gameWinnerUID`+`gameWonAt` (field yang tadinya nganggur) dan manggil `reopenRoom()`.
- [x] Fungsi baru `checkAndFinalizeSoleSurvivor(topicID, gameID, roomID)` — hitung pemain aktif pakai formula staleness YANG SAMA persis dengan bot-takeover effect yang udah ada (`isActive && now-lastActivity<=60000`, "belum ada activity record" dianggap aktif) — biar definisi "aktif" konsisten di satu tempat, bukan bikin threshold baru. Kalau ≥2 pemain total tapi cuma 1 yang keitung aktif → set `gameStatus:'finished'` + `gameWinnerUID` + `reopenRoom()`. Idempotent (guard `gameStatus!=='playing'`) — aman dipanggil berkali-kali.
- [x] `play/[gameID]/[topicID]/[roomID]/ular-tangga/page.tsx` — effect baru (pola sama kayak bot-takeover effect yang udah ada) yang manggil `checkAndFinalizeSoleSurvivor` dari client si pemain yang masih aktif doang (pemain yang udah kabur browsernya emang udah gak jalan, jadi gak ada race nulis bareng). `router.push('/')` otomatis pas `gameStatus==='finished'` dihapus — diganti `WinModal` yang muncul, user klik sendiri buat lanjut ke lobby. `gameStatus==='abandoned'` (jalur `cleanupGame`, terpisah) tetap auto-redirect kayak sebelumnya, gak diubah.
- [x] Komponen baru `src/features/game-ular-tangga/components/WinModal.tsx` — pola visual sama kayak `PauseModal` yang udah ada (overlay gelap+blur, font Tanker) tapi kartu parchment sendiri (`information.kertas`) + badge `badge.gold1` sebagai trophy + tombol claymorphism emas ("Kembali ke Lobby", resep sama kayak `BackButton`). Animasi scale-in badge + fade-in kartu, respect `prefers-reduced-motion`.
- [x] Diverifikasi visual: modal di-render sendiri di route test sementara (`/win-test`, dihapus lagi setelah screenshot) lewat dev server sementara (dimatikan lagi setelahnya) — tampilan sesuai desain, overlay gelap+blur kebukti kerja (dicek pixel sampling, bukan cuma keliatan mata).
- [x] `tsc --noEmit` bersih (termasuk bersihin cache `.next/dev/types` yang sempet nyangkut nunjuk ke route test yang udah dihapus), `npm run lint` tetap di baseline 118 problems — 1 warning `<img>` baru di `WinModal.tsx` (konsisten sama pola `<img>` yang udah dipakai `PauseModal` dan banyak tempat lain, bukan regresi).
- [ ] **Belum ke-tes end-to-end** — butuh 2 akun beneran (Claude gak punya kredensial login user). Disaranin user tes manual: main 2 akun, salah satu keluar tab pas game jalan, pastikan yang tersisa dapet `WinModal` "Kamu Menang!" dalam ~30-60 detik (nunggu heartbeat basi 2x), dan room langsung ke-unlock lagi di `RoomSelect`/badge okupansi (fitur §54) tanpa nunggu heuristic.

**Catatan:** `npm run build` gak dijalanin. Dev server dinyalain sementara cuma buat screenshot `WinModal` terisolasi, dimatikan lagi setelahnya.

## 56. Bug Hunt Ular Tangga + Percepat Loading Room/Lobby

User minta dicariin bug di game Ular Tangga (setelah fitur win-modal/lock jalan) + dipercepat loading pas pindah ke room/lobby yang katanya lama banget. Ditelusuri pakai 2 Explore agent paralel (1 bug hunt, 1 investigasi performa) + baca manual `Board.tsx`/`Pion.jsx` buat validasi fix paling berisiko sebelum dieksekusi.

### Bug ditemukan & diperbaiki
- [x] **Lempar dadu "1" di giliran pertama gak pernah animasi/keliatan jalan** (100% reproducible, bukan race) — `ular-tangga/page.tsx`, mapping `pos<=1 ? 0 : pos-1` nyamain posisi "belum jalan" (0) sama "di kotak 1" (1) jadi index papan yang sama, jadi `Pion.jsx` gak pernah ngedeteksi perubahan buat animasi. Ketauan `Board.tsx` udah punya fitur "tray" (pion nunggu di luar papan) yang lengkap tapi MATI karena gak ada yang pernah ngirim index -1. Fix: `pos===0 ? -1 : pos-1` — sekaligus ngidupin fitur tray yang emang udah dibikin tapi gak pernah kepake.
- [x] **Timer bot yatim** — effect bot-takeover di `ular-tangga/page.tsx` nge-schedule 2 timer bersarang (roll lalu complete) tapi cleanup cuma nge-clear yang luar. Kalau effect-nya re-run pas timer dalam masih ngantri (misal pemain offline balik nyambung), timer dalam tetep jalan belakangan pakai state basi. Fix: dua-duanya di-track & di-clear bareng di cleanup.
- [x] **Gak ada penjagaan dobel-aksi per giliran** — kombinasi bug di atas + gak ada guard bisa bikin 1 client manggil `movePawn`/`nextTurn`/`submitAnswer` dua kali buat giliran yang sama (giliran kelewat/kebalap). Fix: 2 ref baru (`actedRollTurnRef`, `actedAnswerTurnRef`, dipisah biar gak nge-block roll-lalu-jawab-soal yang emang sah dalam 1 giliran yang sama), tiap handler cuma jalan sekali per `turnCounter`.
- [x] **Lost-update pas pion meluncur dari kepala ular ke ekor** — `movePawn()` di service nyimpen snapshot `pionPositions` SEBELUM delay animasi (~sampai 2.2 detik), terus nulis balik snapshot basi itu setelah delay — nimpa write lain yang landing pas nunggu. Fix: baca ulang dokumen abis delay, tempel posisi ekor ke array yang PALING BARU, baru ditulis — bukan nulis balik snapshot lama.
- **Didokumentasikan, sengaja gak diperbaiki**: race sempit antara `checkAndFinalizeSoleSurvivor` (§55) dan menang normal kalau dua-duanya kejadian nyaris bersamaan — butuh `runTransaction` di semua jalur nulis kemenangan buat nutup total, itu pekerjaan terpisah yang lebih besar/berisiko, di luar cakupan ronde ini.

### Percepat loading room/lobby
Ditelusuri: kasus paling umum (buka room yang UDAH ada, revisit) ternyata baca dokumen `rooms/{roomKey}` yang SAMA sebanyak **3 kali berurutan** (`checkAndResetAbandonedRoom`, getDoc punya halaman sendiri, lalu `playerJoinRoom`→`joinRoom` baca lagi) plus sampai 2 write, semuanya di-`await` berurutan sebelum loading ilang — tiap round-trip ~100-300ms, jadi bisa nambah 1+ detik murni nunggu jaringan.

- [x] `rooms.service.ts` — pengecekan "room udah `playing` dan kita bukan pemainnya" (fitur lock dari §54) dipindah numpang ke read yang UDAH dilakuin `joinRoom()` sendiri (`getRoomById`), bukan baca terpisah lagi — sekarang lempar error `ROOM_LOCKED` (dengan `activeCount` nempel) dari read yang sama.
- [x] `room/[gameID]/[topicID]/[roomID]/page.tsx` — effect join direstruktur dari "cek ada → bikin kalau belum → join" jadi **"coba join dulu → kalau 'Room not found' baru bikin lalu join ulang"**. Collapse dari 3 read ke 1 read buat kasus umum (room udah ada); kasus room BENERAN baru (jarang, sekali per room) yang bayar ekstra. Sekalian ganti `await import(...)` dinamis yang gak guna (modulenya udah ke-load statis lewat import lain di file yang sama) jadi static import biasa.
- [x] Ditambah `loading.tsx` (reuse `Loader`) buat route `/room/[...]` dan `/lobby/[...]` — kasih feedback instan pas transisi client-side sambil chunk route-nya dimuat, di atas data-fetch yang sekarang udah lebih cepet.
- **Sengaja gak disentuh**: auth-init (`providers.tsx`/`layout.tsx`) — agent konfirmasi cuma mempengaruhi first-load/refresh, gak berulang tiap navigasi dalam sesi yang sama (yang dikeluhkan user); `<img>` di `RoomSelect` — dampaknya kecil karena URL Cloudinary udah versioned + cache 1 tahun.

### Verifikasi
- [x] `tsc --noEmit` bersih di tiap langkah, `npm run lint` tetap di baseline 118 problems (gak nambah).
- [x] Smoke test pakai dev server user (bukan yang Claude nyalain) — `/home` render tanpa console error, navigasi ke `/lobby/...` tanpa login tetep bener-bener ke-redirect ke `/login` (gate auth gak somehow kebobol/rusak sama restrukturisasi join effect).
- [ ] **Race condition & kecepatan beneran belum ke-test end-to-end** — butuh 2 akun beneran + pengukuran network yang gak bisa Claude lakuin. Disaranin user cross-check: rasain langsung apa loading room/lobby beneran lebih cepet, dan coba reproduce skenario reconnect-pas-bot-jalan (matiin tab pas giliran sendiri, biar bot ambil alih, lalu buka lagi pas bot lagi proses) buat mastiin gak ada lagi giliran kelewat/kebalap.

**Catatan:** `npm run build` gak dijalanin. Verifikasi pakai dev server yang user run manual sendiri.

## 57. Redesign Loader Fullscreen — Cuma Awan, Gede, Tanpa BG Biru

User minta animasi loading (`Loader.tsx`, dipakai di 9 tempat buat transisi antar halaman) didesain ulang: buang background gradasi biru, sisain awannya doang dari pojok kiri-atas & kanan-bawah, diperbesar sampai kerasa "nutupin layar", teks loading di tengah.

- [x] `src/components/ui/Loader.tsx` — varian `fullScreen` (default, dipakai di 8 dari 9 tempat) dirombak: `bg-gradient-to-b from-[#98dcff]...` + overlay `bg-black/10` dihapus total, dua `<Image>` awan dipindah dari flex-centered jadi `absolute` di pojok kiri-atas (`-top-[8%] -left-[12%]`) & kanan-bawah (`-bottom-[8%] -right-[12%]`), ukuran naik dari `max-w-[340px]` ke `w-[80vw] max-w-[1080px]`. Teks dipindah dari `absolute bottom-[12vh]` ke ngikut flex-center wrapper (beneran di tengah), warna diganti dari putih (kebaca di atas biru) ke coklat tua `#4a2a1a` + drop-shadow putih tipis (biar tetep kebaca sekarang backgroundnya transparan/putih).
- [x] Varian compact (`fullScreen={false}`, cuma dipakai 1 tempat — kartu kecil ter-embed di halaman `/lobby` legacy) **sengaja gak disentuh** — beda konteks visual (kartu kecil di dalam halaman, bukan takeover), gak diminta diubah.
- [x] `Loader.module.css` — animasi `cloud-left-in`/`cloud-right-in` (dulu: awan meluncur dari luar layar ke posisi tengah, buat layout lama yang flex-centered) diganti `cloud-drift-tl`/`cloud-drift-br` (gerakan mengambang halus di tempat — translate+scale kecil, infinite alternate), karena awan sekarang nempel di pojok dari awal, bukan meluncur dari center.
- [x] Diverifikasi visual — render terisolasi di route test sementara (dihapus lagi setelahnya) lewat dev server yang user run manual, discreenshot desktop (1280×800) dan mobile landscape (844×390, orientasi yang didukung app): awan nutupin porsi besar layar dari 2 pojok berlawanan, saling mendekat ke tengah di viewport kecil, teks tetap kebaca jelas di celah tengah, gak ada bg biru sama sekali.
- [x] `tsc --noEmit` bersih, `npm run lint` tetap di baseline 118 problems.

**Catatan:** `npm run build` gak dijalanin. Verifikasi visual pakai dev server yang user run manual sendiri (bukan Claude yang nyalain).

## 58. Loader: Kembalikan Animasi Awan Pinggir↔Tengah (Koreksi §57)

Koreksi dari §57 — user gak suka versi "nempel diem di pojok, gerak dikit di tempat" yang kemarin dibikin, maunya animasi ASLI dikembaliin: awan gerak dari pinggir ke tengah lalu balik lagi, terus-terusan selama loading. Sempet nanya balik ke user soal bagian "background-nya halaman terakhir user" karena ambigu — bisa berarti sekadar transparan (perubahan kecil) atau beneran nampilin halaman sebelumnya di belakang awan pas transisi (butuh sistem transisi halaman baru, nyentuh 9 tempat pemanggilan `Loader`, jauh lebih besar). User pilih opsi simpel: transparan aja, gak perlu sistem baru.

- [x] `Loader.module.css` — keyframes `cloud-drift-tl`/`cloud-drift-br` (yang kemarin cuma gerak dikit di tempat, `translate(1.6vw,1.2vh)`) diganti jadi gerakan pinggir↔tengah beneran (`translate(9vw,7vh)` buat yang kiri-atas, `translate(9vw,-7vh)` abis `scaleX(-1)` buat yang kanan-bawah — arahnya udah dicek biar dua-duanya konvergen ke tengah yang sama), `infinite alternate` biar terus "napas" selama Loader kepasang, bukan cuma sekali jalan terus diem. Jarak ditakar ulang buat ukuran awan baru yang lebih gede (dulu jarak lama `-34vw` itu buat awan `w-[38vw]`, kalo dipake ke awan `w-[80vw]` bakal overshoot parah).
- [x] `Loader.tsx` — gak ada perubahan (nama class-nya dipertahanin sama, cuma isi animasinya yang diganti di CSS module).
- [x] Background tetep transparan (gak ada perubahan dari §57 — udah sesuai jawaban user).
- [x] Diverifikasi BUKAN cuma dari screenshot visual (2 screenshot berjarak 2 detik awalnya kelihatan identik gara-gara timing sampling kebetulan nangkep fase yang mirip di kurva ease-in-out) — dicek `getComputedStyle(img).transform` langsung tiap ~0.9 detik lewat Playwright, kebukti nilai translate-nya beneran naik-turun dari ~114px ke ~0.5px terus naik lagi ke ~104px, satu siklus penuh pinggir→tengah→pinggir. Baru setelah itu di-screenshot ulang buat konfirmasi visual di 2 titik ekstrem — kebukti bedanya jelas kelihatan.
- [x] `tsc --noEmit` bersih, `npm run lint` tetap di baseline 118 problems.

**Catatan:** `npm run build` gak dijalanin. Verifikasi pakai dev server yang user run manual sendiri, route test sementara dihapus lagi setelah selesai.

## 59. Revamp Loading Screen (skill FE) + 4 Fix Visual Lainnya

User bilang loading screen masih jelek walau animasi awan udah dibenerin — diminta revamp beneran pakai skill desain. Sekalian minta 4 perbaikan visual lain di halaman berbeda.

### Revamp Loading Screen
Konsep: **"lagi berlayar ke pulau berikutnya"** — bukan spinner/awan generik, tapi nyambung ke motif eksplorasi kepulauan yang udah jadi identitas app ini (kapal, papan kayu, claymorphism emas dipakai di mana-mana). Awan tetap dipertahanin (sesuai preferensi eksplisit user session sebelumnya), ditambah:
- [x] `Loader.tsx` — kapal (`home.kapal`, aset yang sama dipakai armada di home page) ditaruh di tengah, mengapung dengan animasi bob halus (`translateY` + tilt kecil) + bayangan elips di bawahnya yang "napas" berlawanan fase (mengecil pas kapal naik).
- [x] Teks loading dipindah dari teks polos melayang jadi pil claymorphism emas (`.loadingSignInner`, resep sama persis kayak `BackButton`/`NavBar`/`WinModal` — gradasi krem puffy + shadow berlapis) dengan animasi masuk halus (`sign-in`).
- [x] `Loader.module.css` — keyframes baru `boat-bob`, `boat-shadow`, `sign-in`; ditambah `prefers-reduced-motion: reduce` buat semua animasi Loader (belum ada sebelumnya).
- [x] Diverifikasi visual — kapal, bayangan, pil emas, dan awan pojok semua kebukti render & animasi jalan bareng secara koheren.

### 4 fix visual lainnya
- [x] **Teks "INFORMASI" di papan home** (`papan1-text`, `home.css`) — pixel-scan `papan-1_gzqa2m.webp` nunjukin muka papan kayu (bukan kotak gambar penuh yang termasuk tiang di bawahnya) pusatnya di 27.9% dari atas, bukan 46% yang dipakai kode lama — itu penyebab teks kerasa ketarik ke bawah dari tengah papan. Diperbaiki ke `top:28%`, sekalian font-size dibesarin `1.3rem`→`1.6rem`. State hover disesuaikan juga (`translate(-50%,-180%)`→`translate(-50%,-50%)`).
- [x] **Card biru di halaman informasi** (`CardList.tsx`) — warna solid `#254a68` diganti claymorphism biru (gradasi puffy + shadow berlapis, resep sama kayak resep emas tapi hue biru), hover jadi angkat+brighten bukan cuma scale, tetep biru sesuai request eksplisit user ("warna biru gitu").
- [x] **Header "INFORMASI" (pita kuning) gak center** (`PageHeader.tsx`) — dicek ulang pakai `Range.getClientRects()` (bukan pixel-scan yang udah kebukti gak reliable beberapa kali sebelumnya di sesi ini): horizontal udah presisi (640.0 = 640.0), TAPI vertikal ternyata beneran offset — `top-[46%]` dipakai buat posisi kuning, padahal pusat kuning asli board1 (`board-1_hlxc1z.webp`) ada di 27.9%-29.9% tergantung asset (sama kelas bug kayak papan home di atas — kotak gambar vs muka papan/pita gak sama). Diperbaiki ke `top-[28%]`; re-verifikasi Range API abis fix: selisih 0.36px doang.
- [x] **Modal "Pilih Game" — 2 kartu game dibesarin + tinggi ditambah** (`home-modals.css`) — `.game-options-grid` max-width `34rem→37rem`, `.game-option-card` min-height `130px→152px` (default), `110px→124px`/`112px→124px`/`84px→92px` (breakpoint 1024/640/360px — breakpoint landscape super sempit sengaja gak disentuh biar gak numpuk sama layout yang udah dipas-in), `.game-option-icon-img` `56-110px→60-122px`.
- [x] Diverifikasi visual semua 4 item lewat dev server user (sementara dipinjam buat screenshot, gak dimatiin punya user) — kartu biru claymorphism kebukti puffy, "Pilih Game" 2 kartu kebukti lebih besar/tinggi, papan home & header informasi kebukti center via pengukuran DOM (bukan mata doang).
- [x] `tsc --noEmit` bersih, `npm run lint` tetap di baseline 118 problems.

**Belum dikerjakan**: user nyebut "2 error yang gak tau kenapa" tapi belum sempet paste detailnya — nyusul di pesan berikutnya.

**Catatan:** `npm run build` gak dijalanin. Verifikasi visual pakai dev server yang user run manual sendiri, route test sementara dihapus lagi setelahnya.

## 60. NusaCard: Rombak Aturan Main + Frontend Sesuai Desain + Timeout Idle Global (2 Game)

User kasih referensi desain (`src/nusacard.png`, 4 pemain) + penjelasan lengkap aturan main NusaCard secara verbal, minta dibangun bener-bener sesuai itu — bukan asal desain. Ditelusuri dulu (1 Explore agent + baca manual) sebelum nulis kode apapun, dan ketauan **aturan yang KEBENERAN JALAN di `nusa-card-game.service.ts` beda sama yang dijelasin user**:

| | Yang jalan sebelumnya | Aturan asli user (dikonfirmasi) |
|---|---|---|
| Yang jawab kartu dilempar | SEMUA pemain lain, gantian | Cuma **1** — pemain berikutnya di urutan giliran |
| Jawaban salah | Cuma nambah tally `wrongCounts` | Penjawab **dapet 1 kartu baru** (soal random) |
| Giliran abis jawaban | Geser ke index berikutnya | Giliran **pindah ke yang baru jawab** |
| Kondisi menang | Semua kartu abis BARENGAN, menang = correctCount tertinggi | Tiap pemain yang kartunya abis (lempar kartu terakhir) dapet peringkat urut selesai (1,2,3); lanjut sampe tinggal 1 aktif (otomatis dapet peringkat terakhir); yang udah selesai nunggu |

Juga ketauan `types.ts`/`nuca-rules.ts` itu sisa rancangan lama yang gak kepake sama sekali (skema poin/rarity yang ditinggalin), dan aset `arrowNuca` (SVG panah) ada di folder assets tapi gak pernah dipanggil di komponen manapun — ternyata itu emang buat 4 panah rotasi di sekeliling tumpukan tengah yang ada di gambar referensi, cuma belum pernah disambungin.

### Rombak aturan (`nusa-card-game.service.ts`)
- [x] State baru: `playerHands`, `drawPile` (soal cadangan yang DITAHAN pas bagi kartu awal — sebelumnya SEMUA soal yang di-fetch langsung habis dibagi ke tangan pemain, jadi gak ada sumber buat "kartu tambahan pas salah jawab"), `currentThrowerIndex`, `currentAnsweringUID` (1 UID doang, bukan antrean), `finishedOrder` (urutan selesai = urutan peringkat), `playerActivity` + `lastActionAt` (buat heartbeat & idle-check).
- [x] `throwCard` — kartu ilang dari tangan pelempar; kalau abis, pelempar LANGSUNG masuk `finishedOrder` (gak peduli hasil jawaban kartu ini). Penjawab = pemain aktif berikutnya (skip yang udah selesai).
- [x] `submitAnswer` — bener: tangan gak berubah. Salah: tarik 1 soal dari `drawPile` (fallback pinjem ulang soal random kalau `drawPile` abis, biar mekanismenya gak pernah macet). Giliran lempar pindah ke PENJAWAB (dikonfirmasi user, bukan geser index). Abis resolve, kalau pemain aktif tinggal 1, otomatis masuk `finishedOrder` & game kelar.
- [x] `nusa-card-vs-ai/page.tsx` disesuaikan biar tetep kompilasi jalan sama skema baru (rename `playCard`→`throwCard`, ganti tampilan "X benar" jadi "X kartu" karena scoring lama emang sengaja dihapus, `winnerUID` diganti derive dari `finishedOrder[0]`) — TIDAK dirombak lebih jauh dari itu (di luar cakupan yang diminta, cuma dijaga biar gak pecah).

### Timeout idle GLOBAL 10 menit (Ular Tangga + NusaCard)
- [x] Field `lastActionAt` ditambah ke KEDUA game state (beda dari `lastUpdated`, yang juga ke-bump sama heartbeat — kalau dipakai buat cek idle bakal salah, karena heartbeat bikin dia keliatan "masih aktif" padahal gak ada yang beneran main), di-stamp cuma di aksi nyata (lempar dadu/jawab soal ular tangga; lempar/jawab kartu nusacard), BUKAN di update heartbeat.
- [x] `checkAndInvalidateIfIdle(roomID)` — kalau `now - lastActionAt > 10 menit`, `gameStatus` di-set `'timeout'` + room dibuka lagi (`status:'waiting'`). Dipanggil dari interval heartbeat yang udah ada di kedua halaman play (aman dipanggil dari client manapun, idempotent).
- [x] Kedua halaman play nangkep `gameStatus==='timeout'` dan redirect ke `/home` — beda dari `'abandoned'` (masih ke lobby, gak diubah).

### Frontend disesuaikan ke gambar referensi
- [x] `GameBackground.tsx` — meja dari lingkaran (`h≈w`, jadinya bulet) jadi oval/pill beneran (lebar jauh lebih gede dari tinggi, `rounded-full` otomatis "mentok" jadi ujung setengah lingkaran + sisi lurus).
- [x] `GameArea.tsx` — 4 salinan `arrowNuca` (aset yang tadinya nganggur) disebar muter 90° di sekeliling tumpukan tengah, sesuai motif di gambar referensi. Layout kursi digeneralisir dari tetap-4 jadi 2-4 pemain (`bisa disesuaikan aja pemainnya yg main brp orang`): 1 lawan→atas, 2 lawan→kiri+kanan, 3 lawan→atas+kiri+kanan (default 4 pemain, sama kayak sebelumnya).
- [x] `QuestionModal.tsx` — ditambah `feedback` prop: abis jawaban ke-submit, pilihan yang bener disorot ijo, pilihan yang salah dipilih disorot merah, tombol dikunci — sebelumnya gak ada feedback visual sama sekali. Sekalian benerin typo class `relativeh-14` (harusnya `relative h-14`, ke-nyangkut aksesnya doang, gak kelihatan efeknya tapi salah).
- [x] `PlayerHandCards.tsx` — jarak tempuh animasi lempar kartu diganti dari px tetap (`-198`, ke-tuning buat layout lama) jadi `vh` proporsional (`-38vh`), ngarah ke posisi tumpukan tengah yang beneran (di layout baru, meja lebih pipih/oval).
- [x] `RankModal.tsx` (baru) — modal hasil akhir gaya claymorphism sama kayak `WinModal` di Ular Tangga, badge emas/perak/perunggu (`badge.gold1/silver1/bronze1`, aset yang udah ada) buat peringkat 1-3, baris "Kamu" disorot beda.
- [x] `nusa-card/page.tsx` — dirombak total: nambah heartbeat (yang sebelumnya gak ada sama sekali di halaman ini, beda dari Ular Tangga) + cek idle global, resiliensi giliran offline (mirip bot-takeover Ular Tangga — kalau pelempar/penjawab yang lagi giliran stale, client pemain aktif pertama otomatis lempar/jawab random buat dia), ganti banner "Kamu menang!" inline jadi `RankModal`, tombol kembali pake `BackButton` yang udah ada (bukan bikin baru).

### Verifikasi
- [x] `tsc --noEmit` bersih di seluruh proyek (termasuk `nusa-card-vs-ai` yang ikut kena imbas rename tipe).
- [x] `npm run lint` — 121 problems (baseline 118 + 3 warning baru, semua `<img>`/missing-dependency yang polanya udah ada di file lain di codebase ini, 0 error baru).
- [x] Verifikasi visual — route test sementara (dihapus lagi setelahnya) lewat dev server sementara (dimatiin lagi setelahnya) render `GameArea` + `GameBackground` pakai data 4-pemain palsu dan `RankModal` pakai data peringkat palsu: meja oval, panah rotasi, tumpukan kartu di 4 posisi, tangan kartu bawah, dan modal peringkat — semua kebukti cocok sama `nusacard.png` dan konsisten desain claymorphism yang udah dipake di seluruh app.
- [ ] **Belum ke-tes end-to-end beneran** — butuh 2-4 akun asli buat mastiin aturan baru jalan bener di real play (jawaban salah nambah kartu, giliran pindah ke penjawab, peringkat keluar bener pas ada yang abis kartunya, RankModal muncul pas game bener-bener kelar) dan buat nunggu 10 menit idle timeout beneran ke-trigger. Disaranin user tes manual multi-akun.

**Catatan:** `npm run build` gak dijalanin. Dev server dinyalain sementara cuma buat screenshot, dimatikan lagi setelahnya.

## 61. NusaCard: Batas Waktu Lempar 10 Detik + Fix Layout (Cramped PFP, Panah Kegedean)

Follow-up §60 — user tes main beneran, minta ditambah aturan baru (batas waktu lempar kartu) + 2 fix visual. POV/warna kartu (kuning=aku, biru=lawan) dicek ulang di kode, udah bener sesuai desain awal — gak ada perubahan di situ.

- [x] **Aturan baru: batas 10 detik buat lempar kartu** — berlaku ke SEMUA pemain (bukan cuma yang disconnect, beda konsep dari resiliensi offline §60). `nusa-card-game.service.ts`: field baru `throwerTurnStartedAt`, fungsi baru `handleThrowTimeout(roomID, throwerUID)` — kalau lewat 10 detik dan pelempar belum milih kartu, dia GAK jadi lempar tapi tangannya nambah 1 kartu random (dari `drawPile`, fallback sama kayak salah-jawab), terus giliran lempar pindah ke pemain aktif berikutnya. Idempotent (aman dipanggil bareng dari beberapa client — cuma 1 yang beneran ke-apply).
- [x] **Countdown ring di avatar pelempar** — `PlayerProfileNuca.tsx` diperluas: cincin emas yang sebelumnya statis buat status "thrower" sekarang animasi hitung mundur (mirip status "answering" yang udah ada), tapi disinkron ke `throwerTurnStartedAt` (jam server beneran), bukan cuma decrement lokal — biar akurat walau komponennya baru mount di tengah giliran (reconnect). SETIAP client yang ngeliat cincinnya nyampe 0 manggil `handleThrowTimeout` sendiri-sendiri (bukan cuma 1 "penunjuk" doang) — lebih tahan-banting buat batas waktu keras kayak gini, guard idempoten di service yang jaga biar cuma sekali ke-apply.
- [x] **Fix bug asli di balik "PFP kedempet"** — ketauan `.gap-[clamp(6px,1.6vmin,2px)]` di `GameArea.tsx` itu clamp MALFORMED (max 2px lebih kecil dari min 6px — CSS bakal resolve ke 2px MULU, super mepet). Diurutin ulang jadi `clamp(10px,2.6vmin,22px)` (opponent slot) & `clamp(14px,3vmin,28px)` (slot "aku") — urutan min<preferred<max yang bener.
- [x] **Panah tengah dikecilin di bawah ukuran kartu** — ukuran arrow diciutin (`h-[clamp(22px,4vmin,34px)]`→`h-[clamp(11px,1.8vmin,16px)]`, dst), sebelumnya emang lebih gede dari kartu tengah.
- [x] **Panah muter pas giliran ganti** — cincin panah (4 salinan `arrowNuca`, dibungkus 1 `motion.div`) sekarang muter 90° tiap `throwerUID` beneran berubah (bukan animasi lepas jalan terus), nempel ke turn-change asli.
- [x] Sempet kena lint ERROR baru (`react-hooks/set-state-in-effect`) dari cara nge-track turn-change buat rotasi panah (`setState` sinkron di dalam `useEffect`) — diganti pola "adjust state pas render" yang udah dipakai di tempat lain di codebase ini (`ProvinceSelectionModal.tsx`), bukan lewat effect.
- [x] Diverifikasi visual — spacing kebukti lebih lega, panah kebukti lebih kecil dari kartu tengah, countdown ring kebukti jalan (screenshot "10"→"04" beda 3 detik nunjukin hitungan beneran jalan berbasis waktu asli bukan angka statis), dan turn-change kebukti mindahin countdown+indicator ke pemain berikutnya pas dites klik manual (via route test sementara, dihapus lagi setelahnya).
- [x] `tsc --noEmit` bersih, `npm run lint` balik ke baseline 121 problems (13 error/108 warning, sama kayak abis §60 — sempet nambah 1 error gara-gara pola useEffect di atas, udah dibenerin, gak ada error baru yang nyisa).

**Belum ke-tes**: end-to-end multi-akun (sama kayak §60), khususnya nunggu 10 detik beneran abis pas gak milih kartu buat mastiin `handleThrowTimeout` ke-trigger tepat waktu di real play, dan pastiin kartu database asli tetep muncul bener di tangan (bukan cuma di test data palsu).

**Catatan:** `npm run build` gak dijalanin. Verifikasi visual pakai dev server yang user run manual sendiri, route test sementara dihapus lagi setelahnya.

## 62. NusaCard: Fix Bug Kartu Kosong (Index Firestore) + Layout + Instruksi Giliran

User tes beneran main dan tangannya kosong sama sekali (gak ada kartu kuning) + dapet console error `FirebaseError: The query requires an index`. Ternyata SATU akar masalah yang sama.

- [x] **Root cause ketemu & diperbaiki** — `nusa-card-game.service.ts` manggil `getQuestions` dari `questions.service.ts`, yang query-nya (`mapId`+`regionId`+`isActive`+`isApproved`+`orderBy createdAt`) BUTUH composite index yang belum ke-deploy — persis error yang muncul. Query itu gagal, `catch` di `nusa-card-game.service.ts` nangkep diem-diem & balikin array kosong, jadi GAK ADA soal yang ke-fetch sama sekali → gak ada kartu buat siapapun. `questions.service.ts` udah punya fungsi SAUDARANYA, `getQuestionsByRegion`, yang sengaja didesain query cuma filter `mapId` doang (sisanya di-filter di client), biar GAK BUTUH index sama sekali — dan `ular-tangga-game.service.ts` udah pakai itu buat alasan yang sama. Tinggal ganti 1 import (`getQuestions`→`getQuestionsByRegion`), gak perlu deploy index Firestore apapun. Dicek juga: satu-satunya tempat lain yang manggil `getQuestions` yang butuh index (`features/game/services/game.service.ts`) ternyata dead code (gak ke-reach dari flow manapun, cuma type-nya doang yang ke-import), jadi gak perlu disentuh.
- [x] **Kartu tengah dikecilin + panah dibesarin** (`GameArea.tsx`) — kebalik dari §61 (diminta eksplisit): tumpukan deck & kartu aktif diciutin (`h-[clamp(72-140px)]`→`h-[clamp(50-98px)]`), panah arah giliran dibesarin (`h-[clamp(11-16px)]`→`h-[clamp(34-66px)]`) sampe jelas lebih gede dari kartu.
- [x] **Instruksi teks giliran** — pil claymorphism baru di atas meja: "Giliran [nama] melempar kartu" / "Giliran [nama] menjawab", pake "kamu" kalau emang giliran sendiri (lebih enak dibaca). Cincin di avatar (udah ada dari sebelumnya) tetep jalan, ini nambahin teks eksplisit di atasnya sesuai diminta.
- [x] Diverifikasi visual — kartu tangan sendiri kebukti muncul (kuning, isi teks soal), kartu tengah kebukti lebih kecil, panah kebukti lebih gede dari kartu, banner "Giliran Budi melempar kartu" kebukti render di atas meja.
- [x] `tsc --noEmit` bersih, `npm run lint` tetap di baseline 121 problems.

**Belum ke-tes**: end-to-end multi-akun beneran pakai data Firestore asli (perbaikan index cuma diverifikasi lewat kode + data mock, belum lewat sesi main sungguhan karena Claude gak punya akun login).

**Catatan:** `npm run build` gak dijalanin. Dev server dinyalain sementara cuma buat screenshot, dimatikan lagi setelahnya.

## 63. NusaCard: Fix Room Ke-lock Selamanya Pas Ada yang Keluar Duluan (Root Cause Ketemu, Beda dari Dugaan Awal)

User tes lagi: keluar game pas tinggal 1 lawan — lawannya gak dapet modal juara, dan roomnya ke-lock permanen. Awalnya diduga soal "belum ada pengecekan sole-survivor kayak Ular Tangga", tapi setelah diinspeksi langsung ke Firestore live (`rooms`/`gameStates`, pakai akses yang udah diizinkan user), ketemu akar masalah yang lebih tepat.

- [x] **Root cause asli**: `nusa-card/page.tsx` punya 1 `useEffect` yang manggil `cleanupGame(roomKey)` (set `gameStatus:'abandoned'`) TANPA SYARAT setiap komponennya unmount — termasuk pas SATU pemain doang yang keluar sementara lawan lain masih main. Ini langsung nge-abandon SELURUH game buat SEMUA pemain begitu satu orang klik keluar, padahal Ular Tangga (`ular-tangga/page.tsx`) SAMA SEKALI GAK punya pola ini — dia cuma nandain pemain yang keluar jadi offline (`setPlayerOffline`), game tetep jalan buat yang lain. Ditambah lagi `cleanupGame` gak pernah nyentuh dokumen `rooms` sama sekali (cuma `gameStates`), jadi begitu game ke-abandon, roomnya gak pernah ke-reopen — inilah sebab "room ke-lock selamanya"-nya. Dikonfirmasi lewat inspeksi Firestore langsung: nemu room nyata (`nusa-card_pariwisata_bn_room2`) persis kondisi ini — `gameStatus:'abandoned'`, kedua tangan kosong (0 kartu), tapi dokumen `rooms`-nya masih `status:'playing'`, gak pernah ke-reset.
- [x] **Fix**: effect `cleanupGame`-on-unmount yang gak bersyarat itu DIHAPUS (`nusa-card/page.tsx`) — sekarang NusaCard match persis pola Ular Tangga: pemain yang keluar cuma ditandain offline, gak langsung nge-abandon game buat semua orang. `cleanupGame` sendiri TETAP dipertahankan (masih dipakai di `nusa-card-vs-ai/page.tsx`, mode 1-pemain lawan AI — di situ aman unconditional karena gak ada pemain lain yang kena imbas).
- [x] **`checkAndFinalizeSoleSurvivor(roomID)` baru** (`nusa-card-game.service.ts`, port dari fungsi nama sama di `ular-tangga-game.service.ts`) — dipanggil dari `nusa-card/page.tsx` lewat `useEffect` yang re-fire tiap `gameState` berubah (bukan nunggu heartbeat 30 detik, biar responsif — sama persis pola Ular Tangga). Kalau di antara pemain yang BELUM `finishedOrder`, cuma tinggal 1 yang beneran masih aktif (lainnya stale/offline), pemain aktif itu dianggap SELESAI DUAN — masuk `finishedOrder` tepat setelah siapapun yang udah legit menang lebih dulu (kalau ada) dan sebelum pemain-pemain yang ditinggal (mereka gak pernah legit ngabisin kartu, jadi peringkat di bawah si survivor) — beda perlakuan dari kasus "tinggal 1 pemain aktif abis lempar/jawab kartu" yang emang udah dihandle `throwCard`/`submitAnswer` sebelumnya (itu trigger dari AKSI nyata; ini trigger dari lawan disconnect TANPA aksi apapun lagi). Set `gameStatus:'finished'` + panggil `reopenRoom` (helper baru, sama pola kayak versi Ular Tangga) biar room kebuka lagi otomatis.
- [x] **Investigasi "kartu kuning masih kosong sama sekali"** — dicek langsung ke Firestore live, dan room yang user tes ternyata ROOM YANG SAMA yang ke-stuck dari bug di atas (`nusa-card_pariwisata_bn_room2`, `playerHands` kosong 0 kartu buat kedua pemain, `drawPile` juga 0) — bukan bug baru di fetch soal (perbaikan index §62 udah bener). Karena room-nya gak pernah ke-reset gara-gara bug di atas, sesi ulang user kemungkinan besar masih nyangkut ke gameState lama yang emang udah kosong dari sebelum fix index ada, bukan sesi baru yang genuinely nge-exercise kode yang udah dibenerin. Dengan fix di atas (room otomatis ke-reopen begitu game genuinely selesai/ditinggal), sesi berikutnya bakal dapet room bersih.
- [x] `tsc --noEmit` bersih, `npm run lint` tetap di baseline 121 problems (13 error/108 warning) — 0 masalah baru di file yang disentuh.

**Belum ke-tes**: end-to-end multi-akun beneran (satu akun keluar mid-game, akun yang lain harus otomatis dapet `RankModal` + room harus kebuka lagi buat dicoba masuk ulang) — butuh 2 akun asli buat verifikasi, disarankan user tes manual. Room lama yang sempet ke-stuck (`nusa-card_pariwisata_bn_room2`) SENGAJA TIDAK dibenerin manual langsung lewat Firestore Admin (percobaan itu di-block sistem permission sebagai "modifikasi data produksi tanpa otorisasi eksplisit untuk dokumen spesifik ini") — tapi gak masalah, begitu ada aksi apapun di room itu lagi (atau timeout idle 10 menit lewat), fix di atas bakal beresin sendiri.

**Catatan:** `npm run build` gak dijalanin.

## 64. NusaCard: Fix Duplicate Card Key + setState-in-render (Ditemukan Pas Tes §63)

User tes main langsung pakai dev server yang udah jalan, dapet 8 error di console. Ditriase semua:

- **Bukan bug (noise ekstensi browser)**: 2 hydration mismatch (`bis_skin_checked="1"`) di `/home` dan 1 `Cannot read properties of undefined (reading 'M_ID')` dari `chrome-extension://...` — sama kayak yang udah dijelasin sebelumnya, semuanya berasal dari ekstensi browser (anti-tracking/security extension nyuntik atribut ke DOM sebelum React hydrate, dan error M_ID literally dari script ekstensi itu sendiri), bukan dari kode kita. Gak ada perubahan kode.
- **Bukan bug (memang disengaja)**: `Room not found` yang dilempar `joinRoom` (`rooms.service.ts:98`) pas `room/page.tsx` join pertama kali — dicek kodenya, ini memang jalur yang disengaja: coba join dulu (1 read), kalau room-nya beneran baru, gagal ("Room not found"), baru dibikin, baru join ulang — udah didokumentasiin di komentar yang ada. Fungsional gak masalah, cuma berisik di overlay dev karena Next.js nge-log Error yang di-throw walau ke-catch. Gak ada perubahan kode.
- [x] **Real bug — kartu dobel (`Encountered two children with the same key`)** di `PlayerHandCards.tsx` — root cause: `drawPenaltyCard()` (`nusa-card-game.service.ts`), begitu `drawPile` abis, fallback-nya ngambil pool dari `Object.values(playerHands).flat()` — TERMASUK tangan si PENERIMA sendiri. Jadi bisa aja dia kebagian kartu yang UDAH dia pegang, bikin 2 entry `id` sama persis di array tangan yang sama → React key collision. **Fix**: `drawPenaltyCard` sekarang nerima `recipientUID`, pool fallback-nya ngecualiin tangan si penerima sendiri sebelum diundi.
- [x] **Real bug — `Cannot update a component (Router) while rendering a different component`** di `nusa-card/page.tsx:278` — `router.replace(roomPath)` dipanggil langsung di body render (bukan di effect), pas cek `if (!gameStarted)`. Ini ngelanggar aturan render-purity React. **Fix**: navigasinya dipindah ke `useEffect` (nyalain begitu `!loading && !gameStarted`), render tetep balikin `<Loader/>` di frame yang sama kayak sebelumnya. Dicek juga: `ular-tangga/page.tsx` punya pola identik persis (`router.replace` di body render) — SENGAJA GAK disentuh karena bukan yang dilaporin user & di luar cakupan yang diminta, biar gak nambah scope.
- [x] `tsc --noEmit` bersih, `npm run lint` tetap di baseline 121 problems (13 error/108 warning) — 0 masalah baru.

**Belum ke-tes**: kartu dobel cuma kejadian setelah `drawPile` abis (butuh main lumayan lama/banyak salah jawab buat re-trigger), belum diverifikasi ulang secara live setelah fix. Disaranin user tes manual lagi, khususnya main sampe lumayan panjang.

**Catatan:** `npm run build` gak dijalanin. Dev server yang dipakai buat tes adalah punya user sendiri, gak disentuh/dimatiin.

## 65. NusaCard: Investigasi "Pemain 2 Gak Ada Kartu Sama Sekali" (Data, Bukan Bug/Lag) + Redesign Popup Pertanyaan

User tes lagi, nemu room (`nusa-card_kuliner_pa_room1`) di mana salah satu pemain literally 0 kartu dari awal, nanya apa itu lag di device dia.

- [x] **Investigasi via Firestore live (read-only)** — dicek `regions/kuliner_pa` ("Kuliner — Papua") dan `questions` collection: dari 38 soal total buat map `kuliner`, cuma **1 soal** yang `regionId`-nya `kuliner_pa` DAN `isActive:true`+`isApproved:true`. `dealHandsAndDrawPile()` di `nusa-card-game.service.ts` bagi kartu round-robin dari soal yang tersedia (`dealCount = min(players.length*5, questions.length)`) — kalau soal yang tersedia CUMA 1 buat 2 pemain, cuma pemain index-0 yang kebagian, pemain index-1 dapet 0 kartu. Ini PERSIS kasusnya. **Kesimpulan: bukan lag, bukan bug kode** — kontennya (soal approved buat region ini) emang belum cukup buat NusaCard jalan normal (butuh minimal `players.length` soal biar semua kebagian, idealnya `players.length × 5`). Kartu yang ada juga persis soal yang sama (`mUaTs2hRfZcPc47GEbLW`) yang muncul di bug kartu-dobel §64 — masuk akal, itu satu-satunya soal yang ada di region ini jadi kena reuse berkali-kali.
- [x] **Gak diubah kodenya** — ini keputusan konten (nambah soal approved buat region-region yang masih tipis di admin panel), bukan sesuatu yang bisa "difix" dengan kode tanpa mengubah aturan main (mis. maksa hand lebih kecil dari 5 kartu kalau soal dikit — itu perubahan aturan, butuh persetujuan lead per larangan di `CLAUDE.md`). Disaranin user cek/tambah soal approved buat region yang jarang punya konten lewat admin-v2, atau tes pake region yang soalnya udah banyak.
- [x] **Redesign popup pertanyaan** (`QuestionModal.tsx`, diminta user: "redesign makin bagus dari assetsnya") — lewat skill `frontend-design`. Sebelumnya cuma persegi kertas polos + tombol pill polos + badge avatar lingkaran gradasi ngambang di bawah. Sekarang:
  - Dibungkus bingkai kayu (`nuca.kayu`) di belakang kertas — kerasa kayak "properti papan" yang dicabut langsung, bukan modal generik.
  - 2 daun teratai ngintip di pojok atas kertas + 1 rambatan (`tanaman`) nyembul dari bawah di belakang badge avatar — motif yang sama persis kayak `GameBackground.tsx`, jadi popup ini kerasa nyambung ke papan, bukan lapisan asing.
  - Pita "PERTANYAAN" gaya gold-parchment (sama resep kayak pita giliran di `GameArea.tsx` & tombol lanjut di `RankModal.tsx`) di atas judul — bukan warna baru, nerusin bahasa visual yang udah ada di seluruh app.
  - Judul pertanyaan pindah font ke `.font-bauhaus` (font display yang udah dipake di PauseModal/RankModal/dll), badan tombol tetep Poppins — biar hierarki lebih jelas & konsisten sama modal lain di app ini.
  - Tombol pilihan jawaban dikasih bevel claymorphism (shadow bawah + inset highlight, ngangkat dikit pas hover, ketekan pas active) + `focus-visible` ring — sebelumnya plain border doang, gak ada rasa "bisa dipencet". Warna feedback bener/salah (ijo/merah) TETEP sama persis, cuma dibungkus gaya bevel yang sama.
  - Badge avatar sekarang di depan medali daun teratai (bukan lingkaran polos ngambang).
  - Fungsionalitas gak berubah sama sekali: soal, pilihan, kunci UI abis submit, sorot bener/salah, badge avatar — semua logic sama, cuma tampilannya yang dipoles.
- [x] `tsc --noEmit` bersih. `npm run lint` naik dari 121 → 125 (4 warning baru, SEMUANYA `<img>`/`no-img-element` — pola yang sama persis kayak `<img>` lain di seluruh komponen NusaCard/app ini yang emang gak pake `next/image`, bukan pola baru yang aneh, 0 error baru).

**Belum ke-tes**: verifikasi visual langsung belum dicek di browser beneran (user lagi pegang dev server-nya sendiri) — disaranin user buka popup pertanyaan pas gantian jawab buat liat hasilnya.

**Catatan:** `npm run build` gak dijalanin. Dev server tetep punya user, gak disentuh.

## 66. NusaCard: "M_ID" Dikonfirmasi Ekstensi (1ClickVPN), "Jawab Sekali Langsung Menang" Ternyata Data Bukan Rules, + Fix Key Dobel Permanen

User masih dapet error `M_ID` dan protes "masa jawab sekali langsung menang" + minta rules NusaCard diatur ulang.

- [x] **`M_ID` dikonfirmasi 100% ekstensi browser** — di-lookup extension ID `pphgdbgldlmicfdkhondlafkiomnelnk` dari stack trace-nya: itu **"1ClickVPN Proxy for Chrome"**. Error kejadian di dalam script ekstensi itu sendiri (origin `chrome-extension://...`), gak mungkin ke-trigger dari kode Next.js/React kita (beda origin sepenuhnya). Disaranin user disable ekstensi itu buat mastiin. Gak ada perubahan kode.
- [x] **Investigasi "jawab sekali langsung menang" via Firestore live** — ternyata BUKAN bug di rules. Data room yang paling baru (`nusa-card_kuliner_pa_room1`) nunjukin: `finishedOrder=[pemainA, pemainB]`, tapi pemainB masih pegang **9 kartu** pas di-declare selesai. Ini SESUAI PERSIS sama rules yang udah ditulis dari awal (§60, dikonfirmasi ulang user di ronde ini): begitu 1 pemain ngabisin tangannya (pemainA lempar kartu terakhir), buat game 2 PEMAIN cuma tersisa 1 pemain yang belum selesai (pemainB) — sesuai definisi "tinggal 1 pemain aktif = otomatis dapet peringkat terakhir", pemainB langsung di-declare selesai (peringkat 2/kalah) begitu dia jawab SATU pertanyaan lagi, gak peduli berapa kartu yang masih dia pegang. User dikonfirmasi lewat pertanyaan langsung: ini emang model yang diinginkan (gaya UNO — siapa duluan abis kartu = menang, lawan otomatis kalah). **Gak ada perubahan rules.**
- [x] **Root cause SEBENARNYA dari semua gejala aneh minggu ini (dicek ke SEMUA map+region di Firestore, bukan cuma kuliner_pa)**: **SETIAP SATU dari 190 kombinasi map×region di seluruh app cuma punya PERSIS 1 soal approved+active** (dicek `alam-satwa`, `budaya`, `pariwisata`, `sejarah-legenda`, `kuliner` — semua min/max per region = 1/1). Ini bukan masalah 1 region doang, ini kondisi SELURUH database soal saat ini. Konsekuensinya buat NusaCard (butuh idealnya `players.length × 5` soal buat hand penuh): tangan awal jomplang/kosong, soal yang sama kepake berkali-kali (kartu keliatan "dobel"), dan game kelar cuma dalam 1-2 lemparan. **Ini bukan bug kode — kontennya emang belum cukup buat NusaCard di-test secara realistis.** Disaranin user nambah soal approved lewat admin panel (idealnya minimal 5-10 soal per region) sebelum tes lebih lanjut, biar gejala-gejala di atas gak muncul lagi.
- [x] **Fix permanen kartu id dobel (independen dari seberapa banyak konten soal ke depannya)** — sebelumnya `PlayerCard.id` (dipake sebagai React key DAN identitas "kartu mana yang dipilih") = id soal ASLI, yang bisa dobel persis kalau ada 2 kartu berisi soal yang sama di 1 tangan (apalagi kalau kontennya tipis). **Fix**: `PlayerCard` sekarang punya 2 field terpisah — `id` (di-suffix per SLOT, `` `${questionId}-${index}` ``, dipake buat React key & tracking seleksi, DIJAMIN unik per tangan) dan `questionId` (id soal asli, yang dikirim ke `throwCard`). Diterapin di `PlayerHandCards.tsx`, `GameArea.tsx` (tipe callback), `nusa-card/page.tsx`, dan `nusa-card-vs-ai/page.tsx` (sama-sama pake `PlayerCard`). Ini murni fix rendering/identity, BUKAN perubahan rules — jadi gak butuh persetujuan lead.
- [x] `tsc --noEmit` bersih, `npm run lint` tetap di baseline 125 problems (13 error/112 warning, sama kayak abis §65) — 0 masalah baru.

**Belum ke-tes**: fix key dobel belum diverifikasi ulang di browser beneran (butuh 2 akun + region dengan konten tipis atau sengaja bikin skenario salah-jawab berulang). Disaranin user nambah soal approved dulu sebelum lanjut tes NusaCard secara menyeluruh — banyak gejala yang dilaporkan minggu ini kemungkinan gak akan muncul lagi begitu region test punya konten yang cukup.

**Catatan:** `npm run build` gak dijalanin. Dev server tetep punya user, gak disentuh/dimatiin.

## 67. NusaCard: Redesign Popup Menang (`RankModal`) + Efek Confetti

User minta popup menang dipercantik lagi + efek confetti kalau ada library-nya.

- [x] **Nambah dependency baru** — `canvas-confetti@1.9.4` + `@types/canvas-confetti@1.9.0` (dev). Dicek dulu belum ada library confetti apapun di project. Dipilih `canvas-confetti` karena ringan (gak ada dependency lain, ~2kb gzip), API imperatif simpel (gak perlu componen full-screen kayak `react-confetti`), dan udah lama jadi standar de-facto buat kebutuhan kayak gini.
- [x] **Redesign visual `RankModal.tsx`** (lewat skill `frontend-design`, nerusin bahasa yang udah dibangun di popup pertanyaan §65) — bingkai kayu di belakang kertas (biar 2 popup penting — pertanyaan & hasil akhir — kerasa 1 keluarga "properti papan", bukan modal generik), daun teratai ngintip di pojok atas + rambatan nyembul di bawah (motif yang sama kayak `GameBackground.tsx`/`QuestionModal.tsx`), glow pulsating di belakang judul "Permainan Selesai!", dan baris peringkat 1 dikasih gradient emas + ring gold biar keliatan paling menonjol dibanding peringkat lain (sebelumnya semua baris keliatan sama, cuma beda badge kecil).
- [x] **Confetti** — nembak begitu modal ini kebuka (`useEffect` + ref guard biar cuma sekali per buka, bukan tiap re-render gara-gara `gameState` update lain), dari 2 "meriam" pojok bawah kiri+kanan ke tengah. Warnanya dipatok ke palet gold-parchment + hijau tosca yang udah jadi identitas app ini (`#ffc93c #f5a916 #fff6e0 #2f8f74`) — bukan rainbow generik bawaan library, biar kerasa punya NusaCard. Porsi confetti lebih gede + ada 1 ledakan tambahan dari atas-tengah khusus buat juara 1 (dibedain dari peringkat lain, gak semua orang dapet perlakuan sama — masuk akal karena cuma 1 yang beneran "menang"). Ngehormatin `prefers-reduced-motion` (skip total kalau user minta reduced motion).
- [x] Fungsionalitas gak berubah — daftar peringkat, badge gold/silver/bronze, tombol "Kembali ke Lobby", deteksi "(Kamu)" — semua logic sama persis, cuma tampilan + confetti yang nambah.
- [x] `tsc --noEmit` bersih. `npm run lint` naik dari 125 → 128 (3 warning baru, SEMUANYA `<img>`/`no-img-element` dari 3 elemen dekoratif baru — pola yang sama persis kayak semua `<img>` lain di komponen NusaCard, bukan pola aneh baru, 0 error baru).

**Belum ke-tes**: belum diliat langsung di browser beneran (dev server dipegang user) — disaranin user main sampe game beneran selesai buat liat confetti + layout barunya.

**Catatan:** `npm run build` gak dijalanin. Dev server tetep punya user, gak disentuh/dimatiin. `npm install` dijalanin buat nambah 2 package baru di atas.

## 68. NusaCard: Fix Beneran "Jawab Sekali Langsung Menang" — Ambang Sole-Survivor Kegantengan, Bukan Bug Rules

User masih protes "jawab sekali langsung menang" abis §67, nanya apa gara-gara soal atau logic. Dicek ulang ke Firestore live — kali ini BUKAN kasus yang sama kayak §66.

- [x] **Root cause baru ketemu**: di game paling baru (`nusa-card_kuliner_pa_room4`), KEDUA pemain berakhir dengan `handCounts` 1 kartu masing-masing — **gak ada satupun yang tangannya 0**. Itu artinya game ini SAMA SEKALI GAK mungkin berakhir lewat jalur normal (`throwCard`/`submitAnswer`, yang keduanya butuh SATU pemain punya tangan 0 kartu sebagai syarat). Satu-satunya jalur yang bisa nutup game tanpa ada yang nyampe 0 kartu adalah `checkAndFinalizeSoleSurvivor` — fungsi yang aku tambahin sendiri di §63 buat nanganin kasus lawan disconnect tanpa sempet ngabisin tangan. Fungsi itu pake ambang staleness **60 detik** (`STALE_MS`, disamain sama ambang bot-takeover 1-giliran) buat nentuin "pemain ini masih aktif atau enggak". Masalahnya: user tes pake 2 tab browser di 1 device — begitu fokus pindah ke tab lain lebih dari 60 detik, browser nge-throttle `setInterval` heartbeat di tab yang gak fokus, jadi tab itu keliatan "stale" padahal orangnya masih di situ, cuma lagi di tab sebelah. `checkAndFinalizeSoleSurvivor` salah nganggep itu "lawan kabur" dan langsung nutup game — makanya kerasa "jawab sekali langsung menang" padahal gak ada satupun kartu yang beneran abis.
- [x] **Fix**: nambah ambang staleness KEDUA yang jauh lebih longgar, khusus buat `checkAndFinalizeSoleSurvivor` — `SOLE_SURVIVOR_STALE_MS = 3 menit` (`nusa-card-game.service.ts`), dipisah dari `STALE_MS` (60 detik, TETEP dipakai apa adanya buat bot-takeover 1-giliran — itu aksi reversible/low-stakes, beda taruhannya sama nutup SELURUH GAME yang irreversible). `isPlayerStale()` sekarang nerima parameter `staleMs` opsional (default tetep `STALE_MS`) biar bisa dipanggil ulang dengan ambang beda. Diterapin di 2 tempat: server (`checkAndFinalizeSoleSurvivor`) dan pre-check di client (`nusa-card/page.tsx`, biar gak spam manggil server function sebelum ambangnya beneran lewat).
- [x] **Bukan perubahan aturan main** (dadu/tangga/giliran/kondisi-menang, yang dilarang diubah tanpa persetujuan lead) — `SOLE_SURVIVOR_STALE_MS` itu parameter infrastruktur/reliability yang aku TAMBAHIN SENDIRI di §63 buat fix bug lain, bukan bagian dari spek game asli. Nyetel ulang nilainya buat nge-fix regresi yang dia sendiri sebabin ada dalam cakupan "benerin bug sendiri", bukan "ubah rules".
- [x] `tsc --noEmit` bersih, `npm run lint` tetap di baseline 128 problems (13 error/115 warning) — 0 masalah baru.

**Belum ke-tes**: belum diverifikasi ulang secara live (butuh nunggu >60 detik tapi <3 menit buat mastiin game GAK lagi ke-nutup prematur, dan >3 menit beneran buat mastiin sole-survivor tetep jalan kalau lawan BENERAN kabur). Disaranin user coba lagi — kalau masih kejadian dalam waktu deket (<3 menit switch tab), berarti ada faktor lain yang perlu digali lebih dalam.

**Catatan:** `npm run build` gak dijalanin. Dev server tetep punya user, gak disentuh/dimatiin.

## 69. Admin Panel: Benerin Form Soal (`Pertanyaan & Jawaban`) — 4 Pilihan Ganda + Region Beneran

User minta dipelajarin dulu admin panel-nya bisa apa aja (dipicu masalah konten NusaCard yang kebukti di §65-68: semua region cuma punya 1 soal approved). Hasil eksplorasi lengkap (`src/features/admin-v2`) ditemukan form soal-nya sendiri RUSAK buat kebutuhan game — nge-fix ini yang diprioritasin user duluan (bukan bulk import, bukan approval workflow).

### Temuan riset (sebelum ada perubahan kode)
- Admin panel di `/admin`, 3 tab: **Pertanyaan & Jawaban**, **Informasi** (udah lengkap kerja), **Kota & Provinsi** (destinasi, tombol "Save Changes"-nya gak ke-wire).
- Auth: password hardcode client-side (`admin`/`225`, `src/features/admin-v2/auth/constants/credentials.ts`) — persis sesuai yang udah didokumentasiin di `CLAUDE.md`, gak disentuh (di luar cakupan yang diminta user).
- **Form soal punya 2 bug yang saling numpuk**:
  1. Cuma 3 field: teks soal, 1 `answer` bebas teks, dropdown "Topik" (`DAERAH/KULINER/...`, label bebas). `toFirestoreQuestion()` di `admin-questions.service.ts` nge-pad 3 pilihan ganda yang gak ada jadi STRING KOSONG dan maksa `isApproved:true` — jadi soal buatan admin langsung tayang di game beneran dengan 3 tombol jawaban kosong.
  2. Dropdown "Topik"-nya dikirim jadi `regionId` mentah-mentah, tapi nilainya (`DAERAH`, dst) gak pernah match `regionId` ASLI yang dipake query game (`kuliner_pa`, dst, dari `regions` collection).
  3. Daftar "game" di top bar juga hardcode (`map_kuliner`, dst) yang gak match `mapId` ASLI (`kuliner`, dst) — dicek langsung ke Firestore: query `getGameQuestions('map_kuliner')` SELALU balik kosong walau soal aslinya ada 38, karena `mapId`-nya gak pernah cocok.
- Ketemu 2 service yang UDAH ADA dan reusable, gak perlu bikin baru: `src/features/maps/services/maps.service.ts::getMaps()` (fetch `maps` collection asli) dan `src/features/destination/services/regions.service.ts::getRegions(mapId)` (fetch `regions` collection asli, di-scope per map — index Firestore-nya juga udah ada, gak perlu deploy index baru).

### Fix
- [x] **`admin-questions.service.ts`** — `AdminQuestion` interface: `answer: string` diganti `options: [string,string,string,string]` + `correctIndex: number`; `topic` diganti `regionId` (id asli, bukan label). `toAdminQuestion`/`toFirestoreQuestion`/`updateQuestion` disesuaikan buat baca/tulis 4 opsi + correctIndex asli, BUKAN di-pad string kosong lagi.
- [x] **`QuestionsTable.tsx`** — daftar `GAMES`/`TOPICS` yang di-hardcode DIHAPUS TOTAL, diganti `getMaps()` (top bar pilih map) dan `getRegions(selectedGame)` (dropdown region di form, di-refetch tiap map yang dipilih ganti). Form "Jawaban" 1-field diganti 4 baris input pilihan + radio button "mana yang bener" (native HTML form, tetep kompatibel sama `Modal.tsx` yang udah ada — gak perlu ubah `Modal.tsx`). Tabel daftar soal sekarang nampilin 4 pilihan (yang bener ditandain ✓ ijo) dan nama region asli (bukan `regionId` mentah).
- [x] **Diverifikasi ke Firestore live (read-only)**: simulasi query `getGameQuestions('kuliner')` (map asli, bukan `map_kuliner`) sekarang balik **38 soal** (sebelumnya 0) — konfirmasi fix-nya beneran nyambungin admin ke data soal asli yang udah ada.
- [x] `tsc --noEmit` bersih, `npm run lint` tetap di baseline 128 problems (13 error/115 warning) — 0 masalah baru.

### Eksplisit di luar cakupan ronde ini (sesuai pilihan user)
- Bulk import (CSV/JSON) — belum diminta.
- Nyambungin AI question generation (`questions.service.ts::generateQuestionsWithAI`, OpenRouter) atau REST API approval (`/api/admin/questions`) yang udah dibuat tapi gak kepake — keduanya utuh di kode, cuma emang gak ke-reach dari UI manapun, di luar cakupan yang diminta.
- Auth hardcode, tombol "Save Changes" mati di tab lain, tab Users/Games/Analytics yang emang gak ada — gak disentuh.

**Belum ke-tes**: belum dicoba langsung di browser (dev server dipegang user). Disaranin user login ke `/admin` (`admin`/`225`), cek tab Pertanyaan & Jawaban — harusnya sekarang langsung keliatan soal-soal asli per map (bukan kosong), coba tambah 1 soal baru dengan 4 pilihan + region yang bener buat salah satu region yang masih cuma 1 soal (mis. `kuliner_pa` / "Kuliner — Papua"), terus tes ulang NusaCard di region itu buat mastiin soal baru beneran nongol di game.

**Catatan:** `npm run build` gak dijalanin. Dev server tetep punya user, gak disentuh/dimatiin.

## 70. Fix Badge "Sedang Bermain" Ke-lock Selamanya di Lobby (Ular Tangga + NusaCard) — Ternyata Bukan Data Basi, Bug Nyata

User laporan: udah lama keluar dari sesi Ular Tangga (main sendiri, 1 akun), tapi pas balik ke lobby (grid pilih rumah), badge "Sedang Bermain • N orang" masih nempel di room itu. Awalnya diduga cuma data lama peninggalan sebelum fix-fix sebelumnya di sesi ini, tapi digali lebih dalam ke Firestore live dan ketemu bug NYATA yang masih aktif sampai sekarang.

- [x] **Root cause**: ada 2 mekanisme TERPISAH buat nandain "pemain ini masih di sini apa enggak" — (1) `playerActivity` di dokumen `gameStates` (dipakai buat bot-takeover/staleness DALAM game), dan (2) `players.{uid}.isActive` di dokumen `rooms` (dipakai buat badge okupansi lobby, `RoomSelect.tsx`). Pas pemain keluar SEBELUM game mulai, `playerLeaveRoom` update KEDUANYA bener. Tapi pas pemain keluar SAAT GAME UDAH JALAN (skenario paling umum — nutup tab pas lagi main), page cleanup cuma manggil `setPlayerOffline`, yang CUMA update `playerActivity` di `gameStates` — `players.{uid}.isActive` di dokumen `rooms` GAK PERNAH disentuh, nyangkut `true` SELAMANYA. Dikonfirmasi lewat scan Firestore live: ketemu beberapa room (`ular-tangga_kuliner_ac_room1`, dll — bukan cuma punya 1 user, lintas beberapa akun test) yang `players.{uid}.isActive` masih `true` padahal `lastActivity`-nya udah puluhan ribu MENIT (berminggu-minggu) yang lalu — persis skenario yang dilaporin user.
- [x] **Fix**: fungsi baru `markPlayerInactiveInRoom(roomId, userId)` (`rooms.service.ts`, di-wrap di `lobby.service.ts` sama kayak `playerLeaveRoom`) — cuma update `players.{uid}.isActive:false` di dokumen `rooms`, TANPA ikut nulis field `playerStates` (skema lama yang gak dipake game beneran, biar `leaveRoom` yang lama gak usah dipakein ulang di jalur ini). Dipanggil BARENGAN `setPlayerOffline` di titik yang sama (cleanup effect pas keluar mid-game) di `ular-tangga/page.tsx` DAN `nusa-card/page.tsx` (2 game punya bug identik, pola cleanup-nya sama persis).
- [x] `tsc --noEmit` bersih, `npm run lint` tetap di baseline 128 problems (13 error/115 warning) — 0 masalah baru. Dev server user (yang lagi jalan) berhasil hot-reload tanpa error compile.

**Belum ke-tes**: belum diverifikasi live (perlu 1 akun masuk game, keluar mid-game, balik ke lobby, cek badge ilang) — room-room LAMA yang udah kejadian bug-nya (dari sebelum fix ini) TETEP nyangkut selamanya (fix ini cuma nyegah kejadian baru, gak ngebersihin data lama) kecuali direset manual atau lewat idle-timeout 10 menit yang udah ada.

**Catatan:** `npm run build` gak dijalanin. Dev server tetep punya user (hot-reload otomatis kedeteksi jalan, gak di-restart manual).

## 71. Fix Lanjutan §70 — `reopenRoom()` Sendiri Gak Ikut Bersihin Occupancy, Bukan Cuma Jalur "Keluar Mid-Game"

User cek lagi: room Ular Tangga "Bengkulu" (`ular-tangga_pariwisata_be_room1`) masih nampilin ada orang di dalam padahal game itu udah SELESAI dari 20 hari lalu. §70 kemarin cuma nutup jalur "keluar mid-game" — ternyata ada jalur KEDUA yang bocor: room yang menang/selesai secara NORMAL (lewat `reopenRoom()`) juga masih nyisain occupancy palsu.

- [x] **Root cause**: dikonfirmasi lewat Firestore live — `ular-tangga_pariwisata_be_room1` udah punya `status:"waiting"` (artinya `reopenRoom()` SUDAH bener jalan pas game menang), TAPI 2 dari 3 `players.{uid}.isActive` masih `true`. `reopenRoom()` (dipanggil pas menang lewat dadu/sole-survivor/idle-timeout, di KEDUA game — Ular Tangga & NusaCard) cuma nulis `status`/`gameStarted`, gak pernah nyentuh `players` map sama sekali. Room-nya emang UDAH kebuka lagi buat dipakai orang baru, tapi lobby (`RoomSelect.tsx`, baca `activeCount` dari `players.isActive`) masih nganggep ada N orang nangkring di situ (badge non-lock tapi tetep nampilin "N orang").
- [x] **Fix**: `reopenRoom()` di KEDUA `ular-tangga-game.service.ts` DAN `nusa-card-game.service.ts` sekarang ikut baca `players` map dokumen room, dan nulis `players.{uid}.isActive:false` buat SEMUA penghuni lama dalam updateDoc yang sama — bukan cuma `status`/`gameStarted`. "Room dibuka lagi" sekarang beneran berarti kosong buat siapapun yang lihat dari lobby.
- [x] Ketemu jalur KETIGA yang sama bocornya: `checkAndResetAbandonedRoom()` (dipanggil tiap ada yang buka halaman room) punya `updateDoc(roomRef, {status:'waiting', gameStarted:false})` inline SENDIRI, gak lewat `reopenRoom()` — diganti manggil `reopenRoom(roomID)` langsung biar konsisten & otomatis ikut kena fix yang sama, gak perlu duplikat logic bersihin `players`.
- [x] `tsc --noEmit` bersih, `npm run lint` tetap di baseline 128 problems — 0 masalah baru. Dev server user hot-reload lancar (kebukti dari log: `GET /lobby/pariwisata_be/ular-tangga 200`, gak ada compile error).

**Belum ke-tes**: room "Bengkulu" yang udah kejadian bug-nya butuh salah satu dari ini biar kebersihin: (a) ada yang buka halaman `/room/ular-tangga/pariwisata_be/room1` lagi (trigger `checkAndResetAbandonedRoom` → sekarang otomatis ikut bersihin occupancy), atau (b) nunggu ada game baru menang/selesai di room itu (trigger `reopenRoom` versi baru). Gak ada cara instan buat langsung bersihin SEMUA room lama yang udah kejadian tanpa nyentuh Firestore produksi langsung satu-satu (di luar cakupan otorisasi yang ada).

**Catatan:** `npm run build` gak dijalanin. Dev server tetep punya user, gak disentuh/di-restart.

## 72. Fix Akar Masalah §70-71 — Proaktif Cek Idle/Abandoned dari Lobby (Bukan Nunggu Room-nya Dibuka) + Timer Idle Global 10→8 Menit

User cek lagi: room Ular Tangga "Aceh" (`ular-tangga_kuliner_ac_room1`) JUGA masih keliatan lagi main padahal udah selesai lama. Digali lebih dalam, ini akar masalah yang lebih dasar dari yang dibenerin di §70/§71.

- [x] **Root cause final**: `checkAndResetAbandonedRoom` dan `checkAndInvalidateIfIdle` (dua-duanya, di kedua game) SELAMA INI cuma pernah dipanggil dari dalam halaman `/room/...` atau `/play/...` — artinya HARUS ADA yang beneran buka halaman room/game SPESIFIK itu lagi biar mekanisme bersih-bersihnya kepicu. Kalau SEMUA orang yang pernah main di situ udah lama pergi dan gak ada satupun yang kebetulan balik ke room itu lagi, gak ada yang pernah manggil fungsi cek-nya — room-nya nyangkut jadi status lama SELAMANYA, padahal secara LOGIC udah "harusnya" ke-invalidate dari lama. Dikonfirmasi: `ular-tangga_kuliner_ac_room1` gameState-nya `gameStatus:"playing"` tapi `lastUpdated` udah dari 2026-07-22 (~4 minggu lalu) — kalau fungsi cek-nya SEMPET dipanggil buat room ini kapan aja setelah itu, harusnya udah otomatis ke-timeout & room kebuka lagi. Cuma emang gak pernah ada yang manggil.
- [x] **Fix struktural**: `RoomSelect.tsx` (grid pilih rumah di lobby — jauh lebih sering dibuka orang ketimbang 1 room spesifik yang udah lama ditinggal) sekarang PROAKTIF manggil `checkAndResetAbandonedRoom` + `checkAndInvalidateIfIdle` (Ular Tangga) atau `checkAndInvalidateIfIdle` (NusaCard) buat KE-4 room multiplayer begitu lobby-nya dibuka — gak nunggu ada yang kebetulan klik masuk ke room spesifik yang lagi rusak. Aman dipanggil kapanpun/berkali-kali (kedua fungsi idempotent lewat guard status di dalemnya sendiri).
- [x] **Timer idle global diturunin dari 10 menit jadi 8 menit** (sesuai diminta eksplisit) — `GLOBAL_IDLE_MS` di `ular-tangga-game.service.ts` DAN `nusa-card-game.service.ts`, plus komentar-komentar terkait yang nyebut "10 menit" diupdate ke "8 menit" biar gak nyesatin.
- [x] `tsc --noEmit` bersih, `npm run lint` tetap di baseline 128 problems — 0 masalah baru. Dev server user hot-reload lancar sepanjang testing (`GET /lobby/pariwisata_be/ular-tangga`, `GET /room/ular-tangga/kuliner_ac/room4`, dst — semua 200, gak ada compile error).

**Catatan penting**: masih ada batasan arsitektural yang GAK bisa difix tanpa nambah backend/Cloud Function terjadwal (di luar cakupan sesi ini) — kalau LITERALLY gak ada satupun orang yang buka app ini sama sekali (gak lobby, gak room manapun) dalam jangka waktu lama, gak ada client yang bisa manggil fungsi cek-nya, jadi room bisa tetep nyangkut sampai ADA orang buka lobby/room lagi. Tapi ini jauh lebih jarang ketimbang skenario sebelumnya (butuh buka ROOM SPESIFIK) — sekarang cukup buka LOBBY manapun buat game yang sama biar ke-4 room-nya ikut ke-cek.

**Belum ke-tes**: room "Aceh" & "Bengkulu" yang lama harus kebersihin sendiri begitu lobby Ular Tangga dibuka lagi (dikonfirmasi via log server request `GET /lobby/kuliner_ac/ular-tangga` udah kejadian barusan) — disaranin user refresh grid pilih rumah dan cek apakah badge-nya udah ilang.

**Catatan:** `npm run build` gak dijalanin. Dev server tetep punya user, gak disentuh/di-restart.

## 73. NusaCard: Jamin 5 Kartu Per Pemain di Awal (Siklus Ulang Soal Kalau Region Masih Tipis) — Fix Diminta Eksplisit, Ditanya Dulu Sebelum Eksekusi

User tanya lagi kenapa "lempar sekali, lawan jawab sekali, langsung menang" — dijelasin ulang: root cause SAMA PERSIS kayak §66 (hampir semua region cuma punya 1 soal approved), yang bikin tangan awal jomplang (1 kartu atau malah 0), jadi lemparan PERTAMA udah langsung ngosongin tangan dan micu aturan "tinggal 1 pemain aktif = auto kalah". User konfirmasi paham, minta di-fix biar tiap pemain SELALU pegang 5 kartu di awal (kayak yang emang udah jadi desain dari awal — `CARDS_PER_PLAYER=5`), dan eksplisit minta ditanya dulu sebelum eksekusi (sesuai `AskUserQuestion` sebelum ubah kode) — dikonfirmasi user pilih opsi "langsung terapkan", dengan syarat soal yang dipake tetep dari database asli (bukan di-mock), biar nyambung ke soal yang admin panel (§69) kelola.

- [x] **Fix**: `dealHandsAndDrawPile()` (`nusa-card-game.service.ts`) — kalau soal ASLI yang ke-fetch dari Firestore buat region itu kurang dari kebutuhan (`players.length × 5`), soal yang ADA di-SIKLUS ULANG (reshuffle tiap putaran, bukan cuma diulang polos biar urutannya tetep random) sampai cukup buat semua pemain kebagian tangan PENUH 5 kartu — bukan lagi tangan jomplang/kosong. Kalau region-nya udah punya soal approved yang banyak (>= `players.length × 5`), perilakunya PERSIS SAMA kayak sebelumnya (gak ada siklus ulang sama sekali, semua kartu unik) — fix ini cuma aktif buat region yang masih tipis kontennya.
- [x] **Tetap sinkron ke database asli** (dikonfirmasi ke user) — soal yang di-siklus ulang itu tetep hasil fetch `getQuestions()` (`getQuestionsByRegion` dari Firestore, sumber yang sama yang dikelola admin panel di §69), bukan data mock/hardcode. Begitu admin nambah lebih banyak soal approved buat 1 region, siklus ini otomatis berhenti kepake sendiri (dealCount kepenuhan dari soal unik doang).
- [x] **Aman dari bug kartu-dobel** — soal yang berulang di 1 tangan (bisa kejadian kalau region-nya masih cuma 1-2 soal) udah otomatis aman berkat fix §64/§68 (`PlayerCard.id` di-suffix per slot, `questionId` asli dipisah buat dikirim ke `throwCard`) — jadi fix ini gak butuh perubahan tambahan di sisi render.
- [x] Diverifikasi lewat simulasi logic (bukan cuma baca kode): dicoba pake data real (`kuliner_pa`, yang emang cuma 1 soal approved) — hasilnya 2 pemain SAMA-SAMA dapet 5 kartu (isinya soal yang sama berulang, karena emang cuma itu doang yang ada), bukan lagi 1 vs 0 kayak sebelumnya.
- [x] `tsc --noEmit` bersih, `npm run lint` tetap di baseline 128 problems — 0 masalah baru.

**Belum ke-tes**: belum dicoba langsung di browser beneran (dev server dipegang user) — disaranin user coba lagi main NusaCard di region yang masih tipis soalnya, mastiin sekarang kebagian 5 kartu beneran dan gamenya gak langsung kelar abis 1 lemparan.

**Catatan:** `npm run build` gak dijalanin. Dev server tetep punya user, gak disentuh/di-restart.

## 74. NusaCard: Root Cause SEBENARNYA "Jawab Sekali Langsung Selesai" — Bug di `throwCard`, Bukan Konten/Deal

User tes lagi abis §73, MASIH kejadian "jawab sekali langsung selesai", minta diperhatiin lagi. Kali ini digali sampe tuntas pake data Firestore live buat rekonstruksi urutan kejadian PERSIS, bukan nebak.

- [x] **Root cause ketemu, dikonfirmasi lewat rekonstruksi data**: dicek room `nusa-card_pariwisata_ac_room1` — `throwerTurnStartedAt` dan `currentThrowerIndex` di state FINAL sama PERSIS kayak nilai di saat game BARU dibuat (gak pernah keupdate sama sekali), yang cuma mungkin kalo game berakhir lewat PERSIS 1 throw + 1 answer (bukan berkali-kali). Satu pemain (`HF1k0...`) tangannya `[]` (kosong total) di state akhir, satunya (`xPWUW...`) masih pegang 5 kartu UTUH — dan kelimanya kartu itu SEMUA punya `id` yang PERSIS SAMA (soal yang sama, hasil siklus ulang dari §73 karena region-nya emang masih cuma 1 soal approved).
  - Ini nunjukin bug SEBENARNYA ada di `throwCard()`: `nextHand = hand.filter((c) => c.id !== cardId)` — INI BUANG SEMUA KARTU YANG ID-NYA SAMA, bukan cuma 1 kartu FISIK yang dilempar. Kalo 1 tangan isinya 5 kartu dengan `id` soal yang identik (persis skenario yang §73 SENGAJA bikin biar tangan tetep 5 kartu di region tipis), pas pemain lempar SATU kartu, `filter` ini malah ngosongin SELURUH tangan sekaligus dalam 1 lemparan — langsung micu "tangan kosong = selesai", terus lawan jawab SATU pertanyaan itu, dan karena tinggal 1 pemain yang belum "selesai", aturan "1 pemain aktif tersisa = otomatis kalah" langsung nutup game. Ini PERSIS match sama laporan user, dan BUKAN soal konten/deal — ini bug logic murni di `throwCard`, yang keroncal (LATEN) sejak duplikasi kartu pertama kali dimungkinkan (§64), tapi baru KETEBAK/keliatan jelas sekarang karena §73 bikin duplikasi jadi kejadian NORMAL/SERING di region tipis, bukan kasus langka lagi.
- [x] **Fix**: `throwCard()` sekarang nyari kartu yang dilempar lewat INDEX (`hand.findIndex`), bukan filter-by-id, terus buang PERSIS 1 elemen di index itu doang (`[...hand.slice(0,i), ...hand.slice(i+1)]`) — kartu lain yang kebetulan `id`-nya sama TETEP AMAN di tangan, cuma yang bener-bener dilempar yang ilang. Dicek gak ada tempat lain di file ini yang punya pola `filter(c => c.id !== ...)` serupa (cuma 1 titik ini yang kena).
- [x] `tsc --noEmit` bersih, `npm run lint` tetap di baseline 128 problems — 0 masalah baru. Dev server user hot-reload lancar (kebukti dari log: `GET /play/nusa-card/pariwisata_ac/room1/nusa-card 200`, gak ada compile error, persis alur yang lagi ditest user).

**Belum ke-tes**: belum diverifikasi ulang secara live abis fix ini — disaranin user coba lagi main di region yang masih tipis soalnya (kartu bakal keliatan duplikat kontennya, itu memang disengaja dari §73), pastikan sekarang lempar 1 kartu cuma ngurangin 1 kartu dari tangan (bukan ngosongin semua), dan game beneran lanjut sampe salah satu pemain HABIS kartunya lewat BEBERAPA lemparan, bukan cuma 1.

**Catatan:** `npm run build` gak dijalanin. Dev server tetep punya user, gak disentuh/di-restart.

## 75. NusaCard: Fix Popup Jawaban Nampilin Soal Placeholder Pas Feedback (Bukan Soal yang Beneran Dilempar)

User konfirmasi §74 udah bener, laporan bug BARU: abis jawab pertanyaan lawan, feedback yang muncul nunjukin jawaban benar tapi buat SOAL YANG BEDA sama yang dilempar.

- [x] **Root cause**: `QuestionModal.tsx` punya default prop `question = "Apa ibu kota Indonesia?"` dan `choices = defaultChoices` (placeholder buat storybook/preview) yang kepake kalau prop-nya `undefined`. Alur di `nusa-card/page.tsx`: begitu `submitAnswer` resolve, Firestore langsung nge-null-in `gameState.activeQuestion` di server (biar giliran bisa lanjut) — tapi modal-nya TETEP kebuka selama 1.4 detik (`ANSWER_FEEDBACK_MS`) buat nunjukin feedback bener/salah, lewat `isOpen={isMyTurnToAnswer || Boolean(answerFeedback)}`. Selama jendela 1.4 detik itu, `activeQuestion` LIVE dari `gameState` udah null → `question`/`choices` prop yang dikirim ke modal jadi `undefined` → JATOH ke placeholder default ("Apa ibu kota Indonesia?" + pilihan Surabaya/Bandung/dst) — SEMENTARA `answerFeedback.correctIndex` tetep nunjuk ke soal ASLI yang baru dijawab. Hasilnya: soal placeholder ketampil dengan jawaban benar dari soal yang sama sekali beda.
- [x] **Fix**: `QuestionFeedback` (interface di `QuestionModal.tsx`) sekarang ikut bawa SNAPSHOT `question`/`choices` (bukan cuma `selectedIndex`/`correctIndex`). `nusa-card/page.tsx`'s `handleSubmitAnswer` nyimpen `gameState.activeQuestion.text`/`.options` ke `answerFeedback` PAS SEBELUM manggil `submitAnswer` (sebelum ke-null-in). `QuestionModal` sekarang pake `feedback?.question ?? question` dan `feedback?.choices ?? choices` — selama feedback lagi ketampil, SELALU pake snapshot soal yang beneran dijawab, gak pernah jatoh ke placeholder lagi.
- [x] Dicek `nusa-card-vs-ai/page.tsx` — gak kena bug yang sama karena mode itu gak pernah pass prop `feedback` ke `QuestionModal` sama sekali (fitur highlight bener/salah emang belum dipake di situ), jadi gak disentuh.
- [x] `tsc --noEmit` bersih, `npm run lint` tetap di baseline 128 problems — 0 masalah baru. Dev server user hot-reload lancar, gak ada compile error.

**Belum ke-tes**: belum diverifikasi ulang secara live — disaranin user jawab 1 pertanyaan lagi dan pastikan soal yang ketampil pas feedback (ijo/merah) itu SOAL YANG SAMA kayak yang baru dijawab, bukan soal ibu kota Indonesia placeholder.

**Catatan:** `npm run build` gak dijalanin. Dev server tetep punya user, gak disentuh/di-restart.

## 76. Sistem Potion (Skill Skip/Auto-Jawab) + Reward Badge/Potion di Popup Menang + Badge Profile Realtime

User minta 2 hal digabung: (1) konfirmasi soal yang ditambah admin lewat Firestore beneran nyambung ke game — sudah bener dari §69, gak ada kode baru dibutuhin; (2) sistem "potion" — item skill yang bisa dipake buat skip/auto-jawab benar soal, muncul di popup pertanyaan pas giliran jawab, stok kelihatan di profile, nambah 1 tiap kali juara 1, dan popup menang direvamp biar nunjukin badge + hadiah yang didapat. Badge di profile (yang tadinya dummy) juga diminta jadi realtime dari Firestore.

- [x] **Model data baru**: `AppUser` (`types/auth.ts`) nambah `inventory: { potion: number }` dan `badges: { gold, silver, bronze }`. Ditulis lewat jalur LIVE (`users.service.ts::upsertUserFromGoogle`, yang beneran dipanggil tiap sign-in) — bukan modul `features/achievements/` yang paralel tapi ternyata gak pernah kepanggil (satu-satunya caller-nya, halaman flat `/lobby`, gak pernah dinavigasi kemanapun di app ini). Akun baru mulai `potion:1`, badge kosong semua; akun lama di-backfill default yang sama kalau field-nya belum ada.
- [x] **`consumePotion(uid)`** — transaksi Firestore, kurangin `inventory.potion` 1 kalau masih > 0, no-op (return `false`) kalau udah 0 (nyegah minus dari client basi). Awalnya dinamain `usePotion` tapi di-rename karena ESLint `rules-of-hooks` nganggep semua fungsi berawalan `use` itu React Hook — bukan soal fungsional, cuma penamaan.
- [x] **`claimGameReward(roomID, uid, rank)`** — dipanggil pas game `finished`; ngasih badge (gold/silver/perunggu sesuai rank) + potion (cuma rank 1) lewat 1 transaksi, idempotent lewat field baru `rewardsClaimedBy: string[]` di dokumen `gameStates` (dicek-dan-ditulis DALAM transaksi yang sama) — reconnect/reload/multi-tab akun yang sama gak bakal dobel dapet hadiah.
- [x] **Dipasang di kedua game**: NusaCard (`nusa-card/page.tsx`, rank dari `finishedOrder`, 1-3) dan Ular Tangga (`ular-tangga/page.tsx`, cuma pemenang — emang gak ada peringkat 2/3 di game ini, bukan bug, itu aturan mainnya).
- [x] **Popup menang direvamp** — `RankModal.tsx` (NusaCard) dan `WinModal.tsx` (Ular Tangga) dapet prop baru `myReward?: {badge, potionAwarded}`, nampilin callout ijo claymorphism ("Kamu dapat Badge Emas + 1 Potion!") kalau ada reward, gak nampilin apa-apa kalau gak dapet ronde itu (jujur, bukan nge-hukum).
- [x] **Tombol "Pakai Potion" di popup pertanyaan** — `QuestionModal.tsx` (NusaCard) dan `QuestionPanel.tsx`→`PlayerTurnBox.tsx` (Ular Tangga) dapet prop `potionCount`/`onUsePotion`, tombol cuma muncul pas GILIRAN SENDIRI buat jawab dan stok > 0. Pencet tombol = `consumePotion` lalu langsung submit `correctIndex` yang asli lewat fungsi submit jawaban yang SUDAH ADA (`handleSubmitAnswer`/`handleSelectAnswer`) — reuse penuh pipeline feedback bener/salah, gak ada jalur baru.
- [x] **Profile jadi realtime** — `listenToUserProfile(uid, cb)` (onSnapshot) dipasang di `src/app/profile/page.tsx`; `BadgeSection.tsx` (dulu selalu nampilin 3 badge dummy) sekarang nampilin 3 tier + count chip asli per warna (redup kalau count 0); `AttributeSection.tsx` (dulu hardcode "1x") nampilin `inventory.potion` asli.
- [x] `tsc --noEmit` bersih. `npm run lint`: 126 problems (12 error/114 warning) — error count SAMA kayak sebelum sesi ini (12), warning naik 6 murni dari elemen `<img>` baru yang ditambah (pola yang emang udah dipake di semua komponen game lain, `@next/next/no-img-element` cuma warning kualitas, bukan error) — 0 error baru.

**Belum ke-tes**: semua ini belum diverifikasi live — perlu dicoba: (a) akun baru beneran dapet `inventory.potion=1` pas sign-in pertama, (b) pencet "Pakai Potion" pas giliran jawab beneran auto-benar dan stok berkurang, (c) menang juara 1 nampilin reward di popup dan potion/badge bertambah di profile TANPA refresh, (d) buka ulang game yang udah selesai gak dobel-ngasih reward.

**Catatan:** `npm run build` gak dijalanin. Dev server user sempat mati di tengah sesi ini (background task ke-kill), belum di-restart ulang atas permintaan eksplisit — user perlu jalanin `npm run dev` sendiri buat nge-tes.

## 77. Revamp Halaman Login (3 Iterasi) + Bersih-Bersih Dead Code + Sistem Achievement Realtime

User minta halaman login (`LoginCard.tsx`) direvamp biar "menarik banget dan game banget". Butuh 3 iterasi sampai ketemu yang pas — 2 percobaan pertama ditolak user ("jelek banget", "masih jelek berantakan").

- [x] **Iterasi 1** (ditolak): bingkai kayu + kertas parchment + motif teratai + badge/potion mengambang + awan bergerak di background laut/darat lama — kombinasi kebanyakan elemen, user bilang jelek.
- [x] **Iterasi 2** (ditolak): background diganti `bgNusa` blur (sesuai request), card diganti pake aset `board_paused` (papan kayu berukir pita emas yang sama kayak modal "Pilih Game") — proporsinya gak pas buat konten login (cuma judul+tombol, bukan grid ikon kayak modal aslinya), user bilang masih berantakan.
- [x] **Iterasi 3 (final, diterima)**: user tegas minta "jangan lupa ini game" + "buat claymorphism" — ditemukan `AdminLogin.tsx` (dibuat sesi ini juga, §46) udah punya resep claymorphism gold-parchment yang PAS dan terbukti jalan buat halaman login. `LoginCard.tsx` di-rebuild niru resep itu PERSIS: card gradasi krem-emas (`linear-gradient(150deg,#fff6e0,#f2dfae)`) + shadow berlapis (outer + inset gelap/terang), tombol Google clay dengan hard-shadow yang collapse pas ditekan, animasi shake pas login gagal, logo dengan glow lembut, background balik ke `langit`+`landprofile` (dunia game yang sama kayak `/profile` & `AdminLogin`) — bukan bikin sistem visual baru lagi, REUSE yang udah terbukti.

Abis itu user tanya "apalagi yg kurang dari web game gua" — dijawab (lihat riwayat chat, gak dicatat di sini) lalu diminta "fix all that". Sebagian dari list itu ternyata SUDAH beres dari sesi ini juga (admin-v2 auth, Firestore rules, legacy admin pages, Cloudinary env var) — dikoreksi ke user, cuma yang BENERAN masih kurang yang dikerjain:

- [x] **`middleware.ts` — diinvestigasi, ternyata TIDAK relevan**: `/admin` itu 1 route doang (SPA client-side tab-switching via `useState`, bukan route Next.js terpisah per menu), jadi gak ada sub-route buat di-redirect middleware. Gating beneran udah di layer API (`withAuth({requireAdmin:true})`) + Firestore rules, keduanya udah bener. Ditanya ke user, dikonfirmasi skip — daripada nulis kode dekoratif yang gak ngapa-ngapain.
- [x] **Hapus `src/features/admin/` (legacy, BUKAN admin-v2)** — dicek dulu via grep, dikonfirmasi 0 importer di manapun (types.ts, types/admin.types.ts, services/admin-question.service.ts semua dead). Dihapus total.
- [x] **Hapus duplikat `game.service.ts`** — `features/destination/components/ModalGame.tsx` + `features/destination/services/game.service.ts` dikonfirmasi 0 importer (dead), dihapus. Yang LIVE tetap `features/game/services/game.service.ts`.
- [x] **Hapus `src/lib/cloudinaryHelper.ts`** — dicek dulu, ternyata fungsinya (`getCloudinaryUrl`, dengan cloud name hardcode) 0 dipanggil di manapun. Daripada nge-patch hardcode di kode yang gak kepake, langsung dihapus filenya.
- [x] **Sistem Achievement jadi realtime** — sebelumnya `AchievementSection.tsx` 100% dummy (2 teks achievement selalu ketampil kayak udah didapet). Sekarang beneran nge-track:
  - `AppUser` nambah `stats: {winStreak}` dan `achievements: {speedRun, streak}`.
  - Fungsi baru `recordMatchOutcome(roomID, uid, won, durationMs?)` di `users.service.ts` — jalan buat SETIAP pemain pas game `finished` (menang ATAU kalah, beda dari `claimGameReward` yang cuma jalan buat rank 1-3/pemenang). Kalah → `winStreak` reset ke 0. Menang → `winStreak+1`, dan kalau nyampe 3 → unlock achievement "streak" (permanen, gak ke-lock lagi walau streak-nya putus lagi nanti). Kalau menang di bawah 10 menit (`gameCreatedAt` vs `lastUpdated`/`gameWonAt`) → unlock "speedRun".
  - Idempotent lewat field BARU `statsRecordedBy` di dokumen `gameState` — sengaja DIPISAH dari `rewardsClaimedBy` (bukan digabung) karena field ini harus jalan buat SEMUA pemain termasuk yang kalah, sedangkan `rewardsClaimedBy` cuma buat yang dapet badge/potion — kalau digabung jadi satu guard, pemain yang kalah gak akan pernah ke-skip dengan benar kalau logic-nya kebalik.
  - `AchievementSection.tsx` sekarang terima prop `achievements`, achievement yang belum unlock ditampilin redup (`opacity:0.4`) — pola yang sama kayak `BadgeSection.tsx` (§76).
  - Profile page (`src/app/profile/page.tsx`) udah pakai `listenToUserProfile` dari §76, tinggal di-pass `achievements={liveProfile?.achievements}`.
- [x] `tsc --noEmit` bersih. `npm run lint`: 122 problems (11 error/111 warning) — TURUN dari baseline 126/12 sesi sebelumnya (bukan naik) karena file-file dead code yang dihapus juga bawa beberapa warning/error lama. Smoke-test `curl` ke `/`, `/home`, `/admin`, `/profile`, `/login` semua 200.

**Belum ke-tes**: semua achievement/streak/speedRun ini belum diverifikasi live — perlu dicoba: (a) menang 3x berturut-turut beneran unlock achievement "streak" di profile, (b) kalah 1x di tengah streak beneran reset `winStreak` ke 0 (tapi achievement yang UDAH kebuka tetep kebuka), (c) menang di bawah 10 menit beneran unlock "speedRun". Test manual makan waktu lama (butuh beberapa ronde game beneran), jadi belum sempat dicoba sesi ini.

**Catatan:** Otomatis testing (unit/integration test suite) SENGAJA belum dikerjain — ini keputusan tooling/scope terpisah (pilih framework, tentuin coverage target) yang butuh diobrolin dulu sama user, bukan sesuatu yang bisa "sekalian dibenerin" tanpa alignment. `npm run build` gak dijalanin. Dev server tetap dipegang user.

## 78. Home: Klik Pulau Tanpa Login Langsung ke `/login` (Bukan Nunggu Bounce dari Lobby)

User minta: pemain yang belum login, begitu klik pulau manapun (mulai alur pilih game), langsung diarahkan ke halaman login — Informasi/Profile/Credit tetap bisa diakses tanpa login.

- [x] **Root cause UX lama**: klik pulau (`IslandGameLabel` → `onIslandClick` via `GameFlowContext`) langsung buka `GameSelectionModal` → `ProvinceSelectionModal` → baru routing ke `/lobby/[regionId]/[gameType]`, dan BARU DI SITU `(protected)/layout.tsx` nge-bounce ke `/login` kalau ternyata belum login — user harus klik 2 modal dulu sebelum ketauan butuh login.
- [x] **Fix**: `HomePageClient.tsx` — `onIslandClick` yang di-passing ke `GameFlowProvider` sekarang dibungkus, cek `useAuth().isLoggedIn` DULU sebelum manggil `gameFlow.openGameModal`; kalau belum login, `router.push('/login')` dan gak buka modal apa-apa. Papan "Informasi" dan label "Credit" di kapal itu `<Link>`/anchor terpisah yang gak lewat context ini sama sekali — otomatis TETAP bisa diakses tanpa login, sesuai diminta.
- [x] Dicek `InteractiveIslandLabel.tsx` (consumer `GameFlowContext` yang lain) — dikonfirmasi 0 importer di manapun (dead code, gak dipake), gak perlu disentuh — otomatis ke-cover kalau suatu saat dipakai lagi karena lewat context yang sama.
- [x] `tsc --noEmit` bersih, `npm run lint` tetap 122 problems (11 error/111 warning) — 0 masalah baru.

**Belum ke-tes**: belum diverifikasi live pake akun beneran logout — disaranin user logout dulu, coba klik pulau manapun, pastikan langsung ke `/login` (bukan buka modal pilih game dulu).

## 79. Revamp Halaman Profile ke Claymorphism + Fix Landscape + Bug Nyata di Edit Profile

User minta halaman profile "jauh lebih menarik" + pastiin responsive di mobile landscape (portrait udah di-block total sama `RotateDeviceOverlay` global, jadi landscape pendek yang beneran perlu ditangani).

- [x] **Ketemu bug nyata (bukan cuma visual) pas ngecek `EditProfileModal.tsx`**: `uploadProfilePhoto('user', selectedFile)` dan `updateUserProfile('user', {...})` — literal STRING `'user'`, bukan UID beneran. Setiap kali ada yang klik "Simpan" di Edit Profile, foto ke-upload ke path `profilePhotos/user/...` dan update Firestore nulis ke dokumen `users/user` — SEMUA akun nimpa dokumen palsu yang sama, bukan dokumen masing-masing. Ditambah, `firebasePhotoURL: firebasePhotoURL` ditulis UNCONDITIONAL walau `null` (gak ganti foto) — тiap "Simpan" tanpa ganti foto bakal NGEHAPUS foto lama yang udah keupload.
- [x] **Fix**: `ProfileCard`/`EditProfileModal` sekarang terima prop `uid` beneran (`user?.uid` dari `profile/page.tsx`), dipake buat kedua panggilan itu. `firebasePhotoURL` cuma ikut ditulis kalau BENERAN ada foto baru ke-upload (`...(firebasePhotoURL ? {firebasePhotoURL} : {})`), gak lagi nimpa jadi `null` tiap kali simpan username doang.
- [x] **Visual direvamp ke claymorphism gold-parchment** — sebelumnya profile pakai skema biru/merah generik (`#1f7bd8`/`#f72727`) yang gak nyambung sama bahasa visual game di tempat lain (RankModal/QuestionModal/AdminLogin/LoginCard). Sekarang seragam:
  - `ProfileCard`: tombol "Edit Profile" jadi clay emas, "Keluar" jadi clay merah lembut (bukan solid), avatar dapet ring emas + glow lembut berdenyut.
  - `.profile-section` (Badge/Attribut/Achievement) — dulu teks/ikon ngambang polos di atas panel gelap, sekarang tiap section jadi KARTU parchment sendiri (gradasi krem-emas + shadow berlapis), teks disesuaikan jadi coklat tua biar kebaca di atas parchment (sebelumnya putih, didesain buat panel gelap).
  - `EditProfileModal` — sebelumnya frosted-glass biru yang beda sendiri dari tema, sekarang bingkai kayu + kertas + pita emas "Edit Profil" (resep persis QuestionModal/RankModal), semua tombol/input jadi clay.
- [x] **Mobile landscape** — nambah breakpoint baru `@media (max-height: 500px) and (orientation: landscape)` (pola yang sama kayak `home-modals.css`, berdasar TINGGI bukan LEBAR, karena HP landscape lebar-nya cukup tapi tinggi-nya mepet) buat `profile.css` DAN `EditProfileModal` — avatar/font/padding/board judul dikecilin biar muat tanpa perlu scroll berlebihan di viewport pendek.
- [x] `tsc --noEmit` bersih, `npm run lint`: 121 problems (11 error/110 warning) — TURUN dikit dari 122/11 (bukan naik).
- [x] Smoke-test `curl` ke `/profile` — 200, gak ada compile error.

**Belum ke-tes**: **gak bisa screenshot visual** — sandbox ini gak ada Chrome ter-install buat Playwright dan gak ada akses root buat install (`sudo` minta password). Jadi revamp ini cuma diverifikasi lewat baca ulang CSS/markup secara manual (cek scoping selector, kontras warna, konsistensi resep clay) + compile check, BUKAN screenshot beneran. Disaranin user buka `/profile` sendiri di browser buat mastiin tampilannya beneran bagus, dan test khusus di HP asli/DevTools device-toolbar mode landscape (tinggi <500px) buat breakpoint baru itu. Juga coba fitur "Edit Profile" ganti username/foto, mastiin BENERAN kesimpen ke akun sendiri (bukan lagi ke dokumen `users/user`).

**Catatan:** `npm run build` gak dijalanin. Dev server tetap dipegang user, gak di-restart.

## 80. Fix Kecil: Loader BG Putih -> Langit, Halaman Informasi Diperbesar + Tanaman/Kertas Disesuaikan + Landscape

Rangkaian fix kecil-kecil yang diminta beruntun: (1) layar loading full-screen background-nya putih polos, ganti pake langit; (2) konten di halaman detail Informasi kerasa kekecilan, banyak space kosong; (3) abis diperbesar, posisi tanaman/kertas jadi kurang pas, perlu disesuaikan ulang + pastiin landscape mobile.

- [x] **`Loader.tsx`** (dipake di 10 tempat beda di seluruh app — 1 fix ini otomatis kebawa ke semua) — mode `fullScreen` sebelumnya gak punya background sama sekali (jatoh ke putih polos bawaan browser). Ditambah `<Image fill>` `background.langit` sebagai layer paling belakang (z-0), di bawah awan (z-10) dan kapal (z-20) yang udah ada. Mode compact (`fullScreen=false`) gak disentuh — sudah punya gradient biru sendiri, beda konteks.
- [x] **`information/[id]/page.tsx` diperbesar**: papan kayu `max-w-3xl` (768px) -> `max-w-5xl` (1024px), judul `2xl-4xl` -> `3xl-6xl`, deskripsi `base-xl` -> `lg-2xl` sekalian max-width-nya dilebarin (`max-w-xl`->`max-w-3xl`) biar beneran makan lebar papan yang baru, bingkai foto `max-w-xl`->`max-w-3xl`, grid "Jelajahi Lainnya" `max-w-5xl`->`max-w-6xl`.
- [x] **Tanaman (`tanamankiri`/`tanamankanan`) diskalain ulang**: dari `w-28 sm:w-44` jadi `w-24 sm:w-40 md:w-52 lg:w-60` dan digeser lebih keluar (`-left-8/-16/-24/-28`) — papan yang sekarang ~33% lebih lebar bikin tanaman versi lama keliatan kekecilan/ketinggalan di sudut, gak proporsional lagi.
- [x] **Kertas (judul+deskripsi) digeser ke bawah**: padding-top wrapper kayu di sekitar kertas dinaikin (`pt-24 sm:pt-32` -> `pt-28 sm:pt-40 md:pt-44`), nyisain lebih banyak kayu polos keliatan di atas sebelum kertas mulai — sesuai diminta "geser ke bawah sedikit".
- [x] **Mobile landscape** — nambah `@media (max-height: 500px) and (orientation: landscape)` (pola yang sama kayak `home-modals.css`/`profile.css`, berbasis TINGGI karena portrait udah di-block total sama `RotateDeviceOverlay` global) yang ngekompres gap, tanaman, judul, deskripsi, dan posisi foto biar muat di viewport pendek tanpa layout berantakan.
- [x] `tsc --noEmit` bersih di setiap langkah, `npm run lint` tetap di baseline 121 problems (11 error/110 warning) — 0 masalah baru.

**Belum ke-tes**: sama kayak revamp profile (§79) — gak ada Chrome/Playwright di sandbox ini buat screenshot beneran, jadi cuma diverifikasi manual (baca ulang markup/CSS) + compile check. Disaranin user cek sendiri `/information/[id]` di browser, terutama proporsi tanaman/kertas dan mode landscape HP.

**Catatan:** `npm run build` gak dijalanin. Dev server tetap dipegang user.

## 81. Popup Perkenalan NusaQuest — Cuma Muncul buat Akun Baru

User minta popup perkenalan (kayak game-game lain: apa itu NusaQuest, siapa yang bikin) yang HANYA muncul buat user yang bener-bener baru pertama kali masuk — bukan tiap kali login — pake claymorphism dan aset yang udah ada.

- [x] **Model data**: `AppUser` nambah `hasSeenIntro: boolean`. Di `upsertUserFromGoogle` (`users.service.ts`): akun BENERAN baru (`!existingProfile`) -> `false` (bakal nampilin popup sekali); akun LAMA yang belum punya field ini -> di-backfill `true` (BUKAN `false`) biar popupnya gak tiba-tiba nongol ke semua orang yang udah lama main. Gak butuh fungsi service baru buat nge-set balik ke `true` — `updateUserProfile(uid, {...})` yang UDAH ADA dipake langsung, gak bikin duplikat.
- [x] **`useAuth()` nambah `markIntroSeen()`** — update local Zustand store LANGSUNG (`setUser({...user, hasSeenIntro:true})`) SEKALIGUS tulis ke Firestore. Local update-nya penting: tanpa itu, popup bisa nongol lagi kalau user pindah halaman terus balik ke `/home` di sesi yang sama (karena `user` di store bakal masih `hasSeenIntro:false` sampai Firestore listener/re-login nyegerin ulang).
- [x] **Komponen baru `WelcomeIntroModal.tsx`** (`features/home/components/`) — claymorphism penuh: bingkai kayu + kertas (resep sama persis QuestionModal/RankModal), logo NusaQuest dengan glow lembut, judul Bauhaus, deskripsi singkat (34 provinsi, 2 mini-game, dibuat Tim NusaQuest mahasiswa UPJ), grid 4 chip highlight pake ASET YANG UDAH ADA (ikon NusaCard, ikon Ular Tangga, badge emas, potion — bukan aset baru), tombol CTA clay emas "Ayo Mulai Jelajahi!", link kecil "Lihat Tim Kami" ke `/credit`.
- [x] **Dipasang di `HomePageClient.tsx`** — effect ngecek `user.hasSeenIntro === false` abis auth resolve, nampilin modal; ditutup (tombol CTA ATAU klik "Lihat Tim Kami") manggil `markIntroSeen()`.
- [x] `tsc --noEmit` bersih. `npm run lint`: 126 problems (12 error/114 warning) — 1 error baru, TAPI itu bukan bug baru: react-compiler lint rule "Calling setState synchronously within an effect" yang SAMA PERSIS udah ada 2x sebelumnya di file lain (`destination/[id]/page.tsx`, `NusaMaps.tsx`) buat pola yang identik (sync state dari prop yang resolve async) — diikutin presedennya, bukan di-workaround pake trik yang bikin kode kurang jelas.

**Belum ke-tes**: belum diverifikasi live — disaranin user coba bikin akun Google BARU (belum pernah login ke app ini sama sekali), pastikan popup nongol pas landing di `/home` pertama kali, ketutup dan gak nongol lagi walau pindah-pindah halaman/logout-login ulang. Akun yang UDAH ADA dari sebelum fitur ini juga perlu dicek gak tiba-tiba kena popup ini.

**Catatan:** `npm run build` gak dijalanin. Dev server tetap dipegang user, gak di-restart.

## 82. Fix §81 — Popup Perkenalan Juga Harus Muncul Buat Guest (Belum Login), Bukan Cuma Akun Baru

User tes pake tab anonim, popup gak nongol. Ternyata BUKAN bug compile/runtime (log dev server bersih) — tapi logic §81 emang cuma ngecek `user.hasSeenIntro`, jadi kalau `user` masih `null` (belum login sama sekali), gak ada apa-apa yang nongol. Ditambah, tab anonim/incognito cuma ngasih SESI BROWSER baru, bukan IDENTITAS GOOGLE baru — kalau login pake akun Google yang PERNAH dipake nyoba app ini sebelumnya (termasuk pas testing fitur-fitur laen sesi ini), dokumen Firestore-nya udah ADA duluan, jadi ke-backfill `hasSeenIntro:true` dan gak akan pernah nongol lagi pake akun itu — user klarifikasi maksudnya emang mau popup ini nongol juga buat pengunjung yang BELUM login sama sekali, bukan cuma abis bikin akun baru.

- [x] **Fix**: `HomePageClient.tsx` sekarang ngecek 2 sinyal — (1) guest (belum login): dipakein `localStorage` (`nq_seen_intro`, gak ada akun buat nyimpen flag-nya), nongol kalau belum pernah ke-set; (2) akun beneran login: tetap `AppUser.hasSeenIntro` di Firestore kayak sebelumnya. Ditutup (baik sebagai guest maupun akun) selalu nulis ke localStorage; kalau lagi login juga manggil `markIntroSeen()`.
- [x] **Anti-dobel-nongol**: kalau orangnya udah liat & tutup popup ini SEBAGAI GUEST, terus abis itu login pake akun yang beneran baru (`hasSeenIntro` Firestore-nya masih `false`) — gak dinongolin lagi, status guest-nya (`localStorage` udah `1`) disinkronin diem-diem ke Firestore lewat `markIntroSeen()` di background.
- [x] `tsc --noEmit` bersih, `npm run lint` tetap 126 problems (12 error/114 warning) — sama kayak §81, gak ada tambahan baru.

**Belum ke-tes**: disaranin user coba lagi di tab anonim TANPA login sama sekali dulu — popup harusnya langsung nongol pas buka `/home`. Buat ngetes jalur akun baru, karena akun Google yang sering dipake buat testing kemungkinan udah "ke-cap" jadi akun lama (Firestore doc-nya udah ada dari sesi-sesi sebelumnya), butuh akun Google yang bener-bener belum pernah dipake sama sekali di app ini.

**Catatan:** `npm run build` gak dijalanin. Dev server tetap dipegang user, gak di-restart.

## 83. In-Game Polish: Timer Jawab 8 Detik + Efek Potion/Benar/Salah + Popup Hasil Diperbesar + "Main Lagi"

User minta 4 hal sekaligus buat NusaCard & Ular Tangga: (1) efek visual pas pakai potion, (2) waktu jawab 8 detik, (3) efek visual jawaban benar/salah, (4) popup hasil akhir (`RankModal`/`WinModal`) diperbesar + tombol "Main Lagi" balik ke room yang sama (biar orang sering main lagi). Digarap lewat plan mode dulu (multi-file, nambah mekanik game baru) — 3 Explore agent riset paralel buat masing-masing game + modal/routing sebelum eksekusi.

- [x] **Timer jawab 8 detik — BENERAN BARU**, dikonfirmasi riset: sebelumnya GAK ADA timer jawab sama sekali di kedua game (NusaCard cuma punya timer LEMPAR 10 detik; Ular Tangga gak punya timer apa-apa).
  - **NusaCard**: field baru `answerTurnStartedAt` di `NusaCardGameState`, di-set/di-null-in BARENGAN `currentAnsweringUID`/`activeQuestion` di semua titik yang udah ada (`throwCard`, `submitAnswer`, `checkAndFinalizeSoleSurvivor`) — pola watchdog PERSIS kayak `throwerTurnStartedAt`/`handleThrowTimeout` yang udah ada, SETIAP client yang liat cincin di avatar bisa manggil `submitAnswer` langsung kalau waktu abis (guard server `currentAnsweringUID===answeringUID` mastiin cuma 1 yang ke-apply). Cincin "answering" di `PlayerProfileNuca.tsx` sebelumnya SUDAH ADA tapi mati (gak pernah di-passing propsnya dari `GameArea.tsx`) — sekarang beneran disambungin & disinkron ke jam server (dulu cuma `setTimeout` lokal, gak akurat). Countdown angka juga muncul di `QuestionModal.tsx` (cuma tampilan, gak nembak timeout sendiri, biar gak ada 2 sumber kebenaran).
  - **Ular Tangga**: field baru `questionShownAt` di `UlarTanggaGameState`, di-set di `movePawn()` pas landing di tangga (bareng `showQuestion:true`), di-null-in di `nextTurn()`. BEDA pendekatan dari NusaCard — bukan watchdog lintas-client, tapi timer yang jalan di client SI PEMAIN AKTIF doang (lewat `handleSelectAnswer` yang udah ada, guard `isMyTurn`), karena game ini UDAH PUNYA mekanisme terpisah buat pemain offline (bot-takeover 60 detik) — gak perlu bikin watchdog kedua yang tumpang tindih. Countdown angka muncul langsung di `QuestionPanel.tsx` (kepake buat SEMUA pemain, bukan cuma yang jawab, karena panel ini emang keliatan sama-sama).
  - **Kalau waktu abis**: dianggap SALAH otomatis (lewat jalur `submitAnswer` yang sama persis kayak salah manual — nge-draw kartu penalti di NusaCard, giliran pindah normal), BUKAN tebakan acak.
- [x] **Efek visual potion, benar, salah** — ditakar dari frekuensi kejadian: benar/salah kejadian TERUS (tiap lemparan/giliran), jadi efeknya CSS ringan (pop+glow buat benar, shake buat salah) biar gak norak dipake berulang-ulang. Potion jarang dipake (item spesial), jadi dapet confetti beneran (`canvas-confetti`, palet brand yang sama kayak `RankModal`) — pertama kalinya dipake di `QuestionPanel.tsx` (Ular Tangga), sebelumnya cuma ada di `RankModal.tsx`.
- [x] **`RankModal`/`WinModal` diperbesar**: `max-w-md`(448px)/`max-w-[420px]` sama-sama jadi `max-w-2xl`(672px), padding/font/row/badge ikut diskalain naik proporsional. `WinModal` (dulu cuma kotak polos border) sekarang PAKE bingkai kayu yang sama kayak `RankModal` — 2 popup "game selesai" ini sekarang beneran kerasa satu keluarga, bukan yang satu lebih mewah. `WinModal` juga ikut dapet confetti kemenangan (dulu gak ada sama sekali), pake resep+palet yang SAMA PERSIS kayak `RankModal`.
- [x] **Tombol "Main Lagi"** — prop baru `onPlayAgain` di kedua modal, `router.push(roomPath)` (balik ke ROOM yang sama, bukan daftar lobby) — `roomPath` di NusaCard udah ada konstantanya, di Ular Tangga ditambahin baru (`/room/${gameID}/${topicID}/${roomID}`, format sama persis) biar konsisten. "Kembali ke Lobby" (ke daftar lobby) tetap ada sebagai tombol kedua.
- [x] `tsc --noEmit` bersih di tiap langkah. `npm run lint`: 123 problems (12 error/111 warning) — SAMA/lebih rendah dari baseline 124/12 sebelum sesi ini (turun 1 gara-gara ngebersihin `shouldBeGray` yang emang dead code di `QuestionPanel.tsx`) — 0 masalah baru.
- [x] Smoke-test `curl` ke `/play/nusa-card/...`, `/play/ular-tangga/...`, `/room/nusa-card/...`, `/room/ular-tangga/...` — semua 200.

**Eksplisit di luar cakupan** (dicatat di plan, dikonfirmasi user via approve): gak ada perubahan ke syarat menang/kalah — cuma nambah "telat jawab = salah" ke kategori hasil yang emang udah ada. Gak ada mekanisme resilience baru di luar yang udah dijelasin — pemain yang BENERAN offline tetap ditangani sistem stale/bot-takeover yang udah ada, bukan timer 8 detik ini. Gak benerin kuirk lama `reopenRoom()` (flip `isActive` ke false pas game selesai, bukan pas beneran keluar) — perilaku lama yang udah ada, bukan regresi dari fitur ini, self-heal lewat join effect halaman room yang udah ada.

**Belum ke-tes**: semua ini BELUM diverifikasi live (perlu 2+ akun main bareng beneran) — perlu dicoba: (a) cincin 8 detik beneran nongol & ke-hitung mundur pas soal muncul di kedua game, (b) dibiarin sampe abis beneran dianggap salah & giliran lanjut (bukan macet), (c) pakai potion beneran nembak confetti emas, (d) jawab benar/salah beneran nunjukin efek pop/shake baru, (e) `RankModal`/`WinModal` beneran lebih gede/lebar pas dibuka, (f) klik "Main Lagi" beneran balik ke ROOM yang sama (bukan daftar lobby) dan bisa langsung main lagi.

**Catatan:** `npm run build` gak dijalanin. Dev server tetap dipegang user, gak di-restart.

## 84. Revamp Halaman Credit ke Claymorphism + Admin: Bersihin Header, Fix Sticky Table, Filter Provinsi, Crop Gambar, Twibbon Story

Rangkaian permintaan beruntun: (1) halaman `/credit` masih pakai skema warna oranye-arcade + hijau generik, gak seragam sama claymorphism gold-parchment di tempat lain; (2) di admin, bagian atas (title/subtitle box) dibuang biar tabel lebih lega, header kolom tabel dibenerin, tambah filter provinsi; (3) upload gambar di admin (Credit & Informasi) butuh bisa di-crop/disesuaikan; (4) tiap anggota tim di halaman Credit dikasih tombol "magic" buat generate gambar twibbon story (9:16) buat dibagikan.

- [x] **`/credit` diseragamkan ke claymorphism** — `CreditMemberCard.tsx` & `CreditMemberModal.tsx` (sebelumnya gradasi oranye-arcade) diganti total ke resep gold-parchment (gradasi krem-emas + shadow berlapis) yang sama kayak `RankModal`/`AdminLogin`/dll. `page.tsx`: toggle V1/V2 jadi pil clay emas/krem, panel daftar dibungkus bingkai kayu (resep sama kayak `nq-admin-panel`), badge "List V1/V2" jadi pita emas.
- [x] **Admin — header atas dibuang**: `DashboardHeader.tsx` (title+subtitle box di atas tiap tabel) dihapus dari `AdminDashboard.tsx` — dicek dulu gak dipake di tempat lain, filenya ikut dihapus (bukan ditinggal jadi dead code).
- [x] **Admin — header kolom tabel dibenerin**: root cause ketemu — `.nq-admin-table thead` sebelumnya pake background TRANSLUCENT (`rgba(139,94,42,0.12)`) padahal `position:sticky`, jadi baris tabel yang discroll keliatan "nembus" transparan di belakang header pas discroll. Diganti jadi warna solid + shadow separator.
- [x] **Admin — filter provinsi ditambahin** di 2 tabel yang beneran punya dimensi provinsi: `QuestionsTable.tsx` (dropdown "Semua Provinsi" dari `regions`, reset otomatis kalau ganti map/kategori) dan `KotaProvinsTable.tsx` (dropdown dari list `PROVINCES` yang emang udah ada). `InformasiTable`/`CreditTable` gak disentuh — gak ada konsep provinsi di situ.
- [x] **Crop gambar sebelum upload** — nambah dependency `react-easy-crop` (belum ada tool crop sama sekali sebelumnya). Komponen baru `ImageCropModal.tsx` (claymorphism, drag+zoom slider) dan utility `cropImageToFile` (canvas). Di-hook ke SATU komponen upload yang udah dipake bareng (`CloudinaryUploadField.tsx`, dipake Credit & Informasi) — alurnya sekarang pilih file -> crop modal kebuka -> hasil crop-nya (bukan file mentah) yang ke-upload ke Cloudinary. Rasio crop beda per konteks: 4:5 buat foto Credit (samain sama rasio kartu/modal-nya di halaman publik), 2490:984 buat gambar Informasi (samain sama bingkai foto banner di halaman detailnya).
- [x] **Tombol "Bagikan ke Story" (twibbon 9:16) per anggota tim** — utility baru `generateTeamStoryImage()` (canvas, murni client-side) gambar: background gradasi hijau-tosca jungle + sparkle + daun teratai pojok atas + bingkai emas tipis (motif yang sama kayak modal-modal in-game), logo NusaQuest, headline "TIM NUSAQUEST" (font Bauhaus), foto anggota dalam bingkai polaroid — SENGAJA pake `drawContain` (jaga rasio ASLI foto 4:5, bukan crop paksa ngikutin 9:16) biar gak keliatan ke-zoom aneh, badge emas nyempil di sudut foto, nama+role (role di pil emas), tagline ajakan main, rambatan tanaman di bawah. Tombol ada di `CreditMemberModal.tsx`, hasil dibuka di tab baru (`window.open` dari object URL blob PNG) — user tinggal simpan/share dari situ.
- [x] `tsc --noEmit` bersih di tiap langkah. `npm run lint` tetap di baseline 123 problems (12 error/111 warning) — 0 masalah baru.
- [x] Smoke-test `curl` ke `/credit` dan `/admin` — 200 di kedua tahap (setelah crop feature & setelah twibbon feature).

**Belum ke-tes**: SEMUA fitur di atas belum diverifikasi live dengan mata beneran (sandbox ini gak ada Chrome/Playwright buat screenshot) — perlu dicoba manual: (a) tampilan `/credit` & `/admin` beneran rapi gold-parchment, (b) scroll tabel admin gak lagi nembus transparan di header, (c) filter provinsi beneran nge-filter baris yang bener, (d) upload gambar di Credit/Informasi beneran nampilin crop modal dan hasil crop-nya yang kesimpen (bukan gambar mentah), (e) tombol "Bagikan ke Story" beneran generate PNG 9:16 yang rapi & kebuka di tab baru, foto anggota gak keliatan gepeng/ke-zoom aneh.

**Catatan:** `npm run build` gak dijalanin. Dev server dinyalain ulang sesi ini (`npm run dev`), tetap dipegang user, gak di-restart lagi tanpa diminta.
