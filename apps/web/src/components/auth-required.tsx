'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AuthRequired({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  // Afficher un loader pendant que Clerk charge
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas connecté, ne rien afficher (la redirection est en cours)
  if (!isSignedIn) {
    return null;
  }

  // Si tout est OK, afficher le contenu
  return <>{children}</>;
}
