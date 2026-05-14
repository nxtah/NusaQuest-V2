# NusaQuest - Manual Setup & Next Steps

## ✅ Phase 1 Complete: TypeScript Types

I've created comprehensive TypeScript types for your entire application based on the Firestore schema:

### Files Created/Updated:
1. **Global Types** (`src/types/`)
   - `firestore.ts` - Core domain types (Map, Region, Question, User, Room, GameState, GameResult, AdminLog)
   - `auth.ts` - Authentication types
   - `game.ts` - Game-specific types
   - `question.ts` - Question display types
   - `room.ts` - Room management types
   - `user.ts` - User profile & stats types

2. **Feature-Specific Types** (`src/features/*/types.ts`)
   - `destination/types.ts` - Map selection flow
   - `admin/types.ts` - Admin dashboard & management
   - `lobby/types.ts` - Multiplayer lobbies
   - `game-ular-tangga/types.ts` - Ular Tangga game specifics
   - `game-nuca/types.ts` - Nusa Card game specifics
   - `achievements/types.ts` - Achievements with predefined list
   - `inventory/types.ts` - Potions & items system

---

## 🔧 Phase 2: Manual Setup Tasks (YOU MUST DO THESE)

### 1. **Firestore Collections Setup**
   
   **Location:** Firebase Console → Firestore Database
   
   **Collections to Create (8 total):**
   - [ ] `maps` - Create with sample document
   - [ ] `regions` - Create empty
   - [ ] `questions` - Create empty
   - [ ] `users` - Create empty
   - [ ] `rooms` - Create empty
   - [ ] `gameStates` - Create empty
   - [ ] `gameResults` - Create empty
   - [ ] `admin-logs` - Create empty (optional)

   **Initial Data for `maps` collection:**
   Add these 5 documents manually:
   
   ```json
   // Document: map_kuliner
   {
     "mapId": "map_kuliner",
     "name": "🍜 Kuliner Tradisional",
     "icon": "🍜",
     "description": "Jelajahi cita rasa khas Indonesia",
     "order": 1,
     "isActive": true,
     "createdAt": (current timestamp)
   }
   
   // Document: map_sejarah
   {
     "mapId": "map_sejarah",
     "name": "🏛️ Sejarah",
     "icon": "🏛️",
     "description": "Pelajari sejarah dan warisan Indonesia",
     "order": 2,
     "isActive": true,
     "createdAt": (current timestamp)
   }
   
   // Document: map_budaya
   {
     "mapId": "map_budaya",
     "name": "🎭 Seni Budaya",
     "icon": "🎭",
     "description": "Temukan kesenian dan budaya lokal",
     "order": 3,
     "isActive": true,
     "createdAt": (current timestamp)
   }
   
   // Document: map_wisata
   {
     "mapId": "map_wisata",
     "name": "🏝️ Destinasi Wisata",
     "icon": "🏝️",
     "description": "Jelajahi keindahan alam Indonesia",
     "order": 4,
     "isActive": true,
     "createdAt": (current timestamp)
   }
   
   // Document: map_pahlawan
   {
     "mapId": "map_pahlawan",
     "name": "🎖️ Pahlawan & Tokoh",
     "icon": "🎖️",
     "description": "Kenali tokoh-tokoh terkenal Indonesia",
     "order": 5,
     "isActive": true,
     "createdAt": (current timestamp)
   }
   ```

### 2. **Admin Whitelist Setup**

   **Location:** You need to decide WHERE to store admin emails
   
   **Options:**
   - Option A: Create `admin-config` collection with 1 document
   - Option B: Create `admins` collection with documents per admin
   - Option C: Store in a `.env.local` file as environment variable
   
   **Recommendation:** Option A (cleanest)
   
   Create collection `admin-config`:
   ```json
   // Document: settings
   {
     "allowedEmails": [
       "your-email@gmail.com",
       "other-admin@gmail.com"
     ],
     "updatedAt": (current timestamp)
   }
   ```

### 3. **Firebase Authentication Setup**

   **Location:** Firebase Console → Authentication
   
   - [ ] Enable Google Sign-in
   - [ ] Add your test email(s) to authorized users (if in testing mode)
   - [ ] Get your Firebase config and ensure `.env.local` is set up

### 4. **Environment Variables**

   **File:** `.env.local` (create if not exists)
   
   Add these Firebase config:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
   NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
   
   # Admin whitelist (if choosing Option C above)
   # NEXT_PUBLIC_ADMIN_EMAILS=your-email@gmail.com,other-admin@gmail.com
   
   # AI API (for question generation - choose one)
   OPENAI_API_KEY=YOUR_OPENAI_KEY
   # or
   GROQ_API_KEY=YOUR_GROQ_KEY
   # or
   ANTHROPIC_API_KEY=YOUR_ANTHROPIC_KEY
   ```

### 5. **Firebase Indexes (for complex queries)**

   **Location:** Firebase Console → Firestore Database → Indexes
   
   Create these composite indexes:
   - [ ] Collection: `questions`, Fields: `mapId` (Asc), `regionId` (Asc), `isApproved` (Asc)
   - [ ] Collection: `questions`, Fields: `regionId` (Asc), `isApproved` (Asc)
   - [ ] Collection: `gameResults`, Fields: `mapId` (Asc), `createdAt` (Desc)

### 6. **Firestore Security Rules**

   **Location:** Firebase Console → Firestore Database → Rules
   
   Replace with proper rules (see FIREBASE_SCHEMA.md for skeleton)

### 7. **Initial Admin Regions (optional - can do via admin panel later)**

   Add sample regions to `regions` collection:
   ```json
   {
     "regionId": "region_jw",
     "name": "Jawa Barat",
     "mapId": "map_kuliner",
     "code": "jw",
     "description": "Kaya akan kuliner tradisional",
     "isActive": true,
     "createdAt": (current timestamp)
   }
   // ... repeat for other provinces
   ```

---

## 📝 Phase 3: What I'll Create Next

Once you complete manual setup, I'll create:

### Service Layer (CRUD Operations)
- `src/features/*/services/*.service.ts`
  - `maps.service.ts` - Fetch maps
  - `regions.service.ts` - CRUD regions
  - `questions.service.ts` - CRUD questions + AI generation
  - `users.service.ts` - User profile operations
  - `rooms.service.ts` - Room management
  - `gameStates.service.ts` - Real-time game state
  - `gameResults.service.ts` - Game history
  - Auth service improvements
  - Achievements service
  - Inventory service

### Setup Files
- `src/lib/firebase/firebase-client.ts` - Firebase initialization
- `src/lib/firebase/firebase-admin.ts` - Admin SDK (for server-side)
- `src/lib/firebase/firestore.ts` - Firestore client
- `src/lib/firebase/auth.ts` - Auth utilities

### Constants & Configs
- `src/lib/constants/admin-config.ts` - Admin emails
- `src/lib/constants/firestore-paths.ts` - Collection paths
- `src/lib/constants/maps-config.ts` - Maps data

---

## ✋ IMPORTANT: What You Need to Know

### Before I Can Proceed:

1. **Firebase Project ID** - What's your Firebase project ID?
2. **AI API Choice** - Which AI service do you prefer for question generation?
   - OpenAI? (Paid, $0.002/request approx)
   - Groq? (Free)
   - Anthropic? (Paid)
3. **Admin Whitelist** - Where to store admin emails? (Firestore collection or .env)
4. **Test Data** - Should I create seed data script for initial regions & questions?

### What Will NOT Work Yet:

- ❌ Authentication (not connected to Firestore)
- ❌ Game logic (services not implemented)
- ❌ Admin panel (services missing)
- ❌ Real-time multiplayer (listeners not setup)
- ❌ AI question generation (no API integration)

---

## 🚀 Checklist to Complete Setup

- [ ] Read FIREBASE_SCHEMA.md thoroughly
- [ ] Create 8 Firestore collections
- [ ] Add 5 maps to `maps` collection
- [ ] Setup admin whitelist (choose storage method)
- [ ] Create .env.local with Firebase config
- [ ] Enable Google Auth in Firebase Console
- [ ] Create necessary Firestore indexes
- [ ] (Optional) Add initial regions data
- [ ] Decide on AI service for question generation
- [ ] Answer 4 questions above

---

## 📞 Next Steps After Setup

Once you complete the manual setup:
1. Confirm Firebase collections are created
2. Tell me the answers to 4 questions above
3. I'll start creating the **Service Layer** (Phase 2 coding)
4. Then we'll build **Admin Panel** (Phase 3)
5. Finally integrate everything into **existing pages** (Phase 4)

---

Keep this file handy! We'll update it as we progress through the phases.
