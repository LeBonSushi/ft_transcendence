"use client"

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left side - Immersive visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1530789253388-582c481c54b0?q=80&w=2070&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-linear-to-br from-black/60 via-black/40 to-accent/30" />

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
              Nouveau membre
            </p>

            <h1 className="font-serif text-5xl lg:text-6xl font-medium leading-[1.1] mb-6">
              Prêt à explorer
              <span className="block italic text-accent">le monde</span>
              avec nous ?
            </h1>

            <p className="text-lg text-white/70 leading-relaxed mb-10 max-w-md">
              Créez votre compte en quelques secondes et commencez à planifier des voyages inoubliables.
            </p>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Itinéraires sur mesure</p>
                  <p className="text-white/60 text-sm">Créez des parcours personnalisés</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Planification collaborative</p>
                  <p className="text-white/60 text-sm">Invitez vos proches</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Souvenirs partagés</p>
                  <p className="text-white/60 text-sm">Gardez une trace de vos aventures</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative corner */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-linear-to-tl from-primary/20 to-transparent" />
      </div>

      {/* Right side - Sign Up */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center p-6 sm:p-8 lg:p-12 overflow-x-hidden overflow-y-auto">
        {/* Background with subtle pattern */}
        <div className="absolute inset-0 bg-linear-to-br from-background via-background to-accent/5" />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Decorative blurs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden mb-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary to-accent/80 flex items-center justify-center shadow-lg shadow-primary/25">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM4 12C4 11.39 4.08 10.79 4.21 10.22L8 14V15C8 16.1 8.9 17 10 17V19.93C6.61 19.44 4 16.07 4 12ZM17.89 17.4C17.64 16.59 16.9 16 16 16H15V13C15 12.45 14.55 12 14 12H8V10H10C10.55 10 11 9.55 11 9V7H13C14.1 7 15 6.1 15 5V4.59C17.93 5.78 20 8.65 20 12C20 14.08 19.19 15.98 17.89 17.4Z"/>
                </svg>
              </div>
              <span className="font-serif text-2xl tracking-wide">Voyageur</span>
            </div>
            <h1 className="font-serif text-3xl font-medium mb-2">Créer un compte</h1>
            <p className="text-muted-foreground">Rejoignez la communauté des voyageurs</p>
          </div>

          {/* Card container */}
          <div className="bg-card rounded-3xl p-8 sm:p-10 shadow-2xl border border-border/50">
            {/* Desktop header inside card */}
            <div className="hidden lg:block mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary to-accent/80 flex items-center justify-center shadow-lg shadow-primary/25">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM4 12C4 11.39 4.08 10.79 4.21 10.22L8 14V15C8 16.1 8.9 17 10 17V19.93C6.61 19.44 4 16.07 4 12ZM17.89 17.4C17.64 16.59 16.9 16 16 16H15V13C15 12.45 14.55 12 14 12H8V10H10C10.55 10 11 9.55 11 9V7H13C14.1 7 15 6.1 15 5V4.59C17.93 5.78 20 8.65 20 12C20 14.08 19.19 15.98 17.89 17.4Z"/>
                  </svg>
                </div>
              </div>
              <h2 className="font-serif text-3xl font-medium mb-2">
                Créer un compte
              </h2>
              <p className="text-muted-foreground">
                Rejoignez des milliers de voyageurs
              </p>
            </div>

            <SignUp
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
              signInUrl="/sign-in"
              forceRedirectUrl="/"
            />

            {/* Custom footer */}
            <div className="mt-8 pt-6 border-t border-border/50 text-center">
              <p className="text-muted-foreground text-sm">
                Déjà un compte ?{" "}
                <a href="/sign-in" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                  Se connecter
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            En créant un compte, vous acceptez nos{" "}
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
