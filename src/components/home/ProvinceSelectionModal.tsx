'use client';

import React, { useState } from 'react';
import { PROVINCES, GameType, GAME_TYPES } from '../../features/home/types';

interface ProvinceSelectionModalProps {
  isOpen: boolean;
  selectedGame: GameType | null;
  onSelectProvince: (provinceId: number) => void;
  onClose: () => void;
}

export default function ProvinceSelectionModal({
  isOpen,
  selectedGame,
  onSelectProvince,
  onClose,
}: ProvinceSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen || !selectedGame) return null;

  const filteredProvinces = PROVINCES.filter((province) =>
    province.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const gameLabel = GAME_TYPES[selectedGame].label;

  return (
    <div className="game-modal-overlay" onClick={onClose}>
      <div className="game-modal-container game-modal-container--large" onClick={(e) => e.stopPropagation()}>
        <button
          className="game-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="game-modal-header">
          <h2 className="game-modal-title">Pilih Provinsi</h2>
          <p className="game-modal-subtitle">
            Bermain {gameLabel}
          </p>
        </div>

        <div className="game-modal-content">
          {/* Search Input */}
          <div className="game-search-container">
            <input
              type="text"
              placeholder="Cari provinsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="game-search-input"
              aria-label="Search provinces"
            />
          </div>

          {/* Provinces List */}
          <div className="game-provinces-list">
            {filteredProvinces.length > 0 ? (
              filteredProvinces.map((province) => (
                <button
                  key={province.id}
                  onClick={() => onSelectProvince(province.id)}
                  className="game-province-item"
                  aria-label={`Pilih ${province.name}`}
                >
                  {province.name}
                </button>
              ))
            ) : (
              <div className="game-empty-state">
                <p>Tidak ada provinsi yang ditemukan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
