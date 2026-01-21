import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Routes publiques qui ne nécessitent pas d'authentification
const isPublicRoute = createRouteMatcher([
  '/',                    // Page d'accueil / landing page
  '/sign-in(.*)',        // Pages de connexion
  '/sign-up(.*)',        // Pages d'inscription
  '/api/webhooks(.*)',   // Webhooks Clerk
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect({
      unauthenticatedUrl: new URL(`${process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}`, request.url).toString(),
    });
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
