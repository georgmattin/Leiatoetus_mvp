import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Kui kasutaja tuleb auth callback URL-ilt ja on autenditud
  if (req.nextUrl.pathname === '/auth/callback') {
    if (session) {
      // Suuna kasutaja parooli seadmise lehele
      return NextResponse.redirect(new URL('/loo-parool', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/auth/callback']
}