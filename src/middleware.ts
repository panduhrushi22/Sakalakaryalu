import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'te', 'hi', 'ta', 'kn', 'ml', 'mr'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets, Next.js internal files, and backend APIs
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Check if pathname starts with a locale
  const segments = pathname.split('/');
  const maybeLocale = segments[1];

  if (locales.includes(maybeLocale)) {
    // Determine target un-prefixed internal path
    const internalPath = pathname.substring(maybeLocale.length + 1) || '/';
    
    const response = NextResponse.rewrite(new URL(internalPath, request.url));
    
    // Synchronize the language cookie
    response.cookies.set('sakalakaryalu_lang', maybeLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply to all route paths except static assets and APIs
    '/((?!api|_next/static|_next/image|assets|favicon.ico|.*\\..*).*)',
  ],
};
