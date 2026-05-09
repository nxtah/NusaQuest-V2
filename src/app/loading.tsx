import Image from 'next/image';

import { loading as loadingAssets } from '@/src/assets/images/loading/cloudinaryAssets';
import styles from './loading.module.css';

export default function Loading() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-[#98dcff] via-[#77c6ee] to-[#4da2d0]">
      <div className="pointer-events-none absolute inset-0 bg-black/10" />

      <div className="relative z-10 flex items-center justify-center">
        <Image
          src={loadingAssets.awan3}
          alt="Awan kiri"
          width={320}
          height={190}
          priority
          className={`${styles.loadingCloud} ${styles.loadingCloudLeft} h-auto w-[38vw] max-w-[340px] min-w-[150px]`}
        />
        <Image
          src={loadingAssets.awan3}
          alt="Awan kanan"
          width={320}
          height={190}
          priority
          className={`${styles.loadingCloud} ${styles.loadingCloudRight} h-auto w-[38vw] max-w-[340px] min-w-[150px]`}
        />
      </div>

      <p
        className={`${styles.loadingText} absolute bottom-[12vh] z-20 text-sm font-semibold tracking-[0.08em] text-white sm:text-base`}
      >
        LOADING NUSAQUEST...
      </p>
    </main>
  );
}
