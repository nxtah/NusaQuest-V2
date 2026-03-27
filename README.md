# NusaQuest V2

NusaQuest V2 adalah migrasi arsitektur dari proyek legacy ke stack modern Next.js + TypeScript, dengan Firebase Realtime Database dan Firebase Storage.

## Commands

```bash
npm run dev
npm run lint
npm run build
```

## Firebase Migration Commands

```bash
# Dry run backfill (tidak menulis data)
npm run rtdb:backfill:dry

# Backfill data legacy -> struktur baru
npm run rtdb:backfill

# Parity check read/write/update/delete pada RTDB
npm run rtdb:parity
```

## Important Files

- `database.rules.json`:
	baseline Firebase RTDB rules production.
- `scripts/rtdb-backfill.mjs`:
	script migrasi/backfill data legacy ke struktur baru.
- `scripts/rtdb-parity-check.mjs`:
	verifikasi operasi CRUD dasar end-to-end pada RTDB.
- `src/app/api/admin/users/role/route.ts`:
	endpoint internal admin untuk audit + update role custom claims.

## Environment

Isi `.env.local` berdasarkan `.env.example` untuk:

1. Firebase client env (`NEXT_PUBLIC_FIREBASE_*`)
2. Firebase Admin env (`FIREBASE_ADMIN_*`)
3. Cloudinary server/client env

## Migration Notes

Panduan operasional lengkap ada di `docs/FIREBASE_MIGRATION_RUNBOOK.md`.
