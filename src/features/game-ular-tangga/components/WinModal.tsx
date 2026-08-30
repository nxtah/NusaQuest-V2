"use client";

import { information } from "../../../assets/images/information/cloudinaryAssets";
import { badge, attribut } from "../../../assets/images/badge/cloudinaryAssets";
import type { GameReward } from "../../../services/firebase/firestore/users.service";

interface WinModalProps {
    isOpen: boolean;
    winnerName: string;
    isMe: boolean;
    /** Reward (badge + potion) yang baru aja di-claim buat AKUN INI —
        `null`/`undefined` kalau bukan pemenang ronde ini. */
    myReward?: GameReward | null;
    onContinue: () => void;
}

export default function WinModal({ isOpen, winnerName, isMe, myReward, onContinue }: WinModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <style>{`
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

            <div className="relative w-[90%] max-w-[420px] animate-in zoom-in duration-300 ease-out">
                <div
                    className="relative rounded-3xl border-4 border-[#8b5e2a]/60 shadow-2xl px-6 py-8 sm:px-10 sm:py-10 flex flex-col items-center gap-4 bg-center bg-cover"
                    style={{ backgroundImage: `url(${information.kertas})` }}
                >
                    <img
                        src={badge.gold1}
                        alt=""
                        className="nq-win-badge w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-lg"
                    />

                    <h2 className="font-bauhaus text-[#3d2411] text-2xl sm:text-3xl text-center tracking-wide">
                        {isMe ? "Kamu Menang!" : `${winnerName} Menang!`}
                    </h2>
                    <p className="text-[#4a2a1a]/80 text-sm sm:text-base text-center font-semibold">
                        Permainan telah berakhir.
                    </p>

                    {myReward && (
                        <div className="nq-win-reward w-full rounded-2xl px-4 py-3 flex items-center justify-center gap-3 text-center">
                            <img src={badge.gold1} alt="" className="h-9 w-9 shrink-0" />
                            <p className="text-sm sm:text-base font-bold text-[#4a2a1a]">
                                Kamu dapat Badge Emas
                                {myReward.potionAwarded && " + 1 Potion"}!
                            </p>
                            {myReward.potionAwarded && (
                                <img src={attribut.potion1} alt="" className="h-9 w-9 shrink-0" />
                            )}
                        </div>
                    )}

                    <button
                        onClick={onContinue}
                        className="nq-win-continue-btn mt-2 px-8 py-3 rounded-full font-bold text-sm sm:text-base"
                    >
                        Kembali ke Lobby
                    </button>
                </div>
            </div>
        </div>
    );
}
