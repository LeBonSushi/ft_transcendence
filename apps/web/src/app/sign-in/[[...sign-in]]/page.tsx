"use client";

import { SignIn } from "@clerk/nextjs";
import { AuthLayout, StatItem } from "@/components/ui/auth";
import { clerkAppearance } from "@/components/ui/auth";

const STATS = [
  { value: "12k+", label: "Voyageurs actifs" },
  { value: "89", label: "Pays explorés" },
  { value: "4.9", label: "Note moyenne" },
];

export default function SignInPage() {
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
            <StatItem key={stat.label} value={stat.value} label={stat.label} />
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
      <SignIn
        appearance={clerkAppearance}
        signUpUrl="/sign-up"
        forceRedirectUrl="/"
      />
    </AuthLayout>
  );
}
