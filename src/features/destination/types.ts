import type { GameMap, Region } from "@/src/types/firestore";
import type { GameType } from "@/src/types/game";

/**
 * Destination View - Map with its regions
 */
export interface DestinationView {
  map: GameMap;
  regions: Region[];
}

/**
 * Region Selection (after user picks a map)
 */
export interface RegionSelection {
  mapId: string;
  regionId: string;
  mapName: string;
  regionName: string;
}

/**
 * Game Mode Selection (after region picked)
 */
export interface GameModeSelection {
  gameType: GameType;
  gameMode: "multiplayer" | "vs-ai";
  maxPlayers: number;
}

/**
 * Destination Card Props (for display)
 */
export interface DestinationCardProps {
  map: GameMap;
  onClick: () => void;
  isSelected?: boolean;
}

/**
 * Region Card Props (for display)
 */
export interface RegionCardProps {
  region: Region;
  onClick: () => void;
  isSelected?: boolean;
  questionsCount?: number;
}
