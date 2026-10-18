import { MyntraCrawlRequest, MyntraCrawlResponse, MyntraProduct } from '@fashion-aggregator/contracts';

const BROWSER_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
];

function getRandomUserAgent(): string {
  const idx = Math.floor(Math.random() * BROWSER_USER_AGENTS.length);
  return BROWSER_USER_AGENTS[idx];
}

export function buildMyntraSlug(params: { color: string; model: string; gender?: string }): string {
  const parts: string[] = [];

  if (params.gender && params.gender !== 'all') {
    parts.push(params.gender.toLowerCase().trim());
  }

  if (params.color) {
    const cleanColor = params.color
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (cleanColor) parts.push(cleanColor);
  }

  if (params.model) {
    const cleanModel = params.model
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (cleanModel) parts.push(cleanModel);
  }

  return parts.join('-');
}

export async function crawlMyntra(request: MyntraCrawlRequest): Promise<MyntraCrawlResponse> {
  const slug = buildMyntraSlug({
    color: request.color,
    model: request.model,
    gender: request.gender,
  });

  if (!slug) {
    throw new Error('Invalid query parameters: Unable to generate valid search path');
  }

  const targetUrl = `https://www.myntra.com/${slug}`;

  const headers = {
    'User-Agent': getRandomUserAgent(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
    'sec-ch-ua': '"Chromium";v="124", "Not-A.Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  };

  const response = await fetch(targetUrl, {
    headers,
    signal: AbortSignal.timeout(12000), // 12 second timeout
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(`Myntra crawler failed with HTTP ${response.status}: ${response.statusText}`);
  }

  const html = await response.text();

  // Parse SSR JSON payload embedded in window.__myx
  const myxMarker = 'window.__myx = ';
  const myxIdx = html.indexOf(myxMarker);

  if (myxIdx === -1) {
    return {
      success: false,
      source: 'myntra',
      querySlug: slug,
      myntraUrl: targetUrl,
      totalCountAvailable: 0,
      resultsCount: 0,
      products: [],
      crawledAt: new Date().toISOString(),
      error: 'No product data payload found in response from Myntra. Possible temporary block or unknown query.',
    };
  }

  const scriptEnd = html.indexOf('</script>', myxIdx);
  if (scriptEnd === -1) {
    throw new Error('Malformed HTML structure from Myntra');
  }

  const rawJson = html.substring(myxIdx + myxMarker.length, scriptEnd).trim();
  let parsedData: any;
  try {
    parsedData = JSON.parse(rawJson);
  } catch (err: any) {
    throw new Error(`Failed to parse Myntra payload JSON: ${err.message}`);
  }

  const rawProducts = parsedData?.searchData?.results?.products || [];
  const totalCount = parsedData?.searchData?.results?.totalCount || rawProducts.length;

  const limit = request.limit || 20;
  const slicedProducts = rawProducts.slice(0, limit);

  const products: MyntraProduct[] = slicedProducts.map((p: any) => {
    const priceRupees = Number(p.price) || 0;
    const mrpRupees = Number(p.mrp) || priceRupees;

    // Normalizing outbound landing URL
    let fullUrl = p.landingPageUrl || '';
    if (fullUrl && !fullUrl.startsWith('http')) {
      fullUrl = `https://www.myntra.com/${fullUrl.replace(/^\/+/, '')}`;
    }

    return {
      id: String(p.productId || p.id || Math.random().toString(36).substring(7)),
      brand: String(p.brand || 'Unbranded').trim(),
      title: String(p.product || p.productName || p.brand || 'Fashion Garment').trim(),
      price: priceRupees,
      priceMinor: Math.round(priceRupees * 100),
      mrp: mrpRupees,
      mrpMinor: Math.round(mrpRupees * 100),
      discount: p.discountDisplayLabel || null,
      rating: typeof p.rating === 'number' ? Math.round(p.rating * 10) / 10 : null,
      ratingCount: typeof p.ratingCount === 'number' ? p.ratingCount : null,
      productUrl: fullUrl,
      inStock: p.inventoryInfo ? p.inventoryInfo.length > 0 : true,
      color: request.color,
      model: request.model,
    };
  });

  return {
    success: true,
    source: 'myntra',
    querySlug: slug,
    myntraUrl: targetUrl,
    totalCountAvailable: totalCount,
    resultsCount: products.length,
    products,
    crawledAt: new Date().toISOString(),
  };
}
