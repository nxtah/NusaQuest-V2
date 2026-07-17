'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useGameFlow } from '@/src/features/home/hooks/useGameFlow';
import { GameFlowProvider } from '@/src/features/home/context/GameFlowContext';
import { ISLAND_TO_MAP_ID } from '@/src/features/home/types';
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

  const mapId = useMemo(
    () => (gameFlow.islandLabel ? ISLAND_TO_MAP_ID[gameFlow.islandLabel] ?? null : null),
    [gameFlow.islandLabel]
  );

  const handleProvinceSelect = useCallback((regionId: string, gameType: string) => {
    gameFlow.selectProvince(regionId);
    router.push(`/lobby/${regionId}/${gameType}`);
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
        mapId={mapId}
        onSelectProvince={(regionId) => gameFlow.selectedGame && handleProvinceSelect(regionId, gameFlow.selectedGame)}
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
