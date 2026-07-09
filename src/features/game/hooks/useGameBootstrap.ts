'use client';

import {useEffect, useRef, useState} from 'react';
import type {AppRouterInstance} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type {AppUser} from '@/src/types/auth';
import type {GamePlayer} from '@/src/features/game/services/game.service';

interface UseGameBootstrapOptions {
  isInitialized: boolean;
  user: AppUser | null;
  router: AppRouterInstance;
  lobbyPath: string;
  errorMessage: string;
  bootstrap: (user: AppUser) => Promise<GamePlayer[]>;
  onBootstrapped?: (players: GamePlayer[]) => void;
}

interface UseGameBootstrapResult {
  players: GamePlayer[];
  loading: boolean;
  gameError: string | null;
}

export function useGameBootstrap({
  isInitialized,
  user,
  router,
  lobbyPath,
  errorMessage,
  bootstrap,
  onBootstrapped,
}: UseGameBootstrapOptions): UseGameBootstrapResult {
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameError, setGameError] = useState<string | null>(null);
  const bootstrapRef = useRef(bootstrap);
  const onBootstrappedRef = useRef(onBootstrapped);

  useEffect(() => {
    bootstrapRef.current = bootstrap;
    onBootstrappedRef.current = onBootstrapped;
  }, [bootstrap, onBootstrapped]);

  useEffect(() => {
    if (!isInitialized) return;

    let isActive = true;

    const initGame = async () => {
      try {
        if (!user?.uid) {
          router.push('/home');
          return;
        }

        const nextPlayers = await bootstrapRef.current(user);

        if (!isActive) return;

        setPlayers(nextPlayers);
        onBootstrappedRef.current?.(nextPlayers);
      } catch (error) {
        console.error('Error initializing game bootstrap:', error);
        if (isActive) {
          setGameError(errorMessage);
        }
        router.push(lobbyPath);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    initGame();

    return () => {
      isActive = false;
    };
  }, [errorMessage, isInitialized, lobbyPath, router, user?.uid]);

  return {players, loading, gameError};
}