'use client';

import { useEffect, useState } from 'react';

import { subscribeData } from '../../services/firebase/rtdb/base.service';
import { roomPath } from '../../services/firebase/rtdb/base.service';
import type { Room } from '../../types/firebase.types';

type UseRoomSyncResult = {
  room: Room | null;
  loading: boolean;
  error: string | null;
};

export function useRoomSync(topicId: string, gameId: string, roomId: string): UseRoomSyncResult {
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!topicId || !gameId || !roomId) {
      return;
    }

    const unsubscribe = subscribeData<Room>(
      roomPath(topicId, gameId, roomId),
      (payload) => {
        setRoom(payload);
        setLoading(false);
      },
      (message) => {
        setError(message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [topicId, gameId, roomId]);

  return {
    room,
    loading,
    error,
  };
}
