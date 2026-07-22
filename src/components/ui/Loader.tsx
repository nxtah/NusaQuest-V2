import Image from 'next/image';

import { loading as loadingAssets } from '@/src/assets/images/loading/cloudinaryAssets';
import styles from './Loader.module.css';

interface LoaderProps {
  message?: string;
  /** Full-bleed page takeover (default). Set false to embed within a section of an already-rendered page. */
  fullScreen?: boolean;
}

export default function Loader({ message = 'LOADING NUSAQUEST...', fullScreen = true }: LoaderProps) {
  const Wrapper = fullScreen ? 'main' : 'div';
  const cloudSize = fullScreen
    ? 'h-auto w-[38vw] max-w-[340px] min-w-[150px]'
    : 'h-auto w-24';
  const cloudLeftAnim = fullScreen ? styles.loadingCloudLeft : styles.loadingCloudLeftCompact;
  const cloudRightAnim = fullScreen ? styles.loadingCloudRight : styles.loadingCloudRightCompact;

  return (
    <Wrapper
      className={
        fullScreen
          ? 'relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-b from-[#98dcff] via-[#77c6ee] to-[#4da2d0]'
          : 'relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-b from-[#98dcff] via-[#77c6ee] to-[#4da2d0] py-8'
      }
    >
      <div className="pointer-events-none absolute inset-0 bg-black/10" />

      <div className="relative z-10 flex items-center justify-center">
        <Image
          src={loadingAssets.awan3}
          alt="Awan kiri"
          width={320}
          height={190}
          priority
          className={`${styles.loadingCloud} ${cloudLeftAnim} ${cloudSize}`}
        />
        <Image
          src={loadingAssets.awan3}
          alt="Awan kanan"
          width={320}
          height={190}
          priority
          className={`${styles.loadingCloud} ${cloudRightAnim} ${cloudSize}`}
        />
      </div>

      <p
        className={`${styles.loadingText} relative z-20 text-sm font-semibold tracking-[0.08em] text-white sm:text-base ${
          fullScreen ? 'absolute bottom-[12vh]' : ''
        }`}
      >
        {message}
      </p>
    </Wrapper>
  );
}
