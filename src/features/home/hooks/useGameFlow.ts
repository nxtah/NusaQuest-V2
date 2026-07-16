import { useState, useCallback } from 'react';
import { GameFlowState, GameType } from '../types';

export function useGameFlow() {
  const [state, setState] = useState<GameFlowState>({
    isGameModalOpen: false,
    isProvinceModalOpen: false,
    selectedGame: null,
    selectedDestinationId: null,
    islandLabel: null,
  });

  const openGameModal = useCallback((islandLabel: string) => {
    setState((prev) => ({
      ...prev,
      isGameModalOpen: true,
      islandLabel,
    }));
  }, []);

  const closeGameModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isGameModalOpen: false,
    }));
  }, []);

  const selectGame = useCallback((game: GameType) => {
    setState((prev) => ({
      ...prev,
      selectedGame: game,
      isGameModalOpen: false,
      isProvinceModalOpen: true,
    }));
  }, []);

  const closeProvinceModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isProvinceModalOpen: false,
      selectedGame: null,
    }));
  }, []);

  const selectProvince = useCallback((destinationId: number) => {
    setState((prev) => ({
      ...prev,
      selectedDestinationId: destinationId,
      isProvinceModalOpen: false,
    }));
  }, []);

  const resetFlow = useCallback(() => {
    setState({
      isGameModalOpen: false,
      isProvinceModalOpen: false,
      selectedGame: null,
      selectedDestinationId: null,
      islandLabel: null,
    });
  }, []);

  return {
    ...state,
    openGameModal,
    closeGameModal,
    selectGame,
    closeProvinceModal,
    selectProvince,
    resetFlow,
  };
}
