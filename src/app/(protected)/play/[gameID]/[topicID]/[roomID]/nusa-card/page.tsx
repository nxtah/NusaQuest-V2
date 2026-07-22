"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import GameBackground from "../../../../../../../features/game-nuca/components/GameBackground";
import GameArea, { type GameAreaPlayer } from "../../../../../../../features/game-nuca/components/GameArea";
import type { PlayerCard } from "../../../../../../../features/game-nuca/components/PlayerHandCards";
import PauseModal from "../../../../../../../components/layout/PauseModal";
import SettingButton from "../../../../../../../components/layout/SettingButton";
import Loader from "../../../../../../../components/ui/Loader";
import UlarTanggaLobby from "../../../../../../../features/game-ular-tangga/components/UlarTanggaLobby";
import { useAuth } from "../../../../../../../features/auth/hooks/useAuth";

import {
  fetchGamePlayers,
  listenToGameStart,
  setGameStartStatus,
  type GamePlayer,
} from "../../../../../../../features/game-ular-tangga/services/ular-tangga-game.service";
import { playerJoinRoom, playerLeaveRoom } from "../../../../../../../features/lobby/services/lobby.service";
import {
  getQuestions,
  shuffle,
  initializeNusaCardGameState,
  listenToGameState,
  playCard,
  submitAnswer,
  setGameStatus,
  cleanupGame,
  type NusaCardGameState,
} from "../../../../../../../features/game-nuca/services/nusa-card-game.service";

const CARD_HUES = ["#f2a314", "#f3b02a", "#f1a52a", "#ef9917", "#e8b74a"];

export default function NusaCardPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const myUID = user?.uid ?? null;

  const gameID = String(params?.gameID ?? "");
  const topicID = String(params?.topicID ?? "");
  const roomID = String(params?.roomID ?? "");
  // Dokumen Firestore di-scope per game+topik+slot, bukan cuma slug roomID
  // mentah — biar sesi Ular Tangga & NusaCard yang kebetulan pakai slot sama
  // gak numpuk ke dokumen yang sama.
  const roomKey = `${gameID}_${topicID}_${roomID}`;
  const roomPath = `/room/${gameID}/${topicID}/${roomID}`;
  const lobbyPath = `/lobby/${topicID}/${gameID}`;

  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [gameState, setGameState] = useState<NusaCardGameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  // ── Join room + subscribe ke daftar pemain ──────────────────────────────
  useEffect(() => {
    if (!topicID || !gameID || !roomID || !user) return;
    let isJoined = false;

    playerJoinRoom(
      topicID, gameID, roomKey, user.uid,
      user.displayName || "Pemain",
      user.googlePhotoURL || user.firebasePhotoURL || undefined,
    ).then(() => { isJoined = true; }).catch(() => {});

    const unsub = fetchGamePlayers(topicID, gameID, roomKey, setPlayers);

    return () => {
      unsub();
      if (isJoined && !gameStarted) {
        playerLeaveRoom(topicID, gameID, roomKey, user.uid).catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicID, gameID, roomKey, user]);

  // ── Subscribe status "sudah mulai" ──────────────────────────────────────
  useEffect(() => {
    if (!topicID || !gameID || !roomID) return;
    const unsub = listenToGameStart(topicID, gameID, roomKey, (started) => {
      setGameStarted(started);
      if (!started) setLoading(false);
    });
    return () => unsub();
  }, [topicID, gameID, roomKey]);

  // ── Host menekan "Mulai Permainan" ───────────────────────────────────────
  const handleStartGame = async () => {
    if (players.length === 0) return;
    setLoading(true);
    try {
      const questions = shuffle(await getQuestions(topicID));
      if (questions.length === 0) {
        alert(`Peringatan: Tidak ada soal ditemukan untuk topik "${topicID}". Game akan berjalan tanpa soal.`);
      }
      const nusaCardPlayers = players.map((p) => ({
        uid: p.uid,
        displayName: p.displayName || p.name || "Pemain",
        photoURL: p.photoURL,
      }));
      await initializeNusaCardGameState(roomKey, nusaCardPlayers, questions);
      await setGameStatus(roomKey, "playing");
      await setGameStartStatus(topicID, gameID, roomKey, true);
    } catch (err) {
      console.error("Gagal bootstrap game NusaCard:", err);
      setLoading(false);
    }
  };

  // ── Subscribe gameState ──────────────────────────────────────────────────
  useEffect(() => {
    if (!gameStarted || !topicID || !gameID || !roomID) return;
    const unsub = listenToGameState(roomKey, (state) => {
      setGameState(state);
      setLoading(false);
    });
    return () => unsub();
  }, [gameStarted, topicID, gameID, roomKey]);

  // ── Redirect ke lobby sesaat setelah game selesai ────────────────────────
  useEffect(() => {
    if (gameState?.gameStatus !== "finished") return;
    const timeoutId = setTimeout(() => router.push(lobbyPath), 1800);
    return () => clearTimeout(timeoutId);
  }, [gameState?.gameStatus, lobbyPath, router]);

  useEffect(() => {
    if (!gameStarted) return;
    return () => {
      void cleanupGame(roomKey);
    };
  }, [gameStarted, roomKey]);

  // ── Susun ulang urutan pemain: aku selalu index 0 (slot bawah) ──────────
  const orderedPlayers: GameAreaPlayer[] = useMemo(() => {
    const source = gameState?.players ?? players.map((p) => ({ uid: p.uid, displayName: p.displayName || p.name || "Pemain", photoURL: p.photoURL }));
    const myIndex = source.findIndex((p) => p.uid === myUID);
    if (myIndex <= 0) return source.map((p) => ({ uid: p.uid, name: p.displayName, photoURL: p.photoURL }));
    const rotated = [...source.slice(myIndex), ...source.slice(0, myIndex)];
    return rotated.map((p) => ({ uid: p.uid, name: p.displayName, photoURL: p.photoURL }));
  }, [gameState?.players, players, myUID]);

  const myHand: PlayerCard[] = useMemo(() => {
    if (!gameState || !myUID) return [];
    // gameState?.playerHands bisa gak ada/format lama kalau ada sisa dokumen
    // gameState dari sesi game LAIN yang kebetulan numpuk (harusnya udah gak
    // kejadian lagi berkat roomKey per-game, tapi tetep dijaga biar gak crash).
    return (gameState.playerHands?.[myUID] ?? []).map((q, index) => ({
      id: q.id,
      title: q.text,
      subtitle: "Q",
      hue: CARD_HUES[index % CARD_HUES.length],
    }));
  }, [gameState, myUID]);

  const throwerUID = gameState ? gameState.players?.[gameState.throwerIndex]?.uid ?? null : null;
  const isMyTurnToThrow = throwerUID === myUID && !gameState?.activeQuestion;
  const isMyTurnToAnswer = gameState?.currentAnsweringUID === myUID && Boolean(gameState?.activeQuestion);

  const handleSelectCard = (cardId: string) => {
    if (!isMyTurnToThrow || selectedCardId) return;
    setSelectedCardId(cardId);
  };

  const handlePlayAnimationDone = useCallback(async (cardId: string) => {
    setSelectedCardId(null);
    if (!myUID) return;
    await playCard(roomKey, myUID, cardId);
  }, [myUID, roomKey]);

  const handleSubmitAnswer = useCallback(async (index: number) => {
    if (!myUID || isResolving) return;
    setIsResolving(true);
    try {
      await submitAnswer(roomKey, myUID, index);
    } finally {
      setIsResolving(false);
    }
  }, [myUID, isResolving, roomKey]);

  if (loading) {
    return <Loader message="Memuat permainan NusaCard..." />;
  }

  if (!gameStarted) {
    return (
      <main className="relative h-screen w-screen overflow-hidden">
        <UlarTanggaLobby players={players} onStartGame={handleStartGame} topicID={topicID} roomID={roomID} myUID={myUID} />
      </main>
    );
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden">

      <div className="fixed inset-0 -z-10 bg-[#59a87d]">
        <GameBackground />
      </div>

      <button
        onClick={() => router.push(roomPath)}
        className="absolute left-10 lg:left-7 top-7 z-50 text-white transition-transform"
        aria-label="Kembali"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <SettingButton onClick={() => setIsPaused(true)} />

      {gameState?.gameStatus === "finished" && (
        <div className="absolute top-20 left-1/2 z-40 -translate-x-1/2 rounded-lg bg-white/95 px-6 py-3 text-lg font-bold text-[#1f2a1f] shadow-lg">
          {gameState.winnerUID === myUID ? "Kamu menang!" : "Pemain lain menang!"}
        </div>
      )}

      <GameArea
        players={orderedPlayers}
        hand={myHand}
        selectedCardId={selectedCardId}
        isMyTurnToThrow={isMyTurnToThrow}
        throwerUID={throwerUID}
        answeringUID={gameState?.currentAnsweringUID ?? null}
        queueUIDs={gameState?.answeringQueue ?? []}
        answeredUIDs={gameState?.answeredUIDs ?? []}
        activeQuestion={gameState?.activeQuestion ? { text: gameState.activeQuestion.text, options: gameState.activeQuestion.options } : null}
        isMyTurnToAnswer={isMyTurnToAnswer}
        isResolvingAnswer={isResolving}
        onSelectCard={handleSelectCard}
        onPlayAnimationComplete={handlePlayAnimationDone}
        onSubmitAnswer={handleSubmitAnswer}
      />

      <PauseModal isOpen={isPaused} onClose={() => setIsPaused(false)} />
    </main>
  );
}
