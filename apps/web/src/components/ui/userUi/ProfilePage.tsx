'use client';

import { useUser, useClerk, useSession } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import {
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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Tab = 'account' | 'security';

export function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [sessions, setSessions] = useState<any[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  useEffect(() => {
    if (user) {
      // Récupérer les sessions actives
      user.getSessions().then(setSessions);
    }
  }, [user]);

  if (!isLoaded || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
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
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-6 mb-8 p-6 rounded-2xl bg-card border border-border">
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={user.fullName || 'Avatar'}
            className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/20"
          />
        ) : (
          <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
            {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress?.charAt(0)?.toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            {user.fullName || user.firstName || 'Utilisateur'}
          </h1>
          <p className="text-muted-foreground">@{user.username || user.id.slice(0, 8)}</p>
          {createdAt && (
            <p className="text-sm text-muted-foreground mt-1">
              Membre depuis {createdAt}
            </p>
          )}
        </div>
        <Button variant="outline" onClick={() => signOut()}>
          <LogOut className="h-4 w-4 mr-2" />
          Se déconnecter
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('account')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
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
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
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
      <div className="space-y-6">
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
  );
}

// ============ ACCOUNT SECTION ============
function AccountSection({ user, lastSignIn }: { user: any; lastSignIn: string | null }) {
  return (
    <>
      {/* Informations personnelles */}
      <div className="p-6 rounded-xl bg-card border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Informations personnelles
        </h2>
        <div className="grid gap-4">
          <InfoRow label="Prénom" value={user.firstName || '-'} />
          <InfoRow label="Nom" value={user.lastName || '-'} />
          <InfoRow label="Nom d'utilisateur" value={user.username ? `@${user.username}` : '-'} />
        </div>
        <Button variant="outline" className="mt-4" onClick={() => user.update({})}>
          Modifier le profil
        </Button>
      </div>

      {/* Emails */}
      <div className="p-6 rounded-xl bg-card border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Adresses email
        </h2>
        <div className="space-y-3">
          {user.emailAddresses.map((email: any) => (
            <div
              key={email.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{email.emailAddress}</span>
                {email.id === user.primaryEmailAddressId && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">
                    Principal
                  </span>
                )}
              </div>
              {email.verification?.status === 'verified' ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dernière connexion */}
      {lastSignIn && (
        <div className="p-6 rounded-xl bg-card border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Dernière connexion
          </h2>
          <p className="text-muted-foreground">{lastSignIn}</p>
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
      {/* 2FA */}
      <div className="p-6 rounded-xl bg-card border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-primary" />
          Authentification à deux facteurs (2FA)
        </h2>

        <div className="space-y-4">
          {/* TOTP */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Application d'authentification</p>
                <p className="text-sm text-muted-foreground">Google Authenticator, Authy, etc.</p>
              </div>
            </div>
            {user.twoFactorEnabled ? (
              <span className="flex items-center gap-1 text-green-500 text-sm font-medium">
                <Check className="h-4 w-4" /> Activé
              </span>
            ) : (
              <Button size="sm" onClick={() => user.createTOTP()}>
                <Plus className="h-4 w-4 mr-1" /> Activer
              </Button>
            )}
          </div>

          {/* Backup codes */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/30">
                <Key className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">Codes de récupération</p>
                <p className="text-sm text-muted-foreground">Codes de secours en cas de perte de 2FA</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowBackupCodes(!showBackupCodes)}
            >
              {showBackupCodes ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              {showBackupCodes ? 'Masquer' : 'Afficher'}
            </Button>
          </div>

          {showBackupCodes && user.backupCodeEnabled && (
            <div className="p-4 rounded-lg bg-muted border border-border">
              <p className="text-sm text-muted-foreground mb-3">
                Conservez ces codes en lieu sûr. Chaque code ne peut être utilisé qu'une seule fois.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {/* Placeholder - les vrais codes viennent de Clerk */}
                {['••••••••', '••••••••', '••••••••', '••••••••'].map((code, i) => (
                  <code key={i} className="p-2 text-center bg-background rounded text-sm font-mono">
                    {code}
                  </code>
                ))}
              </div>
              <Button size="sm" variant="outline" className="mt-3">
                <RefreshCw className="h-4 w-4 mr-1" /> Régénérer les codes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Sessions actives */}
      <div className="p-6 rounded-xl bg-card border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Monitor className="h-5 w-5 text-primary" />
          Sessions actives
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Gérez vos sessions connectées. Révoquez l'accès aux appareils que vous ne reconnaissez pas.
        </p>

        <div className="space-y-3">
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
                className={`flex items-center justify-between p-4 rounded-lg ${
                  isCurrentSession ? 'bg-primary/5 border border-primary/20' : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Monitor className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">
                        {s.latestActivity?.browserName || 'Navigateur inconnu'}
                      </p>
                      {isCurrentSession && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">
                          Session actuelle
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {s.latestActivity?.deviceType || 'Appareil'} • Actif {lastActive}
                    </p>
                  </div>
                </div>
                {!isCurrentSession && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
            <p className="text-center text-muted-foreground py-4">
              Aucune session trouvée
            </p>
          )}
        </div>
      </div>

      {/* Historique d'activité */}
      <div className="p-6 rounded-xl bg-card border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Historique d'activité
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Dernières activités de sécurité sur votre compte.
        </p>

        <div className="space-y-3">
          <ActivityItem
            icon={<LogOut className="h-4 w-4" />}
            title="Connexion réussie"
            description="Depuis Chrome sur Windows"
            time="Aujourd'hui, 14:32"
          />
          <ActivityItem
            icon={<Key className="h-4 w-4" />}
            title="Mot de passe modifié"
            description="Changement effectué avec succès"
            time="Il y a 3 jours"
          />
          <ActivityItem
            icon={<Mail className="h-4 w-4" />}
            title="Email vérifié"
            description={user.primaryEmailAddress?.emailAddress || ''}
            time="Il y a 1 semaine"
          />
        </div>
      </div>

      {/* Zone danger */}
      <div className="p-6 rounded-xl bg-destructive/5 border border-destructive/20">
        <h2 className="text-lg font-semibold text-destructive mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Zone dangereuse
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Ces actions sont irréversibles. Procédez avec prudence.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer le compte
          </Button>
        </div>
      </div>
    </>
  );
}

// ============ HELPER COMPONENTS ============
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
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className="p-2 rounded-lg bg-muted">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <span className="text-xs text-muted-foreground">{time}</span>
    </div>
  );
}
