'use client';

import {useEffect, useState} from 'react';
import {useParams} from 'next/navigation';
import Header from '@/src/components/layout/Header';
import Footer from '@/src/components/layout/Footer';
import type {Destination} from '@/src/features/destination/types';
import {subscribeToDestinationById} from '@/src/features/destination/services/destination.service';

export default function DestinationDetailPage() {
  const params = useParams();
  const destinationId = params.id as string;
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!destinationId) return;

    setLoading(true);
    const unsubscribe = subscribeToDestinationById(destinationId, (data) => {
      setDestination(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [destinationId]);

  if (loading) {
    return (
      <main className="destination-detail-container">
        <Header showBackIcon />
        <div className="py-5 text-center">Loading...</div>
        <Footer />
      </main>
    );
  }

  if (!destination) {
    return (
      <main className="destination-detail-container">
        <Header showBackIcon />
        <div className="py-5 text-center">Destination not found</div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="destination-detail-container">
      <Header showBackIcon />
      <div className="container py-5">
        <h1>{destination.name}</h1>
        {destination.image && <img src={destination.image} alt={destination.name} className="img-fluid my-3" />}
        <p>{destination.description}</p>
        {destination.content && <div>{destination.content}</div>}
      </div>
      <Footer />
    </main>
  );
}
