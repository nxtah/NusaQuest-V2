'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase/config'
import { onAuthStateChanged, User } from 'firebase/auth'
import { signOutUser } from '@/features/auth/services/auth.service'
import '../../styles/lobby.css'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        setIsAuthorized(true)
        setIsLoading(false)
      } else {
        setIsLoading(false)
        // Redirect to home if not logged in
        router.push('/home')
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleLogout = async () => {
    try {
      await signOutUser()
      router.push('/home')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
        <div className="text-center">
          <div className="text-6xl animate-spin mb-4">⏳</div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized || !user) {
    return null
  }

  return (
    <>
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-xl font-bold">🎮 NusaQuest</div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              👤 {user.displayName || user.email}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div>{children}</div>
    </>
  )
}
