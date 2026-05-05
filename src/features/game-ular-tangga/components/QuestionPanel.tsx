'use client';

import React from 'react';
import { ularTangga } from '../../../assets/images/ular-tangga/cloudinaryAssets';

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
      <div className="relative w-full aspect-[1069/722] overflow-hidden">
        <div
          className="absolute inset-0 bg-center bg-contain bg-no-repeat"
          style={{ backgroundImage: `url(${ularTangga.kertas})` }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-3 py-3 sm:px-5 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">
          {/* Question Text - Responsive sizing */}
          <p className="w-full max-w-[92%] text-center text-[11px] leading-tight font-medium text-gray-800 sm:max-w-[88%] sm:text-xs sm:leading-snug md:text-sm md:leading-relaxed lg:text-base break-words text-balance">
            {questionText}
          </p>

          {/* Options - Responsive gap and sizing */}
          <div className="mt-3 sm:mt-4 md:mt-5 flex w-full max-w-[92%] flex-col items-center gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 overflow-hidden">
            {options.map((option, index) => {
              const isSelected = selectedIndex === index;
              const isCorrect = isCorrectIndex === index;
              const isAnswered = selectedIndex !== null;
              const isWrong = isSelected && isAnswered && !isCorrect;
              const isGreen = isSelected && isAnswered && isCorrect;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSelectOption?.(index)}
                  disabled={selectedIndex !== null}
                  className={`w-full rounded-full border px-3 py-1.5 text-[10px] font-medium leading-tight transition-all sm:px-4 sm:py-2 sm:text-xs md:px-5 md:py-2.5 md:text-sm disabled:cursor-not-allowed disabled:opacity-100 ${
                    isGreen
                      ? 'border-lime-500 bg-lime-400 text-gray-900 font-bold scale-[1.0]'
                      : isWrong
                        ? 'border-red-600 bg-red-500 text-white font-bold scale-[1.0]'
                        : isAnswered
                          ? 'border-gray-300 bg-gray-100 text-gray-600'
                          : 'border-gray-400 bg-transparent text-gray-900 hover:bg-black/5 active:bg-black/10'
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
