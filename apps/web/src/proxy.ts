import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Routes publiques (accessibles sans connexion)
  const publicRoutes = [
    "/signin",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/about",
    "/rgpd",
    "/condition",
    "/privacy",
  ];

  // Vérifier si c'est une route publique
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Routes API NextAuth (toujours publiques)
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Permettre l'accès aux routes publiques
  if (isPublicRoute) {
    // Si connecté et sur signin/signup, rediriger vers /
    if (isAuthenticated && (pathname === "/signin" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Rediriger vers /signin si non authentifié sur route protégée
  if (!isAuthenticated) {
    const signInUrl = new URL("/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
