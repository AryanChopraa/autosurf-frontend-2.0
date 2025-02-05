'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useApiKeyStore } from '@/store/apiKeyStore'
import { getUserApiKeys, addApiKey, updateApiKey, deleteApiKey } from '@/services/api'
import { ApiKey, ApiKeyProvider } from '@/store/apiKeyStore'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const providers: ApiKeyProvider[] = ['claude', 'gemini', 'openai', 'deepseek']

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const { apiKeys, setApiKeys } = useApiKeyStore()
  const [newProvider, setNewProvider] = useState<ApiKeyProvider>('claude')
  const [newKey, setNewKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      loadApiKeys()
    } else if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out. Please try again.')
    }
  }

  const loadApiKeys = async () => {
    const loadingToast = toast.loading('Loading API keys...')
    try {
      setIsLoading(true)
      setError('')
      const keys = await getUserApiKeys()
      setApiKeys(keys)
      toast.success('API keys loaded successfully', { id: loadingToast })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load API keys'
      setError(errorMessage)
      toast.error(errorMessage, { id: loadingToast })
      console.error('Load API Keys Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault()
    const loadingToast = toast.loading('Adding API key...')
    try {
      setIsLoading(true)
      setError('')
      const apiKey: ApiKey = {
        provider: newProvider,
        key: newKey,
      }
      await addApiKey(apiKey)
      await loadApiKeys()
      setNewKey('')
      toast.success('API key added successfully', { id: loadingToast })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add API key'
      setError(errorMessage)
      toast.error(errorMessage, { id: loadingToast })
      console.error('Add API Key Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteKey = async (provider: ApiKeyProvider) => {
    const loadingToast = toast.loading('Deleting API key...')
    try {
      setIsLoading(true)
      setError('')
      await deleteApiKey(provider)
      await loadApiKeys()
      toast.success('API key deleted successfully', { id: loadingToast })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete API key'
      setError(errorMessage)
      toast.error(errorMessage, { id: loadingToast })
      console.error('Delete API Key Error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleKeyVisibility = (provider: string) => {
    setVisibleKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }))
  }

  const formatApiKey = (key: string, isVisible: boolean) => {
    if (isVisible) return key
    return `${key.slice(0, 4)}...${key.slice(-4)}`
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
    <div className="min-h-screen bg-[#FAF9F6] pt-24 font-[var(--font-serif)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[20px] border border-black/5 p-8 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-medium text-[#1B1B1B]">Profile</h1>
              <p className="mt-1 text-sm text-[#1B1B1B]/60">
                Manage your account settings
              </p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 text-sm font-medium text-[#1B1B1B] bg-black/5 rounded-[14px] hover:bg-black/10 transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[#1B1B1B]/60">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-black/5 border border-transparent rounded-[14px] px-4 py-2.5 text-[#1B1B1B] font-medium focus:outline-none focus:ring-2 focus:ring-black/10"
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
                    className="w-full bg-black/5 border border-transparent rounded-[14px] px-4 py-2.5 text-[#1B1B1B] font-medium focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-[#1B1B1B] rounded-[14px] hover:bg-[#2C2C2C] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <div className="mt-12 border-t border-black/5 pt-8">
            <h2 className="text-lg font-medium text-[#1B1B1B]">Account Settings</h2>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between py-3 px-4 bg-black/5 rounded-[14px]">
                <div>
                  <p className="text-sm font-medium text-[#1B1B1B]">Delete Account</p>
                  <p className="text-xs text-[#1B1B1B]/60">
                    Permanently delete your account and all data
                  </p>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-[14px] hover:bg-red-100 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 