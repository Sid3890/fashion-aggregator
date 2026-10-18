import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseNaturalLanguageQuery } from '../src/utils/searchParser.js';
import { SEED_PRODUCTS } from '../src/data/seedProducts.js';
import { validateOutboundUrl } from '../src/utils/outboundUrl.js';
import { paiseToRupees, calculateTotalCost, calculateFreshness } from '@fashion-aggregator/domain';

describe('Search & Discovery: Natural-Language Parser', () => {
  it('parses "Find a pastel pink kurti under ₹1,500" correctly', () => {
    const parsed = parseNaturalLanguageQuery('Find a pastel pink kurti under ₹1,500');
    assert.equal(parsed.category, 'Kurtis');
    assert.equal(parsed.color, 'Pastel Pink');
    assert.equal(parsed.maxPriceRupees, 1500);
    assert.ok(parsed.detectedFeatures.some((f) => f.includes('Budget ≤ ₹1,500')));
    assert.ok(parsed.detectedFeatures.some((f) => f.includes('Category: Kurtis')));
    assert.ok(parsed.detectedFeatures.some((f) => f.includes('Color: Pastel Pink')));
  });

  it('parses "Banarasi silk saree under ₹5,000" correctly', () => {
    const parsed = parseNaturalLanguageQuery('Banarasi silk saree under ₹5,000');
    assert.equal(parsed.category, 'Sarees');
    assert.equal(parsed.maxPriceRupees, 5000);
    assert.ok(parsed.searchTokens.includes('banarasi'));
    assert.ok(parsed.searchTokens.includes('silk'));
  });

  it('parses "Mustard yellow anarkali under ₹1,500" with flexible anarkali categories', () => {
    const parsed = parseNaturalLanguageQuery('Mustard yellow anarkali under ₹1,500');
    assert.equal(parsed.color, 'Mustard Yellow');
    assert.equal(parsed.maxPriceRupees, 1500);
    assert.ok(parsed.flexibleCategories?.includes('Kurtis'));
    assert.ok(parsed.flexibleCategories?.includes('Ethnic Sets'));
    assert.ok(parsed.searchTokens.includes('anarkali'));
  });

  it('parses "Blue shirt" with Category Tops and Color Indigo Blue', () => {
    const parsed = parseNaturalLanguageQuery('Blue shirt');
    assert.equal(parsed.category, 'Tops');
    assert.equal(parsed.color, 'Indigo Blue');
    assert.ok(parsed.searchTokens.includes('shirt'));
  });

  it('parses budget ranges with between keyword', () => {
    const parsed = parseNaturalLanguageQuery('cotton dress between 1000 and 3000');
    assert.equal(parsed.category, 'Dresses');
    assert.equal(parsed.minPriceRupees, 1000);
    assert.equal(parsed.maxPriceRupees, 3000);
  });

  it('gracefully handles empty queries', () => {
    const parsed = parseNaturalLanguageQuery('   ');
    assert.equal(parsed.rawQuery, '');
    assert.equal(parsed.category, undefined);
    assert.equal(parsed.color, undefined);
    assert.equal(parsed.maxPriceRupees, undefined);
    assert.equal(parsed.searchTokens.length, 0);
  });
});

describe('Catalog Integrity: Seeded Demo Products', () => {
  it('contains at least 16 products across all 7 required categories', () => {
    assert.ok(SEED_PRODUCTS.length >= 16);
    const categories = new Set(SEED_PRODUCTS.map((p) => p.category));
    assert.ok(categories.has('Kurtis'));
    assert.ok(categories.has('Sarees'));
    assert.ok(categories.has('Ethnic Sets'));
    assert.ok(categories.has('Dresses'));
    assert.ok(categories.has('Tops'));
    assert.ok(categories.has('Jeans'));
    assert.ok(categories.has('Footwear'));
  });

  it('has a verified blue shirt in the Tops category', () => {
    const blueTops = SEED_PRODUCTS.filter(
      (p) => p.category === 'Tops' && p.color === 'Indigo Blue'
    );
    assert.ok(blueTops.length >= 1, 'Expected at least 1 blue top');
    assert.ok(blueTops[0].title.toLowerCase().includes('shirt'));
  });

  it('every product has integer minor-unit pricing and at least one seller offer', () => {
    for (const p of SEED_PRODUCTS) {
      assert.ok(Number.isInteger(p.lowestPriceMinor), `${p.id} price must be integer paise`);
      assert.ok(p.lowestPriceMinor > 0, `${p.id} price must be positive`);
      assert.ok(p.offers.length > 0, `${p.id} must have at least one store offer`);
      assert.ok(p.imageUrl.startsWith('https://'), `${p.id} must have a secure image URL`);
      assert.ok(p.availableSizes.length > 0, `${p.id} must have available sizes`);
    }
  });
});

describe('Search & Filter Matching Engine', () => {
  // Helper implementing the exact filtering logic from page.tsx
  function filterCatalog(query: string, manualCategory = 'All', manualColors: string[] = []) {
    const parsed = parseNaturalLanguageQuery(query);

    return SEED_PRODUCTS.filter((product) => {
      // 1. Category
      if (manualCategory !== 'All') {
        if (product.category !== manualCategory) return false;
      } else if (parsed.category) {
        if (product.category !== parsed.category) return false;
      } else if (parsed.flexibleCategories && parsed.flexibleCategories.length > 0) {
        if (!parsed.flexibleCategories.includes(product.category)) return false;
      }

      // 2. Color
      if (manualColors.length > 0) {
        if (!manualColors.includes(product.color)) return false;
      } else if (parsed.color) {
        const matchesColor =
          product.color.toLowerCase() === parsed.color.toLowerCase() ||
          product.styleKeywords.includes(parsed.color.toLowerCase()) ||
          product.title.toLowerCase().includes(parsed.color.toLowerCase());
        if (!matchesColor) return false;
      }

      // 3. Price
      const priceRupees = paiseToRupees(product.lowestPriceMinor);
      if (parsed.maxPriceRupees && priceRupees > parsed.maxPriceRupees) {
        return false;
      }
      if (parsed.minPriceRupees && priceRupees < parsed.minPriceRupees) {
        return false;
      }

      // 4. Search Tokens
      if (parsed.searchTokens.length > 0) {
        const searchableCorpus = `${product.title} ${product.description} ${product.fabric} ${product.brand} ${product.category} ${product.color} ${product.tags.join(' ')} ${product.styleKeywords.join(' ')}`.toLowerCase();

        const unfulfilledTokens = parsed.searchTokens.filter((token) => {
          if (parsed.category && token === parsed.category.toLowerCase()) return false;
          if (parsed.color && parsed.color.toLowerCase().includes(token)) return false;
          return true;
        });

        for (const token of unfulfilledTokens) {
          if (!searchableCorpus.includes(token)) return false;
        }
      }

      return true;
    });
  }

  it('matches "Blue shirt" to the Indigo Blue Hand-Block Printed Shirt', () => {
    const results = filterCatalog('Blue shirt');
    assert.ok(results.length >= 1, 'Expected at least 1 match for Blue shirt');
    assert.equal(results[0].category, 'Tops');
    assert.equal(results[0].color, 'Indigo Blue');
    assert.ok(results[0].title.toLowerCase().includes('shirt'));
  });

  it('matches "Find a pastel pink kurti under ₹1,500" to FabIndia Chikankari Kurti', () => {
    const results = filterCatalog('Find a pastel pink kurti under ₹1,500');
    assert.ok(results.length >= 1);
    assert.equal(results[0].category, 'Kurtis');
    assert.equal(results[0].color, 'Pastel Pink');
    assert.ok(paiseToRupees(results[0].lowestPriceMinor) <= 1500);
  });

  it('matches "Banarasi silk saree under ₹5,000" to Kalki Fashion Banarasi Saree', () => {
    const results = filterCatalog('Banarasi silk saree under ₹5,000');
    assert.ok(results.length >= 1);
    assert.equal(results[0].category, 'Sarees');
    assert.ok(paiseToRupees(results[0].lowestPriceMinor) <= 5000);
    assert.ok(results[0].title.toLowerCase().includes('banarasi'));
  });

  it('matches "Mustard yellow anarkali under ₹1,500" to Biba Anarkali Kurti', () => {
    const results = filterCatalog('Mustard yellow anarkali under ₹1,500');
    assert.ok(results.length >= 1);
    assert.equal(results[0].color, 'Mustard Yellow');
    assert.ok(paiseToRupees(results[0].lowestPriceMinor) <= 1500);
    assert.ok(results[0].title.toLowerCase().includes('anarkali'));
  });

  it('returns honest empty array for non-existent queries without fabricating results', () => {
    const results = filterCatalog('Neon green tuxedo under ₹500');
    assert.equal(results.length, 0);
  });

  it('handles sequential search transitions from blue shirt to empty and back', () => {
    // 1. Initial state
    let results = filterCatalog('');
    assert.equal(results.length, SEED_PRODUCTS.length);

    // 2. Search blue shirt
    results = filterCatalog('blue shirt');
    assert.equal(results.length, 1);
    assert.equal(results[0].id, 'prod-top-03');

    // 3. Clear search
    results = filterCatalog('');
    assert.equal(results.length, SEED_PRODUCTS.length);

    // 4. Search pastel pink kurti under 1500
    results = filterCatalog('Find a pastel pink kurti under ₹1,500');
    assert.equal(results.length, 1);
    assert.equal(results[0].id, 'prod-kurti-01');

    // 5. Restore again
    results = filterCatalog('');
    assert.equal(results.length, SEED_PRODUCTS.length);
  });
});

describe('Product Comparison & Cost Calculation Engine', () => {
  it('correctly maps actual selected product data in comparison', () => {
    const selected = [SEED_PRODUCTS[0], SEED_PRODUCTS[1]];
    assert.equal(selected[0].title, 'Pastel Pink Hand-Embroidered Chikankari Cotton Kurti');
    assert.equal(selected[1].title, 'Emerald Green Zari Yoke A-Line Chanderi Kurti');
    assert.equal(selected[0].brand, 'FabIndia');
    assert.equal(selected[1].brand, 'W for Woman');
    assert.equal(selected[0].fabric, 'Pure Mulmul Cotton');
  });

  it('verifies all demo seller offers have canonical product IDs, explicit currency, and transparent unavailable links', () => {
    let auditedProductCount = 0;
    let auditedOfferCount = 0;
    let unavailableOfferCount = 0;

    for (const p of SEED_PRODUCTS) {
      auditedProductCount++;
      assert.equal(p.isDemo, true, `Product ${p.id} must be clearly marked as demo`);

      for (const o of p.offers) {
        auditedOfferCount++;
        assert.equal(
          o.canonicalProductId,
          p.id,
          `Offer ${o.id} must reference its canonical product ${p.id}`
        );
        assert.equal(o.currency, 'INR', `Offer ${o.id} currency must be INR`);
        assert.equal(
          o.verificationSource,
          'demo_illustrative',
          `Offer ${o.id} must be marked as demo_illustrative`
        );
        assert.equal(
          o.isVerifiedMatch,
          false,
          `Illustrative offer ${o.id} must not claim unverified match`
        );
        assert.equal(
          o.productUrl,
          null,
          `Illustrative offer ${o.id} must not guess external product URLs`
        );

        const val = validateOutboundUrl(o.productUrl, {
          canonicalProductId: p.id,
          offerCanonicalProductId: o.canonicalProductId,
          isVerifiedMatch: o.isVerifiedMatch,
          verificationSource: o.verificationSource,
        });
        assert.equal(val.isValid, false);
        assert.equal(val.sanitizedUrl, null);
        assert.equal(val.reason, 'Product link unavailable');
        unavailableOfferCount++;

        assert.ok(
          o.priceMinor > 0 && Number.isInteger(o.priceMinor),
          `Seller offer ${o.id} price must be positive integer paise`
        );
        if (o.shippingMinor !== null) {
          assert.ok(
            o.shippingMinor >= 0 && Number.isInteger(o.shippingMinor),
            `Shipping fee on ${o.id} must be non-negative integer paise or null`
          );
        }
      }
    }

    assert.equal(auditedProductCount, 16, 'Expected exactly 16 catalog products audited');
    assert.equal(auditedOfferCount, 30, 'Expected exactly 30 seller offers audited');
    assert.equal(unavailableOfferCount, 30, 'Expected all 30 unverified demo offers to be unavailable');
  });

  it('correctly calculates total cost with shipping transparency', () => {
    const product = SEED_PRODUCTS[0];
    const offerWithFreeShipping = product.offers.find((o) => o.shippingMinor === 0);
    assert.ok(offerWithFreeShipping);

    const calc = calculateTotalCost({
      itemPriceMinor: offerWithFreeShipping.priceMinor,
      shippingMinor: offerWithFreeShipping.shippingMinor,
    });
    assert.equal(calc.isComplete, true);
    assert.equal(calc.totalKnownMinor, offerWithFreeShipping.priceMinor);
  });

  it('never marks total cost as complete when shipping is unknown (Section 7.4)', () => {
    const calc = calculateTotalCost({
      itemPriceMinor: 149900,
      shippingMinor: null,
    });
    assert.equal(calc.isComplete, false);
    assert.equal(calc.totalKnownMinor, null);
    assert.ok(calc.notes.some((n) => n.toLowerCase().includes('shipping')));
  });

  it('computes price freshness dynamically without errors', () => {
    const status = calculateFreshness(new Date().toISOString());
    assert.equal(status, 'fresh');
  });
});

describe('Product-to-URL Integrity & Outbound Navigation Validator', () => {
  it('1. verifies a correct product and seller URL pair when confirmed by authorized feed', () => {
    const verifiedUrl =
      'https://www.myntra.com/kurtis/fabindia/fabindia-pink-chikankari-cotton-kurti/14291823/buy';
    const res = validateOutboundUrl(verifiedUrl, {
      canonicalProductId: 'prod-kurti-01',
      offerCanonicalProductId: 'prod-kurti-01',
      isVerifiedMatch: true,
      verificationSource: 'authorized_catalog_feed',
      expectedBrand: 'FabIndia',
    });

    assert.equal(res.isValid, true);
    assert.equal(res.isVerifiedMatch, true);
    assert.equal(res.sanitizedUrl, verifiedUrl);
    assert.equal(res.retailerDomain, 'myntra.com');
  });

  it('2. rejects an unrelated product URL or unverified match evidence', () => {
    // Unverified match evidence must be rejected even if URL syntax is valid
    const unverifiedRes = validateOutboundUrl(
      'https://www.myntra.com/tshirts/roadster/men-navy-blue-tshirt/12345/buy',
      {
        canonicalProductId: 'prod-kurti-01',
        offerCanonicalProductId: 'prod-kurti-01',
        isVerifiedMatch: false,
        verificationSource: 'demo_illustrative',
      }
    );
    assert.equal(unverifiedRes.isValid, false);
    assert.equal(unverifiedRes.sanitizedUrl, null);
    assert.match(unverifiedRes.reason || '', /unverified/i);
  });

  it('3. rejects a generic retailer homepage URL without redirecting', () => {
    const homepages = [
      'https://www.myntra.com',
      'https://www.myntra.com/',
      'https://luxury.tatacliq.com',
      'https://luxury.tatacliq.com/',
      'https://luxe.ajio.com/',
      'https://www.fabindia.com',
    ];

    for (const hp of homepages) {
      const res = validateOutboundUrl(hp, {
        canonicalProductId: 'prod-kurti-01',
        offerCanonicalProductId: 'prod-kurti-01',
        isVerifiedMatch: true,
      });
      assert.equal(res.isValid, false);
      assert.equal(res.sanitizedUrl, null);
      assert.match(res.reason || '', /homepage/i);
    }
  });

  it('4. rejects missing, empty, and malformed URLs gracefully', () => {
    assert.deepEqual(validateOutboundUrl(null), {
      isValid: false,
      sanitizedUrl: null,
      reason: 'Product link unavailable',
      isVerifiedMatch: false,
    });
    assert.deepEqual(validateOutboundUrl(undefined), {
      isValid: false,
      sanitizedUrl: null,
      reason: 'Product link unavailable',
      isVerifiedMatch: false,
    });
    assert.deepEqual(validateOutboundUrl('   '), {
      isValid: false,
      sanitizedUrl: null,
      reason: 'Product link unavailable',
      isVerifiedMatch: false,
    });
    const malformed = validateOutboundUrl('invalid-not-a-url');
    assert.equal(malformed.isValid, false);
    assert.equal(malformed.sanitizedUrl, null);
    assert.match(malformed.reason || '', /malformed/i);
  });

  it('5. detects and blocks a seller offer associated with the wrong canonical product', () => {
    const res = validateOutboundUrl(
      'https://www.myntra.com/sarees/kalki-fashion/banarasi-saree/98765/buy',
      {
        canonicalProductId: 'prod-kurti-01', // Target product is Kurti
        offerCanonicalProductId: 'prod-saree-01', // Offer belongs to Saree
        isVerifiedMatch: true,
      }
    );

    assert.equal(res.isValid, false);
    assert.equal(res.sanitizedUrl, null);
    assert.match(res.reason || '', /mismatch/i);
  });

  it('6. verifies comparison-modal outbound navigation uses selected seller offer without homepage fallback', () => {
    const product = SEED_PRODUCTS[0];
    const firstOffer = product.offers[0]; // Myntra demo offer (unverified)

    const modalNav = validateOutboundUrl(firstOffer.productUrl, {
      canonicalProductId: product.id,
      offerCanonicalProductId: firstOffer.canonicalProductId,
      isVerifiedMatch: firstOffer.isVerifiedMatch,
      verificationSource: firstOffer.verificationSource,
    });

    // In demo data, unverified offers must be disabled with "Product link unavailable"
    assert.equal(modalNav.isValid, false);
    assert.equal(modalNav.sanitizedUrl, null);
    assert.equal(modalNav.reason, 'Product link unavailable');

    // If a verified seller offer is selected from an authorized feed:
    const verifiedOfferMock = {
      id: 'off-verified-1',
      canonicalProductId: product.id,
      sellerName: 'Myntra Verified Partner',
      productUrl: 'https://www.myntra.com/kurtis/fabindia/authentic-chikankari-kurti/99182/buy',
      isVerifiedMatch: true,
      verificationSource: 'authorized_catalog_feed' as const,
    };

    const verifiedModalNav = validateOutboundUrl(verifiedOfferMock.productUrl, {
      canonicalProductId: product.id,
      offerCanonicalProductId: verifiedOfferMock.canonicalProductId,
      isVerifiedMatch: verifiedOfferMock.isVerifiedMatch,
      verificationSource: verifiedOfferMock.verificationSource,
    });

    assert.equal(verifiedModalNav.isValid, true);
    assert.equal(verifiedModalNav.sanitizedUrl, verifiedOfferMock.productUrl);
  });

  it('7. verifies product-card outbound navigation uses correct product record and disables unverified links', () => {
    const product = SEED_PRODUCTS[2]; // Biba Anarkali Kurti
    const bestOffer = product.offers[0];

    const cardNav = validateOutboundUrl(bestOffer.productUrl, {
      canonicalProductId: product.id,
      offerCanonicalProductId: bestOffer.canonicalProductId,
      isVerifiedMatch: bestOffer.isVerifiedMatch,
      verificationSource: bestOffer.verificationSource,
      expectedBrand: product.brand,
    });

    assert.equal(cardNav.isValid, false);
    assert.equal(cardNav.sanitizedUrl, null);
    assert.equal(cardNav.reason, 'Product link unavailable');
  });

  it('8. ensures similar-style products remain distinct from exact matches', () => {
    const reference = SEED_PRODUCTS[0]; // FabIndia Pink Kurti
    const similarCandidates = SEED_PRODUCTS.filter((p) => p.id !== reference.id);

    // Verify all candidates have unique canonical product IDs
    for (const sim of similarCandidates) {
      assert.notEqual(
        sim.id,
        reference.id,
        'Similar-style product must have a distinct canonical ID'
      );
      assert.ok(sim.title, 'Similar product must have its own title');
      assert.ok(sim.brand, 'Similar product must have its own brand');
      assert.ok(sim.imageUrl, 'Similar product must have its own image');

      // Ensure offers on similar candidates reference their own canonical ID, not reference.id
      for (const simOffer of sim.offers) {
        assert.equal(simOffer.canonicalProductId, sim.id);
        assert.notEqual(simOffer.canonicalProductId, reference.id);
      }
    }
  });

  it('9. verifies unknown shipping costs handling and demo-data labelling integrity', () => {
    const kurtiWithUnknownShipping = SEED_PRODUCTS[0].offers.find(
      (o) => o.sellerName === 'FabIndia Direct'
    );
    assert.ok(kurtiWithUnknownShipping);
    assert.equal(kurtiWithUnknownShipping.shippingMinor, null);

    const cost = calculateTotalCost({
      itemPriceMinor: kurtiWithUnknownShipping.priceMinor,
      shippingMinor: kurtiWithUnknownShipping.shippingMinor,
    });
    assert.equal(cost.isComplete, false);
    assert.equal(cost.totalKnownMinor, null);
    assert.ok(cost.notes.some((n) => n.toLowerCase().includes('shipping')));

    // All seeded products must carry the demo flag
    for (const p of SEED_PRODUCTS) {
      assert.equal(p.isDemo, true);
    }
  });

  it('rejects unapproved or untrusted domains to prevent open redirects', () => {
    const unapprovedCases = [
      'https://www.amazon.in/dp/B08XYZ123',
      'https://evil-phishing.com/myntra.com/product/123',
      'https://myntra.com.attacker.com/item/123',
      'https://not-a-real-retailer.com/product',
    ];

    for (const url of unapprovedCases) {
      const res = validateOutboundUrl(url, { isVerifiedMatch: true });
      assert.equal(res.isValid, false, `Expected untrusted domain to be rejected: ${url}`);
      assert.equal(res.sanitizedUrl, null);
      assert.match(res.reason || '', /untrusted/i);
    }
  });

  it('rejects search queries and search results pages (no guessed URLs)', () => {
    const searchCases = [
      'https://www.myntra.com/search?q=pastel+pink+kurti',
      'https://www.myntra.com/search/blue-shirt',
      'https://luxe.ajio.com/shop?query=silk+saree',
    ];

    for (const url of searchCases) {
      const res = validateOutboundUrl(url, { isVerifiedMatch: true });
      assert.equal(res.isValid, false, `Expected search query to be rejected: ${url}`);
      assert.equal(res.sanitizedUrl, null);
      assert.match(res.reason || '', /search/i);
    }
  });
});


