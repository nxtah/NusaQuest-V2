'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGameFlow } from '@/src/features/home/hooks/useGameFlow';
import { GameFlowProvider } from '@/src/features/home/context/GameFlowContext';
import { ISLAND_TO_MAP_ID } from '@/src/features/home/types';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { ROUTES } from '@/src/lib/constants/routes';
import GameSelectionModal from '../../../components/home/GameSelectionModal';
import ProvinceSelectionModal from '../../../components/home/ProvinceSelectionModal';
import WelcomeIntroModal from '@/src/features/home/components/WelcomeIntroModal';

interface HomePageClientProps {
  children: React.ReactNode;
}

// Guest (belum login) gak punya dokumen Firestore buat nyimpen "udah liat
// belum" — dipakein localStorage buat kasus itu doang. Akun beneran (login)
// tetap sumber kebenarannya `AppUser.hasSeenIntro` di Firestore.
const SEEN_INTRO_LOCAL_KEY = 'nq_seen_intro';

function HomePageClientContent({
  children,
  gameFlow
}: HomePageClientProps & { gameFlow: ReturnType<typeof useGameFlow> }) {
  const router = useRouter();
  const { user, isLoggedIn, isInitialized, markIntroSeen } = useAuth();

  // Popup perkenalan muncul buat: (1) pengunjung yang BELUM login sama
  // sekali (localStorage, karena belum ada akun buat nyimpen flag-nya), dan
  // (2) akun yang BENERAN baru pertama kali login (`hasSeenIntro === false`
  // di Firestore, di-backfill `true` buat akun lama). Kalau orangnya udah
  // liat & tutup popup ini SEBAGAI GUEST terus baru login, gak dinongolin
  // dobel — status guest-nya disinkronin diem-diem ke Firestore.
  const [showIntro, setShowIntro] = useState(false);
  useEffect(() => {
    if (!isInitialized) return;
    const seenAsGuest = typeof window !== 'undefined' && window.localStorage.getItem(SEEN_INTRO_LOCAL_KEY) === '1';

    if (isLoggedIn) {
      if (user?.hasSeenIntro === false) {
        if (seenAsGuest) {
          void markIntroSeen();
        } else {
          setShowIntro(true);
        }
      }
    } else if (!seenAsGuest) {
      setShowIntro(true);
    }
  }, [isInitialized, isLoggedIn, user, markIntroSeen]);

  const handleCloseIntro = useCallback(() => {
    setShowIntro(false);
    if (typeof window !== 'undefined') window.localStorage.setItem(SEEN_INTRO_LOCAL_KEY, '1');
    if (isLoggedIn) void markIntroSeen();
  }, [isLoggedIn, markIntroSeen]);

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

      <WelcomeIntroModal isOpen={showIntro} onClose={handleCloseIntro} />

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
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  // Klik pulau (mulai alur pilih game -> pilih provinsi -> main) butuh
  // login duluan. Informasi/Profile/Credit sengaja gak lewat sini — itu
  // link terpisah di HomePageContent, tetap bisa diakses tanpa login.
  const handleIslandClick = useCallback((islandLabel: string) => {
    if (!isLoggedIn) {
      router.push(ROUTES.public.login);
      return;
    }
    gameFlow.openGameModal(islandLabel);
  }, [isLoggedIn, router, gameFlow]);

  return (
    <GameFlowProvider onIslandClick={handleIslandClick}>
      <HomePageClientContent gameFlow={gameFlow}>{children}</HomePageClientContent>
    </GameFlowProvider>
  );
}
