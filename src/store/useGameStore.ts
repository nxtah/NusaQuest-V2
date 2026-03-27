import type { GameState } from '../types/game';

type Listener = (state: GameState | null) => void;

let gameState: GameState | null = null;
const listeners = new Set<Listener>();

function emit() {
	listeners.forEach((listener) => listener(gameState));
}

export function getGameStateStore(): GameState | null {
	return gameState;
}

export function setGameStateStore(payload: GameState) {
	gameState = payload;
	emit();
}

export function clearGameStateStore() {
	gameState = null;
	emit();
}

export function subscribeGameStateStore(listener: Listener) {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
}
