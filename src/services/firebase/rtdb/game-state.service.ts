import type { GameState } from '../../../types/firebase.types';
import type { AppResult } from '../../../utils/result';

import { gameStatePath, getData, setData, updateData } from './base.service';

export function getGameStateByRoom(roomId: string): Promise<AppResult<GameState | null>> {
  return getData<GameState>(gameStatePath(roomId));
}

export function saveGameState(state: GameState): Promise<AppResult<GameState>> {
  return setData<GameState>(gameStatePath(state.roomId), state);
}

export function updateGameState(
  roomId: string,
  payload: Partial<GameState>,
): Promise<AppResult<Partial<GameState>>> {
  return updateData<Partial<GameState>>(gameStatePath(roomId), {
    ...payload,
    updatedAt: Date.now(),
  });
}
