import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { sessionManager } from '@services';

import { SessionContext } from './SessionContext';
import type { SessionState, SessionStatus } from './types';

/**
 * Exposes session state to React (AGENTS.md 19).
 *
 * The lifecycle itself belongs to sessionManager; this is the binding that
 * turns it into state the navigation tree can render from. Keeping the two
 * apart means a token refresh triggered from an interceptor -- with no
 * component involved -- still reaches the UI through the same subscription.
 */
export const SessionProvider = ({ children }: PropsWithChildren) => {
  const [status, setStatus] = useState<SessionStatus>('restoring');

  useEffect(() => {
    let cancelled = false;

    // Subscribed before restore, so a sign-out raised during restore (an
    // expired refresh token, for instance) is not missed.
    const unsubscribe = sessionManager.subscribe(isAuthenticated => {
      if (!cancelled) {
        setStatus(isAuthenticated ? 'authenticated' : 'unauthenticated');
      }
    });

    sessionManager
      .restore()
      .then(isAuthenticated => {
        if (!cancelled) {
          setStatus(isAuthenticated ? 'authenticated' : 'unauthenticated');
        }
      })
      .catch(() => {
        // An unreadable keychain means no session, not a broken app. The
        // gate must open either way or the app hangs on the loader.
        if (!cancelled) {
          setStatus('unauthenticated');
        }
      });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(
    (email: string, password: string) => sessionManager.signIn(email, password),
    [],
  );

  const signOut = useCallback(() => sessionManager.signOut(), []);

  const value = useMemo<SessionState>(
    () => ({ status, signIn, signOut }),
    [status, signIn, signOut],
  );

  return <SessionContext value={value}>{children}</SessionContext>;
};
