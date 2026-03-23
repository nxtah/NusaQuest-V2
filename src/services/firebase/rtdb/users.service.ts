import type { UserProfile } from '../../../types/firebase.types';
import type { AppResult } from '../../../utils/result';

import { getData, removeData, setData, updateData, userPath } from './base.service';

export function getUserById(uid: string): Promise<AppResult<UserProfile | null>> {
  return getData<UserProfile>(userPath(uid));
}

export function saveUserProfile(profile: UserProfile): Promise<AppResult<UserProfile>> {
  return setData<UserProfile>(userPath(profile.uid), profile);
}

export function updateUserProfile(
  uid: string,
  payload: Partial<UserProfile>,
): Promise<AppResult<Partial<UserProfile>>> {
  return updateData<Partial<UserProfile>>(userPath(uid), {
    ...payload,
    updatedAt: Date.now(),
  });
}

export function deleteUserProfile(uid: string): Promise<AppResult<null>> {
  return removeData(userPath(uid));
}
