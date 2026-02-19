'use client';

import { Logo } from "@/components/ui/logo";
import { FriendSearchBar } from "@/components/FriendSearchBar";
import { Profile } from "@/components/ui/user/Profile";
import { NotificationPannel } from "@/components/notificationPannel";
import { usePathname } from "next/navigation";

export function Header() {
    
  const pathname = usePathname();
  const publicRoutes = ['/signin', '/signup', '/forgot-password', '/rgpd'];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="relative flex items-center px-4 py-3">

        {/* Gauche : Logo */}
        <div className="shrink-0 z-20">
          <Logo size="sm" showText={false} />
        </div>

        {/* Milieu : Barre de recherche - centré en absolute */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-center px-40 z-10">
          <div className="w-full max-w-md">
            <FriendSearchBar />
          </div>
        </div>

        {/* Droite : Profile + Notifs */}
        <div className="ml-auto flex items-center gap-2 z-20">
          <Profile />
          <div className="relative">
            <NotificationPannel />
          </div>
        </div>

      </div>
    </header>
  );
}

