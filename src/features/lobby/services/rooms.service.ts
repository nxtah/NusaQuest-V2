import { firebaseFirestore } from '@/src/lib/firebase/client'

function requireFirestore() {
  if (!firebaseFirestore) throw new Error('Firestore not configured');
  return firebaseFirestore;
}
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  documentId,
  getDoc,
  onSnapshot,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import { Room, GameState, RoomPlayer } from '@/src/types/firestore'

const ROOMS_COLLECTION = 'rooms'
const GAME_STATES_COLLECTION = 'gameStates'

/**
 * Create a new game room
 */
export async function createRoom(params: {
  gameType: 'ular-tangga' | 'nusa-card'
  mapId: string
  regionId: string
  maxPlayers: number
  hostId: string
  hostName?: string
  hostPhoto?: string | null
}): Promise<Room> {
  try {
    const { gameType, mapId, regionId, maxPlayers, hostId, hostName, hostPhoto } = params

    const room: Omit<Room, 'roomId'> = {
      gameType,
      mapId,
      regionId,
      maxPlayers,
      currentPlayers: 1,
      status: 'waiting',
      players: {
        [hostId]: {
          joinedAt: Date.now(),
          role: 'host',
          isActive: true,
          ...(hostName ? { name: hostName } : {}),
          ...(hostPhoto ? { photoURL: hostPhoto } : {}),
        },
      },
      createdAt: Date.now(),
      totalQuestionsUsed: 0,
    }

    const docRef = await addDoc(collection(requireFirestore(), ROOMS_COLLECTION), room)
    return { roomId: docRef.id, ...room }
  } catch (error) {
    console.error('Error creating room:', error)
    throw error
  }
}

/**
 * Get room by ID
 */
export async function getRoomById(roomId: string): Promise<Room | null> {
  try {
    const docRef = doc(requireFirestore(), ROOMS_COLLECTION, roomId)
    const snapshot = await getDoc(docRef)
    if (!snapshot.exists()) {
      return null
    }
    return { roomId: snapshot.id, ...snapshot.data() } as Room
  } catch (error) {
    console.error('Error getting room:', error)
    throw error
  }
}

/**
 * Join a room
 */
export async function joinRoom(
  roomId: string,
  userId: string,
  userName?: string,
  userPhoto?: string | null
): Promise<void> {
  try {
    const roomRef = doc(requireFirestore(), ROOMS_COLLECTION, roomId)
    const room = await getRoomById(roomId)

    if (!room) {
      throw new Error('Room not found')
    }

    const existing = room.players?.[userId];

    // Room udah 'playing' dan kita BUKAN salah satu pemain yang udah gabung
    // — jangan biarin join (dulu ini dicek via getDoc terpisah di halaman
    // room, sekarang numpang di read yang udah dilakuin getRoomById() di
    // atas biar gak nambah round-trip). Reconnecting participant (existing
    // truthy) tetap boleh lewat di bawah, gak kena block ini.
    if (!existing && room.status === 'playing') {
      const activeCount = Object.values(room.players || {}).filter(
        (p) => p.isActive !== false
      ).length
      const lockedError = new Error('Room is currently playing') as Error & {
        code?: string
        activeCount?: number
      }
      lockedError.code = 'ROOM_LOCKED'
      lockedError.activeCount = activeCount
      throw lockedError
    }

    if (existing) {
      if (existing.isActive !== false) return; // sudah aktif, tidak perlu apa-apa
      // Pernah join tapi di-set inactive (keluar lalu balik) — re-activate saja
      await updateDoc(roomRef, {
        [`players.${userId}.isActive`]: true,
        [`players.${userId}.lastActivity`]: Date.now(),
        ...(userName ? { [`players.${userId}.name`]: userName } : {}),
        ...(userPhoto ? { [`players.${userId}.photoURL`]: userPhoto } : {}),
      });
      return;
    }

    if (room.maxPlayers != null && room.currentPlayers >= room.maxPlayers) {
      throw new Error('Room is full')
    }

    await updateDoc(roomRef, {
      [`players.${userId}`]: {
        joinedAt: Date.now(),
        role: 'player',
        isActive: true,
        ...(userName ? { name: userName } : {}),
        ...(userPhoto ? { photoURL: userPhoto } : {}),
      },
      currentPlayers: room.currentPlayers + 1,
    })
  } catch (error) {
    // ROOM_LOCKED itu kondisi normal (room lagi kepake) yang halaman
    // pemanggil emang nangkep & tangani, bukan kegagalan — jangan
    // di-console.error tiap kali orang nyoba klik room yang lagi main.
    if ((error as { code?: string })?.code !== 'ROOM_LOCKED') {
      console.error('Error joining room:', error)
    }
    throw error
  }
}

/**
 * Start game (host only)
 */
export async function startGame(roomId: string): Promise<void> {
  try {
    const roomRef = doc(requireFirestore(), ROOMS_COLLECTION, roomId)
    await updateDoc(roomRef, {
      status: 'playing',
      startedAt: Date.now(),
    })

    // Create game state
    const room = await getRoomById(roomId)
    if (room) {
      const gameState: Omit<GameState, 'roomId'> = {
        currentPlayerIndex: 0,
        round: 0,
        turnStartedAt: Date.now(),
        playerStates: Object.keys(room.players).reduce(
          (acc, userId) => {
            acc[userId] = {
              score: 0,
              position: 0,
              correctAnswers: 0,
              wrongAnswers: 0,
              isWaiting: false,
              lastAction: Date.now(),
            }
            return acc
          },
          {} as Record<string, any>
        ),
        questionsUsed: [],
        updatedAt: Date.now(),
      }

      const gsRef = doc(requireFirestore(), GAME_STATES_COLLECTION, roomId)
      await updateDoc(gsRef, gameState).catch(() => {
        // If document doesn't exist, create it
        return addDoc(collection(requireFirestore(), GAME_STATES_COLLECTION), {
          roomId,
          ...gameState,
        })
      })
    }
  } catch (error) {
    console.error('Error starting game:', error)
    throw error
  }
}

/**
 * Leave room (player elimination)
 */
export async function leaveRoom(
  roomId: string,
  userId: string,
  finalPosition?: number
): Promise<void> {
  try {
    const roomRef = doc(requireFirestore(), ROOMS_COLLECTION, roomId)
    const room = await getRoomById(roomId)

    if (!room) {
      throw new Error('Room not found')
    }

    // Mark player as inactive
    const updates: Record<string, unknown> = {
      [`players.${userId}.isActive`]: false,
    };
    if (finalPosition !== undefined) {
      updates[`players.${userId}.finalPosition`] = finalPosition;
    }
    await updateDoc(roomRef, updates)

    // If game is playing, update game state
    if (room.status === 'playing') {
      const gsRef = doc(requireFirestore(), GAME_STATES_COLLECTION, roomId)
      await updateDoc(gsRef, {
        [`playerStates.${userId}.isWaiting`]: true,
      })
    }
  } catch (error) {
    console.error('Error leaving room:', error)
    throw error
  }
}

/**
 * Tandain pemain inactive di dokumen ROOM (bukan gameState) — dipanggil pas
 * pemain keluar SAAT GAME UDAH JALAN. Beda dari `leaveRoom` (yang dipakai
 * pas KELUAR SEBELUM game mulai): `leaveRoom` juga nulis field
 * `playerStates` di gameState (skema lama yang gak dipake game beneran),
 * yang gak relevan/gak perlu di sini — cukup update `players.{uid}.isActive`
 * doang di room, biar badge okupansi lobby (`RoomSelect.tsx`, yang baca
 * `room.players[uid].isActive`) ke-update bener. Sebelumnya field ini gak
 * pernah disentuh sama sekali kalau keluar mid-game — cuma staleness di
 * gameState (`playerActivity`) yang ke-update, room-nya nyangkut "isActive:
 * true" SELAMANYA walau pemainnya udah lama kabur, bikin badge lobby "Sedang
 * Bermain • N orang" ke-lock permanen.
 */
export async function markPlayerInactiveInRoom(roomId: string, userId: string): Promise<void> {
  try {
    const roomRef = doc(requireFirestore(), ROOMS_COLLECTION, roomId)
    await updateDoc(roomRef, { [`players.${userId}.isActive`]: false })
  } catch (error) {
    console.error('Error marking player inactive in room:', error)
  }
}

/**
 * Listen to room updates
 */
export function listenToRoom(roomId: string, callback: (room: Room | null) => void): () => void {
  const roomRef = doc(requireFirestore(), ROOMS_COLLECTION, roomId)
  return onSnapshot(roomRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null)
    } else {
      callback({ roomId: snapshot.id, ...snapshot.data() } as Room)
    }
  })
}

/**
 * Listen to game state updates (multiplayer real-time sync)
 */
export function listenToGameState(
  roomId: string,
  callback: (state: GameState | null) => void
): () => void {
  const gsRef = doc(requireFirestore(), GAME_STATES_COLLECTION, roomId)
  return onSnapshot(gsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null)
    } else {
      callback({ roomId: snapshot.id, ...snapshot.data() } as GameState)
    }
  })
}

/**
 * Get active rooms (for lobby)
 */
export async function getActiveRooms(
  gameType: string
): Promise<Room[]> {
  try {
    const q = query(
      collection(requireFirestore(), ROOMS_COLLECTION),
      where('gameType', '==', gameType),
      where('status', '==', 'waiting')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((docSnap) => ({
      roomId: docSnap.id,
      ...docSnap.data(),
    } as Room))
  } catch (error) {
    console.error('Error getting active rooms:', error)
    throw error
  }
}

export interface RoomOccupancySummary {
  status?: string
  activeCount: number
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

/**
 * Batched one-shot read of occupancy (status + live player count) for a set
 * of ad-hoc room-slot doc IDs (e.g. `${gameID}_${topicID}_room1`). Used for
 * "how many people are active here" indicators (lobby room list, province
 * modal) — not a real-time subscription, since callers only need a snapshot
 * while browsing. `'in'` queries are chunked at 10 ids for portability
 * across Firestore SDK versions.
 */
export async function getRoomsOccupancy(
  roomIds: string[]
): Promise<Record<string, RoomOccupancySummary>> {
  const uniqueIds = Array.from(new Set(roomIds))
  if (uniqueIds.length === 0) return {}

  try {
    const batches = await Promise.all(
      chunk(uniqueIds, 10).map((ids) =>
        getDocs(
          query(
            collection(requireFirestore(), ROOMS_COLLECTION),
            where(documentId(), 'in', ids)
          )
        )
      )
    )

    const summary: Record<string, RoomOccupancySummary> = {}
    for (const snapshot of batches) {
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data() as { status?: string; players?: Record<string, RoomPlayer> }
        const activeCount = Object.values(data.players || {}).filter(
          (p) => p.isActive !== false
        ).length
        summary[docSnap.id] = { status: data.status, activeCount }
      }
    }
    return summary
  } catch (error) {
    console.error('Error getting rooms occupancy:', error)
    throw error
  }
}
