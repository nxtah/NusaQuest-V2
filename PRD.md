# PRD — NusaQuest V2

**Status dokumen:** Living document
**Versi:** 2.0
**Terakhir diperbarui:** 15 Juli 2026

---

## 1. Ringkasan Produk

**NusaQuest** adalah web game edukasi bertema budaya dan geografi Indonesia. Pemain belajar tentang 34 provinsi, kota, destinasi wisata, kuliner, musik, tari, sejarah, alam, olahraga, dan tradisi Indonesia melalui permainan interaktif berbasis tanya-jawab.

NusaQuest V2 adalah penulisan ulang (rewrite) dari versi legacy yang dibangun dengan React (CRA) + React Bootstrap + React Router. V2 dibangun di atas Next.js App Router + TypeScript dengan arsitektur feature-first, service layer terpusat untuk Firebase, dan Cloudinary sebagai sumber utama aset gambar.

### 1.1 Masalah yang Diselesaikan

- Materi budaya dan geografi Indonesia umumnya disampaikan secara pasif (buku, hafalan), kurang menarik untuk pelajar.
- Aplikasi legacy sulit dikembangkan: struktur folder tidak konsisten, logika UI dan bisnis tercampur, tanpa type safety.

### 1.2 Tujuan Produk

1. Menyajikan pembelajaran budaya Indonesia dalam format permainan yang menyenangkan dan kompetitif.
2. Mendukung permainan multiplayer real-time antar pemain maupun mode latihan melawan AI.
3. Memberi tim konten (admin) kemampuan mengelola soal, informasi, dan data destinasi tanpa menyentuh kode.
4. Menjaga basis kode tetap bersih, ter-tipe kuat, dan mudah dirawat jangka panjang.

### 1.3 Target Pengguna

| Persona | Kebutuhan |
|---|---|
| **Pelajar / pemain umum** | Belajar budaya Indonesia sambil bermain, bermain bersama teman |
| **Pemain solo** | Latihan mandiri melawan AI tanpa menunggu pemain lain |
| **Admin konten** | CRUD soal, informasi, dan data kota/provinsi lewat dashboard |

---

## 2. Tech Stack

### 2.1 Frontend

| Kategori | Teknologi | Versi |
|---|---|---|
| Framework | Next.js (App Router) | 16.1.6 |
| UI Library | React | 19.2.3 |
| Bahasa | TypeScript (strict mode) | 5.x |
| Styling | Tailwind CSS + CSS per-fitur | 3.4.19 |
| State Management | Zustand | 5.x |
| Validasi Skema | Zod | 4.x |
| Rendering Papan Game | Konva + react-konva + use-image | — |
| Animasi | GSAP, Framer Motion | — |
| Ikon | lucide-react | — |

### 2.2 Backend & Infrastruktur

| Kategori | Teknologi | Catatan |
|---|---|---|
| Autentikasi | Firebase Authentication (Google Sign-In) | Session cookie httpOnly via Firebase Admin SDK |
| Database | Firebase Realtime Database (RTDB) | **Akan dimigrasi ke Cloud Firestore** — lihat §7 |
| Penyimpanan Media | Cloudinary | Sumber utama aset gambar |
| Penyimpanan File | Firebase Storage | Foto profil pengguna |
| API Layer | Next.js API Routes (`src/app/api/**`) | Tidak ada backend server terpisah |
| Admin SDK | firebase-admin | Verifikasi session, custom claims (role) |

### 2.3 Tooling

- ESLint 9 (flat config, `eslint-config-next`: core-web-vitals + typescript)
- Prettier (single quotes, semicolon, trailing comma, printWidth 100)
- Path alias `@/*` → root proyek

---

## 3. Arsitektur

### 3.1 Prinsip Arsitektur

1. **Feature-first** — setiap domain berdiri sendiri di `src/features/<domain>/` berisi `components/`, `hooks/`, `services/`, `utils/`, `types.ts`.
2. **Pemisahan UI dan logika bisnis** — komponen hanya merender; logika hidup di hooks dan services.
3. **Seluruh akses Firebase melalui service layer** — komponen tidak boleh memanggil Firebase SDK secara langsung.
4. **Route terpusat** — semua path didefinisikan di `src/lib/constants/routes.ts`, tidak ada string path yang di-hardcode di komponen.
5. **Aset terpusat** — URL Cloudinary dipetakan di `src/assets/images/*/cloudinaryAssets.ts`, tidak di-hardcode di komponen.

### 3.2 Struktur Direktori

```
src/
├── app/                        # Next.js App Router
│   ├── (public)/               # Route tanpa autentikasi
│   │   ├── home/               # Homepage — peta pulau interaktif
│   │   ├── information/        # Konten informasi & panduan
│   │   ├── destination/[id]/   # Detail destinasi
│   │   └── credit/             # Halaman kredit tim
│   ├── (protected)/            # Route yang membutuhkan login
│   │   ├── lobby/[topicID]/[gameID]/
│   │   ├── room/[gameID]/[topicID]/[roomID]/
│   │   └── play/[gameID]/[topicID]/[roomID]/
│   │       ├── nusa-card/
│   │       ├── nusa-card-vs-ai/
│   │       ├── ular-tangga/
│   │       └── ular-tangga-vs-ai/
│   ├── admin/                  # Dashboard admin
│   ├── api/                    # API routes (auth, admin, upload, health)
│   └── profile/
├── features/                   # Modul per domain
│   ├── home/  lobby/  room/  game/
│   ├── game-nuca/              # Logika game NusaCard
│   ├── game-ular-tangga/       # Logika game Ular Tangga
│   ├── admin-v2/               # Dashboard admin aktif
│   ├── destination/  profile/  achievements/  inventory/
├── components/                 # UI bersama lintas fitur
│   ├── ui/                     # Primitif: Button, Modal, Toast, Loader
│   ├── layout/                 # Header, Footer, PauseModal, RotateDeviceOverlay
│   └── game-shared/            # HeaderGame, VictoryOverlay, LoseOverlay
├── services/firebase/          # Service layer Firebase
├── lib/                        # firebase/, cloudinary/, constants/, schemas/, utils/
├── store/                      # Zustand stores
├── types/                      # Definisi tipe global
├── hooks/firebase/             # Hook data Firebase
└── assets/images/              # Peta URL aset Cloudinary
```

---

## 4. Alur Aplikasi (User Flow)

### 4.1 Alur Utama

```
Login (Google)
   |
Home — peta Indonesia interaktif
   |  klik label pulau
Modal Pilih Game  ->  NusaCard | Ular Tangga
   |
Modal Pilih Provinsi  ->  34 provinsi
   |  navigasi ke /lobby/{provinsi}/{game}
Lobby — pilih rumah/room (Room 1–4 atau Vs AI)
   |  navigasi ke /room/{game}/{topik}/{room}
Room — ruang tunggu, chat, daftar pemain
   |  host mulai permainan
Play — NusaCard atau Ular Tangga
   |
Hasil — menang/kalah, achievement
   |
Main lagi | Kembali ke Home
```

### 4.2 Alur Permainan — Ular Tangga

1. Pemain pada giliran melempar dadu.
2. Pion bergerak sesuai hasil dadu.
3. Jika mendarat di kaki tangga, muncul modal soal.
4. Jawaban benar membuat pion naik ke ujung tangga. Jawaban salah membuat pion tetap di tempat.
5. Giliran berpindah ke pemain berikutnya, dengan timer per giliran.
6. Pemain pertama yang mencapai kotak akhir memenangkan permainan.

> Catatan: fitur ular telah dihapus dari permainan; hanya tangga yang tersisa meskipun nama permainan tetap "Ular Tangga".

### 4.3 Alur Permainan — NusaCard

1. Pemain mendapat kartu di tangan.
2. Kartu dimainkan ke area permainan.
3. Muncul soal terkait topik kartu.
4. Jawaban benar memberi keuntungan pada pemain.
5. Giliran berpindah dengan timer per giliran.

### 4.4 Mode Permainan

| Mode | Deskripsi |
|---|---|
| **Multiplayer** | Berbasis room, state disinkronkan real-time via Firebase. Kapasitas dan status room dikelola dengan transaction. |
| **Vs AI** | Pemain tunggal melawan lawan AI, tanpa menunggu pemain lain. |

### 4.5 Alur Admin

```
/admin  ->  Dashboard
   ├── Pertanyaan & Jawaban   — CRUD soal per game & per topik
   ├── Informasi              — CRUD konten informasi (Tutorial, Panduan, Tips, Berita, Peraturan, FAQ)
   └── Kota & Provinsi        — CRUD data destinasi (nama, provinsi, tipe, gambar, deskripsi)
```

---

## 5. Fitur

### 5.1 Fitur Inti

| Fitur | Deskripsi |
|---|---|
| **Homepage interaktif** | Peta Indonesia dengan label pulau yang dapat diklik untuk memulai alur pemilihan permainan |
| **Pemilihan game & provinsi** | Modal bertingkat: pilih jenis permainan, lalu pilih provinsi, lalu masuk lobby |
| **Lobby** | Diorama rumah sebagai representasi room; pilih room multiplayer atau Vs AI |
| **Room** | Ruang tunggu dengan daftar pemain, chat real-time, dan kontrol mulai permainan |
| **Game NusaCard** | Permainan kartu berbasis tanya-jawab budaya |
| **Game Ular Tangga** | Permainan papan berbasis tanya-jawab dengan tangga sebagai reward |
| **Informasi** | Katalog konten edukatif dengan kategori dan pencarian |
| **Destinasi** | Detail destinasi wisata per kota/provinsi |
| **Profil** | Data pengguna, foto profil, achievement, dan inventory |
| **Achievement** | Pencatatan progres dan pembukaan pencapaian per pengguna |
| **Inventory** | Item/potion milik pengguna |
| **Dashboard admin** | CRUD soal, informasi, dan data kota/provinsi |

### 5.2 Topik Konten

DAERAH, KULINER, MUSIK, TARI, SEJARAH, ALAM, OLAHRAGA, TRADISI

### 5.3 Tipe Destinasi

Desa Wisata, Sejarah dan Budaya, serta kategori lain yang dikelola melalui dashboard admin.

---

## 6. Model Data

Struktur berikut merefleksikan kondisi RTDB saat ini. Skema target Firestore didefinisikan pada saat migrasi (§7).

| Entitas | Field Utama |
|---|---|
| **User** | `uid`, `displayName`, `email`, `photoURL`, `updatedAt` |
| **Room** | `capacity`, `currentPlayers`, `gameStatus`, `gameStarted`, `players`, `isSinglePlayer`, `startedAt` |
| **GameState** | `currentPlayerIndex`, `currentPlayerUID`, `pionPositions`, `diceState`, `playerActivity`, `questions`, `gameStatus`, `gameWinnerUID` |
| **Question** | `question_text`, `multiple_choices` (A–D dengan `answer_text` + `is_correct`), `topic`, `gameId`, `hint`, `destination` |
| **Destination** | `nama`, `provinsi`, `deskripsi`, `type`, `image`, `latitude`, `longitude` |
| **Informasi** | `title`, `description`, `content`, `category`, `image` |
| **Achievement** | `key`, `progress`, `unlocked`, `updatedAt` |
| **Inventory Item** | `item_name`, `item_count`, `item_img` |
| **ChatMessage** | `sender`, `message`, `timestamp` |

---

## 7. Rencana Migrasi Database: RTDB ke Firestore

### 7.1 Keputusan

Database akan dimigrasikan dari Firebase Realtime Database ke **Cloud Firestore**.

### 7.2 Prinsip Migrasi

Migrasi **bukan** penyalinan struktur apa adanya. Skema Firestore dirancang ulang sekaligus merapikan inkonsistensi yang ada di RTDB saat ini:

- Penamaan node ganda: `topic` (tunggal) dan `topics` (jamak) disatukan menjadi satu penamaan konsisten.
- Chat tersimpan di dua konvensi path berbeda, disatukan ke satu lokasi kanonik.
- Game state tersimpan di dua lokasi berbeda (`rooms/.../gameState` dan `games/state/{roomId}`), disatukan ke satu lokasi kanonik.
- Nesting soal tidak konsisten antar service, disatukan ke satu struktur koleksi.

### 7.3 Cakupan Terdampak

- Service layer `src/services/firebase/*`
- Service level fitur di `src/features/*/services/*`
- Hooks `src/hooks/firebase/*`
- Script migrasi data di `scripts/`
- Security rules Firestore (perlu dibuat dan disimpan dalam version control)

---

## 8. Standar Kualitas Kode

Aturan berikut mengikat untuk seluruh pengembangan. Detail operasional ada di `AGENTS.md`.

1. TypeScript strict — hindari `any`, definisikan tipe untuk seluruh model inti.
2. Pisahkan UI dari logika bisnis — komponen merender, hooks/services mengurus logika.
3. Seluruh akses Firebase melalui service layer, tidak ada pemanggilan SDK langsung dari komponen.
4. Hindari file lebih dari 300 baris — pecah menjadi modul yang lebih kecil.
5. Selalu tangani state loading, empty, dan error.
6. Route lewat `routes.ts`; jangan hardcode path.
7. Aset Cloudinary lewat peta aset; jangan hardcode URL di komponen.
8. Tanpa `console.log` yang tertinggal di kode produksi.
9. Konsisten dengan konfigurasi Prettier dan ESLint yang ada.
10. Satu implementasi per kebutuhan — tidak ada service, tipe, atau halaman duplikat yang dibiarkan hidup berdampingan.

---

## 9. Non-Goals

Hal-hal berikut secara eksplisit **di luar cakupan** saat ini:

- Fitur sosial baru (pertemanan, leaderboard global, komentar).
- Perombakan aturan permainan yang sudah berjalan.
- Backend non-Firebase (server kustom, database relasional).
- Monetisasi, pembayaran, atau pembelian dalam aplikasi.
- Aplikasi mobile native.
- Internasionalisasi (aplikasi berbahasa Indonesia).

---

## 10. Pekerjaan Lanjutan yang Diketahui

Dicatat sebagai konteks perencanaan, bukan komitmen jadwal:

- **Migrasi RTDB ke Firestore** beserta perancangan ulang skema (§7).
- **Perapian struktur** — penghapusan dashboard admin legacy (`app/admin/{games,questions,topics,users}` dan `features/admin` lama), penghapusan service dan tipe duplikat, penghapusan file stub yang tidak terpakai.
- **Perapian integrasi Cloudinary** — cloud name diambil dari environment variable (bukan hardcode), implementasi modul `lib/cloudinary/*`, perbaikan penamaan env var pada route signature upload, penyambungan alur signed upload ke form admin.
- **Penyambungan data konten** — halaman `/information` dan `/profile` mengambil data dari database, bukan data dummy.
- **Autentikasi dan proteksi route** — middleware, halaman login, penyambungan AuthProvider. *Dijadwalkan sebagai pekerjaan terpisah, di luar cakupan perapian dan migrasi database.*

---

## 11. Konfigurasi Environment

| Variable | Sisi | Kegunaan |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client | Inisialisasi Firebase |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Client | Firebase Auth |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | Client | Realtime Database |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Client | Identitas proyek |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Client | Firebase Storage |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Client | Firebase |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Client | Firebase |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Client | Analytics (belum diinisialisasi) |
| `FIREBASE_ADMIN_PROJECT_ID` | Server | Admin SDK |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Server | Admin SDK |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Server | Admin SDK |
| `FIREBASE_ADMIN_SDK_BASE64` | Server | Alternatif service account (base64) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Client | CDN gambar |
| `CLOUDINARY_API_KEY` | Server | Signed upload |
| `CLOUDINARY_API_SECRET` | Server | Signed upload |

Seluruh nilai disimpan di `.env.local` dan tidak pernah di-commit.

---

## 12. Referensi

| Dokumen | Isi |
|---|---|
| `AGENTS.md` | Panduan kerja untuk kontributor dan agen AI |
| `TASK.md` | Catatan pekerjaan yang telah selesai |
| `docs/PROJECT_CONTEXT.md` | Konteks proyek dan aturan tim |
| `docs/FILE_GUIDE.md` | Referensi arsitektur file (bersifat aspiratif) |
| `docs/GAME_FLOW_GUIDE.md` | Detail alur pemilihan game dari peta pulau |
| `docs/FONTS_GUIDE.md` | Setup font kustom (Bauhaus) |
| `docs/IMPLEMENTATION_SUMMARY.md` | Ringkasan implementasi alur pemilihan game |
