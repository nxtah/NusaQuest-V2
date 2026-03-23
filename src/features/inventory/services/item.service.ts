import type { AppResult } from '../../../utils/result';

import { getData, setData } from '../../../services/firebase/rtdb/base.service';

export type InventoryItem = {
	item_name: string;
	item_count: number;
	item_img: string;
};

export function getUserItems(uid: string): Promise<AppResult<Record<string, InventoryItem> | null>> {
	return getData<Record<string, InventoryItem>>(`items/${uid}`);
}

export function saveUserItems(
	uid: string,
	payload: Record<string, InventoryItem>,
): Promise<AppResult<Record<string, InventoryItem>>> {
	return setData<Record<string, InventoryItem>>(`items/${uid}`, payload);
}
