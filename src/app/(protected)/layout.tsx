'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, FC, ReactNode } from 'react'
import Sidebar from '@/components/Sidebar'

interface ProtectedLayoutProps {
  children: ReactNode;
}

const ProtectedLayout: FC<ProtectedLayoutProps> = ({ children }) => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isBrowserRoute = pathname?.startsWith('/browser/')

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render anything
  if (!user) {
    return null
  }

  // If authenticated, render the protected content
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-white via-white to-black/5">
      {!isBrowserRoute && <Sidebar />}
      <main className={`flex-1 relative min-h-screen overflow-auto ${!isBrowserRoute ? 'ml-72' : ''}`}>
        {children}
      </main>
    </div>
  )
}

export default ProtectedLayout 