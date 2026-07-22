"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export type PlayerTurnStatus = "idle" | "thrower" | "waiting" | "answering" | "answered";

interface PlayerProfileNucaProps {
  isActive?: boolean;
  status?: PlayerTurnStatus;
  sizeClassName?: string;
  avatarUrl?: string;
  /** Durasi hitung mundur (detik) saat status === "answering". Default 7 detik. */
  answerDurationSeconds?: number;
  /** Dipanggil sekali saat hitungan mundur mencapai 0. Pakai ini untuk memajukan giliran. */
  onAnswerTimeout?: () => void;
}

const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function PlayerProfileNuca({
  isActive = false,
  status = "idle",
  sizeClassName,
  avatarUrl,
  answerDurationSeconds = 7,
  onAnswerTimeout,
}: PlayerProfileNucaProps) {
  const avatarSize = sizeClassName ?? "h-11 w-11 sm:h-12 sm:w-12";

  const [secondsLeft, setSecondsLeft] = useState(answerDurationSeconds);

  // Reset hitungan tiap kali player ini baru masuk status "answering".
  useEffect(() => {
    if (status !== "answering") return;
    setSecondsLeft(answerDurationSeconds);
  }, [status, answerDurationSeconds]);

  // Jalankan hitung mundur satu detik per tick, murni sebagai efek — tidak ada
  useEffect(() => {
    if (status !== "answering") return;
    if (secondsLeft <= 0) return;

    const timeout = setTimeout(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [status, secondsLeft]);

  // Trigger onAnswerTimeout SETELAH render selesai (efek terpisah, aman untuk
  useEffect(() => {
    if (status !== "answering") return;
    if (secondsLeft === 0) {
      onAnswerTimeout?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, secondsLeft]);

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        animate={isActive ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={isActive ? { duration: 1.2, repeat: Infinity } : undefined}
        className={`relative ${avatarSize}`}
      >
        {/* Foto profil */}
        <div className="h-full w-full overflow-hidden rounded-full bg-gradient-to-br from-[#fff3cb] via-[#f6c26f] to-[#cf8132] shadow-[0_6px_14px_rgba(0,0,0,0.35)] ring-2 ring-white/80">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar pemain" className="h-full w-full object-cover" />
          ) : null}
        </div>

        {/* THROWER — ring emas statis */}
        {status === "thrower" ? (
          <span className="pointer-events-none absolute -inset-[3px] rounded-full ring-[3px] ring-[#f6b93b]" />
        ) : null}

        {/* ANSWERING — ring timer yang berkurang + badge angka mundur */}
        {status === "answering" ? (
          <>
            <svg
              className="pointer-events-none absolute -inset-[3px] -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r={RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="6"
              />
              <motion.circle
                cx="50"
                cy="50"
                r={RADIUS}
                fill="none"
                stroke="#f6b93b"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                animate={{
                  strokeDashoffset:
                    CIRCUMFERENCE * (1 - secondsLeft / answerDurationSeconds),
                }}
                transition={{ duration: 0.9, ease: "linear" }}
              />
            </svg>
            <span className="absolute -bottom-1.5 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-[#1c2b3a] text-[10px] font-bold text-white shadow-md">
              {secondsLeft.toString().padStart(2, "0")}
            </span>
          </>
        ) : null}

        {/* ANSWERED — ring hijau menyala + centang + sparkle */}
        {status === "answered" ? (
          <>
            <span className="pointer-events-none absolute -inset-[3px] rounded-full ring-[3px] ring-lime-400 shadow-[0_0_14px_3px_rgba(163,230,53,0.55)]" />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-lime-500 text-[10px] font-black text-white shadow-md"
            >
              ✓
            </motion.span>
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="absolute -right-1 -top-1 text-[11px] text-lime-300"
            >
              ✦
            </motion.span>
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.15, 0.9] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: 0.6 }}
              className="absolute -left-1 -bottom-1 text-[9px] text-lime-300"
            >
              ✦
            </motion.span>
          </>
        ) : null}

        {/* THROWER — titik hijau solid di pojok kanan bawah */}
        {status === "thrower" ? (
          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-lime-500" />
        ) : null}

        {/* WAITING — hanya titik netral, tanpa indikator lain */}
        {status === "waiting" ? (
          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white/70 bg-white/25" />
        ) : null}
      </motion.div>
    </div>
  );
}