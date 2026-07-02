"use client";

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { nuca } from '../../../../../../../assets/images/nuca/cloudinaryAssets';
import GameBackground from '../../../../../../../features/game-nuca/components/GameBackground';
import RotateDeviceOverlay from '../../../../../../../components/layout/RotateDeviceOverlay';
import PauseModal from '../../../../../../../components/layout/PauseModal';
import SettingButton from '../../../../../../../components/layout/SettingButton';

export default function Page() {
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden">
      {/* Overlay untuk Rotasi Perangkat */}
      <RotateDeviceOverlay />

      {/* Background Image */}
      <div className="fixed inset-0 -z-10 bg-[#59a87d]">
        <GameBackground />
      </div>
    </main>
  )
}