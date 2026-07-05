'use client';

import React from 'react';
import { GameType, GAME_TYPES } from '../types';

interface GameSelectionModalProps {
  isOpen: boolean;
  islandLabel: string | null;
  onSelectGame: (game: GameType) => void;
  onClose: () => void;
}

export default function GameSelectionModal({
  isOpen,
  islandLabel,
  onSelectGame,
  onClose,
}: GameSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        <h2 className="modal-title">
          Pilih Game
        </h2>
        
        {islandLabel && (
          <p className="modal-subtitle">
            Bermain dari {islandLabel}
          </p>
        )}

        <div className="modal-options-grid modal-options-grid--two-cols">
          {(Object.entries(GAME_TYPES) as Array<[GameType, typeof GAME_TYPES[GameType]]>).map(
            ([gameKey, gameValue]) => (
              <button
                key={gameKey}
                onClick={() => onSelectGame(gameKey)}
                className="option-card"
                aria-label={`Pilih game ${gameValue.label}`}
              >
                <span className="option-card-icon">
                  {gameKey === 'ular-tangga' ? '🎲' : '🃏'}
                </span>
                <span className="option-card-label">{gameValue.label}</span>
                <span className="option-card-description">{gameValue.description}</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
