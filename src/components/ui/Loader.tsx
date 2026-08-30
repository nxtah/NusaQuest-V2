import Image from 'next/image';

import { loading as loadingAssets } from '@/src/assets/images/loading/cloudinaryAssets';
import { pulau as homeAssets } from '@/src/assets/images/home/cloudinaryAssets';
import { background } from '@/src/assets/images/background/cloudinaryAssets';
import styles from './Loader.module.css';

interface LoaderProps {
  message?: string;
  /** Full-bleed page takeover (default). Set false to embed within a section of an already-rendered page. */
  fullScreen?: boolean;
}

export default function Loader({ message = 'LOADING NUSAQUEST...', fullScreen = true }: LoaderProps) {
  const Wrapper = fullScreen ? 'main' : 'div';

  // Mode fullScreen: cuma awan (gak ada bg biru lagi) nongol gede dari
  // pojok kiri-atas & kanan-bawah, teks di tengah. Mode compact (dipakai 1
  // tempat, kartu kecil ter-embed) tetap kayak sebelumnya — beda konteks
  // visual, gak diminta diubah.
  if (!fullScreen) {
    return (
      <div className="relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-b from-[#98dcff] via-[#77c6ee] to-[#4da2d0] py-8">
        <div className="pointer-events-none absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex items-center justify-center">
          <Image
            src={loadingAssets.awan3}
            alt="Awan kiri"
            width={320}
            height={190}
            priority
            className={`${styles.loadingCloud} ${styles.loadingCloudLeftCompact} h-auto w-24`}
          />
          <Image
            src={loadingAssets.awan3}
            alt="Awan kanan"
            width={320}
            height={190}
            priority
            className={`${styles.loadingCloud} ${styles.loadingCloudRightCompact} h-auto w-24`}
          />
        </div>
        <p className={`${styles.loadingText} relative z-20 text-sm font-semibold tracking-[0.08em] text-white sm:text-base`}>
          {message}
        </p>
      </div>
    );
  }

  return (
    <Wrapper className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      <Image
        src={background.langit}
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="pointer-events-none absolute inset-0 z-0 object-cover"
      />
      <Image
        src={loadingAssets.awan3}
        alt=""
        aria-hidden="true"
        width={320}
        height={190}
        priority
        className={`${styles.loadingCloud} ${styles.loadingCloudTopLeft} pointer-events-none absolute -top-[8%] -left-[12%] z-10 h-auto w-[80vw] max-w-[1080px] min-w-[320px]`}
      />
      <Image
        src={loadingAssets.awan3}
        alt=""
        aria-hidden="true"
        width={320}
        height={190}
        priority
        className={`${styles.loadingCloud} ${styles.loadingCloudBottomRight} pointer-events-none absolute -bottom-[8%] -right-[12%] z-10 h-auto w-[80vw] max-w-[1080px] min-w-[320px]`}
      />

      {/* Signature: kapal mengapung di tengah — "lagi berlayar ke pulau
          berikutnya", bukan spinner generik, sekalian nyambungin ke motif
          eksplorasi kepulauan yang udah dipakai di seluruh app ini. */}
      <div className="relative z-20 flex flex-col items-center gap-4">
        <div className="flex flex-col items-center">
          <Image
            src={homeAssets.kapal}
            alt=""
            aria-hidden="true"
            width={520}
            height={342}
            priority
            className={`${styles.loadingBoat} h-auto w-28 drop-shadow-[0_10px_14px_rgba(0,0,0,0.25)] sm:w-36`}
          />
          <div className={`${styles.loadingBoatShadow} -mt-1 h-2.5 w-16 rounded-full bg-black/40 blur-[3px] sm:w-20`} />
        </div>

        <div className={`${styles.loadingSign} ${styles.loadingSignInner} rounded-full px-6 py-2 sm:px-8 sm:py-2.5`}>
          <p className={`${styles.loadingText} whitespace-nowrap text-sm font-bold tracking-[0.08em] text-[#4a2a1a] sm:text-base`}>
            {message}
          </p>
        </div>
      </div>
    </Wrapper>
  );
}
