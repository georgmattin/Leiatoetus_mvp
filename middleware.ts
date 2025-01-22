import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Kontrolli JWT tokenit otse päisest
  const authHeader = req.headers.get('authorization')
  console.log('Auth header:', authHeader);

  // Võta sessioon ja uuenda küpsiseid
  const { data: { session } } = await supabase.auth.getSession()
  
  // Lisa debug info
  console.log('Request URL:', req.url);
  console.log('Cookies:', req.cookies.getAll());
  console.log('Session info:', {
    exists: !!session,
    userId: session?.user?.id,
    email: session?.user?.email,
    accessToken: session?.access_token?.slice(0, 10) + '...'
  });

  // Kui üritab minna /protected/* lehele ilma sessioonita
  if (!session && req.nextUrl.pathname.startsWith('/kasutaja')) {
    console.log('No session, redirecting to login');
    const redirectUrl = new URL('/logi-sisse', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Lisa küpsised vastusesse
  const response = NextResponse.next()
  
  // Tagasta vastus koos uuendatud küpsistega
  return response
}

// Määra middleware töötama ainult /protected/* marsruutidel
export const config = {
  matcher: [
    '/kasutaja/:path*',
    '/auth/callback'
  ]
}