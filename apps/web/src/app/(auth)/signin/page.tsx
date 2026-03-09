"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/ui/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Github, Mail } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // état pour le 2FA
  const [requires2FA, setRequires2FA] = useState(false);
  const [totpCode, setTotpCode] = useState("");

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Si on n'est pas encore à l'étape 2FA, on vérifie d'abord les credentials directement
      if (!requires2FA) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          setError("Email ou mot de passe incorrect");
          setLoading(false);
          return;
        }

        const data = await response.json();

        // Le backend demande un code 2FA
        if (data.requiresTwoFactor) {
          setRequires2FA(true);
          setLoading(false);
          return;
        }
      }

      // Login complet via NextAuth (avec ou sans TOTP)
      const result = await signIn("credentials", {
        email,
        password,
        totpCode: totpCode || undefined,
        redirect: false,
      });

      if (result?.error) {
        setError(requires2FA ? "Code 2FA invalide" : "Email ou mot de passe incorrect");
        setTotpCode("");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setLoading(true);
    await signIn(provider, { callbackUrl: "/" });
  };

  return (
    <AuthLayout
      backgroundImage="/images/auth-bg.jpg"
      tagline="Explorez le monde"
      title={
        <>
          Bienvenue sur <span className="text-primary">TRANSv2</span>
        </>
      }
      description="Planifiez vos voyages, partagez vos expériences et découvrez de nouvelles destinations avec notre communauté."
      mobileTitle="Connexion"
      mobileSubtitle="Accédez à votre compte"
      desktopTitle="Bon retour parmi nous !"
      desktopSubtitle="Connectez-vous pour continuer votre aventure"
      footerText="Pas encore de compte ?"
      footerLinkText="Créer un compte"
      footerLinkHref="/signup"
    >
      <div className="space-y-6">
        {/* OAuth Buttons — cachés si on est à l'étape 2FA */}
        {!requires2FA && (
          <>
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                onClick={() => handleOAuthSignIn("google")}
                disabled={loading}
                className="w-full"
              >
                <Mail className="mr-2 h-4 w-4" />
                Continuer avec Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuthSignIn("github")}
                disabled={loading}
                className="w-full"
              >
                <Github className="mr-2 h-4 w-4" />
                Continuer avec GitHub
              </Button>
            </div>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                Ou avec email
              </span>
            </div>
          </>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleCredentialsSignIn} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          {/* Étape 1 : Email + Password (caché si 2FA demandé) */}
          {!requires2FA && (
            <>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Mot de passe
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}

          {/* Étape 2 : Code 2FA */}
          {requires2FA && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-lg font-semibold">Vérification 2FA</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Entrez le code à 6 chiffres de votre application d'authentification
                </p>
              </div>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={totpCode} onChange={setTotpCode} pattern={REGEXP_ONLY_DIGITS}>
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
              <p className="text-xs text-muted-foreground text-center">
                Vous pouvez aussi utiliser un code de récupération
              </p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading || (requires2FA && totpCode.length !== 6)}>
            {loading ? "Connexion..." : requires2FA ? "Vérifier" : "Se connecter"}
          </Button>

          {requires2FA && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => { setRequires2FA(false); setTotpCode(""); setError(""); }}
            >
              Retour
            </Button>
          )}
        </form>
      </div>
    </AuthLayout>
  );
}
