'use client';

import {useMemo} from 'react';
import CardInformation from '@/src/features/destination/components/CardInformation';
import type {Topic, Destination} from '@/src/features/destination/types';

interface InformationContentProps {
  destinations: Record<string, Destination>;
  topics: Record<string, Topic>;
  loading: boolean;
  activeTab: string;
  onTabSelect: (tabKey: string) => void;
}

export default function InformationContent({
  destinations,
  topics,
  loading,
  activeTab,
  onTabSelect,
}: InformationContentProps) {
  const groupedDestinations = useMemo(() => {
    const grouped: Record<string, Record<string, Destination[]>> = {};

    Object.entries(destinations).forEach(([, destination]) => {
      const {topic, type = 'General'} = destination;

      if (!grouped[topic]) {
        grouped[topic] = {};
      }

      if (!grouped[topic][type]) {
        grouped[topic][type] = [];
      }

      grouped[topic][type].push(destination);
    });

    return grouped;
  }, [destinations]);

  if (loading) {
    return <div className="text-center py-5">Loading information...</div>;
  }

  const topicKeys = Object.keys(topics);
  if (topicKeys.length === 0) {
    return <div className="text-center py-5">No topics available</div>;
  }

  const currentGrouped = groupedDestinations[activeTab] || {};
  const hasDestinations = Object.keys(currentGrouped).length > 0;

  return (
    <div className="information-content container py-5">
      <div className="tabs-container mb-4">
        <div className="d-flex gap-2 mb-3 flex-wrap">
          {topicKeys.map((topicKey) => (
            <button
              key={topicKey}
              className={`tab-btn ${activeTab === topicKey ? 'active' : ''}`}
              onClick={() => onTabSelect(topicKey)}
            >
              {topics[topicKey]?.name || topicKey}
            </button>
          ))}
        </div>
      </div>

      <div className="tab-content">
        {hasDestinations ? (
          Object.entries(currentGrouped).map(([typeKey, dests]) => (
            <div key={typeKey} className="mb-5">
              <h4 className="mb-3">{typeKey}</h4>
              <CardInformation destinations={dests} />
            </div>
          ))
        ) : (
          <div className="text-center py-5">No destinations found for this topic</div>
        )}
      </div>
    </div>
  );
}
