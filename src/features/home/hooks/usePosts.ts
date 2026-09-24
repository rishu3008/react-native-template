import { useQuery } from '@tanstack/react-query';

import { postRepository } from '../api/postRepository';

/**
 * Query keys as a const tree (AGENTS.md 17).
 *
 * Stringly-typed keys scattered across features are how invalidation silently
 * stops matching. Declaring them in one place means `invalidateQueries({
 * queryKey: postKeys.all })` provably covers every post query.
 */
export const postKeys = {
  all: ['posts'] as const,
  list: () => [...postKeys.all, 'list'] as const,
  detail: (id: string) => [...postKeys.all, 'detail', id] as const,
};

/**
 * The hook layer between screen and repository (rule 15).
 *
 * Screens call this; they never touch the repository or the API client. The
 * signal is forwarded so React Query can cancel an in-flight request when the
 * screen unmounts.
 */
export const usePosts = () =>
  useQuery({
    queryKey: postKeys.list(),
    queryFn: ({ signal }) => postRepository.list(signal),
  });

export const usePost = (id: string) =>
  useQuery({
    queryKey: postKeys.detail(id),
    queryFn: ({ signal }) => postRepository.byId(id, signal),
    enabled: id.length > 0,
  });
