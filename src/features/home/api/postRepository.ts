import { AppError, apiClient } from '@services';

import { postListSchema, postSchema, type Post } from './postSchema';

/**
 * Data access for posts (AGENTS.md 14, 15).
 *
 * Repositories answer "where does the data come from". They own the endpoint
 * paths and the parsing; callers get validated domain objects or an AppError,
 * never a raw response.
 *
 * A schema mismatch becomes a `parse` AppError rather than a thrown ZodError,
 * so the UI has one error type to handle regardless of where it failed.
 */
const parseOrThrow = <T>(
  schema: { safeParse: (value: unknown) => { success: boolean; data?: T } },
  value: unknown,
): T => {
  const result = schema.safeParse(value);

  if (!result.success || result.data === undefined) {
    throw AppError.from('parse', { cause: value });
  }

  return result.data;
};

export const postRepository = {
  async list(signal?: AbortSignal): Promise<Post[]> {
    const response = await apiClient.get<unknown>('/posts', {
      query: { _limit: 10 },
      ...(signal != null && { signal }),
    });

    return parseOrThrow(postListSchema, response);
  },

  async byId(id: string, signal?: AbortSignal): Promise<Post> {
    const response = await apiClient.get<unknown>(`/posts/${id}`, {
      ...(signal != null && { signal }),
    });

    return parseOrThrow(postSchema, response);
  },
};
