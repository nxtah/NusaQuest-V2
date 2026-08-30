"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { information } from "../../../assets/images/information/cloudinaryAssets";
import { badge, attribut } from "../../../assets/images/badge/cloudinaryAssets";
import { nuca } from "../../../assets/images/nuca/cloudinaryAssets";
import type { GameReward } from "../../../services/firebase/firestore/users.service";

interface WinModalProps {
    isOpen: boolean;
    winnerName: string;
    isMe: boolean;
    /** Reward (badge + potion) yang baru aja di-claim buat AKUN INI —
        `null`/`undefined` kalau bukan pemenang ronde ini. */
    myReward?: GameReward | null;
    onContinue: () => void;
    /** "Main Lagi" — balik langsung ke ROOM yang tadi dimainkan (bukan
        daftar lobby), biar gampang main lagi bareng orang yang sama. */
    onPlayAgain?: () => void;
}

// Palet sama persis kayak RankModal — 2 popup "game selesai" ini kudu
// kerasa satu keluarga, bukan yang satu lebih mewah dari yang lain.
const CONFETTI_COLORS = ["#ffc93c", "#f5a916", "#fff6e0", "#2f8f74"];

export default function WinModal({ isOpen, winnerName, isMe, myReward, onContinue, onPlayAgain }: WinModalProps) {
    const hasFiredRef = useRef(false);

    useEffect(() => {
        if (!isOpen || hasFiredRef.current) {
            if (!isOpen) hasFiredRef.current = false;
            return;
        }
        hasFiredRef.current = true;
        if (!isMe) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const fire = (particleCount: number, spread: number, origin: { x: number; y: number }) => {
            void confetti({ particleCount, spread, origin, colors: CONFETTI_COLORS, zIndex: 1200 });
        };
        fire(70, 65, { x: 0.15, y: 0.9 });
        fire(70, 65, { x: 0.85, y: 0.9 });
        setTimeout(() => fire(50, 100, { x: 0.5, y: 0.35 }), 200);
    }, [isOpen, isMe]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <style>{`
                .nq-win-frame {
                    background-image: url(${nuca.kayu});
                    background-size: cover;
                    background-position: center;
                    box-shadow:
                        0 16px 32px rgba(0, 0, 0, 0.45),
                        inset 0 0 0 3px rgba(255, 255, 255, 0.12);
                }
                .nq-win-continue-btn {
                    background: linear-gradient(150deg, #ffe28a 0%, #ffc93c 55%, #f5a916 100%);
                    color: #4a2a1a;
                    box-shadow:
                        0 5px 0 #c6841a,
                        0 8px 14px rgba(120, 72, 0, 0.35),
                        inset -3px -3px 6px rgba(150, 90, 0, 0.25),
                        inset 3px 3px 5px rgba(255, 255, 255, 0.65);
                    transition: transform 150ms ease-out, box-shadow 150ms ease-out, filter 150ms ease-out;
                }
                .nq-win-continue-btn:hover {
                    filter: brightness(1.05);
                    transform: translateY(-2px);
                }
                .nq-win-continue-btn:active {
                    transform: translateY(2px);
                    box-shadow:
                        0 2px 0 #c6841a,
                        0 3px 6px rgba(120, 72, 0, 0.3),
                        inset -3px -3px 6px rgba(150, 90, 0, 0.25),
                        inset 3px 3px 5px rgba(255, 255, 255, 0.65);
                }
                .nq-win-secondary-btn {
                    background: linear-gradient(150deg, #fffdf8 0%, #f3ede0 100%);
                    color: #3d2411;
                    box-shadow:
                        0 5px 0 #d8c8a8,
                        0 8px 14px rgba(120, 92, 40, 0.25),
                        inset -3px -3px 6px rgba(150, 120, 60, 0.12),
                        inset 3px 3px 5px rgba(255, 255, 255, 0.9);
                    transition: transform 150ms ease-out, box-shadow 150ms ease-out, filter 150ms ease-out;
                }
                .nq-win-secondary-btn:hover {
                    filter: brightness(1.03);
                    transform: translateY(-2px);
                }
                .nq-win-secondary-btn:active {
                    transform: translateY(2px);
                }
                @keyframes nq-win-badge-in {
                    from { opacity: 0; transform: scale(0.4) rotate(-15deg); }
                    to { opacity: 1; transform: scale(1) rotate(0deg); }
                }
                .nq-win-badge {
                    animation: nq-win-badge-in 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
                }
                @media (prefers-reduced-motion: reduce) {
                    .nq-win-badge { animation: none; }
                }
                .nq-win-reward {
                    background: linear-gradient(150deg, #e8fbe9 0%, #bdeecb 100%);
                    box-shadow:
                        0 3px 6px rgba(47, 143, 78, 0.25),
                        inset -2px -2px 4px rgba(47, 143, 78, 0.18),
                        inset 2px 2px 4px rgba(255, 255, 255, 0.85);
                    animation: nq-win-badge-in 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
                    animation-delay: 150ms;
                }
                @media (prefers-reduced-motion: reduce) {
                    .nq-win-reward { animation: none; }
                }
            `}</style>

            <div className="relative w-full max-w-2xl animate-in zoom-in duration-300 ease-out">
                {/* Bingkai kayu — resep persis sama kayak RankModal (NusaCard),
                    biar 2 popup "game selesai" ini kerasa satu keluarga. */}
                <div className="nq-win-frame rounded-[32px] p-[clamp(10px,1.6vw,16px)]">
                    <div
                        className="relative rounded-[26px] px-6 py-10 sm:px-12 sm:py-14 flex flex-col items-center gap-5 bg-center bg-cover"
                        style={{ backgroundImage: `url(${information.kertas})` }}
                    >
                        <img
                            src={badge.gold1}
                            alt=""
                            className="nq-win-badge w-28 h-28 sm:w-32 sm:h-32 object-contain drop-shadow-lg"
                        />

                        <h2 className="font-bauhaus text-[#3d2411] text-2xl sm:text-3xl text-center tracking-wide">
                            {isMe ? "Kamu Menang!" : `${winnerName} Menang!`}
                        </h2>
                        <p className="text-[#4a2a1a]/80 text-sm sm:text-base text-center font-semibold">
                            Permainan telah berakhir.
                        </p>

                        {myReward && (
                            <div className="nq-win-reward w-full rounded-2xl px-5 py-4 flex items-center justify-center gap-3 text-center">
                                <img src={badge.gold1} alt="" className="h-11 w-11 shrink-0" />
                                <p className="text-base sm:text-lg font-bold text-[#4a2a1a]">
                                    Kamu dapat Badge Emas
                                    {myReward.potionAwarded && " + 1 Potion"}!
                                </p>
                                {myReward.potionAwarded && (
                                    <img src={attribut.potion1} alt="" className="h-11 w-11 shrink-0" />
                                )}
                            </div>
                        )}

                        <div className="mt-2 flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-center">
                            {onPlayAgain && (
                                <button
                                    onClick={onPlayAgain}
                                    className="nq-win-continue-btn px-8 py-3.5 rounded-full font-bold text-sm sm:text-base"
                                >
                                    Main Lagi
                                </button>
                            )}
                            <button
                                onClick={onContinue}
                                className="nq-win-secondary-btn px-8 py-3.5 rounded-full font-bold text-sm sm:text-base"
                            >
                                Kembali ke Lobby
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
