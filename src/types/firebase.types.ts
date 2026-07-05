export type FirebaseEntityId = string;

export type UserProfile = {
  uid: FirebaseEntityId;
  displayName: string;
  email: string;
  photoURL?: string;
  updatedAt: number;
};

export type RoomPlayer = {
  uid: FirebaseEntityId;
  displayName: string;
  photoURL?: string;
  ready: boolean;
};

export type Room = {
  roomId: FirebaseEntityId;
  topicId: string;
  gameId: string;
  capacity: number;
  currentPlayers: number;
  gameStarted: boolean;
  players: Record<string, RoomPlayer>;
  createdAt: number;
  updatedAt: number;
};

export type GameState = {
  roomId: FirebaseEntityId;
  currentPlayerIndex: number;
  status: 'waiting' | 'playing' | 'finished';
  winnerUid?: FirebaseEntityId;
  updatedAt: number;
};

export type ChatMessage = {
  id: FirebaseEntityId;
  uid: FirebaseEntityId;
  displayName: string;
  text: string;
  createdAt: number;
};

export type UploadProfilePhotoResult = {
  path: string;
  url: string;
};
