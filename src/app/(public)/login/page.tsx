'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'
import Button from '@/components/ui/Button'
import { signInWithGoogle } from '@/features/auth/services/auth.service'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/home')
      }
    })
    return () => unsubscribe()
  }, [router])

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError(null)
      await signInWithGoogle()
      router.push('/home')
    } catch (err) {
      setError('Login gagal. Coba lagi.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Logo */}
          <div className="text-6xl mb-6">🎮</div>

          {/* Heading */}
          <h1 className="text-3xl font-bold mb-2 text-gray-800">NusaQuest</h1>
          <p className="text-gray-600 mb-8">
            Jelajahi keindahan budaya Indonesia sambil bermain!
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Login Button */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 mb-4 text-lg"
          >
            {loading ? '⏳ Sedang Login...' : '🔐 Login dengan Google'}
          </Button>

          {/* Info Text */}
          <p className="text-sm text-gray-500 mt-6">
            Masuk untuk menyimpan progress dan bersaing di leaderboard!
          </p>

          {/* Features */}
          <div className="mt-8 pt-8 border-t border-gray-200 space-y-3 text-left">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <h3 className="font-semibold text-gray-800">Leaderboard</h3>
                <p className="text-sm text-gray-600">Bersaing dengan pemain lain</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎁</span>
              <div>
                <h3 className="font-semibold text-gray-800">Achievements</h3>
                <p className="text-sm text-gray-600">Buka lencana dan pencapaian</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">👥</span>
              <div>
                <h3 className="font-semibold text-gray-800">Multiplayer</h3>
                <p className="text-sm text-gray-600">Bermain dengan teman</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/home')}
            className="text-white hover:underline"
          >
            ← Kembali ke Home
          </button>
        </div>
      </div>
    </main>
  )
}
