import { NextResponse } from 'next/server';
import { auth } from './src/server/auth';

// This middleware handles authentication and redirects
export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isDevelopment = process.env.NODE_ENV === "development";
  
  // Get the pathname of the request
  const path = nextUrl.pathname;
  
  // Public paths that don't require authentication
  const publicPaths = ['/', '/api/auth'];
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith(`${publicPath}/`)
  );
  
  // For development environment, be less restrictive
  if (isDevelopment && path.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  // If the path is not public and the user is not authenticated, redirect to the sign-in page
  if (!isPublicPath && !session) {
    // Redirect to the sign-in page
    return NextResponse.redirect(new URL('/', nextUrl.origin));
  }
  
  // If the user is authenticated and trying to access the sign-in page, redirect to the main page
  if (session && path === '/') {
    return NextResponse.redirect(new URL('/main', nextUrl.origin));
  }
  
  // Continue with the request
  return NextResponse.next();
})

export const config = {
  // Make sure to exclude all auth-related paths from middleware
  matcher: [
    // Include all paths except:
    '/((?!api/auth|api/auth/.*|api/auth/callback/.*|_next/static|_next/image|favicon.ico).*)'
  ],
} 