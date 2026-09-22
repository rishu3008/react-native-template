/**
 * Session state (AGENTS.md 19).
 *
 * `restoring` is distinct from `unauthenticated`: at launch the app does not
 * yet know which it is, and treating unknown as signed-out flashes the
 * sign-in screen at every returning user.
 */
export type SessionStatus = 'restoring' | 'authenticated' | 'unauthenticated';

export type SessionState = {
  status: SessionStatus;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};
