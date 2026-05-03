'use client';

import React from 'react';
import { getPauseImage } from '../../../assets/images/pause/cloudinaryAssets';

interface SettingButtonProps {
  onClick: () => void;
}

export default function SettingButton({ onClick }: SettingButtonProps) {
  return (
    <button 
      onClick={onClick} 
      className="absolute top-7 right-7 z-50 group transition-all duration-300 hover:scale-110 active:scale-90"
    >
      <div className="w-10 h-10 md:w-12 md:h-12 bg-[#c25829] rounded-xl flex items-center justify-center shadow-[0_4px_0_#963f23] border border-[#9e4428] overflow-hidden group-hover:rotate-12 transition-transform">
        <img 
          src={getPauseImage('setting')} 
          className="w-[70%] h-[70%] drop-shadow-sm" 
          alt="Settings" 
        />
      </div>
    </button>
  );
}