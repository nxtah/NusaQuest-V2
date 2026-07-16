# AGENTS.md — Panduan Kerja NusaQuest V2

Dokumen ini adalah panduan operasional untuk kontributor dan agen AI yang bekerja di repositori ini. Baca dokumen ini sebelum menulis kode.

Untuk konteks produk, tech stack, dan alur aplikasi, lihat `PRD.md`.
Untuk daftar pekerjaan yang sudah selesai, lihat `TASK.md`.

---

## 1. Tentang Proyek

**NusaQuest V2** adalah web game edukasi bertema budaya dan geografi Indonesia. Dua mini-game: **NusaCard** (kartu + tanya-jawab) dan **Ular Tangga** (papan + tanya-jawab), masing-masing tersedia dalam mode multiplayer berbasis room dan mode Vs AI.

Proyek ini adalah rewrite dari aplikasi legacy React (CRA) ke Next.js App Router + TypeScript. Basis kode berada dalam kondisi **migrasi berjalan** — beberapa area masih memuat sisa implementasi lama. Lihat §7 untuk daftar area yang perlu diperlakukan hati-hati.

---

## 2. Perintah Dasar

```bash
npm run dev      # Jalankan dev server
npm run build    # Build produksi
npm run start    # Jalankan hasil build
npm run lint     # ESLint
```

Environment variable disimpan di `.env.local` (tidak di-commit). Daftar lengkap variable ada di `PRD.md` §11.

---

## 3. Tech Stack Singkat

- **Next.js 16** (App Router) + **React 19** + **TypeScript strict**
- **Zustand** untuk state global, **Zod** untuk validasi skema
- **Tailwind CSS** + file CSS per-fitur
- **Konva / react-konva** untuk papan permainan, **GSAP / Framer Motion** untuk animasi
- **Firebase** (Auth, Realtime Database, Storage) sebagai backend
- **Cloudinary** sebagai CDN aset gambar
- Path alias: `@/*` menunjuk ke root proyek

---

## 4. Struktur Folder dan Aturan Penempatan

```
src/
├── app/           # Routing Next.js saja — halaman tipis, tanpa logika bisnis
├── features/      # Modul per domain: components/, hooks/, services/, utils/, types.ts
├── components/    # UI bersama lintas fitur: ui/, layout/, game-shared/
├── services/      # Service layer Firebase
├── lib/           # firebase/, cloudinary/, constants/, schemas/, utils/
├── store/         # Zustand stores
├── types/         # Tipe global
├── hooks/         # Hook bersama
└── assets/images/ # Peta URL aset Cloudinary
```

**Menentukan lokasi file baru:**

| Jenis kode | Lokasi |
|---|---|
| Dipakai hanya oleh satu fitur | `src/features/<fitur>/` |
| Dipakai oleh dua fitur atau lebih | `src/components/` (UI) atau `src/lib/` (utilitas) |
| Primitif UI generik (Button, Modal, Toast) | `src/components/ui/` |
| Akses database/storage | `src/services/firebase/` |
| Konstanta, skema, helper | `src/lib/` |

Halaman di `src/app/` hanya bertugas merangkai komponen dan membaca params. Logika bisnis tidak boleh tinggal di file `page.tsx`.

---

## 5. Aturan Kode

### 5.1 Wajib

1. **TypeScript strict.** Jangan gunakan `any`. Definisikan tipe eksplisit untuk seluruh model data.
2. **Pisahkan UI dari logika.** Komponen hanya merender. Logika bisnis hidup di hooks dan services.
3. **Akses Firebase hanya lewat service layer.** Komponen tidak boleh mengimpor Firebase SDK secara langsung.
4. **Route lewat konstanta.** Gunakan `src/lib/constants/routes.ts`. Jangan menulis string path di komponen.
5. **Aset lewat peta aset.** Gunakan `src/assets/images/*/cloudinaryAssets.ts`. Jangan menulis URL Cloudinary di komponen.
6. **Batas 300 baris per file.** Jika melebihi, pecah menjadi modul lebih kecil.
7. **Tangani tiga state.** Setiap tampilan yang memuat data harus menangani loading, empty, dan error.
8. **Tanpa `console.log` tertinggal.** Bersihkan sebelum commit.
9. **Ikuti Prettier dan ESLint.** Single quotes, semicolon, trailing comma, printWidth 100, indentasi 2 spasi.
10. **Satu implementasi per kebutuhan.** Jangan menambah service, tipe, atau halaman baru yang menduplikasi yang sudah ada — perbaiki yang ada.

### 5.2 Konvensi Penamaan

| Elemen | Konvensi | Contoh |
|---|---|---|
| Komponen React | PascalCase | `RoomSelect.tsx` |
| Hook | camelCase, prefix `use` | `useUlarTanggaGame.ts` |
| Service | kebab-case, sufiks `.service.ts` | `rooms.service.ts` |
| Util | kebab-case | `board-rules.ts` |
| Tipe / Interface | PascalCase | `RoomPlayer`, `GameState` |
| Konstanta | SCREAMING_SNAKE_CASE | `SESSION_MAX_AGE_SECONDS` |

### 5.3 Bahasa dalam Kode

- **Identifier, nama fungsi, dan komentar kode ditulis dalam bahasa Inggris.**
- **Teks yang dilihat pengguna ditulis dalam bahasa Indonesia** (label UI, pesan error, konten).
- Basis kode saat ini masih mencampur keduanya. Saat menyentuh file lama, rapikan sesuai aturan ini tanpa memperluas cakupan perubahan di luar kebutuhan.

---

## 6. Aturan Domain

### 6.1 Firebase

- Seluruh operasi database melalui `src/services/firebase/`. Jangan memanggil `ref()`, `get()`, `set()` langsung dari komponen atau halaman.
- Service mengembalikan tipe hasil yang konsisten (`AppResult<T>`), bukan melempar exception mentah ke UI.
- Path database tidak boleh di-hardcode tersebar. Definisikan di service layer.
- Operasi yang membutuhkan hak admin harus divalidasi di server (API route dengan `withAuth`), bukan hanya disembunyikan di UI.

### 6.2 Migrasi Database ke Firestore

Database sedang dalam rencana migrasi dari **Realtime Database ke Cloud Firestore**.

- Jangan menambah node RTDB baru tanpa mempertimbangkan dampaknya pada migrasi.
- Migrasi **tidak** menyalin struktur apa adanya — skema Firestore dirancang ulang untuk merapikan inkonsistensi yang ada (`topic` vs `topics`, chat di dua path, game state di dua lokasi).
- Kode baru sebaiknya mengakses data hanya lewat service layer sehingga penggantian SDK terisolasi di satu lapisan.
- Security rules Firestore harus dibuat dan disimpan dalam version control saat migrasi dilakukan. Saat ini repositori tidak memuat file rules sama sekali.

### 6.3 Cloudinary

- Cloudinary adalah sumber utama aset gambar. Folder `public/images` hanya berisi placeholder.
- URL aset dipetakan per kategori di `src/assets/images/*/cloudinaryAssets.ts` (background, badge, game, information, loading, nuca, pause, room, ular-tangga).
- Cloud name harus dibaca dari environment variable, bukan di-hardcode.
- Upload dari client menggunakan signed upload lewat `src/app/api/upload/signature/route.ts`. Jangan mengekspos `CLOUDINARY_API_SECRET` ke sisi client.
- `next.config.ts` `images.remotePatterns` mengizinkan `res.cloudinary.com`, `lh3.googleusercontent.com`, `firebasestorage.googleapis.com`, dan `images.unsplash.com`.

### 6.4 Logika Permainan

- **Jangan mengubah aturan permainan tanpa persetujuan lead.** Aturan dadu, tangga, giliran, timer, dan kondisi menang adalah keputusan produk.
- Fitur ular sudah dihapus dari Ular Tangga; hanya tangga yang tersisa. Nama permainan tetap "Ular Tangga".
- Logika aturan murni ditempatkan di `utils/` (contoh: `game-ular-tangga/utils/board-rules.ts`), terpisah dari sinkronisasi Firebase di `services/` dan orkestrasi di `hooks/`.

### 6.5 Autentikasi

- Sign-in menggunakan Google via Firebase Auth. Session disimpan sebagai cookie httpOnly (`nq_session`, 8 jam) yang diterbitkan `/api/auth/session`.
- Role disimpan sebagai custom claim (`role: 'admin' | 'user'`) melalui Admin SDK.
- Konstanta proteksi route ada di `src/lib/constants/auth-security.ts`.
- **Status saat ini:** middleware, halaman login, dan penyambungan AuthProvider belum ada. Route group `(protected)` belum benar-benar terproteksi di runtime. Ini pekerjaan terpisah yang sudah diketahui — jangan asumsikan proteksi sudah berjalan saat menulis fitur.

---

## 7. Area yang Perlu Kehati-hatian

Kondisi berikut sudah diketahui dan sedang dalam antrean perbaikan. Jangan memperluasnya, dan jangan mencontoh polanya untuk kode baru.

| Area | Kondisi |
|---|---|
| Dashboard admin ganda | `src/app/admin/{games,questions,topics,users}` adalah versi legacy (markup Bootstrap, tombol tanpa handler, tidak tertaut). Versi aktif adalah `src/features/admin-v2`. **Legacy akan dihapus** — jangan dikembangkan. |
| Service duplikat | Terdapat dua `room.service.ts` dan dua `game.service.ts` di fitur berbeda. Pastikan mengimpor yang benar. |
| Tipe duplikat | `features/admin/types.ts` dan `features/admin/types/admin.types.ts` berdampingan. |
| File stub kosong | `lib/constants/game.ts`, `features/game-nuca/utils/nuca-rules.ts`, `lib/cloudinary/client.ts`, `lib/cloudinary/upload.ts` hanya berisi `export {}`. |
| Data terputus | Halaman `/information` memakai data dummy hardcoded, bukan data `informasi` dari database yang dikelola admin. Halaman `/profile` memakai user mock, bukan data session. |
| Cloudinary hardcode | `src/lib/cloudinaryHelper.ts` menulis cloud name secara hardcode. Route signature upload membaca `CLOUDINARY_CLOUD_NAME` tanpa prefix `NEXT_PUBLIC_`, tidak cocok dengan nama variable yang tersedia. |
| Tailwind versi campur | `tailwind.config.js` (gaya v3) berdampingan dengan dependensi `@tailwindcss/postcss` v4, dan terdapat dua file konfigurasi postcss. |
| Dokumentasi aspiratif | `docs/FILE_GUIDE.md` mendeskripsikan file yang belum ada (middleware, folder auth, halaman login). Perlakukan sebagai rencana, bukan peta kondisi saat ini. |

---

## 8. Alur Kerja

### 8.1 Sebelum Menulis Kode

1. Baca `PRD.md` untuk konteks produk dan alur.
2. Cari implementasi yang sudah ada sebelum membuat yang baru — banyak helper dan service sudah tersedia.
3. Untuk perubahan besar (migrasi database, restrukturisasi folder, perubahan aturan permainan), diskusikan rencana terlebih dahulu.

### 8.2 Saat Menulis Kode

1. Ikuti aturan pada §5 dan §6.
2. Jaga cakupan perubahan tetap fokus. Jangan mencampur refactor besar dengan perbaikan fitur dalam satu perubahan.
3. Saat menyentuh file yang tidak konsisten, rapikan seperlunya di area yang disentuh saja.

### 8.3 Sebelum Selesai

1. Jalankan `npm run lint` dan pastikan bersih.
2. Jalankan `npm run build` untuk memastikan build tidak rusak.
3. Uji alur yang terdampak di browser secara nyata — bukan hanya memastikan kode ter-compile.
4. Hapus `console.log` dan kode mati.
5. Perbarui `TASK.md` jika ada pekerjaan yang selesai.

---

## 9. Commit

Gunakan Conventional Commits:

```
feat: tambah modal pemilihan provinsi di homepage
fix: perbaiki validasi UID sebelum roll dadu
refactor: pindahkan logika room ke service layer
chore: hapus halaman admin legacy
docs: perbarui PRD dengan rencana migrasi Firestore
```

Aturan:
- Subject maksimal 50 karakter, gunakan bahasa Indonesia.
- Body hanya jika alasan perubahan tidak terlihat jelas dari diff.
- Jangan commit `.env.local` atau kredensial apa pun.
- Jangan gunakan `--no-verify`.

---

## 10. Larangan

- Jangan mengubah aturan permainan tanpa persetujuan lead.
- Jangan menambah backend di luar Firebase.
- Jangan memanggil Firebase SDK langsung dari komponen.
- Jangan hardcode path route, URL Cloudinary, atau path database di komponen.
- Jangan mengembangkan dashboard admin legacy (`app/admin/{games,questions,topics,users}`).
- Jangan menambah implementasi duplikat dari service atau tipe yang sudah ada.
- Jangan commit kredensial atau secret.
- Jangan menambah fitur sosial baru (pertemanan, leaderboard global) — di luar cakupan saat ini.
