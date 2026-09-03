import { firebaseFirestore } from '@/src/lib/firebase/client'

function requireFirestore() {
  if (!firebaseFirestore) throw new Error('Firestore not configured');
  return firebaseFirestore;
}
import {
  collection,
  addDoc,
  updateDoc,
  deleteField,
  doc,
  documentId,
  getDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  runTransaction,
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
  const roomRef = doc(requireFirestore(), ROOMS_COLLECTION, roomId)
  try {
    // runTransaction — dulu ini getDoc lepas, lempar 'Room not found' kalau
    // dokumennya belum ada, lalu si PEMANGGIL (halaman room) nangkep itu,
    // bikin dokumennya lewat setDoc terpisah, terus nyoba join lagi sampe
    // 3x. Kalau 2 temen buka link room yang SAMA-SAMA BARU nyaris
    // bersamaan, dua-duanya bisa baca "belum ada" barengan, dan urutan
    // create-vs-join-ulang di antara 2 client itu gak dijamin — salah satu
    // entry pemain bisa ketinggalan/ke-timpa. Transaksi Firestore
    // ngebikin-DAN-join dalam SATU operasi atomik: kalau 2 transaksi baca
    // dokumen yang sama, yang kalah otomatis di-retry SDK-nya sendiri
    // dengan data terbaru, gak ada lagi celah di antara dua langkah.
    await runTransaction(requireFirestore(), async (tx) => {
      const snapshot = await tx.get(roomRef)

      if (!snapshot.exists()) {
        tx.set(roomRef, {
          maxPlayers: 4,
          currentPlayers: 1,
          status: 'waiting',
          players: {
            [userId]: {
              joinedAt: Date.now(),
              role: 'player',
              isActive: true,
              ...(userName ? { name: userName } : {}),
              ...(userPhoto ? { photoURL: userPhoto } : {}),
            },
          },
          createdAt: Date.now(),
        })
        return
      }

      const room = { roomId: snapshot.id, ...snapshot.data() } as Room
      const existing = room.players?.[userId]

      // Room udah 'playing' dan kita BUKAN salah satu pemain yang udah
      // gabung — jangan biarin join. Reconnecting participant (existing
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
        tx.update(roomRef, {
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

      const updatedPlayers = {
        ...room.players,
        [userId]: {
          joinedAt: Date.now(),
          role: 'player',
          isActive: true,
          ...(userName ? { name: userName } : {}),
          ...(userPhoto ? { photoURL: userPhoto } : {}),
        },
      }

      tx.update(roomRef, {
        [`players.${userId}`]: updatedPlayers[userId],
        // Dihitung ulang dari isi players hasil transaksi ini (baca yang
        // konsisten), bukan `room.currentPlayers + 1` di atas angka yang
        // udah bisa basi kalau ada join lain nyempil di antara baca & tulis
        // — ini akar masalah yang sama kayak bug finishedOrder/currentPlayers
        // di game service, sekarang dibenerin di sisi room juga.
        currentPlayers: Object.keys(updatedPlayers).length,
      })
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
 * "Host" di codebase ini BUKAN ditentuin dari `RoomPlayer.role==='host'` —
 * field itu emang ada di tipenya, tapi `joinRoom()` gak pernah nulis nilai
 * itu (selalu `role:'player'`, walau buat pemain PERTAMA sekalipun; nilai
 * `'host'` cuma ditulis `createRoom()`, fungsi yang gak pernah dipanggil
 * sama alur room beneran, yang bikin dokumen room LEWAT `setDoc` langsung
 * di halaman room). Host itu SIAPAPUN yang paling duluan join (`joinedAt`
 * paling kecil) — sama persis kayak `isFirstPlayer` yang UI room page udah
 * pake buat nampilin tombol "Mulai Game". Helper ini nyamain definisi itu
 * di sisi service, biar `addBotToRoom`/`removeBotFromRoom` gak salah
 * nolak host beneran gara-gara ngecek field yang emang gak pernah keisi.
 */
function isRoomHost(room: Room, uid: string): boolean {
  const activeEntries = Object.entries(room.players || {})
    .filter(([, p]) => p.isActive !== false)
    .sort(([, a], [, b]) => a.joinedAt - b.joinedAt)
  return activeEntries.length > 0 && activeEntries[0][0] === uid
}

/**
 * Tambahin bot ke slot kosong — host-only (dicek di sini, bukan cuma di UI,
 * biar gak bisa dipanggil langsung sama non-host lewat console/API call).
 * Bot direpresentasiin sebagai entry BIASA di `players` map dengan
 * `role: 'ai'` (nilai enum ini emang udah ada dari awal di tipe
 * `RoomPlayer`, cuma belum pernah dipake) — UID sintetis `bot-1`/`bot-2`/
 * `bot-3` (unik per room; paling banyak 3 karena host selalu nempatin slot
 * pertama). Avatarnya numpang konvensi dicebear-bot yang UDAH dipake buat
 * fallback avatar pemain offline di halaman game (`ular-tangga/page.tsx`),
 * biar visual "bot" & "pemain offline" konsisten satu bahasa.
 */
export async function addBotToRoom(roomId: string, hostUid: string): Promise<void> {
  try {
    const roomRef = doc(requireFirestore(), ROOMS_COLLECTION, roomId)
    const room = await getRoomById(roomId)
    if (!room) throw new Error('Room not found')
    if (room.status !== 'waiting') throw new Error('Game sudah dimulai, gak bisa nambah bot lagi')
    if (!isRoomHost(room, hostUid)) throw new Error('Cuma host yang bisa nambah bot')
    if (room.maxPlayers != null && room.currentPlayers >= room.maxPlayers) {
      throw new Error('Room sudah penuh')
    }

    const existingBotNumbers = Object.keys(room.players || {})
      .map((uid) => /^bot-(\d+)$/.exec(uid)?.[1])
      .filter((n): n is string => !!n)
      .map(Number)
    const nextNumber = existingBotNumbers.length > 0 ? Math.max(...existingBotNumbers) + 1 : 1
    const botUid = `bot-${nextNumber}`

    await updateDoc(roomRef, {
      [`players.${botUid}`]: {
        joinedAt: Date.now(),
        role: 'ai',
        isActive: true,
        name: `Bot ${nextNumber}`,
        photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${botUid}&backgroundColor=b6e3f4`,
      },
      currentPlayers: room.currentPlayers + 1,
    })
  } catch (error) {
    console.error('Error adding bot to room:', error)
    throw error
  }
}

/**
 * Copot bot dari room — cuma bisa dipanggil host, sebelum game mulai
 * (`status === 'waiting'`), biar gak ada race sama game yang udah jalan.
 */
export async function removeBotFromRoom(roomId: string, botUid: string, hostUid: string): Promise<void> {
  try {
    const roomRef = doc(requireFirestore(), ROOMS_COLLECTION, roomId)
    const room = await getRoomById(roomId)
    if (!room) throw new Error('Room not found')
    if (room.status !== 'waiting') throw new Error('Game sudah dimulai, gak bisa hapus bot lagi')
    if (!isRoomHost(room, hostUid)) throw new Error('Cuma host yang bisa hapus bot')
    const target = room.players?.[botUid]
    if (!target || target.role !== 'ai') throw new Error('Bukan slot bot')

    await updateDoc(roomRef, {
      [`players.${botUid}`]: deleteField(),
      currentPlayers: Math.max(0, room.currentPlayers - 1),
    })
  } catch (error) {
    console.error('Error removing bot from room:', error)
    throw error
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
