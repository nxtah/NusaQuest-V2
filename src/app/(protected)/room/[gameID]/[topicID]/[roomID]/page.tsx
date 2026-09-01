'use client';

import {useEffect, useRef, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import Image from 'next/image';
import {doc, setDoc} from 'firebase/firestore';
import {firebaseFirestore} from '@/src/lib/firebase/client';
import {
  listenToRoomPlayers,
  playerJoinRoom,
  playerLeaveRoom,
  subscribeToGameStart,
  startGameInRoom,
  addBotToRoom,
  removeBotFromRoom,
  type RoomPlayerOld,
} from '@/src/features/lobby/services/lobby.service';
import {useAuth} from '@/src/features/auth/hooks/useAuth';
import {
  getQuestions as getUlarTanggaQuestions,
  shuffle,
  initializeUlarTanggaGameState,
  setGameStatus as setUlarTanggaGameStatus,
  checkAndResetAbandonedRoom,
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

// Durasi efek "join" (kartu turun + cincin emas ngembang) di slot pemain —
// disamain sama panjang animasi CSS-nya (room.css: roomSlotArrive 620ms +
// roomStampRing 700ms), dikasih sedikit ekstra biar gak kepotong.
const JOIN_EFFECT_MS = 900;

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
  // `isVsAi` di atas ngecek gameID — TAPI RoomSelect ("rumah" vs-AI di
  // lobby) gak pernah ngirim gameID kayak gitu, dia cuma nambahin roomID
  // jadi "roomvs-ai" sambil gameID-nya TETEP 'ular-tangga'/'nusa-card'
  // biasa (lihat RoomSelect.tsx: `room${house.id}` dengan house.id='vs-ai').
  // Jadi `isVsAi` di atas SELALU false buat room vs-AI yang beneran dipake
  // — deteksi yang bener buat fitur tambah-bot ini emang harus dari roomID,
  // bukan gameID. Sengaja dibikin konstanta terpisah (bukan nge-fix
  // `isVsAi` yang udah ada) biar gak ngubah perilaku lain di halaman ini
  // yang mungkin masih ngandelin `isVsAi` versi lama.
  const isVsAiRoom = roomID === 'roomvs-ai' || roomID === 'vs-ai';
  // Dokumen Firestore di-scope per game+topik+slot, bukan cuma slug roomID
  // mentah ("room1") — kalau enggak, sesi Ular Tangga dan NusaCard yang
  // kebetulan pakai slot yang sama bakal numpuk ke dokumen yang sama persis.
  const roomKey = `${gameID}_${topicID}_${roomID}`;

  const [players, setPlayers] = useState<RoomPlayerOld[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [starting, setStarting] = useState(false);
  const [botBusy, setBotBusy] = useState(false);
  // true setelah checkAndResetAbandonedRoom selesai — gate buat subscribeToGameStart
  const [roomChecked, setRoomChecked] = useState(false);
  // Room udah 'playing' dan kita bukan salah satu pemain yang udah gabung —
  // jangan di-join, tampilin pesan "sedang dipakai" aja. null = belum tau /
  // gak locked.
  const [roomLocked, setRoomLocked] = useState<{ activeCount: number } | null>(null);
  // Efek "join" (lihat room.css: .just-joined) — UID pemain yang lagi
  // dalam jendela animasi kedatangannya. `knownUidsRef` nyimpen UID dari
  // snapshot SEBELUMNYA (null = belum pernah nerima snapshot sama sekali)
  // biar snapshot PERTAMA (isi room saat kita baru buka halaman) gak ikut
  // ke-anggep "baru join" — animasi cuma nyala buat kedatangan yang
  // BENERAN kejadian selagi kita lagi liat halaman ini.
  const [justJoinedUids, setJustJoinedUids] = useState<Set<string>>(new Set());
  const knownUidsRef = useRef<Set<string> | null>(null);
  const joinTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  function diffAndMarkNewcomers(currentPlayers: RoomPlayerOld[]) {
    const currentUids = new Set(currentPlayers.map((p) => p.uid));
    const previousUids = knownUidsRef.current;
    if (previousUids) {
      const newcomers = [...currentUids].filter((uid) => !previousUids.has(uid));
      if (newcomers.length > 0) {
        setJustJoinedUids((prev) => {
          const next = new Set(prev);
          newcomers.forEach((uid) => next.add(uid));
          return next;
        });
        newcomers.forEach((uid) => {
          const existingTimer = joinTimersRef.current.get(uid);
          if (existingTimer) clearTimeout(existingTimer);
          const timer = setTimeout(() => {
            joinTimersRef.current.delete(uid);
            setJustJoinedUids((prev) => {
              if (!prev.has(uid)) return prev;
              const next = new Set(prev);
              next.delete(uid);
              return next;
            });
          }, JOIN_EFFECT_MS);
          joinTimersRef.current.set(uid, timer);
        });
      }
    }
    knownUidsRef.current = currentUids;
  }

  // Join room begitu auth siap. Dokumen room dibuat kalau belum ada.
  useEffect(() => {
    if (!isInitialized || !playerUID || hasJoined) return;
    let isActive = true;

    const photoURL = user?.firebasePhotoURL || user?.googlePhotoURL || null;

    // Coba join langsung dulu (1 read, di dalam playerJoinRoom) alih-alih
    // getDoc kepunyaan-sendiri + setDoc-kalau-belum-ada + playerJoinRoom
    // (yang juga getDoc sendiri) berurutan — kasus paling umum (room udah
    // ada, revisit) dulu 3 read berantai buat 1 dokumen yang sama, sekarang
    // cuma 1. Room BENERAN baru (jarang, sekali per room) yang bayar lebih:
    // gagal join dulu ("Room not found"), baru dibikin, baru join ulang.
    const join = async () => {
      try {
        // Reset room ke 'waiting' kalau sesi game sebelumnya sudah selesai/ditinggal.
        // HARUS selesai sebelum subscribeToGameStart mulai — setRoomChecked(true)
        // di bawah adalah gate-nya. Ini juga yang bikin room 'playing' yang
        // sebenarnya udah ditinggal semua orang gak ke-lock permanen di sini.
        await checkAndResetAbandonedRoom(roomKey);

        try {
          await playerJoinRoom(topicID, gameID, roomKey, playerUID, playerName, photoURL);
        } catch (err) {
          if (err instanceof Error && err.message === 'Room not found') {
            const roomRef = doc(firebaseFirestore!, 'rooms', roomKey);
            try {
              // `players` sengaja gak diikutkan di sini + pakai merge:true —
              // kalau 2 orang join room baru barengan, setDoc gak boleh
              // nimpa `players` yang udah ditulis orang lain lewat
              // playerJoinRoom. Nama field HARUS `status`/`maxPlayers` (bukan
              // `gameStatus`/`capacity`/`isSinglePlayer` kayak sebelumnya) —
              // itu field yang beneran dibaca `subscribeToGameStart`
              // (lobby.service.ts) dan `checkRoomType` (`room.maxPlayers===1`
              // buat derive vs-AI), field lama itu gak pernah kebaca siapapun.
              await setDoc(roomRef, {
                maxPlayers: isVsAi ? 1 : 4, currentPlayers: 0,
                status: 'waiting',
                lastResetAt: new Date().toISOString(),
              }, {merge: true});
            } catch (setDocErr) {
              // Race lumrah: orang lain udah bikin room-nya duluan sepersekian
              // detik sebelum kita — bukan error fatal, lanjut aja ke join
              // ulang. Tetap di-log (bukan diem-diem ditelan) biar kalau
              // gagalnya BUKAN gara-gara race (mis. rules/permission), masih
              // ketauan dari console alih-alih nyamar jadi "Room not found"
              // yang membingungkan di percobaan join berikutnya.
              console.warn('Gagal bikin dokumen room baru (kemungkinan race, lanjut coba join lagi):', setDocErr);
            }
            // Retry sampai 3x dengan jeda pendek — nyerap kemungkinan delay
            // konsistensi baca-abis-tulis Firestore, bukan cuma 1x nembak
            // ulang yang kalau kebetulan kepepet delay itu ikutan gagal dan
            // muncul sebagai error "Room not found" yang sama di console.
            let lastErr: unknown = err;
            for (let attempt = 0; attempt < 3; attempt++) {
              try {
                await playerJoinRoom(topicID, gameID, roomKey, playerUID, playerName, photoURL);
                lastErr = null;
                break;
              } catch (retryErr) {
                lastErr = retryErr;
                if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 400));
              }
            }
            if (lastErr) throw lastErr;
          } else {
            throw err;
          }
        }

        if (isActive) {
          setHasJoined(true);
          setRoomChecked(true); // Baru aktifkan subscribeToGameStart setelah reset selesai
        }
      } catch (error) {
        // Room udah 'playing' dan kita bukan pemainnya — tampilin pesan
        // "sedang dipakai" (dulu lolos begitu aja, lalu ke-redirect ke
        // /play/... oleh subscribeToGameStart padahal gameState-nya gak
        // pernah di-init buat kita, nyangkut di layar kosong).
        const code = (error as { code?: string })?.code;
        if (code === 'ROOM_LOCKED') {
          if (isActive) {
            setRoomLocked({ activeCount: (error as { activeCount?: number }).activeCount ?? 0 });
            setRoomChecked(true);
          }
        } else {
          console.error('Gagal join room:', error);
          if (isActive) {
            setJoinError('Gagal masuk ke room. Coba lagi.');
            setRoomChecked(true); // Tetap buka gate meskipun error join
          }
        }
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
      diffAndMarkNewcomers(currentPlayers);
      setPlayers(currentPlayers);
    });
    return () => unsub();
  }, [roomKey]);

  // Bersihin semua timer efek-join yang masih ngantri kalau halaman
  // di-unmount, biar gak ada setState nyusul ke komponen yang udah mati.
  useEffect(() => {
    const timers = joinTimersRef.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  useEffect(() => {
    if (!roomKey || !roomChecked) return;
    const unsubGameStart = subscribeToGameStart(topicID, gameID, roomKey, (gameStarted) => {
      if (gameStarted) router.push(resolveGameRoute(gameID, topicID, roomID));
    });
    return () => unsubGameStart();
  }, [topicID, gameID, roomID, roomKey, roomChecked, router]);

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
        // `role` WAJIB diikutkan — initializeUlarTanggaGameState pake ini
        // buat nyeed slot bot langsung stale (biar bot-takeover jalan dari
        // giliran pertama). Kehilangan field ini sebelumnya bikin bot
        // kelihatan kayak pemain asli yang fresh-active, jadi baru
        // ke-takeover 60 detik kemudian alih-alih langsung.
        const indexedPlayers = players.map((p, i) => ({
          uid: p.uid, displayName: p.name, photoURL: p.photoURL, playerIndex: i, role: p.role,
        }));
        await initializeUlarTanggaGameState(topicID, gameID, roomKey, indexedPlayers, questions);
        await setUlarTanggaGameStatus(topicID, gameID, roomKey, 'playing');
      } else if (gameID === 'nusa-card' || gameID === 'card') {
        const questions = shuffle(await getNusaCardQuestions(topicID));
        // Sama kayak Ular Tangga di atas — `role` wajib ikut biar bot
        // ke-seed stale dari awal, bukan fresh-active.
        const nusaCardPlayers = players.map((p) => ({uid: p.uid, displayName: p.name, photoURL: p.photoURL, role: p.role}));
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

  // Host isi slot kosong pake bot — bot langsung ikutan main game beneran
  // begitu "Mulai Game" ditekan (lewat mekanisme bot-takeover yang udah ada,
  // dibikin "langsung dianggap stale" pas game di-init — lihat
  // initializeUlarTanggaGameState/initializeNusaCardGameState).
  const handleAddBot = async () => {
    if (!playerUID || botBusy) return;
    setBotBusy(true);
    try {
      await addBotToRoom(roomKey, playerUID);
    } catch (error) {
      console.error('Gagal nambah bot:', error);
      setJoinError(error instanceof Error ? error.message : 'Gagal nambah bot.');
    } finally {
      setBotBusy(false);
    }
  };

  const handleRemoveBot = async (botUid: string) => {
    if (!playerUID || botBusy) return;
    setBotBusy(true);
    try {
      await removeBotFromRoom(roomKey, botUid, playerUID);
    } catch (error) {
      console.error('Gagal hapus bot:', error);
      setJoinError(error instanceof Error ? error.message : 'Gagal hapus bot.');
    } finally {
      setBotBusy(false);
    }
  };

  const isFirstPlayer = players.length > 0 && players[0]?.uid === playerUID;
  const maxSlots = 4;
  const slotPlayers: (RoomPlayerOld | null)[] = [...players];
  while (slotPlayers.length < maxSlots) { slotPlayers.push(null); }

  if (loading) {
    return <Loader message="Memuat ruangan..." />;
  }

  if (roomLocked) {
    return (
      <div className="room-scene">
        <div className="room-bg">
          <Image src={background.kayu} alt="" fill className="room-bg-img" />
        </div>
        <div className="room-wall-overlay" />
        <div className="room-locked-message">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <rect x="4" y="11" width="16" height="9" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <h2>Room ini sedang dipakai</h2>
          <p>{roomLocked.activeCount} orang sedang bermain di room ini. Coba room lain, ya.</p>
          <button className="room-btn-back" onClick={() => router.push(`/lobby/${topicID}/${gameID}`)}>
            Kembali ke Lobby
          </button>
        </div>
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
      {joinError && <p className="room-join-error">{joinError}</p>}

      {/* Meja arena */}
      <div className="room-arena">

        {/* Player slots di sekeliling meja */}
        <div className="room-slots-container">
          {slotPlayers.map((player: RoomPlayerOld | null, idx) => {
            const isBot = player?.role === 'ai';
            const isMine = !!player && player.uid === playerUID;
            const justJoined = !!player && justJoinedUids.has(player.uid);
            const slotClassName = [
              'room-player-slot',
              player ? 'filled' : 'empty',
              isMine ? 'mine' : '',
              justJoined ? 'just-joined' : '',
            ].filter(Boolean).join(' ');
            return (
              <div key={idx} className={slotClassName}>
                <div className="room-player-avatar-ring">
                  <div className="room-player-avatar">
                    {player ? (
                      player.photoURL ? (
                        <img src={player.photoURL} alt="" className="room-player-img" />
                      ) : (
                        <span className="room-player-initial">{(player.name || '?')[0]}</span>
                      )
                    ) : isFirstPlayer && isVsAiRoom ? (
                      <button
                        type="button"
                        className="room-add-bot-btn"
                        onClick={handleAddBot}
                        disabled={botBusy}
                        aria-label="Tambah bot"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                      </button>
                    ) : (
                      <span className="room-player-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </span>
                    )}
                  </div>
                  {player && player.uid === playerUID && <div className="room-player-owner-badge">KAMU</div>}
                  {isBot && isFirstPlayer && isVsAiRoom && (
                    <button
                      type="button"
                      className="room-remove-bot-btn"
                      onClick={() => handleRemoveBot(player!.uid)}
                      disabled={botBusy}
                      aria-label="Hapus bot"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
                <div className="room-player-nameplate">
                  {player ? (
                    <span className="room-player-name">{player.name}{isBot ? ' 🤖' : ''}</span>
                  ) : isFirstPlayer && isVsAiRoom ? (
                    <span className="room-player-name dim">Tambah Bot</span>
                  ) : (
                    <span className="room-player-name dim">Tersedia</span>
                  )}
                </div>
              </div>
            );
          })}
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

