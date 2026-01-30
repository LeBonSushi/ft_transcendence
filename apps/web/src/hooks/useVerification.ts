import { useReverification } from "@clerk/nextjs";
import { useVerificationModal } from "@/providers/verification-provider";

export function useVerification({ fetcher }: { fetcher: (...args: any[]) => Promise<any> | undefined }) {
  const { requestVerification } = useVerificationModal();

  const verifHandle = useReverification(fetcher, {
    onNeedsReverification(properties) {
      requestVerification(properties);
    },
  });

  return verifHandle;
}
