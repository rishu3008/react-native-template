import type { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Route parameters (AGENTS.md 25).
 *
 * Every route is declared here, and params are typed. Pass identifiers, not
 * objects: navigation state is serialised for deep links and state
 * restoration, so a whole entity in a param becomes stale data that survives
 * a reload.
 */
export type AuthStackParamList = {
  SignIn: undefined;
  /** Example of a route carrying a param. */
  ForgotPassword: { email?: string } | undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Settings: undefined;
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<AppTabParamList>;
  /** Example detail route: an id, never the record itself. */
  Details: { id: string };
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppStackParamList>;
};

/**
 * Makes useNavigation() typed everywhere without each call site passing a
 * generic. Screens still declare their own props for route params.
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
