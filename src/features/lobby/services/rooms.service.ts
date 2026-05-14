import { db } from '@/lib/firebase/config'
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import { Room, GameState } from '@/src/types/firestore'

const ROOMS_COLLECTION = 'rooms'
const GAME_STATES_COLLECTION = 'gameStates'

/**
 * Create a new game room
 */
export async function createRoom(params: {
  gameType: string
  mapId: string
  regionId: string
  maxPlayers: number
  hostId: string
}): Promise<Room> {
  try {
    const { gameType, mapId, regionId, maxPlayers, hostId } = params

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
          finalPosition: null,
        },
      },
      createdAt: Date.now(),
      startedAt: null,
      finishedAt: null,
      totalQuestionsUsed: 0,
    }

    const docRef = await addDoc(collection(db, ROOMS_COLLECTION), room)
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
    const docRef = doc(db, ROOMS_COLLECTION, roomId)
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
  userId: string
): Promise<void> {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId)
    const room = await getRoomById(roomId)

    if (!room) {
      throw new Error('Room not found')
    }

    if (room.currentPlayers >= room.maxPlayers) {
      throw new Error('Room is full')
    }

    await updateDoc(roomRef, {
      [`players.${userId}`]: {
        joinedAt: Date.now(),
        role: 'player',
        isActive: true,
        finalPosition: null,
      },
      currentPlayers: room.currentPlayers + 1,
    })
  } catch (error) {
    console.error('Error joining room:', error)
    throw error
  }
}

/**
 * Start game (host only)
 */
export async function startGame(roomId: string): Promise<void> {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId)
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
        winner: null,
        updatedAt: Date.now(),
      }

      const gsRef = doc(db, GAME_STATES_COLLECTION, roomId)
      await updateDoc(gsRef, gameState).catch(() => {
        // If document doesn't exist, create it
        return addDoc(collection(db, GAME_STATES_COLLECTION), {
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
  finalPosition: number | null = null
): Promise<void> {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId)
    const room = await getRoomById(roomId)

    if (!room) {
      throw new Error('Room not found')
    }

    // Mark player as inactive
    await updateDoc(roomRef, {
      [`players.${userId}.isActive`]: false,
      [`players.${userId}.finalPosition`]: finalPosition,
    })

    // If game is playing, update game state
    if (room.status === 'playing') {
      const gsRef = doc(db, GAME_STATES_COLLECTION, roomId)
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
 * Listen to room updates
 */
export function listenToRoom(roomId: string, callback: (room: Room | null) => void): () => void {
  const roomRef = doc(db, ROOMS_COLLECTION, roomId)
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
  const gsRef = doc(db, GAME_STATES_COLLECTION, roomId)
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
      collection(db, ROOMS_COLLECTION),
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
