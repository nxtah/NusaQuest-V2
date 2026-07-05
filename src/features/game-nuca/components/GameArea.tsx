"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { nuca } from "../../../assets/images/nuca/cloudinaryAssets";
import PlayerProfileNuca, { type PlayerTurnStatus } from "./PlayerProfileNuca";
import PlayerHandCards, { type PlayerCard } from "./PlayerHandCards";
import QuestionModal from "./QuestionModal";

const players = [
  { id: 1, name: "Anda" },
  { id: 2, name: "Player 2" },
  { id: 3, name: "Player 3" },
  { id: 4, name: "Player 4" },
];

const initialCards: PlayerCard[] = [
  { id: "card-1", title: "Daya tahan makanan tradisional adalah ...", subtitle: "Q", hue: "#f2a314" },
  { id: "card-2", title: "Apa fungsi rempah pada masakan khas Indonesia?", subtitle: "Q", hue: "#f3b02a" },
  { id: "card-3", title: "Jenis olahan sagu berasal dari daerah ...", subtitle: "Q", hue: "#f1a52a" },
  { id: "card-4", title: "Nama makanan khas berbahan ikan adalah ...", subtitle: "Q", hue: "#ef9917" },
];

function getTurnOrder(throwerId: number): number[] {
  const idx = players.findIndex((p) => p.id === throwerId);
  if (idx === -1) return players.map((p) => p.id);
  const rotated = [...players.slice(idx + 1), ...players.slice(0, idx)];
  return rotated.map((p) => p.id);
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

function ActiveQuestionCard({ playedCard }: { playedCard: PlayerCard | null }) {
  return (
    <div className="flex h-[clamp(66px,13vmin,140px)] w-[clamp(48px,9.5vmin,100px)] lg:h-[clamp(116px,10.7vw,166px)] lg:w-[clamp(82px,6.9vw,122px)] items-center justify-center rounded-lg">
      {playedCard ? (
        <div
          className="relative flex h-[clamp(72px,13vmin,140px)] w-[clamp(50px,9vmin,100px)] lg:h-[clamp(108px,10vw,156px)] lg:w-[clamp(76px,6.4vw,116px)] flex-col rounded-xl border-4 border-white p-1.5 text-left text-white shadow-[0_10px_16px_rgba(0,0,0,0.32)] "
          style={{ backgroundColor: playedCard.hue }}
        >
          <p className="text-[5px] sm:text-[6px] md:text-[7px] lg:text-[10px] font-bold uppercase leading-none tracking-wide">
            Q: Makanan
          </p>

      <p className="mt-2 sm:mt-3 lg:mt-4 line-clamp-3 text-[5px] sm:text-[6px] md:text-[7px] lg:text-[9px] leading-tight text-white/95">
        {playedCard.title}
      </p>
        </div>
      ) : null}
    </div>
  );
}

export default function GameArea() {
  const currentUserId = 1;
  const activePlayer = 1;

  // TODO: ganti jadi dinamis (dari state room/socket) kalau giliran melempar sudah bergantian antar-player.
  const throwerId = 1;

  const [cards, setCards] = useState<PlayerCard[]>(initialCards);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [playedCard, setPlayedCard] = useState<PlayerCard | null>(null);
  const [isQuestionOpen, setIsQuestionOpen] = useState(false);

  // ---- State antrian giliran menjawab ----
  const [answeringQueue, setAnsweringQueue] = useState<number[]>([]);
  const [currentAnsweringId, setCurrentAnsweringId] = useState<number | null>(null);
  const [answeredIds, setAnsweredIds] = useState<number[]>([]);

  const selectedCard = useMemo(
    () => cards.find((card) => card.id === selectedCardId) ?? null,
    [cards, selectedCardId],
  );

  const handleCardSelect = (cardId: string) => {
    if (selectedCardId || activePlayer !== currentUserId) return;
    setSelectedCardId(cardId);
  };

  const handlePlayAnimationDone = (cardId: string) => {
    const card = cards.find((item) => item.id === cardId);
    if (!card) return;

    setPlayedCard(card);
    setCards((prev) => prev.filter((item) => item.id !== cardId));
    setSelectedCardId(null);
    setIsQuestionOpen(true);

    const order = getTurnOrder(throwerId);
    setAnsweredIds([]);
    setCurrentAnsweringId(order[0] ?? null);
    setAnsweringQueue(order.slice(1));
  };

  // TODO: kalau nanti player bisa submit jawaban lebih cepat dari timer habis,
  // panggil fungsi yang sama ini dari event "jawaban terkirim" (socket/API).
  const advanceTurn = () => {
    setCurrentAnsweringId((current) => {
      if (current !== null) {
        setAnsweredIds((prev) => [...prev, current]);
      }
      return current;
    });

    setAnsweringQueue((prevQueue) => {
      const [next, ...rest] = prevQueue;
      setCurrentAnsweringId(next ?? null);
      return rest;
    });
  };

  const getPlayerStatus = (playerId: number): PlayerTurnStatus => {
    if (playerId === throwerId) return "thrower";
    if (playerId === currentAnsweringId) return "answering";
    if (answeredIds.includes(playerId)) return "answered";
    if (answeringQueue.includes(playerId)) return "waiting";
    return "idle";
  };

  const isOtherPlayerTurn =
    currentAnsweringId !== null && currentAnsweringId !== currentUserId;

  return (
    <section className="absolute inset-0 z-20 overflow-hidden">
      <div className="absolute left-1/2 top-1/2 h-[92vmin] w-[96vmin] sm:h-[80vh] sm:w-[85vw] md:h-[77vh] md:w-[76vw] -translate-x-1/2 -translate-y-1/2">
        {/* TOP */}
        <div className="absolute left-1/2 top-3 -translate-y-1/2 z-30 -translate-x-1/2">
          <div className="flex items-center gap-[clamp(6px,1.6vmin,24px)]">
            <div className="z-50">
              <OpponentDeck orientation="horizontal" cardRotation={180} />
            </div>
            <div className="z-30 translate-x-[clamp(4px,1.5vmin,12px)]">
              <PlayerProfileNuca
                isActive={activePlayer === players[2].id}
                status={getPlayerStatus(players[2].id)}
                sizeClassName="h-6 w-6 sm:h-10 sm:w-10 lg:h-11 lg:w-11"
                onAnswerTimeout={advanceTurn}
              />
            </div>
          </div>
        </div>

        {/* LEFT */}
        <div className="absolute left-[8%] sm:left-[4%] lg:left-[-2.5%] top-1/2 z-30 -translate-y-1/2">
          <div className="flex flex-col items-center gap-[clamp(6px,1.6vmin,2px)]">
            <div className="z-30">
              <PlayerProfileNuca
                isActive={activePlayer === players[1].id}
                status={getPlayerStatus(players[1].id)}
                sizeClassName="h-6 w-6 sm:h-10 sm:w-10 lg:h-11 lg:w-11"
                onAnswerTimeout={advanceTurn}
              />
            </div>
            <div className="z-50">
              <OpponentDeck orientation="vertical" cardRotation={90} stackDirection={1} />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="absolute right-[8%] sm:right-[4%] lg:right-[-2.5%] top-1/2 z-30 -translate-y-1/2">
          <div className="flex flex-col items-center gap-[clamp(6px,1.6vmin,2px)]">
            <div className="z-50">
              <OpponentDeck orientation="vertical" cardRotation={-90} stackDirection={-1} />
            </div>
            <div className="z-30">
              <PlayerProfileNuca
                isActive={activePlayer === players[3].id}
                status={getPlayerStatus(players[3].id)}
                sizeClassName="h-6 w-6 sm:h-10 sm:w-10 lg:h-11 lg:w-11"
                onAnswerTimeout={advanceTurn}
              />
            </div>
          </div>
        </div>

        {/* CENTER — main deck + active question card */}
        <div className= "pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
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
            >
              <img
                src={nuca.arrowNuca}
                alt="Arrow atas"
                className="absolute left-1/2 -top-2 h-3 w-3 sm:h-5 sm:w-5 md:h-8 md:w-8 lg:h-10 lg:w-10 -translate-x-1/2 opacity-60"
              />
              <img
                src={nuca.arrowNuca}
                alt="Arrow kanan"
                className="absolute -right-2 top-1/2 h-3 w-3 sm:h-5 sm:w-5 md:h-8 md:w-8 lg:h-10 lg:w-10 -translate-y-1/2 rotate-90 opacity-60"
              />
              <img
                src={nuca.arrowNuca}
                alt="Arrow bawah"
                className="absolute -bottom-4 left-1/2 h-3 w-3 sm:h-5 sm:w-5 md:h-8 md:w-8 lg:h-10 lg:w-10 -translate-x-1/2 rotate-180 opacity-60"
              />
              <img
                src={nuca.arrowNuca}
                alt="Arrow kiri"
                className="absolute -left-6 top-1/2 h-3 w-3 sm:h-5 sm:w-5 md:h-8 md:w-8 lg:h-10 lg:w-10 -translate-y-1/2 -rotate-90 opacity-60"
              />
            </motion.div>

            <div className="absolute left-full top-1/2 ml-3 sm:ml-[clamp(40px,4vw,64px)] -translate-y-1/2">
              <ActiveQuestionCard playedCard={playedCard} />
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-1/2">
          <div className="flex items-end justify-center gap-[clamp(6px,1.6vmin,24px)]">
            <div className="z-30 mb-2">
              <PlayerProfileNuca
                isActive={activePlayer === players[0].id}
                status={getPlayerStatus(players[0].id)}
                sizeClassName="h-6 w-6 sm:h-10 sm:w-10 lg:h-11 lg:w-11"
                onAnswerTimeout={advanceTurn}
              />
            </div>
            <div className="z-50">
              <PlayerHandCards
                cards={cards}
                selectedCardId={selectedCard?.id ?? null}
                canPlay={activePlayer === currentUserId}
                onSelectCard={handleCardSelect}
                onPlayAnimationComplete={handlePlayAnimationDone}
              />
            </div>
          </div>
        </div>
      </div>

      <QuestionModal isOpen={isQuestionOpen} onClose={() => setIsQuestionOpen(false)} />
    </section>
  );
}