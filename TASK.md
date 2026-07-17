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
