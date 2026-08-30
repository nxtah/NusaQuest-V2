'use client';

import React from 'react';

interface InitialPanelProps { focusedName?: string | null }

export default function InitialPanel({ focusedName = null }: InitialPanelProps) {
  return (
    <div className="relative w-full max-w-[560px] px-2 sm:px-0">
      <style>{`
        /* Bingkai emas — sama kayak QuestionPanel, biar gak "ilang" nyatu
           sama background kayu di sekitarnya, dan gak nyentak visual pas
           panel ini gonta-ganti sama QuestionPanel. */
        .nq-ut-ip-frame {
          background: linear-gradient(150deg, #ffe28a 0%, #ffc93c 55%, #f5a916 100%);
          box-shadow:
            0 16px 30px rgba(0, 0, 0, 0.45),
            inset 0 0 0 3px rgba(255, 255, 255, 0.35);
        }
        .nq-ut-ip-paper {
          background: linear-gradient(150deg, #fff9ea 0%, #f7e6bc 100%);
          box-shadow:
            inset -3px -3px 8px rgba(139, 94, 42, 0.14),
            inset 3px 3px 8px rgba(255, 255, 255, 0.8);
        }
      `}</style>

      <div className="nq-ut-ip-frame relative w-full rounded-[20px] p-[3px]">
        <div className="nq-ut-ip-paper relative w-full min-h-[140px] sm:min-h-[170px] rounded-[17px] flex items-center justify-center px-6 py-6 sm:px-8 sm:py-8">
          <p className="max-w-[85%] text-center font-semibold text-[#3d2411] leading-tight text-[4.5vmin] md:text-[2.5vmin] lg:text-lg lg:leading-relaxed">
            {focusedName ? `${focusedName} sedang melempar dadu...` : '🎲 Putar dadu untuk memulai permainan!'}
          </p>
        </div>
      </div>
    </div>
  );
}
