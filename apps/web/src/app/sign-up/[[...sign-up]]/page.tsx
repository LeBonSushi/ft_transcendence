"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { AuthLayout, FeatureItem } from "@/components/ui/auth";
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
  Mail,
} from "lucide-react";


// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SignUpStep = "form" | "verify_email";

// ---------------------------------------------------------------------------
// Error helper
// ---------------------------------------------------------------------------

function extractClerkError(err: unknown): string {
  const e = err as any;
  const raw =
    e?.errors?.[0]?.longMessage || e?.errors?.[0]?.message || "";

  const map: Record<string, string> = {
    "That email address is taken.":
      "Cette adresse email est déjà utilisée.",
    "That username is taken.":
      "Ce nom d'utilisateur est déjà pris.",
    "Password has been found in an online data breach":
      "Ce mot de passe a été compromis. Choisissez-en un autre.",
    "Passwords must be 8 characters or more.":
      "Le mot de passe doit contenir au moins 8 caractères.",
    "Verification code is incorrect.":
      "Code de vérification incorrect.",
    "Too many failed attempts. Please try again later.":
      "Trop de tentatives. Réessayez plus tard.",
    "Enter email address.": "Veuillez entrer votre adresse email.",
    "Enter password.": "Veuillez entrer votre mot de passe.",
    "Enter first name.": "Veuillez entrer votre prénom.",
    "Enter last name.": "Veuillez entrer votre nom.",
    "Enter username.": "Veuillez entrer un nom d'utilisateur.",
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
    <div className="relative my-4">
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
// Features (left panel)
// ---------------------------------------------------------------------------

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    title: "Itinéraires sur mesure",
    description: "Créez des parcours personnalisés",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: "Planification collaborative",
    description: "Invitez vos proches",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: "Souvenirs partagés",
    description: "Gardez une trace de vos aventures",
  },
];

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function SignUpPage() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  // Form state
  const [step, setStep] = useState<SignUpStep>("form");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Verification state
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<NodeJS.Timeout | null>(null);

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // SSO callback: detect OAuth return
  // ---------------------------------------------------------------------------

  useEffect(() => {
    console.log("[sign-up] useEffect triggered", {
      isLoaded,
      signUpExists: !!signUp,
      status: signUp?.status,
      createdSessionId: signUp?.createdSessionId,
      unverifiedFields: signUp?.unverifiedFields,
      missingFields: signUp?.missingFields,
    });

    if (!signUp || !isLoaded || !setActive) return;

    if (signUp.status === "complete" && signUp.createdSessionId) {
      console.log("[sign-up] Status complete, activating session...");
      setActive({ session: signUp.createdSessionId }).then(() =>
        router.push("/")
      );
    } else if (
      signUp.status === "missing_requirements" &&
      signUp.unverifiedFields?.includes("email_address")
    ) {
      console.log("[sign-up] Missing requirements, switching to verify_email");
      setStep("verify_email");
    } else {
      console.log("[sign-up] No action taken for status:", signUp.status);
    }
  }, [signUp?.status, isLoaded]);

  // ---------------------------------------------------------------------------
  // Resend cooldown timer
  // ---------------------------------------------------------------------------

  const startCooldown = useCallback(() => {
    setResendCooldown(60);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!signUp) return;

      setIsLoading(true);
      setError(null);

      try {
        await signUp.create({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: username.trim(),
          emailAddress: email.trim(),
          password,
        });

        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });

        setStep("verify_email");
        startCooldown();
      } catch (err) {
        setError(extractClerkError(err));
      } finally {
        setIsLoading(false);
      }
    },
    [signUp, firstName, lastName, username, email, password, startCooldown]
  );

  const handleSocialSignUp = useCallback(
    async (
      provider: "oauth_google" | "oauth_github" | "oauth_apple"
    ) => {
      if (!signUp) return;
      setSocialLoading(provider);
      try {
        await signUp.authenticateWithRedirect({
          strategy: provider,
          redirectUrl: "/sign-up/sso-callback",
          redirectUrlComplete: "/",
        });
      } catch (err) {
        setError(extractClerkError(err));
        setSocialLoading(null);
      }
    },
    [signUp]
  );

  const handleVerifySubmit = useCallback(
    async (code: string) => {
      if (!signUp || !setActive || code.length !== 6) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await signUp.attemptEmailAddressVerification({
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
    [signUp, setActive, router]
  );

  const handleResendCode = useCallback(async () => {
    if (!signUp || resendCooldown > 0) return;

    setError(null);
    try {
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      startCooldown();
    } catch (err) {
      setError(extractClerkError(err));
    }
  }, [signUp, resendCooldown, startCooldown]);

  const handleOtpChange = useCallback(
    (value: string) => {
      setOtpCode(value);
      setError(null);
      if (value.length === 6 && !isLoading) {
        handleVerifySubmit(value);
      }
    },
    [isLoading, handleVerifySubmit]
  );

  // ---------------------------------------------------------------------------
  // Loading guard
  // ---------------------------------------------------------------------------

  const layoutProps = {
    backgroundImage:
      "https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=2070&auto=format&fit=crop",
    gradientOverlay: "from-black/60 via-black/40 to-accent/30" as const,
    tagline: "Nouveau membre",
    title: (
      <>
        Prêt à explorer
        <span className="block italic text-accent">le monde</span>
        avec nous ?
      </>
    ),
    description:
      "Créez votre compte en quelques secondes et commencez à planifier des voyages inoubliables.",
    leftContent: (
      <div className="space-y-4">
        {FEATURES.map((feature) => (
          <FeatureItem
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    ),
    mobileTitle: "Créer un compte",
    mobileSubtitle: "Rejoignez la communauté des voyageurs",
    desktopTitle: "Créer un compte",
    desktopSubtitle: "Rejoignez des milliers de voyageurs",
    footerText: "Déjà un compte ?",
    footerLinkText: "Se connecter",
    footerLinkHref: "/sign-in",
  };

  if (!isLoaded) {
    return (
      <AuthLayout {...layoutProps}>
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
    <AuthLayout {...layoutProps}>
      {/* ================================================================== */}
      {/* Step: form                                                         */}
      {/* ================================================================== */}
      {step === "form" && (
        <div>
          <SocialButtons
            onSocial={handleSocialSignUp}
            loadingProvider={socialLoading}
            disabled={isLoading}
          />

          <Divider />

          <form onSubmit={handleFormSubmit} className="space-y-3">
            {error && <ErrorBanner message={error} />}

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="text"
                label="Prénom"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setError(null);
                }}
                disabled={isLoading}
                placeholder="Jean"
                autoComplete="given-name"
              />
              <Input
                type="text"
                label="Nom"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setError(null);
                }}
                disabled={isLoading}
                placeholder="Dupont"
                autoComplete="family-name"
              />
            </div>

            <Input
              type="text"
              label="Nom d'utilisateur"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null);
              }}
              disabled={isLoading}
              placeholder="jeandupont"
              autoComplete="username"
              prefix={
                <span className="text-muted-foreground text-sm">@</span>
              }
            />

            <Input
              type="email"
              label="Adresse email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              disabled={isLoading}
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
              placeholder="8 caractères minimum"
              autoComplete="new-password"
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground flex justify-center hover:text-foreground transition-colors"
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

            <button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all duration-300 shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2 mt-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer mon compte"
              )}
            </button>
          </form>
        </div>
      )}

      {/* ================================================================== */}
      {/* Step: verify_email                                                 */}
      {/* ================================================================== */}
      {step === "verify_email" && (
        <div>
          {/* Back button */}
          <button
            type="button"
            onClick={() => {
              setStep("form");
              setOtpCode("");
              setError(null);
              setIsLoading(false);
            }}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-primary/10 shrink-0">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-foreground">
                Vérifiez votre email
              </h2>
              <p className="text-sm text-muted-foreground truncate">
                Un code a été envoyé à{" "}
                <span className="font-medium text-foreground">
                  {email}
                </span>
              </p>
            </div>
          </div>

          {error && <ErrorBanner message={error} />}

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
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
                className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
              >
                {resendCooldown > 0
                  ? `Renvoyer le code (${resendCooldown}s)`
                  : "Renvoyer le code"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleVerifySubmit(otpCode)}
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
        </div>
      )}
    </AuthLayout>
  );
}
