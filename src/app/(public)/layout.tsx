'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/firebase/config'
import { onAuthStateChanged, User } from 'firebase/auth'
import { signOutUser } from '@/features/auth/services/auth.service'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await signOutUser()
      router.push('/home')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/home" className="text-xl font-bold hover:text-blue-600 transition-colors">
            🎮 NusaQuest
          </Link>
          <div className="flex items-center gap-4">
            {!loading && (
              <>
                {user ? (
                  <>
                    <div className="text-sm text-gray-600">
                      👤 {user.displayName || user.email}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                    >
                      Logout
                    </button>
                    <Link
                      href="/lobby"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      Lobby
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    Login
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div>{children}</div>
    </>
  )
}
