"use client";

import { motion } from "framer-motion";

export interface PlayerCard {
  /** Unik per SLOT di tangan (bukan cuma per soal) — dipakai buat React key
      & tracking kartu yang lagi dipilih. Kalau konten soal di database masih
      tipis (bisa aja cuma 1 soal approved buat 1 region), 2+ kartu di tangan
      yang sama bisa aja soal-nya identik (id soal sama persis) — id di sini
      TETAP unik per slot biar gak numbuk (React key collision) & biar milih
      salah satu duplikat gak ikut nyorot yang lain. */
  id: string;
  /** Id soal ASLI (dari Firestore) — ini yang dikirim ke `throwCard`, bukan `id`. */
  questionId: string;
  title: string;
  subtitle: string;
  hue: string;
}

interface PlayerHandCardsProps {
  cards: PlayerCard[];
  selectedCardId: string | null;
  canPlay: boolean;
  onSelectCard: (cardId: string) => void;
  onPlayAnimationComplete: (cardId: string, questionId: string) => void;
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
            className={`relative h-[clamp(72px,13vmin,140px)] w-[clamp(50px,9vmin,100px)] lg:h-[clamp(108px,10vw,156px)] lg:w-[clamp(76px,6.4vw,116px)] rounded-xl border-4 border-white p-1.5 text-left text-white shadow-[0_10px_16px_rgba(0,0,0,0.32)]
              ${index === 0 ? "" : "-ml-3 sm:-ml-4 lg:-ml-7"}
              ${canPlay ? "cursor-pointer" : "cursor-not-allowed"}
              `}
            style={{ backgroundColor: card.hue }}
            initial={{ rotateY: 0 }}
            animate={
              isSelected
                ? {
                    x: playX,
                    // Vh (bukan px tetap) — tangan "aku" nempel di bawah
                    // (bottom-3) sementara tumpukan tengah persis di
                    // vertical-center meja (top-1/2 di GameArea), jadi jarak
                    // tempuh yang bener itu proporsional ke tinggi viewport,
                    // bukan angka px yang cuma pas di satu ukuran layar.
                    y: "-38vh",
                    scale: 1.08,
                    rotateY: [0, 180],
                    zIndex: 70,
                  }
                : {
                    x: 0,
                    y: "0vh",
                    scale: selectedCardId ? 0.9 : 1,
                    rotateY: 0,
                    zIndex: 20 + index,
                    opacity: selectedCardId ? 0.5 : 1,
                  }
            }
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onAnimationComplete={() => {
              if (isSelected) {
                onPlayAnimationComplete(card.id, card.questionId);
              }
            }}
            whileHover={selectedCardId || !canPlay ? undefined : { y: -4 }}
          >
            {/* Lantai minimum dinaikin dari 5px — di kartu terkecil (mobile
                landscape) itu jauh di bawah batas kebacaan, bukan cuma
                "kompak". */}
            <p className="text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] font-bold uppercase leading-none tracking-wide">
              Q: Makanan
            </p>

            <p className="mt-2 sm:mt-3 lg:mt-4 line-clamp-3 text-[7px] sm:text-[8px] md:text-[8px] lg:text-[9px] leading-tight text-white/95">
              {card.title}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}
