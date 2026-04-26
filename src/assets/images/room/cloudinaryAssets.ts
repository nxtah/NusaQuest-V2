export const room = {
	room1: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774505898/room-1_iepqgt.webp',
	room2: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774505898/room-2_i9dhvs.webp',
	room3: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774505899/room-3_wlshml.webp',
	room4: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774505898/room-4_qt9ycm.webp',
	roomAi: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774505898/room-ai_zgiera.webp',
} as const;

export type RoomImageKey = keyof typeof room;

export function getRoomImage(key: RoomImageKey): string {
	return room[key];
}
