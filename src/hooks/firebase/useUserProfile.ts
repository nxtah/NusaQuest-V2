'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  getUserById,
  updateUserProfile,
} from '../../services/firebase/rtdb/users.service';
import type { UserProfile } from '../../types/firebase.types';

type UseUserProfileResult = {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  saveDisplayName: (displayName: string) => Promise<boolean>;
};

export function useUserProfile(uid: string): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const result = await getUserById(uid);
    if (result.success) {
      setProfile(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [uid]);

  const saveDisplayName = useCallback(
    async (displayName: string) => {
      if (!uid) {
        return false;
      }

      const result = await updateUserProfile(uid, { displayName });
      if (!result.success) {
        setError(result.error);
        return false;
      }

      await refreshProfile();
      return true;
    },
    [refreshProfile, uid],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void refreshProfile();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [refreshProfile]);

  return {
    profile,
    loading,
    error,
    refreshProfile,
    saveDisplayName,
  };
}
