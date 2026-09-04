"use client";

import { useState } from "react";
import { information } from "../../assets/images/information/cloudinaryAssets";

interface FeedbackPopupProps {
    isOpen: boolean;
    onSubmit: (rating: 1 | 2 | 3 | 4 | 5, comment: string) => Promise<void> | void;
    onSkip: () => void;
}

const STAR_LABELS = ["Kurang", "Biasa", "Cukup", "Seru", "Seru Banget"];

/** Popup rating+saran — muncul SEKALI abis satu game selesai, sebelum user
    balik ke lobby (lihat onContinue di ular-tangga/nusa-card page.tsx).
    Bisa dilewatin (tombol "Lewati") — feedback ini opsional, jangan sampai
    kerasa maksa/blocking buat user yang buru-buru. */
export default function FeedbackPopup({ isOpen, onSubmit, onSkip }: FeedbackPopupProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (rating === 0 || submitting) return;
        setSubmitting(true);
        try {
            await onSubmit(rating as 1 | 2 | 3 | 4 | 5, comment.trim());
        } finally {
            setSubmitting(false);
        }
    };

    const displayRating = hoverRating || rating;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <style>{`
                .nq-feedback-continue-btn {
                    background: linear-gradient(150deg, #ffe28a 0%, #ffc93c 55%, #f5a916 100%);
                    color: #4a2a1a;
                    box-shadow:
                        0 5px 0 #c6841a,
                        0 8px 14px rgba(120, 72, 0, 0.35),
                        inset -3px -3px 6px rgba(150, 90, 0, 0.25),
                        inset 3px 3px 5px rgba(255, 255, 255, 0.65);
                    transition: transform 150ms ease-out, box-shadow 150ms ease-out, filter 150ms ease-out;
                }
                .nq-feedback-continue-btn:hover:not(:disabled) { filter: brightness(1.05); transform: translateY(-2px); }
                .nq-feedback-continue-btn:active:not(:disabled) { transform: translateY(2px); }
                .nq-feedback-continue-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .nq-feedback-secondary-btn {
                    background: linear-gradient(150deg, #fffdf8 0%, #f3ede0 100%);
                    color: #3d2411;
                    box-shadow:
                        0 5px 0 #d8c8a8,
                        0 8px 14px rgba(120, 92, 40, 0.25),
                        inset -3px -3px 6px rgba(150, 120, 60, 0.12),
                        inset 3px 3px 5px rgba(255, 255, 255, 0.9);
                    transition: transform 150ms ease-out, box-shadow 150ms ease-out;
                }
                .nq-feedback-secondary-btn:hover:not(:disabled) { filter: brightness(1.03); transform: translateY(-2px); }
                .nq-feedback-secondary-btn:active:not(:disabled) { transform: translateY(2px); }
                .nq-feedback-frame {
                    background: linear-gradient(150deg, #8b5e2a 0%, #6b4620 100%);
                    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.45), inset 0 0 0 3px rgba(255, 255, 255, 0.12);
                }
                .nq-feedback-star { background: none; border: none; cursor: pointer; padding: 2px; transition: transform 100ms ease-out; }
                .nq-feedback-star:hover { transform: scale(1.15); }
                .nq-feedback-textarea {
                    background: rgba(255, 255, 255, 0.55);
                    box-shadow: inset -2px -2px 6px rgba(139, 94, 42, 0.16), inset 2px 2px 6px rgba(255, 255, 255, 0.75);
                    color: #3d2411;
                    resize: none;
                }
                .nq-feedback-textarea::placeholder { color: rgba(74, 42, 26, 0.5); }
                .nq-feedback-textarea:focus { outline: 2px solid #2f8f74; }
            `}</style>

            <div className="relative w-full max-w-md animate-in zoom-in duration-300 ease-out">
                <div className="nq-feedback-frame rounded-[32px] p-[clamp(10px,1.6vw,16px)]">
                    <div
                        className="relative rounded-[26px] px-6 py-8 sm:px-8 sm:py-9 flex flex-col items-center gap-4 bg-center bg-cover"
                        style={{ backgroundImage: `url(${information.kertas})` }}
                    >
                        <h2 className="font-bauhaus text-[#3d2411] text-lg sm:text-xl text-center tracking-wide">
                            Gimana serunya main tadi?
                        </h2>

                        <div className="flex gap-1 sm:gap-2" onMouseLeave={() => setHoverRating(0)}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="nq-feedback-star"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    aria-label={`${star} bintang`}
                                >
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill={star <= displayRating ? "#f5a916" : "none"} stroke="#f5a916" strokeWidth="1.5">
                                        <path d="M12 2l2.9 6.9L22 9.6l-5.5 5 1.6 7.4L12 18.3l-6.1 3.7 1.6-7.4L2 9.6l7.1-0.7z" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                        {displayRating > 0 && (
                            <p className="text-xs sm:text-sm font-semibold text-[#8b5e2a] -mt-2">
                                {STAR_LABELS[displayRating - 1]}
                            </p>
                        )}

                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Saran atau kesan (opsional)..."
                            maxLength={300}
                            rows={3}
                            className="nq-feedback-textarea w-full rounded-xl px-4 py-3 text-sm"
                        />

                        <div className="mt-1 flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-center">
                            <button
                                type="button"
                                onClick={onSkip}
                                disabled={submitting}
                                className="nq-feedback-secondary-btn px-6 py-3 rounded-full font-bold text-sm"
                            >
                                Lewati
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={rating === 0 || submitting}
                                className="nq-feedback-continue-btn px-6 py-3 rounded-full font-bold text-sm"
                            >
                                {submitting ? "Mengirim..." : "Kirim"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
