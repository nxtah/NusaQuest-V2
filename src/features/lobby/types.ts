import type { Room, GameState } from "@/src/types/firestore";
import type { GameType } from "@/src/types/game";

/**
 * Lobby State - waiting for players
 */
export interface LobbyState {
  room: Room;
  players: LobbyPlayer[];
  status: "waiting" | "ready" | "starting" | "started";
  hostId: string;
  canStart: boolean; // true if min players reached
}

/**
 * Lobby Player
 */
export interface LobbyPlayer {
  userId: string;
  displayName: string;
  photoURL: string;
  joinedAt: number;
  role: "host" | "player" | "ai";
  isReady: boolean;
  ping?: number; // network latency
}

/**
 * Room List Item (for browsing rooms)
 */
export interface RoomListItem {
  roomId: string;
  gameType: GameType;
  mapName: string;
  regionName: string;
  currentPlayers: number;
  maxPlayers: number;
  availableSlots: number;
  hostName: string;
  createdAt: number;
  isPublic: boolean;
}

/**
 * Player Join Event
 */
export interface PlayerJoinEvent {
  roomId: string;
  userId: string;
  displayName: string;
  joinedAt: number;
}

/**
 * Player Leave Event
 */
export interface PlayerLeaveEvent {
  roomId: string;
  userId: string;
  leftAt: number;
}

/**
 * Chat Message in Lobby
 */
export interface ChatMessage {
  messageId: string;
  roomId: string;
  userId: string;
  displayName: string;
  text: string;
  createdAt: number;
  isSystemMessage: boolean; // true for system announcements
}

/**
 * Ready Status Update
 */
export interface ReadyStatusUpdate {
  roomId: string;
  userId: string;
  isReady: boolean;
}

/**
 * Room Settings
 */
export interface RoomSettings {
  roomId: string;
  isPublic: boolean;
  requirePassword?: boolean;
  password?: string;
  minPlayers: number;
  allowSpectators: boolean;
}

/**
 * Pre-game Check
 */
export interface PreGameCheck {
  roomId: string;
  roomExists: boolean;
  allPlayersReady: boolean;
  minimumPlayersReached: boolean;
  questionsAvailable: boolean;
  canStart: boolean;
  errors: string[];
}
