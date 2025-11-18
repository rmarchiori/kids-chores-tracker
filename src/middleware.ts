import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/children']

export async function middleware(request: NextRequest) {
  try {
    // Create Supabase client for middleware
    const response = NextResponse.next()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options })
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: '', ...options })
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Handle auth code exchange for password reset
    const code = request.nextUrl.searchParams.get('code')
    if (code && request.nextUrl.pathname === '/auth/reset-password-confirm') {
      // Let the page handle the code exchange
      return response
    }

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const pathname = request.nextUrl.pathname

    // Check if route is protected
    const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))

    // If protected route and no session, redirect to login
    if (isProtectedRoute && !session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // If authenticated and trying to access auth pages (except password reset pages), redirect to dashboard
    if (
      session &&
      (pathname === '/auth/login' || pathname === '/auth/register') &&
      !pathname.startsWith('/auth/reset-password') &&
      !pathname.startsWith('/auth/update-password')
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
  } catch (error) {
    // If there's an error, allow the request to proceed
    // This prevents issues if Supabase is temporarily unavailable
    return NextResponse.next()
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
