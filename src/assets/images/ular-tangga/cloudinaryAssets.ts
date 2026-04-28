export const ularTangga = {
    kayu: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774506109/kayu_filvkl.webp',
    laut: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774363032/laut_qbcbsx.webp',
    tanaman: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1774370077/tanaman-1_byedew.webp',
    ular1: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777265845/zyhddedlh61ucz6xbtdg_bku2wi.webp',
    ular2: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777265846/udu8a4xx18pcfxqswgg5_bm7kt6.webp',
    ular3: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777265846/bj65m5iw9rfbnz6kv07m_wyykm1.webp',
    ular4: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777342995/Group_4_1_yvadcg.webp',
    ular5: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777265846/ssyye1nc7kxu04xzlwis_jjdcon.webp',
    ular6: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777342248/Group_7_1_t9bgk1.webp',
    ular7: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777265847/qrchchrx4dsnvdtkbirr_lezdyz.webp',
    ular8: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777342540/Group_3_1_yd46sh.webp',
    tangga1: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777267079/w1sp8crj2jbduwid25bg_mrbjyx.webp',
    tangga2: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777267080/c6edthiw8buqd6hntd5i_zk7gmb.webp',
    tangga3: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777267082/gyyx2cissqoogvx1pp9l_b5hzxz.webp',
    tangga4: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777267083/jtau7qbntes6djk34jws_bq2vm3.webp',
    tangga5: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777267084/r55azod4nynnfzq2du0w_lb2uci.webp',
    tangga6: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777267085/cbeuthrlbgs8ohdmq3d1_ov1guh.webp',
    tangga7: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777267086/cjd3trsi93o3rl3jkz8j_gttjla.webp',
    tangga8: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777267087/zq6b6optcztoo2ugzcwm_damjym.webp',
    pion1: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777302495/qg8aabgdr4t7hdcfzse6_w0kzyd.webp',
    pion2: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777302496/jffto9jcauke6bc5m3ex_vsyivv.webp',
    pion3: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777302495/tdfw3ulgngqsdgq94lhq_zmgmwp.webp',
    pion4: 'https://res.cloudinary.com/dprxjzfxp/image/upload/v1777302497/jaxw9e7y5mbn0ttj8xj6_lupfvy.webp',
} as const;

export type UlarTanggaImageKey = keyof typeof ularTangga;

export function getUlarTanggaImage(key: UlarTanggaImageKey): string {
	return ularTangga[key];
}
