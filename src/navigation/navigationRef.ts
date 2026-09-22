import {
  createNavigationContainerRef,
  type NavigationAction,
} from '@react-navigation/native';

import type { RootStackParamList } from './types';

/**
 * Imperative navigation for callers that are not React components --
 * notification handlers, deep-link routing, an interceptor that has to bounce
 * the user to sign-in after a failed refresh.
 *
 * Screens use useNavigation(). This exists for the places that cannot.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Dispatch only once the container is mounted.
 *
 * Navigating before then is a no-op that looks like a bug: a notification
 * tapped from cold start fires before the tree exists. Callers in that
 * position should queue the intent and replay it after the container is
 * ready, rather than assuming this succeeded.
 */
export const dispatchWhenReady = (action: NavigationAction): boolean => {
  if (!navigationRef.isReady()) {
    return false;
  }

  navigationRef.dispatch(action);
  return true;
};

export const isNavigationReady = (): boolean => navigationRef.isReady();
