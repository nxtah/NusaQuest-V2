'use client';

import React from 'react';
import {ularTangga} from '../../../assets/images/ular-tangga/cloudinaryAssets';

interface QuestionPanelProps {
  questionText: string;
  options: string[];
  selectedIndex?: number | null;
  onSelectOption?: (index: number) => void;
  isCorrectIndex?: number | null;
  playerName?: string;
}

export default function QuestionPanel({
  questionText,
  options,
  selectedIndex = null,
  onSelectOption,
  isCorrectIndex = null,
  playerName,
}: QuestionPanelProps) {
  return (
    <div className="relative w-full max-w-[560px] px-2 sm:px-0">
      <div className="relative w-full aspect-[1069/722]">
        <div
          className="absolute inset-0 bg-center bg-contain bg-no-repeat"
          style={{backgroundImage: `url(${ularTangga.kertas})`}}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4">
          {/* Player Status Message */}
          {playerName && (
            <div className="mb-1 bg-blue-100/80 px-2 py-0.5 rounded-full border border-blue-200">
              <p className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-blue-700 uppercase tracking-tight">
                🎮 {playerName} sedang menjawab soal...
              </p>
            </div>
          )}

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
                      ? 'border-lime-500 bg-lime-400 text-gray-900 font-bold' // Opsi yang dipilih & benar
                      : shouldBeRed
                        ? 'border-red-600 bg-red-500 text-white font-bold' // Opsi yang dipilih & salah
                        : shouldBeGreenCorrect
                          ? 'border-lime-500 bg-lime-300 text-gray-900 font-semibold border-2' // Opsi jawaban benar (untuk referensi)
                          : shouldBeGray
                            ? 'border-gray-400 bg-transparent text-gray-900 hover:bg-black/5 active:bg-black/10' // Belum dijawab
                            : 'border-gray-300 bg-gray-100 text-gray-600' // Opsi lain saat sudah dijawab
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
