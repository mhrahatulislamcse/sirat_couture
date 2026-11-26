// Next.js Edge Middleware: Gender-Adaptive Storefront Redirection
// Handles automated routing based on authenticated customer profile and preferred storefront cookies

export interface NextRequestLike {
  nextUrl: {
    pathname: string;
    search: string;
    origin: string;
    clone: () => any;
  };
  cookies: {
    get: (name: string) => { name: string; value: string } | undefined;
    has: (name: string) => boolean;
  };
  headers: Headers;
  url: string;
}

export interface NextResponseLike {
  cookies: {
    set: (name: string, value: string, options?: any) => void;
  };
  headers: Headers;
}

/**
 * Evaluates routing logic for gender-adaptive storefront redirection.
 *
 * Rules:
 * 1. If user requests /men or /women directly:
 *    - Store cookie preferred_storefront=men or women.
 *    - Allow request through.
 * 2. If user requests the root gateway (/):
 *    - Check for active session cookie (auth_token / innove_user_session).
 *    - Check user profile gender and preferred_storefront cookie.
 *    - If gender === 'MEN' or preferred_storefront === 'men' -> Redirect 307 to /men.
 *    - If gender === 'WOMEN' or preferred_storefront === 'women' -> Redirect 307 to /women.
 *    - If unauthenticated or gender === 'UNSPECIFIED' and no preference -> Continue to unified gateway (/).
 */
export function middleware(req: any) {
  const { pathname } = req.nextUrl || { pathname: '/' };

  // Bypass static files, Next.js internals, and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return;
  }

  const preferredStorefrontCookie = req.cookies.get('preferred_storefront')?.value;
  const userGenderCookie = req.cookies.get('user_gender')?.value; // 'MEN' | 'WOMEN' | 'UNSPECIFIED'
  const userPreferredHomeCookie = req.cookies.get('user_preferred_home')?.value; // 'MEN' | 'WOMEN' | 'GATEWAY'
  const authSessionCookie = req.cookies.get('auth_token')?.value || req.cookies.get('innove_user_session')?.value;

  // Track explicit visit to /men or /women
  if (pathname === '/men') {
    // In Next.js: const res = NextResponse.next(); res.cookies.set('preferred_storefront', 'men', { path: '/', maxAge: 60 * 60 * 24 * 30 }); return res;
    return;
  }

  if (pathname === '/women') {
    // In Next.js: const res = NextResponse.next(); res.cookies.set('preferred_storefront', 'women', { path: '/', maxAge: 60 * 60 * 24 * 30 }); return res;
    return;
  }

  // Root Gateway route (/) handling
  if (pathname === '/') {
    // If authenticated user with explicit gender preference
    if (authSessionCookie) {
      // Priority 1: User's explicitly toggled preferredHome
      if (userPreferredHomeCookie === 'MEN') {
        const url = req.nextUrl.clone();
        url.pathname = '/men';
        return { redirect: true, destination: url.toString() };
      }
      if (userPreferredHomeCookie === 'WOMEN') {
        const url = req.nextUrl.clone();
        url.pathname = '/women';
        return { redirect: true, destination: url.toString() };
      }

      // Priority 2: Profile Gender
      if (userGenderCookie === 'MEN') {
        const url = req.nextUrl.clone();
        url.pathname = '/men';
        return { redirect: true, destination: url.toString() };
      }
      if (userGenderCookie === 'WOMEN') {
        const url = req.nextUrl.clone();
        url.pathname = '/women';
        return { redirect: true, destination: url.toString() };
      }
    }

    // Priority 3: Non-authenticated persistent preference cookie
    if (preferredStorefrontCookie === 'men') {
      const url = req.nextUrl.clone();
      url.pathname = '/men';
      return { redirect: true, destination: url.toString() };
    }
    if (preferredStorefrontCookie === 'women') {
      const url = req.nextUrl.clone();
      url.pathname = '/women';
      return { redirect: true, destination: url.toString() };
    }

    // Default: Unauthenticated or UNSPECIFIED gender stays on gateway (/)
  }
}

export const config = {
  matcher: ['/', '/men', '/women', '/shop']
};
