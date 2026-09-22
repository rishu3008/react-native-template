import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { storageKeys } from '@constants';
import { storageService } from '@services';

import { SessionContext } from './SessionContext';
import type { SessionState, SessionStatus } from './types';

/**
 * Session state for the navigation tree (AGENTS.md 19).
 *
 * This is deliberately a placeholder: it persists a flag so the signed-in
 * state survives a relaunch, and nothing more. The real implementation --
 * tokens, refresh, expiry -- belongs to the auth service, and replacing this
 * provider's internals will not change the navigation tree, because the tree
 * depends only on `status`.
 */
export const SessionProvider = ({ children }: PropsWithChildren) => {
  const [status, setStatus] = useState<SessionStatus>('restoring');

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      const stored = await storageService.getString(storageKeys.session);

      if (!cancelled) {
        setStatus(stored === 'active' ? 'authenticated' : 'unauthenticated');
      }
    };

    restore().catch(() => {
      // An unreadable store means no session, not a broken app.
      if (!cancelled) {
        setStatus('unauthenticated');
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async () => {
    await storageService.setString(storageKeys.session, 'active');
    setStatus('authenticated');
  }, []);

  const signOut = useCallback(async () => {
    await storageService.remove(storageKeys.session);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo<SessionState>(
    () => ({ status, signIn, signOut }),
    [status, signIn, signOut],
  );

  return <SessionContext value={value}>{children}</SessionContext>;
};
