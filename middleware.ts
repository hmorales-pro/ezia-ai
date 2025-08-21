import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "./lib/auth-utils";

// Routes that require authentication
const protectedRoutes = [
  '/business/new',
  '/business/[id]',
  '/sites/new',
  '/sites/[id]'
];

// Routes that are always public
const publicRoutes = [
  '/',
  '/auth',
  '/auth/callback',
  '/pricing',
  '/tarifs',
  '/help',
  '/gallery'
];

export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-current-host", request.nextUrl.host);
  
  const pathname = request.nextUrl.pathname;
  const authToken = request.cookies.get(AUTH_COOKIE_NAME);
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => {
    // Convert route pattern to regex
    const pattern = route.replace(/\[.*?\]/g, '[^/]+');
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(pathname);
  });
  
  // If it's a protected route and user is not authenticated, redirect to dashboard
  // Dashboard will show the appropriate UI for non-authenticated users
  if (isProtectedRoute && !authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next({ headers });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};