'use client';

import React, { useEffect, useState } from 'react';
import { GameType, GAME_TYPES } from '../../features/home/types';
import { getRegions } from '../../features/destination/services/regions.service';
import type { Region } from '../../types/firestore';

interface ProvinceSelectionModalProps {
  isOpen: boolean;
  selectedGame: GameType | null;
  mapId: string | null;
  onSelectProvince: (regionId: string) => void;
  onClose: () => void;
}

export default function ProvinceSelectionModal({
  isOpen,
  selectedGame,
  mapId,
  onSelectProvince,
  onClose,
}: ProvinceSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !mapId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    getRegions(mapId)
      .then((data) => {
        if (!cancelled) setRegions(data);
      })
      .catch(() => {
        if (!cancelled) setError('Gagal memuat daftar provinsi. Coba lagi.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, mapId]);

  if (!isOpen || !selectedGame) return null;

  const filteredRegions = regions.filter((region) =>
    region.name.toLowerCase().includes(searchTerm.toLowerCase())
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
              disabled={loading || Boolean(error)}
            />
          </div>

          {/* Provinces List */}
          <div className="game-provinces-list">
            {loading ? (
              <div className="game-empty-state">
                <p>Memuat provinsi...</p>
              </div>
            ) : error ? (
              <div className="game-empty-state">
                <p>{error}</p>
              </div>
            ) : filteredRegions.length > 0 ? (
              filteredRegions.map((region) => (
                <button
                  key={region.regionId}
                  onClick={() => onSelectProvince(region.regionId)}
                  className="game-province-item"
                  aria-label={`Pilih ${region.name}`}
                >
                  {region.name}
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
