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
  const hasLocale = locales.includes(maybeLocale);

  // Normalize path by removing the locale prefix
  const targetPath = hasLocale
    ? pathname.substring(maybeLocale.length + 1) || '/'
    : pathname;

  const token = request.cookies.get('authToken')?.value;

  // Redirect legacy admin login to new secure login
  if (targetPath.startsWith('/admin/login')) {
    const redirectPath = hasLocale ? `/${maybeLocale}/login` : '/login';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // 1. Protect Admin Route (/admin/dashboard)
  if (targetPath.startsWith('/admin/dashboard')) {
    if (!token) {
      const redirectPath = hasLocale ? `/${maybeLocale}/login` : '/login';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
      const payload = JSON.parse(payloadJson);

      if (payload.role !== 'admin') {
        const redirectPath = hasLocale ? `/${maybeLocale}/user` : '/user';
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    } catch {
      const redirectPath = hasLocale ? `/${maybeLocale}/login` : '/login';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  // 2. Protect User Route (/user)
  if (targetPath.startsWith('/user')) {
    if (!token) {
      const redirectPath = hasLocale ? `/${maybeLocale}/login` : '/login';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  // 3. Prevent Logged-in Users from accessing Login Page (/login)
  if (targetPath.startsWith('/login')) {
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
        const payload = JSON.parse(payloadJson);

        if (payload.role === 'admin') {
          const redirectPath = hasLocale ? `/${maybeLocale}/admin/dashboard` : '/admin/dashboard';
          return NextResponse.redirect(new URL(redirectPath, request.url));
        } else {
          const redirectPath = hasLocale ? `/${maybeLocale}/user` : '/user';
          return NextResponse.redirect(new URL(redirectPath, request.url));
        }
      } catch {
        // If token is invalid, let the request proceed to login
      }
    }
  }

  // Handle i18n rewriting
  if (hasLocale) {
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
