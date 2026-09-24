export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  /** Unix epoch milliseconds. */
  expiresAt: number;
};

export type Credentials = {
  email: string;
  password: string;
};

export type AuthService = {
  signIn: (credentials: Credentials) => Promise<AuthTokens>;
  signOut: () => Promise<void>;
  refresh: (refreshToken: string) => Promise<AuthTokens>;
};
