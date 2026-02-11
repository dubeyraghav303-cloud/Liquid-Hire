import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Skip middleware for public routes to prevent timeouts
    if (
        path === '/' ||
        path.startsWith('/login') ||
        path.startsWith('/signup') ||
        path.startsWith('/auth') ||
        path.startsWith('/roast') ||
        path.startsWith('/api/roast')
    ) {
        return NextResponse.next();
    }

    // console.log(`[Middleware] ${request.method} ${path}`);
    const response = await updateSession(request);
    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
