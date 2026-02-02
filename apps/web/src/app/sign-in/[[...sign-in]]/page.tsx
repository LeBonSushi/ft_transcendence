"use client";

import { useState, useCallback, useEffect } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { AuthLayout, StatItem } from "@/components/ui/auth";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Smartphone,
  KeyRound,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SignInStep = "credentials" | "two_factor";
type SecondFactorMode = "totp" | "backup_code";

// ---------------------------------------------------------------------------
// Error helper
// ---------------------------------------------------------------------------

function extractClerkError(err: unknown): string {
  const e = err as any;
  const raw =
    e?.errors?.[0]?.longMessage || e?.errors?.[0]?.message || "";

  const map: Record<string, string> = {
    "Identifier is invalid.": "Adresse email invalide.",
    "Password is incorrect. Try again, or use another method.":
      "Mot de passe incorrect.",
    "Couldn't find your account.":
      "Aucun compte trouvé avec cette adresse.",
    "Enter password.": "Veuillez entrer votre mot de passe.",
    "Passwords must be 8 characters or more.":
      "Le mot de passe doit contenir au moins 8 caractères.",
    "Verification code is incorrect.": "Code de vérification incorrect.",
    "Too many failed attempts. Please try again later.":
      "Trop de tentatives. Réessayez plus tard.",
  };

  for (const [eng, fr] of Object.entries(map)) {
    if (raw.includes(eng)) return fr;
  }

  return raw || "Une erreur est survenue. Veuillez réessayer.";
}

// ---------------------------------------------------------------------------
// Social icons (brand SVGs)
// ---------------------------------------------------------------------------

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

function SocialButtons({
  onSocial,
  loadingProvider,
  disabled,
}: {
  onSocial: (
    provider: "oauth_google" | "oauth_github" | "oauth_apple"
  ) => void;
  loadingProvider: string | null;
  disabled?: boolean;
}) {
  const providers = [
    { id: "oauth_google" as const, label: "Google", Icon: GoogleIcon },
    { id: "oauth_github" as const, label: "GitHub", Icon: GitHubIcon },
    { id: "oauth_apple" as const, label: "Apple", Icon: AppleIcon },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {providers.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onSocial(p.id)}
          disabled={disabled || loadingProvider !== null}
          className="h-12 bg-background/50 border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 font-medium rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {loadingProvider === p.id ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <p.Icon />
          )}
          <span className="hidden sm:inline text-sm">{p.label}</span>
        </button>
      ))}
    </div>
  );
}

function Divider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border/50" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-card px-4 text-sm text-muted-foreground">ou</span>
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

const STATS = [
  { value: "12k+", label: "Voyageurs actifs" },
  { value: "89", label: "Pays explorés" },
  { value: "4.9", label: "Note moyenne" },
];

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  // State
  const [step, setStep] = useState<SignInStep>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [secondFactorMode, setSecondFactorMode] =
    useState<SecondFactorMode>("totp");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // SSO callback: detect OAuth return
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!signIn || !isLoaded || !setActive) return;

    if (signIn.status === "complete" && signIn.createdSessionId) {
      setActive({ session: signIn.createdSessionId }).then(() =>
        router.push("/")
      );
    } else if (signIn.status === "needs_second_factor") {
      setStep("two_factor");
    }
  }, [signIn?.status, isLoaded]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleCredentialsSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!signIn || !setActive || !email.trim() || !password.trim()) return;

      setIsLoading(true);
      setError(null);

      try {
        await signIn.create({ identifier: email });

        const result = await signIn.attemptFirstFactor({
          strategy: "password",
          password,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.push("/");
        } else if (result.status === "needs_second_factor") {
          setStep("two_factor");
          setIsLoading(false);
        }
      } catch (err) {
        setError(extractClerkError(err));
        setIsLoading(false);
      }
    },
    [signIn, setActive, email, password, router]
  );

  const handleSocialSignIn = useCallback(
    async (
      provider: "oauth_google" | "oauth_github" | "oauth_apple"
    ) => {
      if (!signIn) return;
      setSocialLoading(provider);
      try {
        await signIn.authenticateWithRedirect({
          strategy: provider,
          redirectUrl: "/sign-in/sso-callback",
          redirectUrlComplete: "/",
        });
      } catch (err) {
        setError(extractClerkError(err));
        setSocialLoading(null);
      }
    },
    [signIn]
  );

  const handleTotpSubmit = useCallback(
    async (code: string) => {
      if (!signIn || !setActive || code.length !== 6) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await signIn.attemptSecondFactor({
          strategy: "totp",
          code,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.push("/");
        }
      } catch (err) {
        setError(extractClerkError(err));
        setOtpCode("");
        setIsLoading(false);
      }
    },
    [signIn, setActive, router]
  );

  const handleBackupCodeSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!signIn || !setActive || !backupCode.trim()) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await signIn.attemptSecondFactor({
          strategy: "backup_code",
          code: backupCode.trim(),
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.push("/");
        }
      } catch (err) {
        setError(extractClerkError(err));
        setBackupCode("");
        setIsLoading(false);
      }
    },
    [signIn, setActive, backupCode, router]
  );

  const handleOtpChange = useCallback(
    (value: string) => {
      setOtpCode(value);
      setError(null);
      if (value.length === 6 && !isLoading) {
        handleTotpSubmit(value);
      }
    },
    [isLoading, handleTotpSubmit]
  );

  // ---------------------------------------------------------------------------
  // Loading guard
  // ---------------------------------------------------------------------------

  if (!isLoaded) {
    return (
      <AuthLayout
        backgroundImage="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
        gradientOverlay="from-black/60 via-black/40 to-primary/30"
        tagline="Bienvenue"
        title={
          <>
            Vos plus belles
            <span className="block italic text-accent">aventures</span>
            commencent ici
          </>
        }
        description="Rejoignez une communauté de voyageurs passionnés et transformez vos rêves d'évasion en réalité."
        leftContent={
          <div className="flex gap-12">
            {STATS.map((stat) => (
              <StatItem
                key={stat.label}
                value={stat.value}
                label={stat.label}
              />
            ))}
          </div>
        }
        mobileTitle="Bon retour"
        mobileSubtitle="Connectez-vous pour continuer l'aventure"
        desktopTitle="Bon retour"
        desktopSubtitle="Connectez-vous pour accéder à vos voyages"
        footerText="Pas encore de compte ?"
        footerLinkText="Créer un compte"
        footerLinkHref="/sign-up"
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthLayout>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <AuthLayout
      backgroundImage="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
      gradientOverlay="from-black/60 via-black/40 to-primary/30"
      tagline="Bienvenue"
      title={
        <>
          Vos plus belles
          <span className="block italic text-accent">aventures</span>
          commencent ici
        </>
      }
      description="Rejoignez une communauté de voyageurs passionnés et transformez vos rêves d'évasion en réalité."
      leftContent={
        <div className="flex gap-12">
          {STATS.map((stat) => (
            <StatItem
              key={stat.label}
              value={stat.value}
              label={stat.label}
            />
          ))}
        </div>
      }
      mobileTitle="Bon retour"
      mobileSubtitle="Connectez-vous pour continuer l'aventure"
      desktopTitle="Bon retour"
      desktopSubtitle="Connectez-vous pour accéder à vos voyages"
      footerText="Pas encore de compte ?"
      footerLinkText="Créer un compte"
      footerLinkHref="/sign-up"
    >
      {/* ================================================================== */}
      {/* Step: credentials                                                  */}
      {/* ================================================================== */}
      {step === "credentials" && (
        <div>
          <SocialButtons
            onSocial={handleSocialSignIn}
            loadingProvider={socialLoading}
            disabled={isLoading}
          />

          <Divider />

          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            {error && <ErrorBanner message={error} />}

            <Input
              type="email"
              label="Adresse email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              disabled={isLoading}
              autoFocus
              placeholder="vous@exemple.com"
              autoComplete="email"
            />

            <Input
              type={showPassword ? "text" : "password"}
              label="Mot de passe"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              disabled={isLoading}
              placeholder="Entrez votre mot de passe"
              autoComplete="current-password"
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />

            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-primary font-medium hover:text-primary/80 transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>

            <div id="clerk-captcha" data-cl-theme="dark" data-cl-size="flexible" data-cl-language="fr-FR" />

            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim()}
              className="h-12 w-full text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all duration-300 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>
      )}

      {/* ================================================================== */}
      {/* Step: two_factor                                                   */}
      {/* ================================================================== */}
      {step === "two_factor" && (
        <div>
          {/* Back button */}
          <button
            type="button"
            onClick={() => {
              setStep("credentials");
              setOtpCode("");
              setBackupCode("");
              setError(null);
              setIsLoading(false);
              setSecondFactorMode("totp");
            }}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-primary/10">
              {secondFactorMode === "totp" ? (
                <Smartphone className="h-5 w-5 text-primary" />
              ) : (
                <KeyRound className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {secondFactorMode === "totp"
                  ? "Vérification en deux étapes"
                  : "Code de secours"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {secondFactorMode === "totp"
                  ? "Entrez le code de votre application d'authentification."
                  : "Entrez l'un de vos codes de secours."}
              </p>
            </div>
          </div>

          {error && <ErrorBanner message={error} />}

          {/* TOTP mode */}
          {secondFactorMode === "totp" && (
            <div className="mt-4">
              <div className="flex justify-center mb-4">
                <InputOTP
                  maxLength={6}
                  value={otpCode}
                  onChange={handleOtpChange}
                  autoFocus
                  pattern={REGEXP_ONLY_DIGITS}
                  disabled={isLoading}
                >
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

              <div className="text-center mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setSecondFactorMode("backup_code");
                    setOtpCode("");
                    setError(null);
                  }}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                >
                  Utiliser un code de secours
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleTotpSubmit(otpCode)}
                disabled={isLoading || otpCode.length !== 6}
                className="h-12 w-full text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all duration-300 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  "Vérifier"
                )}
              </button>
            </div>
          )}

          {/* Backup code mode */}
          {secondFactorMode === "backup_code" && (
            <form onSubmit={handleBackupCodeSubmit} className="mt-4 space-y-4">
              <Input
                type="text"
                label="Code de secours"
                value={backupCode}
                onChange={(e) => {
                  setBackupCode(e.target.value);
                  setError(null);
                }}
                disabled={isLoading}
                autoFocus
                placeholder="Entrez votre code de secours"
              />

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setSecondFactorMode("totp");
                    setBackupCode("");
                    setOtpCode("");
                    setError(null);
                  }}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                >
                  Utiliser le code d&apos;authentification
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || !backupCode.trim()}
                className="h-12 w-full text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all duration-300 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Vérification...
                  </>
                ) : (
                  "Vérifier"
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </AuthLayout>
  );
}
