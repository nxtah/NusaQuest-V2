'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase/config'
import { onAuthStateChanged } from 'firebase/auth'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useEffect(true)
  const [isAuthorized, setIsAuthorized] = useEffect(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthorized(true)
        setIsLoading(false)
      } else {
        // Redirect to home if not logged in
        router.push('/home')
      }
    })

    return () => unsubscribe()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl animate-spin mb-4">⏳</div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
