# NusaQuest Firebase Firestore Schema

## Overview
Clean, scalable schema untuk NusaQuest dengan multi-region, multi-game support, AI-generated questions, dan admin management.

---

## Collections Breakdown

### 1. `maps` (Top-level)
**Purpose:** Menyimpan 5 kategori/tema game

```
maps/
├── {mapId}
│   ├── name: string (e.g., "Kuliner Tradisional", "Sejarah", etc)
│   ├── icon: string (emoji or URL)
│   ├── description: string
│   ├── order: number (untuk sorting)
│   ├── isActive: boolean
│   └── createdAt: timestamp
```

**Example:**
```json
{
  "mapId": "map_kuliner",
  "name": "🍜 Kuliner Tradisional",
  "icon": "🍜",
  "description": "Jelajahi cita rasa khas Indonesia",
  "order": 1,
  "isActive": true,
  "createdAt": 1715338800000
}
```

---

### 2. `regions` (Top-level)
**Purpose:** Menyimpan 15+ provinsi/daerah (UNIVERSAL untuk semua maps)

```
regions/
├── {regionId}
│   ├── name: string (e.g., "Jawa Barat", "Sumatera Utara")
│   ├── code: string (e.g., "jw", "su" - untuk URL friendly)
│   ├── description: string
│   ├── isActive: boolean
│   └── createdAt: timestamp
```

**Example:**
```json
{
  "regionId": "region_jw",
  "name": "Jawa Barat",
  "code": "jw",
  "description": "Kaya akan kuliner tradisional",
  "isActive": true,
  "createdAt": 1715338800000
}
```

---

### 3. `questions` (Top-level)
**Purpose:** Menyimpan semua soal untuk semua maps & regions

```
questions/
├── {questionId}
│   ├── regionId: string (foreign key to regions)
│   ├── mapId: string (foreign key to maps)
│   ├── text: string (soal nya)
│   ├── options: array<string> (4 opsi jawaban)
│   ├── correctIndex: number (index jawaban benar, 0-3)
│   ├── difficulty: string ("easy") // reserved untuk future
│   ├── isActive: boolean
│   ├── isApproved: boolean (admin review status)
│   ├── generatedBy: string ("ai" | "manual")
│   ├── createdAt: timestamp
│   ├── approvedAt: timestamp (null jika belum diapprove)
│   └── approvedBy: string (uid admin yang approve)
```

**Example:**
```json
{
  "questionId": "q_kuliner_jw_001",
  "regionId": "region_jw",
  "mapId": "map_kuliner",
  "text": "Makanan tradisional Jawa Barat yang terbuat dari tepung ketan adalah?",
  "options": [
    "Dodol",
    "Martabak",
    "Colenak",
    "Oncom"
  ],
  "correctIndex": 0,
  "difficulty": "easy",
  "isActive": true,
  "isApproved": true,
  "generatedBy": "ai",
  "createdAt": 1715338800000,
  "approvedAt": 1715338900000,
  "approvedBy": "uid_admin_1"
}
```

---

### 4. `users` (Top-level)
**Purpose:** Menyimpan data user profile & achievement stats

```
users/
├── {userId} (uid dari Firebase Auth)
│   ├── email: string
│   ├── displayName: string
│   ├── photoURL: string
│   ├── totalPoints: number (accumulative)
│   ├── totalGamesPlayed: number
│   ├── totalWins: number
│   ├── lastLoginAt: timestamp
│   ├── createdAt: timestamp
│   ├── inventory: map<string, number> (item_id -> count)
│   └── achievements: map<string, object> (achievement_id -> {unlockedAt, progress})
```

**Example:**
```json
{
  "userId": "uid_user_123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "photoURL": "https://...",
  "totalPoints": 5000,
  "totalGamesPlayed": 45,
  "totalWins": 20,
  "lastLoginAt": 1715338800000,
  "createdAt": 1715000000000,
  "inventory": {
    "potion_hint": 5,
    "potion_freeze": 3
  },
  "achievements": {
    "ach_first_win": {
      "unlockedAt": 1715100000000,
      "progress": 1
    }
  }
}
```

---

### 5. `rooms` (Top-level)
**Purpose:** Menyimpan room game untuk multiplayer sessions

```
rooms/
├── {roomId} (auto-generated)
│   ├── gameType: string ("ular-tangga" | "nusa-card")
│   ├── mapId: string
│   ├── regionId: string
│   ├── maxPlayers: number (4 untuk multiplayer, 1 untuk vs AI)
│   ├── currentPlayers: number
│   ├── status: string ("waiting" | "playing" | "finished")
│   ├── players: map<userId, {
│   │   ├── joinedAt: timestamp
│   │   ├── role: string ("host" | "player" | "ai")
│   │   ├── isActive: boolean (false jika eliminated)
│   │   └── finalPosition: number (null jika masih main)
│   │ }>
│   ├── createdAt: timestamp
│   ├── startedAt: timestamp (null jika belum start)
│   ├── finishedAt: timestamp (null jika belum selesai)
│   └── totalQuestionsUsed: number
```

**Example:**
```json
{
  "roomId": "room_123abc",
  "gameType": "ular-tangga",
  "mapId": "map_kuliner",
  "regionId": "region_jw",
  "maxPlayers": 4,
  "currentPlayers": 3,
  "status": "playing",
  "players": {
    "uid_user_1": {
      "joinedAt": 1715338800000,
      "role": "host",
      "isActive": true,
      "finalPosition": null
    },
    "uid_user_2": {
      "joinedAt": 1715338810000,
      "role": "player",
      "isActive": true,
      "finalPosition": null
    },
    "uid_user_3": {
      "joinedAt": 1715338820000,
      "role": "player",
      "isActive": false,
      "finalPosition": 2
    }
  },
  "createdAt": 1715338800000,
  "startedAt": 1715338900000,
  "finishedAt": null,
  "totalQuestionsUsed": 15
}
```

---

### 6. `gameStates` (Top-level)
**Purpose:** Real-time state game selama permainan berlangsung

```
gameStates/
├── {roomId} (sama dengan room id)
│   ├── currentPlayerIndex: number
│   ├── round: number
│   ├── turnStartedAt: timestamp
│   ├── playerStates: map<userId, {
│   │   ├── score: number
│   │   ├── position: number (untuk ular tangga)
│   │   ├── correctAnswers: number
│   │   ├── wrongAnswers: number
│   │   ├── isWaiting: boolean
│   │   └── lastAction: timestamp
│   │ }>
│   ├── questionsUsed: array<questionId>
│   ├── winner: string (userId, null jika belum ada)
│   └── updatedAt: timestamp
```

**Example:**
```json
{
  "roomId": "room_123abc",
  "currentPlayerIndex": 0,
  "round": 5,
  "turnStartedAt": 1715338950000,
  "playerStates": {
    "uid_user_1": {
      "score": 300,
      "position": 15,
      "correctAnswers": 10,
      "wrongAnswers": 2,
      "isWaiting": false,
      "lastAction": 1715338950000
    }
  },
  "questionsUsed": ["q_1", "q_2", "q_3"],
  "winner": null,
  "updatedAt": 1715338950000
}
```

---

### 7. `gameResults` (Top-level)
**Purpose:** Menyimpan hasil akhir setiap game untuk statistics & history

```
gameResults/
├── {resultId} (auto-generated)
│   ├── roomId: string
│   ├── gameType: string
│   ├── mapId: string
│   ├── regionId: string
│   ├── finalRanking: array<{
│   │   ├── userId: string
│   │   ├── position: number
│   │   ├── score: number
│   │   ├── correctAnswers: number
│   │   └── pointsEarned: number
│   │ }>
│   ├── totalDuration: number (dalam detik)
│   ├── totalQuestionsUsed: number
│   ├── createdAt: timestamp
│   └── winner: string (userId)
```

**Example:**
```json
{
  "resultId": "result_xyz789",
  "roomId": "room_123abc",
  "gameType": "ular-tangga",
  "mapId": "map_kuliner",
  "regionId": "region_jw",
  "finalRanking": [
    {
      "userId": "uid_user_1",
      "position": 1,
      "score": 350,
      "correctAnswers": 12,
      "pointsEarned": 100
    },
    {
      "userId": "uid_user_2",
      "position": 2,
      "score": 280,
      "correctAnswers": 9,
      "pointsEarned": 50
    }
  ],
  "totalDuration": 600,
  "totalQuestionsUsed": 15,
  "createdAt": 1715339500000,
  "winner": "uid_user_1"
}
```

---

### 8. `admin-logs` (Top-level, Optional)
**Purpose:** Audit trail untuk admin actions

```
admin-logs/
├── {logId} (auto-generated)
│   ├── adminUid: string
│   ├── action: string ("create_question" | "approve_question" | "delete_question" | "add_region" | etc)
│   ├── targetType: string ("question" | "region" | "map")
│   ├── targetId: string
│   ├── details: map<string, any>
│   └── createdAt: timestamp
```

---

## Collections Summary Table

| Collection | Purpose | Key Fields | Notes |
|-----------|---------|-----------|-------|
| `maps` | 5 kategori game | name, icon, order | Hardcoded 5, expand via data |
| `regions` | 15+ daerah/provinsi (UNIVERSAL) | name, code, description | Expandable via admin; shared across all maps |
| `questions` | Semua soal | text, options, correctIndex, isApproved | AI-generated, admin review |
| `users` | User profile & stats | email, displayName, totalPoints | Per Google Auth uid |
| `rooms` | Multiplayer sessions | gameType, players, status | Real-time updates |
| `gameStates` | Live game state | currentPlayerIndex, playerStates | Real-time, deleted after game |
| `gameResults` | Game history & stats | finalRanking, winner | For leaderboard & analytics |
| `admin-logs` | Audit trail | action, targetId | Optional, untuk tracking |

---

## Key Design Decisions

### ✅ Separation of Concerns
- `maps` & `regions` terpisah = fleksibel untuk multi-map per region
- `questions` standalone = reusable across multiple game instances
- `gameStates` terpisah dari `gameResults` = state real-time vs historical data

### ✅ Real-time Optimization
- `gameStates` di-listener real-time untuk sync multiplayer
- `gameResults` disimpan setelah game selesai untuk analytics
- `rooms` track player status untuk elimination logic

### ✅ Admin Verification Flow
- `questions` punya field `isApproved` & `approvedBy`
- AI generate → Admin verify → Publish
- Safe for content quality

### ✅ Player Elimination
- `players[userId].isActive` = false saat eliminate
- Game continues jika ada player lain dengan `isActive: true`
- `finalPosition` record urutan eliminasi

### ✅ Scalability
- Regions expandable tanpa perlu schema change
- Questions unlimited (50 starting point)
- Multiple maps supported dari awal

---

## Firestore Rules Skeleton
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public reads
    match /maps/{mapId} {
      allow read: if true;
    }
    match /regions/{regionId} {
      allow read: if true;
    }
    
    // User data
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    
    // Admin only
    match /questions/{questionId} {
      allow read: if true;
      allow write: if isAdmin(request.auth.uid);
    }
    match /admin-logs/{logId} {
      allow write: if isAdmin(request.auth.uid);
    }
    
    // Game rooms
    match /rooms/{roomId} {
      allow read: if resource.data.players[request.auth.uid] != null;
      allow write: if canModifyRoom(roomId, request.auth.uid);
    }
    match /gameStates/{roomId} {
      allow read, write: if resource.data.players[request.auth.uid] != null;
    }
    match /gameResults/{resultId} {
      allow read, write: if true; // akan di-restrict ke creator only nanti
    }
  }
  
  function isAdmin(uid) {
    return uid in ['admin_uid_1', 'admin_uid_2']; // whitelist
  }
  
  function canModifyRoom(roomId, uid) {
    return get(/databases/$(database)/documents/rooms/$(roomId)).data.players[uid] != null;
  }
}
```

---

---

## 🚀 STEP-BY-STEP: Cara Create Collections di Firestore (LENGKAP)

### Prerequisites
- Buka Firebase Console: https://console.firebase.google.com
- Pilih project NusaQuest Anda
- Klik **Firestore Database** di sidebar kiri

---

### STEP 1: Buat Collection `maps`

1. **Klik tombol "+ Start collection"** (jika pertama kali) atau **"+ Collection"**
2. **Masukkan nama collection:** `maps`
3. **Klik Next**
4. **Add your first document** dengan ID: `map_kuliner`
5. **Klik "Start collection"**
6. Kemudian isikan fields berikut (klik **Add field** untuk setiap field):

| Field Name | Type | Value |
|-----------|------|-------|
| `mapId` | String | `map_kuliner` |
| `name` | String | `🍜 Kuliner Tradisional` |
| `icon` | String | `🍜` |
| `description` | String | `Jelajahi cita rasa khas Indonesia` |
| `order` | Number | `1` |
| `isActive` | Boolean | `true` |
| `createdAt` | Number | `1715338800000` |

**Atau copy-paste JSON:**
```json
{
  "mapId": "map_kuliner",
  "name": "🍜 Kuliner Tradisional",
  "icon": "🍜",
  "description": "Jelajahi cita rasa khas Indonesia",
  "order": 1,
  "isActive": true,
  "createdAt": 1715338800000
}
```

7. **Klik Save**

---

### STEP 2: Tambah 4 Documents Lagi di Collection `maps`

Sekarang di dalam collection `maps`, klik **"+ Add document"** 4x untuk tambah:

#### Document 2: map_sejarah
```json
{
  "mapId": "map_sejarah",
  "name": "🏛️ Sejarah",
  "icon": "🏛️",
  "description": "Pelajari sejarah dan warisan Indonesia",
  "order": 2,
  "isActive": true,
  "createdAt": 1715338800000
}
```
**ID Document:** `map_sejarah`

#### Document 3: map_budaya
```json
{
  "mapId": "map_budaya",
  "name": "🎭 Seni Budaya",
  "icon": "🎭",
  "description": "Temukan kesenian dan budaya lokal",
  "order": 3,
  "isActive": true,
  "createdAt": 1715338800000
}
```
**ID Document:** `map_budaya`

#### Document 4: map_wisata
```json
{
  "mapId": "map_wisata",
  "name": "🏝️ Destinasi Wisata",
  "icon": "🏝️",
  "description": "Jelajahi keindahan alam Indonesia",
  "order": 4,
  "isActive": true,
  "createdAt": 1715338800000
}
```
**ID Document:** `map_wisata`

#### Document 5: map_pahlawan
```json
{
  "mapId": "map_pahlawan",
  "name": "🎖️ Pahlawan & Tokoh",
  "icon": "🎖️",
  "description": "Kenali tokoh-tokoh terkenal Indonesia",
  "order": 5,
  "isActive": true,
  "createdAt": 1715338800000
}
```
**ID Document:** `map_pahlawan`

---

### STEP 3: Buat Collection `regions`

1. **Klik "+ Collection"** di sidebar atau di root Firestore
2. **Nama collection:** `regions`
3. **Klik Next**
4. **Add first document dengan ID:** `region_jw`
5. **Isikan fields:**

```json
{
  "regionId": "region_jw",
  "name": "Jawa Barat",
  "code": "jw",
  "description": "Kaya akan kuliner tradisional",
  "isActive": true,
  "createdAt": 1715338800000
}
```

> **PENTING:** Tidak ada `mapId` di collection `regions`! Setiap region berlaku untuk SEMUA 5 maps. Linking antara map dan region dilakukan melalui questions collection.

6. **Klik Save**

**Tambah 14 regions lagi dengan data berikut:**

| regionId | name | code | description | isActive | createdAt |
|----------|------|------|-------------|----------|-----------|
| region_jt | Jawa Timur | jt | Provinsi di Jawa bagian timur | true | 1715338800000 |
| region_jc | Jawa Tengah | jc | Provinsi di Jawa bagian tengah | true | 1715338800000 |
| region_su | Sumatera Utara | su | Provinsi di Sumatera bagian utara | true | 1715338800000 |
| region_ss | Sumatera Selatan | ss | Provinsi di Sumatera bagian selatan | true | 1715338800000 |
| region_kalbar | Kalimantan Barat | kalbar | Provinsi di Kalimantan bagian barat | true | 1715338800000 |
| region_kaltim | Kalimantan Timur | kaltim | Provinsi di Kalimantan bagian timur | true | 1715338800000 |
| region_sul | Sulawesi | sul | Provinsi di pulau Sulawesi | true | 1715338800000 |
| region_bali | Bali | bali | Provinsi pulau Bali | true | 1715338800000 |
| region_ntt | Nusa Tenggara Timur | ntt | Provinsi di Nusa Tenggara bagian timur | true | 1715338800000 |
| region_papua | Papua | papua | Provinsi di Indonesia bagian timur | true | 1715338800000 |
| region_yogya | Yogyakarta | yogya | Daerah Istimewa Yogyakarta | true | 1715338800000 |
| region_lampung | Lampung | lampung | Provinsi di ujung selatan Sumatera | true | 1715338800000 |
| region_riau | Riau | riau | Provinsi di Sumatera tengah | true | 1715338800000 |
| region_ntb | Nusa Tenggara Barat | ntb | Provinsi di Nusa Tenggara bagian barat | true | 1715338800000 |

**Cara cepat: Copy-paste JSON untuk setiap region**

Contoh untuk region_jt:
```json
{
  "regionId": "region_jt",
  "name": "Jawa Timur",
  "code": "jt",
  "description": "Kaya akan kuliner tradisional",
  "isActive": true,
  "createdAt": 1715338800000
}
```

> **PENTING:** Tidak ada `mapId` di regions! Setiap region berlaku untuk SEMUA 5 maps. Linking antara map dan region dilakukan melalui questions collection.

---

### STEP 4: Buat Collection `questions` (Empty dulu)

1. **Klik "+ Collection"**
2. **Nama:** `questions`
3. **Klik Next**
4. **Untuk document pertama, kasih ID:** `temp_placeholder` (bisa di-delete nanti)
5. **Isikan minimal 1 field (misal `createdAt: 0`)** supaya collection ter-create
6. **Klik Save**

> Kita nanti akan populate questions via admin panel atau manual data import

---

### STEP 5: Buat Collection `users` (Empty)

Sama seperti STEP 4:
1. **Klik "+ Collection"**
2. **Nama:** `users`
3. **Klik Next**
4. **Document ID:** `temp_placeholder`
5. **Field:** `createdAt: 0`
6. **Klik Save**

---

### STEP 6: Buat Collection `rooms` (Empty)

1. **Klik "+ Collection"**
2. **Nama:** `rooms`
3. **Klik Next**
4. **Document ID:** `temp_placeholder`
5. **Field:** `createdAt: 0`
6. **Klik Save**

---

### STEP 7: Buat Collection `gameStates` (Empty)

1. **Klik "+ Collection"**
2. **Nama:** `gameStates`
3. **Klik Next**
4. **Document ID:** `temp_placeholder`
5. **Field:** `createdAt: 0`
6. **Klik Save**

---

### STEP 8: Buat Collection `gameResults` (Empty)

1. **Klik "+ Collection"**
2. **Nama:** `gameResults`
3. **Klik Next**
4. **Document ID:** `temp_placeholder`
5. **Field:** `createdAt: 0`
6. **Klik Save**

---

### STEP 9: Buat Collection `admin-logs` (Empty - Optional)

1. **Klik "+ Collection"**
2. **Nama:** `admin-logs`
3. **Klik Next**
4. **Document ID:** `temp_placeholder`
5. **Field:** `createdAt: 0`
6. **Klik Save**

---

### FINAL: Delete Placeholder Documents

Setelah semua collection ter-create, **delete semua `temp_placeholder` documents**:
1. Buka setiap collection
2. Hover di `temp_placeholder`
3. Klik 3-dot menu → Delete document
4. Confirm

---

## ✅ Checklist Create Collections

- [ ] ✅ Collection `maps` dengan 5 documents
- [ ] ✅ Collection `regions` dengan 15 documents
- [ ] ✅ Collection `questions` (empty)
- [ ] ✅ Collection `users` (empty)
- [ ] ✅ Collection `rooms` (empty)
- [ ] ✅ Collection `gameStates` (empty)
- [ ] ✅ Collection `gameResults` (empty)
- [ ] ✅ Collection `admin-logs` (empty, optional)
- [ ] ✅ Delete semua placeholder documents

---

## 🔍 Verify: Cek struktur sudah benar

Buka Firestore Database, verifikasi:
```
Firestore Database
├── maps (5 documents)
│   ├── map_kuliner
│   ├── map_sejarah
│   ├── map_budaya
│   ├── map_wisata
│   └── map_pahlawan
├── regions (15 documents)
│   ├── region_jw
│   ├── region_jt
│   ├── ... (13 lagi)
│   └── region_ntb
├── questions (0 documents)
├── users (0 documents)
├── rooms (0 documents)
├── gameStates (0 documents)
├── gameResults (0 documents)
└── admin-logs (0 documents)
```

---

## Next Steps
1. ✅ Review schema dengan team
2. ✅ Create Firestore collections & indexes (LANGKAH DI ATAS)
3. Setup TypeScript types based on schema
4. Create service layer untuk CRUD operations
5. Setup Realtime listeners untuk gameStates & rooms
6. Build admin panel untuk manage questions & regions
7. Implement AI question generation API
