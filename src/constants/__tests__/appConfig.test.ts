/**
 * appConfig reads react-native-config at module scope, so each case has to
 * load the module afresh against a different fake environment.
 */
const loadConfig = (values: Record<string, string | undefined>) => {
  let loaded: typeof import('../appConfig').appConfig | undefined;

  jest.isolateModules(() => {
    jest.doMock('react-native-config', () => ({
      __esModule: true,
      default: values,
    }));

    loaded = require('../appConfig').appConfig;
  });

  return loaded!;
};

afterEach(() => {
  jest.dontMock('react-native-config');
});

describe('appConfig', () => {
  it('keeps development explorable without a configured backend', () => {
    // The template ships no server, so this default is the reason a fresh
    // clone runs at all.
    const config = loadConfig({ ENVIRONMENT: 'development' });

    expect(config.apiBaseUrl).toBe('https://jsonplaceholder.typicode.com');
  });

  it.each(['staging', 'production'])(
    'refuses to start %s without an API base URL',
    environment => {
      // Falling back here would point a real build at a public test API and
      // send real tokens to it. Failing at startup is found by the first
      // person to run the build; a silent fallback is found by nobody.
      expect(() => loadConfig({ ENVIRONMENT: environment })).toThrow(
        `API_BASE_URL is missing from .env.${environment}`,
      );
    },
  );

  it('uses the configured URL when there is one', () => {
    const config = loadConfig({
      API_BASE_URL: 'https://api.example.com',
      ENVIRONMENT: 'production',
    });

    expect(config.apiBaseUrl).toBe('https://api.example.com');
  });

  it('treats an unrecognised environment as development, never production', () => {
    const config = loadConfig({ ENVIRONMENT: 'qa' });

    expect(config.environment).toBe('development');
  });
});
