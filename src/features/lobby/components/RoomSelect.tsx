'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '../../../components/ui/BackButton';
import { getRoomImage } from '../../../assets/images/room/cloudinaryAssets';
import { getBackgroundImage } from '../../../assets/images/background/cloudinaryAssets';
import { getAwanImage } from '../../../assets/images/home/cloudinaryAssets';
import { getInformationImage } from '../../../assets/images/information/cloudinaryAssets';
import { listenToRoom } from '../services/rooms.service';
import { checkAndInvalidateIfIdle as checkUlarTanggaIdle, checkAndResetAbandonedRoom } from '../../game-ular-tangga/services/ular-tangga-game.service';
import { checkAndInvalidateIfIdle as checkNusaCardIdle } from '../../game-nuca/services/nusa-card-game.service';

interface RoomSelectProps {
  topicID: string;
  gameID: string;
  onSelect?: (roomId: string | number) => void;
}

interface RoomOccupancy {
  activeCount: number;
  isLocked: boolean;
}

const HOUSES: { id: number | string; imgKey: string; l: string; r: string; b: string; w: string; z: number }[] = [
  { id: 4,       imgKey: 'room4',  l: '28%', r: 'auto', b: '42%', w: '20%', z: 15 },
  { id: 'vs-ai', imgKey: 'roomAi', l: 'auto', r: '28%', b: '42%', w: '21%', z: 15 },
  { id: 1,       imgKey: 'room1',  l: '12%', r: 'auto', b: '22%', w: '25%', z: 25 },
  { id: 3,       imgKey: 'room3',  l: 'auto', r: '12%', b: '20%', w: '25%', z: 25 },
  { id: 2,       imgKey: 'room2',  l: '41%', r: 'auto', b: '20%', w: '18%', z: 35 },
];

const MULTIPLAYER_HOUSE_IDS = HOUSES.map((h) => h.id).filter(
  (id): id is number => typeof id === 'number'
);

export default function RoomSelect({ topicID, gameID, onSelect }: RoomSelectProps) {
  const router = useRouter();

  // Cuma 4 rumah multiplayer (bukan 'vs-ai', yang single-player) yang perlu
  // status okupansi/lock — "orang lain lagi main di sini" cuma masuk akal
  // buat room yang beneran dishare sama orang lain.
  const [occupancy, setOccupancy] = useState<Record<string, RoomOccupancy>>({});

  // Room yang ditinggal SEMUA orangnya (gak ada satupun client yang masih
  // buka halaman room/play-nya) gak akan pernah ke-cek sendiri — cek
  // idle/abandoned cuma jalan dari halaman room/play yang beneran ada
  // penontonnya. Lobby ini (grid pilih rumah) jauh lebih sering dibuka
  // ketimbang 1 room spesifik yang udah lama ditinggal, jadi proaktif cek
  // di sini juga — biar room yang beneran udah lama gak ada aktivitas
  // kebersihin sendiri pas siapapun buka lobby, bukan nunggu ada yang
  // kebetulan klik masuk ke room itu lagi.
  useEffect(() => {
    const isUlarTangga = gameID === 'ular-tangga' || gameID === 'snake-ladder';
    const isNusaCard = gameID === 'nusa-card' || gameID === 'card';
    MULTIPLAYER_HOUSE_IDS.forEach((houseId) => {
      const roomKey = `${gameID}_${topicID}_room${houseId}`;
      if (isUlarTangga) {
        void checkAndResetAbandonedRoom(roomKey);
        void checkUlarTanggaIdle(roomKey);
      } else if (isNusaCard) {
        void checkNusaCardIdle(roomKey);
      }
    });
  }, [gameID, topicID]);

  useEffect(() => {
    const unsubscribers = MULTIPLAYER_HOUSE_IDS.map((houseId) => {
      const roomKey = `${gameID}_${topicID}_room${houseId}`;
      return listenToRoom(roomKey, (room) => {
        const data = room as unknown as { status?: string; players?: Record<string, { isActive?: boolean }> } | null;
        const activeCount = Object.values(data?.players || {}).filter(
          (p) => p.isActive !== false
        ).length;
        // Room 'playing' tapi kosong (game ditinggal, belum ada yang balik
        // ke halaman room buat trigger checkAndResetAbandonedRoom) dianggap
        // tersedia lagi, bukan ke-lock permanen.
        const isLocked = data?.status === 'playing' && activeCount > 0;
        setOccupancy((prev) => ({ ...prev, [houseId]: { activeCount, isLocked } }));
      });
    });

    return () => unsubscribers.forEach((unsub) => unsub());
  }, [gameID, topicID]);

  return (
    <main className="lobby-container">
      <div className="diorama-wrapper">
        <img src={getBackgroundImage('langit')} className="bg-langit" alt="langit" />

        <img src={getAwanImage('awan2')} className="animate-cloud cloud-1" alt="c1" />
        <img src={getAwanImage('awan2')} className="animate-cloud cloud-2" alt="c2" />
    
        <img src={getBackgroundImage('land')} className="land-image" alt="land" />

        {HOUSES.map((house) => {
          const houseOccupancy = typeof house.id === 'number' ? occupancy[house.id] : undefined;
          const isLocked = houseOccupancy?.isLocked ?? false;

          return (
            <button
              key={house.id}
              onClick={() => {
                if (isLocked) return;
                if (onSelect) onSelect(house.id);
                router.push(`/room/${gameID}/${topicID}/room${house.id}`);
              }}
              className={`rumah-button ${isLocked ? 'rumah-button--locked' : ''}`}
              aria-disabled={isLocked}
              style={{
                '--l': house.l,
                '--r': house.r,
                '--b': house.b,
                '--w': house.w,
                '--z': house.z
              } as React.CSSProperties}
            >
              <img
                src={getRoomImage(house.imgKey as any)}
                className="rumah-img-content"
                alt={`room-${house.id}`}
              />

              {isLocked ? (
                <span className="rumah-status-badge rumah-status-badge--locked">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
                    <rect x="4" y="11" width="16" height="9" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                  Sedang Bermain &bull; {houseOccupancy?.activeCount} orang
                </span>
              ) : houseOccupancy && houseOccupancy.activeCount > 0 ? (
                <span className="rumah-status-badge">
                  {houseOccupancy.activeCount} orang
                </span>
              ) : null}
            </button>
          );
        })}

        <div className="ornament-layer">
          <img src={getInformationImage('tanamanFinal')} className="tanaman-kiri" alt="Tanaman kiri" />
          <img src={getInformationImage('tanamanFinal')} className="tanaman-kanan" alt="Tanaman kanan" />
          <img src={getInformationImage('melati')} className="melati-kiri" alt="m1" />
          <img src={getInformationImage('melati')} className="melati-kanan" alt="m2" />

          <div className="papan-hiasan">
            <img src={getInformationImage('board1')} className="board-img" alt="board" />
            <span className="font-bauhaus text-board">Select Room</span>
          </div>
        </div>
      </div>

      <div className="back-button-wrapper">
        <BackButton href="/home" />
      </div>
    </main>
  );
}