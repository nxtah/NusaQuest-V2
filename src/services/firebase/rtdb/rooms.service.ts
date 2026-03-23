import type { Room } from '../../../types/firebase.types';
import type { AppResult } from '../../../utils/result';

import { getData, removeData, setData, updateData, roomPath } from './base.service';

export function getRoomById(
  topicId: string,
  gameId: string,
  roomId: string,
): Promise<AppResult<Room | null>> {
  return getData<Room>(roomPath(topicId, gameId, roomId));
}

export function saveRoom(room: Room): Promise<AppResult<Room>> {
  return setData<Room>(roomPath(room.topicId, room.gameId, room.roomId), room);
}

export function updateRoom(
  topicId: string,
  gameId: string,
  roomId: string,
  payload: Partial<Room>,
): Promise<AppResult<Partial<Room>>> {
  return updateData<Partial<Room>>(roomPath(topicId, gameId, roomId), {
    ...payload,
    updatedAt: Date.now(),
  });
}

export function deleteRoom(topicId: string, gameId: string, roomId: string): Promise<AppResult<null>> {
  return removeData(roomPath(topicId, gameId, roomId));
}
