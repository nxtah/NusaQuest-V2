# PROJECT_CONTEXT.md
## NusaQuest - Product & Engineering Context

## 1. Project Overview
NusaQuest adalah website game edukasi berbasis web dengan tema budaya/destinasi Indonesia.
Aplikasi memiliki 2 game utama:
1. NusaCard (kartu + pertanyaan)
2. Ular Tangga (board + pertanyaan)

Mode permainan:
1. Multiplayer (room)
2. Vs AI (single player)

Backend utama menggunakan Firebase (Auth, Realtime Database, Storage).
Frontend lama React (CRA), sekarang migrasi ke Next.js + TypeScript.

---

## 2. Product Goals
1. User bisa login cepat dan langsung main.
2. User flow game harus sederhana: pilih topik -> pilih room -> main.
3. Gameplay real-time tetap sinkron antar pemain.
4. Profile, achievement, dan item (potion) tetap terintegrasi.
5. UI/UX redesign total tanpa merusak gameplay core.

---

## 3. Core Features (Must Keep)
1. Google login (Firebase Auth).
2. Interactive topic selection (map/topik).
3. Lobby + room system.
4. Realtime multiplayer state sync.
5. NusaCard gameplay loop:
   - throw card
   - answer question
   - penalty/hint/potion
   - win/lose
6. Ular Tangga gameplay loop:
   - roll dice
   - move pion
   - ladder/snake
   - question challenge
   - win/lose
7. Profile:
   - update display name
   - update photo
   - show achievements
   - show potion count
8. Destination information pages.
9. Toast/feedback/loading states.

---

## 4. Current Tech Context (Legacy)
1. React 18 + React Router.
2. React Bootstrap + custom CSS.
3. Firebase Realtime Database + Storage + Auth.
4. Konva/React-Konva untuk board/map rendering.
5. GSAP untuk animasi tertentu.
6. Folder lama: routes, components, services, utils, context.

---

## 5. New Target Stack (Next.js)
1. Next.js App Router + TypeScript (`.tsx`/`.ts`).
2. Feature-first architecture.
3. Firebase client modules centralized di `src/lib/firebase/*`.
4. Route groups:
   - `(public)` untuk halaman bebas akses
   - `(protected)` untuk halaman wajib login
5. Admin page disiapkan setelah redesign phase selesai.
6. Asset gambar saat ini diambil dari Cloudinary CDN (bukan local static file sebagai source utama).

---

## 6. Primary User Flow
1. User buka website.
2. Jika belum login -> login Google.
3. Masuk Home.
4. Pilih topik.
5. Masuk lobby.
6. Pilih room (multiplayer / vs AI).
7. Main game (NusaCard / Ular Tangga).
8. Lihat hasil (victory/lose), achievement, reward.
9. Main lagi atau kembali ke profile/home.

---

## 7. Phase Plan
### Phase 1 (active now)
Fokus redesign + migrasi halaman:
1. Home
2. Information
3. Profile
4. Lobby

### Phase 2
1. Room page
2. Gameplay pages (NusaCard, Ular Tangga, Vs AI)
3. Stabilization realtime sync

### Phase 3
1. Admin dashboard (CRUD pertanyaan, topik, game config)
2. Role-based access

---

## 8. Critical Engineering Rules
1. Jangan ubah gameplay rules tanpa persetujuan lead.
2. Pisahkan UI dan business logic:
   - UI di components
   - logic di hooks/services/utils
3. Semua akses Firebase harus lewat service layer (hindari akses liar di banyak komponen).
4. TypeScript strict untuk model data penting (user, room, gameState, question).
5. Hindari file monster > 300 LOC untuk file baru (pecah modular).
6. Selalu handle:
   - loading state
   - empty state
   - error state
7. Jaga route consistency dengan constants (`routes.ts`).
8. Hindari hardcoded string path Firebase di banyak tempat.
9. Hindari hardcoded URL Cloudinary di komponen; simpan mapping asset di layer constants/assets map.

---

## 9. Data Domain Summary
### User
- uid
- displayName
- email
- googlePhotoURL / firebasePhotoURL

### Room
- topicID
- gameID
- roomID
- capacity
- players
- currentPlayers
- gameStarted
- gameStatus

### GameState (high level)
- currentPlayerIndex
- questions
- player timers
- game status
- winner metadata
- player activity metadata

### Achievement
- per user
- progress per game/topic
- unlock state

### Items (Potion)
- item_name
- item_count
- item_img

---

## 10. Migration Principles from Legacy to Next.js
1. Satu file route lama bisa dipecah jadi:
   - `page.tsx` (composition)
   - `hooks/*` (logic)
   - `services/*` (firebase I/O)
   - `components/*` (UI blocks)
2. Jangan copy-paste seluruh file lama ke satu file Next.js.
3. Prioritaskan parity behavior dulu, baru polishing.
4. Migrasi bertahap per halaman, bukan big bang.

---

## 11. Quality Bar (Done Criteria)
Sebuah task dianggap selesai jika:
1. UI sesuai desain terbaru (desktop + mobile).
2. Tidak ada TypeScript error.
3. Tidak ada runtime error di console.
4. Loading/error/empty state tersedia.
5. Integrasi data valid sesuai domain model.
6. Komponen reusable bila dipakai lebih dari 1 halaman.

---

## 12. Non-Goals for Phase 1
1. Menambah fitur sosial baru (friend, leaderboard).
2. Mengubah total gameplay rules.
3. Menambah backend service di luar Firebase.
4. Membangun admin full.

---

## 13. Prompt Context for AI Assistant (Recommended)
Gunakan context ini saat minta bantuan AI:
- "Ini project migrasi NusaQuest dari React ke Next.js TS."
- "Pertahankan logic gameplay existing."
- "Fokus phase 1: home, information, profile, lobby."
- "Pisahkan UI/hook/service."
- "Jangan ubah arsitektur folder yang sudah disepakati."

---

## 14. Team Notes
1. FE fokus redesign + modularisasi TSX.
2. BE/fullsack support schema, service contract, dan keamanan Firebase rules.
3. Semua PR wajib small scope + clear description + screenshot (untuk UI task).

---

## 15. Asset Source Decision (Current)
1. Untuk fase sekarang, source gambar utama menggunakan Cloudinary CDN.
2. Mapping URL asset disentralisasi agar tim tidak perlu bolak-balik buka dashboard Cloudinary.
3. Gunakan helper/constants untuk pemanggilan asset agar mudah refactor bila strategi asset berubah.
