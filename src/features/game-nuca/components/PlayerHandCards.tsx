"use client";

import { motion } from "framer-motion";

export interface PlayerCard {
  id: string;
  title: string;
  subtitle: string;
  hue: string;
}

interface PlayerHandCardsProps {
  cards: PlayerCard[];
  selectedCardId: string | null;
  canPlay: boolean;
  onSelectCard: (cardId: string) => void;
  onPlayAnimationComplete: (cardId: string) => void;
}

export default function PlayerHandCards({
  cards,
  selectedCardId,
  canPlay,
  onSelectCard,
  onPlayAnimationComplete,
}: PlayerHandCardsProps) {
  if (cards.length === 0) {
    return null;
  }

  const middleIndex = (cards.length - 1) / 2;

  return (
    <div className="flex items-end justify-center">
      {cards.map((card, index) => {
        const isSelected = selectedCardId === card.id;
        const playX = (middleIndex - index) * 68;

        return (
          <motion.button
            key={card.id}
            type="button"
            onClick={() => onSelectCard(card.id)}
            disabled={!canPlay || Boolean(selectedCardId && !isSelected)}
            className={`relative h-[clamp(90px,8vw,140px)] w-[clamp(62px,5.5vw,100px)] lg:h-[clamp(108px,10vw,156px)] lg:w-[clamp(76px,6.4vw,116px)] rounded-xl border border-white/55 p-1.5 text-left text-white shadow-[0_10px_16px_rgba(0,0,0,0.32)] ${
              index === 0 ? "" : "-ml-4 lg:-ml-7"
            } ${canPlay ? "cursor-pointer" : "cursor-not-allowed"}`}
            style={{ backgroundColor: card.hue }}
            initial={{ rotateY: 0 }}
            animate={
              isSelected
                ? {
                    x: playX,
                    y: -198,
                    scale: 1.08,
                    rotateY: [0, 180],
                    zIndex: 70,
                  }
                : {
                    x: 0,
                    y: 0,
                    scale: selectedCardId ? 0.9 : 1,
                    rotateY: 0,
                    zIndex: 20 + index,
                    opacity: selectedCardId ? 0.5 : 1,
                  }
            }
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onAnimationComplete={() => {
              if (isSelected) {
                onPlayAnimationComplete(card.id);
              }
            }}
            whileHover={selectedCardId || !canPlay ? undefined : { y: -4 }}
          >
            <p className="text-[7px] lg:text-[10px] font-bold uppercase leading-none tracking-wide">Q: Makanan</p>
            <p className="mt-4 line-clamp-3 text-[6px] lg:text-[9px] leading-tight text-white/95 sm:text-[9px]">
              {card.title}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}
