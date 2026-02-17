'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

const PUBLIC_ROUTES = ['/signin', '/signup', '/forgot-password', '/reset-password', '/about', '/rgpd', '/terms', '/privacy'];

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

    if (status === 'unauthenticated' && !isPublicRoute) {
      router.replace(`/signin?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router]);

  return <>{children}</>;
}
