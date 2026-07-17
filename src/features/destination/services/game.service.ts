import { collection, getDocs, query, onSnapshot } from 'firebase/firestore';
import { firebaseFirestore } from '@/src/lib/firebase/client';

export interface Game {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

const MAPS_COLLECTION = 'maps';

function requireFirestore() {
  if (!firebaseFirestore) throw new Error('Firestore not configured');
  return firebaseFirestore;
}

export async function getGames(): Promise<Record<string, Game>> {
  const col = collection(requireFirestore(), MAPS_COLLECTION);
  const snapshot = await getDocs(query(col));
  const games: Record<string, Game> = {};
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    games[docSnap.id] = {
      id: docSnap.id,
      name: data.name || data.map_name || docSnap.id,
      description: data.description,
      image: data.image,
    };
  });
  return games;
}

export function subscribeToGames(
  callback: (games: Record<string, Game>) => void,
): () => void {
  const col = collection(requireFirestore(), MAPS_COLLECTION);
  return onSnapshot(query(col), (snapshot) => {
    const games: Record<string, Game> = {};
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      games[docSnap.id] = {
        id: docSnap.id,
        name: data.name || data.map_name || docSnap.id,
        description: data.description,
        image: data.image,
      };
    });
    callback(games);
  });
}
