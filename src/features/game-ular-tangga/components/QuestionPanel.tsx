'use client';

import React, {useEffect, useState} from 'react';
import confetti from 'canvas-confetti';
import {attribut} from '../../../assets/images/badge/cloudinaryAssets';

// Palet sama persis kayak confetti RankModal/QuestionModal NusaCard — biar
// potion kerasa satu identitas visual, bukan efek nyasar palet sendiri.
const POTION_CONFETTI_COLORS = ['#ffc93c', '#f5a916', '#2f8f74', '#bdeecb'];
const ANSWER_TIMEOUT_SECONDS = 8;

interface QuestionPanelProps {
  questionText: string;
  options: string[];
  selectedIndex?: number | null;
  onSelectOption?: (index: number) => void;
  isCorrectIndex?: number | null;
  /** Stok potion pemain ini. Tombol "Pakai Potion" cuma muncul kalau > 0. */
  potionCount?: number;
  /** Dipanggil kalau pemain milih pakai potion (skip + auto-jawab benar). */
  onUsePotion?: () => void;
  /** Kapan soal ini dimunculin (`gameState.questionShownAt`) — dasar hitung mundur 8 detik. Cuma tampilan, penegakannya di page.tsx. */
  questionShownAt?: number | null;
}

export default function QuestionPanel({
  questionText,
  options,
  selectedIndex = null,
  onSelectOption,
  isCorrectIndex = null,
  potionCount = 0,
  onUsePotion,
  questionShownAt,
}: QuestionPanelProps) {
  const [secondsLeft, setSecondsLeft] = useState(ANSWER_TIMEOUT_SECONDS);
  useEffect(() => {
    if (!questionShownAt) return;
    const tick = () => {
      const elapsed = (Date.now() - questionShownAt) / 1000;
      setSecondsLeft(Math.max(0, Math.ceil(ANSWER_TIMEOUT_SECONDS - elapsed)));
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [questionShownAt]);

  const handlePotionClick = () => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      void confetti({
        particleCount: 60,
        spread: 70,
        origin: {x: 0.5, y: 0.55},
        colors: POTION_CONFETTI_COLORS,
        zIndex: 1300,
        scalar: 0.9,
      });
    }
    onUsePotion?.();
  };

  return (
    <div className="relative w-full max-w-[560px] px-2 sm:px-0">
      <style>{`
        @keyframes qp-correct-pop {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(47, 143, 78, 0.55); }
          40% { transform: scale(1.05); box-shadow: 0 0 0 8px rgba(47, 143, 78, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(47, 143, 78, 0); }
        }
        @keyframes qp-wrong-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(5px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(3px); }
        }
        .qp-correct { animation: qp-correct-pop 480ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        .qp-wrong { animation: qp-wrong-shake 420ms ease-in-out both; }
        @media (prefers-reduced-motion: reduce) {
          .qp-correct, .qp-wrong { animation: none; }
        }
        /* Bingkai EMAS, bukan kayu coklat lagi — background halaman & papan
           udah coklat kayu semua, kalau panel ini dibingkai kayu juga dia
           bakal "ilang" nyatu sama sekitarnya (persis komplain awal: gak
           kontras). Emas terang di atas dasar coklat gelap = kartu ini
           nongol jelas kayak scroll quest yang lagi disorot. */
        .nq-ut-qp-frame {
          background: linear-gradient(150deg, #ffe28a 0%, #ffc93c 55%, #f5a916 100%);
          box-shadow:
            0 16px 30px rgba(0, 0, 0, 0.45),
            inset 0 0 0 3px rgba(255, 255, 255, 0.35);
        }
        .nq-ut-qp-glow {
          background: radial-gradient(closest-side, rgba(255, 201, 60, 0.55), rgba(255, 201, 60, 0) 70%);
          animation: nq-ut-qp-glow-pulse 2.6s ease-in-out infinite;
        }
        @keyframes nq-ut-qp-glow-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.08); }
        }
        .nq-ut-qp-ribbon {
          background: linear-gradient(150deg, #ffe28a 0%, #ffc93c 55%, #f5a916 100%);
          color: #4a2a1a;
          box-shadow:
            0 4px 0 #c6841a,
            0 7px 12px rgba(120, 72, 0, 0.35),
            inset -2px -2px 5px rgba(150, 90, 0, 0.25),
            inset 2px 2px 4px rgba(255, 255, 255, 0.65);
        }
        .nq-ut-qp-paper {
          background: linear-gradient(150deg, #fff9ea 0%, #f7e6bc 100%);
          box-shadow:
            inset -3px -3px 8px rgba(139, 94, 42, 0.14),
            inset 3px 3px 8px rgba(255, 255, 255, 0.8);
        }
        @media (prefers-reduced-motion: reduce) {
          .nq-ut-qp-glow { animation: none; }
        }
        .nq-ut-qp-choice {
          background: linear-gradient(150deg, #fff6e0 0%, #f2dfae 100%);
          box-shadow:
            0 3px 0 rgba(139, 94, 42, 0.45),
            0 4px 8px rgba(90, 58, 20, 0.22),
            inset -2px -2px 3px rgba(139, 94, 42, 0.16),
            inset 2px 2px 3px rgba(255, 255, 255, 0.8);
          transition: transform 120ms ease-out, box-shadow 120ms ease-out, filter 120ms ease-out;
        }
        .nq-ut-qp-choice:not(:disabled):hover {
          filter: brightness(1.04);
          transform: translateY(-1px);
        }
        .nq-ut-qp-choice--correct {
          background: linear-gradient(150deg, #e8fbe9 0%, #bdeecb 100%);
          box-shadow:
            0 3px 0 #2f8f4e,
            0 4px 8px rgba(31, 90, 51, 0.28),
            inset -2px -2px 3px rgba(47, 143, 78, 0.18),
            inset 2px 2px 3px rgba(255, 255, 255, 0.85);
        }
        .nq-ut-qp-choice--wrong {
          background: linear-gradient(150deg, #fde6e6 0%, #f3b8b8 100%);
          box-shadow:
            0 3px 0 #c23b3b,
            0 4px 8px rgba(122, 31, 31, 0.28),
            inset -2px -2px 3px rgba(194, 59, 59, 0.18),
            inset 2px 2px 3px rgba(255, 255, 255, 0.85);
        }
        .nq-ut-qp-timer {
          background: linear-gradient(150deg, #fff6e0 0%, #f2dfae 100%);
          color: #4a2a1a;
          box-shadow:
            0 2px 4px rgba(139, 94, 42, 0.3),
            inset -1px -1px 3px rgba(139, 94, 42, 0.18),
            inset 1px 1px 3px rgba(255, 255, 255, 0.85);
        }
        .nq-ut-qp-timer--urgent {
          background: linear-gradient(150deg, #fde6e6 0%, #f3b8b8 100%);
          color: #7a1f1f;
          animation: nq-ut-qp-timer-pulse 0.6s ease-in-out infinite;
        }
        @keyframes nq-ut-qp-timer-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .nq-ut-qp-potion-btn {
          background: linear-gradient(150deg, #e8fbe9 0%, #bdeecb 100%);
          color: #1c5c33;
          box-shadow:
            0 3px 0 #2f8f4e,
            0 4px 8px rgba(31, 90, 51, 0.28),
            inset -2px -2px 3px rgba(47, 143, 78, 0.18),
            inset 2px 2px 3px rgba(255, 255, 255, 0.85);
          transition: transform 120ms ease-out, filter 120ms ease-out;
        }
        .nq-ut-qp-potion-btn:hover {
          filter: brightness(1.05);
          transform: translateY(-1px);
        }
        @media (prefers-reduced-motion: reduce) {
          .nq-ut-qp-timer--urgent { animation: none; }
        }
      `}</style>

      {/* Aura emas nge-pulse di belakang kartu — kartu ini keliatan "disorot",
          bukan cuma nempel di dinding kayu kayak sebelumnya. */}
      <span className="nq-ut-qp-glow pointer-events-none absolute inset-x-6 top-1/2 h-[70%] -translate-y-1/2 rounded-full" />

      {/* Pita "PERTANYAAN" numpang di tepi atas bingkai — bahasa yang sama
          kayak QuestionModal NusaCard. */}
      <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2">
        <span className="nq-ut-qp-ribbon inline-block whitespace-nowrap rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-wider sm:px-5 sm:py-1.5 sm:text-xs">
          Pertanyaan
        </span>
      </div>

      <div className="nq-ut-qp-frame relative w-full rounded-[20px] p-[3px]">
        <div className="nq-ut-qp-paper relative w-full rounded-[17px] px-4 pb-4 pt-6 sm:px-6 sm:pb-6 sm:pt-7 md:px-8 md:pb-7">
          {/* Hitung mundur jawab — cuma nongol selagi belum dijawab. */}
          {questionShownAt && selectedIndex === null ? (
            <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4">
              <span
                className={`nq-ut-qp-timer flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-[10px] sm:text-xs font-black ${
                  secondsLeft <= 3 ? 'nq-ut-qp-timer--urgent' : ''
                }`}
              >
                {secondsLeft}
              </span>
            </div>
          ) : null}

          <div className="flex flex-col items-center">
            {/* Question Text - Responsive sizing */}
            <p className="w-full max-w-[90%] text-center text-xs leading-snug font-bold text-[#3d2411] sm:text-sm md:text-base break-words text-balance mb-2 sm:mb-3">
              {questionText}
            </p>

            {/* Options - Responsive gap and sizing */}
            <div className="flex w-full max-w-[92%] flex-col items-center gap-1.5 sm:gap-2 md:gap-2.5">
              {options?.map((option, index) => {
                const isSelected = selectedIndex === index;
                const isCorrect = isCorrectIndex === index;
                const isAnswered = selectedIndex !== null;

                // ===== PERBAIKI: Logika warna yang benar =====
                // 1. Jika user pilih opsi ini dan benar → hijau
                const shouldBeGreen = isSelected && isAnswered && isCorrect;
                // 2. Jika user pilih opsi ini dan salah → merah
                const shouldBeRed = isSelected && isAnswered && !isCorrect;
                // 3. Jika soal sudah dijawab tapi ini bukan yang dipilih → cek apakah ini jawaban benar (tunjukkan hijau)
                const shouldBeGreenCorrect = !isSelected && isAnswered && isCorrect;

                const effectClass = shouldBeGreen || shouldBeGreenCorrect ? 'qp-correct' : shouldBeRed ? 'qp-wrong' : '';

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => onSelectOption?.(index)}
                    disabled={selectedIndex !== null}
                    className={`nq-ut-qp-choice w-full rounded-full px-3 py-1.5 text-[10px] font-medium leading-tight sm:px-4 sm:py-2 sm:text-xs md:text-sm disabled:cursor-not-allowed ${effectClass} ${
                      shouldBeGreen || shouldBeGreenCorrect
                        ? 'nq-ut-qp-choice--correct font-bold text-[#1c5c33]'
                        : shouldBeRed
                          ? 'nq-ut-qp-choice--wrong font-bold text-[#7a1f1f]'
                          : 'text-[#3d2411]'
                      }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {onUsePotion && selectedIndex === null && potionCount > 0 ? (
              <button
                type="button"
                onClick={handlePotionClick}
                className="nq-ut-qp-potion-btn mt-2 flex items-center gap-1 rounded-full px-3 py-1 text-[9px] font-bold sm:px-4 sm:py-1.5 sm:text-[10px]"
              >
                <img src={attribut.potion1} alt="" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Pakai Potion ({potionCount})
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
