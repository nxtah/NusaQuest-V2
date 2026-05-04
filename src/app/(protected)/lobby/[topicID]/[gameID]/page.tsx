'use client';

import {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import Header from '@/src/components/layout/Header';
import Footer from '@/src/components/layout/Footer';
import {subscribeLobbyData, subscribeRooms} from '@/src/features/lobby/services/lobby.service';
import type {LobbyData} from '@/src/features/lobby/services/lobby.service';

const TOPIC_NAMES: Record<string, string> = {
  'daerah_jawa_barat': 'Daerah Jawa Barat',
  'kuliner_jawa_barat': 'Kuliner Jawa Barat',
  'pariwisata_bahari': 'Pariwisata Bahari',
  'pariwisata_darat': 'Pariwisata Darat',
  'permainan_daerah': 'Permainan Daerah',
};

function resolveVsAiRoute(gameID: string, topicID: string): string {
  if (gameID === 'nusa-card' || gameID === 'card') {
    return `/play/${gameID}/${topicID}/room5/nusa-card-vs-ai`;
  }

  if (gameID === 'ular-tangga' || gameID === 'snake-ladder') {
    return `/play/${gameID}/${topicID}/room5/ular-tangga-vs-ai`;
  }

  return `/play/${gameID}/${topicID}/room5/nusa-card-vs-ai`;
}

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const topicID = params.topicID as string;
  const gameID = params.gameID as string;

  const [lobbyData, setLobbyData] = useState<LobbyData | null>(null);
  const [rooms, setRooms] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [showRoomSelect, setShowRoomSelect] = useState(false);

  useEffect(() => {
    if (!gameID) return;

    setLoading(true);
    const unsubLobby = subscribeLobbyData(gameID, (data) => {
      setLobbyData(data);
      setLoading(false);
    });

    return () => unsubLobby();
  }, [gameID]);

  useEffect(() => {
    if (!topicID || !gameID) return;

    const unsubRooms = subscribeRooms(topicID, gameID, setRooms);
    return () => unsubRooms();
  }, [topicID, gameID]);

  const handleRoomSelect = async (roomNumber: number) => {
    if (roomNumber === 5) {
      // VS AI room
      router.push(resolveVsAiRoute(gameID, topicID));
      return;
    }

    const roomData = rooms[`room${roomNumber}`];
    if (!roomData) return;

    const {currentPlayers = 0, capacity = 4, gameStatus = 'waiting'} = roomData;

    if (gameStatus === 'playing') {
      alert('Room ini sedang bermain. Silakan pilih room lain.');
      return;
    }

    if (currentPlayers >= capacity) {
      alert('Room ini penuh. Silakan pilih room lain.');
      return;
    }

    router.push(`/room/${gameID}/${topicID}/room${roomNumber}`);
  };

  if (loading) {
    return (
      <main>
        <Header showBackIcon />
        <div className="text-center py-5">Loading lobby...</div>
        <Footer />
      </main>
    );
  }

  if (!lobbyData) {
    return (
      <main>
        <Header showBackIcon />
        <div className="text-center py-5">Lobby data not found</div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header showBackIcon />
      <div className="container py-5">
        <div className="row">
          <div className="col-md-6">
            <h2>{lobbyData.name}</h2>
            <p className="text-muted">Topic: {TOPIC_NAMES[topicID] || topicID}</p>

            <div className="mb-4">
              <h5>How to Play</h5>
              <ol>
                {lobbyData.instructions?.map((instruction, idx) => (
                  <li key={idx}>{instruction}</li>
                ))}
              </ol>
            </div>

            <button
              className="btn btn-primary btn-lg"
              onClick={() => setShowRoomSelect(!showRoomSelect)}
            >
              Select Room
            </button>
          </div>

          <div className="col-md-6">
            {lobbyData.image && <img src={lobbyData.image} alt={lobbyData.name} className="img-fluid" />}
          </div>
        </div>

        {/* Room Selection */}
        {showRoomSelect && (
          <div className="row mt-5">
            <h5 className="mb-3">Available Rooms</h5>
            {[1, 2, 3, 4, 5].map((roomNum) => {
              const roomData = rooms[`room${roomNum}`];
              const isFull = roomData && roomData.currentPlayers >= (roomData.capacity || 4);
              const isPlaying = roomData && roomData.gameStatus === 'playing';
              const disabled = isFull || isPlaying;

              return (
                <div key={roomNum} className="col-md-6 mb-3">
                  <div className={`card ${disabled ? 'opacity-50' : ''}`}>
                    <div className="card-body">
                      <h6>Room {roomNum === 5 ? 'VS AI' : roomNum}</h6>
                      {roomData ? (
                        <>
                          <p>Players: {roomData.currentPlayers}/{roomData.capacity || 4}</p>
                          <p className="text-muted">Status: {roomData.gameStatus || 'waiting'}</p>
                        </>
                      ) : (
                        <p>Loading...</p>
                      )}
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleRoomSelect(roomNum)}
                        disabled={disabled}
                      >
                        {disabled ? 'Unavailable' : 'Join'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
