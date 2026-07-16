import {firebaseDb} from '@/src/lib/firebase/client';
import {onValue, ref} from 'firebase/database';
import type {Topic, Destination} from '@/src/features/destination/types';

const DESTINATIONS_PATH = 'destination';
const TOPICS_PATH = 'topic';

export function subscribeToDestinations(
  callback: (destinations: Record<string, Destination>) => void,
): () => void {
  if (!firebaseDb) {
    callback({});
    return () => { };
  }

  try {
    const destinationsRef = ref(firebaseDb, DESTINATIONS_PATH);
    return onValue(destinationsRef, (snapshot) => {
      const data = snapshot.val();
      callback(data || {});
    });
  } catch {
    callback({});
    return () => { };
  }
}

export function subscribeToTopics(
  callback: (topics: Record<string, Topic>) => void,
): () => void {
  if (!firebaseDb) {
    callback({});
    return () => { };
  }

  try {
    const topicsRef = ref(firebaseDb, TOPICS_PATH);
    return onValue(topicsRef, (snapshot) => {
      const data = snapshot.val();
      callback(data || {});
    });
  } catch {
    callback({});
    return () => { };
  }
}

export function subscribeToDestinationById(
  id: string,
  callback: (destination: Destination | null) => void,
): () => void {
  if (!firebaseDb || !id) {
    callback(null);
    return () => { };
  }

  try {
    const destinationRef = ref(firebaseDb, `${DESTINATIONS_PATH}/${id}`);
    return onValue(destinationRef, (snapshot) => {
      const data = snapshot.val();
      callback(data || null);
    });
  } catch {
    callback(null);
    return () => { };
  }
}
