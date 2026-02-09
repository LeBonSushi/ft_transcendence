import { useSession } from "next-auth/react";

export function useVerification({ fetcher }: { fetcher: (...args: any[]) => Promise<any> | undefined }) {
  const { data: session } = useSession();
  
  if (!session) {
    throw new Error("Verification required - please sign in");
  }
  
  return fetcher;
}
