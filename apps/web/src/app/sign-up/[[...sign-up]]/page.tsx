"use client";

import { SignUp } from "@clerk/nextjs";
import { AuthLayout, FeatureItem } from "@/components/ui/auth";
import { clerkAppearanceCompact } from "@/components/ui/auth";

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

export default function SignUpPage() {
  return (
    <AuthLayout
      backgroundImage="https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=2070&auto=format&fit=crop"
      gradientOverlay="from-black/60 via-black/40 to-accent/30"
      tagline="Nouveau membre"
      title={
        <>
          Prêt à explorer
          <span className="block italic text-accent">le monde</span>
          avec nous ?
        </>
      }
      description="Créez votre compte en quelques secondes et commencez à planifier des voyages inoubliables."
      leftContent={
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
      }
      mobileTitle="Créer un compte"
      mobileSubtitle="Rejoignez la communauté des voyageurs"
      desktopTitle="Créer un compte"
      desktopSubtitle="Rejoignez des milliers de voyageurs"
      footerText="Déjà un compte ?"
      footerLinkText="Se connecter"
      footerLinkHref="/sign-in"
    >
      <SignUp
        appearance={clerkAppearanceCompact}
        signInUrl="/sign-in"
        forceRedirectUrl="/"
      />
    </AuthLayout>
  );
}
