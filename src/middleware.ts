import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSiteSettings } from '@/services/settings'; // Assuming this can be called from middleware

// List of paths to exclude from maintenance mode redirection
const EXCLUDED_PATHS = [
  '/admin', // Exclude all admin routes
  '/api',   // Exclude all API routes
  '/_next/static',
  '/_next/image',
  '/favicon.ico',
  '/maintenance', // Don't redirect the maintenance page itself
  '/login', // Allow access to login page for admins
  '/register', // Allow access to registration page if needed, or remove if not
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the current path is one of the excluded paths or starts with an excluded prefix
  const isExcluded = EXCLUDED_PATHS.some(excludedPath => 
    pathname === excludedPath || (pathname.startsWith(excludedPath) && excludedPath !== '/')
  );

  if (isExcluded) {
    return NextResponse.next(); // Allow request to proceed
  }
  
  // Attempt to fetch site settings.
  // NOTE: Direct DB calls from middleware can be slow or have limitations.
  // In production, consider using an edge-compatible data store or API endpoint for this.
  try {
    const settingsResult = await getSiteSettings();

    if (settingsResult.success && settingsResult.settings?.maintenance?.enabled) {
      // Maintenance mode is ON. Rewrite to the maintenance page.
      // Rewrite keeps the URL the same but shows content from /maintenance
      console.log(`[Middleware] Maintenance mode ON. Rewriting ${pathname} to /maintenance`);
      const maintenanceUrl = new URL('/maintenance', request.url);
      return NextResponse.rewrite(maintenanceUrl);
    }
  } catch (error) {
    // Log error but allow request to proceed if settings can't be fetched.
    // This prevents the entire site from breaking if the settings fetch fails.
    console.error('[Middleware] Error fetching site settings, bypassing maintenance check:', error);
  }

  // If maintenance mode is OFF or settings fetch failed, proceed with the request.
  return NextResponse.next();
}

// Configure the matcher to apply middleware to all paths except those specified
// This middleware will run for all paths not starting with /_next/ or /api/ or /favicon.ico etc.
// We handle exclusions more granularly inside the middleware function.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - admin (admin routes, handled inside)
     * - maintenance (maintenance page, handled inside)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
