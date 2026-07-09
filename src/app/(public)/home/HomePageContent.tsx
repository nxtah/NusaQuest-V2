'use client';

import Link from 'next/link';
import { pulau, getAwanImage, logo } from '@/src/assets/images/home/cloudinaryAssets';
import { background } from '@/src/assets/images/background/cloudinaryAssets';
import HomeIslandLabel from '@/src/components/home/HomeIslandLabel';
import IslandGameLabel from '@/src/features/home/components/IslandGameLabel';

export default function HomePageContent() {
  return (
    <main className="home-container">
      <div className="home-bg"></div>
      <div className="home-langit">
        <img src={background.langit} alt="Langit" className="langit-image" />
      </div>
      <div className="home-laut">
        <img src={background.laut} alt="Laut" className="laut-image" />
      </div>

      <div className="awan-item awan-1">
        <img src={getAwanImage('awan1')} alt="Awan 1" className="awan-image" />
      </div>
      <div className="awan-item awan-2">
        <img src={getAwanImage('awan2')} alt="Awan 2" className="awan-image" />
      </div>
      <div className="awan-item awan-3">
        <img src={getAwanImage('awan2')} alt="Awan 3" className="awan-image" />
      </div>

      <div className="logo-wrapper">
        <img src={logo.nusaquest} alt="Nusaquest Logo" className="logo-image" />
      </div>

      <div className="absolute left-3 top-3 z-[80] flex items-center gap-2 md:left-5 md:top-5 md:gap-3">
        <a href="https://upj.ac.id/" target="_blank" rel="noopener noreferrer" aria-label="Buka website UPJ" className="block transition-transform duration-200 hover:scale-105">
          <img src="/icons/upj-logo.svg" alt="Logo UPJ" className="h-9 w-auto rounded-full bg-white/85 p-1 md:h-11" />
        </a>
        <a href="https://sif.upj.ac.id/" target="_blank" rel="noopener noreferrer" aria-label="Buka website SIF" className="block transition-transform duration-200 hover:scale-105">
          <img src="/icons/sif-logo.svg" alt="Logo SIF" className="h-9 w-auto rounded-full bg-white/85 p-1 md:h-11" />
        </a>
      </div>

      {/* ── Profile ── */}
      <div className="absolute right-4 top-4 z-[80] flex items-center gap-2">
        <Link href="/profile" className="block transition-transform hover:scale-105">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-white/60 shadow-lg bg-blue-400 flex items-center justify-center text-white font-bold text-sm">
            N
          </div>
        </Link>
      </div>

      <div className="home-content">
        <div className="home-grid">
          <div className="island-item island-tl">
            <img src={pulau.pulau1} alt="Pulau 1" className="island-image" />
            <IslandGameLabel label="Pulau 1" />
          </div>

          <div className="island-item island-center">
            <img src={pulau.mercusuar} alt="Mercusuar" className="island-image mercusuar-image" />
            <IslandGameLabel label="Mercusuar" className="top-[120%]" />
          </div>

          <div className="island-item island-tr">
            <img src={pulau.pulau4} alt="Pulau 4" className="island-image" />
            <IslandGameLabel label="Pulau 4" />
          </div>
        </div>

        <div className="home-grid-bottom">
          <div className="island-item island-bl">
            <img src={pulau.pulau2} alt="Pulau 2" className="island-image" />
            <IslandGameLabel label="Pulau 2" className="left-[36%]" />
          </div>

          <div className="island-item island-br">
            <img src={pulau.pulau3} alt="Pulau 3" className="island-image" />
            <IslandGameLabel label="Pulau 3" className="left-[70%] top-[20%]" />
          </div>
        </div>
      </div>

      <div className="island-item island-br-corner">
        <img src={pulau.pulau5} alt="Pulau 5" className="island-image" />
      </div>

      <div className="kapal-wrapper">
        <img src={pulau.kapal} alt="Kapal" className="kapal-image" />
        <HomeIslandLabel label="Credit" className="!top-0 !-translate-y-[170%]" href="/credit" />
      </div>

      <Link href="/information" aria-label="Buka halaman Informasi" className="papan1-wrapper">
        <img src={pulau.papan1} alt="Papan 1" className="papan1-image" />
        <span className="papan1-text">Informasi</span>
      </Link>
    </main>
  );
}
