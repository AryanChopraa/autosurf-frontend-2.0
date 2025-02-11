'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, FC, ReactNode, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

interface ProtectedLayoutProps {
  children: ReactNode;
}

const ProtectedLayout: FC<ProtectedLayoutProps> = ({ children }) => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isBrowserRoute = pathname?.startsWith('/browser/')
  const isSavedAutomationsRoute = pathname?.startsWith('/saved-automations/')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

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
      {/* Mobile menu button */}
      {!isBrowserRoute && !isSavedAutomationsRoute && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden fixed top-4 left-4 z-[60] p-2 rounded-lg bg-white shadow-md border border-black/5"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-gray-600" />
          )}
        </button>
      )}

      {/* Sidebar - show/hide based on mobile menu state */}
      {!isBrowserRoute && !isSavedAutomationsRoute && (
        <div
          className={`${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform duration-300 ease-in-out fixed inset-y-0 left-0 z-50 w-72 pt-16 lg:pt-0`}
        >
          <Sidebar />
        </div>
      )}

      {/* Main content */}
      <main 
        className={`flex-1 min-h-screen overflow-auto ${
          !isBrowserRoute && !isSavedAutomationsRoute ? 'lg:pl-72 pt-16 lg:pt-0' : ''
        } w-full`}
      >
        {children}
      </main>
    </div>
  )
}

export default ProtectedLayout 