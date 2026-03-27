export type UserProfile = {
	uid: string;
	displayName: string;
	email: string;
	googlePhotoURL?: string;
	firebasePhotoURL?: string;
	createdAt?: number;
	updatedAt?: number;
};

export type UserInventorySummary = {
	potionCount: number;
};
