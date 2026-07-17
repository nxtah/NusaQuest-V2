# Firestore Schema — NusaQuest V2

## Collections Overview

```
users/{uid}                          ← already exists
questions/{questionId}               ← NEW
informationItems/{auto-id}           ← already exists
destinations/{id}                    ← NEW
rooms/{roomId}                       ← NEW (was RTDB)
gameStates/{roomId}                  ← NEW (was RTDB)
gameResults/{resultId}               ← NEW
rooms/{roomId}/messages/{messageId}  ← NEW (subcollection for chat)
```

---

## 1. users/{uid}

PII document — owner-only read.

| Field | Type | Constraints |
|---|---|---|
| uid | string | immutable, matches auth.uid |
| email | string | max 254 chars, valid email format |
| displayName | string | 1-50 chars |
| photoURL | string | optional, valid URL, max 500 chars |
| role | string | 'user' or 'admin' — immutable after create for non-admin |
| totalPoints | number | >= 0 |
| totalGamesPlayed | number | >= 0 |
| totalWins | number | >= 0 |
| lastLoginAt | timestamp | |
| createdAt | timestamp | immutable |
| inventory | map<string, number> | item_id → count |
| achievements | map<string, Achievement> | achievement_id → { unlockedAt, progress } |

---

## 2. questions/{questionId}

| Field | Type | Constraints |
|---|---|---|
| questionId | string | auto-ID |
| text | string | 10-500 chars |
| options | array<string> | exactly 4, each 1-200 chars |
| correctIndex | number | 0, 1, 2, or 3 |
| topic | string | uppercase, e.g. 'DAERAH', 'KULINER' |
| mapId | string | reference to game map |
| regionId | string | optional reference to region |
| difficulty | string | 'easy' (reserved for future) |
| isActive | boolean | |
| isApproved | boolean | admin review status |
| generatedBy | string | 'ai' or 'manual' |
| createdAt | timestamp | immutable |
| approvedAt | timestamp | optional |
| approvedBy | string | optional, admin uid |

---

## 3. informationItems/{auto-id}

Already exists. Fields:

| Field | Type |
|---|---|
| tab | string |
| sectionTitle | string |
| title | string |
| description | string |
| imageUrl | string |
| order | number |
| createdAt | timestamp |
| updatedAt | timestamp |

Valid tabs: 'Daerah', 'Kuliner', 'Bahari', 'Pariwisata Darat', 'Permainan Daerah'

---

## 4. destinations/{id}

| Field | Type | Constraints |
|---|---|---|
| id | string | auto-ID |
| nama | string | 1-100 chars |
| provinsi | string | 1-50 chars |
| deskripsi | string | optional, max 2000 chars |
| latitude | number | optional |
| longitude | number | optional |
| type | string | optional, e.g. 'kota', 'wisata' |
| image | string | optional, URL |
| createdAt | timestamp | immutable |
| updatedAt | timestamp | |

---

## 5. rooms/{roomId}

**Single document** — NOT nested by topic/game anymore.
Real-time via `onSnapshot`.

| Field | Type | Constraints |
|---|---|---|
| roomId | string | auto-ID |
| gameType | string | 'ular-tangga' or 'nusa-card' |
| mapId | string | game map reference |
| regionId | string | region/province reference |
| gameMode | string | 'multiplayer' or 'vs-ai' |
| maxPlayers | number | 2-4 (multiplayer) or 1 (vs-ai) |
| currentPlayers | number | 0-4 |
| status | string | 'waiting' | 'playing' | 'finished' |
| gameStarted | boolean | |
| gameStateId | string | optional, reference to gameStates/{roomId} |
| hostId | string | uid of the host |
| players | map<string, RoomPlayer> | uid → player info |
| createdAt | timestamp | immutable |
| startedAt | timestamp | optional |
| finishedAt | timestamp | optional |
| lastActivityAt | timestamp | for cleanup |

### RoomPlayer (within players map)

| Field | Type | Constraints |
|---|---|---|
| name | string | 1-50 chars |
| photoURL | string | optional |
| role | string | 'host' | 'player' | 'ai' |
| isActive | boolean | |
| joinedAt | timestamp | |

---

## 6. gameStates/{roomId}

**Real-time document** — updated frequently during gameplay.
Separate from room to avoid write contention on the room doc.

### Common Fields (both game types)

| Field | Type | Constraints |
|---|---|---|
| roomId | string | |
| gameType | string | 'ular-tangga' or 'nusa-card' |
| currentPlayerIndex | number | >= 0 |
| currentPlayerUID | string | uid of current turn player |
| gameStatus | string | 'playing' | 'finished' | 'abandoned' |
| turnCounter | number | increments each turn |
| lastTurnChangeAt | timestamp | |
| questionIds | array<string> | shuffled question IDs (not full questions) |
| currentQuestionIndex | number | index into questionIds |
| gameWinnerUID | string | optional |
| gameWinnerDisplayName | string | optional |
| gameWonAt | timestamp | optional |
| updatedAt | timestamp | |

### Ular Tangga — Specific Fields

| Field | Type | Constraints |
|---|---|---|
| pionPositions | array<number> | position per player index, 0-100 |
| diceState | DiceState | see below |
| isMoving | boolean | |
| showQuestion | boolean | |
| waitingForAnswer | boolean | |
| isCorrect | boolean | nullable |
| selectedAnswerIndex | number | nullable |
| allowExtraRoll | boolean | true if dice == 6 |
| playerActivity | map<string, PlayerActivity> | uid → activity |

### Nusa Card — Specific Fields

| Field | Type |
|---|---|
| currentQuestionIndex | number |
| lastActionByUID | string (nullable) |
| turnPhase | string |

### DiceState

```typescript
{
  isRolling: boolean,
  currentNumber: number,
  lastRoll: number | null,
  rollingPlayerId: string | undefined
}
```

### PlayerActivity

```typescript
{
  lastActivity: number, // timestamp
  isActive: boolean,
  playerIndex: number
}
```

---

## 7. rooms/{roomId}/messages/{messageId}

**Subcollection** — independent writes, real-time via onSnapshot on the subcollection.

| Field | Type | Constraints |
|---|---|---|
| uid | string | sender uid |
| displayName | string | sender name |
| text | string | 1-500 chars |
| createdAt | timestamp | |

---

## 8. gameResults/{resultId}

Written once when game finishes. For stats/history.

| Field | Type |
|---|---|
| roomId | string |
| gameType | string |
| mapId | string |
| regionId | string |
| gameMode | string |
| createdAt | timestamp |
| winner | string (userId) |
| totalDuration | number (seconds) |
| totalQuestionsUsed | number |
| finalRanking | array\<PlayerResult\> |
| players | array\<{ uid, displayName, photoURL }\> |

### PlayerResult

```typescript
{
  userId: string,
  displayName: string,
  position: number,
  score: number,
  correctAnswers: number,
  pointsEarned: number
}
```

---

## Security Rules Principle

- `users/{uid}` → owner only (contains PII)
- `questions` → admin write, authenticated read for game
- `informationItems` → public read, admin write
- `destinations` → public read, admin write
- `rooms/{roomId}` → authenticated users who are in the room
- `gameStates/{roomId}` → authenticated users in that room
- `rooms/{roomId}/messages/{messageId}` → authenticated users in that room
- `gameResults/{resultId}` → authenticated users who were in the game

---

## Required Firestore Indexes

1. `questions` composite: `topic` ASC + `isActive` ASC (for game fetch)
2. `questions` composite: `mapId` ASC + `regionId` ASC (for admin filtering)
3. `rooms` composite: `gameType` ASC + `status` ASC + `mapId` ASC + `regionId` ASC (for lobby list)
4. `informationItems` composite: `tab` ASC + `order` ASC (for information page)
5. `destinations` single: `type` ASC (for filtering)
6. `gameResults` composite: `roomId` ASC (for game history)
