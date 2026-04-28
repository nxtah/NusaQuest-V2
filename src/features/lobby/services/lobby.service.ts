import {firebaseDb} from '@/src/lib/firebase/client';
import {ref, onValue, get, set, remove, push, update} from 'firebase/database';

export interface LobbyData {
  id: string;
  name: string;
  image?: string;
  instructions: string[];
}

const LOBBIES_PATH = 'lobbies';
const ROOMS_PATH = 'rooms';

export function subscribeLobbyData(
  gameID: string,
  callback: (data: LobbyData | null) => void,
): () => void {
  if (!firebaseDb) {
    callback(null);
    return () => { };
  }

  try {
    const lobbyRef = ref(firebaseDb, `${LOBBIES_PATH}/${gameID}`);
    return onValue(lobbyRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({id: gameID, ...snapshot.val()});
      } else {
        callback(null);
      }
    });
  } catch {
    callback(null);
    return () => { };
  }
}

export function subscribeRooms(
  topicID: string,
  gameID: string,
  callback: (rooms: Record<string, any>) => void,
): () => void {
  if (!firebaseDb) {
    callback({});
    return () => { };
  }

  try {
    const roomsRef = ref(firebaseDb, `${ROOMS_PATH}/${topicID}/${gameID}`);
    return onValue(roomsRef, (snapshot) => {
      callback(snapshot.val() || {});
    });
  } catch {
    callback({});
    return () => { };
  }
}

export async function checkRoomType(
  topicID: string,
  gameID: string,
  roomID: string,
): Promise<{exists: boolean; isSinglePlayer: boolean}> {
  if (!firebaseDb) return {exists: false, isSinglePlayer: false};

  try {
    const roomRef = ref(firebaseDb, `${ROOMS_PATH}/${topicID}/${gameID}/${roomID}`);
    const snapshot = await get(roomRef);
    return {
      exists: snapshot.exists(),
      isSinglePlayer: snapshot.val()?.isSinglePlayer || false,
    };
  } catch {
    return {exists: false, isSinglePlayer: false};
  }
}

export async function getCurrentPlayers(
  topicID: string,
  gameID: string,
  roomID: string,
): Promise<any[]> {
  if (!firebaseDb) return [];

  try {
    const playersRef = ref(firebaseDb, `${ROOMS_PATH}/${topicID}/${gameID}/${roomID}/players`);
    const snapshot = await get(playersRef);
    if (snapshot.exists()) {
      return Object.values(snapshot.val());
    }
    return [];
  } catch {
    return [];
  }
}

export async function playerJoinRoom(
  topicID: string,
  gameID: string,
  roomID: string,
  userId: string,
  userName: string,
  userPhoto?: string,
): Promise<void> {
  if (!firebaseDb || roomID === 'room5') return;

  try {
    const roomPath = `${ROOMS_PATH}/${topicID}/${gameID}/${roomID}`;
    const roomRef = ref(firebaseDb, roomPath);
    const roomSnapshot = await get(roomRef);

    if (!roomSnapshot.exists()) throw new Error('Room tidak ada');

    const roomData = roomSnapshot.val();
    if (roomData.isSinglePlayer) return;

    const playersRef = ref(firebaseDb, `${roomPath}/players`);
    const playersSnapshot = await get(playersRef);
    const playersData = playersSnapshot.val() || {};

    const playerCount = Object.keys(playersData).length;
    const capacity = roomData.capacity || 4;

    if (playerCount >= capacity) throw new Error('Room penuh');

    // Find available player slot
    let playerKey = null;
    for (let i = 1; i <= capacity; i++) {
      const key = `player-${i}`;
      if (!playersData[key]) {
        playerKey = key;
        break;
      }
    }

    if (!playerKey) throw new Error('Tidak ada slot pemain yang tersedia');

    // Join room
    await set(ref(firebaseDb, `${roomPath}/players/${playerKey}`), {
      uid: userId,
      name: userName,
      photoURL: userPhoto,
      joinedAt: new Date().toISOString(),
    });

    // Update current players count
    await update(ref(firebaseDb, roomPath), {
      currentPlayers: playerCount + 1,
    });
  } catch (error) {
    console.error('Error joining room:', error);
    throw error;
  }
}

export async function playerLeaveRoom(
  topicID: string,
  gameID: string,
  roomID: string,
  userId: string,
): Promise<void> {
  if (!firebaseDb || roomID === 'room5') return;

  try {
    const roomPath = `${ROOMS_PATH}/${topicID}/${gameID}/${roomID}`;
    const playersRef = ref(firebaseDb, `${roomPath}/players`);
    const playersSnapshot = await get(playersRef);

    if (playersSnapshot.exists()) {
      const playersData = playersSnapshot.val();
      const playerKey = Object.keys(playersData).find(
        (key) => playersData[key].uid === userId,
      );

      if (playerKey) {
        await remove(ref(firebaseDb, `${roomPath}/players/${playerKey}`));

        const remainingPlayers = Object.keys(playersData).length - 1;
        await update(ref(firebaseDb, roomPath), {
          currentPlayers: Math.max(0, remainingPlayers),
        });
      }
    }
  } catch (error) {
    console.error('Error leaving room:', error);
  }
}

export function subscribeToGameStart(
  topicID: string,
  gameID: string,
  roomID: string,
  callback: (gameStarted: boolean) => void,
): () => void {
  if (!firebaseDb) {
    callback(false);
    return () => { };
  }

  try {
    const gameStatusRef = ref(
      firebaseDb,
      `${ROOMS_PATH}/${topicID}/${gameID}/${roomID}/gameStatus`,
    );
    return onValue(gameStatusRef, (snapshot) => {
      callback(snapshot.val() === 'playing');
    });
  } catch {
    callback(false);
    return () => { };
  }
}
