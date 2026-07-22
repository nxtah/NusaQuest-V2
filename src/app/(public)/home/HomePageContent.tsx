'use client';

import Link from 'next/link';
import { pulau, getAwanImage, logo } from '@/src/assets/images/home/cloudinaryAssets';
import { background } from '@/src/assets/images/background/cloudinaryAssets';
import HomeIslandLabel from '@/src/components/home/HomeIslandLabel';
import HomeSea from '@/src/components/home/HomeSea';
import IslandGameLabel from '@/src/features/home/components/IslandGameLabel';
import ProfileHudButton from '@/src/features/auth/components/ProfileHudButton';

export default function HomePageContent() {
  return (
    <div className="home-viewport">
      <div className="home-bg"></div>
      <div className="home-langit">
        <img src={background.langit} alt="Langit" className="langit-image" />
      </div>
      <div className="home-laut">
        <HomeSea />
      </div>

      <main className="home-container">
        <div className="awan-item awan-1">
          <img src={getAwanImage('awan1')} alt="Awan 1" className="awan-image" />
        </div>
        <div className="awan-item awan-2">
          <img src={getAwanImage('awan2')} alt="Awan 2" className="awan-image" />
        </div>
        <div className="awan-item awan-3">
          <img src={getAwanImage('awan2')} alt="Awan 3" className="awan-image" />
        </div>

        <div className="home-content">
          <div className="home-grid">
            <div className="island-item island-tl">
              <img src={pulau.pulau1} alt="Pulau 1" className="island-image" />
              <IslandGameLabel label="Sejarah & Legenda" className="left-[38%] top-[64%]" />
            </div>

            <div className="island-item island-center">
              <img src={pulau.mercusuar} alt="Mercusuar" className="island-image mercusuar-image" />
              <IslandGameLabel label="Pariwisata" className="left-[70%] top-[130%]" />
            </div>

            <div className="island-item island-tr">
              <img src={pulau.pulau4} alt="Pulau 4" className="island-image" />
              <IslandGameLabel label="Kuliner" className="left-[-7%] top-[63%]" />
            </div>
          </div>

          <div className="home-grid-bottom">
            <div className="island-item island-bl">
              <img src={pulau.pulau2} alt="Pulau 2" className="island-image" />
              <IslandGameLabel label="Alam & Satwa" className="left-[41%] top-[25%]" />
            </div>

            <div className="island-item island-br">
              <img src={pulau.pulau3} alt="Pulau 3" className="island-image" />
              <IslandGameLabel label="Budaya" className="left-[68%] top-[25%]" />
            </div>
          </div>
        </div>

        <div className="island-item island-br-corner">
          <img src={pulau.pulau5} alt="Pulau 5" className="island-image" />
        </div>

        <div className="kapal-wrapper">
          <img src={pulau.kapal} alt="Kapal" className="kapal-image" />
          <HomeIslandLabel label="Credit" className="!top-3 !-translate-y-[140%]" href="/credit" />
        </div>

        <Link href="/information" aria-label="Buka halaman Informasi" className="papan1-wrapper">
          <img src={pulau.papan1} alt="Papan 1" className="papan1-image" />
          <span className="papan1-text">Informasi</span>
        </Link>
      </main>

      {/* ── Fixed HUD chrome: pinned to the real viewport, never scaled/cropped
          by the cover-fit scene stage above. The boat+Credit stays inside
          the scaled scene (not here) so it keeps matching the size of the
          other boats baked into the island artwork, and stays positioned
          correctly relative to Pariwisata Bahari. ── */}
      <div className="home-hud-logo">
        <img src={logo.nusaquest} alt="Nusaquest Logo" className="logo-image" />
      </div>

      <div className="home-hud-brand">
        <a href="https://upj.ac.id/" target="_blank" rel="noopener noreferrer" aria-label="Buka website UPJ" className="block transition-transform duration-200 hover:scale-105">
          <img src="/icons/upj-logo.svg" alt="Logo UPJ" className="h-[clamp(2.6rem,3vw,3.6rem)] w-auto rounded-full bg-white/85 p-1" />
        </a>
        <a href="https://sif.upj.ac.id/" target="_blank" rel="noopener noreferrer" aria-label="Buka website SIF" className="block transition-transform duration-200 hover:scale-105">
          <img src="/icons/sif-logo.svg" alt="Logo SIF" className="h-[clamp(2.6rem,3vw,3.6rem)] w-auto rounded-full bg-white/85 p-1" />
        </a>
      </div>

      <ProfileHudButton />
    </div>
  );
}
