'use client';

import {useEffect} from 'react';
import type {AppRouterInstance} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import {cleanupGame} from '@/src/features/game/services/game.service';

interface UseGameLifecycleOptions {
  topicID: string;
  gameID: string;
  roomID: string;
  gameStatus?: 'playing' | 'finished' | 'waiting' | null;
  router: AppRouterInstance;
  redirectDelayMs?: number;
}

export function useGameLifecycle({
  topicID,
  gameID,
  roomID,
  gameStatus,
  router,
  redirectDelayMs = 700,
}: UseGameLifecycleOptions): void {
  useEffect(() => {
    if (gameStatus !== 'finished') return;

    const timeoutId = setTimeout(() => {
      router.push(`/lobby/${topicID}/${gameID}`);
    }, redirectDelayMs);

    return () => clearTimeout(timeoutId);
  }, [gameID, gameStatus, redirectDelayMs, router, topicID]);

  useEffect(() => {
    return () => {
      void cleanupGame(topicID, gameID, roomID);
    };
  }, [gameID, roomID, topicID]);
}
