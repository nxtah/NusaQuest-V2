"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getPauseImage } from "../../assets/images/pause/cloudinaryAssets";

export default function PauseModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const router = useRouter();
    const [isMuted, setIsMuted] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="relative w-[90%] max-w-[500px] flex items-center justify-center">
                {/* ---Konfirmasi Exit--- */}
                {showExitConfirm ? (
                    <div className="relative w-[80%] max-w-[380px] animate-in zoom-in duration-300 ease-out">
                        <img
                            src={getPauseImage("exit_2")}
                            alt="Confirm Exit"
                            className="w-full h-auto"
                        />

                        <div className="absolute inset-0 flex flex-col items-center">
                            <div className="h-[92%] flex items-center justify-center px-6">
                                <h3 className="font-bauhaus text-[#4a2a1a] text-center text-base md:text-xl leading-tight">
                                    Apakah yakin untuk
                                    <br />
                                    Keluar?
                                </h3>
                            </div>

                            <div className="flex-1 w-full flex justify-center gap-[8%] px-[12%] pb-[15%]">
                                <button
                                    onClick={() => setShowExitConfirm(false)}
                                    className="w-[42%] h-[100%] bg-[#9CCB01] hover:bg-[#81B101] text-white font-bauhaus rounded-xl shadow-[0_4px_0_#6a9200] transition-all hover:scale-105 active:scale-95 flex items-center justify-center text-xs md:text-lg"
                                >
                                    Tidak
                                </button>

                                <button
                                    onClick={() => router.push("/home")}
                                    className="w-[42%] h-[100%] bg-[#C62115] hover:bg-[#A51B11] text-white font-bauhaus rounded-xl shadow-[0_4px_0_#8a170e] transition-all hover:scale-105 active:scale-95 flex items-center justify-center text-xs md:text-lg"
                                >
                                    Iya
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* --- SETTINGS UTAMA --- */
                    <div className="relative w-full animate-in fade-in duration-200">
                        <img
                            src={getPauseImage("board_paused")}
                            alt="Board"
                            className="w-full h-auto"
                        />

                        <div className="absolute inset-0 flex flex-col items-center">
                            {/* Header */}
                            <div className="h-[22%] flex items-center justify-center">
                                <h2 className="font-bauhaus text-[#4a2a1a] text-lg md:text-2xl mt-0.5">
                                    Settings
                                </h2>
                            </div>

                            {/* Tombol Music & Exit */}
                            <div className="flex-1 flex items-center justify-center gap-8 md:gap-12">
                                {/* Music Toggle */}
                                <button
                                    onClick={() => setIsMuted(!isMuted)}
                                    className="group transition-all duration-200 hover:scale-110 active:scale-95"
                                >
                                    <div className="relative w-16 h-16 md:w-20 md:h-20 bg-[#e8d8b5] rounded-2xl flex items-center justify-center shadow-[0_4px_0_#c4b494] border border-[#d8c8a5]/50 overflow-hidden">
                                        <img
                                            src={getPauseImage("music")}
                                            alt="Music"
                                            className={`w-[80%] h-[80%] transition-all duration-300 ${
                                                isMuted
                                                    ? "opacity-30 grayscale-[50%]"
                                                    : "opacity-100"
                                            }`}
                                        />
                                        {isMuted && (
                                            <div className="absolute w-[80%] h-[3px] bg-[#EADFC5] rotate-[45deg] rounded-full shadow-sm" />
                                        )}
                                    </div>
                                </button>

                                {/* Exit Trigger */}
                                <button
                                    onClick={() => setShowExitConfirm(true)}
                                    className="group transition-all duration-200 hover:scale-110 active:scale-95"
                                >
                                    <div className="w-16 h-16 md:w-20 md:h-20 bg-[#e8d8b5] rounded-2xl flex items-center justify-center shadow-[0_4px_0_#c4b494] border border-[#d8c8a5]/50">
                                        <img
                                            src={getPauseImage("exit")}
                                            alt="Exit"
                                            className="w-[80%] h-[80%]"
                                        />
                                    </div>
                                </button>
                            </div>

                            {/* Tombol Close */}
                            <div className="h-[28%] flex items-start justify-center">
                                <button
                                    onClick={onClose}
                                    className="group relative hover:scale-105 active:scale-95 drop-shadow-[0_6px_0_rgba(0,0,0,0.3)]"
                                >
                                    <img
                                        src={getPauseImage("resume")}
                                        alt="Button Wood"
                                        className="w-32 md:w-44 h-auto"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-[90%] h-[75%] bg-[#81B101] rounded-lg flex items-center justify-center shadow-inner">
                                            <span className="font-bauhaus text-white text-sm md:text-lg lg:text-xl">
                                                Close
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
