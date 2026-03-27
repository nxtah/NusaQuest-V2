export type GameStatePayload = {
	roomId: string;
	currentPlayerIndex: number;
	status: 'waiting' | 'playing' | 'finished';
	updatedAt: number;
};

const ALLOWED_STATUS = new Set(['waiting', 'playing', 'finished']);

export function parseGameStatePayload(payload: unknown): GameStatePayload {
	if (!payload || typeof payload !== 'object') {
		throw new Error('Invalid game payload: expected object');
	}

	const candidate = payload as Record<string, unknown>;
	const roomId = String(candidate.roomId ?? '');
	const currentPlayerIndex = Number(candidate.currentPlayerIndex ?? NaN);
	const status = String(candidate.status ?? '');
	const updatedAt = Number(candidate.updatedAt ?? Date.now());

	if (roomId.length < 1) {
		throw new Error('Invalid game payload: roomId is required');
	}

	if (!Number.isInteger(currentPlayerIndex) || currentPlayerIndex < 0) {
		throw new Error('Invalid game payload: currentPlayerIndex must be non-negative integer');
	}

	if (!ALLOWED_STATUS.has(status)) {
		throw new Error('Invalid game payload: status is invalid');
	}

	if (!Number.isFinite(updatedAt)) {
		throw new Error('Invalid game payload: updatedAt is invalid');
	}

	return {
		roomId,
		currentPlayerIndex,
		status: status as GameStatePayload['status'],
		updatedAt,
	};
}
