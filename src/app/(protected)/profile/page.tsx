'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out. Please try again.')
    }
  }

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
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-medium text-[#1B1B1B]">Profile</h1>
              <p className="mt-1 text-sm text-[#1B1B1B]/60">
                Manage your account settings
              </p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-[#1B1B1B] bg-black/5 rounded-[14px] hover:bg-black/10 transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
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
                    disabled={!isEditing}
                    defaultValue={user?.user_metadata?.full_name || ''}
                    className="w-full bg-black/5 border border-transparent rounded-[14px] px-3 sm:px-4 py-2.5 text-[#1B1B1B] text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-[#1B1B1B] rounded-[14px] hover:bg-[#2C2C2C] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 sm:mt-12 border-t border-black/5 pt-6 sm:pt-8">
            <h2 className="text-base sm:text-lg font-medium text-[#1B1B1B]">Account Settings</h2>
            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 px-3 sm:px-4 bg-black/5 rounded-[14px]">
                <div className="mb-2 sm:mb-0">
                  <p className="text-sm font-medium text-[#1B1B1B]">Sign Out</p>
                  <p className="text-xs text-[#1B1B1B]/60">
                    Sign out of your account
                  </p>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-[#1B1B1B] bg-black/10 rounded-[14px] hover:bg-black/20 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 