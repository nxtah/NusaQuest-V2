import React from 'react';
import Image from 'next/image';

interface LobbyPlayer {
  uid: string;
  displayName?: string;
  name?: string;
  photoURL?: string;
}

interface UlarTanggaLobbyProps {
  players: LobbyPlayer[];
  onStartGame: () => void;
  topicID: string;
  roomID: string;
  myUID: string | null;
}

export default function UlarTanggaLobby({
  players,
  onStartGame,
  topicID,
  roomID,
  myUID,
}: UlarTanggaLobbyProps) {
  // Selalu pastikan ada 4 slot
  const slots = [0, 1, 2, 3];

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center p-4"
         style={{
           // Fallback background yang bagus jika tidak ada gambar (atau bisa pakai gambar background lobby jika ada)
           background: 'linear-gradient(to bottom, #1e3c72, #2a5298)',
           fontFamily: 'Poppins, sans-serif'
         }}
    >
      <div className="absolute top-8 text-center w-full z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-md" style={{ fontFamily: 'var(--font-bauhaus)' }}>
          Welcome to {topicID.toUpperCase()} {roomID}
        </h1>
      </div>

      <div className="flex flex-col items-center gap-12 z-10 mt-16">
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 max-w-6xl mx-auto">
          {slots.map((slotIndex) => {
            const player = players[slotIndex];
            const isMe = player?.uid === myUID;
            const isOwner = slotIndex === 0 && player !== undefined;

            return (
              <div 
                key={slotIndex} 
                className={`relative w-40 md:w-56 h-72 md:h-80 rounded-b-full overflow-hidden shadow-2xl transition-transform hover:scale-105
                            ${player ? 'bg-gradient-to-b from-[#1a365d] to-[#0f172a] border-t-4 border-yellow-400' 
                                     : 'bg-[#0f172a]/60 backdrop-blur-sm border-t-4 border-gray-600 border-dashed'}`}
              >
                {/* Bagian Foto */}
                <div className="w-full h-1/2 relative bg-gray-300">
                  {player ? (
                    player.photoURL ? (
                      <img 
                        src={player.photoURL} 
                        alt={player.displayName || player.name || 'Player'} 
                        className="object-cover w-full h-full"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-100">
                        <span className="text-4xl">👤</span>
                      </div>
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-400">
                      <span className="text-5xl text-gray-500">👤</span>
                    </div>
                  )}
                </div>

                {/* Bagian Bawah (Detail) */}
                <div className="w-full h-1/2 flex flex-col items-center justify-start p-4 text-center">
                  {player ? (
                    <>
                      <h3 className="text-white font-bold text-sm md:text-base line-clamp-2">
                        {player.displayName || player.name} {isMe && '(Kamu)'}
                      </h3>
                      <p className="text-yellow-400 text-xs md:text-sm mt-1 mb-2">Player {slotIndex + 1}</p>
                      
                      {isOwner && (
                        <span className="bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">
                          OWNER
                        </span>
                      )}
                      
                      {/* Dekorasi tambahan */}
                      <div className="w-full border-t border-blue-800/50 pt-2 flex justify-center gap-2 mt-auto">
                         <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                         <span className="text-green-400 text-[10px] uppercase font-bold tracking-wider">Ready</span>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-400 text-xs text-center px-2">
                        Menunggu Pemain Lain Untuk Masuk
                      </p>
                    </div>
                  )}
                </div>

                {/* Ribbon Kiri Kanan (Visual Detail) */}
                {player && (
                  <>
                    <div className="absolute left-0 top-1/2 w-2 h-4 bg-blue-500 rounded-r-md -translate-y-1/2"></div>
                    <div className="absolute right-0 top-1/2 w-2 h-4 bg-blue-500 rounded-l-md -translate-y-1/2"></div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {(() => {
          const ownerPlayer = players[0];
          const isMeOwner = ownerPlayer && ownerPlayer.uid === myUID;

          return (
            <div className="mt-8 flex flex-col items-center gap-2">
              <button
                onClick={onStartGame}
                disabled={!isMeOwner || players.length === 0}
                className={`px-12 py-4 font-bold rounded-full shadow-lg text-xl transition-all 
                            ${isMeOwner 
                              ? 'bg-[#8cc63f] hover:bg-[#7ab033] text-white active:scale-95' 
                              : 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-70'}`}
                style={{ fontFamily: 'var(--font-bauhaus)' }}
              >
                Mulai Permainan
              </button>
              {!isMeOwner && (
                <p className="text-yellow-400 text-sm animate-pulse">
                  Menunggu Owner untuk memulai permainan...
                </p>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
