import Config from 'react-native-config';

/**
 * Build-time configuration (AGENTS.md 24).
 *
 * Lives in constants rather than the app layer because services need it and
 * rule 6 forbids services from importing app. Config is a value, not
 * application wiring.
 *
 * Values come from the .env file selected by the build variant. Nothing
 * secret belongs here: anything compiled into a mobile binary is extractable
 * (rule 23).
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
   * it to false.
   */
  useMockAuth: boolean;
};

/**
 * Everything crosses the native bridge as a string, including numbers and
 * booleans -- the native side has no view on what the .env file meant. Parsing
 * here means no other module has to remember that.
 */
const asBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value == null) {
    return fallback;
  }

  return value.toLowerCase() === 'true' || value === '1';
};

const asNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);

  // A typo in .env must not produce NaN timeouts, which compare false against
  // everything and disable the timeout entirely.
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const asEnvironment = (value: string | undefined): AppEnvironment => {
  if (value === 'staging' || value === 'production') {
    return value;
  }

  // Unrecognised values fall back to development rather than being trusted:
  // an unknown environment must never be treated as production.
  return 'development';
};

const environment = asEnvironment(Config.ENVIRONMENT);

/**
 * The base URL, with a default only where a default is safe.
 *
 * Development gets one because the template ships no server and should be
 * explorable straight after cloning.
 *
 * Staging and production get none. A build that reaches them without
 * API_BASE_URL is misconfigured, and the alternative to failing here is an app
 * that quietly sends real traffic -- and real access tokens -- to a public
 * test API. Throwing at startup means the first person to run the build finds
 * it; falling back means nobody does (rules 23, 24).
 */
const resolveBaseUrl = (value: string | undefined): string => {
  if (value != null && value !== '') {
    return value;
  }

  if (environment === 'development') {
    return 'https://jsonplaceholder.typicode.com';
  }

  throw new Error(
    `API_BASE_URL is missing from .env.${environment}. Set it there and ` +
      'rebuild -- these values are compiled into the binary, so a Metro ' +
      'reload will not pick up the change.',
  );
};

export const appConfig: AppConfig = {
  environment,
  apiBaseUrl: resolveBaseUrl(Config.API_BASE_URL),
  apiTimeoutMs: asNumber(Config.API_TIMEOUT_MS, 15_000),
  apiMaxRetries: asNumber(Config.API_MAX_RETRIES, 2),
  enableDevTools: asBoolean(Config.ENABLE_DEV_TOOLS, __DEV__),
  useMockAuth: asBoolean(Config.USE_MOCK_AUTH, __DEV__),
};

export const isProduction = appConfig.environment === 'production';
export const isStaging = appConfig.environment === 'staging';
export const isDevelopment = appConfig.environment === 'development';
