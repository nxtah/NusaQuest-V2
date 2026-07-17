import {firebaseFirestore} from '@/src/lib/firebase/client';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
} from 'firebase/firestore';
import type {Topic, Destination} from '@/src/features/destination/types';

const TOPICS_COLLECTION = 'topics';
const DESTINATIONS_COLLECTION = 'destinations';

function requireFirestore() {
  if (!firebaseFirestore) throw new Error('Firestore not configured');
  return firebaseFirestore;
}

export function subscribeToDestinations(
  callback: (destinations: Record<string, Destination>) => void,
): () => void {
  const q = query(collection(requireFirestore(), DESTINATIONS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const data: Record<string, Destination> = {};
    snapshot.docs.forEach((docSnap) => {
      data[docSnap.id] = {id: docSnap.id, ...docSnap.data()} as Destination;
    });
    callback(data);
  });
}

export function subscribeToTopics(
  callback: (topics: Record<string, Topic>) => void,
): () => void {
  const q = query(collection(requireFirestore(), TOPICS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const data: Record<string, Topic> = {};
    snapshot.docs.forEach((docSnap) => {
      data[docSnap.id] = {id: docSnap.id, ...docSnap.data()} as Topic;
    });
    callback(data);
  });
}

export function subscribeToDestinationById(
  id: string,
  callback: (destination: Destination | null) => void,
): () => void {
  const ref = doc(requireFirestore(), DESTINATIONS_COLLECTION, id);
  return onSnapshot(ref, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
    } else {
      callback({id: snapshot.id, ...snapshot.data()} as Destination);
    }
  });
}

export async function getTopics(): Promise<Topic[]> {
  const q = query(collection(requireFirestore(), TOPICS_COLLECTION));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  } as Topic));
}

export async function getDestinations(): Promise<Destination[]> {
  const q = query(collection(requireFirestore(), DESTINATIONS_COLLECTION));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  } as Destination));
}

export async function getDestinationById(id: string): Promise<Destination | null> {
  const snapshot = await getDoc(doc(requireFirestore(), DESTINATIONS_COLLECTION, id));
  if (!snapshot.exists()) return null;
  return {id: snapshot.id, ...snapshot.data()} as Destination;
}
