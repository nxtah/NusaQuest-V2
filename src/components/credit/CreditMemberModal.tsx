"use client";

import { useEffect, useRef, useState } from "react";

type CreditMemberModalProps = {
  version: "V1" | "V2";
  memberName: string;
  memberRole: string;
  memberBio: string;
  titleClassName: string;
  onClose: () => void;
};

export default function CreditMemberModal({
  version,
  memberName,
  memberRole,
  memberBio,
  titleClassName,
  onClose,
}: CreditMemberModalProps) {
  const ANIMATION_MS = 360;
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setIsOpen(true));
    return () => {
      cancelAnimationFrame(frameId);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const handleRequestClose = () => {
    if (!isOpen || closeTimerRef.current) {
      return;
    }

    setIsOpen(false);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, ANIMATION_MS);
  };

  return (
    <div
      className={`fixed inset-0 z-30 flex items-end bg-black/60 p-4 backdrop-blur-sm transition-opacity duration-300 sm:items-center sm:justify-center ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      role="presentation"
      onClick={handleRequestClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Detail ${memberName}`}
        className={`relative w-full max-w-4xl origin-top transform-gpu rounded-2xl border-2 border-green-600 bg-yellow-300 p-4 text-green-950 shadow-2xl transition-all duration-300 will-change-transform sm:p-6 ${
          isOpen
            ? "opacity-100 [transform:perspective(1200px)_rotateX(0deg)_scale(1)_translateY(0)]"
            : "opacity-0 [transform:perspective(1200px)_rotateX(-12deg)_scale(0.92)_translateY(24px)]"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleRequestClose}
          aria-label="Tutup popup"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-green-700 text-lg font-bold text-yellow-100 transition hover:bg-green-800 sm:right-4 sm:top-4"
        >
          ×
        </button>

        <div className="mb-4 inline-flex rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-yellow-100">
          {version}
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-5">
            <div className="aspect-[4/5] w-full rounded-xl border-2 border-dashed border-green-700 bg-green-100/70" />
          </div>

          <div className="md:col-span-7">
            <h3 className={`${titleClassName} text-2xl tracking-wide sm:text-3xl`}>{memberName}</h3>
            <p className="mt-1 text-sm font-semibold sm:text-base">{memberRole}</p>
            <p className="mt-3 text-sm leading-relaxed sm:text-base">{memberBio}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
