import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DEFAULT_LOCALE, isValidLocale } from './lib/i18n';
import { resolveCanonicalSlug } from './lib/redirectMap';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip Next.js internal paths, static files, and Payload CMS routes (/admin, /api)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.includes('.') // static files like favicon.ico, images, fonts
  ) {
    return NextResponse.next();
  }

  // 2. Check if path starts with a supported locale (/en or /fa)
  const pathnameSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathnameSegments[0];

  if (isValidLocale(firstSegment)) {
    // Check if it is a legacy topic slug under /[locale]/topic/[slug]
    if (pathnameSegments[1] === 'topic' && pathnameSegments[2]) {
      const rawSlug = pathnameSegments[2];
      const canonical = resolveCanonicalSlug(rawSlug);
      if (canonical && canonical !== rawSlug) {
        const url = request.nextUrl.clone();
        url.pathname = `/${firstSegment}/topic/${canonical}`;
        return NextResponse.redirect(url, 301);
      }
    }

    // Set locale cookie
    const response = NextResponse.next();
    response.cookies.set('NEXT_LOCALE', firstSegment, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }

  // 3. Detect preferred locale from cookie or Accept-Language header
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  let preferredLocale = DEFAULT_LOCALE;

  if (cookieLocale && isValidLocale(cookieLocale)) {
    preferredLocale = cookieLocale;
  } else {
    const acceptLang = request.headers.get('accept-language') || '';
    if (acceptLang.includes('fa') || acceptLang.includes('fa-IR')) {
      preferredLocale = 'fa';
    }
  }

  // 4. Handle legacy unprefixed /topic/[slug] routes (Permanent 301 redirect)
  if (firstSegment === 'topic' && pathnameSegments[1]) {
    const rawSlug = pathnameSegments[1];
    const canonical = resolveCanonicalSlug(rawSlug) || rawSlug;
    const url = request.nextUrl.clone();
    url.pathname = `/${preferredLocale}/topic/${canonical}`;
    return NextResponse.redirect(url, 301);
  }

  // 5. Handle root path "/" or other unprefixed routes -> redirect to /[locale] (307)
  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: [
    // Match all paths except static assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
