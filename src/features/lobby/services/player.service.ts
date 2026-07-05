import type { RoomPlayer } from '../../../types/firebase.types';
import type { AppResult } from '../../../utils/result';

import { getData, setData, updateData } from '../../../services/firebase/rtdb/base.service';

export function joinRoomPlayer(
	topicId: string,
	gameId: string,
	roomId: string,
	player: RoomPlayer,
): Promise<AppResult<RoomPlayer>> {
	return setData<RoomPlayer>(`rooms/${topicId}/${gameId}/${roomId}/players/${player.uid}`, player);
}

export function leaveRoomPlayer(
	topicId: string,
	gameId: string,
	roomId: string,
	uid: string,
): Promise<AppResult<null>> {
	return setData<null>(`rooms/${topicId}/${gameId}/${roomId}/players/${uid}`, null);
}

export function getRoomPlayers(
	topicId: string,
	gameId: string,
	roomId: string,
): Promise<AppResult<Record<string, RoomPlayer> | null>> {
	return getData<Record<string, RoomPlayer>>(`rooms/${topicId}/${gameId}/${roomId}/players`);
}

export function updatePlayerReadyStatus(
	topicId: string,
	gameId: string,
	roomId: string,
	uid: string,
	ready: boolean,
): Promise<AppResult<{ ready: boolean }>> {
	return updateData<{ ready: boolean }>(`rooms/${topicId}/${gameId}/${roomId}/players/${uid}`, { ready });
}
