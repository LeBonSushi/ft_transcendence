import { useReverification } from "@clerk/nextjs";
import { useVerificationModal } from "@/providers/verification-provider";

export function useVerification({ fetcher }: { fetcher: (...args: any[]) => Promise<any> | undefined }) {
  const { requestVerification } = useVerificationModal();

  const verifHandle = useReverification(fetcher, {
    onNeedsReverification(properties) {
      console.log('[useVerification] onNeedsReverification triggered, level:', properties.level);
      requestVerification(properties);
    },
  });

  return verifHandle;
}
