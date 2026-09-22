import { appConfig } from '@constants';
import {
  apiClient,
  authService,
  installAuthInterceptors,
  mockAuthService,
  sessionManager,
} from '@services';

/**
 * Application initialisation (AGENTS.md 17, brief section 17).
 *
 * One place where services are connected to each other, rather than modules
 * wiring themselves up at import time. Import-time side effects are what make
 * startup order implicit and tests interdependent.
 *
 * Idempotent: React strict mode mounts twice in development, and a second
 * call must not stack a duplicate set of interceptors.
 */
let teardown: (() => void) | null = null;

export const bootstrap = (): void => {
  if (teardown != null) {
    return;
  }

  // Chosen here rather than inside the auth service, so the real service has
  // no knowledge of a mock and cannot accidentally fall back to one.
  sessionManager.configure(
    appConfig.useMockAuth ? mockAuthService : authService,
  );
  teardown = installAuthInterceptors(apiClient);
};

export const teardownBootstrap = (): void => {
  teardown?.();
  teardown = null;
};
