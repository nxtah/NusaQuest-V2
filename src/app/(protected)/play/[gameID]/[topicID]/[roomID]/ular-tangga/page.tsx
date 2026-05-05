"use client";

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import GameBackground from '../../../../../../../features/game-ular-tangga/components/GameBackground';
import Board from '../../../../../../../features/game-ular-tangga/components/Board';
import PlayerTurnBox from '../../../../../../../features/game-ular-tangga/components/PlayerTurnBox';
import { ularTangga } from '../../../../../../../assets/images/ular-tangga/cloudinaryAssets';
import RotateDeviceOverlay from '../../../../../../../components/layout/RotateDeviceOverlay';
import PauseModal from "../../../../../../../features/game-ular-tangga/components/PauseModal";
import SettingButton from "../../../../../../../features/game-ular-tangga/components/SettingButton";

export default function Page() {
  const router = useRouter();
  const params = useParams();

  const [isPaused, setIsPaused] = useState(false);
  const players = [
    { id: 1, avatar: ularTangga.pion1, name: 'Pemain 1' },
    { id: 2, avatar: ularTangga.pion2, name: 'Pemain 2' },
    { id: 3, avatar: ularTangga.pion3, name: 'Pemain 3' },
    { id: 4, avatar: ularTangga.pion4, name: 'Pemain 4' },
  ];

  const currentPlayerIndex = 0;

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden">
      {/* Overlay untuk Rotasi Perangkat */}
      <RotateDeviceOverlay />

      {/* Background Image */}
      <div className="fixed inset-0 -z-10 bg-[#59a87d]">
        <GameBackground />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start lg:items-center justify-center min-h-[100svh] pt-2 md:pt-4 lg:pt-8 pb-0 px-2 md:px-5 lg:px-8 w-full max-w-[1400px] mx-auto">
        {/* Tombol Back */}
        <button 
            onClick={() => router.push(`/room/${params?.gameID}/${params?.topicID}/${params?.roomID}`)}
            className="absolute left-10 lg:left-7 top-7 z-50 text-white transition-transform"
          >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Setting Button */}
        <SettingButton onClick={() => setIsPaused(true)} />

        {/* Left Section - Board */}
        <div className="flex-1 w-full flex items-start justify-center z-20 mt-1 md:mt-2 lg:mt-0">
          <div className="w-full aspect-square max-w-[80vh] md:max-w-[75vh] lg:max-w-[80vh] ml-4 md:ml-12 lg:ml-4">
            <Board />
          </div>
        </div>

        {/* Right Section - Player Turn */}
        <div className="flex-1 w-full flex flex-col justify-start lg:justify-center items-center h-full">
          <div className="w-full flex-col flex items-center max-w-[85vmin] md:max-w-[70vh] lg:max-w-[75vh]">
            <PlayerTurnBox
              players={players}
              currentPlayerIndex={currentPlayerIndex}
              focusedPlayerIndex={undefined}
              focusedPlayerName={undefined}
              isMyTurn
              diceState={undefined}
              onDiceRollComplete={() => {}}
              question={null}
              showQuestion={false}
              onSelectAnswer={() => {}}
              myPlayerId="player-1"
            />
          </div>
        </div>

        <PauseModal 
            isOpen={isPaused}               
            onClose={() => setIsPaused(false)} 
        />
      </div>
    </main>
  );
}
