'use client';

import { useState, useRef, forwardRef, useEffect } from "react";
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
  LaptopMinimal,
  MoonIcon,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { SectionCard, InfoRow, ListItem } from "@/components/ui/card";
import { TabNavigation } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useClickOutside, useProfileEdit, useSessions, useDeleteAccount } from "@/hooks";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useTheme } from "next-themes";
import { storageApi } from "@/lib/api";
import { apiClient } from "@/lib/api/client";

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
            src={user.profile?.profilePicture || null}
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
              src={user.profile?.profilePicture || null}
              alt={user.name || 'Avatar'}
              fallback={user.profile?.firstName || user.name || user.email || 'U'}
              size="md"
              ringColor="ring-primary/20"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {user.profile?.firstName && user.profile?.lastName
                  ? `${user.profile.firstName} ${user.profile.lastName}`
                  : user.username || 'User'}
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
              <span>Member since {createdAt}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-2">
          <DropdownItem icon={Settings} label="Settings" onClick={onOpenSettings} />
          <div className="my-2 border-t border-border" />
          <DropdownItem icon={LogOut} label="Logout" onClick={onSignOut} variant="destructive" />
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
  { id: 'account' as const, label: 'account', icon: User },
  { id: 'security' as const, label: 'security', icon: Shield },
];

export function ProfilePage({ onClose }: { onClose: () => void }) {
  const { user, isLoading } = useUserStore();
  const signOut = () => nextAuthSignOut();

  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [openChangeProfilePicture, setOpenChangeProfilePicture] = useState(false);
  const [profilePictureError, setProfilePictureError] = useState<string | null>(null);
  const [profilePictureSuccess, setProfilePictureSuccess] = useState<string | null>(null);
  const profilePictureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profilePictureError)
      return;

    const timeoutId = window.setTimeout(() => {
      setProfilePictureError(null);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [profilePictureError]);

  useEffect(() => {
    if (!profilePictureSuccess)
      return;

    const timeoutId = window.setTimeout(() => {
      setProfilePictureSuccess(null);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [profilePictureSuccess]);

  const getProfilePictureErrorMessage = (error: unknown) => {
    const status = (error as { response?: { status?: number } })?.response?.status;
    const responseMessage = (error as { response?: { data?: { message?: string | string[] } } })
      ?.response?.data?.message;

    if (status === 400) {
      if (Array.isArray(responseMessage)) {
        const hasFileSizeMessage = responseMessage.some((message) =>
          message.toLowerCase().includes('file') && message.toLowerCase().includes('size')
        );
        if (hasFileSizeMessage)
          return 'Image is too large. Please choose a smaller file.';
      }

      if (typeof responseMessage === 'string') {
        const normalizedMessage = responseMessage.toLowerCase();
        if (normalizedMessage.includes('file') && normalizedMessage.includes('size')) {
          return 'Image is too large. Please choose a smaller file.';
        }
      }
    }

    if (status === 413) {
      return 'Image is too large. Please choose a smaller file.';
    }

    return 'Unable to update profile picture. Please try again.';
  };

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
              src={user.profile?.profilePicture || null}
              alt={user.username || 'Avatar'}
              fallback={user.profile?.firstName || user.email || 'U'}
              size="md"
              className="sm:hidden"
              ringColor="ring-primary/20"
            />
            <Avatar
              src={user.profile?.profilePicture || null}
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
                    setProfilePictureError(null);
                    setProfilePictureSuccess(null);
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/jpeg,image/png,image/webp,image/gif';
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (!file)
                        return;

                      try {
                        await storageApi.uploadProfilePicture(file);
                        setProfilePictureSuccess('Profile picture updated.');
                        setOpenChangeProfilePicture(false);
                      } catch (err) {
                        setProfilePictureError(getProfilePictureErrorMessage(err));
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
                    setProfilePictureError(null);
                    setProfilePictureSuccess(null);
                    try {
                      await storageApi.removeProfilePicture();
                      setProfilePictureSuccess('Profile picture removed.');
                      setOpenChangeProfilePicture(false);
                    } catch (err) {
                      setProfilePictureError(getProfilePictureErrorMessage(err));
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
          {profilePictureError && (
            <div className="mb-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs sm:text-sm">
              {profilePictureError}
            </div>
          )}
          {profilePictureSuccess && (
            <div className="mb-2 p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm">
              {profilePictureSuccess}
            </div>
          )}
          <h1 className="text-base sm:text-2xl font-bold text-foreground truncate">
            {user.profile?.firstName && user.profile?.lastName
              ? `${user.profile.firstName} ${user.profile.lastName}`
              : user.username || 'User'}
          </h1>
          <p className="text-muted-foreground text-xs sm:text-base truncate">
            @{user.username || user.id?.slice(0, 8)}
          </p>
          {createdAt && (
            <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
              Member since {createdAt}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => signOut()} className="shrink-0 sm:size-default">
          <LogOut className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Log out</span>
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
    warning,
    formData,
    setFormData,
    startEditing,
    handleSave,
    handleCancel,
  } = useProfileEdit({ user });

  const { theme, themes, setTheme } = useTheme();
  const themeProps = [
    { type: "light", name: "light", icon: SunMedium },
    { type: "dark", name: "dark", icon: MoonIcon },
    { type: "system", name: "system", icon: LaptopMinimal },
  ]

  const themeSelectRef = useRef(null);
  const [themeSelectOpen, setThemeSelectOpen] = useState(false);

  useClickOutside(themeSelectRef, () => setThemeSelectOpen(false), themeSelectOpen);



  return (
    <>
      <SectionCard title="Personal informations" icon={User}>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm whitespace-pre-line">
            {error}
          </div>
        )}
        {warning && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-sm whitespace-pre-line">
            {warning}
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            <Input
              label="First name"
              value={formData.firstName}
              onChange={(e) => setFormData.firstName(e.target.value)}
              placeholder="Your first name"
            />
            <Input
              label="Last name"
              value={formData.lastName}
              onChange={(e) => setFormData.lastName(e.target.value)}
              placeholder="Your lirst name"
            />
            <Input
              label="Username"
              value={formData.username}
              onChange={(e) => setFormData.username(e.target.value)}
              placeholder="Your username"
              prefix="@"
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData.email(e.target.value)}
              placeholder="Your email"
            />
            <Input
              label="New password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData.password(e.target.value)}
              placeholder="Leave empty to keep your current password"
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave} disabled={isSaving} className="flex-1 sm:flex-none">
                {isSaving ? <RefreshCw className="h-4 w-4 animate-spin mr-2 hidden sm:inline" /> : <Check className="h-4 w-4 mr-2 hidden sm:inline" />}
                Save
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="flex-1 sm:flex-none">
                <X className="h-4 w-4 mr-2 hidden sm:inline" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <InfoRow label="First name" value={user.profile?.firstName || '-'} />
              <InfoRow label="Last name" value={user.profile?.lastName || '-'} />
              <InfoRow label="Username" value={user.username ? `@${user.username}` : '-'} />
              <InfoRow label="Email" value={user.email || '-'} />
            </div>
            <Button variant="outline" className="mt-4 w-full sm:w-auto" onClick={startEditing}>
              Update profile
            </Button>
          </>
        )}
      </SectionCard>

      <SectionCard title="Appearence" icon={Settings2}>
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
        <SectionCard title="Last connection" icon={Clock}>
          <p className="text-muted-foreground text-sm sm:text-base">{lastSignIn}</p>
        </SectionCard>
      )}
    </>
  );
}


// ============ SECURITY SECTION ============
function SecuritySection({
  user,
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
  const [isEnabling2FA, setIsEnabling2FA] = useState<boolean>(false);
  const [totpData, setTotpData] = useState<{ uri: string; secret: string } | null>(null);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const { updateUser } = useUserStore();

  // 1. Appelle le backend pour générer le secret + URI Fdu QR code
  const handleGenerate = async () => {
    try {
      setError('');
      const data = await apiClient.post<{ secret: string; uri: string }>('/auth/2fa/generate');
      setTotpData(data);
      setIsEnabling2FA(true);
    } catch (err) {
      setError('Error while generating QR code');
    }
  };

  // 2. Envoie le premier code pour activer le 2FA
  const handleEnable = async () => {
    try {
      setError('');
      const data = await apiClient.post<{ backupCodes: string[] }>('/auth/2fa/enable', { code: otpCode });
      setBackupCodes(data.backupCodes);
      setIsEnabling2FA(false);
      setTotpData(null);
      setOtpCode('');
      setShowBackupCodes(true);
      updateUser({ twoFactorEnabled: true });
    } catch (err) {
      setError('Invalid code, retry');
    }
  };

  // 3. Désactive le 2FA
  const handleDisable = async () => {
    try {
      setError('');
      await apiClient.post('/auth/2fa/disable', { code: otpCode });
      setIsDisabling2FA(false);
      setOtpCode('');
      setBackupCodes([]);
      updateUser({ twoFactorEnabled: false });
    } catch (err) {
      setError('Invalid code, retry');
    }
  };

  return (
    <>
      <SectionCard title="Two-factor authentication (2FA)" icon={Smartphone}>
        <div className="space-y-3 sm:space-y-4">

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          {/* État normal : bouton Activer ou Désactiver */}
          {!isEnabling2FA && !isDisabling2FA && (
            <ListItem
              icon={<Key className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
              title="Authentication application"
              description="Google Authenticator, Authy, etc."
              action={
                user.twoFactorEnabled ? (
                  <Button size="sm" variant="destructive" onClick={() => setIsDisabling2FA(true)}>
                    Disable
                  </Button>
                ) : (
                  <Button size="sm" onClick={handleGenerate}>
                    <Plus className="h-4 w-4 mr-1" /> Enable
                  </Button>
                )
              }
            />
          )}

          {/* Étape d'activation : QR code + saisie du code */}
          {isEnabling2FA && totpData && (
            <div className="space-y-4 p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm font-medium">
                1. Scan this QR code with your authentication application:
              </p>
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <QRCode value={totpData.uri} size={200} />
              </div>
              <p className="text-xs text-muted-foreground text-center break-all">
                Manual key : {totpData.secret}
              </p>
              <p className="text-sm font-medium">
                2. Enter the 6-digit code displayed in the app:
              </p>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} pattern={REGEXP_ONLY_DIGITS}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEnable} disabled={otpCode.length !== 6} className="flex-1">
                  <Check className="h-4 w-4 mr-1" /> Confirmer
                </Button>
                <Button variant="outline" onClick={() => { setIsEnabling2FA(false); setTotpData(null); setOtpCode(''); setError(''); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Étape de désactivation : saisie du code */}
          {isDisabling2FA && (
            <div className="space-y-4 p-4 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm font-medium">
                Enter a 2FA code to confirm deactivation:
              </p>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} pattern={REGEXP_ONLY_DIGITS}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleDisable} disabled={otpCode.length !== 6} className="flex-1">
                  Disable 2FA
                </Button>
                <Button variant="outline" onClick={() => { setIsDisabling2FA(false); setOtpCode(''); setError(''); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Backup codes */}
          <ListItem
            icon={<Key className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />}
            title="Recovery codes"
            description="Emergency codes in case of loss"
            action={
              <Button size="sm" variant="outline" onClick={() => setShowBackupCodes(!showBackupCodes)} disabled={backupCodes.length === 0}>
                {showBackupCodes ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                {showBackupCodes ? 'Hide' : 'Show'}
              </Button>
            }
          />
        </div>
      </SectionCard>

      {/* Affichage des backup codes */}
      {showBackupCodes && backupCodes.length > 0 && (
        <div className="p-3 sm:p-4 rounded-lg bg-muted border border-border">
          <p className="text-xs sm:text-sm text-muted-foreground mb-3">
            Keep these codes in a safe place. Each code can only be used once.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((code, i) => (
              <code key={i} className="p-2 bg-background rounded text-center text-sm font-mono border">
                {code}
              </code>
            ))}
          </div>
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
            <h2 className="text-lg font-semibold text-foreground">Delete account</h2>
            <p className="text-sm text-muted-foreground">This action is irreversible</p>
          </div>
        </div>

        {/* Warning */}
        <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 mb-4">
          <p className="text-sm text-foreground mb-2">
            By deleting your account you will lose:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>All your personal data</li>
            <li>Your history and preferences</li>
            <li>Access to all associated services</li>
          </ul>
        </div>

        {/* Confirmation input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">
           To confirm, wrote <span className="font-bold text-destructive">{expectedText}</span> below :
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
            Cancel
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
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
