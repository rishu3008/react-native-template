import type { LinkingOptions } from '@react-navigation/native';

import type { RootStackParamList } from '../types';

/**
 * Deep-link configuration (AGENTS.md 26, brief section 19).
 *
 * Structure only. The scheme matches the placeholder identity and is rewritten
 * by the rename script; the routes mirror the navigators so that adding a
 * screen and forgetting its link is visible in one file.
 *
 * Universal Links and App Links need native association files as well as this
 * config, which is why no https prefixes are declared here yet -- an entry
 * without the native side is a link that silently opens the browser.
 *
 * Every incoming parameter is untrusted (rule 26). Validate ids before using
 * them to fetch or navigate further.
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['templateproject://'],
  config: {
    screens: {
      Auth: {
        screens: {
          SignIn: 'sign-in',
          ForgotPassword: 'forgot-password',
        },
      },
      App: {
        screens: {
          Tabs: {
            screens: {
              Home: 'home',
              Settings: 'settings',
            },
          },
          Details: 'details/:id',
        },
      },
    },
  },
};
