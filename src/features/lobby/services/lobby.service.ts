import { collection, doc, getDoc, onSnapshot, query } from 'firebase/firestore';
import { firebaseFirestore } from '@/src/lib/firebase/client';
import {
  getRoomById as fsGetRoomById,
  joinRoom as fsJoinRoom,
  leaveRoom as fsLeaveRoom,
  startGame as fsStartGame,
} from '@/src/features/lobby/services/rooms.service';
import type { Room, RoomPlayer } from '@/src/types/firestore';

export type RoomData = Room;

const ROOMS_COLLECTION = 'rooms';

function requireFirestore() {
  if (!firebaseFirestore) throw new Error('Firestore not configured');
  return firebaseFirestore;
}

export interface RoomPlayerOld {
  uid: string;
  name: string;
  photoURL?: string;
  joinedAt: string;
}

export function subscribeRooms(
  topicID: string,
  gameID: string,
  callback: (rooms: Record<string, unknown>) => void,
): () => void {
  const q = query(collection(requireFirestore(), ROOMS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const rooms: Record<string, unknown> = {};
    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.mapId === topicID && data.gameType === gameID) {
        rooms[docSnap.id] = { roomId: docSnap.id, ...data };
      }
    });
    callback(rooms);
  });
}

export async function checkRoomType(
  topicID: string,
  gameID: string,
  roomID: string,
): Promise<{ exists: boolean; isSinglePlayer: boolean }> {
  const room = await fsGetRoomById(roomID);
  if (!room) return { exists: false, isSinglePlayer: false };
  return { exists: true, isSinglePlayer: room.maxPlayers === 1 };
}

export async function getCurrentPlayers(
  topicID: string,
  gameID: string,
  roomID: string,
): Promise<RoomPlayerOld[]> {
  const room = await fsGetRoomById(roomID);
  if (!room) return [];
  return Object.entries(room.players || {}).map(([key, player]: [string, RoomPlayer]) => ({
    uid: key,
    name: player.name || '',
    photoURL: player.photoURL,
    joinedAt: new Date(player.joinedAt).toISOString(),
  }));
}

export async function playerJoinRoom(
  topicID: string,
  gameID: string,
  roomID: string,
  userId: string,
  userName: string,
  userPhoto?: string | null,
): Promise<void> {
  await fsJoinRoom(roomID, userId, userName, userPhoto);
}

export async function playerLeaveRoom(
  topicID: string,
  gameID: string,
  roomID: string,
  userId: string,
): Promise<void> {
  await fsLeaveRoom(roomID, userId);
}

export async function startGameInRoom(
  topicID: string,
  gameID: string,
  roomID: string,
): Promise<void> {
  await fsStartGame(roomID);
}

export function subscribeToGameStart(
  topicID: string,
  gameID: string,
  roomID: string,
  callback: (gameStarted: boolean) => void,
): () => void {
  const ref = doc(requireFirestore(), ROOMS_COLLECTION, roomID);
  return onSnapshot(ref, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data();
      callback(data.status === 'playing');
    } else {
      callback(false);
    }
  });
}

/**
 * Real-time listener buat player list di satu room — dipanggil ulang setiap
 * kali dokumen room berubah (ada yang join/leave), bukan di-poll berkala.
 * Ini yang bikin slot lobby ke-detect langsung, bukan nunggu interval.
 */
export function listenToRoomPlayers(
  roomID: string,
  callback: (players: RoomPlayerOld[]) => void,
): () => void {
  const ref = doc(requireFirestore(), ROOMS_COLLECTION, roomID);
  return onSnapshot(ref, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    const data = snapshot.data();
    const playersMap = (data.players || {}) as Record<string, RoomPlayer>;
    // Diurutkan by joinedAt (bukan urutan field di object, yang gak dijamin
    // stabil) — slot pertama = yang join paling duluan = host.
    const players = Object.entries(playersMap)
      .filter(([, p]) => p.isActive !== false)
      .sort(([, a], [, b]) => a.joinedAt - b.joinedAt)
      .map(([uid, p]) => ({
        uid,
        name: p.name || '',
        photoURL: p.photoURL,
        joinedAt: new Date(p.joinedAt).toISOString(),
      }));
    callback(players);
  });
}
