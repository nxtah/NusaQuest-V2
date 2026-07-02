"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, MoreHorizontal } from "lucide-react";
import GameBackground from "../../../../../../../features/game-nuca/components/GameBackground";
import GameArea from "../../../../../../../features/game-nuca/components/GameArea";
import RotateDeviceOverlay from "../../../../../../../components/layout/RotateDeviceOverlay";
import PauseModal from "../../../../../../../components/layout/PauseModal";

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

      <button
        type="button"
        aria-label="Kembali ke room"
        onClick={() => router.push(roomPath)}
        className="absolute left-[20px] top-[20px] z-50 rounded-xl border border-white/35 bg-black/20 p-2 text-white transition hover:bg-black/35"
      >
        <ChevronLeft className="h-7 w-7 sm:h-8 sm:w-8" />
      </button>

      <button
        type="button"
        aria-label="Buka menu"
        onClick={() => setIsPaused(true)}
        className="absolute right-[20px] top-[20px] z-50 rounded-xl border border-white/35 bg-black/20 p-2 text-white transition hover:bg-black/35"
      >
        <MoreHorizontal className="h-7 w-7 sm:h-8 sm:w-8" />
      </button>

      <GameArea />

      <PauseModal isOpen={isPaused} onClose={() => setIsPaused(false)} />
    </main>
  );
}