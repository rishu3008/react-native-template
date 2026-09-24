import { linking } from '@navigation';

describe('linking', () => {
  it('uses the placeholder URL scheme', () => {
    // The rename script rewrites this alongside the native identifiers.
    expect(linking.prefixes).toContain('templateproject://');
  });

  it('declares a route for every navigator', () => {
    const screens = linking.config?.screens;

    expect(screens).toHaveProperty('Auth');
    expect(screens).toHaveProperty('App');
  });

  it('routes details by id rather than by object', () => {
    const app = linking.config?.screens.App;
    const appScreens =
      typeof app === 'object' && 'screens' in app ? app.screens : undefined;

    // Navigation state is serialised for deep links and restoration, so a
    // whole record in a param becomes stale data that survives a reload.
    expect(appScreens?.Details).toBe('details/:id');
  });
});
