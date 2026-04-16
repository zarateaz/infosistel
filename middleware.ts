import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Next.js Middleware to protect administrative routes.
 * Security level: Server-side check before rendering any protected route.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Define protected routes starting with /admin
  // We ignore /admin/login to avoid redirection loops
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("infositel_token")?.value;

    if (!token) {
      // No token, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    try {
      // Verify token integrity
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      
      // Token is valid, proceed
      return NextResponse.next();
    } catch (error) {
      // Token is invalid or expired
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  // Allow all other routes
  return NextResponse.next();
}

// Config matches all routes except static files and assets
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*", // Protect admin-only API routes if they follow this pattern
  ],
};
