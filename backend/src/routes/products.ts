import { Router, type Request, type Response } from 'express';
import { searchTotalCards } from '../scrapers/totalcards.js';
import { searchArgos } from '../scrapers/argos.js';
import { searchEbay } from '../scrapers/ebay.js';
import { searchMagicMadhouse } from '../scrapers/magicmadhouse.js';
import { getCached, setCached, cacheKey } from '../lib/cache.js';
import { getRrp } from '../lib/rrp.js';
import type { SealedProduct, RetailerListing } from '../types/index.js';

const router = Router();

router.get('/search', async (req: Request, res: Response) => {
  const query = String(req.query.q ?? '').trim();
  if (!query || query.length < 2) {
    res.status(400).json({ error: 'Query must be at least 2 characters' });
    return;
  }

  const key = cacheKey('products', query);
  const cached = getCached<SealedProduct[]>(key);
  if (cached) {
    res.json({ results: cached, total: cached.length, query, cached: true });
    return;
  }

  const scrapers = [
    searchTotalCards(query),
    searchArgos(query),
    searchEbay(query),
    searchMagicMadhouse(query),
  ];

  const settled = await Promise.allSettled(scrapers);

  for (const s of settled) {
    if (s.status === 'rejected') {
      console.error('Scraper error:', s.reason);
    }
  }

  const allListings: RetailerListing[] = settled
    .filter((r): r is PromiseFulfilledResult<RetailerListing[]> => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .filter(l => l.price !== null && nameMatchesQuery(l.name, query));

  // Sort: in-stock first, then by price ascending
  allListings.sort((a, b) => {
    if (a.inStock !== b.inStock) return a.inStock ? -1 : 1;
    return (a.price ?? 9999) - (b.price ?? 9999);
  });

  const products: SealedProduct[] = allListings.map((listing, i) => {
    const type = detectType(listing.name);
    const rrp = getRrp(listing.name, type);
    return {
      id: `${i}`,
      name: listing.name,
      type,
      rrp,
      image: listing.image,
      listings: [listing],
    };
  });

  setCached(key, products);
  res.json({ results: products, total: products.length, query });
});

function nameMatchesQuery(name: string, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const nameLower = name.toLowerCase();
  return words.some(w => nameLower.includes(w));
}

function detectType(name: string): SealedProduct['type'] {
  const lower = name.toLowerCase();
  if (lower.includes('elite trainer') || lower.includes('etb')) return 'elite-trainer-box';
  if (lower.includes('booster box') || lower.includes('booster display')) return 'booster-box';
  if (lower.includes(' tin')) return 'tin';
  if (lower.includes('booster bundle') || lower.includes('booster pack') || lower.includes('booster bag')) return 'booster-pack';
  if (lower.includes('premium collection') || lower.includes('collection box') || lower.includes('collection')) return 'collection-box';
  if (lower.includes('build') && lower.includes('battle')) return 'other';
  return 'other';
}

export default router;
