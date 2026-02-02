"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useSession } from "@clerk/nextjs";
import {
  Shield,
  Smartphone,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type VerificationStep =
  | "idle"
  | "initializing"
  | "first_factor"
  | "second_factor";

type SecondFactorMode = "totp" | "backup_code";

interface VerificationCallbacks {
  complete: () => void;
  cancel: () => void;
  level: string | undefined;
}

interface FlowState {
  step: VerificationStep;
  error: string | null;
  isSubmitting: boolean;
  supportedFirstFactors: any[] | null;
  supportedSecondFactors: any[] | null;
  isMultiFactor: boolean;
  secondFactorMode: SecondFactorMode;
  /** Email address hint for email_code factor (e.g. "m***@example.com") */
  emailHint: string | null;
}

interface VerificationContextValue {
  requestVerification: (state: VerificationCallbacks) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const VerificationContext = createContext<VerificationContextValue | null>(null);

export function useVerificationModal() {
  const ctx = useContext(VerificationContext);
  if (!ctx) {
    throw new Error(
      "useVerificationModal must be used within VerificationProvider"
    );
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const initialFlowState: FlowState = {
  step: "idle",
  error: null,
  isSubmitting: false,
  supportedFirstFactors: null,
  supportedSecondFactors: null,
  isMultiFactor: false,
  secondFactorMode: "totp",
  emailHint: null,
};

function extractError(err: unknown, fallback: string): string {
  const e = err as any;
  return (
    e?.errors?.[0]?.longMessage || e?.errors?.[0]?.message || fallback
  );
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function VerificationProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();

  // Callbacks from Clerk's useReverification
  const [callbacks, setCallbacks] = useState<VerificationCallbacks | null>(
    null
  );
  const callbacksRef = useRef<VerificationCallbacks | null>(null);

  // Flow state machine
  const [flow, setFlow] = useState<FlowState>(initialFlowState);

  // Form inputs
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [backupCode, setBackupCode] = useState("");

  const isOpen = callbacks !== null && flow.step !== "idle";

  // -------------------------------------------------------------------------
  // Reset
  // -------------------------------------------------------------------------

  const resetState = useCallback(() => {
    callbacksRef.current = null;
    setCallbacks(null);
    setFlow(initialFlowState);
    setPassword("");
    setShowPassword(false);
    setOtpCode("");
    setBackupCode("");
  }, []);

  // -------------------------------------------------------------------------
  // Request verification (called by useVerification hook)
  // -------------------------------------------------------------------------

  const requestVerification = useCallback(
    async (state: VerificationCallbacks) => {
      callbacksRef.current = state;
      setCallbacks(state);
      setFlow((prev) => ({ ...prev, step: "initializing" }));

      if (!session) {
        state.cancel();
        resetState();
        return;
      }

      try {
        const level = (state.level as any) || "second_factor";
        const verification = await session.startVerification({ level });
        const isMultiFactor = level === "multi_factor";

        if (verification.status === "needs_first_factor") {
          // Extract email hint for email_code factor
          const emailFactor = verification.supportedFirstFactors?.find(
            (f) => f.strategy === "email_code"
          );
          const emailHint =
            emailFactor && "safeIdentifier" in emailFactor
              ? (emailFactor as { safeIdentifier: string }).safeIdentifier
              : null;
          const emailAddressId =
            emailFactor && "emailAddressId" in emailFactor
              ? (emailFactor as { emailAddressId: string }).emailAddressId
              : null;

          setFlow((prev) => ({
            ...prev,
            step: "first_factor",
            supportedFirstFactors: verification.supportedFirstFactors,
            supportedSecondFactors: verification.supportedSecondFactors,
            isMultiFactor,
            emailHint,
          }));

          // If no password factor, prepare email code automatically
          const hasPassword = verification.supportedFirstFactors?.some(
            (f) => f.strategy === "password"
          );
          if (!hasPassword && emailAddressId) {
            try {
              await session.prepareFirstFactorVerification({
                strategy: "email_code",
                emailAddressId,
              });
            } catch {
              // Preparation failed but we still show the UI
            }
          }
        } else if (verification.status === "needs_second_factor") {
          setFlow((prev) => ({
            ...prev,
            step: "second_factor",
            supportedFirstFactors: verification.supportedFirstFactors,
            supportedSecondFactors: verification.supportedSecondFactors,
            isMultiFactor,
          }));
        } else if (verification.status === "complete") {
          state.complete();
          resetState();
        }
      } catch (err) {
        state.cancel();
        resetState();
      }
    },
    [session, resetState]
  );

  // -------------------------------------------------------------------------
  // Cancel
  // -------------------------------------------------------------------------

  const handleCancel = useCallback(() => {
    callbacksRef.current?.cancel();
    resetState();
  }, [resetState]);

  // -------------------------------------------------------------------------
  // Factor helpers
  // -------------------------------------------------------------------------

  const hasPasswordFactor =
    flow.supportedFirstFactors?.some((f: any) => f.strategy === "password") ??
    false;

  const hasEmailCodeFactor =
    flow.supportedFirstFactors?.some(
      (f: any) => f.strategy === "email_code"
    ) ?? false;

  const hasTotpFactor =
    flow.supportedSecondFactors?.some((f: any) => f.strategy === "totp") ??
    false;

  const hasBackupCodeFactor =
    flow.supportedSecondFactors?.some(
      (f: any) => f.strategy === "backup_code"
    ) ?? false;

  // -------------------------------------------------------------------------
  // First factor: password
  // -------------------------------------------------------------------------

  const handlePasswordSubmit = useCallback(async () => {
    if (!session || !password.trim()) return;

    setFlow((prev) => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const result = await session.attemptFirstFactorVerification({
        strategy: "password",
        password,
      });

      if (result.status === "complete") {
        callbacksRef.current?.complete();
        resetState();
      } else if (result.status === "needs_second_factor") {
        setFlow((prev) => ({
          ...prev,
          step: "second_factor",
          isSubmitting: false,
          error: null,
          supportedSecondFactors: result.supportedSecondFactors,
        }));
        setPassword("");
        setOtpCode("");
      }
    } catch (err) {
      setFlow((prev) => ({
        ...prev,
        isSubmitting: false,
        error: extractError(err, "Mot de passe incorrect."),
      }));
      setPassword("");
    }
  }, [session, password, resetState]);

  // -------------------------------------------------------------------------
  // First factor: email code
  // -------------------------------------------------------------------------

  const handleEmailCodeSubmit = useCallback(
    async (code: string) => {
      if (!session || code.length !== 6) return;

      setFlow((prev) => ({ ...prev, isSubmitting: true, error: null }));

      try {
        const result = await session.attemptFirstFactorVerification({
          strategy: "email_code",
          code,
        });

        if (result.status === "complete") {
          callbacksRef.current?.complete();
          resetState();
        } else if (result.status === "needs_second_factor") {
          setFlow((prev) => ({
            ...prev,
            step: "second_factor",
            isSubmitting: false,
            error: null,
            supportedSecondFactors: result.supportedSecondFactors,
          }));
          setOtpCode("");
        }
      } catch (err) {
        setFlow((prev) => ({
          ...prev,
          isSubmitting: false,
          error: extractError(err, "Code invalide."),
        }));
        setOtpCode("");
      }
    },
    [session, resetState]
  );

  // -------------------------------------------------------------------------
  // Second factor: TOTP
  // -------------------------------------------------------------------------

  const handleTotpSubmit = useCallback(
    async (code: string) => {
      if (!session || code.length !== 6) return;

      setFlow((prev) => ({ ...prev, isSubmitting: true, error: null }));

      try {
        const result = await session.attemptSecondFactorVerification({
          strategy: "totp",
          code,
        });

        if (result.status === "complete") {
          callbacksRef.current?.complete();
          resetState();
        }
      } catch (err) {
        setFlow((prev) => ({
          ...prev,
          isSubmitting: false,
          error: extractError(err, "Code invalide. Veuillez réessayer."),
        }));
        setOtpCode("");
      }
    },
    [session, resetState]
  );

  // -------------------------------------------------------------------------
  // Second factor: backup code
  // -------------------------------------------------------------------------

  const handleBackupCodeSubmit = useCallback(async () => {
    if (!session || !backupCode.trim()) return;

    setFlow((prev) => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const result = await session.attemptSecondFactorVerification({
        strategy: "backup_code",
        code: backupCode.trim(),
      });

      if (result.status === "complete") {
        callbacksRef.current?.complete();
        resetState();
      }
    } catch (err) {
      setFlow((prev) => ({
        ...prev,
        isSubmitting: false,
        error: extractError(err, "Code de secours invalide."),
      }));
      setBackupCode("");
    }
  }, [session, backupCode, resetState]);

  // -------------------------------------------------------------------------
  // OTP auto-submit handler
  // -------------------------------------------------------------------------

  const handleOtpChange = useCallback(
    (value: string, onSubmit: (code: string) => void) => {
      setOtpCode(value);
      setFlow((prev) => ({ ...prev, error: null }));
      if (value.length === 6) {
        onSubmit(value);
      }
    },
    []
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <VerificationContext.Provider value={{ requestVerification }}>
      {children}

      <Modal
        isOpen={isOpen}
        onClose={handleCancel}
        size="sm"
        showCloseButton={false}
        closeOnOverlayClick={!flow.isSubmitting}
        closeOnEscape={!flow.isSubmitting}
      >
        <div className="p-6">
          {/* Multi-factor step indicator */}
          {flow.isMultiFactor && flow.step !== "initializing" && (
            <div className="flex items-center justify-center gap-2 mb-5">
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  flow.step === "first_factor"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                Étape 1
              </span>
              <span className="w-6 h-px bg-border" />
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  flow.step === "second_factor"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                Étape 2
              </span>
            </div>
          )}

          {/* Initializing */}
          {flow.step === "initializing" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Préparation de la vérification...
              </p>
            </div>
          )}

          {/* First factor: password */}
          {flow.step === "first_factor" && hasPasswordFactor && (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-full bg-primary/10">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Vérification requise
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Entrez votre mot de passe pour confirmer votre identité.
                  </p>
                </div>
              </div>

              {/* Error */}
              {flow.error && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {flow.error}
                </div>
              )}

              {/* Password input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handlePasswordSubmit();
                }}
              >
                <Input
                  type={showPassword ? "text" : "password"}
                  label="Mot de passe"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFlow((prev) => ({ ...prev, error: null }));
                  }}
                  disabled={flow.isSubmitting}
                  autoFocus
                  placeholder="Entrez votre mot de passe"
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
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

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={flow.isSubmitting}
                    className="flex-1 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={flow.isSubmitting || !password.trim()}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  >
                    {flow.isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Vérification...
                      </>
                    ) : (
                      "Vérifier"
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* First factor: email code (fallback when no password) */}
          {flow.step === "first_factor" && !hasPasswordFactor && hasEmailCodeFactor && (
            <>
              {/* Header */}
              <div className="flex w-full items-center gap-3 mb-5">
                <div className="shrink-0 p-3 rounded-full bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-foreground">
                    Code de vérification
                  </h2>
                  <p className="text-sm text-muted-foreground wrap-break-word">
                    Un code a été envoyé à{" "}
                    <span className="font-medium text-foreground">
                      {flow.emailHint || "votre email"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Error */}
              {flow.error && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {flow.error}
                </div>
              )}

              {/* OTP input */}
              <div className="flex justify-center mb-6">
                <InputOTP
                  maxLength={6}
                  value={otpCode}
                  onChange={(value) =>
                    handleOtpChange(value, handleEmailCodeSubmit)
                  }
                  autoFocus
                  pattern={REGEXP_ONLY_DIGITS}
                  disabled={flow.isSubmitting}
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

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={flow.isSubmitting}
                  className="flex-1 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => handleEmailCodeSubmit(otpCode)}
                  disabled={flow.isSubmitting || otpCode.length !== 6}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {flow.isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    "Vérifier"
                  )}
                </button>
              </div>
            </>
          )}

          {/* Second factor: TOTP */}
          {flow.step === "second_factor" && flow.secondFactorMode === "totp" && (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-full bg-primary/10">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Vérification en deux étapes
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Entrez le code de votre application d&apos;authentification.
                  </p>
                </div>
              </div>

              {/* Error */}
              {flow.error && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {flow.error}
                </div>
              )}

              {/* OTP input */}
              <div className="flex justify-center mb-4">
                <InputOTP
                  maxLength={6}
                  value={otpCode}
                  onChange={(value) => handleOtpChange(value, handleTotpSubmit)}
                  autoFocus
                  pattern={REGEXP_ONLY_DIGITS}
                  disabled={flow.isSubmitting}
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

              {/* Switch to backup code */}
              {hasBackupCodeFactor && (
                <div className="text-center mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setFlow((prev) => ({
                        ...prev,
                        secondFactorMode: "backup_code",
                        error: null,
                      }));
                      setOtpCode("");
                    }}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                  >
                    Utiliser un code de secours
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={flow.isSubmitting}
                  className="flex-1 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => handleTotpSubmit(otpCode)}
                  disabled={flow.isSubmitting || otpCode.length !== 6}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {flow.isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    "Vérifier"
                  )}
                </button>
              </div>
            </>
          )}

          {/* Second factor: backup code */}
          {flow.step === "second_factor" &&
            flow.secondFactorMode === "backup_code" && (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-3 rounded-full bg-primary/10">
                    <KeyRound className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Code de secours
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Entrez l&apos;un de vos codes de secours.
                    </p>
                  </div>
                </div>

                {/* Error */}
                {flow.error && (
                  <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {flow.error}
                  </div>
                )}

                {/* Backup code input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleBackupCodeSubmit();
                  }}
                >
                  <Input
                    type="text"
                    label="Code de secours"
                    value={backupCode}
                    onChange={(e) => {
                      setBackupCode(e.target.value);
                      setFlow((prev) => ({ ...prev, error: null }));
                    }}
                    disabled={flow.isSubmitting}
                    autoFocus
                    placeholder="Entrez votre code de secours"
                  />

                  {/* Switch to TOTP */}
                  {hasTotpFactor && (
                    <div className="text-center mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setFlow((prev) => ({
                            ...prev,
                            secondFactorMode: "totp",
                            error: null,
                          }));
                          setBackupCode("");
                          setOtpCode("");
                        }}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                      >
                        Utiliser le code d&apos;authentification
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={flow.isSubmitting}
                      className="flex-1 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={flow.isSubmitting || !backupCode.trim()}
                      className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                      {flow.isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Vérification...
                        </>
                      ) : (
                        "Vérifier"
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
        </div>
      </Modal>
    </VerificationContext.Provider>
  );
}
