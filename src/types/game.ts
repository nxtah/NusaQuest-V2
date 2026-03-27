export type GameStatus = 'waiting' | 'playing' | 'finished';

export type GameState = {
	roomId: string;
	gameId: string;
	topicId: string;
	currentPlayerIndex: number;
	status: GameStatus;
	winnerUid?: string;
	updatedAt: number;
};
