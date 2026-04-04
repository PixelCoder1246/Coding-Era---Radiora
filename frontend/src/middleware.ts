import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('radiora_token')?.value;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // 1. Protected routes beginning with /admin
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    // Note: Deep validation for role-based access is still performed at the page level
    // to keep the middleware lightweight for common assets.
  }

  // 2. Auth routes beginning with /auth (prevent logged-in users from seeing them)
  if (pathname.startsWith('/auth')) {
    if (token) {
      try {
        // Only redirect if the token is actually valid to avoid loops
        const response = await fetch(`${API_URL}/api/auth/status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        });

        if (response.ok) {
          // If user is already logged in and token is valid, redirect to admin dashboard
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
      } catch (error) {
        console.error('Middleware Auth Check Error:', error);
      }
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/:path*', '/auth/:path*'],
};
