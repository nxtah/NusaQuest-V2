'use client';

import React, { useState } from 'react';
import { PROVINCES, GameType, GAME_TYPES } from '../types';

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        <h2 className="modal-title">Pilih Provinsi</h2>
        
        <p className="modal-subtitle">
          Bermain {gameLabel}
        </p>

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Cari provinsi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/20 border-2 border-white/30 text-white placeholder-white/60 focus:outline-none focus:border-white/50 transition-all text-sm md:text-base"
            aria-label="Search provinces"
          />
        </div>

        {/* Provinces List */}
        <div className="modal-scroll-container">
          <div className="modal-options-grid modal-options-grid--full">
            {filteredProvinces.length > 0 ? (
              filteredProvinces.map((province) => (
                <button
                  key={province.id}
                  onClick={() => onSelectProvince(province.id)}
                  className="option-item"
                  aria-label={`Pilih ${province.name}`}
                >
                  {province.name}
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-white/70 text-sm md:text-base">
                  Tidak ada provinsi yang ditemukan
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
