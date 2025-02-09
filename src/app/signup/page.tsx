'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function SignupPage() {
  const { user, signUpWithEmail, signInWithGoogle, loading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isVerificationSent, setIsVerificationSent] = useState(false)

  useEffect(() => {
    if (user && !loading) {
      const redirectUrl = sessionStorage.getItem('redirectUrl') || '/profile'
      sessionStorage.removeItem('redirectUrl')
      router.push(redirectUrl)
    }
  }, [user, loading, router])

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Error signing in with Google:', error)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      await signUpWithEmail(email, password)
      setIsVerificationSent(true)
    } catch (error) {
      console.error('Error signing up:', error)
      setError('Failed to sign up. Please try again.')
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

  if (isVerificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Verify your email
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We&apos;ve sent a verification link to <span className="font-medium">{email}</span>. Please check your email and click the link to complete your registration.
            </p>
            <div className="mt-6">
              <p className="text-sm text-gray-500">
                Didn&apos;t receive the email? Check your spam folder or
                <button
                  onClick={handleSignUp}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  click here to resend
                </button>
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/login"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Return to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] font-[var(--font-serif)] pt-24">
        <div className="max-w-md w-full p-8 bg-white rounded-[20px] border border-black/5 shadow-sm">
          <div className="text-center">
            <h2 className="mt-6 text-2xl font-medium text-[#1B1B1B]">
              Create an account
            </h2>
            <p className="mt-1 text-sm text-[#1B1B1B]/60">
              Get started with your free account today
            </p>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[14px] relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSignUp} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1B1B1B]/60">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full bg-black/5 border border-transparent rounded-[14px] px-4 py-2.5 text-[#1B1B1B] font-medium focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1B1B1B]/60">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full bg-black/5 border border-transparent rounded-[14px] px-4 py-2.5 text-[#1B1B1B] font-medium focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1B1B1B]/60">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full bg-black/5 border border-transparent rounded-[14px] px-4 py-2.5 text-[#1B1B1B] font-medium focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-[14px] text-sm font-medium text-white bg-[#1B1B1B] hover:bg-[#2C2C2C] transition-colors focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                Sign up
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/5" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-[#1B1B1B]/60">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent bg-black/5 rounded-[14px] text-sm font-medium text-[#1B1B1B] hover:bg-black/10 transition-colors focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign up with Google
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            <Link href="/login" className="font-medium text-[#1B1B1B] hover:text-[#2C2C2C] transition-colors">
              Already have an account? <span className="underline">Sign in</span>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
} 