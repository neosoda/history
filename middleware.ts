import { NextResponse, type NextRequest } from 'next/server'
import PocketBase from 'pocketbase'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090'
  const pb = new PocketBase(pbUrl)

  // Load auth from cookie
  const cookie = request.cookies.get('pb_auth')?.value
  if (cookie) {
    try {
      pb.authStore.loadFromCookie(cookie)

      // Optional: Refresh session if needed
      if (pb.authStore.isValid) {
        // pb.collection('users').authRefresh(); 
      }
    } catch (e) {
      pb.authStore.clear()
    }
  }

  // Update cookie in response
  const newCookie = pb.authStore.exportToCookie({ httpOnly: false })
  if (newCookie) {
    // Parsing the cookie string or just setting it? 
    // exportToCookie returns a string like "pb_auth=...; Path=/; ..."
    // NextResponse lacks a direct "set cookie string" but we can extract values.
    // However, usually pb_auth is enough.
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}