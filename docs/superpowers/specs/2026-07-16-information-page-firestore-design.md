# Information Page — Firestore-backed Content — Design

Status: Approved.

## Goal

Replace the hardcoded `dummyDatabase` powering the public `/information` page (and its `[id]` detail routes) with real Firestore data the admin can manage. Repurpose the existing admin sidebar "Informasi" menu (currently an unused Tutorial/FAQ CRUD, RTDB-backed, no public consumer) rather than adding a second, confusing "Informasi"-named menu.

## Data shape

New Firestore collection `informationItems`, flat (not nested subcollections — matches the existing admin table pattern of one flat collection + client-side grouping):

```ts
interface InformationItem {
  id?: string;
  tab: 'Daerah' | 'Kuliner' | 'Bahari' | 'Pariwisata Darat' | 'Permainan Daerah';
  sectionTitle: string;   // e.g. "Perkotaan & Industri" — groups cards into a row
  title: string;          // e.g. "Kota Bandung" — card title + detail page title
  description: string;    // shown on the detail page
  imageUrl: string;       // Cloudinary link only, admin-provided, no upload
  order: number;          // sort within its (tab, sectionTitle) group
  createdAt: number;
  updatedAt: number;
}
```

Grouping into rows happens client/server-side by `(tab, sectionTitle)` — a new `sectionTitle` value is how a new row appears; no separate "manage sections" step.

## Architecture

- `src/services/firebase/firestore/base.service.ts` — extend with `getCollectionDocs<T>(path)`, `addDocument<T>(path, payload)`, `deleteDocument(path, id)` (existing file only had get/set/update-by-id).
- `src/services/firebase/firestore/information.service.ts` — new. `getAllInformationItems()`, `getInformationItemsByTab(tab)`, `getInformationItem(id)`, `createInformationItem()`, `updateInformationItem()`, `deleteInformationItem()`.
- `src/features/admin-v2/components/InformasiTable.tsx` — content replaced (not the menu label, not the file location): Tab select (5 fixed values), Section Title, Item Title, Description, Image URL. Client-side validation requires the URL to actually be a `cloudinary.com` link before submit.
- `src/app/(public)/information/page.tsx`, `[id]/page.tsx`, `[id]/detail/page.tsx` — `dummyDatabase` deleted, replaced with real Firestore reads via `information.service.ts`. Visual design (fonts, card frame, popup frame) stays exactly as-is — only the data source changes.
- Card grid — `flex flex-wrap` → CSS grid, max 6 columns, auto-wraps to a new row past 6 items, responsive fewer columns on narrow viewports.
- `firestore.rules` — add `informationItems`: public read, open write. Documented tradeoff: the admin panel is a hardcoded password with no real Firebase Auth behind it, so rules can't distinguish "the admin" from anyone else — same trust level the existing RTDB-backed admin tables already have (no rules file for RTDB exists either). Not a new regression, but flagged explicitly rather than silently assumed secure.

## Explicitly out of scope

- No dynamic tab management (the 5 tabs stay a fixed list, matching `NavBar.tsx`'s existing hardcoded categories).
- No real admin authentication / Firebase-Auth-backed authorization for Firestore writes (separate, larger effort).
- No changes to the existing RTDB `informasi` node or its service file (`admin.informasi.service.ts`) — left in place, just no longer wired to the UI. Not deleted, since removing it is a separate cleanup decision.
- No re-upload/hosting of images — admin must paste an existing Cloudinary URL.
