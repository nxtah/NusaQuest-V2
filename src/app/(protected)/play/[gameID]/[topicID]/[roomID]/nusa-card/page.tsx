"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, MoreHorizontal } from "lucide-react";
import GameBackground from "../../../../../../../features/game-nuca/components/GameBackground";
import GameArea from "../../../../../../../features/game-nuca/components/GameArea";
import RotateDeviceOverlay from "../../../../../../../components/layout/RotateDeviceOverlay";
import PauseModal from "../../../../../../../components/layout/PauseModal";
import SettingButton from "../../../../../../../components/layout/SettingButton";

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const [isPaused, setIsPaused] = useState(false);

  const roomPath = useMemo(() => {
    const gameID = String(params?.gameID ?? "");
    const topicID = String(params?.topicID ?? "");
    const roomID = String(params?.roomID ?? "");
    return `/room/${gameID}/${topicID}/${roomID}`;
  }, [params]);

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <RotateDeviceOverlay />

      <div className="fixed inset-0 -z-10 bg-[#59a87d]">
        <GameBackground />
      </div>

      {/* Tombol Back */}
      <button
        onClick={() => router.push(roomPath)}
        className="absolute left-10 lg:left-7 top-7 z-50 text-white transition-transform"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-10 h-10"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </button>

      {/* Setting Button */}
      <SettingButton onClick={() => setIsPaused(true)} />

      <GameArea />

      <PauseModal isOpen={isPaused} onClose={() => setIsPaused(false)} />
    </main>
  );
}
