"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { nuca } from "../../../assets/images/nuca/cloudinaryAssets";
import PlayerProfileNuca, { type PlayerTurnStatus } from "./PlayerProfileNuca";
import PlayerHandCards, { type PlayerCard } from "./PlayerHandCards";
import QuestionModal, { type QuestionFeedback } from "./QuestionModal";

export interface GameAreaPlayer {
  uid: string;
  name: string;
  photoURL?: string;
}

export interface GameAreaActiveQuestion {
  text: string;
  options: string[];
}

interface GameAreaProps {
  /** Urutan pemain buat layout — index 0 selalu "aku" (slot bawah). */
  players: GameAreaPlayer[];
  hand: PlayerCard[];
  selectedCardId: string | null;
  isMyTurnToThrow: boolean;
  throwerUID: string | null;
  /** Kapan giliran lempar SEKARANG mulai (`gameState.throwerTurnStartedAt`) — dasar cincin hitung mundur 10 detik di avatar pelempar. */
  throwerTurnStartedAt?: number;
  /** Dipanggil (dari client manapun yang lagi liat) begitu hitung mundur lempar mencapai 0. */
  onThrowTimeout?: () => void;
  /** Kapan jendela jawab SEKARANG mulai (`gameState.answerTurnStartedAt`) — dasar cincin hitung mundur 8 detik di avatar penjawab. */
  answerTurnStartedAt?: number | null;
  /** Dipanggil (dari client manapun yang lagi liat) begitu hitung mundur jawab mencapai 0. */
  onAnswerTimeout?: () => void;
  /** Satu-satunya pemain yang lagi kebagian giliran jawab (bukan antrean semua orang). */
  answeringUID: string | null;
  activeQuestion: GameAreaActiveQuestion | null;
  isMyTurnToAnswer: boolean;
  isResolvingAnswer?: boolean;
  /** Feedback bener/salah abis submit — dipassing ke QuestionModal buat nyorot pilihan. */
  answerFeedback?: QuestionFeedback | null;
  onSelectCard: (cardId: string) => void;
  onPlayAnimationComplete: (cardId: string, questionId: string) => void;
  onSubmitAnswer: (index: number) => void;
  /** Stok potion pemain ini, buat tombol "Pakai Potion" di QuestionModal. */
  potionCount?: number;
  onUsePotion?: () => void;
}

function OpponentDeck({
  orientation,
  cardRotation = 0,
  stackDirection = 1,
}: {
  orientation: "vertical" | "horizontal";
  cardRotation?: number;
  stackDirection?: 1 | -1;
}) {
  return (
    <div className="relative h-[clamp(70px,14vmin,140px)] w-[clamp(50px,10vmin,100px)] lg:h-[clamp(108px,10vw,156px)] lg:w-[clamp(76px,6.4vw,116px)]">
      {[0, 1, 2, 3].map((index) => (
        <img
          key={index}
          src={nuca.nuca}
          alt="Kartu lawan"
          className="absolute h-[clamp(70px,14vmin,156px)] w-[clamp(50px,10vmin,116px)] lg:h-[clamp(108px,10vw,156px)] lg:w-[clamp(76px,6.4vw,116px)] rounded-lg shadow-lg ring-1 ring-white/20"
          style={
            orientation === "horizontal"
              ? { transform: `translateX(${index * -8 * stackDirection}px) rotate(${cardRotation}deg)` }
              : { transform: `translateY(${index * 8 * stackDirection}px) rotate(${cardRotation}deg)` }
          }
        />
      ))}
    </div>
  );
}

function PlayerSlot({
  player,
  status,
  orientation,
  throwerTurnStartedAt,
  onThrowTimeout,
  answerTurnStartedAt,
  onAnswerTimeout,
}: {
  player: GameAreaPlayer;
  status: PlayerTurnStatus;
  orientation: "vertical" | "horizontal";
  throwerTurnStartedAt?: number;
  onThrowTimeout?: () => void;
  answerTurnStartedAt?: number | null;
  onAnswerTimeout?: () => void;
}) {
  return (
    // Gap sebelumnya `clamp(6px,1.6vmin,2px)` — max (2px) lebih KECIL dari
    // min (6px), clamp jadinya malformed dan CSS resolve ke 2px MULU (nempel
    // banget). Diurutin ulang jadi min < preferred < max yang bener.
    <div className={`flex ${orientation === "vertical" ? "flex-col" : "flex-row"} items-center gap-[clamp(10px,2.6vmin,22px)]`}>
      <div className="z-30">
        <PlayerProfileNuca
          isActive={status === "thrower" || status === "answering"}
          status={status}
          sizeClassName="h-6 w-6 sm:h-10 sm:w-10 lg:h-11 lg:w-11"
          avatarUrl={player.photoURL}
          throwerTurnStartedAt={throwerTurnStartedAt}
          onThrowTimeout={onThrowTimeout}
          answerTurnStartedAt={answerTurnStartedAt}
          onAnswerTimeout={onAnswerTimeout}
        />
      </div>
      <div className="z-50">
        <OpponentDeck
          orientation={orientation}
          cardRotation={orientation === "vertical" ? 90 : 180}
        />
      </div>
    </div>
  );
}

export default function GameArea({
  players,
  hand,
  selectedCardId,
  isMyTurnToThrow,
  throwerUID,
  throwerTurnStartedAt,
  onThrowTimeout,
  answerTurnStartedAt,
  onAnswerTimeout,
  answeringUID,
  activeQuestion,
  isMyTurnToAnswer,
  isResolvingAnswer = false,
  answerFeedback = null,
  onSelectCard,
  onPlayAnimationComplete,
  onSubmitAnswer,
  potionCount = 0,
  onUsePotion,
}: GameAreaProps) {
  const me = players[0];
  // 2-4 pemain didukung (bukan cuma 4 tetap) — index 0 selalu "aku" (bawah),
  // sisanya (1-3 lawan) disebar ke slot yang paling wajar buat jumlahnya:
  // 1 lawan -> atas doang; 2 lawan -> kiri+kanan (nge-apit); 3 lawan -> atas+
  // kiri+kanan (layout asli, 4 pemain total).
  const opponents = players.slice(1);
  let top: GameAreaPlayer | undefined;
  let left: GameAreaPlayer | undefined;
  let right: GameAreaPlayer | undefined;
  if (opponents.length === 1) {
    [top] = opponents;
  } else if (opponents.length === 2) {
    [left, right] = opponents;
  } else {
    [top, left, right] = opponents;
  }

  const getStatus = (uid: string | undefined): PlayerTurnStatus => {
    if (!uid) return "idle";
    if (uid === throwerUID) return "thrower";
    if (uid === answeringUID) return "answering";
    return "idle";
  };

  const playedCard = useMemo(() => {
    if (!activeQuestion) return null;
    return { id: "active", title: activeQuestion.text, subtitle: "Q", hue: "#f2a314" };
  }, [activeQuestion]);

  // Instruksi teks giliran siapa lempar/jawab — cincin di avatar udah ada
  // tapi diminta ditambah teks yang jelas juga. "Kamu" dipakai kalau
  // giliran sendiri (lebih enak dibaca daripada nama sendiri).
  const throwerName = players.find((p) => p.uid === throwerUID)?.name;
  const answererName = players.find((p) => p.uid === answeringUID)?.name;
  const turnLabel = activeQuestion && answeringUID
    ? `Giliran ${isMyTurnToAnswer ? "kamu" : answererName ?? "..."} menjawab`
    : throwerUID
      ? `Giliran ${isMyTurnToThrow ? "kamu" : throwerName ?? "..."} melempar kartu`
      : null;

  // Cincin panah arah giliran "muter" tiap kali giliran lempar beneran
  // pindah ke pemain lain — bukan animasi dekoratif nonstop, tapi nempel ke
  // kejadian asli (throwerUID berubah), biar kerasa "klik" pas gantian.
  // Adjust state pas render (pola yang direkomendasikan React buat "reset/
  // update state pas dependency berubah"), bukan lewat useEffect — setState
  // sinkron di dalam effect kena lint error (bisa micu cascading render).
  const [rotationStep, setRotationStep] = useState(0);
  const [prevThrowerUID, setPrevThrowerUID] = useState(throwerUID);
  if (throwerUID !== prevThrowerUID) {
    setPrevThrowerUID(throwerUID);
    setRotationStep((step) => step + 1);
  }

  return (
    <section className="absolute inset-0 z-20 overflow-hidden">
      {/* Instruksi giliran — pil claymorphism, resep sama kayak BackButton/
          NavBar, biar konsisten sama sisa app ini. */}
      {turnLabel && (
        <div className="pointer-events-none absolute top-2 sm:top-4 left-1/2 z-50 -translate-x-1/2">
          <style>{`
            .nq-turn-banner {
              background: linear-gradient(150deg, #fff6e0 0%, #f2dfae 100%);
              color: #4a2a1a;
              box-shadow:
                0 3px 6px rgba(139, 94, 42, 0.3),
                inset -2px -2px 4px rgba(139, 94, 42, 0.18),
                inset 2px 2px 4px rgba(255, 255, 255, 0.85);
            }
          `}</style>
          <span className="nq-turn-banner inline-block whitespace-nowrap rounded-full px-3 py-1 sm:px-5 sm:py-1.5 text-[10px] sm:text-sm font-bold">
            {turnLabel}
          </span>
        </div>
      )}

      <div className="absolute left-1/2 top-1/2 h-[92vmin] w-[96vmin] sm:h-[80vh] sm:w-[85vw] md:h-[77vh] md:w-[76vw] -translate-x-1/2 -translate-y-1/2">
        {/* TOP */}
        {top && (
          <div className="absolute left-1/2 top-3 -translate-y-1/2 z-30 -translate-x-1/2">
            <PlayerSlot
              player={top}
              status={getStatus(top.uid)}
              orientation="horizontal"
              throwerTurnStartedAt={throwerTurnStartedAt}
              onThrowTimeout={onThrowTimeout}
              answerTurnStartedAt={answerTurnStartedAt}
              onAnswerTimeout={onAnswerTimeout}
            />
          </div>
        )}

        {/* LEFT */}
        {left && (
          <div className="absolute left-[8%] sm:left-[4%] lg:left-[-2.5%] top-1/2 z-30 -translate-y-1/2">
            <PlayerSlot
              player={left}
              status={getStatus(left.uid)}
              orientation="vertical"
              throwerTurnStartedAt={throwerTurnStartedAt}
              onThrowTimeout={onThrowTimeout}
              answerTurnStartedAt={answerTurnStartedAt}
              onAnswerTimeout={onAnswerTimeout}
            />
          </div>
        )}

        {/* RIGHT */}
        {right && (
          <div className="absolute right-[8%] sm:right-[4%] lg:right-[-2.5%] top-1/2 z-30 -translate-y-1/2">
            <PlayerSlot
              player={right}
              status={getStatus(right.uid)}
              orientation="vertical"
              throwerTurnStartedAt={throwerTurnStartedAt}
              onThrowTimeout={onThrowTimeout}
              answerTurnStartedAt={answerTurnStartedAt}
              onAnswerTimeout={onAnswerTimeout}
            />
          </div>
        )}

        {/* CENTER — main deck + kartu aktif */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
          {/* Panah arah giliran — 4 salinan arrowNuca, sekarang LEBIH GEDE
              dari kartu tengah (diminta eksplisit, kebalik dari ronde
              sebelumnya). Cincinnya (bukan tiap panah sendiri-sendiri) yang
              muter 90° tiap giliran beneran pindah (rotationStep), bukan
              animasi lepas yang jalan sendiri terus-terusan. */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: rotationStep * 90 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            {[0, 90, 180, 270].map((deg) => (
              <img
                key={deg}
                src={nuca.arrowNuca}
                alt=""
                aria-hidden="true"
                className="absolute h-[clamp(34px,6.5vmin,66px)] w-[clamp(46px,8.8vmin,90px)] opacity-80"
                style={{
                  transform: `rotate(${deg}deg) translateY(calc(-1 * clamp(58px, 8.5vmin, 92px)))`,
                }}
              />
            ))}
          </motion.div>

          {/* Kartu tengah dikecilin (diminta eksplisit) — playedCard di
              sampingnya dikecilin bareng biar dua-duanya tetep senada. */}
          <div className="relative h-[clamp(50px,9vmin,98px)] w-[clamp(35px,6.3vmin,70px)] lg:h-[clamp(76px,7vw,109px)] lg:w-[clamp(53px,4.5vw,81px)]">
            {[0, 1, 2, 3].map((index) => (
              <img
                key={index}
                src={nuca.nuca}
                alt="Main deck"
                className="absolute h-full w-full lg:h-[clamp(76px,7vw,109px)] lg:w-[clamp(53px,4.5vw,81px)] rounded-lg shadow-lg ring-1 ring-white/20"
                style={{ transform: `translate(${index * -3.5}px, ${index * 3}px)` }}
              />
            ))}

            <motion.div
              key={playedCard?.id ?? "idle"}
              initial={{ rotate: 0 }}
              animate={playedCard ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 1.0, ease: "easeInOut" }}
              className="absolute -inset-4 sm:-inset-8"
            />

            {playedCard && (
              <div className="absolute left-full top-1/2 ml-3 sm:ml-[clamp(28px,3vw,48px)] -translate-y-1/2">
                <div className="flex h-[clamp(46px,9vmin,98px)] w-[clamp(34px,6.6vmin,70px)] lg:h-[clamp(81px,7.5vw,116px)] lg:w-[clamp(57px,4.8vw,85px)] items-center justify-center rounded-lg">
                  <div
                    className="relative flex h-[clamp(50px,9vmin,98px)] w-[clamp(35px,6.3vmin,70px)] lg:h-[clamp(76px,7vw,109px)] lg:w-[clamp(53px,4.5vw,81px)] flex-col rounded-xl border-4 border-white p-1.5 text-left text-white shadow-[0_10px_16px_rgba(0,0,0,0.32)]"
                    style={{ backgroundColor: playedCard.hue }}
                  >
                    <p className="text-[5px] sm:text-[6px] md:text-[7px] lg:text-[10px] font-bold uppercase leading-none tracking-wide">Q</p>
                    <p className="mt-2 sm:mt-3 lg:mt-4 line-clamp-3 text-[5px] sm:text-[6px] md:text-[7px] lg:text-[9px] leading-tight text-white/95">
                      {playedCard.title}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM — aku */}
        {me && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-1/2">
            <div className="flex items-end justify-center gap-[clamp(14px,3vmin,28px)]">
              <div className="z-30 mb-2">
                <PlayerProfileNuca
                  isActive={getStatus(me.uid) === "thrower" || getStatus(me.uid) === "answering"}
                  status={getStatus(me.uid)}
                  sizeClassName="h-6 w-6 sm:h-10 sm:w-10 lg:h-11 lg:w-11"
                  avatarUrl={me.photoURL}
                  throwerTurnStartedAt={throwerTurnStartedAt}
                  onThrowTimeout={onThrowTimeout}
                  answerTurnStartedAt={answerTurnStartedAt}
                  onAnswerTimeout={onAnswerTimeout}
                />
              </div>
              <div className="z-50">
                <PlayerHandCards
                  cards={hand}
                  selectedCardId={selectedCardId}
                  canPlay={isMyTurnToThrow}
                  onSelectCard={onSelectCard}
                  onPlayAnimationComplete={onPlayAnimationComplete}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <QuestionModal
        isOpen={isMyTurnToAnswer || Boolean(answerFeedback)}
        onClose={() => {}}
        question={activeQuestion?.text}
        choices={activeQuestion?.options}
        onSelectChoice={onSubmitAnswer}
        disabled={isResolvingAnswer}
        feedback={answerFeedback}
        potionCount={isMyTurnToAnswer ? potionCount : 0}
        onUsePotion={isMyTurnToAnswer ? onUsePotion : undefined}
        answerTurnStartedAt={isMyTurnToAnswer ? answerTurnStartedAt : null}
      />
    </section>
  );
}
