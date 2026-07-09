'use client';

import React from 'react';
import { GameType, GAME_TYPES } from '../../features/home/types';
import { getPopupImage } from '../../assets/images/home/cloudinaryAssets';

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
    <div className="game-modal-overlay" onClick={onClose}>
      <div className="game-modal-container" onClick={(e) => e.stopPropagation()}>
        <button
          className="game-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="game-modal-header">
          <h2 className="game-modal-title">Pilih Game</h2>
          {islandLabel && (
            <p className="game-modal-subtitle">
              dari {islandLabel}
            </p>
          )}
        </div>

        <div className="game-modal-content">
          <div className="game-options-grid">
            {(Object.entries(GAME_TYPES) as Array<[GameType, typeof GAME_TYPES[GameType]]>).map(
              ([gameKey, gameValue]) => (
                <button
                  key={gameKey}
                  onClick={() => onSelectGame(gameKey)}
                  className="game-option-card"
                  aria-label={`Pilih game ${gameValue.label}`}
                >
                  <span className="game-option-icon">
                    <img
                      src={gameKey === 'ular-tangga' ? getPopupImage('ularTanggaIcon') : getPopupImage('nucaIcon')}
                      alt={gameValue.label}
                      className="w-32 h-32 md:w-36 md:h-36 object-contain"
                    />
                  </span>
                  <span className="game-option-label">{gameValue.label}</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
