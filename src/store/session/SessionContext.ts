import { createContext, useContext } from 'react';

import type { SessionState } from './types';

export const SessionContext = createContext<SessionState>({
  status: 'restoring',
  signIn: async () => undefined,
  signOut: async () => undefined,
});

SessionContext.displayName = 'SessionContext';

/** Read the current session. The navigation tree responds to this. */
export const useSession = (): SessionState => useContext(SessionContext);
