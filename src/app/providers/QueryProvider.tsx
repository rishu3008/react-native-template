import {
  QueryClient,
  QueryClientProvider,
  type DefaultOptions,
} from '@tanstack/react-query';
import { useRef, type PropsWithChildren } from 'react';

import { isAppError } from '@services';

/**
 * Server-state cache (AGENTS.md 17).
 *
 * Server data lives here, not in global client state. Putting responses in a
 * store means hand-writing caching, invalidation and staleness for every
 * endpoint.
 */
const defaultOptions: DefaultOptions = {
  queries: {
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    // React Native has no window focus, and refetching on every app
    // foreground is a surprising amount of traffic on mobile data.
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // ApiClient already retried anything retryable at the transport level.
      // Retrying a 404 or a 401 here just delays the error state.
      if (isAppError(error) && !error.isRetryable) {
        return false;
      }

      return failureCount < 2;
    },
  },
  mutations: {
    // Mutations are not retried: a create that appears to fail may have
    // succeeded, and repeating it risks duplicates.
    retry: false,
  },
};

export const createQueryClient = () => new QueryClient({ defaultOptions });

export const QueryProvider = ({ children }: PropsWithChildren) => {
  // Created once per provider instance. Constructing it during render would
  // throw away the cache on every re-render.
  const clientRef = useRef<QueryClient>(null);
  clientRef.current ??= createQueryClient();

  return (
    <QueryClientProvider client={clientRef.current}>
      {children}
    </QueryClientProvider>
  );
};
