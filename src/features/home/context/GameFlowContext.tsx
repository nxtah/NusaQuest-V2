'use client';

import React, { createContext, useContext } from 'react';
import { GameType } from '../types';

interface GameFlowContextType {
  onIslandClick: (islandLabel: string) => void;
}

const GameFlowContext = createContext<GameFlowContextType | undefined>(undefined);

export function GameFlowProvider({ children, onIslandClick }: { children: React.ReactNode; onIslandClick: (label: string) => void }) {
  return (
    <GameFlowContext.Provider value={{ onIslandClick }}>
      {children}
    </GameFlowContext.Provider>
  );
}

export function useGameFlowContext() {
  const context = useContext(GameFlowContext);
  if (!context) {
    throw new Error('useGameFlowContext must be used within GameFlowProvider');
  }
  return context;
}
