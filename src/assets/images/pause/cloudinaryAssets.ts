export const pauseAssets = {
    board_paused: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777615635/board_pause_dp45tj.webp',
    music : 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777616205/Group_230_tow7tb.webp',
    music_off: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1746180362/music-off_vsk10x.webp',
    exit : 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777616206/Group_228_ya7j3s.webp',
    exit_2 : 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777717463/Mask_group_zezhkx.webp',
    resume : 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777616205/resume_asmosv.webp',
    setting : 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777616206/Group_229_yltt9d.webp',
} as const;

export type PauseImageKey = keyof typeof pauseAssets;

export function getPauseImage(key: PauseImageKey): string {
    return pauseAssets[key];
}