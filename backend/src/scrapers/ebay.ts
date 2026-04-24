import * as cheerio from 'cheerio';
import type { RetailerListing } from '../types/index.js';

const BASE = 'https://www.ebay.co.uk';

// LH_BIN=1  → Buy It Now only (excludes auctions)
// _sop=15   → sort by lowest price
// LH_PrefLoc=1 → prefer UK sellers
function ebaySearchUrl(query: string): string {
  const params = new URLSearchParams({
    _nkw: query,
    LH_BIN: '1',
    _sop: '15',
    LH_PrefLoc: '1',
  });
  return `${BASE}/sch/i.html?${params}`;
}

export async function searchEbay(query: string): Promise<RetailerListing[]> {
  const url = ebaySearchUrl(query);
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-GB,en;q=0.9',
    },
    signal: AbortSignal.timeout(20000),
  });

  if (!res.ok) throw new Error(`eBay returned ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);
  const listings: RetailerListing[] = [];

  $('li.s-card').each((_, el) => {
    const $el = $(el);

    const href = $el.find('a.s-card__link').first().attr('href') ?? '';
    // Skip sponsored placeholders (ebay.com/itm/123456) and non-UK listings
    if (!href.includes('ebay.co.uk/itm/')) return;

    const productUrl = href.split('?')[0]; // strip tracking params

    // Text nodes in order: title, condition, price, delivery…
    const textNodes = $el
      .find('.su-styled-text')
      .map((_, t) => $(t).text().trim())
      .get()
      .filter(Boolean);

    const name = textNodes[0];
    if (!name) return;

    // First text node starting with £ is the price
    const priceText = textNodes.find(t => t.startsWith('£'));
    const priceMatch = priceText?.match(/£([\d,]+\.?\d*)/);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : null;

    const imgSrc =
      $el.find('img[src*="ebayimg"]').first().attr('src') ||
      $el.find('img').first().attr('src');

    listings.push({
      retailer: 'eBay',
      retailerUrl: BASE,
      name,
      price,
      inStock: true, // Buy It Now listings that appear are available
      productUrl,
      image: imgSrc,
      lastChecked: new Date().toISOString(),
    });
  });

  return listings;
}
