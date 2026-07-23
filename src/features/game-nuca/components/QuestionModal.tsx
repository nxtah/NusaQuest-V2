"use client";

import { getNucaImage } from "@/src/assets/images/nuca/cloudinaryAssets";
import { AnimatePresence, motion } from "framer-motion";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question?: string;
  choices?: string[];
  avatarUrl?: string;
  /** Kalau dikasih, dipanggil dengan index pilihan alih-alih langsung onClose. */
  onSelectChoice?: (index: number) => void;
  disabled?: boolean;
}

const defaultChoices = ["Surabaya", "Bandung", "Jakarta", "Medan"];

export default function QuestionModal({
  isOpen,
  onClose,
  question = "Apa ibu kota Indonesia?",
  choices = defaultChoices,
  avatarUrl,
  onSelectChoice,
  disabled = false,
}: QuestionModalProps) {
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
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={`
              ${poppins.className}
              relative
              w-[70vw]
              max-w-[900px]

              max-[640px]:w-[98vw]
              max-[640px]:max-w-none
            `}
          >
            <div
              className="
                bg-no-repeat
                bg-center
                bg-contain

                min-h-[clamp(380px,60vh,560px)]

                px-[clamp(24px,3vw,48px)]
                pt-[clamp(48px,5vw,68px)]
                pb-[clamp(42px,4vw,56px)]

                max-[640px]:min-h-[320px]
                max-[640px]:px-4
                max-[640px]:pt-6
                max-[640px]:pb-6
                "
              style={{
                backgroundImage: `url(${getNucaImage("kertas")})`,
                backgroundSize: "100% 100%",
              }}
            >
              <h3 className="
                text-center
                text-[clamp(18px,1.8vw,30px)]
                font-bold
                text-[#1f2a1f]
                leading-tight
                pt-[clamp(24px,2vw,48px)] 
                max-[640px]:text-base
                ">
                {question}
              </h3>

              <div className="
                mt-[clamp(18px,2vw,28px)]
                grid
                gap-[clamp(8px,1vw,14px)]

                max-[640px]:mt-3
                max-[640px]:gap-2
                ">
                {choices.map((choice, index) => (
                  <button
                    key={choice}
                    type="button"
                    disabled={disabled}
                    onClick={() => (onSelectChoice ? onSelectChoice(index) : onClose())}
                    className="
                      mx-auto
                      w-[88%]
                      sm:w-[90%]
                      rounded-[18px]
                      border
                      border-[#2e2e2e]
                      bg-transparent
                      px-[clamp(16px,2vw,24px)]
                      py-3
                      sm:py-[clamp(10px,1vw,14px)]
                      text-center
                      text-[clamp(14px,1vw,20px)]
                      font-semibold
                      text-[#45321a]
                      transition
                      hover:bg-[#f9ebcf]
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>

            <div className="absolute left-1/2 lg:bottom-4 bottom-[clamp(8px,1vw,16px)] z-10 -translate-x-1/2">
              <div className="relative lg:h-14 lg:w-14 h-[clamp(40px,3rem,64px)] w-[clamp(40px,3rem,64px)]">
                <div className="h-full w-full overflow-hidden rounded-full bg-gradient-to-br from-[#fff3cb] via-[#f6c26f] to-[#cf8132] shadow-[0_6px_14px_rgba(0,0,0,0.35)] ring-2 ring-white/80">
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