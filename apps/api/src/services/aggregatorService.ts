import {
  FashionAttributes,
  ScrapedProduct,
  VisualSearchResponse,
} from '@fashion-aggregator/contracts';
import { crawlMyntra } from './myntraCrawler.js';

export interface RetailerAdapter {
  id: string;
  name: string;
  isAvailable: boolean;
  crawl: (params: {
    color: string;
    model: string;
    gender?: 'all' | 'women' | 'men' | 'kids';
    limit?: number;
  }) => Promise<{ products: ScrapedProduct[]; totalCount?: number }>;
}

/**
 * Registry of retailer crawler adapters.
 * Myntra is active and live. Future adapters (Ajio, Zara, H&M) can plug in seamlessly.
 */
const RETAILER_ADAPTERS: Record<string, RetailerAdapter> = {
  myntra: {
    id: 'myntra',
    name: 'Myntra',
    isAvailable: true,
    crawl: async (params) => {
      const myntraRes = await crawlMyntra({
        color: params.color,
        model: params.model,
        gender: params.gender || 'all',
        limit: params.limit || 20,
      });

      const products: ScrapedProduct[] = myntraRes.products.map((p) => ({
        id: `myntra-${p.id}`,
        store: 'Myntra',
        brand: p.brand,
        title: p.title,
        price: p.price,
        priceMinor: p.priceMinor,
        mrp: p.mrp,
        mrpMinor: p.mrpMinor,
        discount: p.discount,
        rating: p.rating,
        ratingCount: p.ratingCount,
        productUrl: p.productUrl,
        inStock: p.inStock,
        color: p.color,
        garmentType: p.model,
      }));

      return {
        products,
        totalCount: myntraRes.totalCountAvailable,
      };
    },
  },
};

/**
 * Global Multi-Store Aggregation Pipeline
 * Dispatches the identified garment parameters to registered retailer crawlers
 * and aggregates the live scraped results.
 */
export async function aggregateProductsFromVision(
  attributes: FashionAttributes,
  selectedStores: string[] = ['myntra'],
  limit: number = 20
): Promise<{ products: ScrapedProduct[]; totalAvailable: number; storesQueried: string[] }> {
  const storesToQuery = selectedStores.length > 0 ? selectedStores : ['myntra'];
  const storesQueried: string[] = [];
  const allProducts: ScrapedProduct[] = [];
  let totalAvailable = 0;

  for (const storeKey of storesToQuery) {
    const adapter = RETAILER_ADAPTERS[storeKey.toLowerCase()];
    if (adapter && adapter.isAvailable) {
      try {
        storesQueried.push(adapter.name);
        const genderParam = attributes.department === 'unisex' ? 'all' : attributes.department;
        const { products, totalCount } = await adapter.crawl({
          color: attributes.primaryColor,
          model: attributes.garmentType,
          gender: genderParam,
          limit,
        });

        allProducts.push(...products);
        if (totalCount) totalAvailable += totalCount;
      } catch (err: any) {
        console.error(`[Aggregator] Crawler for ${adapter.name} failed:`, err.message);
      }
    }
  }

  return {
    products: allProducts,
    totalAvailable: totalAvailable || allProducts.length,
    storesQueried,
  };
}
