# Ular Tangga: play until everyone finishes, full ranking

## Context

Ular Tangga currently ends the game the instant any single player reaches square 100 — binary win/lose, no 2nd/3rd/4th place. This was intentional at the time (comment in the codebase: "Ular Tangga menang-kalah doang, gak ada peringkat 2/3 — bukan bug, emang aturan mainnya gitu"). While live-testing the vs-AI bot feature with 3 bots, the user found this jarring: a bot finishing first ends the whole game immediately, when classic snakes-and-ladders continues until every player has finished, producing a full ranking. The user (project owner) wants this changed, superseding the earlier rule.

NusaCard already solved an equivalent problem: it has a generic `RankModal` component (1st–4th place, badges, reward reveal) and `claimGameReward(roomKey, uid, rank)` already accepts a rank (1→gold, 2→silver, 3→bronze, 4th+ nothing). This spec reuses that infrastructure rather than inventing a parallel one.

## Scope

Applies to **all** Ular Tangga rooms (multiplayer and vs-AI alike) — they share one engine, so there's no clean way to special-case vs-AI without forking logic that must be kept in sync.

Also bundled in (not part of the ranking work, but same session, trivial, no design needed): enlarge `PauseModal`'s container size — it's a single `max-w-[500px]` percentage-based layout over one image, so bumping that one value scales everything.

## Design

### Data model — `UlarTanggaGameState` (`ular-tangga-game.service.ts`)

Add `finishOrder: string[]` — UIDs in the order they reached square 100. A player is "finished" iff their UID is in this array. Initialize to `[]` in `initializeUlarTanggaGameState`.

### Win branches — `movePawn` and `submitAnswer`

Both currently do, on reaching square 100:
```ts
gameStatus: 'finished',
gameWinnerUID: state.playerUIDs[actorIndex],
gameWonAt: Date.now(),
```
This changes to: append the finishing UID to `finishOrder` (dedupe-safe — a player can only finish once). Only when `finishOrder.length` (after the append) equals `state.playerUIDs.length` does the write additionally set `gameStatus: 'finished'` and `gameWonAt: Date.now()`. `gameWinnerUID` stays as `finishOrder[0]` for backward compatibility with anything still reading it, but the page's UI switches to reading `finishOrder` for the full ranking.

A player who just finished no longer participates in turns — handled entirely by the turn-advance change below, not by any special-case here.

### Turn advance — `nextTurn`

The modulo-increment (`(state.currentPlayerIndex + 1) % playerCount`) changes to loop forward until it lands on a `playerUIDs[i]` not present in `finishOrder`. If every remaining candidate is finished (shouldn't happen mid-game since the win-branch above would have already ended the game once the last one finishes, but guarded defensively), leave `currentPlayerIndex` unchanged.

The existing "roll a 6 → extra roll" (`allowExtraRoll`) branch is unaffected — it only ever re-grants a turn to the *current* (by definition not-yet-finished) player.

### Abandonment stays separate — `checkAndFinalizeSoleSurvivor`

Not touched. That function handles "everyone else disconnected," a different scenario from "everyone raced to the finish" — it should keep ending the game immediately for whoever's left online, not wait for stale/offline players to somehow finish.

### Rewards — `page.tsx` win-effect

Currently calls `claimGameReward(roomKey, myUID, 1)` unconditionally when `winnerUID === myUID`. Changes to fire once `gameStatus === 'finished'`, for every player (not just the winner), each computing their own rank via `gameState.finishOrder.indexOf(myUID) + 1` and passing that to `claimGameReward`. Ranks 4+ naturally get no reward (existing `RANK_BADGE` map behavior, unchanged).

### UI — replace `WinModal` with a shared `RankModal`

`src/features/game-nuca/components/RankModal.tsx` has no NusaCard-specific content (generic `RankedPlayer[]`, `myReward`, callbacks) — move it to `src/components/game-shared/RankModal.tsx` per this repo's convention (used by 2+ features → shared, one implementation). Update NusaCard's import to the new path. Ular Tangga's `page.tsx` drops `WinModal` entirely and renders the shared `RankModal`, building `rankedPlayers` from `gameState.finishOrder` mapped through `orderedPlayers`/`players` for name/photo. `ular-tangga/components/WinModal.tsx` is deleted (no other consumers — verify via grep before deleting).

2-player games (1 human + 1 bot, or 2 real players) render as a 2-row ranking through the same component — no separate binary-win code path.

## Explicitly not doing

- Not changing `checkAndFinalizeSoleSurvivor`'s immediate-end behavior for disconnect scenarios.
- Not touching NusaCard's own win/ranking flow — it already works this way.
- Not redesigning `RankModal`'s visuals — only relocating the file and widening its consumer surface to 2 features.

## Verification

1. `npx tsc --noEmit` and `npx eslint` on all touched files.
2. Live test: Ular Tangga room with 1 real player + 2 bots (3 total). Play until one bot reaches 100 — confirm the game does NOT end, remaining players keep taking turns (finished bot is skipped in rotation), and the game only ends (with the shared RankModal showing full 1st/2nd/3rd) once all 3 have finished.
3. Confirm rewards: 1st place gets gold+potion, 2nd silver, 3rd bronze (per existing `claimGameReward` rank mapping) — verified via profile badge count changes for the human player across a couple of test rounds.
4. Confirm a normal 2-player room (no bots) still plays start-to-finish correctly and shows a 2-row ranking at the end.
5. Visually confirm `PauseModal` is noticeably larger and still centered/responsive on a small viewport.
