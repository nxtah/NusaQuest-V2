'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useGameFlow } from '../../../features/home/hooks/useGameFlow';
import { GameFlowProvider } from '../../../features/home/context/GameFlowContext';
import GameSelectionModal from '../../../components/home/GameSelectionModal';
import ProvinceSelectionModal from '../../../components/home/ProvinceSelectionModal';

interface HomePageClientProps {
  children: React.ReactNode;
}

function HomePageClientContent({ 
  children, 
  gameFlow 
}: HomePageClientProps & { gameFlow: ReturnType<typeof useGameFlow> }) {
  const router = useRouter();

  const handleProvinceSelect = useCallback((provinceId: number) => {
    gameFlow.selectProvince(provinceId);
    
    // Navigate ke lobby dengan topic (province) id dan game type
    const gameType = gameFlow.selectedGame;
    router.push(`/lobby/${provinceId}/${gameType}`);
  }, [gameFlow, router]);

  return (
    <>
      {/* Render home page dengan ability to pass click handlers via context */}
      {children}

      {/* Modals */}
      <GameSelectionModal
        isOpen={gameFlow.isGameModalOpen}
        islandLabel={gameFlow.islandLabel}
        onSelectGame={gameFlow.selectGame}
        onClose={gameFlow.closeGameModal}
      />

      <ProvinceSelectionModal
        isOpen={gameFlow.isProvinceModalOpen}
        selectedGame={gameFlow.selectedGame}
        onSelectProvince={handleProvinceSelect}
        onClose={gameFlow.closeProvinceModal}
      />
    </>
  );
}

export default function HomePageClient({ children }: HomePageClientProps) {
  const gameFlow = useGameFlow();

  return (
    <GameFlowProvider onIslandClick={gameFlow.openGameModal}>
      <HomePageClientContent gameFlow={gameFlow}>{children}</HomePageClientContent>
    </GameFlowProvider>
  );
}
