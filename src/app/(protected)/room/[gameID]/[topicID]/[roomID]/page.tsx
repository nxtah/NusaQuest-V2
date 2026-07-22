'use client';

import {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import Image from 'next/image';
import {
  listenToRoomPlayers,
  playerJoinRoom,
  playerLeaveRoom,
  subscribeToGameStart,
  startGameInRoom,
  type RoomPlayerOld,
} from '@/src/features/lobby/services/lobby.service';
import {useAuth} from '@/src/features/auth/hooks/useAuth';
import {
  getQuestions as getUlarTanggaQuestions,
  shuffle,
  initializeUlarTanggaGameState,
  setGameStatus as setUlarTanggaGameStatus,
} from '@/src/features/game-ular-tangga/services/ular-tangga-game.service';
import {
  getQuestions as getNusaCardQuestions,
  initializeNusaCardGameState,
  setGameStatus as setNusaCardGameStatus,
} from '@/src/features/game-nuca/services/nusa-card-game.service';
import { background } from '@/src/assets/images/background/cloudinaryAssets';
import { information } from '@/src/assets/images/information/cloudinaryAssets';
import Loader from '@/src/components/ui/Loader';
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
  const {user, isInitialized} = useAuth();
  const playerUID = user?.uid ?? null;
  const playerName = user?.displayName || 'Player';

  const gameID = params.gameID as string;
  const topicID = params.topicID as string;
  const roomID = params.roomID as string;
  const isVsAi = gameID === 'nusa-card-vs-ai' || gameID === 'card-vs-ai' || gameID === 'ular-tangga-vs-ai' || gameID === 'snake-ladder-vs-ai';
  // Dokumen Firestore di-scope per game+topik+slot, bukan cuma slug roomID
  // mentah ("room1") — kalau enggak, sesi Ular Tangga dan NusaCard yang
  // kebetulan pakai slot yang sama bakal numpuk ke dokumen yang sama persis.
  const roomKey = `${gameID}_${topicID}_${roomID}`;

  const [players, setPlayers] = useState<RoomPlayerOld[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [starting, setStarting] = useState(false);

  // Join room begitu auth siap. Dokumen room dibuat kalau belum ada.
  useEffect(() => {
    if (!isInitialized || !playerUID || hasJoined) return;
    let isActive = true;

    const join = async () => {
      try {
        const { doc, getDoc, setDoc } = await import('firebase/firestore');
        const { firebaseFirestore } = await import('@/src/lib/firebase/client');
        const roomRef = doc(firebaseFirestore!, 'rooms', roomKey);
        const snap = await getDoc(roomRef);
        if (!snap.exists()) {
          try {
            // `players` sengaja gak diikutkan di sini + pakai merge:true — kalau
            // 2 orang join room baru barengan, setDoc gak boleh nimpa `players`
            // yang udah ditulis orang lain lewat playerJoinRoom.
            await setDoc(roomRef, {
              isSinglePlayer: isVsAi, capacity: isVsAi ? 1 : 4, currentPlayers: 0,
              gameStatus: 'waiting',
              lastResetAt: new Date().toISOString(),
            }, {merge: true});
          } catch {
            // Race lumrah: orang lain udah bikin room-nya duluan sepersekian
            // detik sebelum kita — bukan error fatal, lanjut aja ke join.
          }
        }
        await playerJoinRoom(topicID, gameID, roomKey, playerUID, playerName, user?.firebasePhotoURL || user?.googlePhotoURL || null);
        if (isActive) setHasJoined(true);
      } catch (error) {
        console.error('Gagal join room:', error);
        if (isActive) setJoinError('Gagal masuk ke room. Coba lagi.');
      } finally {
        if (isActive) setLoading(false);
      }
    };
    join();

    return () => { isActive = false; };
  }, [isInitialized, playerUID, playerName, hasJoined, topicID, gameID, roomID, roomKey, user, isVsAi]);

  // Real-time: slot ke-update langsung begitu ada yang join/leave, gak nunggu polling.
  useEffect(() => {
    if (!roomKey) return;
    const unsub = listenToRoomPlayers(roomKey, (currentPlayers) => {
      setPlayers(currentPlayers);
    });
    return () => unsub();
  }, [roomKey]);

  useEffect(() => {
    if (!roomKey) return;
    const unsubGameStart = subscribeToGameStart(topicID, gameID, roomKey, (gameStarted) => {
      if (gameStarted) router.push(resolveGameRoute(gameID, topicID, roomID));
    });
    return () => unsubGameStart();
  }, [topicID, gameID, roomID, roomKey, router]);

  useEffect(() => {
    return () => { if (hasJoined && playerUID) void playerLeaveRoom(topicID, gameID, roomKey, playerUID); };
  }, [topicID, gameID, roomKey, playerUID, hasJoined]);

  // Host menekan "Mulai Game": bootstrap game-state yang BENERAN dulu (soal +
  // urutan pemain) sebelum flip status room ke 'playing'. Sebelumnya ini cuma
  // manggil startGameInRoom yang nulis skema gameStates generik yang gak
  // dipakai game manapun — status room keburu 'playing' duluan sebelum
  // initializeUlarTanggaGameState/initializeNusaCardGameState sempet jalan,
  // jadi halaman /play/... nyampe sana dengan gameState kosong (pemain gak
  // ke-detect / kartu gak ada) karena tombol "Mulai Permainan" versi
  // masing-masing game gak pernah sempet ke-klik.
  const handleStartGame = async () => {
    if (players.length === 0 || starting) return;
    setStarting(true);
    try {
      if (isVsAi) {
        await startGameInRoom(topicID, gameID, roomKey);
      } else if (gameID === 'ular-tangga' || gameID === 'snake-ladder') {
        const questions = shuffle(await getUlarTanggaQuestions(topicID));
        const indexedPlayers = players.map((p, i) => ({
          uid: p.uid, displayName: p.name, photoURL: p.photoURL, playerIndex: i,
        }));
        await initializeUlarTanggaGameState(topicID, gameID, roomKey, indexedPlayers, questions);
        await setUlarTanggaGameStatus(topicID, gameID, roomKey, 'playing');
      } else if (gameID === 'nusa-card' || gameID === 'card') {
        const questions = shuffle(await getNusaCardQuestions(topicID));
        const nusaCardPlayers = players.map((p) => ({uid: p.uid, displayName: p.name, photoURL: p.photoURL}));
        await initializeNusaCardGameState(roomKey, nusaCardPlayers, questions);
        await setNusaCardGameStatus(roomKey, 'playing');
      } else {
        await startGameInRoom(topicID, gameID, roomKey);
      }
      router.push(resolveGameRoute(gameID, topicID, roomID));
    } catch (error) {
      console.error('Gagal memulai game:', error);
      setJoinError('Gagal memulai game. Coba lagi.');
      setStarting(false);
    }
  };

  const isFirstPlayer = players.length > 0 && players[0]?.uid === playerUID;
  const maxSlots = 4;
  const slotPlayers: (RoomPlayerOld | null)[] = [...players];
  while (slotPlayers.length < maxSlots) { slotPlayers.push(null); }

  if (loading) {
    return <Loader message="Memuat ruangan..." />;
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
      {joinError && <p className="room-join-error">{joinError}</p>}

      {/* Meja arena */}
      <div className="room-arena">

        {/* Player slots di sekeliling meja */}
        <div className="room-slots-container">
          {slotPlayers.map((player: RoomPlayerOld | null, idx) => (
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
          {isVsAi ? 'Siap lawan AI' : `Menunggu ${players.length}/${maxSlots} pemain`}
        </span>
      </div>

      {/* Actions */}
      <div className="room-actions">
        {isFirstPlayer ? (
          <button
            className="room-btn-start"
            onClick={handleStartGame}
            disabled={starting || (!isVsAi && players.length < 2)}
          >
            {starting ? 'Menyiapkan game...' : isVsAi ? 'Mulai Game' : players.length < 2 ? 'Menunggu pemain lain...' : 'Mulai Game'}
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

