import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  pageSize: z.coerce.number().int().positive().max(100).default(24),
  cursor: z.string().nullable().optional(),
});

export const PaginationMetaSchema = z.object({
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
  totalCount: z.number().int().nonnegative().optional(),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;
