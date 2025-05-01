import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server'; // Import NextRequest type

const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/student(.*)',
  '/alumni(.*)',
]);

const roleDashboardMap: Record<string, string> = {
  admin: '/admin/dashboard',
  student: '/student/dashboard',
  alumni: '/alumni/dashboard',
};

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  
  // Check for the role and set default to 'student' if not present
  const role = sessionClaims?.publicMetadata?.role ?? 'student';
  const path = req.nextUrl.pathname;

  // Redirect unauthenticated users trying to access protected routes
  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  const expectedPathPrefix = `/${role}`;
  
  // Redirect to the correct dashboard if the user tries to access an invalid route for their role
  if (isProtectedRoute(req)) {
    // If user tries to go to any dashboard route that doesn't match their role
    if (path.includes('dashboard') && !path.startsWith(expectedPathPrefix)) {
      const dashboardUrl = roleDashboardMap[role] || '/';
      return NextResponse.redirect(new URL(dashboardUrl, req.url));
    }
    
    // If the path starts with a protected route but not the correct role
    if (!path.startsWith(expectedPathPrefix)) {
      const dashboardUrl = roleDashboardMap[role] || '/';
      return NextResponse.redirect(new URL(dashboardUrl, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/admin(.*)',
    '/student(.*)',
    '/alumni(.*)',
    '/((?!_next|.*\\.(?:jpg|jpeg|png|gif|svg|css|js|ico|woff2?)$).*)',
  ],
};
