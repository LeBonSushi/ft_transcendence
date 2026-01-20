"use client"

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left side - Immersive visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-primary/30" />

        {/* Decorative elements */}
        <div className="absolute top-8 left-8 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM4 12C4 11.39 4.08 10.79 4.21 10.22L8 14V15C8 16.1 8.9 17 10 17V19.93C6.61 19.44 4 16.07 4 12ZM17.89 17.4C17.64 16.59 16.9 16 16 16H15V13C15 12.45 14.55 12 14 12H8V10H10C10.55 10 11 9.55 11 9V7H13C14.1 7 15 6.1 15 5V4.59C17.93 5.78 20 8.65 20 12C20 14.08 19.19 15.98 17.89 17.4Z"/>
              </svg>
            </div>
            <span className="text-white font-serif text-xl tracking-wide">Voyageur</span>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end w-full p-12 pb-16 text-white">
          <div className="max-w-lg">
            <p className="text-accent font-medium tracking-[0.2em] uppercase text-sm mb-4">
              Bienvenue
            </p>

            <h1 className="font-serif text-5xl lg:text-6xl font-medium leading-[1.1] mb-6">
              Vos plus belles
              <span className="block italic text-accent">aventures</span>
              commencent ici
            </h1>

            <p className="text-lg text-white/70 leading-relaxed mb-10 max-w-md">
              Rejoignez une communauté de voyageurs passionnés et transformez vos rêves d'évasion en réalité.
            </p>

            {/* Stats */}
            <div className="flex gap-12">
              <div>
                <p className="font-serif text-4xl font-medium">12k+</p>
                <p className="text-white/60 text-sm mt-1">Voyageurs actifs</p>
              </div>
              <div>
                <p className="font-serif text-4xl font-medium">89</p>
                <p className="text-white/60 text-sm mt-1">Pays explorés</p>
              </div>
              <div>
                <p className="font-serif text-4xl font-medium">4.9</p>
                <p className="text-white/60 text-sm mt-1">Note moyenne</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative corner */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-linear-to-tl from-accent/20 to-transparent" />
      </div>

      {/* Right side - Sign In */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center p-6 sm:p-8 lg:p-12 overflow-x-hidden overflow-y-auto">
        {/* Background with subtle pattern */}
        <div className="absolute inset-0 bg-linear-to-br from-background via-background to-primary/5" />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Decorative blurs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden mb-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM4 12C4 11.39 4.08 10.79 4.21 10.22L8 14V15C8 16.1 8.9 17 10 17V19.93C6.61 19.44 4 16.07 4 12ZM17.89 17.4C17.64 16.59 16.9 16 16 16H15V13C15 12.45 14.55 12 14 12H8V10H10C10.55 10 11 9.55 11 9V7H13C14.1 7 15 6.1 15 5V4.59C17.93 5.78 20 8.65 20 12C20 14.08 19.19 15.98 17.89 17.4Z"/>
                </svg>
              </div>
              <span className="font-serif text-2xl tracking-wide">Voyageur</span>
            </div>
            <h1 className="font-serif text-3xl font-medium mb-2">Bon retour</h1>
            <p className="text-muted-foreground">Connectez-vous pour continuer l'aventure</p>
          </div>

          {/* Card container */}
          <div className="bg-card rounded-3xl p-8 sm:p-10 shadow-2xl border border-border/50">
            {/* Desktop header inside card */}
            <div className="hidden lg:block mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/25">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM4 12C4 11.39 4.08 10.79 4.21 10.22L8 14V15C8 16.1 8.9 17 10 17V19.93C6.61 19.44 4 16.07 4 12ZM17.89 17.4C17.64 16.59 16.9 16 16 16H15V13C15 12.45 14.55 12 14 12H8V10H10C10.55 10 11 9.55 11 9V7H13C14.1 7 15 6.1 15 5V4.59C17.93 5.78 20 8.65 20 12C20 14.08 19.19 15.98 17.89 17.4Z"/>
                  </svg>
                </div>
              </div>
              <h2 className="font-serif text-3xl font-medium mb-2">
                Bon retour
              </h2>
              <p className="text-muted-foreground">
                Connectez-vous pour accéder à vos voyages
              </p>
            </div>

            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full !overflow-visible",
                  cardBox: "!shadow-none w-full !border-0 !overflow-visible",
                  card: "!shadow-none !border-0 w-full !bg-transparent !p-0 !overflow-visible",
                  header: "hidden",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  main: "gap-4",
                  form: "gap-4",
                  socialButtons: "gap-3",
                  socialButtonsBlockButton:
                    "h-12 bg-background/50 !border !border-border/50 hover:!border-primary/50 hover:bg-primary/5 transition-all duration-300 font-medium !rounded-xl",
                  socialButtonsBlockButtonText: "font-medium",
                  dividerRow: "my-6",
                  dividerLine: "bg-border/50",
                  dividerText: "text-muted-foreground text-sm px-4 bg-transparent",
                  formFieldRow: "mb-4",
                  formFieldLabel: "text-foreground font-medium text-sm mb-2",
                  formFieldInput:
                    "h-12 bg-background/50 !border !border-border/50 focus:!border-primary focus:!ring-2 focus:!ring-primary/20 !rounded-xl transition-all duration-300 px-4",
                  formButtonPrimary:
                    "h-12 text-base font-semibold !bg-primary hover:!bg-primary/90 !rounded-xl transition-all duration-300 !shadow-lg !shadow-primary/25 mt-2",
                  footer: "hidden",
                  footerAction: "hidden",
                  identityPreview: "bg-background/50 !border !border-border/50 !rounded-xl p-4",
                  identityPreviewEditButton: "text-primary",
                  formResendCodeLink: "text-primary font-medium",
                  otpCodeFieldInput: "!border !border-border/50 !rounded-xl bg-background/50",
                  alternativeMethodsBlockButton: "!border !border-border/50 !rounded-xl",
                  formFieldAction: "text-primary font-medium text-sm",
                },
                layout: {
                  socialButtonsPlacement: "top",
                  socialButtonsVariant: "blockButton",
                },
              }}
              signUpUrl="/sign-up"
              forceRedirectUrl="/"
            />

            {/* Custom footer */}
            <div className="mt-8 pt-6 border-t border-border/50 text-center">
              <p className="text-muted-foreground text-sm">
                Pas encore de compte ?{" "}
                <a href="/sign-up" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                  Créer un compte
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            En vous connectant, vous acceptez nos{" "}
            <a href="#" className="underline hover:text-foreground transition-colors">
              Conditions
            </a>
            {" "}et{" "}
            <a href="#" className="underline hover:text-foreground transition-colors">
              Confidentialité
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
