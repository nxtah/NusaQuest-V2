# CLAUDE.md

Panduan untuk Claude Code saat bekerja di repositori ini.

| Dokumen | Isi |
|---|---|
| `PRD.md` | Konteks produk, tech stack, alur aplikasi, model data, rencana migrasi |
| `AGENTS.md` | Panduan kerja lengkap: aturan kode, konvensi, aturan domain |
| `TASK.md` | Catatan pekerjaan yang telah selesai |
| `docs/` | Dokumentasi pendukung (konteks proyek, alur game, font) |

Dokumen ini adalah ringkasan operasional. Untuk detail aturan, baca `AGENTS.md`.

---

## Tentang Proyek

**NusaQuest V2** — web game edukasi bertema budaya dan geografi Indonesia (34 provinsi, kota, destinasi, kuliner, musik, tari, sejarah, alam, olahraga, tradisi).

Dua mini-game, masing-masing punya mode multiplayer berbasis room dan mode Vs AI:
- **NusaCard** — kartu + tanya-jawab
- **Ular Tangga** — papan + tanya-jawab (fitur ular sudah dihapus; hanya tangga tersisa, nama tetap)

Alur utama: login Google → home (peta pulau interaktif) → pilih game → pilih provinsi → lobby → pilih room → main → hasil.

Proyek ini rewrite dari aplikasi legacy React (CRA) ke Next.js App Router + TypeScript, dan **masih dalam kondisi migrasi berjalan** — beberapa area memuat sisa implementasi lama. Lihat "Kondisi yang Perlu Diketahui" di bawah.

---

## Perintah

```bash
npm run dev      # Dev server
npm run build    # Build produksi
npm run start    # Jalankan hasil build
npm run lint     # ESLint
```

Environment variable ada di `.env.local` (tidak di-commit). Daftar lengkap di `PRD.md` §11.

---

## Tech Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Zustand · Zod · Tailwind CSS · Konva/react-konva (papan game) · GSAP + Framer Motion · Firebase (Auth, Realtime Database, Storage) · Cloudinary (CDN gambar) · Path alias `@/*` ke root proyek.

---

## Peta Kode

```
src/
├── app/           # Routing saja — page.tsx tipis, tanpa logika bisnis
│   ├── (public)/  # home, information, destination/[id], credit
│   ├── (protected)/  # lobby, room, play (nusa-card, ular-tangga, + varian vs-ai)
│   ├── admin/     # Dashboard admin
│   └── api/       # auth/session, admin/*, upload/signature, health
├── features/      # Modul per domain — components/, hooks/, services/, utils/, types.ts
├── components/    # UI bersama — ui/, layout/, game-shared/
├── services/firebase/  # Service layer Firebase
├── lib/           # firebase/, cloudinary/, constants/, schemas/, utils/
├── store/         # Zustand
├── types/         # Tipe global
└── assets/images/ # Peta URL aset Cloudinary
```

**Menentukan lokasi file baru:** dipakai satu fitur → `src/features/<fitur>/`. Dipakai dua fitur atau lebih → `src/components/` (UI) atau `src/lib/` (utilitas). Akses database → `src/services/firebase/`.

---

## Aturan Utama

1. **TypeScript strict** — jangan pakai `any`, definisikan tipe untuk semua model data.
2. **Pisahkan UI dari logika** — komponen merender saja; logika di hooks dan services.
3. **Akses Firebase hanya lewat service layer** — komponen tidak boleh mengimpor Firebase SDK langsung.
4. **Route lewat `src/lib/constants/routes.ts`** — jangan hardcode string path.
5. **Aset lewat `src/assets/images/*/cloudinaryAssets.ts`** — jangan hardcode URL Cloudinary.
6. **Batas 300 baris per file** — pecah jika melebihi.
7. **Tangani loading, empty, dan error** di setiap tampilan yang memuat data.
8. **Tanpa `console.log` tertinggal.**
9. **Satu implementasi per kebutuhan** — jangan menambah service, tipe, atau halaman duplikat. Perbaiki yang sudah ada.
10. **Cari implementasi yang sudah ada sebelum membuat baru** — banyak service dan helper sudah tersedia.

**Bahasa:** identifier dan komentar kode dalam bahasa Inggris; teks yang dilihat pengguna dalam bahasa Indonesia. Basis kode saat ini masih campur — rapikan hanya di area yang disentuh, jangan perluas cakupan.

**Commit:** Conventional Commits, subject bahasa Indonesia maksimal 50 karakter (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`).

---

## Migrasi Database: RTDB ke Firestore

Database akan dimigrasikan dari Realtime Database ke **Cloud Firestore**. Saat ini basis kode masih **100% RTDB** — belum ada Firestore sama sekali.

- Migrasi **bukan** salin struktur apa adanya. Skema Firestore dirancang ulang sekaligus merapikan inkonsistensi RTDB yang ada: `topic` vs `topics`, chat di dua path berbeda, game state di dua lokasi berbeda (`rooms/.../gameState` dan `games/state/{roomId}`), nesting soal tidak konsisten antar service.
- Jangan menambah node RTDB baru tanpa mempertimbangkan dampak migrasi.
- Akses data selalu lewat service layer supaya penggantian SDK terisolasi di satu lapisan.
- Security rules Firestore perlu dibuat dan masuk version control. Repositori saat ini **tidak memuat file rules sama sekali** (`firebase.json`, `firestore.rules`, `database.rules.json`, `storage.rules` tidak ada).

---

## Cloudinary

Cloudinary adalah sumber utama aset gambar; `public/images` hanya berisi placeholder.

- URL aset dipetakan per kategori di `src/assets/images/*/cloudinaryAssets.ts` (background, badge, game, information, loading, nuca, pause, room, ular-tangga).
- Cloud name harus dibaca dari environment variable, bukan hardcode.
- Upload dari client memakai signed upload lewat `/api/upload/signature`. Jangan pernah mengekspos `CLOUDINARY_API_SECRET` ke sisi client.

---

## Kondisi yang Perlu Diketahui

Sudah diketahui dan masuk antrean perbaikan. **Jangan diperluas, jangan dicontoh polanya untuk kode baru.**

| Area | Kondisi |
|---|---|
| Admin ganda | `src/app/admin/{games,questions,topics,users}` versi legacy (Bootstrap, tombol tanpa handler, tidak tertaut) — **akan dihapus, jangan dikembangkan**. Versi aktif: `src/features/admin-v2`. |
| Service duplikat | Ada dua `room.service.ts` dan dua `game.service.ts` di fitur berbeda — pastikan impor yang benar. |
| Tipe duplikat | `features/admin/types.ts` dan `features/admin/types/admin.types.ts` berdampingan. |
| File stub kosong | `lib/constants/game.ts`, `features/game-nuca/utils/nuca-rules.ts`, `lib/cloudinary/client.ts`, `lib/cloudinary/upload.ts` hanya berisi `export {}`. |
| Data terputus | `/information` dan `/profile` memakai data dummy hardcoded, bukan data dari database. |
| Cloudinary hardcode | `src/lib/cloudinaryHelper.ts` hardcode cloud name. Route signature upload membaca `CLOUDINARY_CLOUD_NAME` tanpa prefix `NEXT_PUBLIC_` — tidak cocok dengan env var yang tersedia. |
| Tailwind campur | `tailwind.config.js` (v3) berdampingan dengan dependensi `@tailwindcss/postcss` v4, dan ada dua file konfigurasi postcss. |
| Docs aspiratif | `docs/FILE_GUIDE.md` mendeskripsikan file yang belum ada (middleware, folder auth, halaman login) — perlakukan sebagai rencana, bukan kondisi saat ini. |

**Auth belum terpasang penuh.** Session cookie API, `withAuth`, dan custom claim role sudah jalan di sisi server. Tapi middleware, halaman login, dan penyambungan AuthProvider **belum ada** — route group `(protected)` belum benar-benar terproteksi saat runtime, dan `/admin` tidak punya gate login. Ini pekerjaan terpisah yang sudah diketahui. Jangan asumsikan proteksi sudah berjalan saat menulis fitur.

---

## Larangan

- Jangan mengubah aturan permainan (dadu, tangga, giliran, timer, kondisi menang) tanpa persetujuan lead.
- Jangan menambah backend di luar Firebase.
- Jangan memanggil Firebase SDK langsung dari komponen.
- Jangan hardcode path route, URL Cloudinary, atau path database di komponen.
- Jangan mengembangkan dashboard admin legacy.
- Jangan commit `.env.local` atau kredensial apa pun.
- Jangan menambah fitur sosial baru (pertemanan, leaderboard global) — di luar cakupan.

---

## Sebelum Selesai

1. `npm run lint` bersih.
2. `npm run build` tidak rusak.
3. Uji alur terdampak di browser secara nyata — bukan hanya memastikan kode ter-compile.
4. Hapus `console.log` dan kode mati.
5. Perbarui `TASK.md` jika ada pekerjaan yang selesai.
