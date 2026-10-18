import { z } from 'zod';

export const MyntraCrawlRequestSchema = z.object({
  color: z.string().trim().min(1, 'Color is required'),
  model: z.string().trim().min(1, 'Clothing model/type is required'),
  gender: z.enum(['all', 'men', 'women', 'kids']).optional().default('all'),
  limit: z.number().int().positive().max(50).optional().default(20),
});

export type MyntraCrawlRequest = z.infer<typeof MyntraCrawlRequestSchema>;

export const MyntraProductSchema = z.object({
  id: z.string(),
  brand: z.string(),
  title: z.string(),
  price: z.number(), // in ₹
  priceMinor: z.number(), // in paise
  mrp: z.number(),
  mrpMinor: z.number(),
  discount: z.string().nullable().optional(),
  rating: z.number().nullable().optional(),
  ratingCount: z.number().nullable().optional(),
  productUrl: z.string().url(),
  inStock: z.boolean().default(true),
  color: z.string().optional(),
  model: z.string().optional(),
});

export type MyntraProduct = z.infer<typeof MyntraProductSchema>;

export const MyntraCrawlResponseSchema = z.object({
  success: z.boolean(),
  source: z.literal('myntra'),
  querySlug: z.string(),
  myntraUrl: z.string().url(),
  totalCountAvailable: z.number().int().nonnegative().optional(),
  resultsCount: z.number().int().nonnegative(),
  products: z.array(MyntraProductSchema),
  crawledAt: z.string(),
  error: z.string().optional(),
});

export type MyntraCrawlResponse = z.infer<typeof MyntraCrawlResponseSchema>;
