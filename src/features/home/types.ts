export type GameType = 'ular-tangga' | 'nusa-card';

export interface GameFlowState {
  isGameModalOpen: boolean;
  isProvinceModalOpen: boolean;
  selectedGame: GameType | null;
  selectedRegionId: string | null;
  islandLabel: string | null;
}

export const GAME_TYPES: Record<GameType, { label: string; description: string }> = {
  'ular-tangga': {
    label: 'Ular Tangga',
    description: 'Bermain dengan melempar dadu dan menghadapi tantangan soal',
  },
  'nusa-card': {
    label: 'Nusa Card',
    description: 'Bermain dengan mencocokkan kartu dan menjawab pertanyaan',
  },
};

// Label pulau di home page dipetakan ke mapId di Firestore (koleksi `maps`,
// id-nya slug dari nama map — lihat scripts/seed-firestore.ts).
export const ISLAND_TO_MAP_ID: Record<string, string> = {
  'Kuliner': 'kuliner',
  'Pariwisata': 'pariwisata',
  'Sejarah & Legenda': 'sejarah-legenda',
  'Budaya': 'budaya',
  'Alam & Satwa': 'alam-satwa',
};
