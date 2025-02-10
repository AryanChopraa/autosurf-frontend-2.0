'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'

type AuthContextType = {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ needsVerification?: boolean }>
  resendVerificationEmail: (email: string) => Promise<void>
}

const API_PROD_URL = 'https://api.autosurf.tech'
const API_DEV_URL = 'http://localhost:8080'
const FRONTEND_PROD_URL = 'https://autosurf.tech'
const FRONTEND_DEV_URL = 'http://localhost:3000'

const API_BASE_URL = process.env.NODE_ENV === 'production' ? API_PROD_URL : API_DEV_URL
const FRONTEND_BASE_URL = process.env.NODE_ENV === 'production' ? FRONTEND_PROD_URL : FRONTEND_DEV_URL

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and sets the user
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session)
      if (event === 'SIGNED_IN') {
        setUser(session?.user ?? null)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      // Get the current URL
      const currentUrl = typeof window !== 'undefined' ? window.location.origin : FRONTEND_DEV_URL
      
      // Determine the final redirect URL
      const redirectUrl = process.env.NODE_ENV === 'production' 
        ? `${FRONTEND_PROD_URL}/auth/callback`
        : `${currentUrl}/auth/callback`

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      })
      
      if (error) {
        console.error('Supabase OAuth error:', error)
        toast.error('Failed to sign in. Please try again.')
        throw error
      }
      
      console.log('Sign in successful:', data)
    } catch (error) {
      console.error('Detailed error:', error)
      toast.error('An error occurred during sign in. Please try again later.')
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
  }

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${FRONTEND_BASE_URL}/auth/callback`
        }
      })

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('An account with this email already exists')
        } else {
          console.error('Signup error:', error)
          toast.error(error.message)
        }
        return
      }

      toast.success('Please check your email to confirm your account')
    } catch (error) {
      console.error('Signup error:', error)
      toast.error('An error occurred during sign up')
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        // Handle specific error cases without throwing or logging to console.error
        switch (error.message) {
          case 'Invalid login credentials':
            toast.error('Invalid email or password')
            return { error: 'Invalid login credentials' }
          case 'Email not confirmed':
            toast.error('Please verify your email before signing in')
            return { needsVerification: true }
          case 'Invalid email or password':
            toast.error('Invalid email or password')
            return { error: 'Invalid email or password' }
          case 'Too many requests':
            toast.error('Too many login attempts. Please try again later')
            return { error: 'Too many requests' }
          case 'Database error':
            toast.error('Service temporarily unavailable. Please try again later')
            return { error: 'Database error' }
          default:
            toast.error('An error occurred during sign in')
            return { error: error.message }
        }
      }

      toast.success('Successfully signed in!')
      return { success: true }
    } catch (error) {
      // Only log truly unexpected errors
      if (!(error instanceof AuthError)) {
        console.error('Unexpected sign in error:', error)
      }
      toast.error('An unexpected error occurred. Please try again later')
      return { error: 'Unexpected error' }
    }
  }

  const resendVerificationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) {
        console.error('Error resending verification email:', error)
        toast.error('Failed to resend verification email')
        throw error
      }

      toast.success('Verification email sent! Please check your inbox')
    } catch (error) {
      console.error('Error resending verification:', error)
      toast.error('Failed to resend verification email')
      throw error
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        signInWithGoogle, 
        signOut,
        signUpWithEmail,
        signInWithEmail,
        resendVerificationEmail
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 