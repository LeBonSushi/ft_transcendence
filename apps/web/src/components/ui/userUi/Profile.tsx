'use client';

import { useClerk, useUser, useSession } from "@clerk/nextjs";
import { apiClient } from "@/lib/api/client";
import { UserResource } from "@clerk/types";
import { useState, useRef, useEffect } from "react";
import {
  Settings,
  ChevronDown, 
  User,
  Shield,
  Mail,
  Calendar,
  Smartphone,
  Key,
  Monitor,
  LogOut,
  Trash2,
  Plus,
  Check,
  X,
  Clock,
  MapPin,
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Profile() {
  const { signOut } = useClerk();
  const [isOpenProfilePage, setIsOpenProfilePage] = useState(false);
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
    <>
      {isOpenProfilePage && (
        <ProfilePage onClose={() => setIsOpenProfilePage(false)} />
      )}
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

                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-accent transition-colors text-foreground"
              >
                <User className="h-4 w-4" />
                <span>Mon profil</span>
              </button>
              <button
                onClick={() => {
                  setIsOpenProfilePage(true);
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
    </>
  );
}

type Tab = 'account' | 'security';

export function ProfilePage({ onClose }: { onClose: () => void }) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [sessions, setSessions] = useState<any[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  console.log('User data:', user);
  
  useEffect(() => {
    if (user) {
      user.getSessions().then(setSessions);
    }
  }, [user]);

  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : null;

  const lastSignIn = user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto mx-0 sm:mx-4 p-4 sm:p-6 md:px-12 lg:px-16 bg-background sm:rounded-2xl shadow-2xl">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl bg-card border border-border mt-8 sm:mt-0">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.fullName || 'Avatar'}
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover ring-4 ring-primary/20"
            />
          ) : (
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl sm:text-2xl font-bold">
              {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {user.fullName || user.firstName || 'Utilisateur'}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">@{user.username || user.id.slice(0, 8)}</p>
            {createdAt && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Membre depuis {createdAt}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={() => signOut()} className="w-full sm:w-auto">
            <LogOut className="h-4 w-4 mr-2" />
            <span className="sm:inline">Se déconnecter</span>
          </Button>
        </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'account'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <User className="h-4 w-4" />
          Compte
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Shield className="h-4 w-4" />
          Sécurité
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4 sm:space-y-6 pb-6">
        {activeTab === 'account' && (
          <AccountSection user={user} lastSignIn={lastSignIn} />
        )}
        {activeTab === 'security' && (
          <SecuritySection
            user={user}
            session={session}
            sessions={sessions}
            setSessions={setSessions}
            showBackupCodes={showBackupCodes}
            setShowBackupCodes={setShowBackupCodes}
          />
        )}
        </div>
      </div>
    </div>
  );
}

// ============ ACCOUNT SECTION ============
function AccountSection({ user, lastSignIn }: { user: UserResource; lastSignIn: string | null }) {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [username, setUsername] = useState(user.username || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const updateData: Record<string, string> = {};

      if (firstName !== user.firstName) {
        updateData.firstName = firstName;
      }
      if (lastName !== user.lastName) {
        updateData.lastName = lastName;
      }
      if (username !== user.username && username) {
        updateData.username = username;
      }

      if (Object.keys(updateData).length > 0) {
        await user.update(updateData);
      }
      setIsEditing(false);
    } catch (err: any) {
      console.error('Clerk update error:', err);
      const errorMessage = err?.errors?.[0]?.longMessage
        || err?.errors?.[0]?.message
        || err?.message
        || 'Erreur lors de la mise à jour';
      setError(errorMessage);
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setFirstName(user.firstName || '');
    setLastName(user.lastName || '');
    setUsername(user.username || '');
    setError(null);
    setIsEditing(false);
  };

  return (
    <>
      {/* Informations personnelles */}
      <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
          <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Informations personnelles
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {isEditing ? (
          <div className="grid gap-3 sm:gap-4">
            <EditableField
              label="Prénom"
              value={firstName}
              onChange={setFirstName}
              placeholder="Votre prénom"
            />
            <EditableField
              label="Nom"
              value={lastName}
              onChange={setLastName}
              placeholder="Votre nom"
            />
            <EditableField
              label="Nom d'utilisateur"
              value={username}
              onChange={setUsername}
              placeholder="Votre nom d'utilisateur"
              prefix="@"
            />
            <div className="flex gap-2 mt-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 sm:flex-none"
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Enregistrer
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
                className="flex-1 sm:flex-none"
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:gap-4">
              <InfoRow label="Prénom" value={user.firstName || '-'} />
              <InfoRow label="Nom" value={user.lastName || '-'} />
              <InfoRow label="Nom d'utilisateur" value={user.username ? `@${user.username}` : '-'} />
            </div>
            <Button variant="outline" className="mt-4 w-full sm:w-auto" onClick={() => setIsEditing(true)}>
              Modifier le profil
            </Button>
          </>
        )}
      </div>

      {/* Emails */}
      <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
          <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Adresses email
        </h2>
        <div className="space-y-2 sm:space-y-3">
          {user.emailAddresses.map((email: any) => (
            <div
              key={email.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-foreground text-sm sm:text-base truncate">{email.emailAddress}</span>
                {email.id === user.primaryEmailAddressId && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium shrink-0">
                    Principal
                  </span>
                )}
              </div>
              <div className="flex justify-end">
                {email.verification?.status === 'verified' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dernière connexion */}
      {lastSignIn && (
        <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Dernière connexion
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">{lastSignIn}</p>
        </div>
      )}
    </>
  );
}

// ============ SECURITY SECTION ============
function SecuritySection({
  user,
  session,
  sessions,
  setSessions,
  showBackupCodes,
  setShowBackupCodes
}: {
  user: any;
  session: any;
  sessions: any[];
  setSessions: (s: any[]) => void;
  showBackupCodes: boolean;
  setShowBackupCodes: (b: boolean) => void;
}) {
  const [revoking, setRevoking] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


  const revokeSession = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      const sessionToRevoke = sessions.find(s => s.id === sessionId);
      if (sessionToRevoke) {
        await sessionToRevoke.revoke();
        setSessions(sessions.filter(s => s.id !== sessionId));
      }
    } catch (error) {
      console.error('Erreur lors de la révocation:', error);
    }
    setRevoking(null);
  };

  return (
    <>
      <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
          <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          <span className="hidden sm:inline">Authentification à deux facteurs (2FA)</span>
          <span className="sm:hidden">2FA</span>
        </h2>

        <div className="space-y-3 sm:space-y-4">
          {/* TOTP */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                <Key className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground text-sm sm:text-base">Application d'authentification</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Google Authenticator, Authy, etc.</p>
              </div>
            </div>
            <div className="flex justify-end sm:justify-start">
              {user.twoFactorEnabled ? (
                <span className="flex items-center gap-1 text-green-500 text-sm font-medium">
                  <Check className="h-4 w-4" /> Activé
                </span>
              ) : (
                <Button size="sm" onClick={() => user.createTOTP()} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-1" /> Activer
                </Button>
              )}
            </div>
          </div>

          {/* Backup codes */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/30 shrink-0">
                <Key className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground text-sm sm:text-base">Codes de récupération</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Codes de secours en cas de perte</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowBackupCodes(!showBackupCodes)}
              className="w-full sm:w-auto"
            >
              {showBackupCodes ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              {showBackupCodes ? 'Masquer' : 'Afficher'}
            </Button>
          </div>

          {showBackupCodes && user.backupCodeEnabled && (
            <div className="p-3 sm:p-4 rounded-lg bg-muted border border-border">
              <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                Conservez ces codes en lieu sûr. Chaque code ne peut être utilisé qu'une seule fois.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {['••••••••', '••••••••', '••••••••', '••••••••'].map((code, i) => (
                  <code key={i} className="p-2 text-center bg-background rounded text-xs sm:text-sm font-mono">
                    {code}
                  </code>
                ))}
              </div>
              <Button size="sm" variant="outline" className="mt-3 w-full sm:w-auto">
                <RefreshCw className="h-4 w-4 mr-1" /> Régénérer
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Sessions actives */}
      <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
          <Monitor className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Sessions actives
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
          Gérez vos sessions connectées. Révoquez l'accès aux appareils que vous ne reconnaissez pas.
        </p>

        <div className="space-y-2 sm:space-y-3">
          {sessions.map((s) => {
            const isCurrentSession = s.id === session?.id;
            const lastActive = new Date(s.lastActiveAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={s.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg ${
                  isCurrentSession ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted shrink-0">
                    <Monitor className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      <p className="font-medium text-foreground text-sm sm:text-base">
                        {s.latestActivity?.browserName || 'Navigateur inconnu'}
                      </p>
                      {isCurrentSession && (
                        <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-primary/10 text-primary font-medium">
                          Actuelle
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {s.latestActivity?.deviceType || 'Appareil'} • {lastActive}
                    </p>
                  </div>
                </div>
                {!isCurrentSession && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 self-end sm:self-auto"
                    onClick={() => revokeSession(s.id)}
                    disabled={revoking === s.id}
                  >
                    {revoking === s.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            );
          })}

          {sessions.length === 0 && (
            <p className="text-center text-muted-foreground py-4 text-sm">
              Aucune session trouvée
            </p>
          )}
        </div>
      </div>

      {/* Historique d'activité */}
      <div className="p-4 sm:p-6 rounded-xl bg-card border border-border">
        <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          Historique d'activité
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
          Dernières activités de sécurité sur votre compte.
        </p>

        <div className="space-y-2 sm:space-y-3">
          <ActivityItem
            icon={<LogOut className="h-4 w-4" />}
            title="Connexion réussie"
            description="Depuis Chrome sur Windows"
            time="Aujourd'hui"
          />
          <ActivityItem
            icon={<Key className="h-4 w-4" />}
            title="Mot de passe modifié"
            description="Changement effectué"
            time="Il y a 3j"
          />
          <ActivityItem
            icon={<Mail className="h-4 w-4" />}
            title="Email vérifié"
            description={user.primaryEmailAddress?.emailAddress || ''}
            time="Il y a 1 sem"
          />
        </div>
      </div>

      {/* Zone danger */}
      <div className="p-4 sm:p-6 rounded-xl bg-destructive/5 border border-destructive/20">
        <h2 className="text-base sm:text-lg font-semibold text-destructive mb-3 sm:mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
          Zone dangereuse
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
          Ces actions sont irréversibles. Procédez avec prudence.
        </p>
        <Button
          variant="outline"
          className="border-destructive/30 text-destructive hover:bg-destructive/10 w-full sm:w-auto text-sm"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Supprimer le compte
        </Button>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <DeleteAccountModal
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}

// ============ HELPER COMPONENTS ============
function EditableField({
  label,
  value,
  onChange,
  placeholder,
  prefix
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  prefix?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-border last:border-0">
      <label className="text-muted-foreground text-sm">{label}</label>
      <div className="relative flex-1 sm:max-w-50">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            {prefix}
          </span>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            prefix ? 'pl-7' : ''
          }`}
        />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function ActivityItem({
  icon,
  title,
  description,
  time
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/50">
      <div className="p-1.5 sm:p-2 rounded-lg bg-muted shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-xs sm:text-sm">{title}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">{time}</span>
    </div>
  );
}

// ============ DELETE ACCOUNT MODAL ============
function DeleteAccountModal({
  onClose
}: {
  onClose: () => void;
}) {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expectedText = 'SUPPRIMER';
  const canDelete = confirmText === expectedText;

  const handleDelete = async () => {
    if (!canDelete) return;

    setIsDeleting(true);
    setError(null);

    try {
      // Appeler l'API backend pour supprimer le compte
      // L'utilisateur est déjà authentifié via Clerk, le backend vérifiera le token
      await apiClient.delete('/users/me');

      // Rediriger vers la page d'accueil après suppression
      window.location.href = '/';
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      setError(err?.response?.data?.message || err?.message || 'Erreur lors de la suppression du compte');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 p-6 bg-background rounded-2xl shadow-2xl border border-border">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Supprimer le compte</h2>
            <p className="text-sm text-muted-foreground">Cette action est irréversible</p>
          </div>
        </div>

        {/* Warning */}
        <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 mb-4">
          <p className="text-sm text-foreground mb-2">
            En supprimant votre compte, vous perdrez :
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Toutes vos données personnelles</li>
            <li>Votre historique et vos préférences</li>
            <li>L'accès à tous les services associés</li>
          </ul>
        </div>

        {/* Confirmation input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Pour confirmer, tapez <span className="font-bold text-destructive">{expectedText}</span> ci-dessous :
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={expectedText}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-destructive/50"
            autoFocus
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!canDelete || isDeleting}
            className="flex-1"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
