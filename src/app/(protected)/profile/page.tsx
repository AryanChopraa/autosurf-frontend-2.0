'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-24 font-[var(--font-serif)] px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[20px] border border-black/5 p-4 sm:p-8 shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-medium text-[#1B1B1B]">Profile</h1>
            <p className="mt-1 text-sm text-[#1B1B1B]/60">
              Your account information
            </p>
          </div>

          <div className="mt-6 sm:mt-8 space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[#1B1B1B]/60">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-black/5 border border-transparent rounded-[14px] px-3 sm:px-4 py-2.5 text-[#1B1B1B] text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1B1B1B]/60">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    disabled
                    value={user?.user_metadata?.full_name || ''}
                    className="w-full bg-black/5 border border-transparent rounded-[14px] px-3 sm:px-4 py-2.5 text-[#1B1B1B] text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 