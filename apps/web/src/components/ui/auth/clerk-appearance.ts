// Shared Clerk appearance configuration for consistent styling
export const clerkAppearance = {
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
    socialButtonsBlockButtonText: "font-medium hidden sm:inline",
    dividerRow: "my-3",
    dividerLine: "bg-border/50",
    dividerText: "text-muted-foreground text-sm px-4 bg-transparent",
    formFieldRow: "mb-4",
    formFieldLabel: "text-foreground font-medium text-sm mb-2",
    formFieldInput:
      "!h-auto !py-3 bg-background/50 !border !border-border/50 focus:!border-primary focus:!ring-2 focus:!ring-primary/20 !rounded-xl transition-all duration-300 px-4",
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
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
  },
};

// Compact variant for sign-up (minimal spacing to avoid scroll)
export const clerkAppearanceCompact = {
  elements: {
    ...clerkAppearance.elements,
    main: "gap-1",
    form: "gap-1",
    socialButtons: "grid grid-cols-3 gap-2 [&>button:first-child]:col-span-3",
    socialButtonsBlockButton:
      "h-9 bg-background/50 !border !border-border/50 hover:!border-primary/50 hover:bg-primary/5 transition-all duration-300 font-medium !rounded-lg",
    socialButtonsBlockButtonText: "font-medium text-sm",
    dividerRow: "my-1",
    formFieldRow: "mb-0.5",
    formFieldLabel: "text-foreground font-medium text-xs mb-0.5",
    formFieldInput: "!h-auto !py-2 bg-background/50 !border !border-border/50 focus:!border-primary focus:!ring-2 focus:!ring-primary/20 !rounded-lg transition-all duration-300 px-3 text-sm",
    formButtonPrimary:
      "h-9 text-sm font-semibold !bg-primary hover:!bg-primary/90 !rounded-lg transition-all duration-300 !shadow-lg !shadow-primary/25 mt-0.5",
    identityPreview: "bg-background/50 !border !border-border/50 !rounded-lg p-2",
  },
  layout: clerkAppearance.layout,
};
