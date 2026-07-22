'use client';

import React from 'react';
import {ularTangga} from '../../../assets/images/ular-tangga/cloudinaryAssets';

interface QuestionPanelProps {
  questionText: string;
  options: string[];
  selectedIndex?: number | null;
  onSelectOption?: (index: number) => void;
  isCorrectIndex?: number | null;
}

export default function QuestionPanel({
  questionText,
  options,
  selectedIndex = null,
  onSelectOption,
  isCorrectIndex = null,
}: QuestionPanelProps) {
  return (
    <div className="relative w-full max-w-[560px] px-2 sm:px-0">
      <div className="relative w-full aspect-[1069/722]">
        <div
          className="absolute inset-0 bg-center bg-contain bg-no-repeat"
          style={{backgroundImage: `url(${ularTangga.kertas})`}}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4">
          {/* Question Text - Responsive sizing */}
          <p className="w-full max-w-[90%] text-center text-[10px] leading-tight font-bold text-gray-800 sm:text-xs md:text-sm lg:text-base break-words text-balance mb-1 sm:mb-2">
            {questionText}
          </p>

          {/* Options - Responsive gap and sizing */}
          <div className="flex w-full max-w-[92%] flex-col items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-2.5">
            {options?.map((option, index) => {
              const isSelected = selectedIndex === index;
              const isCorrect = isCorrectIndex === index;
              const isAnswered = selectedIndex !== null;

              // ===== PERBAIKI: Logika warna yang benar =====
              // 1. Jika user pilih opsi ini dan benar → hijau
              const shouldBeGreen = isSelected && isAnswered && isCorrect;
              // 2. Jika user pilih opsi ini dan salah → merah
              const shouldBeRed = isSelected && isAnswered && !isCorrect;
              // 3. Jika soal sudah dijawab tapi ini bukan yang dipilih → cek apakah ini jawaban benar (tunjukkan hijau)
              const shouldBeGreenCorrect = !isSelected && isAnswered && isCorrect;
              // 4. Jika soal belum dijawab → abu-abu normal
              const shouldBeGray = !isAnswered;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => onSelectOption?.(index)}
                  disabled={selectedIndex !== null}
                  className={`w-full rounded-full border px-2 py-1 text-[9px] font-medium leading-tight transition-all sm:px-3 sm:py-1.5 sm:text-[10px] md:px-4 md:py-2 md:text-xs lg:text-sm disabled:cursor-not-allowed disabled:opacity-100 ${shouldBeGreen
                    ? 'border-lime-600 bg-[#9dc90b] text-gray-900 font-bold' // Opsi yang dipilih & benar (sesuai referensi 2)
                    : shouldBeRed
                      ? 'border-red-700 bg-[#ef4444] text-white font-bold' // Opsi yang dipilih & salah
                      : shouldBeGreenCorrect
                        ? 'border-lime-600 bg-[#aee01b] text-gray-900 font-semibold border-2' // Opsi jawaban benar (untuk referensi)
                        : 'border-gray-500 bg-transparent text-gray-900 hover:bg-black/5 active:bg-black/10' // Kondisi belum dijawab atau opsi lain saat sudah dijawab
                    }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
