import { z } from 'zod';

export const FashionAttributesSchema = z.object({
  garmentType: z.string().min(1, 'Garment type is required'),
  primaryColor: z.string().min(1, 'Primary color is required'),
  primaryColorHex: z.string().default('#000000'),
  secondaryColors: z.array(z.string()).default([]),
  pattern: z.string().default('Solid'),
  style: z.string().default('Casual'),
  department: z.enum(['women', 'men', 'unisex', 'kids']).default('unisex'),
  fabricHint: z.string().optional(),
  confidence: z.number().min(0).max(1).default(0.9),
  canonicalQuery: z.string(),
  explanation: z.string().optional(),
});

export type FashionAttributes = z.infer<typeof FashionAttributesSchema>;

export const VisionAnalysisRequestSchema = z
  .object({
    imageBase64: z.string().optional(),
    imageUrl: z.string().url().optional(),
    fileName: z.string().optional(),
    departmentHint: z.enum(['all', 'women', 'men', 'kids', 'unisex']).optional().default('all'),
    stores: z.array(z.string()).optional().default(['myntra']),
    limit: z.number().int().positive().max(50).optional().default(20),
  })
  .refine((data) => Boolean(data.imageBase64 || data.imageUrl), {
    message: 'Either imageBase64 or imageUrl must be provided',
  });

export type VisionAnalysisRequest = z.infer<typeof VisionAnalysisRequestSchema>;

export const ScrapedProductSchema = z.object({
  id: z.string(),
  store: z.string(), // e.g. 'myntra', 'zara', 'hm'
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
  garmentType: z.string().optional(),
});

export type ScrapedProduct = z.infer<typeof ScrapedProductSchema>;

export const VisualSearchResponseSchema = z.object({
  success: z.boolean(),
  analysis: FashionAttributesSchema,
  products: z.array(ScrapedProductSchema),
  storesQueried: z.array(z.string()),
  totalCountAvailable: z.number().int().nonnegative().optional(),
  resultsCount: z.number().int().nonnegative(),
  elapsedMs: z.number().optional(),
  timestamp: z.string(),
  error: z.string().optional(),
});

export type VisualSearchResponse = z.infer<typeof VisualSearchResponseSchema>;
