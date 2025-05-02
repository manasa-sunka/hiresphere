import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/student(.*)',
  '/alumni(.*)',
]);


export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId } = await auth();
  if(isProtectedRoute(req) && !userId) {
    await auth.protect();
  }


  return NextResponse.next();
});

export const config = {
  matcher: [
    '/admin(.*)',
    '/student(.*)',
    '/alumni(.*)',
    //api should be protected
    '/api/:path*',
    '/((?!_next|.*\\.(?:jpg|jpeg|png|gif|svg|css|js|ico|woff2?)$).*)',
  ],
};
