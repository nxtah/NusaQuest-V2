"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { getNucaImage, nuca } from "@/src/assets/images/nuca/cloudinaryAssets";
import { attribut } from "@/src/assets/images/badge/cloudinaryAssets";
import { AnimatePresence, motion } from "framer-motion";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Warna sama persis kayak confetti RankModal — biar potion "kerasa" bagian
// dari identitas visual yang sama, bukan efek nyasar dengan palet sendiri.
const POTION_CONFETTI_COLORS = ["#ffc93c", "#f5a916", "#2f8f74", "#bdeecb"];
const ANSWER_TIMEOUT_SECONDS = 8;

/** Ditampilin abis jawaban ke-submit — kunci UI-nya (gak bisa milih lagi)
    dan nyorot pilihan yang bener/salah, sebelum modal ke-close sama caller.
    `question`/`choices` di sini adalah SNAPSHOT soal yang beneran dijawab —
    begitu `submitAnswer` resolve, `gameState.activeQuestion` di server
    langsung di-null-in, jadi kalau modal masih ngandelin prop `question`/
    `choices` LANGSUNG dari situ selama jendela feedback (1.4 detik),
    isinya udah keburu kosong dan JATOH ke placeholder default component ini
    ("Apa ibu kota Indonesia?" dst) — sementara `correctIndex` di feedback
    tetep nunjuk ke soal ASLI yang baru dijawab. Hasilnya: soal placeholder
    ketampil dengan jawaban benar dari soal yang beda sama sekali. */
export interface QuestionFeedback {
  selectedIndex: number;
  correctIndex: number;
  question: string;
  choices: string[];
}

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question?: string;
  choices?: string[];
  avatarUrl?: string;
  /** Kalau dikasih, dipanggil dengan index pilihan alih-alih langsung onClose. */
  onSelectChoice?: (index: number) => void;
  disabled?: boolean;
  feedback?: QuestionFeedback | null;
  /** Stok potion pemain ini. Tombol "Pakai Potion" cuma muncul kalau > 0. */
  potionCount?: number;
  /** Dipanggil kalau pemain milih pakai potion (skip + auto-jawab benar). */
  onUsePotion?: () => void;
  /**
   * Timestamp (ms, server) jendela jawab SEKARANG mulai
   * (`gameState.answerTurnStartedAt`). Cuma buat NAMPILIN hitung mundur —
   * penegakan timeout-nya sendiri (siapa yang boleh manggil submitAnswer
   * begitu abis) jalan lewat cincin avatar di GameArea/PlayerProfileNuca,
   * biar gak ada 2 sumber kebenaran yang bisa saling dobel nembak.
   */
  answerTurnStartedAt?: number | null;
}

const defaultChoices = ["Surabaya", "Bandung", "Jakarta", "Medan"];

// Ikat ke lily pad ("teratai") + rambatan ("tanaman") yang udah muncul di
// papan itu sendiri (GameBackground.tsx) — biar popup ini kerasa kayak
// props yang "dicabut langsung" dari meja, bukan modal generik yang numpang
// lewat. Satu aksen ini yang jadi "signature", sisanya sengaja diem (warna &
// font TETEP pake bahasa claymorphism gold-parchment yang udah dipake di
// seluruh app — RankModal/WinModal/turn banner — bukan palet baru).
export default function QuestionModal({
  isOpen,
  onClose,
  question = "Apa ibu kota Indonesia?",
  choices = defaultChoices,
  avatarUrl,
  onSelectChoice,
  disabled = false,
  feedback = null,
  potionCount = 0,
  onUsePotion,
  answerTurnStartedAt,
}: QuestionModalProps) {
  // Selama feedback lagi ketampil, pake SNAPSHOT soal dari feedback (soal
  // yang beneran barusan dijawab), bukan prop `question`/`choices` yang
  // ngikutin `activeQuestion` live — itu udah keburu null begitu jawaban
  // ke-submit, jadi kalau dipake bakal jatoh ke placeholder default.
  const displayQuestion = feedback?.question ?? question;
  const displayChoices = feedback?.choices ?? choices;

  // Hitung mundur jawab — murni tampilan (readout dari jam server yang
  // sama dipakai cincin avatar), gak nembak timeout sendiri di sini biar
  // gak ada 2 titik yang bisa saling dobel-trigger.
  const [secondsLeft, setSecondsLeft] = useState(ANSWER_TIMEOUT_SECONDS);
  useEffect(() => {
    if (!answerTurnStartedAt) return;
    const tick = () => {
      const elapsed = (Date.now() - answerTurnStartedAt) / 1000;
      setSecondsLeft(Math.max(0, Math.ceil(ANSWER_TIMEOUT_SECONDS - elapsed)));
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [answerTurnStartedAt]);

  // Confetti emas begitu potion dipake — efek "sihir" yang beda dari
  // sekadar jawaban benar biasa, biar kerasa spesial makai skill item.
  const firePotionConfetti = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    void confetti({
      particleCount: 60,
      spread: 70,
      origin: { x: 0.5, y: 0.55 },
      colors: POTION_CONFETTI_COLORS,
      zIndex: 1300,
      scalar: 0.9,
    });
  };

  const handlePotionClick = () => {
    firePotionConfetti();
    onUsePotion?.();
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-4 backdrop-blur-md"
        >
          <style>{`
            .nq-qm-frame {
              background-image: url(${nuca.kayu});
              background-size: cover;
              background-position: center;
              box-shadow:
                0 14px 28px rgba(0, 0, 0, 0.4),
                inset 0 0 0 3px rgba(255, 255, 255, 0.12);
            }
            .nq-qm-ribbon {
              background: linear-gradient(150deg, #ffe28a 0%, #ffc93c 55%, #f5a916 100%);
              color: #4a2a1a;
              box-shadow:
                0 4px 0 #c6841a,
                0 7px 12px rgba(120, 72, 0, 0.35),
                inset -2px -2px 5px rgba(150, 90, 0, 0.25),
                inset 2px 2px 4px rgba(255, 255, 255, 0.65);
            }
            .nq-qm-timer {
              background: linear-gradient(150deg, #fff6e0 0%, #f2dfae 100%);
              color: #4a2a1a;
              box-shadow:
                0 3px 6px rgba(139, 94, 42, 0.3),
                inset -2px -2px 4px rgba(139, 94, 42, 0.18),
                inset 2px 2px 4px rgba(255, 255, 255, 0.85);
            }
            .nq-qm-timer--urgent {
              background: linear-gradient(150deg, #fde6e6 0%, #f3b8b8 100%);
              color: #7a1f1f;
              animation: nq-qm-timer-pulse 0.6s ease-in-out infinite;
            }
            @keyframes nq-qm-timer-pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.08); }
            }
            .nq-qm-choice {
              background: linear-gradient(150deg, #fff6e0 0%, #f2dfae 100%);
              box-shadow:
                0 4px 0 rgba(139, 94, 42, 0.45),
                0 6px 10px rgba(90, 58, 20, 0.25),
                inset -2px -2px 4px rgba(139, 94, 42, 0.16),
                inset 2px 2px 4px rgba(255, 255, 255, 0.8);
              transition: transform 140ms ease-out, box-shadow 140ms ease-out, filter 140ms ease-out;
            }
            .nq-qm-choice:not(:disabled):hover {
              filter: brightness(1.04);
              transform: translateY(-2px);
            }
            .nq-qm-choice:not(:disabled):active {
              transform: translateY(1px);
              box-shadow:
                0 1px 0 rgba(139, 94, 42, 0.45),
                0 2px 4px rgba(90, 58, 20, 0.25),
                inset -2px -2px 4px rgba(139, 94, 42, 0.16),
                inset 2px 2px 4px rgba(255, 255, 255, 0.8);
            }
            .nq-qm-choice:focus-visible {
              outline: 3px solid #2f8f74;
              outline-offset: 2px;
            }
            .nq-qm-choice--correct {
              background: linear-gradient(150deg, #e8fbe9 0%, #bdeecb 100%);
              box-shadow:
                0 4px 0 #2f8f4e,
                0 6px 10px rgba(31, 90, 51, 0.3),
                inset -2px -2px 4px rgba(47, 143, 78, 0.18),
                inset 2px 2px 4px rgba(255, 255, 255, 0.85);
              animation: nq-qm-correct-pop 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
            }
            .nq-qm-choice--wrong {
              background: linear-gradient(150deg, #fde6e6 0%, #f3b8b8 100%);
              box-shadow:
                0 4px 0 #c23b3b,
                0 6px 10px rgba(122, 31, 31, 0.3),
                inset -2px -2px 4px rgba(194, 59, 59, 0.18),
                inset 2px 2px 4px rgba(255, 255, 255, 0.85);
              animation: nq-qm-wrong-shake 420ms ease-in-out both;
            }
            @keyframes nq-qm-correct-pop {
              0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(47, 143, 78, 0.55); }
              40% { transform: scale(1.06); box-shadow: 0 0 0 10px rgba(47, 143, 78, 0); }
              100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(47, 143, 78, 0); }
            }
            @keyframes nq-qm-wrong-shake {
              0%, 100% { transform: translateX(0); }
              20% { transform: translateX(-7px); }
              40% { transform: translateX(6px); }
              60% { transform: translateX(-5px); }
              80% { transform: translateX(3px); }
            }
            @keyframes nq-qm-choice-in {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .nq-qm-choice-in {
              animation: nq-qm-choice-in 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
            }
            @media (prefers-reduced-motion: reduce) {
              .nq-qm-choice-in, .nq-qm-choice--correct, .nq-qm-choice--wrong, .nq-qm-timer--urgent { animation: none; }
            }
            .nq-qm-potion-btn {
              background: linear-gradient(150deg, #e8fbe9 0%, #bdeecb 100%);
              color: #1c5c33;
              box-shadow:
                0 4px 0 #2f8f4e,
                0 6px 10px rgba(31, 90, 51, 0.3),
                inset -2px -2px 4px rgba(47, 143, 78, 0.18),
                inset 2px 2px 4px rgba(255, 255, 255, 0.85);
              transition: transform 140ms ease-out, box-shadow 140ms ease-out, filter 140ms ease-out;
            }
            .nq-qm-potion-btn:not(:disabled):hover {
              filter: brightness(1.05);
              transform: translateY(-2px);
            }
            .nq-qm-potion-btn:not(:disabled):active {
              transform: translateY(1px);
            }
          `}</style>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={`
              ${poppins.className}
              relative
              w-[95vw]
              max-w-[900px]

              max-[640px]:w-[98vw]
              max-[640px]:max-w-none
            `}
          >
            {/* Bingkai kayu — jadi "props papan" bukan kotak modal generik. */}
            <div className="nq-qm-frame rounded-[26px] p-[clamp(8px,1.1vw,14px)]">
              <div
                className="
                  relative
                  overflow-visible
                  rounded-[20px]
                  bg-no-repeat
                  bg-center
                  bg-contain

                  min-h-[clamp(420px,58vh,540px)]

                  px-[clamp(24px,3vw,48px)]
                  pt-[clamp(40px,4.2vw,58px)]
                  pb-[clamp(46px,4.5vw,60px)]

                  max-[640px]:min-h-[300px]
                  max-[640px]:px-4
                  max-[640px]:pt-5
                  max-[640px]:pb-8
                  "
                style={{
                  backgroundImage: `url(${getNucaImage("kertas")})`,
                  backgroundSize: "100% 100%",
                }}
              >
                {/* Lily pad ngintip di 2 pojok atas — motif yang sama kayak
                    di GameBackground, diperkecil jadi aksen. */}
                <img
                  src={nuca.teratai}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-[6%] -top-[10%] w-[16%] max-w-[90px] -scale-x-100 opacity-90"
                />
                <img
                  src={nuca.teratai}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-[6%] -top-[10%] w-[16%] max-w-[90px] opacity-90"
                />

                {/* Pita "PERTANYAAN" — bahasa gold-parchment yang sama kayak
                    turn banner/tombol lanjut di RankModal. */}
                <div className="pointer-events-none absolute left-1/2 -top-3 sm:-top-4 -translate-x-1/2">
                  <span className="nq-qm-ribbon inline-block whitespace-nowrap rounded-full px-4 py-1 sm:px-6 sm:py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-wider">
                    Pertanyaan
                  </span>
                </div>

                {/* Hitung mundur jawab — cuma nongol kalau belum ada feedback
                    (masih boleh milih) dan jamnya emang lagi jalan. */}
                {answerTurnStartedAt && !feedback ? (
                  <div className="absolute right-3 top-3 sm:right-5 sm:top-5 z-10">
                    <span
                      className={`nq-qm-timer ${secondsLeft <= 3 ? "nq-qm-timer--urgent" : ""} flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full text-sm sm:text-base font-black`}
                    >
                      {secondsLeft}
                    </span>
                  </div>
                ) : null}

                <h3 className="
                  font-bauhaus
                  text-center
                  text-[clamp(16px,1.7vw,26px)]
                  tracking-wide
                  text-[#3d2411]
                  leading-snug

                  mt-[clamp(10px,1.4vw,18px)]

                  max-[640px]:text-sm
                  ">
                  {displayQuestion}
                </h3>

                <div className="
                  mt-[clamp(18px,2vw,28px)]
                  grid
                  gap-[clamp(10px,1.2vw,16px)]

                  max-[640px]:mt-3
                  max-[640px]:gap-2.5
                  ">
                  {displayChoices.map((choice, index) => {
                    // Abis jawaban ke-submit: pilihan yang bener selalu ijo,
                    // pilihan yang DIPILIH (kalau salah) merah — sisanya netral.
                    const isCorrectChoice = feedback && index === feedback.correctIndex;
                    const isWrongPick = feedback && index === feedback.selectedIndex && feedback.selectedIndex !== feedback.correctIndex;
                    const feedbackClass = isCorrectChoice
                      ? "nq-qm-choice--correct text-[#1c5c33]"
                      : isWrongPick
                        ? "nq-qm-choice--wrong text-[#7a1f1f]"
                        : "text-[#45321a]";

                    return (
                      <button
                        key={choice}
                        type="button"
                        disabled={disabled || Boolean(feedback)}
                        onClick={() => (onSelectChoice ? onSelectChoice(index) : onClose())}
                        style={{ animationDelay: `${index * 70}ms` }}
                        className={`
                          nq-qm-choice
                          nq-qm-choice-in
                          mx-auto
                          w-[88%]
                          sm:w-[90%]
                          rounded-[16px]
                          px-[clamp(16px,2vw,24px)]
                          py-3
                          sm:py-[clamp(10px,1vw,14px)]
                          text-center
                          text-[clamp(14px,1vw,20px)]
                          font-semibold
                          disabled:cursor-not-allowed
                          ${feedback ? "" : "disabled:opacity-50"}
                          ${feedbackClass}
                        `}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>

                {onUsePotion && !disabled && !feedback && potionCount > 0 ? (
                  <div className="mt-[clamp(14px,1.6vw,20px)] flex justify-center max-[640px]:mt-3">
                    <button
                      type="button"
                      onClick={handlePotionClick}
                      className="nq-qm-potion-btn flex items-center gap-2 rounded-full px-4 py-2 text-[clamp(11px,0.9vw,14px)] font-bold"
                    >
                      <img src={attribut.potion1} alt="" className="h-5 w-5" />
                      Pakai Potion ({potionCount})
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Rambatan nyembul dari bawah, di belakang medali avatar —
                sambungan visual ke "tanaman" yang ngelilingin meja. */}
            <img
              src={nuca.tanaman}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 -bottom-[6%] w-[46%] max-w-[260px] -translate-x-1/2 opacity-80"
            />

            <div className="absolute left-1/2 -bottom-4 sm:-bottom-[clamp(8px,1vw,16px)] z-10 -translate-x-1/2">
              <div className="relative h-14 w-14 sm:h-[clamp(52px,5vw,74px)] sm:w-[clamp(52px,5vw,74px)]">
                {/* Medali daun teratai di belakang avatar, bukan lingkaran polos. */}
                <img
                  src={nuca.teratai}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-[35%] opacity-95"
                />
                <div className="relative h-full w-full overflow-hidden rounded-full bg-gradient-to-br from-[#fff3cb] via-[#f6c26f] to-[#cf8132] shadow-[0_6px_14px_rgba(0,0,0,0.35)] ring-2 ring-white/80">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar pemain"
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>

                <span className="pointer-events-none absolute -inset-[3px] rounded-full ring-[3px] ring-[#f6b93b]" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
