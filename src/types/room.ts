export type RoomPlayer = {
	uid: string;
	displayName: string;
	photoURL?: string;
	ready: boolean;
};

export type Room = {
	roomId: string;
	topicId: string;
	gameId: string;
	capacity: number;
	currentPlayers: number;
	gameStarted: boolean;
	gameStatus: 'waiting' | 'playing' | 'finished';
	players: Record<string, RoomPlayer>;
	createdAt: number;
	updatedAt: number;
};
