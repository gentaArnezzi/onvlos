import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes yang perlu auth
const protectedRoutes = ["/dashboard", "/portal"];
const authRoutes = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  // Check for better-auth session cookie
  // Better-auth uses different cookie names, check for common ones
  const sessionCookie = 
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("session_token") ||
    request.cookies.get("better-auth.session");
  
  const hasSession = !!sessionCookie?.value;
  
  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Redirect to dashboard if accessing auth routes with session
  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|onboard).*)',
  ],
};
