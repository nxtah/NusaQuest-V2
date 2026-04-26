import type { AppResult } from '../../../utils/result';

import { getData, setData } from '../../../services/firebase/rtdb/base.service';

export type AchievementRecord = {
	key: string;
	progress: number;
	unlocked: boolean;
	updatedAt: number;
};

export function getUserAchievements(
	uid: string,
): Promise<AppResult<Record<string, AchievementRecord> | null>> {
	return getData<Record<string, AchievementRecord>>(`achievements/${uid}`);
}

export function saveUserAchievements(
	uid: string,
	payload: Record<string, AchievementRecord>,
): Promise<AppResult<Record<string, AchievementRecord>>> {
	return setData<Record<string, AchievementRecord>>(`achievements/${uid}`, payload);
}
