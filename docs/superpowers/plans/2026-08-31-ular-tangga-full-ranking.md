# Ular Tangga Full-Ranking Finish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ular Tangga keeps playing until every player (human or bot) reaches square 100, producing a full 1st–4th ranking with rank-based rewards, instead of ending the instant the first player finishes. Also bump `PauseModal`'s size.

**Architecture:** Track finish order as a new `finishedOrder: string[]` array on the Firestore `gameState` document. Win branches append to it instead of ending the game outright; the game only flips to `gameStatus: 'finished'` once everyone is in it. `nextTurn` skips already-finished players when advancing. The UI swaps the old binary `WinModal` for NusaCard's already-generic `RankModal` (relocated to `src/components/game-shared/` since it's now used by two features), fed by `finishedOrder`.

**Tech Stack:** Next.js App Router, TypeScript strict, Firestore (`firebase/firestore` `updateDoc`/`getDoc`), React hooks (no test runner configured in this repo — verification is `npx tsc --noEmit` + `npx eslint` + manual browser play-through, matching this project's established practice).

## Global Constraints

- TypeScript strict, no `any` (CLAUDE.md rule 1).
- No hardcoded routes/Cloudinary URLs (rules 4–5) — not applicable to this change, no new routes/assets.
- 300-line file limit (rule 6) — check touched files don't blow past it after edits.
- No leftover `console.log` (rule 8).
- One implementation per need (rule 9) — this is exactly why `RankModal` moves to shared instead of being duplicated.
- `checkAndFinalizeSoleSurvivor` (disconnect-abandonment scenario) is explicitly **not** touched — it must keep ending the game immediately when real players vanish, independent of this ranking work.
- Every step below is verified with `npx tsc --noEmit` and `npx eslint <touched files>` — both must stay at 0 errors (pre-existing warnings unrelated to the change are fine, do not fix unrelated ones).

---

### Task 1: Service — track `finishedOrder` instead of ending on first finish

**Files:**
- Modify: `src/features/game-ular-tangga/services/ular-tangga-game.service.ts`
  - `UlarTanggaGameState` interface (~line 60-97)
  - `initializeUlarTanggaGameState` (~line 330-384)
  - `movePawn`'s win branch (~line 611-624)
  - `submitAnswer`'s win branch (~line 704-737)

**Interfaces:**
- Produces: `UlarTanggaGameState.finishedOrder: string[]` (new field, always present after init — UIDs in the order they reached square 100, index 0 = 1st place). A private helper `appendFinisher(state, finishingUID)` returning `{ finishedOrder: string[]; isGameOver: boolean }` — used by both `movePawn` and `submitAnswer`, not exported.

- [ ] **Step 1: Add `finishedOrder` to the state type**

In `src/features/game-ular-tangga/services/ular-tangga-game.service.ts`, find:
```ts
export interface UlarTanggaGameState {
  currentPlayerIndex: number;
  currentPlayerUID?: string;
  lastTurnChangeAt?: number;
  playerUIDs: string[];
  pionPositions: number[];
```
Change to:
```ts
export interface UlarTanggaGameState {
  currentPlayerIndex: number;
  currentPlayerUID?: string;
  lastTurnChangeAt?: number;
  playerUIDs: string[];
  /** UID yang udah nyampe kotak 100, berurutan (index 0 = juara 1). Game
      cuma `gameStatus: 'finished'` begitu semua playerUIDs udah masuk sini
      — bukan lagi begitu SATU pemain nyampe duluan (lihat `appendFinisher`). */
  finishedOrder: string[];
  pionPositions: number[];
```

- [ ] **Step 2: Seed `finishedOrder: []` on game init**

Find in `initializeUlarTanggaGameState`:
```ts
  const initialState: UlarTanggaGameState = {
    currentPlayerIndex: 0,
    currentPlayerUID: players[0]?.uid,
    lastTurnChangeAt: Date.now(),
    playerUIDs: players.map((p) => p.uid),
    pionPositions: players.map(() => 0),
```
Change to:
```ts
  const initialState: UlarTanggaGameState = {
    currentPlayerIndex: 0,
    currentPlayerUID: players[0]?.uid,
    lastTurnChangeAt: Date.now(),
    playerUIDs: players.map((p) => p.uid),
    finishedOrder: [],
    pionPositions: players.map(() => 0),
```

- [ ] **Step 3: Add the shared `appendFinisher` helper**

Add this function directly above `export async function movePawn(` (which starts the section using it):
```ts
/**
 * Satu pemain nyampe kotak 100 — dicatet di `finishedOrder`, TAPI game
 * cuma beneran `gameStatus: 'finished'` kalau SEMUA pemain udah masuk
 * situ (aturan ular tangga beneran: main sampe semua kelar, bukan
 * berhenti begitu satu orang menang). Kalau abis nambahin pemain ini
 * cuma NYISA 1 pemain yang belum finish, dia juga langsung dianggap
 * "selesai" di posisi terakhir — gak ada gunanya biarin dia lempar dadu
 * sendirian sampe kotak 100 (pola sama kayak NusaCard's throwCard).
 */
function appendFinisher(
  state: UlarTanggaGameState,
  finishingUID: string,
): { finishedOrder: string[]; isGameOver: boolean } {
  const prior = state.finishedOrder ?? [];
  if (prior.includes(finishingUID)) {
    return { finishedOrder: prior, isGameOver: prior.length === state.playerUIDs.length };
  }
  const finishedOrder = [...prior, finishingUID];
  const remaining = state.playerUIDs.filter((uid) => !finishedOrder.includes(uid));
  const finalOrder = remaining.length === 1 ? [...finishedOrder, remaining[0]] : finishedOrder;
  return { finishedOrder: finalOrder, isGameOver: finalOrder.length === state.playerUIDs.length };
}
```

- [ ] **Step 4: Rewrite `movePawn`'s win branch**

Find:
```ts
  // Menang: pion sampai pas kotak 100.
  if (newPosition === 100) {
    await updateDoc(ref, {
      pionPositions: positions,
      isMoving: false,
      gameStatus: 'finished',
      gameWinnerUID: state.playerUIDs[playerIndex],
      gameWonAt: Date.now(),
      lastUpdated: Date.now(),
      lastActionAt: Date.now(),
    });
    await reopenRoom(roomID);
    return newPosition;
  }
```
Replace with:
```ts
  // Nyampe kotak 100 — dicatet di finishedOrder, game cuma bener-bener
  // kelar begitu SEMUA pemain udah finish (lihat appendFinisher).
  if (newPosition === 100) {
    const { finishedOrder, isGameOver } = appendFinisher(state, state.playerUIDs[playerIndex]);
    await updateDoc(ref, {
      pionPositions: positions,
      isMoving: false,
      finishedOrder,
      gameWinnerUID: finishedOrder[0],
      ...(isGameOver ? { gameStatus: 'finished', gameWonAt: Date.now() } : {}),
      lastUpdated: Date.now(),
      lastActionAt: Date.now(),
    });
    if (isGameOver) await reopenRoom(roomID);
    return newPosition;
  }
```

- [ ] **Step 5: Rewrite `submitAnswer`'s win branch**

Find:
```ts
  const isWin = isCorrect && positions[actorIndex] >= 100;
  if (isWin) {
    updates.gameStatus = 'finished';
    updates.gameWinnerUID = state.playerUIDs[actorIndex];
    updates.gameWonAt = Date.now();
  }

  await updateDoc(ref, updates);
  if (isWin) await reopenRoom(roomID);

  return isCorrect;
```
Replace with:
```ts
  const reachedEnd = isCorrect && positions[actorIndex] >= 100;
  let isGameOver = false;
  if (reachedEnd) {
    const result = appendFinisher(state, state.playerUIDs[actorIndex]);
    updates.finishedOrder = result.finishedOrder;
    updates.gameWinnerUID = result.finishedOrder[0];
    isGameOver = result.isGameOver;
    if (isGameOver) {
      updates.gameStatus = 'finished';
      updates.gameWonAt = Date.now();
    }
  }

  await updateDoc(ref, updates);
  if (isGameOver) await reopenRoom(roomID);

  return isCorrect;
```

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit`
Expected: no errors (in particular, no "Property 'finishedOrder' is missing" anywhere — if it shows up, some other spot constructs a raw `UlarTanggaGameState` literal that also needs the field; search with `grep -n "UlarTanggaGameState = {" src/features/game-ular-tangga/services/ular-tangga-game.service.ts` and add `finishedOrder: []` there too).

Run: `npx eslint src/features/game-ular-tangga/services/ular-tangga-game.service.ts`
Expected: same warnings as before this task (no new ones).

- [ ] **Step 7: Commit**

```bash
git add src/features/game-ular-tangga/services/ular-tangga-game.service.ts
git commit -m "feat: lacak finishedOrder, jangan langsung tamat pas satu pemain menang"
```

---

### Task 2: Service — `nextTurn` skips finished players

**Files:**
- Modify: `src/features/game-ular-tangga/services/ular-tangga-game.service.ts` — `nextTurn` (~line 739-793)

**Interfaces:**
- Consumes: `UlarTanggaGameState.finishedOrder` (Task 1).
- Produces: same `nextTurn(topicID, gameID, roomID): Promise<void>` signature — no callers need to change.

- [ ] **Step 1: Rewrite `nextTurn`**

Find the whole function:
```ts
export async function nextTurn(
  topicID: string,
  gameID: string,
  roomID: string,
): Promise<void> {
  const ref = gameStateDocRef(roomID);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return;

  const state = snapshot.data() as UlarTanggaGameState;
  const playerCount = state.pionPositions.length;

  // Dadu 6: pemain yang sama lempar lagi, giliran (index/UID) gak pindah.
  // turnCounter TETAP dinaikin di sini juga — dipakai halaman play sebagai
  // sinyal "ronde lempar baru dimulai" buat reset guard anti-double-roll bot
  // (lastBotTurnRef). Kalau gak dinaikin, bot yang dapet extra roll gak akan
  // pernah lempar lagi karena guard-nya gak pernah ke-reset.
  if (state.allowExtraRoll) {
    await updateDoc(ref, {
      lastTurnChangeAt: Date.now(),
      turnCounter: (state.turnCounter ?? 0) + 1,
      diceState: { isRolling: false, currentNumber: 0, lastRoll: null },
      waitingForAnswer: false,
      showQuestion: false,
      isCorrect: null,
      selectedAnswerIndex: null,
      allowExtraRoll: false,
      currentQuestionIndex: 0,
      questionShownAt: null,
      lastUpdated: Date.now(),
      lastActionAt: Date.now(),
    });
    return;
  }

  const nextIndex = (state.currentPlayerIndex + 1) % playerCount;
  const nextUID = state.playerUIDs?.[nextIndex];

  await updateDoc(ref, {
    currentPlayerIndex: nextIndex,
    currentPlayerUID: nextUID ?? null,
    lastTurnChangeAt: Date.now(),
    turnCounter: (state.turnCounter ?? 0) + 1,
    diceState: { isRolling: false, currentNumber: 0, lastRoll: null },
    waitingForAnswer: false,
    showQuestion: false,
    isCorrect: null,
    selectedAnswerIndex: null,
    allowExtraRoll: false,
    currentQuestionIndex: 0,
    questionShownAt: null,
    lastUpdated: Date.now(),
    lastActionAt: Date.now(),
  });
}
```
Replace with:
```ts
export async function nextTurn(
  topicID: string,
  gameID: string,
  roomID: string,
): Promise<void> {
  const ref = gameStateDocRef(roomID);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return;

  const state = snapshot.data() as UlarTanggaGameState;
  const finishedOrder = state.finishedOrder ?? [];
  const currentUID = state.playerUIDs[state.currentPlayerIndex];
  const currentIsFinished = finishedOrder.includes(currentUID);

  // Dadu 6: pemain yang sama lempar lagi, giliran (index/UID) gak pindah.
  // turnCounter TETAP dinaikin di sini juga — dipakai halaman play sebagai
  // sinyal "ronde lempar baru dimulai" buat reset guard anti-double-roll bot
  // (lastBotTurnRef). Kalau gak dinaikin, bot yang dapet extra roll gak akan
  // pernah lempar lagi karena guard-nya gak pernah ke-reset.
  //
  // KECUALI kalau pemain ini BARUSAN finish di giliran yang sama (misal
  // jawab bener naik tangga sampe kotak 100, dan sebelumnya emang lagi
  // dapet extra-roll dari dadu 6) — pemain yang udah finish gak boleh
  // dapet giliran lagi, langsung lanjut ke logika skip di bawah.
  if (state.allowExtraRoll && !currentIsFinished) {
    await updateDoc(ref, {
      lastTurnChangeAt: Date.now(),
      turnCounter: (state.turnCounter ?? 0) + 1,
      diceState: { isRolling: false, currentNumber: 0, lastRoll: null },
      waitingForAnswer: false,
      showQuestion: false,
      isCorrect: null,
      selectedAnswerIndex: null,
      allowExtraRoll: false,
      currentQuestionIndex: 0,
      questionShownAt: null,
      lastUpdated: Date.now(),
      lastActionAt: Date.now(),
    });
    return;
  }

  // Muter di antara pemain yang BELUM finish doang — pemain yang udah
  // nyampe kotak 100 dilewatin selamanya buat sisa game ini.
  const activeUIDs = state.playerUIDs.filter((uid) => !finishedOrder.includes(uid));
  let nextIndex = state.currentPlayerIndex;
  let nextUID: string | undefined;
  if (activeUIDs.length > 0) {
    const afterIdx = activeUIDs.indexOf(currentUID);
    nextUID = afterIdx === -1 ? activeUIDs[0] : activeUIDs[(afterIdx + 1) % activeUIDs.length];
    nextIndex = state.playerUIDs.indexOf(nextUID);
  }

  await updateDoc(ref, {
    currentPlayerIndex: nextIndex,
    currentPlayerUID: nextUID ?? null,
    lastTurnChangeAt: Date.now(),
    turnCounter: (state.turnCounter ?? 0) + 1,
    diceState: { isRolling: false, currentNumber: 0, lastRoll: null },
    waitingForAnswer: false,
    showQuestion: false,
    isCorrect: null,
    selectedAnswerIndex: null,
    allowExtraRoll: false,
    currentQuestionIndex: 0,
    questionShownAt: null,
    lastUpdated: Date.now(),
    lastActionAt: Date.now(),
  });
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit && npx eslint src/features/game-ular-tangga/services/ular-tangga-game.service.ts`
Expected: 0 errors, no new warnings.

- [ ] **Step 3: Commit**

```bash
git add src/features/game-ular-tangga/services/ular-tangga-game.service.ts
git commit -m "feat: nextTurn lewatin pemain yang udah finish"
```

---

### Task 3: Page — always advance the turn after a win (not just when nobody won)

**Files:**
- Modify: `src/app/(protected)/play/[gameID]/[topicID]/[roomID]/ular-tangga/page.tsx` — `handleDiceRollComplete` (~line 310-338)

**Interfaces:**
- Consumes: `movePawn` (unchanged signature — still returns `Promise<number>`), `nextTurn` (Task 2, unchanged signature).

Context: previously, reaching square 100 (`finalPos >= 100`) meant "game over, never call nextTurn." Now it just means "this player is done" — the game may still be going for the others, so `nextTurn()` must still run (it'll correctly skip the just-finished player, per Task 2). If the game truly ended (everyone finished), calling `nextTurn()` is harmless — nothing reads `currentPlayerIndex` once `gameStatus !== 'playing'`.

- [ ] **Step 1: Remove the `isWin` short-circuit**

Find:
```ts
    // movePawn returns final position (after snake slide if any)
    const finalPos = await movePawn(topicID, gameID, roomKey, gameState.currentPlayerIndex, rolledNumber);
    const isWin = finalPos >= 100;
    const hitSnake = !isEnteringRoll && isSnakeHead(rawPos);
    const needsQuestion = !isEnteringRoll && !hitSnake && isLadderStart(rawPos) && (gameState.questions?.length ?? 0) > 0;
    if (!isWin && !needsQuestion) {
      await nextTurn(topicID, gameID, roomKey);
    }
  }
```
Replace with:
```ts
    // movePawn returns final position (after snake slide if any) — kalau
    // finalPos>=100 pemain ini FINISH, tapi game belum tentu kelar (lihat
    // appendFinisher di service) jadi giliran tetep harus lanjut ke pemain
    // berikutnya; nextTurn() sendiri yang bakal ngelewatin pemain yg abis
    // finish. Satu-satunya alasan SKIP nextTurn() di sini adalah lagi
    // nunggu jawaban soal tangga (needsQuestion) — itu nextTurn()-nya
    // dipanggil belakangan dari handleSelectAnswer.
    await movePawn(topicID, gameID, roomKey, gameState.currentPlayerIndex, rolledNumber);
    const hitSnake = !isEnteringRoll && isSnakeHead(rawPos);
    const needsQuestion = !isEnteringRoll && !hitSnake && isLadderStart(rawPos) && (gameState.questions?.length ?? 0) > 0;
    if (!needsQuestion) {
      await nextTurn(topicID, gameID, roomKey);
    }
  }
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors (confirms `finalPos`/`isWin` weren't referenced anywhere else in the file — they weren't, per prior grep, but tsc will catch it if this plan is stale).

Run: `npx eslint "src/app/(protected)/play/[gameID]/[topicID]/[roomID]/ular-tangga/page.tsx"`
Expected: no new warnings (specifically no new `no-unused-vars` — confirms `isWin`/`finalPos` removal didn't leave orphaned references).

- [ ] **Step 3: Commit**

```bash
git add "src/app/(protected)/play/[gameID]/[topicID]/[roomID]/ular-tangga/page.tsx"
git commit -m "fix: lanjutin giliran walau pemain barusan finish"
```

---

### Task 4: Page — rank-based rewards and stats (every player, not just the winner)

**Files:**
- Modify: `src/app/(protected)/play/[gameID]/[topicID]/[roomID]/ular-tangga/page.tsx` — the reward/stats effects (~line 238-268) and the `winnerUID`/`winnerName` computed values (~line 207-211)

**Interfaces:**
- Consumes: `claimGameReward(roomID: string, uid: string, rank: 1 | 2 | 3): Promise<GameReward | null>` and `recordMatchOutcome(roomID: string, uid: string, won: boolean, durationMs?: number): Promise<void>` (both already exist, unchanged, in `src/services/firebase/firestore/users.service.ts`) — mirrors exactly how `src/app/(protected)/play/[gameID]/[topicID]/[roomID]/nusa-card/page.tsx` already does this (lines 359-379 there), for the same reason (rank-based, not winner-only).
- Produces: nothing new consumed by other tasks — this task's `rankedPlayers` value IS consumed by Task 6, so define it here.

- [ ] **Step 1: Replace `winnerUID`/`winnerName` with rank-aware values**

Find:
```ts
  const winnerUID = gameState?.gameWinnerUID;
  const winnerName = winnerUID
    ? (orderedPlayers.find((p) => p.uid === winnerUID) ?? players.find((p) => p.uid === winnerUID))?.displayName
      ?? 'Pemain'
    : '';
```
Replace with:
```ts
  const winnerUID = gameState?.gameWinnerUID;
  // Dipake buat RankModal (Task 6) — finishedOrder KOSONG selama game masih
  // jalan, cuma keisi lengkap begitu gameStatus 'finished'.
  const rankedPlayers = React.useMemo(() => {
    if (!gameState) return [];
    return (gameState.finishedOrder ?? []).map((uid) => {
      const p = orderedPlayers.find((pl) => pl.uid === uid) ?? players.find((pl) => pl.uid === uid);
      return { uid, name: p?.displayName || p?.name || 'Pemain', photoURL: p?.photoURL };
    });
  }, [gameState, orderedPlayers, players]);
```

- [ ] **Step 2: Replace the winner-only reward effect with a rank-based one**

Find:
```ts
  const [myReward, setMyReward] = useState<GameReward | null>(null);
  useEffect(() => {
    if (!gameState || gameState.gameStatus !== 'finished' || !myUID) return;
    if (winnerUID !== myUID) return;
    if (gameState.rewardsClaimedBy?.includes(myUID)) return;
    void claimGameReward(roomKey, myUID, 1).then((reward) => {
      if (reward) setMyReward(reward);
    });
  }, [gameState, myUID, winnerUID, roomKey]);

  // Win-streak/achievement — jalan buat SEMUA pemain (menang atau kalah),
  // beda dari reward di atas yang cuma buat pemenang.
  useEffect(() => {
    if (!gameState || gameState.gameStatus !== 'finished' || !myUID) return;
    if (gameState.statsRecordedBy?.includes(myUID)) return;
    const won = winnerUID === myUID;
    const durationMs = won && gameState.gameWonAt ? gameState.gameWonAt - gameState.gameCreatedAt : undefined;
    void recordMatchOutcome(roomKey, myUID, won, durationMs);
  }, [gameState, myUID, winnerUID, roomKey]);
```
Replace with:
```ts
  const [myReward, setMyReward] = useState<GameReward | null>(null);
  useEffect(() => {
    if (!gameState || gameState.gameStatus !== 'finished' || !myUID) return;
    const rank = (gameState.finishedOrder ?? []).indexOf(myUID) + 1;
    if (rank < 1 || rank > 3) return;
    if (gameState.rewardsClaimedBy?.includes(myUID)) return;
    void claimGameReward(roomKey, myUID, rank as 1 | 2 | 3).then((reward) => {
      if (reward) setMyReward(reward);
    });
  }, [gameState, myUID, roomKey]);

  // Win-streak/achievement — jalan buat SEMUA pemain (peringkat berapapun),
  // beda dari reward di atas yang cuma buat rank 1-3.
  useEffect(() => {
    if (!gameState || gameState.gameStatus !== 'finished' || !myUID) return;
    if (gameState.statsRecordedBy?.includes(myUID)) return;
    const rank = (gameState.finishedOrder ?? []).indexOf(myUID) + 1;
    const won = rank === 1;
    const durationMs = won && gameState.gameWonAt ? gameState.gameWonAt - gameState.gameCreatedAt : undefined;
    void recordMatchOutcome(roomKey, myUID, won, durationMs);
  }, [gameState, myUID, roomKey]);
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: no errors. `winnerUID` stays declared (still used later for `isMe` in Task 6) — confirm no "declared but never read" once Task 6 lands; if `tsc`/`eslint` flags it as unused before Task 6 is done, that's expected and resolves once Task 6 wires it in — don't chase it mid-task.

Run: `npx eslint "src/app/(protected)/play/[gameID]/[topicID]/[roomID]/ular-tangga/page.tsx"`
Expected: same pre-existing warnings; a transient "winnerUID unused" warning here is fine, Task 6 consumes it.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(protected)/play/[gameID]/[topicID]/[roomID]/ular-tangga/page.tsx"
git commit -m "feat: reward & stats berbasis rank, bukan cuma pemenang"
```

---

### Task 5: Move `RankModal` to shared, update NusaCard's import

**Files:**
- Create: `src/components/game-shared/RankModal.tsx` (moved content)
- Delete: `src/features/game-nuca/components/RankModal.tsx`
- Modify: `src/app/(protected)/play/[gameID]/[topicID]/[roomID]/nusa-card/page.tsx` (import path only)

**Interfaces:**
- Produces: `RankModal` default export, `RankedPlayer` named export — same props as before (`isOpen`, `rankedPlayers: RankedPlayer[]`, `myUID`, `myReward?`, `onContinue`, `onPlayAgain?`), now importable from `@/src/components/game-shared/RankModal`. Consumed by Task 6.

- [ ] **Step 1: Read the current file to move**

Run: `cat "/mnt/IMPORTANTE/natah/nusaquest-v2/src/features/game-nuca/components/RankModal.tsx"`

- [ ] **Step 2: Create the shared copy with adjusted import depth**

Create `src/components/game-shared/RankModal.tsx` with the exact same content as the file read in Step 1, EXCEPT the four import lines at the top change from 3 levels up to 2 (the new location is one directory shallower: `components/game-shared/` vs `features/game-nuca/components/`):
```ts
import { information } from "../../assets/images/information/cloudinaryAssets";
import { badge, attribut } from "../../assets/images/badge/cloudinaryAssets";
import { nuca } from "../../assets/images/nuca/cloudinaryAssets";
import type { GameReward } from "../../services/firebase/firestore/users.service";
```
(replacing the original `"../../../assets/..."` / `"../../../services/..."` lines). Everything else in the file — the `RankedPlayer` interface, `RankModalProps`, the whole component body, the `<style>` block — is copied verbatim, unchanged.

- [ ] **Step 3: Delete the old file**

```bash
rm "/mnt/IMPORTANTE/natah/nusaquest-v2/src/features/game-nuca/components/RankModal.tsx"
```

- [ ] **Step 4: Update NusaCard's import**

In `src/app/(protected)/play/[gameID]/[topicID]/[roomID]/nusa-card/page.tsx`, find:
```ts
import RankModal from "../../../../../../../features/game-nuca/components/RankModal";
```
Replace with:
```ts
import RankModal from "../../../../../../../components/game-shared/RankModal";
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit`
Expected: no errors — confirms the relative-path math in Step 4 is correct and no other file still imports the deleted path.

Run: `grep -rn "game-nuca/components/RankModal" /mnt/IMPORTANTE/natah/nusaquest-v2/src`
Expected: no matches (confirms no stale importer left).

Run: `npx eslint "src/app/(protected)/play/[gameID]/[topicID]/[roomID]/nusa-card/page.tsx" src/components/game-shared/RankModal.tsx`
Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add -A src/components/game-shared/RankModal.tsx src/features/game-nuca/components/RankModal.tsx "src/app/(protected)/play/[gameID]/[topicID]/[roomID]/nusa-card/page.tsx"
git commit -m "refactor: pindahin RankModal ke game-shared, dipake 2 game"
```

---

### Task 6: Page — wire the shared `RankModal` into Ular Tangga

**Files:**
- Modify: `src/app/(protected)/play/[gameID]/[topicID]/[roomID]/ular-tangga/page.tsx`

**Interfaces:**
- Consumes: `RankModal` + `RankedPlayer` from `@/src/components/game-shared/RankModal` (Task 5), `rankedPlayers` (Task 4).

Note: `src/app/(protected)/play/[gameID]/[topicID]/[roomID]/ular-tangga-vs-ai/page.tsx` (the separate legacy dedicated route, out of scope per the spec) still imports `WinModal` — **do not delete** `src/features/game-ular-tangga/components/WinModal.tsx`, only stop using it in the room-based page below.

- [ ] **Step 1: Swap the import**

Find:
```ts
import WinModal from '@/src/features/game-ular-tangga/components/WinModal';
```
Replace with:
```ts
import RankModal from '@/src/components/game-shared/RankModal';
```

- [ ] **Step 2: Replace the `<WinModal>` render with `<RankModal>`**

Find:
```tsx
        {/* Win Modal — menang normal (kotak 100) atau menang karena tinggal
            satu pemain aktif, keduanya lewat gameStatus==='finished'. */}
        <WinModal
          isOpen={gameState?.gameStatus === 'finished'}
          winnerName={winnerName}
          isMe={!!myUID && winnerUID === myUID}
          myReward={myReward}
          onContinue={() => router.push(`/lobby/${topicID}/${gameID}`)}
          onPlayAgain={() => router.push(roomPath)}
        />
```
Replace with:
```tsx
        {/* Rank Modal — game kelar begitu SEMUA pemain finish (lihat
            finishedOrder/appendFinisher di service), bukan lagi begitu
            satu pemain menang duluan. Shared sama NusaCard. */}
        <RankModal
          isOpen={gameState?.gameStatus === 'finished'}
          rankedPlayers={rankedPlayers}
          myUID={myUID ?? null}
          myReward={myReward}
          onContinue={() => router.push(`/lobby/${topicID}/${gameID}`)}
          onPlayAgain={() => router.push(roomPath)}
        />
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: no errors — this also confirms `winnerUID` (kept from Task 4) is no longer needed here; if TypeScript flags it as unused now, remove the `const winnerUID = gameState?.gameWinnerUID;` line too (grep first: `grep -n "winnerUID" "src/app/(protected)/play/[gameID]/[topicID]/[roomID]/ular-tangga/page.tsx"` — if the only remaining use was the deleted `isMe` prop, delete the declaration).

Run: `npx eslint "src/app/(protected)/play/[gameID]/[topicID]/[roomID]/ular-tangga/page.tsx"`
Expected: back to the same pre-existing warning set as before Task 4 (no unused-var warnings for `winnerUID`/`winnerName`).

- [ ] **Step 4: Manual browser verification (this is the feature's real test — no unit test runner in this repo)**

1. Ensure the dev server is running (`npm run dev` if not already up).
2. As host, open an Ular Tangga room, add 2 bots (3 total: you + 2 bots).
3. Start the game, play until one bot reaches square 100.
   - Expected: the game does **not** end. The board keeps going; the finished bot no longer gets turns (dice never rolls for it again).
4. Keep playing until a second player (bot or you) finishes.
   - Expected: still not ended, only the last remaining player keeps playing solo — but per Task 1 Step 3's `appendFinisher` auto-finish rule, the moment only 1 player is left un-finished, the game should immediately end with that player placed last, WITHOUT making them roll alone. Confirm this happens rather than a lone dice-rolling endgame.
5. Confirm the `RankModal` popup appears with all 3 players in finish order (1st/2nd/3rd), correct badges (gold/silver/bronze), and — if you placed 1st, 2nd, or 3rd — the reward line showing your badge (+potion if 1st).
6. Check your profile page afterward to confirm badge/potion counts actually incremented per your rank.
7. Start a fresh 2-player game (no bots, or 1 bot) and confirm it still plays start-to-finish and shows a 2-row ranking at the end (not a crash or blank modal).
8. Confirm the separate `/play/.../ular-tangga-vs-ai` legacy route (if reachable in the app) still loads without errors — it still uses the old `WinModal`, untouched.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(protected)/play/[gameID]/[topicID]/[roomID]/ular-tangga/page.tsx"
git commit -m "feat: pakai RankModal di Ular Tangga, main sampe semua finish"
```

---

### Task 7: `PauseModal` — enlarge

**Files:**
- Modify: `src/components/layout/PauseModal.tsx`

**Interfaces:** none (leaf UI component, props unchanged).

Context: the whole modal is one image (`board_paused`) with content positioned by percentage over it, inside a `max-w-[500px]` container — bumping that one number scales everything proportionally. Same for the exit-confirmation sub-view's `max-w-[380px]`.

- [ ] **Step 1: Enlarge both containers**

Find:
```tsx
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="relative w-[90%] max-w-[500px] flex items-center justify-center">
                {/* ---Konfirmasi Exit--- */}
                {showExitConfirm ? (
                    <div className="relative w-[80%] max-w-[380px] animate-in zoom-in duration-300 ease-out">
```
Replace with:
```tsx
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="relative w-[90%] max-w-[640px] flex items-center justify-center">
                {/* ---Konfirmasi Exit--- */}
                {showExitConfirm ? (
                    <div className="relative w-[80%] max-w-[480px] animate-in zoom-in duration-300 ease-out">
```

- [ ] **Step 2: Verify**

Run: `npx eslint src/components/layout/PauseModal.tsx`
Expected: 0 errors.

Manual: open any in-progress game, click the top-right settings/gear button, confirm the pause popup is noticeably larger and still centered/legible on a narrow (mobile-width) viewport (resize the browser window or use devtools device toolbar).

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/PauseModal.tsx
git commit -m "style: gedein ukuran popup pengaturan (PauseModal)"
```

---

## Self-Review Notes (already applied above)

- **Spec coverage:** finishedOrder tracking ✓ (Task 1), skip-finished turn advance ✓ (Task 2), page-side turn continuation ✓ (Task 3), rank-based rewards ✓ (Task 4), RankModal→shared ✓ (Task 5), Ular Tangga wired to RankModal ✓ (Task 6), sole-survivor untouched ✓ (not modified anywhere above), PauseModal enlarge ✓ (Task 7).
- **Type consistency:** `appendFinisher` (Task 1) return shape `{ finishedOrder: string[]; isGameOver: boolean }` is consumed identically in both its call sites (movePawn, submitAnswer) in the same task — no drift. `RankedPlayer`/`RankModal` props (Task 5) are consumed with the exact same field names in Task 6 (`rankedPlayers`, `myUID`, `myReward`, `onContinue`, `onPlayAgain`) matching NusaCard's existing usage.
- **No placeholders:** every step has literal before/after code or an exact shell command with expected output.
