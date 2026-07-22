// Re-export from firestore
export type { Room, RoomPlayer } from "./firestore";
export type { GameType, GameMode, AIPlayerConfig } from "./game";

/**
 * Room Creation Request
 */
export interface CreateRoomRequest {
  gameType: "ular-tangga" | "nusa-card";
  mapId: string;
  regionId: string;
  gameMode: "multiplayer" | "vs-ai";
  maxPlayers?: number;
}

/**
 * Join Room Request
 */
export interface JoinRoomRequest {
  roomId: string;
  userId: string;
}

/**
 * Leave Room Request
 */
export interface LeaveRoomRequest {
  roomId: string;
  userId: string;
  shouldEliminatePlayer?: boolean; // true if game is ongoing
}

/**
 * Start Game Request
 */
export interface StartGameRequest {
  roomId: string;
  userId: string; // must be host
}

/**
 * Room List Filter
 */
export interface RoomListFilter {
  gameType?: "ular-tangga" | "nusa-card";
  mapId?: string;
  regionId?: string;
  status?: "waiting" | "playing" | "finished";
  hasAvailableSlots?: boolean;
}

/**
 * Room with extra metadata for display
 */
export interface RoomWithMetadata {
  roomId: string;
  gameType: "ular-tangga" | "nusa-card";
  mapId: string;
  regionId: string;
  maxPlayers: number;
  currentPlayers: number;
  status: "waiting" | "playing" | "finished";
  players: Record<string, any>;
  createdAt: number;
  // Extra fields
  availableSlots: number;
  waitingPlayers: string[];
  activePlayers: string[];
  hostName?: string;
  mapName?: string;
  regionName?: string;
}

/**
 * Player Update in Room
 */
export interface PlayerUpdate {
  userId: string;
  role: "host" | "player" | "ai";
  isActive: boolean;
  finalPosition?: number;
}

/**
 * Room Statistics
 */
export interface RoomStats {
  totalRoomsCreated: number;
  activeRooms: number;
  finishedRooms: number;
  avgPlayersPerRoom: number;
  avgGameDuration: number;
}
