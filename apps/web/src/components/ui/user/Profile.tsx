'use client';

import { useState, useRef } from "react";
import  QRCode from 'react-qr-code';
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
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
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Settings2,
  SunMedium,
  Moon,
  LaptopMinimal,
  ChevronUp,
  Section,
  MoonIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { SectionCard, InfoRow, ListItem } from "@/components/ui/card";
import { TabNavigation } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useClickOutside, useProfileEdit, useSessions, useDeleteAccount } from "@/hooks";
import { Separator } from "@radix-ui/react-separator";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useTheme } from "next-themes";

// ============ PROFILE DROPDOWN ============
export function Profile() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoaded = status !== "loading";
  const signOut = () => nextAuthSignOut();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);

  if (!isLoaded || !user) {
    return <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />;
  }

  const createdAt = user.createdAt ? formatDate(new Date(user.createdAt)) : null;
  const displayName = user.profile?.firstName && user.profile?.lastName 
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user.name || user.username;

  return (
    <>
      {isSettingsOpen && (
        <ProfilePage onClose={() => setIsSettingsOpen(false)} />
      )}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-1.5 rounded-full hover:bg-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <Avatar
            src={user.profile?.profilePicture || user.image || ''}
            alt={displayName}
            fallback={user.profile?.firstName || user.name || user.email || 'U'}
            size="sm"
          />
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <ProfileDropdownMenu
            user={user}
            createdAt={createdAt}
            onClose={() => setIsOpen(false)}
            onOpenSettings={() => {
              setIsSettingsOpen(true);
              setIsOpen(false);
            }}
            onSignOut={signOut}
          />
        )}
      </div>
    </>
  );
}

// ============ DROPDOWN MENU ============
interface ProfileDropdownMenuProps {
  user: any;
  createdAt: string | null;
  onClose: () => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
}

function ProfileDropdownMenu({ user, createdAt, onClose, onOpenSettings, onSignOut }: ProfileDropdownMenuProps) {
  return (
    <div className="absolute right-0 mt-2 w-72 rounded-xl border border-border bg-popover shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
      {/* Header */}
      <div className="p-4 bg-linear-to-br from-primary/10 to-accent/10 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar
            src={user.profile?.profilePicture || user.image || ''}
            alt={user.name || 'Avatar'}
            fallback={user.profile?.firstName || user.name || user.email || 'U'}
            size="md"
            ringColor="ring-primary/20"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {user.profile?.firstName && user.profile?.lastName
                ? `${user.profile.firstName} ${user.profile.lastName}`
                : user.name || 'Utilisateur'}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              @{user.username || user.id?.slice(0, 8)}
            </p>
          </div>
        </div>

      {/* User info */}
      <div className="p-3 space-y-1 border-b border-border">
        <div className="flex items-center gap-3 px-2 py-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4 shrink-0" />
          <span className="truncate">{user.email}</span>
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
          {/* <DropdownItem icon={User} label="Mon profil" onClick={onClose} /> */}
          <DropdownItem icon={Settings} label="Paramètres" onClick={onOpenSettings} />
          <div className="my-2 border-t border-border" />
          <DropdownItem icon={LogOut} label="Se déconnecter" onClick={onSignOut} variant="destructive" />
        </div>
      </div>
    </div>
  );
}

interface DropdownItemProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive';
}

function DropdownItem({ icon: Icon, label, onClick, variant = 'default' }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors ${
        variant === 'destructive'
          ? 'hover:bg-destructive/10 text-destructive'
          : 'hover:bg-accent text-foreground'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

// ============ PROFILE PAGE MODAL ============
type Tab = 'account' | 'security';

const TABS = [
  { id: 'account' as const, label: 'Compte', icon: User },
  { id: 'security' as const, label: 'Sécurité', icon: Shield },
];

export function ProfilePage({ onClose }: { onClose: () => void }) {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoaded = status !== "loading";
  const signOut = () => nextAuthSignOut();

  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const { sessions, currentSession, revoking, revokeSession } = useSessions({ user });

  if (!isLoaded || !user) {
    return (
      <Modal isOpen onClose={onClose} size="xl">
        <div className="flex items-center justify-center min-h-100">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Modal>
    );
  }
  const createdAt = user.createdAt ? formatDate(new Date(user.createdAt)) : null;
  const lastSignIn = null; // Would need to be stored separately if needed

  return (
    <Modal isOpen onClose={onClose} size="xl" className="p-4 sm:p-6 md:px-12 lg:px-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl bg-card border border-border mt-8 sm:mt-0">
        <Avatar
          src={user.profile?.profilePicture || user.image || ''}
          alt={user.name || 'Avatar'}
          fallback={user.profile?.firstName || user.name || user.email || 'U'}
          size="lg"
          ringColor="ring-primary/20"
        />
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {user.profile?.firstName && user.profile?.lastName
              ? `${user.profile.firstName} ${user.profile.lastName}`
              : user.name || 'Utilisateur'}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            @{user.username || user.id?.slice(0, 8)}
          </p>
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

      {/* Tabs */}
      <TabNavigation
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as Tab)}
      />


      {/* Content */}
      <div className="space-y-4 sm:space-y-6 pb-6">
        {activeTab === 'account' && (
          <AccountSection user={user} lastSignIn={lastSignIn} />
        )}
        {activeTab === 'security' && (
          <SecuritySection
            user={user}
            session={currentSession}
            sessions={sessions}
            revoking={revoking}
            revokeSession={revokeSession}
            showBackupCodes={showBackupCodes}
            setShowBackupCodes={setShowBackupCodes}
          />
        )}
      </div>
    </Modal>
  );
}

// ============ ACCOUNT SECTION ============
function AccountSection({ user, lastSignIn }: { user: any; lastSignIn: string | null }) {
  const {
    isEditing,
    isSaving,
    error,
    formData,
    setFormData,
    startEditing,
    handleSave,
    handleCancel,
  } = useProfileEdit({ user });

  const { theme, themes, setTheme } = useTheme();
  const themeProps = [
    { type: "light", name: "Clair", icon: SunMedium },
    { type: "dark", name: "Sombre", icon: MoonIcon },
    { type: "system", name: "Systeme", icon: LaptopMinimal },
  ]

  const themeSelectRef = useRef(null);
  const [themeSelectOpen, setThemeSelectOpen] = useState(false);

  useClickOutside(themeSelectRef, () => setThemeSelectOpen(false), themeSelectOpen);

  return (
    <>
      <SectionCard title="Informations personnelles" icon={User}>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            <Input
              label="Prénom"
              value={formData.firstName}
              onChange={(e) => setFormData.firstName(e.target.value)}
              placeholder="Votre prénom"
            />
            <Input
              label="Nom"
              value={formData.lastName}
              onChange={(e) => setFormData.lastName(e.target.value)}
              placeholder="Votre nom"
            />
            <Input
              label="Nom d'utilisateur"
              value={formData.username}
              onChange={(e) => setFormData.username(e.target.value)}
              placeholder="Votre nom d'utilisateur"
              prefix="@"
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave} disabled={isSaving} className="flex-1 sm:flex-none">
                {isSaving ? <RefreshCw className="h-4 w-4 animate-spin mr-2 hidden sm:inline" /> : <Check className="h-4 w-4 mr-2 hidden sm:inline" />}
                Enregistrer
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="flex-1 sm:flex-none">
                <X className="h-4 w-4 mr-2 hidden sm:inline" />
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <InfoRow label="Prénom" value={user.profile?.firstName || '-'} />
              <InfoRow label="Nom" value={user.profile?.lastName || '-'} />
              <InfoRow label="Nom d'utilisateur" value={user.username ? `@${user.username}` : '-'} />
            </div>
            <Button variant="outline" className="mt-4 w-full sm:w-auto" onClick={startEditing}>
              Modifier le profil
            </Button>
          </>
        )}
      </SectionCard>

      <SectionCard title="Adresse email" icon={Mail}>
        <div className="p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-foreground text-sm sm:text-base truncate">{user.email}</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Apparence" icon={Settings2}>
        <div className="grid grid-cols-3 gap-3">
          {themeProps.map((t) => {
            const isActive = theme === t.type;
            const Icon = t.icon;
            return (
              <button
                key={t.type}
                onClick={() => setTheme(t.type)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{t.name}</span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {lastSignIn && (
        <SectionCard title="Dernière connexion" icon={Clock}>
          <p className="text-muted-foreground text-sm sm:text-base">{lastSignIn}</p>
        </SectionCard>
      )}
    </>
  );
}

function TwoFaVerif({
  qrCodeUri,
  secret,
  onClose,
  onSuccess
}: {
  qrCodeUri: string;
  secret: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (codeToVerify: string) => {
    if (codeToVerify.length !== 6) return;

    setIsVerifying(true);
    setError(null);

    try {
      // TODO: Verify TOTP with your auth system
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || 'Code invalide. Veuillez réessayer.');
      setCode('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setError(null);

    if (newCode.length === 6 && !isVerifying) {
      handleVerify(newCode);
    }
  };

  return (
    <Modal isOpen onClose={onClose} size="sm" showCloseButton={false}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-primary/10">
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Activer la 2FA</h2>
            <p className="text-sm text-muted-foreground">Scannez le QR code avec votre app</p>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center p-4 bg-white rounded-lg mb-4">
          <QRCode size={180} value={qrCodeUri} />
        </div>

        {/* Secret manuel */}
        <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground mb-1">Ou entrez ce code manuellement :</p>
          <code className="text-sm font-mono text-foreground break-all">{secret}</code>
        </div>

        {/* Code input */}
        <div className="flex flex-col items-center m-8">
          <h1 className="block text-sm font-medium text-foreground mb-2">
            Entrez le code à 6 chiffres de votre app :
          </h1>

          <InputOTP
            maxLength={6}
            value={code}
            onChange={handleCodeChange}
            autoFocus
            pattern={REGEXP_ONLY_DIGITS}
            disabled={isVerifying}
            className="text-center text-lg tracking-widest font-mono">
            <InputOTPGroup>
              <InputOTPSlot index={0}/>
              <InputOTPSlot index={1}/>
              <InputOTPSlot index={2}/>
              <InputOTPSlot index={3}/>
              <InputOTPSlot index={4}/>
              <InputOTPSlot index={5}/>
            </InputOTPGroup>
          </InputOTP>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={isVerifying} className="flex-1">
            Annuler
          </Button>
          <Button
            onClick={() => handleVerify(code)}
            disabled={code.length !== 6 || isVerifying}
            className="flex-1"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                Vérification...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Activer
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ============ SECURITY SECTION ============
function SecuritySection({
  user,
  session,
  sessions,
  revoking,
  revokeSession,
  showBackupCodes,
  setShowBackupCodes
}: {
  user: any;
  session: any;
  sessions: any[];
  revoking: string | null;
  revokeSession: (sessionId: string) => Promise<void>;
  showBackupCodes: boolean;
  setShowBackupCodes: (b: boolean) => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isEnabling2FA, setisEnabling2FA] = useState<boolean>(false);
  const [totpData, setTotpData] = useState<{ uri: string; secret: string } | null>(null);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);

  const handleEnable2FA = async () => {
    // TODO: Implement 2FA enable with your auth system
  }

  const handleDisable2FA = async () => {
    // TODO: Implement 2FA disable with your auth system
  };

  return (
    <>
      {isEnabling2FA && totpData && (
        <TwoFaVerif
          qrCodeUri={totpData.uri}
          secret={totpData.secret}
          onClose={() => {
            setisEnabling2FA(false);
            setTotpData(null);
          }}
          onSuccess={() => {
          }}
        />
      )}

      <SectionCard title="Authentification à deux facteurs (2FA)" icon={Smartphone}>
        <div className="space-y-3 sm:space-y-4">
          <ListItem
            icon={<Key className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
            title="Application d'authentification"
            description="Google Authenticator, Authy, etc."
            action={
              <Button size="sm" onClick={() => {handleEnable2FA()}}>
                <Plus className="h-4 w-4 mr-1" /> Activer
              </Button>
            }
          />

          <ListItem
            icon={<Key className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />}
            title="Codes de récupération"
            description="Codes de secours en cas de perte"
            action={
              <Button size="sm" variant="outline" onClick={() => {}} disabled={isLoadingCodes}>
                {isLoadingCodes ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                ) : showBackupCodes ? (
                  <EyeOff className="h-4 w-4 mr-1" />
                ) : (
                  <Eye className="h-4 w-4 mr-1" />
                )}
                {isLoadingCodes ? 'Chargement...' : showBackupCodes ? 'Quitter' : 'Générer'}
              </Button>
            }
          />
        </div>
      </SectionCard>

      {showBackupCodes && (
        <div className="p-3 sm:p-4 rounded-lg bg-muted border border-border">
          <p className="text-xs sm:text-sm text-muted-foreground mb-3">
            TODO: Implement backup codes with your auth system.
          </p>
        </div>
      )}
    </>
  );
}

// ============ HELPER COMPONENTS ============
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
function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const expectedText = 'SUPPRIMER';
  const { canDelete, confirmText, setConfirmText, error, handleDelete, isDeleting } = useDeleteAccount({ expectedText });

  return (
    <Modal isOpen onClose={onClose} size="sm" showCloseButton={false} overlayClassName="bg-black/60">
      <div className="p-6">
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
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={expectedText}
            autoFocus
          />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} disabled={isDeleting} className="flex-1">
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
    </Modal>
  );
}
