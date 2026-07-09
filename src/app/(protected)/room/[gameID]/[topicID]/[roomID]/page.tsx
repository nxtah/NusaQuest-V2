'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import Image from 'next/image';
import {
  subscribeRooms,
  getCurrentPlayers,
  playerJoinRoom,
  playerLeaveRoom,
  subscribeToGameStart,
  startGameInRoom,
  type RoomData,
  type RoomPlayer,
} from '@/src/features/lobby/services/lobby.service';
import { background } from '@/src/assets/images/background/cloudinaryAssets';
import { information } from '@/src/assets/images/information/cloudinaryAssets';
import './room.css';

function resolveGameRoute(gameID: string, topicID: string, roomID: string): string {
  if (gameID === 'nusa-card' || gameID === 'card') return `/play/${gameID}/${topicID}/${roomID}/nusa-card`;
  if (gameID === 'nusa-card-vs-ai' || gameID === 'card-vs-ai') return `/play/${gameID}/${topicID}/${roomID}/nusa-card-vs-ai`;
  if (gameID === 'ular-tangga' || gameID === 'snake-ladder') return `/play/${gameID}/${topicID}/${roomID}/ular-tangga`;
  if (gameID === 'ular-tangga-vs-ai' || gameID === 'snake-ladder-vs-ai') return `/play/${gameID}/${topicID}/${roomID}/ular-tangga-vs-ai`;
  return `/lobby/${topicID}/${gameID}`;
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const playerUID = useMemo(() => 'guest-' + Math.random().toString(36).slice(2, 8), []);
  const playerName = useRef('Player').current;
  const isInitialized = true;

  const gameID = params.gameID as string;
  const topicID = params.topicID as string;
  const roomID = params.roomID as string;

  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFirstPlayer, setIsFirstPlayer] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (!topicID || !gameID) return;
    setLoading(true);
    let timedOut = false;
    const unsubRooms = subscribeRooms(topicID, gameID, (rooms) => {
      if (rooms?.[roomID]) { setRoomData(rooms[roomID]); timedOut = true; setLoading(false); }
    });
    setTimeout(() => { if (!timedOut) { setRoomData(null); setLoading(false); } }, 3000);
    return () => unsubRooms();
  }, [topicID, gameID, roomID]);

  useEffect(() => {
    if (!isInitialized || loading) return;
    const checkAndJoin = async () => {
      try {
        if (!hasJoined) {
          const { ref, set, get } = await import('firebase/database');
          const { firebaseDb } = await import('@/src/lib/firebase/client');
          const roomPath = `rooms/${topicID}/${gameID}/${roomID}`;
          const roomRef = ref(firebaseDb!, roomPath);
          const snap = await get(roomRef);
          if (!snap.exists()) {
            await set(roomRef, {
              isSinglePlayer: false, capacity: 4, currentPlayers: 0,
              gameStatus: 'waiting', players: {},
              lastResetAt: new Date().toISOString(),
            });
          }
          await playerJoinRoom(topicID, gameID, roomID, playerUID, playerName, null);
          setHasJoined(true);
        }
      } catch {}
    };
    checkAndJoin();
  }, [isInitialized, playerUID, loading, topicID, gameID, roomID, hasJoined, router]);

  useEffect(() => {
    if (!roomID || roomID === 'room5') return;
    const fetchPlayers = async () => {
      const currentPlayers = await getCurrentPlayers(topicID, gameID, roomID);
      setPlayers(currentPlayers);
      setIsFirstPlayer(currentPlayers.length <= 1);
    };
    fetchPlayers();
    const interval = setInterval(fetchPlayers, 3000);
    return () => clearInterval(interval);
  }, [topicID, gameID, roomID]);

  useEffect(() => {
    if (!roomID) return;
    const unsubGameStart = subscribeToGameStart(topicID, gameID, roomID, (gameStarted) => {
      if (gameStarted) router.push(resolveGameRoute(gameID, topicID, roomID));
    });
    return () => unsubGameStart();
  }, [topicID, gameID, roomID, router]);

  useEffect(() => {
    return () => { if (hasJoined && playerUID) void playerLeaveRoom(topicID, gameID, roomID, playerUID); };
  }, [topicID, gameID, roomID, playerUID, hasJoined]);

  // Deduplicate players by UID
  const uniquePlayers = players.filter((p, i, arr) => arr.findIndex(x => x.uid === p.uid) === i);
  const maxSlots = 4;
  const slotPlayers = [...uniquePlayers];
  while (slotPlayers.length < maxSlots) { slotPlayers.push(null as any); }

  if (loading) {
    return (
      <div className="room-loading">
        <div className="room-loading-spinner" />
        <p>Loading room...</p>
      </div>
    );
  }

  return (
    <div className="room-scene">
      <div className="room-bg">
        <Image src={background.kayu} alt="" fill className="room-bg-img" />
      </div>

      {/* Dinding pattern overlay */}
      <div className="room-wall-overlay" />

      {/* Top header — nyatu kaya ProfileHeader */}
      <div className="room-header-wrapper">
        <img src={information.tanamankiri} alt="" className="room-header-branch room-header-branch-left" />
        <div className="room-header-board">
          <Image src={information.board1} alt="" fill className="room-board-img" />
          <span className="room-board-text">{roomID.replace('room', 'RUANG ')}</span>
        </div>
        <img src={information.tanamankanan} alt="" className="room-header-branch room-header-branch-right" />
      </div>

      {/* Subtitle */}
      <p className="room-subtitle">Pilih pemain yang siap bertanding</p>

      {/* Meja arena */}
      <div className="room-arena">

        {/* Player slots di sekeliling meja */}
        <div className="room-slots-container">
          {slotPlayers.map((player: any, idx) => (
            <div key={idx} className={`room-player-slot ${player ? 'filled' : 'empty'}`}>
              <div className="room-player-avatar-ring">
                <div className="room-player-avatar">
                  {player ? (
                    player.photoURL ? (
                      <img src={player.photoURL} alt="" className="room-player-img" />
                    ) : (
                      <span className="room-player-initial">{(player.name || '?')[0]}</span>
                    )
                  ) : (
                    <span className="room-player-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </span>
                  )}
                </div>
                {player && player.uid === playerUID && <div className="room-player-owner-badge">KAMU</div>}
              </div>
              <div className="room-player-nameplate">
                {player ? (
                  <span className="room-player-name">{player.name}</span>
                ) : (
                  <span className="room-player-name dim">Tersedia</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info bar */}
      <div className="room-info-bar">
        <span className="room-info-chip">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          Menunggu {players.length}/{maxSlots} pemain
        </span>
      </div>

      {/* Actions */}
      <div className="room-actions">
        {isFirstPlayer ? (
          <button className="room-btn-start" onClick={async () => {
            try { await startGameInRoom(topicID, gameID, roomID); router.push(resolveGameRoute(gameID, topicID, roomID)); } catch {}
          }} disabled={players.length < 2}>
            {players.length < 2 ? 'Menunggu pemain lain...' : 'Mulai Game'}
          </button>
        ) : (
          <div className="room-waiting-msg">
            <div className="room-waiting-dots"><span /><span /><span /></div>
            <span>Menunggu tuan rumah memulai game</span>
          </div>
        )}
        <button className="room-btn-back" onClick={() => router.push(`/lobby/${topicID}/${gameID}`)}>
          Kembali ke Lobby
        </button>
      </div>

    </div>
  );
}

