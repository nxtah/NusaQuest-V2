import type { Room } from '../types/room';

type LobbyState = {
	selectedTopicId: string | null;
	selectedGameId: string | null;
	room: Room | null;
};

type Listener = (state: LobbyState) => void;

const lobbyState: LobbyState = {
	selectedTopicId: null,
	selectedGameId: null,
	room: null,
};

const listeners = new Set<Listener>();

function emit() {
	listeners.forEach((listener) => listener({ ...lobbyState }));
}

export function getLobbyState() {
	return { ...lobbyState };
}

export function setLobbySelection(topicId: string, gameId: string) {
	lobbyState.selectedTopicId = topicId;
	lobbyState.selectedGameId = gameId;
	emit();
}

export function setLobbyRoom(room: Room | null) {
	lobbyState.room = room;
	emit();
}

export function clearLobbyState() {
	lobbyState.selectedTopicId = null;
	lobbyState.selectedGameId = null;
	lobbyState.room = null;
	emit();
}

export function subscribeLobbyState(listener: Listener) {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
}
