import { useCallback, type PropsWithChildren } from 'react';

import { AppErrorBoundary } from '@components';
import { crashReporter, logger } from '@services';

/**
 * Connects the error boundary to logging and crash reporting.
 *
 * The boundary itself takes an `onError` callback rather than importing
 * either, so it stays a pure component (rules 6, 63). This is the app-layer
 * wiring that gives it teeth.
 */
export const AppErrorBoundaryProvider = ({ children }: PropsWithChildren) => {
  const handleError = useCallback(
    (error: Error, componentStack: string | null | undefined) => {
      logger.error('Unhandled render error', error, { componentStack });
      crashReporter.recordError(error, { componentStack });
    },
    [],
  );

  return <AppErrorBoundary onError={handleError}>{children}</AppErrorBoundary>;
};
