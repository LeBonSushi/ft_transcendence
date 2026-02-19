'use client';

import { useState, useRef, forwardRef } from "react";
import  QRCode from 'react-qr-code';
import { motion, AnimatePresence } from "motion/react";
import { signOut as nextAuthSignOut } from "next-auth/react";
import { useUserStore } from "@/stores/useUserStore";
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
  Pencil,
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
import { storageApi } from "@/lib/api";

// ============ PROFILE DROPDOWN ============
export function Profile() {
  const { user, isLoading } = useUserStore();
  const signOut = () => nextAuthSignOut();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownAlign, setDropdownAlign] = useState<'left' | 'right'>('right');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false), isOpen);

  const handleToggle = () => {
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceLeft = rect.left;
      const spaceRight = window.innerWidth - rect.right;
      // On mesure la vraie largeur du menu après le prochain rendu
      requestAnimationFrame(() => {
        const menuWidth = menuRef.current?.offsetWidth ?? 0;
        setDropdownAlign(spaceLeft >= menuWidth || spaceLeft >= spaceRight ? 'right' : 'left');
      });
    }
    setIsOpen(!isOpen);
  };

  if (isLoading || !user) {
    return <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />;
  }

  const createdAt = user.createdAt ? formatDate(new Date(user.createdAt)) : null;
  const displayName = user.profile?.firstName && user.profile?.lastName 
    ? `${user.profile.firstName} ${user.profile.lastName}`
    : user.profile?.firstName || user.username;

  return (
    <>
      {isSettingsOpen && (
        <ProfilePage onClose={() => setIsSettingsOpen(false)} />
      )}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={handleToggle}
          className="flex items-center gap-2 p-1.5 rounded-full hover:bg-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <Avatar
            src={user.profile?.profilePicture || ''}
            alt={displayName}
            fallback={user.profile?.firstName || user.email || 'U'}
            size="sm"
          />
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <ProfileDropdownMenu
            ref={menuRef}
            user={user}
            createdAt={createdAt}
            align={dropdownAlign}
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
  align: 'left' | 'right';
  onClose: () => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
}

const ProfileDropdownMenu = forwardRef<HTMLDivElement, ProfileDropdownMenuProps>(
  function ProfileDropdownMenu({ user, createdAt, align, onOpenSettings, onSignOut }, ref) {
    return (
      <div ref={ref} className={`absolute mt-2 w-72 rounded-xl border border-border bg-popover shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 ${align === 'right' ? 'right-0' : 'left-0'}`}>
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
          <DropdownItem icon={Settings} label="Paramètres" onClick={onOpenSettings} />
          <div className="my-2 border-t border-border" />
          <DropdownItem icon={LogOut} label="Se déconnecter" onClick={onSignOut} variant="destructive" />
        </div>
      </div>
    );
  }
);

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
  const { user, isLoading } = useUserStore();
  const signOut = () => nextAuthSignOut();

  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [openChangeProfilePicture, setOpenChangeProfilePicture] = useState(false);
  const profilePictureRef = useRef<HTMLDivElement>(null);

  useClickOutside(profilePictureRef, () => setOpenChangeProfilePicture(false), openChangeProfilePicture);

  const { sessions, currentSession, revoking, revokeSession } = useSessions({ user });

  if (isLoading || !user) {
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
      <div className="flex flex-row items-center gap-3 sm:gap-6 mb-6 sm:mb-8 p-3 sm:p-6 rounded-2xl bg-card border mt-8 sm:mt-0">
        <div className="relative shrink-0" ref={profilePictureRef}>
          <button className="flex relative cursor-pointer rounded-full"
            onClick={() => setOpenChangeProfilePicture(!openChangeProfilePicture)}
          >
            <Avatar
              src={user.profile?.profilePicture || ''}
              alt={user.username || 'Avatar'}
              fallback={user.profile?.firstName || user.email || 'U'}
              size="md"
              className="sm:hidden"
              ringColor="ring-primary/20"
            />
            <Avatar
              src={user.profile?.profilePicture || ''}
              alt={user.username || 'Avatar'}
              fallback={user.profile?.firstName || user.email || 'U'}
              size="lg"
              className="hidden sm:flex"
              ringColor="ring-primary/20"
            />
            <div className="flex absolute justify-center items-center gap-0.5 bg-popover border border-accent! px-1 py-0.5 sm:px-1.5 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-[-25%] bottom-0 rounded-md translate-y-1/3 text-xs sm:text-sm">
              <Pencil className="w-3 h-3 sm:w-4 sm:h-4"/>
              Edit
            </div>
          </button>
          <AnimatePresence>
            {openChangeProfilePicture && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute left-0 mt-2 w-36 sm:w-48 rounded-lg border border-border bg-popover shadow-lg z-50 overflow-hidden"
              >
                <button
                  className="w-full flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-foreground hover:bg-muted transition-colors"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/jpeg,image/png,image/webp,image/gif';
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (!file) return;

                      try {
                        await storageApi.uploadProfilePicture(file);
                        setOpenChangeProfilePicture(false);
                      } catch (err) {
                        console.error('Failed to upload profile picture:', err);
                      }
                    };
                    input.click();
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Upload a photo...
                </button>
                <div className="border-t border-border" />
                <button
                  className="w-full flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={async () => {
                    try {
                      await storageApi.removeProfilePicture();
                      setOpenChangeProfilePicture(false);
                    } catch (err) {
                      console.error('Failed to remove profile picture:', err);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove photo
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <h1 className="text-base sm:text-2xl font-bold text-foreground truncate">
            {user.profile?.firstName && user.profile?.lastName
              ? `${user.profile.firstName} ${user.profile.lastName}`
              : user.username || 'Utilisateur'}
          </h1>
          <p className="text-muted-foreground text-xs sm:text-base truncate">
            @{user.username || user.id?.slice(0, 8)}
          </p>
          {createdAt && (
            <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
              Membre depuis {createdAt}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => signOut()} className="shrink-0 sm:size-default">
          <LogOut className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Se déconnecter</span>
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

  return (
    <>
      <SectionCard title="Authentification à deux facteurs (2FA)" icon={Smartphone}>
        <div className="space-y-3 sm:space-y-4">
          <ListItem
            icon={<Key className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
            title="Application d'authentification"
            description="Google Authenticator, Authy, etc."
            action={
              <Button size="sm" onClick={() => {}}>
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
