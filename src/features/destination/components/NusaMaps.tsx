'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/src/features/auth/hooks/useAuth';
import {subscribeToTopics} from '@/src/features/destination/services/destination.service';
import type {Topic} from '@/src/features/destination/types';

interface NusaMapsProps {
  setShowModal: (show: boolean) => void;
  setSelectedTopic: (topicId: string | null) => void;
}

const TOPIC_DATA = [
  {id: 'pariwisata_darat', label: 'Pariwisata Darat', icon: '🏔️'},
  {id: 'daerah_jawa_barat', label: 'Daerah Jawa Barat', icon: '🏘️'},
  {id: 'pariwisata_bahari', label: 'Pariwisata Bahari', icon: '🌊'},
  {id: 'permainan_daerah', label: 'Permainan Daerah', icon: '🎮'},
  {id: 'kuliner_jawa_barat', label: 'Kuliner Jawa Barat', icon: '🍜'},
];

export default function NusaMaps({setShowModal, setSelectedTopic}: NusaMapsProps) {
  const router = useRouter();
  const {isLoggedIn, isInitialized} = useAuth();
  const [topics, setTopics] = useState<Record<string, Topic>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToTopics((fetchedTopics) => {
      setTopics(fetchedTopics);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleTopicClick = (topicId: string | null) => {
    if (topicId === null) {
      router.push('/information');
      return;
    }

    if (!isInitialized) return;

    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    if (topics[topicId]) {
      setSelectedTopic(topicId);
      setShowModal(true);
    }
  };

  if (loading) {
    return <div className="text-center py-5">Loading maps...</div>;
  }

  return (
    <div className="nusa-maps-container py-5">
      <h2 className="text-center mb-5">Pilih Wilayah</h2>
      <div className="d-flex flex-wrap justify-content-center gap-4">
        {TOPIC_DATA.map((data) => (
          <button
            key={data.id}
            className="topic-btn"
            onClick={() => handleTopicClick(data.id)}
            disabled={!isInitialized}
          >
            <div className="topic-icon">{data.icon}</div>
            <div className="topic-label">{data.label}</div>
          </button>
        ))}
        <button
          className="topic-btn"
          onClick={() => handleTopicClick(null)}
        >
          <div className="topic-icon">ℹ️</div>
          <div className="topic-label">Informasi</div>
        </button>
      </div>
    </div>
  );
}
