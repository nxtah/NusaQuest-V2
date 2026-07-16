<<<<<<< HEAD
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { pulau, getAwanImage, logo } from '../../../assets/images/home/cloudinaryAssets'
import { background } from '../../../assets/images/background/cloudinaryAssets'
import HomeIslandLabel from '../../../components/home/HomeIslandLabel'
import GameSelectionModal from '../../../components/modals/GameSelectionModal'
import RegionSelectionModal from '../../../components/modals/RegionSelectionModal'
import { Region } from '@/src/types/firestore'

// Map island clicks to map IDs
const ISLAND_MAP: Record<string, string> = {
  pulau1: 'map_kuliner',
  pulau2: 'map_sejarah',
  pulau3: 'map_budaya',
  pulau4: 'map_wisata',
  mercusuar: 'map_pahlawan',
}
=======
import HomePageClient from './HomePageClient';
import HomePageContent from './HomePageContent';
>>>>>>> origin/Panji2

export default function HomePage() {
  const router = useRouter()
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null)
  const [showGameModal, setShowGameModal] = useState(false)
  const [showRegionModal, setShowRegionModal] = useState(false)
  const [selectedGameType, setSelectedGameType] = useState<'ular-tangga' | 'nusa-card' | null>(null)
  const [loadingLobby, setLoadingLobby] = useState(false)

  const handleIslandClick = (island: string) => {
    const mapId = ISLAND_MAP[island]
    if (!mapId) return
    setSelectedMapId(mapId)
    setShowGameModal(true)
  }

  const handleGameSelection = (gameType: 'ular-tangga' | 'nusa-card') => {
    setSelectedGameType(gameType)
    setShowGameModal(false)
    setShowRegionModal(true)
  }

  const handleRegionSelection = (region: Region) => {
    if (!selectedMapId || !selectedGameType) return

    setLoadingLobby(true)
    setShowRegionModal(false)

    // Navigate to lobby with params
    setTimeout(() => {
      router.push(
        `/lobby?mapId=${selectedMapId}&gameType=${selectedGameType}&regionId=${region.regionId}`
      )
    }, 300)
  }

  return (
<<<<<<< HEAD
    <main className="home-container">
      {/* Background */}
      <div className="home-bg"></div>

      {/* Langit - Sky Background from Top to Middle */}
      <div className="home-langit">
        <img
          src={background.langit}
          alt="Langit"
          className="langit-image"
        />
      </div>

      {/* Laut - Sea Background from Middle to Bottom */}
      <div className="home-laut">
        <img
          src={background.laut}
          alt="Laut"
          className="laut-image"
        />
      </div>

      {/* Awan 1 - Cloud Top Left */}
      <div className="awan-item awan-1">
        <img
          src={getAwanImage('awan1')}
          alt="Awan 1"
          className="awan-image"
        />
      </div>

      {/* Awan 2 - Cloud Top Right */}
      <div className="awan-item awan-2">
        <img
          src={getAwanImage('awan2')}
          alt="Awan 2"
          className="awan-image"
        />
      </div>

      {/* Awan 3 - Cloud Bottom Left */}
      <div className="awan-item awan-3">
        <img
          src={getAwanImage('awan2')}
          alt="Awan 3"
          className="awan-image"
        />
      </div>

      {/* Logo - Top Center */}
      <div className="logo-wrapper">
        <img
          src={logo.nusaquest}
          alt="Nusaquest Logo"
          className="logo-image"
        />
      </div>

      {/* Content Grid */}
      <div className="home-content">
        {/* Top Row */}
        <div className="home-grid">
          {/* Pulau 1 - Top Left - KULINER */}
          <div
            className="island-item island-tl cursor-pointer hover:scale-105 transition-transform"
            onClick={() => handleIslandClick('pulau1')}
          >
            <img
              src={pulau.pulau1}
              alt="Kuliner Tradisional"
              className="island-image"
            />
            <HomeIslandLabel label="🍜 Kuliner Tradisional" href="#" />
          </div>

          {/* Mercusuar - Center - PAHLAWAN */}
          <div
            className="island-item island-center cursor-pointer hover:scale-105 transition-transform"
            onClick={() => handleIslandClick('mercusuar')}
          >
            <img
              src={pulau.mercusuar}
              alt="Pahlawan & Tokoh Terkenal"
              className="island-image mercusuar-image"
            />
            <HomeIslandLabel label="🎖️ Pahlawan & Tokoh" className="top-[130%]" href="#" />
          </div>

          {/* Pulau 4 - Top Right - WISATA */}
          <div
            className="island-item island-tr cursor-pointer hover:scale-105 transition-transform"
            onClick={() => handleIslandClick('pulau4')}
          >
            <img
              src={pulau.pulau4}
              alt="Destinasi Wisata"
              className="island-image"
            />
            <HomeIslandLabel label="🏝️ Destinasi Wisata" href="#" />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="home-grid-bottom">
          {/* Pulau 2 - Bottom Left - SEJARAH */}
          <div
            className="island-item island-bl cursor-pointer hover:scale-105 transition-transform"
            onClick={() => handleIslandClick('pulau2')}
          >
            <img
              src={pulau.pulau2}
              alt="Sejarah"
              className="island-image"
            />
            <HomeIslandLabel label="🏛️ Sejarah" className="left-[36%]" href="#" />
          </div>

          {/* Pulau 3 - Bottom Right - BUDAYA */}
          <div
            className="island-item island-br cursor-pointer hover:scale-105 transition-transform"
            onClick={() => handleIslandClick('pulau3')}
          >
            <img
              src={pulau.pulau3}
              alt="Seni Budaya"
              className="island-image"
            />
            <HomeIslandLabel label="🎭 Seni Budaya" className="left-[70%] top-[20%]" href="#" />
          </div>
        </div>
      </div>

      {/* Pulau 5 - Bottom Right Corner */}
      <div className="island-item island-br-corner">
        <img
          src={pulau.pulau5}
          alt="Pulau 5"
          className="island-image"
        />
      </div>

      {/* Kapal - Bottom Area */}
      <div className="kapal-wrapper">
        <img
          src={pulau.kapal}
          alt="Kapal"
          className="kapal-image"
        />
        <HomeIslandLabel label="Credit" className="top-0 -translate-y-[140%]" href="/credit" />
      </div>

      {/* Papan 1 - Floating Board */}
      <Link href="/information" aria-label="Buka halaman Informasi" className="papan1-wrapper">
        <img
          src={pulau.papan1}
          alt="Papan 1"
          className="papan1-image"
        />
        <span className="papan1-text">Informasi</span>
      </Link>

      {/* Modals */}
      <GameSelectionModal
        isOpen={showGameModal}
        onSelect={handleGameSelection}
        onClose={() => setShowGameModal(false)}
      />

      <RegionSelectionModal
        isOpen={showRegionModal}
        onSelect={handleRegionSelection}
        onClose={() => setShowRegionModal(false)}
        isLoading={loadingLobby}
      />
    </main>
  )
=======
    <HomePageClient>
      <HomePageContent />
    </HomePageClient>
  );
>>>>>>> origin/Panji2
}
