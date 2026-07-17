"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { nuca } from "../../../assets/images/nuca/cloudinaryAssets";
import PlayerProfileNuca, { type PlayerTurnStatus } from "./PlayerProfileNuca";
import PlayerHandCards, { type PlayerCard } from "./PlayerHandCards";
import QuestionModal from "./QuestionModal";

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
  /** Pemain yang lagi kebagian giliran jawab sekarang. */
  answeringUID: string | null;
  /** Pemain yang masih ngantri jawab soal aktif (belum kebagian). */
  queueUIDs: string[];
  /** Pemain yang udah jawab soal aktif. */
  answeredUIDs: string[];
  activeQuestion: GameAreaActiveQuestion | null;
  isMyTurnToAnswer: boolean;
  isResolvingAnswer?: boolean;
  onSelectCard: (cardId: string) => void;
  onPlayAnimationComplete: (cardId: string) => void;
  onSubmitAnswer: (index: number) => void;
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
}: {
  player: GameAreaPlayer;
  status: PlayerTurnStatus;
  orientation: "vertical" | "horizontal";
}) {
  return (
    <div className={`flex ${orientation === "vertical" ? "flex-col" : "flex-row"} items-center gap-[clamp(6px,1.6vmin,2px)]`}>
      <div className="z-30">
        <PlayerProfileNuca
          isActive={status === "thrower" || status === "answering"}
          status={status}
          sizeClassName="h-6 w-6 sm:h-10 sm:w-10 lg:h-11 lg:w-11"
          avatarUrl={player.photoURL}
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
  answeringUID,
  queueUIDs,
  answeredUIDs,
  activeQuestion,
  isMyTurnToAnswer,
  isResolvingAnswer = false,
  onSelectCard,
  onPlayAnimationComplete,
  onSubmitAnswer,
}: GameAreaProps) {
  const me = players[0];
  const left = players[1];
  const top = players[2];
  const right = players[3];

  const getStatus = (uid: string | undefined): PlayerTurnStatus => {
    if (!uid) return "idle";
    if (uid === throwerUID) return "thrower";
    if (uid === answeringUID) return "answering";
    if (answeredUIDs.includes(uid)) return "answered";
    if (queueUIDs.includes(uid)) return "waiting";
    return "idle";
  };

  const playedCard = useMemo(() => {
    if (!activeQuestion) return null;
    return { id: "active", title: activeQuestion.text, subtitle: "Q", hue: "#f2a314" };
  }, [activeQuestion]);

  return (
    <section className="absolute inset-0 z-20 overflow-hidden">
      <div className="absolute left-1/2 top-1/2 h-[92vmin] w-[96vmin] sm:h-[80vh] sm:w-[85vw] md:h-[77vh] md:w-[76vw] -translate-x-1/2 -translate-y-1/2">
        {/* TOP */}
        {top && (
          <div className="absolute left-1/2 top-3 -translate-y-1/2 z-30 -translate-x-1/2">
            <PlayerSlot player={top} status={getStatus(top.uid)} orientation="horizontal" />
          </div>
        )}

        {/* LEFT */}
        {left && (
          <div className="absolute left-[8%] sm:left-[4%] lg:left-[-2.5%] top-1/2 z-30 -translate-y-1/2">
            <PlayerSlot player={left} status={getStatus(left.uid)} orientation="vertical" />
          </div>
        )}

        {/* RIGHT */}
        {right && (
          <div className="absolute right-[8%] sm:right-[4%] lg:right-[-2.5%] top-1/2 z-30 -translate-y-1/2">
            <PlayerSlot player={right} status={getStatus(right.uid)} orientation="vertical" />
          </div>
        )}

        {/* CENTER — main deck + kartu aktif */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
          <div className="relative h-[clamp(72px,13vmin,140px)] w-[clamp(50px,9vmin,100px)] lg:h-[clamp(108px,10vw,156px)] lg:w-[clamp(76px,6.4vw,116px)]">
            {[0, 1, 2, 3].map((index) => (
              <img
                key={index}
                src={nuca.nuca}
                alt="Main deck"
                className="absolute h-full w-full lg:h-[clamp(108px,10vw,156px)] lg:w-[clamp(76px,6.4vw,116px)] rounded-lg shadow-lg ring-1 ring-white/20"
                style={{ transform: `translate(${index * -5}px, ${index * 4}px)` }}
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
              <div className="absolute left-full top-1/2 ml-3 sm:ml-[clamp(40px,4vw,64px)] -translate-y-1/2">
                <div className="flex h-[clamp(66px,13vmin,140px)] w-[clamp(48px,9.5vmin,100px)] lg:h-[clamp(116px,10.7vw,166px)] lg:w-[clamp(82px,6.9vw,122px)] items-center justify-center rounded-lg">
                  <div
                    className="relative flex h-[clamp(72px,13vmin,140px)] w-[clamp(50px,9vmin,100px)] lg:h-[clamp(108px,10vw,156px)] lg:w-[clamp(76px,6.4vw,116px)] flex-col rounded-xl border-4 border-white p-1.5 text-left text-white shadow-[0_10px_16px_rgba(0,0,0,0.32)]"
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
            <div className="flex items-end justify-center gap-[clamp(6px,1.6vmin,24px)]">
              <div className="z-30 mb-2">
                <PlayerProfileNuca
                  isActive={getStatus(me.uid) === "thrower" || getStatus(me.uid) === "answering"}
                  status={getStatus(me.uid)}
                  sizeClassName="h-6 w-6 sm:h-10 sm:w-10 lg:h-11 lg:w-11"
                  avatarUrl={me.photoURL}
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
        isOpen={isMyTurnToAnswer}
        onClose={() => {}}
        question={activeQuestion?.text}
        choices={activeQuestion?.options}
        onSelectChoice={onSubmitAnswer}
        disabled={isResolvingAnswer}
      />
    </section>
  );
}
