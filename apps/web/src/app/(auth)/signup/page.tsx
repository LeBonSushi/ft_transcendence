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

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setLoading(true);

    try {
      // Appel à l'API de registration
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue lors de l'inscription");
        setLoading(false);
        return;
      }

      // Connexion automatique après inscription
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Inscription réussie mais échec de connexion. Veuillez vous connecter.");
        router.push("/signin");
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
      tagline="Rejoignez l'aventure"
      title={
        <>
          Créez votre compte <span className="text-primary">TRANSv2</span>
        </>
      }
      description="Commencez à planifier vos voyages dès aujourd'hui et rejoignez notre communauté de voyageurs passionnés."
      mobileTitle="Inscription"
      mobileSubtitle="Créez votre compte"
      desktopTitle="Bienvenue !"
      desktopSubtitle="Créez votre compte pour commencer"
      footerText="Déjà un compte ?"
      footerLinkText="Se connecter"
      footerLinkHref="/signin"
    >
      <div className="space-y-4">
        {/* OAuth Buttons */}
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

        {/* Sign Up Form */}
        <form onSubmit={handleSignUp} className="space-y-3">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="firstName" className="text-sm font-medium">
                Prénom
              </label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Jean"
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="lastName" className="text-sm font-medium">
                Nom
              </label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Dupont"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="username" className="text-sm font-medium">
              Nom d'utilisateur
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="jeandupont"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="vous@exemple.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">
              Mot de passe
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Au moins 8 caractères
            </p>
          </div>

          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirmer le mot de passe
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="text-xs text-muted-foreground">
            En créant un compte, vous acceptez nos{" "}
            <Link href="/rgpd" className="text-primary hover:underline">
              Conditions d'utilisation
            </Link>
            .
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Création du compte..." : "Créer mon compte"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
