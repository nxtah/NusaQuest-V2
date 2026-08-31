'use client';

import React, { useEffect, useState } from 'react';
import { GameType, GAME_TYPES } from '../../features/home/types';
import { getRegions } from '../../features/destination/services/regions.service';
import { getRoomsOccupancy } from '../../features/lobby/services/rooms.service';
import type { Region } from '../../types/firestore';

// Room slot yang beneran dishare sama orang lain (bukan 'vs-ai', single-player).
const MULTIPLAYER_ROOM_IDS = [1, 2, 3, 4];

interface ProvinceSelectionModalProps {
  isOpen: boolean;
  selectedGame: GameType | null;
  mapId: string | null;
  onSelectProvince: (regionId: string) => void;
  onClose: () => void;
}

// Ditampilin per halaman (bukan scroll panjang) — request user: "jangan
// langsung banyak", kertas jadi berasa lebih ringkas kayak level-select.
const PROVINCES_PER_PAGE = 6;

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
  const [page, setPage] = useState(0);
  const [occupancyByRegion, setOccupancyByRegion] = useState<Record<string, number>>({});

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

  const filteredRegions = regions.filter((region) =>
    region.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Balik ke halaman 1 tiap kali hasil pencarian berubah — kalau enggak,
  // user bisa kejebak di halaman kosong (misal lagi di halaman 3, terus
  // hasil filter cuma sisa 1 halaman). Adjust state pas render (pola yang
  // direkomendasikan React buat "reset state pas dependency berubah"),
  // bukan lewat useEffect — updateSetState sinkron di dalam effect kena
  // lint error (bisa micu cascading render).
  const [prevSearchTerm, setPrevSearchTerm] = useState(searchTerm);
  if (searchTerm !== prevSearchTerm) {
    setPrevSearchTerm(searchTerm);
    setPage(0);
  }

  const totalPages = Math.max(1, Math.ceil(filteredRegions.length / PROVINCES_PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const pagedRegions = filteredRegions.slice(
    safePage * PROVINCES_PER_PAGE,
    safePage * PROVINCES_PER_PAGE + PROVINCES_PER_PAGE
  );
  const pagedRegionIds = pagedRegions.map((r) => r.regionId).join(',');

  // Berapa orang lagi aktif per provinsi (sekilas doang, bukan real-time) —
  // cuma buat provinsi yang lagi ketampil di halaman ini, biar gak query
  // seluruh daftar tiap modal dibuka. Diselesaikan diam-diam kalau gagal
  // (badge cuma "nice to have", bukan boleh nge-blok modal-nya).
  useEffect(() => {
    if (!isOpen || !selectedGame || pagedRegions.length === 0) return;
    let cancelled = false;

    const roomIds = pagedRegions.flatMap((region) =>
      MULTIPLAYER_ROOM_IDS.map((roomNum) => `${selectedGame}_${region.regionId}_room${roomNum}`)
    );

    getRoomsOccupancy(roomIds)
      .then((summary) => {
        if (cancelled) return;
        const perRegion: Record<string, number> = {};
        for (const region of pagedRegions) {
          const total = MULTIPLAYER_ROOM_IDS.reduce((sum, roomNum) => {
            const key = `${selectedGame}_${region.regionId}_room${roomNum}`;
            return sum + (summary[key]?.activeCount ?? 0);
          }, 0);
          if (total > 0) perRegion[region.regionId] = total;
        }
        setOccupancyByRegion(perRegion);
      })
      .catch(() => {
        // Badge okupansi opsional — kalau gagal, biarin aja kosong.
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedGame, pagedRegionIds]);

  if (!isOpen || !selectedGame) return null;

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
            ) : pagedRegions.length > 0 ? (
              pagedRegions.map((region) => {
                const activeCount = occupancyByRegion[region.regionId];
                return (
                  <button
                    key={region.regionId}
                    onClick={() => onSelectProvince(region.regionId)}
                    className="game-province-item"
                    aria-label={`Pilih ${region.name}${activeCount ? `, ${activeCount} orang lagi aktif` : ''}`}
                  >
                    {region.name}
                    {activeCount ? (
                      <span className="game-province-occupancy-badge">{activeCount}</span>
                    ) : null}
                  </button>
                );
              })
            ) : (
              <div className="game-empty-state">
                <p>Tidak ada provinsi yang ditemukan</p>
              </div>
            )}
          </div>

          {/* Navigasi Halaman */}
          {!loading && !error && filteredRegions.length > 0 && (
            <div className="game-province-pagination">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="game-province-page-btn"
                aria-label="Provinsi sebelumnya"
              >
                ‹ Sebelumnya
              </button>
              <span className="game-province-page-indicator">
                {safePage + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={safePage >= totalPages - 1}
                className="game-province-page-btn"
                aria-label="Provinsi selanjutnya"
              >
                Selanjutnya ›
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
