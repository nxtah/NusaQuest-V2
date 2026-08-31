"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { information } from "../../assets/images/information/cloudinaryAssets";
import { badge, attribut } from "../../assets/images/badge/cloudinaryAssets";
import { nuca } from "../../assets/images/nuca/cloudinaryAssets";
import type { GameReward } from "../../services/firebase/firestore/users.service";

export interface RankedPlayer {
    uid: string;
    name: string;
    photoURL?: string;
}

interface RankModalProps {
    isOpen: boolean;
    /** Sudah terurut — index 0 = juara 1. */
    rankedPlayers: RankedPlayer[];
    myUID: string | null;
    /** Reward (badge + potion) yang baru aja di-claim buat AKUN INI —
        `null` kalau gak dapet apa-apa ronde ini (ranking 4+). */
    myReward?: GameReward | null;
    onContinue: () => void;
    /** "Main Lagi" — balik langsung ke ROOM yang tadi dimainkan (bukan
        daftar lobby), biar gampang main lagi bareng orang yang sama. */
    onPlayAgain?: () => void;
}

const RANK_BADGES = [badge.gold1, badge.silver1, badge.bronze1];
const BADGE_LABEL: Record<GameReward["badge"], string> = {
    gold: "Emas",
    silver: "Perak",
    bronze: "Perunggu",
};
const BADGE_ICON: Record<GameReward["badge"], string> = {
    gold: badge.gold1,
    silver: badge.silver1,
    bronze: badge.bronze1,
};
// Confetti sengaja dipatok ke warna gold-parchment + hijau tosca yang udah
// jadi identitas visual app ini (bukan rainbow generik) — biar kerasa
// "punya" NusaCard, bukan efek confetti template.
const CONFETTI_COLORS = ["#ffc93c", "#f5a916", "#fff6e0", "#2f8f74"];

export default function RankModal({ isOpen, rankedPlayers, myUID, myReward, onContinue, onPlayAgain }: RankModalProps) {
    const hasFiredRef = useRef(false);

    // Confetti nembak sekali doang tiap popup ini kebuka (bukan tiap re-render
    // gara-gara gameState update lain) — ref guard, direset begitu modal
    // ketutup lagi. Dilewatin sepenuhnya kalau user minta reduced motion.
    useEffect(() => {
        if (!isOpen || hasFiredRef.current) {
            if (!isOpen) hasFiredRef.current = false;
            return;
        }
        hasFiredRef.current = true;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const myRank = rankedPlayers.findIndex((p) => p.uid === myUID);
        const isWinner = myRank === 0;

        const fire = (particleCount: number, spread: number, origin: { x: number; y: number }) => {
            void confetti({
                particleCount,
                spread,
                origin,
                colors: CONFETTI_COLORS,
                zIndex: 1200,
                scalar: isWinner ? 1 : 0.8,
            });
        };

        // 2 "meriam" dari pojok bawah kiri/kanan menuju tengah — lebih niat
        // kesannya daripada 1 ledakan tunggal di tengah. Juara 1 dapet
        // porsi lebih besar, sisanya tetep dirayain tapi lebih halus.
        fire(isWinner ? 70 : 36, 65, { x: 0.15, y: 0.9 });
        fire(isWinner ? 70 : 36, 65, { x: 0.85, y: 0.9 });
        if (isWinner) {
            setTimeout(() => fire(50, 100, { x: 0.5, y: 0.35 }), 200);
        }
    }, [isOpen, rankedPlayers, myUID]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <style>{`
                .nq-rank-continue-btn {
                    background: linear-gradient(150deg, #ffe28a 0%, #ffc93c 55%, #f5a916 100%);
                    color: #4a2a1a;
                    box-shadow:
                        0 5px 0 #c6841a,
                        0 8px 14px rgba(120, 72, 0, 0.35),
                        inset -3px -3px 6px rgba(150, 90, 0, 0.25),
                        inset 3px 3px 5px rgba(255, 255, 255, 0.65);
                    transition: transform 150ms ease-out, box-shadow 150ms ease-out, filter 150ms ease-out;
                }
                .nq-rank-continue-btn:hover {
                    filter: brightness(1.05);
                    transform: translateY(-2px);
                }
                .nq-rank-continue-btn:active {
                    transform: translateY(2px);
                }
                .nq-rank-secondary-btn {
                    background: linear-gradient(150deg, #fffdf8 0%, #f3ede0 100%);
                    color: #3d2411;
                    box-shadow:
                        0 5px 0 #d8c8a8,
                        0 8px 14px rgba(120, 92, 40, 0.25),
                        inset -3px -3px 6px rgba(150, 120, 60, 0.12),
                        inset 3px 3px 5px rgba(255, 255, 255, 0.9);
                    transition: transform 150ms ease-out, box-shadow 150ms ease-out, filter 150ms ease-out;
                }
                .nq-rank-secondary-btn:hover {
                    filter: brightness(1.03);
                    transform: translateY(-2px);
                }
                .nq-rank-secondary-btn:active {
                    transform: translateY(2px);
                }
                .nq-rank-frame {
                    background-image: url(${nuca.kayu});
                    background-size: cover;
                    background-position: center;
                    box-shadow:
                        0 16px 32px rgba(0, 0, 0, 0.45),
                        inset 0 0 0 3px rgba(255, 255, 255, 0.12);
                }
                .nq-rank-title-glow {
                    background: radial-gradient(closest-side, rgba(255, 201, 60, 0.55), rgba(255, 201, 60, 0) 70%);
                }
                @keyframes nq-rank-glow-pulse {
                    0%, 100% { opacity: 0.55; transform: scale(1); }
                    50% { opacity: 0.85; transform: scale(1.08); }
                }
                .nq-rank-title-glow {
                    animation: nq-rank-glow-pulse 2.6s ease-in-out infinite;
                }
                .nq-rank-row {
                    background: linear-gradient(150deg, #fff6e0 0%, #f2dfae 100%);
                    box-shadow:
                        0 3px 6px rgba(139, 94, 42, 0.25),
                        inset -2px -2px 4px rgba(139, 94, 42, 0.18),
                        inset 2px 2px 4px rgba(255, 255, 255, 0.85);
                }
                .nq-rank-row--me {
                    box-shadow:
                        0 3px 6px rgba(139, 94, 42, 0.25),
                        inset -2px -2px 4px rgba(139, 94, 42, 0.18),
                        inset 2px 2px 4px rgba(255, 255, 255, 0.85),
                        0 0 0 2px #2f8f74;
                }
                .nq-rank-row--first {
                    background: linear-gradient(150deg, #fff3cb 0%, #ffdf8f 55%, #f6c453 100%);
                    box-shadow:
                        0 4px 8px rgba(139, 94, 42, 0.3),
                        inset -2px -2px 4px rgba(139, 94, 42, 0.2),
                        inset 2px 2px 5px rgba(255, 255, 255, 0.9),
                        0 0 0 2px #f5a916;
                }
                @keyframes nq-rank-row-in {
                    from { opacity: 0; transform: translateX(-12px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .nq-rank-row {
                    animation: nq-rank-row-in 360ms cubic-bezier(0.22, 1, 0.36, 1) both;
                }
                @media (prefers-reduced-motion: reduce) {
                    .nq-rank-row, .nq-rank-title-glow { animation: none; }
                }
                .nq-rank-reward {
                    background: linear-gradient(150deg, #e8fbe9 0%, #bdeecb 100%);
                    box-shadow:
                        0 3px 6px rgba(47, 143, 78, 0.25),
                        inset -2px -2px 4px rgba(47, 143, 78, 0.18),
                        inset 2px 2px 4px rgba(255, 255, 255, 0.85);
                    animation: nq-rank-row-in 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
                    animation-delay: 200ms;
                }
                @media (prefers-reduced-motion: reduce) {
                    .nq-rank-reward { animation: none; }
                }
            `}</style>

            <div className="relative w-full max-w-2xl animate-in zoom-in duration-300 ease-out">
                {/* Bingkai kayu — nerusin bahasa "properti papan" yang sama
                    kayak QuestionModal, biar 2 popup penting ini kerasa satu
                    keluarga, bukan modal generik. */}
                <div className="nq-rank-frame rounded-[32px] p-[clamp(10px,1.6vw,16px)]">
                    <div
                        className="relative overflow-visible rounded-[26px] px-6 py-10 sm:px-12 sm:py-14 flex flex-col items-center gap-5 bg-center bg-cover"
                        style={{ backgroundImage: `url(${information.kertas})` }}
                    >
                        {/* Daun teratai ngintip di pojok — motif yang sama
                            kayak papan & popup pertanyaan. */}
                        <img
                            src={nuca.teratai}
                            alt=""
                            aria-hidden="true"
                            className="pointer-events-none absolute -left-[8%] -top-[9%] w-[20%] max-w-[100px] -scale-x-100 opacity-90"
                        />
                        <img
                            src={nuca.teratai}
                            alt=""
                            aria-hidden="true"
                            className="pointer-events-none absolute -right-[8%] -top-[9%] w-[20%] max-w-[100px] opacity-90"
                        />

                        <div className="relative flex flex-col items-center">
                            <span className="nq-rank-title-glow pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 sm:h-32 sm:w-32 -translate-x-1/2 -translate-y-1/2 rounded-full" />
                            <h2 className="relative font-bauhaus text-[#3d2411] text-2xl sm:text-3xl text-center tracking-wide">
                                Permainan Selesai!
                            </h2>
                        </div>
                        <p className="text-[#4a2a1a]/80 text-sm sm:text-base text-center font-semibold -mt-2">
                            Peringkat Akhir
                        </p>

                        <div className="w-full flex flex-col gap-3">
                            {rankedPlayers.map((player, index) => {
                                const rank = index + 1;
                                const isMe = player.uid === myUID;
                                const isFirst = index === 0;
                                const badgeImg = RANK_BADGES[index];

                                return (
                                    <div
                                        key={player.uid}
                                        className={`nq-rank-row ${isFirst ? "nq-rank-row--first" : ""} ${isMe ? "nq-rank-row--me" : ""} flex items-center gap-4 rounded-2xl px-4 py-3 sm:px-6 sm:py-3.5`}
                                        style={{ animationDelay: `${index * 90}ms` }}
                                    >
                                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center">
                                            {badgeImg ? (
                                                <img src={badgeImg} alt="" className="h-full w-full object-contain" />
                                            ) : (
                                                <span className="font-bauhaus text-[#6b3f0a] text-lg sm:text-xl">{rank}</span>
                                            )}
                                        </div>

                                        <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 overflow-hidden rounded-full bg-[#e8d8b5] ring-2 ring-white/70">
                                            {player.photoURL ? (
                                                <img src={player.photoURL} alt="" className="h-full w-full object-cover" />
                                            ) : null}
                                        </div>

                                        <p className="flex-1 truncate text-base sm:text-lg font-bold text-[#4a2a1a]">
                                            {player.name}
                                            {isMe && <span className="ml-1.5 text-sm font-semibold text-[#2f8f74]">(Kamu)</span>}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {myReward && (
                            <div className="nq-rank-reward w-full rounded-2xl px-5 py-4 flex items-center justify-center gap-3 text-center">
                                <img src={BADGE_ICON[myReward.badge]} alt="" className="h-11 w-11 shrink-0" />
                                <p className="text-base sm:text-lg font-bold text-[#4a2a1a]">
                                    Kamu dapat Badge {BADGE_LABEL[myReward.badge]}
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
                                    className="nq-rank-continue-btn px-8 py-3.5 rounded-full font-bold text-sm sm:text-base"
                                >
                                    Main Lagi
                                </button>
                            )}
                            <button
                                onClick={onContinue}
                                className="nq-rank-secondary-btn px-8 py-3.5 rounded-full font-bold text-sm sm:text-base"
                            >
                                Kembali ke Lobby
                            </button>
                        </div>
                    </div>
                </div>

                {/* Rambatan nyembul di bawah bingkai, sambungan visual ke
                    QuestionModal & meja permainan. */}
                <img
                    src={nuca.tanaman}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 -bottom-[7%] w-[50%] max-w-[280px] -translate-x-1/2 opacity-80"
                />
            </div>
        </div>
    );
}
