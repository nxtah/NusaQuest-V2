'use client'; 

import { useState } from "react";
import GameBackground from "../../../../../../../features/game-ular-tangga/components/GameBackground";
import Board from "../../../../../../../features/game-ular-tangga/components/Board";
import PauseModal from "../../../../../../../features/game-ular-tangga/components/PauseModal";
import SettingButton from "../../../../../../../features/game-ular-tangga/components/SettingButton";

export default function Page() {
    const [isPaused, setIsPaused] = useState(false);
    return (
        <main className="relative min-h-screen w-full overflow-x-hidden">
            {/* Background Image */}
            <div className="fixed inset-0 -z-10 bg-[#59a87d]">
                <GameBackground />
            </div>
        
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
                <div className="absolute top-0 left-20 w-1/2 h-full flex items-center justify-center p-8 z-20">
                    <div className="w-full aspect-square">
                        <Board />
                    </div>
                </div>
            </div>

            {/* Setting Button */}
            <SettingButton onClick={() => setIsPaused(true)} />
        
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
                <div className="absolute top-0 left-20 w-1/2 h-full flex items-center justify-center p-8 z-20">
                    <div className="w-full aspect-square">
                        <Board />
                    </div>
                </div>
            </div>

            <PauseModal 
                isOpen={isPaused}               
                onClose={() => setIsPaused(false)} 
            />
        </main>
    );
}
