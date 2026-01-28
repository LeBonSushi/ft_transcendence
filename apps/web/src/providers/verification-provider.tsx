"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Modal } from "@/components/ui/modal";

interface VerificationState {
  complete: () => void;
  cancel: () => void;
  level: string | undefined;
}

interface VerificationContextValue {
  requestVerification: (state: VerificationState) => void;
}

const VerificationContext = createContext<VerificationContextValue | null>(null);

export function useVerificationModal() {
  const ctx = useContext(VerificationContext);
  if (!ctx) {
    throw new Error("useVerificationModal must be used within VerificationProvider");
  }
  return ctx;
}

export function VerificationProvider({ children }: { children: ReactNode }) {
  const [verification, setVerification] = useState<VerificationState | null>(null);

  const isOpen = verification !== null;

  const requestVerification = useCallback((state: VerificationState) => {
    setVerification(state);
  }, []);

  const onComplete = () => {
    verification?.complete();
    setVerification(null);
  };

  const onCancel = () => {
    verification?.cancel();
    setVerification(null);
  };

  return (
    <VerificationContext.Provider value={{ requestVerification }}>
      {children}
      <Modal isOpen={isOpen} onClose={onCancel} size="sm" showCloseButton={false}>
        <div className="p-6 space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">
              Vérification requise
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Veuillez confirmer votre identité pour continuer.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={onComplete}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Confirmer
            </button>
          </div>
        </div>
      </Modal>
    </VerificationContext.Provider>
  );
}
