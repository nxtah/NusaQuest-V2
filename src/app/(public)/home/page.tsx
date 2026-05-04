'use client';

import {useState} from 'react';
import NusaMaps from '@/src/features/destination/components/NusaMaps';
import ModalGame from '@/src/features/destination/components/ModalGame';
import Header from '@/src/components/layout/Header';
import Footer from '@/src/components/layout/Footer';

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  return (
    <main className="home-container">
      <Header />
      <NusaMaps setShowModal={setShowModal} setSelectedTopic={setSelectedTopic} />
      <ModalGame
        show={showModal}
        onHide={() => setShowModal(false)}
        selectedTopic={selectedTopic}
      />
      <Footer />
    </main>
  );
}
