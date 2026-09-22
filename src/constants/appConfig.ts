/**
 * Build-time configuration (AGENTS.md 24).
 *
 * Lives in constants rather than the app layer because services need it and
 * rule 6 forbids services from importing app. Config is a value, not
 * application wiring.
 *
 * Deliberately a plain module with no native dependency yet: the environment
 * phase replaces the values with a real per-variant source (`.env` files and
 * native build configs), and every consumer keeps importing `appConfig`
 * rather than reading process.env at call sites.
 *
 * Nothing secret belongs here. Anything shipped in a mobile binary is
 * extractable (rule 23), so this holds endpoints and flags only.
 */
export type AppEnvironment = 'development' | 'staging' | 'production';

export type AppConfig = {
  environment: AppEnvironment;
  apiBaseUrl: string;
  /** Milliseconds before a request is abandoned. */
  apiTimeoutMs: number;
  /** Attempts after the first, for retryable failures only. */
  apiMaxRetries: number;
  enableDevTools: boolean;
  /**
   * Use the local auth stub instead of a real backend.
   *
   * The template ships no server, so this is on in development to keep the
   * app explorable after cloning. Point apiBaseUrl at a real backend and set
   * this to false.
   */
  useMockAuth: boolean;
};

const environment: AppEnvironment = __DEV__ ? 'development' : 'production';

export const appConfig: AppConfig = {
  environment,
  // Placeholder. The environment phase wires this to the build variant.
  apiBaseUrl: 'https://jsonplaceholder.typicode.com',
  apiTimeoutMs: 15_000,
  apiMaxRetries: 2,
  enableDevTools: __DEV__,
  useMockAuth: __DEV__,
};
