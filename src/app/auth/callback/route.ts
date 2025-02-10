import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const PROD_URL = 'https://autosurf.tech'
const DEV_URL = 'http://localhost:3000'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  const baseUrl = process.env.NODE_ENV === 'production' ? PROD_URL : DEV_URL
  return NextResponse.redirect(new URL('/dashboard', baseUrl))
} 