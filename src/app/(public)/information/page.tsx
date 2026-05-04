'use client';

import {useEffect, useState} from 'react';
import Header from '@/src/components/layout/Header';
import Footer from '@/src/components/layout/Footer';
import InformationContent from '@/src/features/destination/components/InformationContent';
import type {Topic, Destination} from '@/src/features/destination/types';
import {subscribeToDestinations, subscribeToTopics} from '@/src/features/destination/services/destination.service';
import {getLocalStorageItem, setLocalStorageItem} from '@/src/lib/utils/local-storage';

export default function InformationPage() {
  const [destinations, setDestinations] = useState<Record<string, Destination>>({});
  const [topics, setTopics] = useState<Record<string, Topic>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(
    getLocalStorageItem('lastActiveTab', 'daerah_jawa_barat'),
  );

  useEffect(() => {
    setLoading(true);
    const unsubTopics = subscribeToTopics((fetchedTopics) => {
      setTopics(fetchedTopics);
      setLoading(false);
    });

    const unsubDestinations = subscribeToDestinations((fetchedDestinations) => {
      setDestinations(fetchedDestinations);
    });

    return () => {
      unsubTopics();
      unsubDestinations();
    };
  }, []);

  const handleTabSelect = (tabKey: string) => {
    setActiveTab(tabKey);
    setLocalStorageItem('lastActiveTab', tabKey);
  };

  return (
    <main className="information-container">
      <Header showBackIcon />
      <InformationContent
        destinations={destinations}
        topics={topics}
        loading={loading}
        activeTab={activeTab}
        onTabSelect={handleTabSelect}
      />
      <Footer />
    </main>
  );
}
