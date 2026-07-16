'use client';

import {useRouter} from 'next/navigation';
import type {Destination} from '@/src/features/destination/types';

interface CardInformationProps {
  destinations: Destination[];
}

export default function CardInformation({destinations}: CardInformationProps) {
  const router = useRouter();

  if (destinations.length === 0) {
    return <div className="text-center py-3">No destinations found</div>;
  }

  return (
    <div className="card-information-grid">
      {destinations.map((destination) => (
        <div
          key={destination.id}
          className="destination-card cursor-pointer"
          onClick={() => router.push(`/destination/${destination.id}`)}
        >
          {destination.image && (
            <img src={destination.image} alt={destination.name} className="card-image" />
          )}
          <div className="card-body">
            <h5>{destination.name}</h5>
            <p>{destination.description?.substring(0, 100)}...</p>
            <small className="text-primary">See Details →</small>
          </div>
        </div>
      ))}
    </div>
  );
}
