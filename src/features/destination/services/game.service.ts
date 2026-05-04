import {firebaseDb} from '@/src/lib/firebase/client';
import {onValue, ref} from 'firebase/database';

export interface Game {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

const GAMES_PATH = 'games';

export function subscribeToGames(
  callback: (games: Record<string, Game>) => void,
): () => void {
  if (!firebaseDb) {
    callback({});
    return () => { };
  }

  try {
    const gamesRef = ref(firebaseDb, GAMES_PATH);
    return onValue(gamesRef, (snapshot) => {
      const data = snapshot.val();
      callback(data || {});
    });
  } catch {
    callback({});
    return () => { };
  }
}
