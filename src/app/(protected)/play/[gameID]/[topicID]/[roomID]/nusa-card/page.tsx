"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import GameBackground from "../../../../../../../features/game-nuca/components/GameBackground";
import GameArea, { type GameAreaPlayer } from "../../../../../../../features/game-nuca/components/GameArea";
import type { PlayerCard } from "../../../../../../../features/game-nuca/components/PlayerHandCards";
import type { QuestionFeedback } from "../../../../../../../features/game-nuca/components/QuestionModal";
import RankModal from "../../../../../../../features/game-nuca/components/RankModal";
import PauseModal from "../../../../../../../components/layout/PauseModal";
import SettingButton from "../../../../../../../components/layout/SettingButton";
import BackButton from "../../../../../../../components/ui/BackButton";
import Loader from "../../../../../../../components/ui/Loader";
import { useAuth } from "../../../../../../../features/auth/hooks/useAuth";
import { claimGameReward, getUserProfile, consumePotion, recordMatchOutcome, type GameReward } from "../../../../../../../services/firebase/firestore/users.service";

import {
  fetchGamePlayers,
  listenToGameStart,
  type GamePlayer,
} from "../../../../../../../features/game-ular-tangga/services/ular-tangga-game.service";
import { playerJoinRoom, playerLeaveRoom, markPlayerInactiveInRoom } from "../../../../../../../features/lobby/services/lobby.service";
import {
  listenToGameState,
  throwCard,
  submitAnswer,
  updatePlayerActivity,
  setPlayerOffline,
  checkAndInvalidateIfIdle,
  checkAndFinalizeSoleSurvivor,
  handleThrowTimeout,
  isPlayerStale,
  SOLE_SURVIVOR_STALE_MS,
  type NusaCardGameState,
} from "../../../../../../../features/game-nuca/services/nusa-card-game.service";

const CARD_HUES = ["#f2a314", "#f3b02a", "#f1a52a", "#ef9917", "#e8b74a"];
const ACTIVITY_INTERVAL_MS = 30_000;
// Berapa lama feedback bener/salah kelihatan sebelum modal beneran ketutup.
const ANSWER_FEEDBACK_MS = 1400;

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
  const [answerFeedback, setAnswerFeedback] = useState<QuestionFeedback | null>(null);

  const gameStartedRef = useRef(false);
  useEffect(() => { gameStartedRef.current = gameStarted; }, [gameStarted]);

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
      // Sama pola kayak ular-tangga: kalau game BELUM mulai, keluarin dari
      // room; kalau SUDAH mulai, tandain offline aja (biar bisa reconnect &
      // biar bot-takeover di bawah bisa kedeteksi).
      if (isJoined) {
        if (!gameStartedRef.current) {
          playerLeaveRoom(topicID, gameID, roomKey, user.uid).catch(() => {});
        } else {
          void setPlayerOffline(roomKey, user.uid);
          // `setPlayerOffline` cuma nyentuh gameState (playerActivity) —
          // badge okupansi lobby (RoomSelect.tsx) baca `room.players[uid]
          // .isActive`, field TERPISAH yang gak pernah ke-update kalau
          // keluar mid-game, bikin room ke-lock "Sedang Bermain" selamanya
          // walau pemainnya udah lama kabur. Update juga di sini.
          void markPlayerInactiveInRoom(roomKey, user.uid);
        }
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

  // ── Subscribe gameState ──────────────────────────────────────────────────
  useEffect(() => {
    if (!gameStarted || !topicID || !gameID || !roomID) return;
    const unsub = listenToGameState(roomKey, (state) => {
      setGameState(state);
      setLoading(false);

      if (!state) return;
      // 'finished' TIDAK auto-redirect — RankModal di bawah yang nangani,
      // user klik tombolnya sendiri buat lanjut. 'abandoned' tetap ke
      // lobby. 'timeout' (idle global 8 menit) balik ke HOME.
      if (state.gameStatus === "abandoned") {
        router.push(lobbyPath);
      } else if (state.gameStatus === "timeout") {
        router.push("/home");
      }
    });
    return () => unsub();
  }, [gameStarted, topicID, gameID, roomKey, lobbyPath, router]);

  // ── Heartbeat berkala + cek idle global ──────────────────────────────────
  useEffect(() => {
    if (!myUID || !gameStarted) return;

    void updatePlayerActivity(roomKey, myUID);
    const timer = setInterval(() => {
      void updatePlayerActivity(roomKey, myUID);
      // Idle GLOBAL (bukan per-pemain) — aman dipanggil dari client manapun,
      // idempotent lewat guard gameStatus di dalam fungsinya sendiri.
      void checkAndInvalidateIfIdle(roomKey);
    }, ACTIVITY_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [myUID, gameStarted, roomKey]);

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
    // `id` di-suffix per SLOT (bukan cuma id soal asli) — kalau konten soal
    // di database masih tipis (bisa aja cuma 1 soal approved per region),
    // 2+ kartu di tangan yang sama bisa punya soal identik; `id` di sini
    // TETAP harus unik biar React key & tracking "kartu mana yang dipilih"
    // gak numbuk. `questionId` (id soal ASLI) dipisah, itu yang dikirim ke
    // throwCard.
    return (gameState.playerHands?.[myUID] ?? []).map((q, index) => ({
      id: `${q.id}-${index}`,
      questionId: q.id,
      title: q.text,
      subtitle: "Q",
      hue: CARD_HUES[index % CARD_HUES.length],
    }));
  }, [gameState, myUID]);

  const throwerUID = gameState ? gameState.players?.[gameState.currentThrowerIndex]?.uid ?? null : null;
  const isMyTurnToThrow = throwerUID === myUID && !gameState?.activeQuestion;
  const isMyTurnToAnswer = gameState?.currentAnsweringUID === myUID && Boolean(gameState?.activeQuestion);

  // Batas 10 detik buat lempar kartu berlaku ke SEMUA pemain (bukan cuma
  // yang disconnect) — SETIAP client yang lihat cincin mundurnya nyampe 0
  // manggil ini sendiri-sendiri; guard idempoten di service yang nge-atur
  // biar cuma 1 yang beneran ke-apply, jadi aman biarpun manggil bareng.
  const handleThrowTimeoutTrigger = useCallback(() => {
    if (!throwerUID) return;
    void handleThrowTimeout(roomKey, throwerUID);
  }, [throwerUID, roomKey]);

  const handleSelectCard = (cardId: string) => {
    if (!isMyTurnToThrow || selectedCardId) return;
    setSelectedCardId(cardId);
  };

  const handlePlayAnimationDone = useCallback(async (_slotId: string, questionId: string) => {
    setSelectedCardId(null);
    if (!myUID) return;
    await throwCard(roomKey, myUID, questionId);
  }, [myUID, roomKey]);

  const handleSubmitAnswer = useCallback(async (index: number) => {
    if (!myUID || isResolving || !gameState?.activeQuestion) return;
    setIsResolving(true);
    // Snapshot soal & pilihan SEKARANG (bukan cuma correctIndex) — begitu
    // submitAnswer resolve, gameState.activeQuestion di server langsung
    // di-null-in, jadi kalau QuestionModal masih ngandelin activeQuestion
    // LIVE selama jendela feedback, soalnya udah keburu ilang dan jatoh ke
    // placeholder default component itu, sementara correctIndex tetep
    // nunjuk ke soal asli — ketampil soal yang beda sama jawaban benernya.
    const { text: question, options: choices, correctIndex } = gameState.activeQuestion;
    try {
      await submitAnswer(roomKey, myUID, index);
      setAnswerFeedback({ selectedIndex: index, correctIndex, question, choices });
      setTimeout(() => setAnswerFeedback(null), ANSWER_FEEDBACK_MS);
    } finally {
      setIsResolving(false);
    }
  }, [myUID, isResolving, roomKey, gameState?.activeQuestion]);

  // Batas 8 detik buat jawab, pola watchdog yang sama kayak throw-timer di
  // atas — SETIAP client yang lihat cincin mundurnya nyampe 0 manggil ini
  // sendiri-sendiri dengan index yang PASTI salah. Kalau akunya SENDIRI yang
  // telat, lewat `handleSubmitAnswer` biasa (biar dapet feedback shake/merah
  // yang sama kayak salah manual); kalau lagi jadi watchdog buat pemain LAIN
  // (misal tab-nya keburu ketutup), langsung ke `submitAnswer` — gak perlu
  // nampilin feedback lokal punya orang lain. Guard server
  // (`currentAnsweringUID === answeringUID`) mastiin cuma 1 yang beneran
  // ke-apply, jadi aman biarpun beberapa client manggil bareng.
  const handleAnswerTimeoutTrigger = useCallback(() => {
    const answeringUID = gameState?.currentAnsweringUID;
    const activeQuestion = gameState?.activeQuestion;
    if (!answeringUID || !activeQuestion) return;
    const wrongIndex = activeQuestion.options.findIndex((_, i) => i !== activeQuestion.correctIndex);
    if (wrongIndex === -1) return;
    if (answeringUID === myUID) {
      void handleSubmitAnswer(wrongIndex);
    } else {
      void submitAnswer(roomKey, answeringUID, wrongIndex);
    }
  }, [gameState?.currentAnsweringUID, gameState?.activeQuestion, myUID, handleSubmitAnswer, roomKey]);

  // ── OFFLINE-TURN RESILIENCE ──────────────────────────────────────────────
  // Mirip bot-takeover di ular-tangga: kalau pemain yang lagi kebagian
  // lempar/jawab ternyata stale (disconnect), pemain aktif PERTAMA (urutan
  // seat) otomatis lempar kartu random / jawab random buat dia, biar game
  // gak macet nunggu orang yang udah gak online.
  const lastBotActionRef = useRef<string | null>(null);
  useEffect(() => {
    if (!gameStarted || !gameState || gameState.gameStatus !== "playing" || isPaused) return;
    const ts = Date.now();

    const firstActiveUID = orderedPlayers.find((p) => {
      const act = gameState.playerActivity?.[p.uid];
      return act ? !isPlayerStale(act, ts) : true;
    })?.uid;
    if (firstActiveUID !== myUID) return;

    if (!gameState.activeQuestion && throwerUID && throwerUID !== myUID) {
      const activity = gameState.playerActivity?.[throwerUID];
      if (isPlayerStale(activity, ts)) {
        const hand = gameState.playerHands?.[throwerUID] ?? [];
        const key = `throw:${throwerUID}:${hand.length}`;
        if (hand.length > 0 && lastBotActionRef.current !== key) {
          lastBotActionRef.current = key;
          const card = hand[Math.floor(Math.random() * hand.length)];
          void throwCard(roomKey, throwerUID, card.id);
        }
      }
    }

    if (gameState.activeQuestion && gameState.currentAnsweringUID && gameState.currentAnsweringUID !== myUID) {
      const answeringUID = gameState.currentAnsweringUID;
      const activity = gameState.playerActivity?.[answeringUID];
      if (isPlayerStale(activity, ts)) {
        const key = `answer:${answeringUID}:${gameState.activeQuestion.id}`;
        if (lastBotActionRef.current !== key) {
          lastBotActionRef.current = key;
          const randomIndex = Math.floor(Math.random() * gameState.activeQuestion.options.length);
          void submitAnswer(roomKey, answeringUID, randomIndex);
        }
      }
    }
  }, [gameStarted, gameState, isPaused, throwerUID, myUID, roomKey, orderedPlayers]);

  // ── SOLE-SURVIVOR AUTO-FINISH ────────────────────────────────────────────
  // Kalau lawan-lawan keluar/disconnect tanpa sempet ngabisin kartu (jadi
  // throwCard/submitAnswer gak pernah kepanggil buat nutup game-nya), pemain
  // aktif TERAKHIR yang tersisa yang mendeteksi & nge-trigger penyelesaian
  // game ini sendiri — sama pola persis kayak ular-tangga. Realtime lewat
  // effect ini (re-fire tiap gameState berubah), bukan nunggu heartbeat 30s.
  useEffect(() => {
    if (!gameStarted || !gameState || gameState.gameStatus !== "playing" || !myUID) return;

    const nonFinished = gameState.players.filter((p) => !gameState.finishedOrder.includes(p.uid));
    if (nonFinished.length <= 1) return;

    const ts = Date.now();
    const activeNonFinished = nonFinished.filter(
      (p) => !isPlayerStale(gameState.playerActivity?.[p.uid], ts, SOLE_SURVIVOR_STALE_MS),
    );

    if (activeNonFinished.length === 1 && activeNonFinished[0].uid === myUID) {
      void checkAndFinalizeSoleSurvivor(roomKey);
    }
  }, [gameStarted, gameState, myUID, roomKey]);

  const rankedPlayers = useMemo(() => {
    if (!gameState) return [];
    return gameState.finishedOrder.map((uid) => {
      const p = gameState.players.find((pl) => pl.uid === uid);
      return { uid, name: p?.displayName ?? "Pemain", photoURL: p?.photoURL };
    });
  }, [gameState]);

  // ── Reward badge/potion begitu game kelar ────────────────────────────────
  // Rank 1-3 doang yang dapet (badge.gold1/silver1/bronze1 di RankModal) —
  // ke-4+ gak dapet apa-apa, sama kayak kondisi menang yang emang udah ada
  // (gak diubah, cuma nambah efek samping hadiah di atasnya). Idempotent
  // lewat `rewardsClaimedBy` di gameState sendiri (dijaga di claimGameReward),
  // jadi aman kepanggil ulang tiap gameState berubah.
  const [potionCount, setPotionCount] = useState(0);
  useEffect(() => {
    if (!myUID) return;
    void getUserProfile(myUID).then((result) => {
      if (result.success && result.data) setPotionCount(result.data.inventory?.potion ?? 0);
    });
  }, [myUID]);

  const handleUsePotion = useCallback(async () => {
    if (!myUID || isResolving || !gameState?.activeQuestion) return;
    const success = await consumePotion(myUID);
    if (!success) return;
    setPotionCount((count) => Math.max(0, count - 1));
    await handleSubmitAnswer(gameState.activeQuestion.correctIndex);
  }, [myUID, isResolving, gameState?.activeQuestion, handleSubmitAnswer]);

  const [myReward, setMyReward] = useState<GameReward | null>(null);
  useEffect(() => {
    if (!gameState || gameState.gameStatus !== "finished" || !myUID) return;
    const rank = gameState.finishedOrder.indexOf(myUID) + 1;
    if (rank < 1 || rank > 3) return;
    if (gameState.rewardsClaimedBy?.includes(myUID)) return;
    void claimGameReward(roomKey, myUID, rank as 1 | 2 | 3).then((reward) => {
      if (reward) setMyReward(reward);
    });
  }, [gameState, myUID, roomKey]);

  // Win-streak/achievement — jalan buat SEMUA pemain (menang atau kalah),
  // beda dari reward di atas yang cuma buat rank 1-3.
  useEffect(() => {
    if (!gameState || gameState.gameStatus !== "finished" || !myUID) return;
    if (gameState.statsRecordedBy?.includes(myUID)) return;
    const rank = gameState.finishedOrder.indexOf(myUID) + 1;
    const won = rank === 1;
    const durationMs = won ? gameState.lastUpdated - gameState.gameCreatedAt : undefined;
    void recordMatchOutcome(roomKey, myUID, won, durationMs);
  }, [gameState, myUID, roomKey]);

  // Lobby "RUANG X" (wood-themed) cuma ada satu tempat: halaman /room/...
  // Kalau gameStarted belum true di sini, arahkan balik — jangan render lobby
  // kedua yang beda desain. Navigasi HARUS di effect (bukan langsung di body
  // render kayak sebelumnya) — manggil router.replace() pas render bikin
  // React ngeluh "Cannot update a component (Router) while rendering a
  // different component".
  useEffect(() => {
    if (!loading && !gameStarted) {
      router.replace(roomPath);
    }
  }, [loading, gameStarted, roomPath, router]);

  if (loading) {
    return <Loader message="Memuat permainan NusaCard..." />;
  }

  if (!gameStarted) {
    return <Loader message="Memuat permainan NusaCard..." />;
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden">

      <div className="fixed inset-0 -z-10 bg-[#59a87d]">
        <GameBackground />
      </div>

      <div className="absolute left-10 lg:left-7 top-7 z-50">
        <BackButton href={roomPath} iconSize="md" />
      </div>

      <SettingButton onClick={() => setIsPaused(true)} />

      <GameArea
        players={orderedPlayers}
        hand={myHand}
        selectedCardId={selectedCardId}
        isMyTurnToThrow={isMyTurnToThrow}
        throwerUID={throwerUID}
        throwerTurnStartedAt={gameState?.throwerTurnStartedAt}
        onThrowTimeout={handleThrowTimeoutTrigger}
        answerTurnStartedAt={gameState?.answerTurnStartedAt}
        onAnswerTimeout={handleAnswerTimeoutTrigger}
        answeringUID={gameState?.currentAnsweringUID ?? null}
        activeQuestion={gameState?.activeQuestion ? { text: gameState.activeQuestion.text, options: gameState.activeQuestion.options } : null}
        isMyTurnToAnswer={isMyTurnToAnswer}
        isResolvingAnswer={isResolving}
        answerFeedback={answerFeedback}
        onSelectCard={handleSelectCard}
        onPlayAnimationComplete={handlePlayAnimationDone}
        onSubmitAnswer={handleSubmitAnswer}
        potionCount={potionCount}
        onUsePotion={handleUsePotion}
      />

      <RankModal
        isOpen={gameState?.gameStatus === "finished"}
        rankedPlayers={rankedPlayers}
        myUID={myUID}
        myReward={myReward}
        onContinue={() => router.push(lobbyPath)}
        onPlayAgain={() => router.push(roomPath)}
      />

      <PauseModal isOpen={isPaused} onClose={() => setIsPaused(false)} />
    </main>
  );
}
