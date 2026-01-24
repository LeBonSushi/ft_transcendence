import { useState, useEffect } from 'react';
import { useReverification, useSession } from '@clerk/nextjs';

interface Session {
  id: string;
  lastActiveAt: string | Date;
  latestActivity?: {
    browserName?: string;
    deviceType?: string;
  };
  revoke: () => Promise<any>;
}

interface UseSessionsOptions {
  user: {
    getSessions: () => Promise<Session[]>;
  } | null | undefined;
}

interface UseSessionsReturn {
  sessions: Session[];
  currentSession: any;
  isLoading: boolean;
  revoking: string | null;
  revokeSession: (sessionId: string) => Promise<void>;
  refreshSessions: () => Promise<void>;
}

/**
 * Hook pour gérer les sessions utilisateur
 * Gère le fetch, la révocation avec vérification, et le refresh
 */
export function useSessions({ user }: UseSessionsOptions): UseSessionsReturn {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const { session } = useSession();

  const removeSession = async (sessionToRevoke: Session) => {
    await sessionToRevoke.revoke();
    setSessions(prev => prev.filter(s => s.id !== sessionToRevoke.id));
  };

  const revokeWithVerification = useReverification(removeSession);

  const fetchSessions = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const userSessions = await user.getSessions();
      setSessions(userSessions);
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const revokeSession = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      const sessionToRevoke = sessions.find(s => s.id === sessionId);
      if (sessionToRevoke) {
        await revokeWithVerification(sessionToRevoke);
      }
    } catch (error) {
      console.error('Erreur lors de la révocation:', error);
    } finally {
      setRevoking(null);
    }
  };

  return {
    sessions,
    currentSession: session,
    isLoading,
    revoking,
    revokeSession,
    refreshSessions: fetchSessions,
  };
}
