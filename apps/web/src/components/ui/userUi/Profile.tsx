'use client';

import { useClerk, useUser } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";
import { LogOut, Settings, User, Mail, Calendar, ChevronDown } from "lucide-react";

export function Profile() {
  const { signOut, openUserProfile } = useClerk();
  const { user, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isLoaded || !user) {
    return (
      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
    );
  }

  const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton Avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={user.fullName || 'Avatar'}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-border"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
            {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress?.charAt(0)?.toUpperCase()}
          </div>
        )}
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-popover shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
          {/* Header avec infos utilisateur */}
          <div className="p-4 bg-linear-to-br from-primary/10 to-accent/10 border-b border-border">
            <div className="flex items-center gap-3">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.fullName || 'Avatar'}
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-semibold">
                  {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {user.fullName || user.firstName || 'Utilisateur'}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  @{user.username || user.id.slice(0, 8)}
                </p>
              </div>
            </div>
          </div>

          {/* Infos détaillées */}
          <div className="p-3 space-y-1 border-b border-border">
            <div className="flex items-center gap-3 px-2 py-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{user.primaryEmailAddress?.emailAddress}</span>
            </div>
            {createdAt && (
              <div className="flex items-center gap-3 px-2 py-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>Membre depuis {createdAt}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-2">
            <button
              onClick={() => {
                openUserProfile();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-accent transition-colors text-foreground"
            >
              <User className="h-4 w-4" />
              <span>Mon profil</span>
            </button>
            <button
              onClick={() => {
                openUserProfile();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-accent transition-colors text-foreground"
            >
              <Settings className="h-4 w-4" />
              <span>Paramètres</span>
            </button>
            <div className="my-2 border-t border-border" />
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-destructive/10 transition-colors text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
