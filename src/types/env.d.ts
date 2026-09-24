/**
 * Types for react-native-config.
 *
 * Every value arrives as a string, including numbers and booleans -- the
 * native side has no concept of the .env file's intent. appConfig does the
 * parsing so no other code has to remember that.
 */
declare module 'react-native-config' {
  export type NativeConfig = {
    ENVIRONMENT?: string;
    API_BASE_URL?: string;
    API_TIMEOUT_MS?: string;
    API_MAX_RETRIES?: string;
    USE_MOCK_AUTH?: string;
    ENABLE_DEV_TOOLS?: string;
  };

  export const Config: NativeConfig;
  export default Config;
}
