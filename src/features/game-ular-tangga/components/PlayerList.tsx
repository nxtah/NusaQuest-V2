'use client';

import React from 'react';
import { ularTangga } from '../../../assets/images/ular-tangga/cloudinaryAssets';

interface Player {
  id: number;
  name?: string;
  avatar: string;
  isActive?: boolean;
}

interface PlayerListProps {
  players?: Player[];
  currentPlayerIndex?: number;
  turnText?: string;
  focusedPlayerIndex?: number;
  focusedName?: string;
}

export default function PlayerList({
  players = [
    { id: 1, avatar: ularTangga.pion1, isActive: true, name: 'Pemain 1' },
    { id: 2, avatar: ularTangga.pion2, name: 'Pemain 2' },
    { id: 3, avatar: ularTangga.pion3, name: 'Pemain 3' },
    { id: 4, avatar: ularTangga.pion4, name: 'Pemain 4' },
  ],
  currentPlayerIndex = 0,
  turnText = 'Giliran Anda!',
  focusedPlayerIndex,
  focusedName,
}: PlayerListProps) {
  const leftPlayers = players.slice(0, 2);
  const rightPlayers = players.slice(2);

  const getAvatarClass = (index: number) =>
    `nq-ut-pl-avatar relative w-8 h-8 md:w-12 md:h-12 rounded-full overflow-hidden transition-transform ${
      index === currentPlayerIndex ? 'nq-ut-pl-avatar--active' : ''
    } ${index === focusedPlayerIndex ? 'translate-y-[-10px] scale-110' : ''}`;

  return (
    <div className="flex w-full items-center justify-center gap-1 md:gap-3">
      <style>{`
        .nq-ut-pl-avatar {
          border: 2px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }
        .nq-ut-pl-avatar--active {
          border: 2px solid #f5a916;
          box-shadow:
            0 0 0 3px rgba(255, 226, 138, 0.55),
            0 3px 8px rgba(120, 72, 0, 0.4);
        }
        .nq-ut-pl-turn-label {
          background: linear-gradient(150deg, #fff6e0 0%, #f2dfae 100%);
          color: #4a2a1a;
          box-shadow:
            0 2px 5px rgba(139, 94, 42, 0.3),
            inset -1px -1px 3px rgba(139, 94, 42, 0.16),
            inset 1px 1px 3px rgba(255, 255, 255, 0.8);
        }
      `}</style>

      <div className="flex items-center gap-1 md:gap-3">
        {leftPlayers.map((player, index) => (
          <div key={player.id} className={getAvatarClass(index)}>
            <img
              src={player.avatar}
              alt={`Player ${player.id}`}
              className="w-full h-full object-cover bg-white"
              referrerPolicy="no-referrer"
            />
          </div>
        ))}
      </div>

      <p className="nq-ut-pl-turn-label min-w-fit rounded-full px-2 py-1 text-center text-xs md:text-sm font-bold whitespace-nowrap md:px-3.5">
        {focusedName ?? turnText}
      </p>

      <div className="flex items-center gap-1 md:gap-3">
        {rightPlayers.map((player, index) => {
          const playerIndex = index + leftPlayers.length;

          return (
            <div key={player.id} className={getAvatarClass(playerIndex)}>
              <img
                src={player.avatar}
                alt={`Player ${player.id}`}
                className="w-full h-full object-cover bg-white"
                referrerPolicy="no-referrer"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

