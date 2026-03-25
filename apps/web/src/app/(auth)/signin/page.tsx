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
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // If not yet at 2FA stage, try initial login to check if 2FA is needed
      if (!requires2FA) {
        try {
          const response = await fetch("/api/account/check-2fa", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (response.ok) {
            const data = await response.json();
            // Backend requires 2FA
            if (data.requiresTwoFactor) {
              setRequires2FA(true);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          // Fall through to signIn() which will handle the error
        }
      }

      // Complete login via NextAuth (with or without TOTP)
      const result = await signIn("credentials", {
        email,
        password,
        totpCode: totpCode || undefined,
        redirect: false,
      });

      if (result?.error) {
        setError(requires2FA ? "2FA code invalid" : "Email or password invalid");
        setTotpCode("");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An error has occurred");
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
      tagline="Explore the world"
      title={
        <>
          Welcome to <span className="text-primary">Travel Planner</span>
        </>
      }
      description="Plan your trips, share your experiences and discover new destinations with our community"
      mobileTitle="Connection"
      mobileSubtitle="Access your account"
      desktopTitle="Welcome back"
      desktopSubtitle="Log in to continue your adventure"
      footerText="No account yet ?"
      footerLinkText="Create an account"
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
                Continue with Google
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuthSignIn("github")}
                disabled={loading}
                className="w-full"
              >
                <Github className="mr-2 h-4 w-4" />
                Continue with GitHub
              </Button>
            </div>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                Or with email
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
                  placeholder="johndoe@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot your password ?
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
                <h2 className="text-lg font-semibold">2FA verification</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {useBackupCode
                    ? "Enter one of your recovery codes"
                    : "Enter the 6-digit code of your authentication application"}
                </p>
              </div>

              {useBackupCode ? (
                <Input
                  placeholder="Recovery code"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="text-center font-mono"
                  maxLength={8}
                />
              ) : (
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
              )}

              <button
                type="button"
                className="text-xs text-primary hover:underline w-full text-center"
                onClick={() => { setUseBackupCode(!useBackupCode); setTotpCode(""); }}
              >
                {useBackupCode ? "Use TOTP code" : "Use recovery code"}
              </button>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading || (requires2FA && !useBackupCode && totpCode.length !== 6) || (requires2FA && useBackupCode && totpCode.length === 0)}>
            {loading ? "Connection..." : requires2FA ? "Verify" : "Login"}
          </Button>

          {requires2FA && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => { setRequires2FA(false); setTotpCode(""); setUseBackupCode(false); setError(""); }}
            >
              Back
            </Button>
          )}
        </form>
      </div>
    </AuthLayout>
  );
}
