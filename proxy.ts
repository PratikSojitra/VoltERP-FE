import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Matcher array for routes that require authentication
const protectedRoutes = ['/dashboard'];
const publicRoutes = ['/login', '/'];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the current route is protected or public
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isPublicRoute = publicRoutes.includes(pathname);

    // Retrieve the auth token from cookies
    const token = request.cookies.get('token')?.value;

    console.log(`[Middleware] Path: ${pathname} | Token Found: ${!!token}`);

    // Logic: Active Session trying to access /login
    if (isPublicRoute && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Logic: Unauthenticated User trying to access /dashboard protected route
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Default behavior for other routes
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
