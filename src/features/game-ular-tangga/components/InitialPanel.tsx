'use client';

import React from 'react';
import { ularTangga } from '../../../assets/images/ular-tangga/cloudinaryAssets';

interface InitialPanelProps { focusedName?: string | null }

export default function InitialPanel({ focusedName = null }: InitialPanelProps) {
  return (
    <div className="relative w-full max-w-[560px] px-2 sm:px-0">
      <div className="relative w-full aspect-[1069/722]">
        <div
          className="absolute inset-0 bg-center bg-contain bg-no-repeat"
          style={{ backgroundImage: `url(${ularTangga.kertas})` }}
        />

        <div className="absolute inset-0 flex items-center justify-center px-6 py-6 sm:px-8 sm:py-8 md:px-12 md:py-10">
          <p className="max-w-[85%] text-center text-xs sm:text-sm font-semibold leading-snug text-gray-800 md:text-lg md:leading-relaxed">
            {focusedName ? `${focusedName} sedang melempar dadu...` : '🎲 Putar dadu untuk memulai permainan!'}
          </p>
        </div>
      </div>
    </div>
  );
}
