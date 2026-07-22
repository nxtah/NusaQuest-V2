'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { firebaseAuth as auth } from '@/src/lib/firebase/client'
import { onAuthStateChanged } from 'firebase/auth'
import Button from '@/src/components/ui/Button'
import Loader from '@/src/components/ui/Loader'
import { getActiveRooms, createRoom, joinRoom } from '@/src/features/lobby/services/rooms.service'
import { updateLastLogin } from '@/src/features/achievements/services/users.service'
import { getOrCreateUser } from '@/src/features/achievements/services/users.service'
import { Room } from '@/src/types/firestore'

export default function LobbyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mapId = searchParams.get('mapId')
  const gameType = searchParams.get('gameType') as 'ular-tangga' | 'nusa-card' | null
  const regionId = searchParams.get('regionId')

  const [userId, setUserId] = useState<string | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [creatingRoom, setCreatingRoom] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null)

  // Check auth state and validate params
  useEffect(() => {
    if (!auth) return
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid)

        // Update last login
        await updateLastLogin(user.uid).catch(console.error)

        // Create or update user profile
        await getOrCreateUser(user.uid, {
          email: user.email || '',
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL || undefined,
        }).catch(console.error)
      } else {
        router.push('/home')
      }
    })
    return () => unsubscribe()
  }, [router])

  // Validate params and load rooms
  useEffect(() => {
    if (!mapId || !gameType || !regionId) {
      router.push('/home')
      return
    }
    loadRooms()
  }, [gameType, mapId, regionId, router])

  const loadRooms = async () => {
    if (!gameType) return
    try {
      setLoading(true)
      setError(null)
      const activeRooms = await getActiveRooms(gameType)
      setRooms(activeRooms)
    } catch (err) {
      setError('Gagal memuat room. Coba lagi.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoom = async () => {
    if (!userId || !mapId || !gameType || !regionId) return

    try {
      setCreatingRoom(true)
      setError(null)
      const newRoom = await createRoom({
        gameType,
        mapId,
        regionId,
        maxPlayers: 4,
        hostId: userId,
      })
      router.push(`/play/${newRoom.roomId}`)
    } catch (err) {
      setError('Gagal membuat room. Coba lagi.')
      console.error(err)
    } finally {
      setCreatingRoom(false)
    }
  }

  const handleJoinRoom = async (roomId: string) => {
    if (!userId) return

    try {
      setJoiningRoomId(roomId)
      setError(null)
      await joinRoom(roomId, userId)
      router.push(`/play/${roomId}`)
    } catch (err) {
      setError('Gagal masuk room. Coba lagi atau buat yang baru.')
      console.error(err)
    } finally {
      setJoiningRoomId(null)
    }
  }

  const getGameLabel = (type: string | null) => {
    return type === 'ular-tangga' ? '🎲 Ular Tangga' : '🃏 Nusa Card'
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🎮 Lobby</h1>
          <div className="flex gap-4 text-gray-600">
            <p>Game: {getGameLabel(gameType)}</p>
            <button
              onClick={() => router.push('/home')}
              className="text-blue-600 hover:underline"
            >
              ← Kembali ke Home
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Create Room Button */}
        <div className="mb-8">
          <Button
            onClick={handleCreateRoom}
            disabled={creatingRoom || !userId}
            className="w-full py-3 text-lg"
          >
            {creatingRoom ? '⏳ Membuat Room...' : '➕ Buat Room Baru'}
          </Button>
        </div>

        {/* Available Rooms */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Ruangan Tersedia</h2>

          {loading ? (
            <Loader fullScreen={false} message="Memuat ruangan..." />
          ) : rooms.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-600 mb-2 text-lg">Belum ada ruangan yang tersedia</p>
              <p className="text-sm text-gray-500">
                Ciptakan ruangan baru atau tunggu pemain lain bergabung
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {rooms.map((room) => (
                <div
                  key={room.roomId}
                  className="p-5 bg-white rounded-lg border border-gray-300 hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">
                        Room {room.roomId.slice(0, 8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        👥 {room.currentPlayers}/{room.maxPlayers} pemain
                      </p>
                    </div>
                    <Button
                      onClick={() => handleJoinRoom(room.roomId)}
                      disabled={
                        room.currentPlayers >= room.maxPlayers || joiningRoomId === room.roomId
                      }
                      size="sm"
                    >
                      {joiningRoomId === room.roomId ? '⏳ Masuk...' : 'Masuk'}
                    </Button>
                  </div>

                  {/* Player List */}
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(room.players).map(([uid, player]) => (
                      <span
                        key={uid}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {player.role === 'host' ? '👑' : '👤'} {player.role}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
