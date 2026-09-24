import { z } from 'zod';

/**
 * Runtime validation for an external response (AGENTS.md 16).
 *
 * TypeScript types are erased at build time and validate nothing. Without a
 * schema, a field the API renamed arrives as undefined and fails somewhere
 * far from the request, usually as a render crash.
 */
export const postSchema = z.object({
  id: z.number(),
  title: z.string(),
  body: z.string(),
});

export const postListSchema = z.array(postSchema);

export type Post = z.infer<typeof postSchema>;
