"use client";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  // Left panel props
  backgroundImage: string;
  gradientOverlay?: string;
  tagline: string;
  title: ReactNode;
  description: string;
  leftContent?: ReactNode;
  // Right panel props
  mobileTitle: string;
  mobileSubtitle: string;
  desktopTitle: string;
  desktopSubtitle: string;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
}

export function AuthLayout({
  children,
  backgroundImage,
  gradientOverlay = "from-black/60 via-black/40 to-primary/30",
  tagline,
  title,
  description,
  leftContent,
  mobileTitle,
  mobileSubtitle,
  desktopTitle,
  desktopSubtitle,
  footerText,
  footerLinkText,
  footerLinkHref,
}: AuthLayoutProps) {
  return (
    <div className="h-screen w-full flex">
      {/* Left side - Immersive visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${backgroundImage}')` }}
        />
        <div className={cn("absolute inset-0 bg-linear-to-br", gradientOverlay)} />

        {/* Logo */}
        <div className="absolute top-8 left-8 z-20">
          <Logo variant="white" size="md" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end w-full p-12 pb-16 text-white">
          <div className="max-w-lg">
            <p className="text-accent font-medium tracking-[0.2em] uppercase text-sm mb-4">
              {tagline}
            </p>

            <h1 className="font-serif text-5xl lg:text-6xl font-medium leading-[1.1] mb-6">
              {title}
            </h1>

            <p className="text-lg text-white/70 leading-relaxed mb-10 max-w-md">
              {description}
            </p>

            {leftContent}
          </div>
        </div>

      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center p-6 sm:p-8 lg:p-12 overflow-hidden">
        {/* Background with subtle pattern */}
        <div className="absolute inset-0 bg-linear-to-br from-background via-background to-primary/5" />
        <BackgroundPattern />

        {/* Decorative blurs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden mb-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Logo size="lg" />
            </div>
            <h1 className="font-serif text-3xl font-medium mb-2">{mobileTitle}</h1>
            <p className="text-muted-foreground">{mobileSubtitle}</p>
          </div>

          {/* Card container */}
          <div className="bg-card rounded-3xl p-8 sm:p-10 shadow-2xl border border-border/50">
            {/* Desktop header inside card */}
            <div className="hidden lg:block mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Logo size="lg" showText={false} />
              </div>
              <h2 className="font-serif text-3xl font-medium mb-2">
                {desktopTitle}
              </h2>
              <p className="text-muted-foreground">
                {desktopSubtitle}
              </p>
            </div>

            {children}

            {/* Custom footer */}
            <div className="mt-8 pt-6 border-t border-border/50 text-center">
              <p className="text-muted-foreground text-sm">
                {footerText}{" "}
                <a href={footerLinkHref} className="text-primary font-semibold hover:text-primary/80 transition-colors">
                  {footerLinkText}
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            En vous connectant, vous acceptez nos{" "}
            <a href="/terms" className="underline hover:text-foreground transition-colors">
              Conditions
            </a>
            {" "}et{" "}
            <a href="/privacy" className="underline hover:text-foreground transition-colors">
              Confidentialité
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function BackgroundPattern() {
  return (
    <div
      className="absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    />
  );
}

// Reusable stat item for sign-in page
interface StatItemProps {
  value: string;
  label: string;
}

export function StatItem({ value, label }: StatItemProps) {
  return (
    <div>
      <p className="font-serif text-4xl font-medium">{value}</p>
      <p className="text-white/60 text-sm mt-1">{label}</p>
    </div>
  );
}

// Reusable feature item for sign-up page
interface FeatureItemProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-white/60 text-sm">{description}</p>
      </div>
    </div>
  );
}
