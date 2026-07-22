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
    `relative w-8 h-8 md:w-12 md:h-12 rounded-full border-2 overflow-hidden transition-transform ${
      index === currentPlayerIndex ? 'border-yellow-400 ring-2 ring-yellow-300' : 'border-gray-300'
    } ${index === focusedPlayerIndex ? 'translate-y-[-10px] scale-110' : ''}`;

  return (
    <div className="flex w-full items-center justify-center gap-1 md:gap-3">
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

      <p className="min-w-fit px-1 text-center text-xs md:text-sm font-semibold whitespace-nowrap text-white md:px-3">
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

