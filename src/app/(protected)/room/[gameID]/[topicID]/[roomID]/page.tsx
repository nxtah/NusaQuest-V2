'use client';

import {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import Header from '@/src/components/layout/Header';
import Footer from '@/src/components/layout/Footer';
import {useAuth} from '@/src/features/auth/hooks/useAuth';
import {
  subscribeRooms,
  checkRoomType,
  getCurrentPlayers,
  playerJoinRoom,
  playerLeaveRoom,
  subscribeToGameStart,
} from '@/src/features/lobby/services/lobby.service';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const {user, isInitialized} = useAuth();

  const gameID = params.gameID as string;
  const topicID = params.topicID as string;
  const roomID = params.roomID as string;

  const [roomData, setRoomData] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFirstPlayer, setIsFirstPlayer] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  // Subscribe to room data
  useEffect(() => {
    if (!topicID || !gameID) return;

    setLoading(true);
    const unsubRooms = subscribeRooms(topicID, gameID, (rooms) => {
      if (rooms?.[roomID]) {
        setRoomData(rooms[roomID]);
        setLoading(false);
      }
    });

    return () => unsubRooms();
  }, [topicID, gameID, roomID]);

  // Check room access and join
  useEffect(() => {
    if (!isInitialized || !user?.uid || loading) return;

    const checkAndJoin = async () => {
      try {
        const {exists, isSinglePlayer} = await checkRoomType(topicID, gameID, roomID);

        if (isSinglePlayer) {
          router.push(`/play/${gameID}/${topicID}/${roomID}/game`);
          return;
        }

        if (!exists) {
          router.push(`/lobby/${topicID}/${gameID}`);
          return;
        }

        // Join room if not already joined
        if (!hasJoined) {
          await playerJoinRoom(topicID, gameID, roomID, user.uid, user.displayName || 'Player', (user.googlePhotoURL || user.firebasePhotoURL) as string | undefined);
          setHasJoined(true);
        }
      } catch (error) {
        console.error('Error in room:', error);
        router.push(`/lobby/${topicID}/${gameID}`);
      }
    };

    checkAndJoin();
  }, [isInitialized, user?.uid, loading, topicID, gameID, roomID, hasJoined, router]);

  // Subscribe to current players
  useEffect(() => {
    if (!roomID || roomID === 'room5') return;

    const fetchPlayers = async () => {
      const currentPlayers = await getCurrentPlayers(topicID, gameID, roomID);
      setPlayers(currentPlayers);
      setIsFirstPlayer(currentPlayers.length <= 1);
    };

    fetchPlayers();
    const interval = setInterval(fetchPlayers, 1000);

    return () => clearInterval(interval);
  }, [topicID, gameID, roomID]);

  // Listen to game start
  useEffect(() => {
    if (!roomID) return;

    const unsubGameStart = subscribeToGameStart(topicID, gameID, roomID, (gameStarted) => {
      if (gameStarted) {
        router.push(`/play/${gameID}/${topicID}/${roomID}/game`);
      }
    });

    return () => unsubGameStart();
  }, [topicID, gameID, roomID, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hasJoined && user?.uid) {
        playerLeaveRoom(topicID, gameID, roomID, user.uid);
      }
    };
  }, [topicID, gameID, roomID, user?.uid, hasJoined]);

  if (loading) {
    return (
      <main>
        <Header showBackIcon />
        <div className="text-center py-5">Loading room...</div>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header showBackIcon />
      <div className="container py-5">
        <h2>Room: {roomID}</h2>
        <p>Players in room: {players.length}</p>

        <div className="row mt-4">
          {players.map((player, idx) => (
            <div key={idx} className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  {player.photoURL && (
                    <img src={player.photoURL} alt={player.name} className="rounded-circle me-2" width="40" />
                  )}
                  <span>{player.name}</span>
                  {player.uid === user?.uid && <span className="badge bg-primary ms-2">You</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {isFirstPlayer && (
          <div className="mt-4">
            <p className="text-muted">Waiting for players...</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                // Start game logic here
              }}
              disabled={players.length < 2}
            >
              Start Game
            </button>
          </div>
        )}

        <button
          className="btn btn-secondary mt-3"
          onClick={() => router.push(`/lobby/${topicID}/${gameID}`)}
        >
          Back to Lobby
        </button>
      </div>
      <Footer />
    </main>
  );
}
