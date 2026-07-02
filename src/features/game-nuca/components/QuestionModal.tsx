"use client";

import { AnimatePresence, motion } from "framer-motion";

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const choices = ["A. Surabaya", "B. Bandung", "C. Jakarta", "D. Medan"];

export default function QuestionModal({ isOpen, onClose }: QuestionModalProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 px-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7b5a27]">
              Pertanyaan Nusantara
            </p>
            <h3 className="mt-2 text-2xl font-black text-[#1f2a1f]">
              Apa ibu kota Indonesia?
            </h3>

            <div className="mt-5 grid gap-3">
              {choices.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  className="rounded-xl border border-[#efdfc4] bg-[#fff8eb] px-4 py-3 text-left text-sm font-semibold text-[#45321a] transition hover:bg-[#f9ebcf]"
                >
                  {choice}
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                onClick={onClose}
              >
                Tutup
              </button>
              <button
                type="button"
                className="rounded-xl bg-[#d48613] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#b47211]"
                onClick={onClose}
              >
                Jawab
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
