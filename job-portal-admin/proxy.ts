import { NextResponse, NextRequest } from 'next/server';
import { ROUTES } from './constants/routes';

// Trigger Vercel rebuild to apply Root Directory settings
/**
 * Next.js Edge Middleware for Route Protection.
 * 
 * Intercepts requests on the server to block unauthenticated access to
 * the dashboard and prevent authenticated users from loading the login pages.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('job-portal-auth-token')?.value;

  const isAuthPage = pathname.startsWith(ROUTES.LOGIN) || pathname.startsWith(ROUTES.VERIFY);
  const isDashboardPage =
    pathname === ROUTES.DASHBOARD ||
    pathname.startsWith(ROUTES.USERS) ||
    pathname.startsWith(ROUTES.RECRUITERS) ||
    pathname.startsWith(ROUTES.EMPLOYEES) ||
    pathname.startsWith(ROUTES.JOBS) ||
    pathname.startsWith(ROUTES.APPLICATIONS);

  // 1. Authenticated user trying to access public auth pages -> redirect to dashboard
  if (token && isAuthPage) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = ROUTES.DASHBOARD;
    return NextResponse.redirect(dashboardUrl);
  }

  // 2. Unauthenticated user trying to access protected dashboard pages -> redirect to login
  if (!token && isDashboardPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = ROUTES.LOGIN;
    // Keep track of the original page to redirect back after login
    if (pathname !== ROUTES.DASHBOARD) {
      loginUrl.searchParams.set('redirectTo', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Configure paths that should trigger this middleware.
 * Matches all application pages except static resources and next internal endpoints.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml (SEO files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
