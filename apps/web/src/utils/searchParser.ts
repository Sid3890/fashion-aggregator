import { ProductCategory } from '../types/catalog';

export interface ParsedSearchIntent {
  rawQuery: string;
  cleanedText: string;
  searchTokens: string[];
  category?: ProductCategory;
  flexibleCategories?: ProductCategory[];
  maxPriceRupees?: number;
  minPriceRupees?: number;
  color?: string;
  brand?: string;
  detectedFeatures: string[];
}

const STRICT_CATEGORY_MAP: Record<string, ProductCategory> = {
  kurti: 'Kurtis',
  kurtis: 'Kurtis',
  kurta: 'Kurtis',
  kurtas: 'Kurtis',
  saree: 'Sarees',
  sarees: 'Sarees',
  sari: 'Sarees',
  saris: 'Sarees',
  'ethnic set': 'Ethnic Sets',
  'ethnic sets': 'Ethnic Sets',
  'suit set': 'Ethnic Sets',
  'suit sets': 'Ethnic Sets',
  'sharara set': 'Ethnic Sets',
  dress: 'Dresses',
  dresses: 'Dresses',
  'maxi dress': 'Dresses',
  'midi dress': 'Dresses',
  top: 'Tops',
  tops: 'Tops',
  shirt: 'Tops',
  shirts: 'Tops',
  tunic: 'Tops',
  tunics: 'Tops',
  blouse: 'Tops',
  jeans: 'Jeans',
  denim: 'Jeans',
  juttis: 'Footwear',
  jutti: 'Footwear',
  mojari: 'Footwear',
  mojaris: 'Footwear',
  kolhapuri: 'Footwear',
  footwear: 'Footwear',
  sandals: 'Footwear',
};

const COLOR_MAP: Record<string, string> = {
  'pastel pink': 'Pastel Pink',
  'blush pink': 'Pastel Pink',
  pink: 'Pastel Pink',
  'emerald green': 'Emerald Green',
  green: 'Emerald Green',
  'mustard yellow': 'Mustard Yellow',
  mustard: 'Mustard Yellow',
  yellow: 'Mustard Yellow',
  'ruby red': 'Ruby Red',
  red: 'Ruby Red',
  'indigo blue': 'Indigo Blue',
  indigo: 'Indigo Blue',
  'powder blue': 'Indigo Blue',
  blue: 'Indigo Blue',
  'ivory white': 'Ivory White',
  ivory: 'Ivory White',
  white: 'Ivory White',
  'jet black': 'Jet Black',
  black: 'Jet Black',
  peach: 'Peach',
};

const BRAND_LIST = [
  'FabIndia',
  'Biba',
  'W for Woman',
  'Global Desi',
  'Libas',
  'Anouk',
  'Kalki Fashion',
];

const STOPWORDS = new Set([
  'find',
  'show',
  'search',
  'looking',
  'look',
  'for',
  'buy',
  'get',
  'a',
  'an',
  'the',
  'me',
  'under',
  'below',
  'less',
  'than',
  'up',
  'to',
  'between',
  'and',
  'in',
  'with',
  'at',
  'price',
  'budget',
  'rs',
  'inr',
  'rupees',
]);

export function parseNaturalLanguageQuery(query: string): ParsedSearchIntent {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      rawQuery: '',
      cleanedText: '',
      searchTokens: [],
      detectedFeatures: [],
    };
  }

  const normalized = trimmed.toLowerCase();
  const detectedFeatures: string[] = [];

  let maxPriceRupees: number | undefined;
  let minPriceRupees: number | undefined;
  let category: ProductCategory | undefined;
  let flexibleCategories: ProductCategory[] | undefined;
  let color: string | undefined;
  let brand: string | undefined;

  // 1. Budget extraction (e.g. "under ₹1,500", "below 2000", "< 1500", "under 1500")
  const underMatch = normalized.match(
    /(?:under|below|less than|<|up to|max|within)\s*(?:₹|rs\.?|inr)?\s*([0-9,]+)/i
  );
  if (underMatch && underMatch[1]) {
    const rawVal = parseInt(underMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(rawVal) && rawVal > 0) {
      maxPriceRupees = rawVal;
      detectedFeatures.push(`Budget ≤ ₹${rawVal.toLocaleString('en-IN')}`);
    }
  }

  const betweenMatch = normalized.match(
    /between\s*(?:₹|rs\.?)?\s*([0-9,]+)\s*(?:and|-|to)\s*(?:₹|rs\.?)?\s*([0-9,]+)/i
  );
  if (betweenMatch && betweenMatch[1] && betweenMatch[2]) {
    const minVal = parseInt(betweenMatch[1].replace(/,/g, ''), 10);
    const maxVal = parseInt(betweenMatch[2].replace(/,/g, ''), 10);
    if (!isNaN(minVal) && !isNaN(maxVal)) {
      minPriceRupees = minVal;
      maxPriceRupees = maxVal;
      detectedFeatures.push(`Budget ₹${minVal} - ₹${maxVal}`);
    }
  }

  // 2. Category extraction
  for (const [token, cat] of Object.entries(STRICT_CATEGORY_MAP)) {
    const regex = new RegExp(`\\b${token}\\b`, 'i');
    if (regex.test(normalized)) {
      category = cat;
      detectedFeatures.push(`Category: ${cat}`);
      break;
    }
  }

  // Special silhouette handling: Anarkali (can be Kurti or Ethnic Set)
  if (!category && /\banarkali\b/i.test(normalized)) {
    flexibleCategories = ['Kurtis', 'Ethnic Sets'];
    detectedFeatures.push('Silhouette: Anarkali (Kurtis & Sets)');
  }

  // 3. Color extraction
  for (const [token, col] of Object.entries(COLOR_MAP)) {
    const regex = new RegExp(`\\b${token}\\b`, 'i');
    if (regex.test(normalized)) {
      color = col;
      detectedFeatures.push(`Color: ${col}`);
      break;
    }
  }

  // 4. Brand extraction
  for (const b of BRAND_LIST) {
    const regex = new RegExp(`\\b${b.toLowerCase()}\\b`, 'i');
    if (regex.test(normalized)) {
      brand = b;
      detectedFeatures.push(`Brand: ${b}`);
      break;
    }
  }

  // 5. Cleaned text and tokens for text matching
  // Remove currency signs, price patterns, and punctuation
  const strippedText = normalized
    .replace(/(?:under|below|less than|<|up to|max|within)\s*(?:₹|rs\.?|inr)?\s*[0-9,]+/gi, '')
    .replace(/between\s*(?:₹|rs\.?)?\s*[0-9,]+\s*(?:and|-|to)\s*(?:₹|rs\.?)?\s*[0-9,]+/gi, '')
    .replace(/[₹,?!.;:()\[\]{}"'\\\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const searchTokens = strippedText
    .split(/\s+/)
    .filter((word) => word.length > 1 && !STOPWORDS.has(word) && isNaN(Number(word)));

  return {
    rawQuery: query,
    cleanedText: searchTokens.join(' '),
    searchTokens,
    category,
    flexibleCategories,
    maxPriceRupees,
    minPriceRupees,
    color,
    brand,
    detectedFeatures,
  };
}
