import {firebaseDb} from '@/src/lib/firebase/client';
import {ref, onValue, get, runTransaction, set, remove, push, update} from 'firebase/database';

export interface LobbyData {
  id: string;
  name: string;
  image?: string;
  instructions: string[];
}

export interface RoomPlayer {
  uid: string;
  name: string;
  photoURL?: string;
  joinedAt: string;
}

export interface RoomData {
  isSinglePlayer?: boolean;
  capacity?: number;
  currentPlayers?: number;
  gameStatus?: 'waiting' | 'playing' | 'finished';
  gameState?: Record<string, unknown> | null;
  players?: Record<string, RoomPlayer>;
  startedAt?: string;
  lastResetAt?: string;
}

const LOBBIES_PATH = 'lobbies';
const ROOMS_PATH = 'rooms';

export async function startGameInRoom(
  topicID: string,
  gameID: string,
  roomID: string,
): Promise<void> {
  if (!firebaseDb) return;

  try {
    const roomRef = ref(firebaseDb, `${ROOMS_PATH}/${topicID}/${gameID}/${roomID}`);
    await update(roomRef, {
      gameStatus: 'playing',
      startedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error starting game in room:', error);
    throw error;
  }
}

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
  callback: (rooms: Record<string, RoomData>) => void,
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
): Promise<RoomPlayer[]> {
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

    const roomData = roomSnapshot.val() as RoomData;
    if (roomData.isSinglePlayer) return;

    const transactionResult = await runTransaction(roomRef, (currentRoomData: RoomData | null) => {
      if (!currentRoomData) return currentRoomData;

      const currentPlayersData = currentRoomData.players || {};
      
      // 1. Ghost Room Check (Auto-Destroy Dead Rooms)
      // Jika game sedang berjalan, periksa apakah masih ada manusia yang benar-benar aktif
      if (currentRoomData.gameStatus === 'playing' || (currentRoomData as any).gameStarted) {
        let hasOnline = false;
        const activities: Record<string, any> = currentRoomData.gameState?.playerActivity || {};
        const playerUids = Object.keys(currentPlayersData).map(k => currentPlayersData[k].uid);
        
        for (const uid of playerUids) {
            const act = activities[uid];
            // Jika ada satu saja pemain yang masih aktif dan ping terakhir < 60 detik
            if (act && act.isActive && (Date.now() - act.lastActivity <= 60000)) {
               hasOnline = true;
               break;
            }
        }

        // Jika room kosong atau semua pemain di dalamnya berstatus Offline/Bot, hancurkan game!
        if (playerUids.length === 0 || !hasOnline) {
           currentRoomData.gameStatus = 'waiting';
           (currentRoomData as any).gameStarted = false;
           currentRoomData.gameState = null;
           delete currentRoomData.players;
           currentRoomData.currentPlayers = 0;
           // Hapus isi object agar logic di bawah menganggap room kosong
           for (const key of Object.keys(currentPlayersData)) {
               delete currentPlayersData[key];
           }
        }
      }

      // 2. Check if user is already in the room
      let alreadyJoined = false;
      for (const key of Object.keys(currentPlayersData)) {
        if (currentPlayersData[key].uid === userId) {
          alreadyJoined = true;
          break;
        }
      }
      if (alreadyJoined) return currentRoomData; // Skip adding again

      // 3. Prevent joining if game has already started (and wasn't destroyed above)
      if (currentRoomData.gameStatus === 'playing' || (currentRoomData as any).gameStarted) {
         // Abort transaction to throw error below
         return; 
      }

      const capacity = currentRoomData.capacity || 4;

      if (Object.keys(currentPlayersData).length >= capacity) {
        return currentRoomData;
      }

      let playerKey: string | null = null;
      for (let i = 1; i <= capacity; i++) {
        const nextKey = `player-${i}`;
        if (!currentPlayersData[nextKey]) {
          playerKey = nextKey;
          break;
        }
      }

      if (!playerKey) {
        return currentRoomData;
      }

      currentPlayersData[playerKey] = {
        uid: userId,
        name: userName,
        photoURL: userPhoto,
        joinedAt: new Date().toISOString(),
      };

      return {
        ...currentRoomData,
        players: currentPlayersData,
        currentPlayers: Object.keys(currentPlayersData).length,
      };
    });

    if (!transactionResult.committed) {
      // If aborted because game started (returned undefined), roomData hasn't changed.
      // So we can check the original snapshot or fetch a new one to be sure.
      const freshSnap = await get(roomRef);
      if (freshSnap.exists()) {
        const freshData = freshSnap.val();
        if (freshData.gameStatus === 'playing' || freshData.gameStarted) {
          throw new Error('Permainan sedang berlangsung');
        }
      }
      throw new Error('Room penuh');
    }
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
      const playersData = playersSnapshot.val() as Record<string, RoomPlayer>;
      const playerKey = Object.keys(playersData).find(
        (key) => playersData[key].uid === userId,
      );

      if (playerKey) {
        await remove(ref(firebaseDb, `${roomPath}/players/${playerKey}`));

        const remainingPlayers = Object.keys(playersData).length - 1;
        const roomUpdates: Partial<RoomData> = {
          currentPlayers: Math.max(0, remainingPlayers),
        };

        if (remainingPlayers <= 0) {
          roomUpdates.gameStatus = 'waiting';
          roomUpdates.gameState = null;
          (roomUpdates as any).gameStarted = false; // Reset gameStarted for V2
        }

        await update(ref(firebaseDb, roomPath), roomUpdates);
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
