import * as cheerio from 'cheerio';
import { fetchHtml } from '../lib/http.js';
import type { RetailerListing } from '../types/index.js';

const BASE = 'https://www.argos.co.uk';

// Argos uses path-based search with words joined by spaces (not encoded)
// They don't stock specific TCG sets, so we normalise the query to product-type
// keywords and let the caller filter results by name.
function argosSearchUrl(query: string): string {
  const lower = query.toLowerCase();
  if (lower.includes('elite trainer') || lower.includes('etb')) return `${BASE}/search/pokemon+elite+trainer+box/`;
  if (lower.includes('booster box') || lower.includes('booster display')) return `${BASE}/search/pokemon+booster+box/`;
  if (lower.includes('tin')) return `${BASE}/search/pokemon+tin/`;
  if (lower.includes('booster bundle') || lower.includes('booster pack')) return `${BASE}/search/pokemon+booster+bundle/`;
  // Generic fallback
  return `${BASE}/search/pokemon+trading+cards/`;
}

export async function searchArgos(query: string): Promise<RetailerListing[]> {
  const url = argosSearchUrl(query);
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const listings: RetailerListing[] = [];
  const seen = new Set<string>();

  $('[data-product-id]').each((_, el) => {
    const $el = $(el);
    const productId = $el.attr('data-product-id');
    if (!productId || seen.has(productId)) return;
    seen.add(productId);

    const name =
      $el.find('img[alt]').first().attr('alt')?.trim() ||
      $el.find('h3, [data-test*="product-title"]').first().text().trim();
    if (!name) return;

    const href = $el.find('a[href*="/product/"]').first().attr('href');
    const productUrl = href ? (href.startsWith('http') ? href : `${BASE}${href}`) : `${BASE}/product/${productId}`;

    const priceText = $el.find('[class*="price"]').first().text().trim();
    const priceMatch = priceText.match(/£([\d,]+\.?\d*)/);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : null;

    const fulfilmentText = $el.find('[class*="fulfilment-box-container"]').text().toLowerCase();
    const outOfStock =
      fulfilmentText.includes('currently unavailable') ||
      $el.text().toLowerCase().includes('out of stock') ||
      $el.find('[data-test*="out-of-stock"], [data-test*="unavailable"]').length > 0;
    const inStock = !outOfStock && price !== null;

    const imgSrc =
      $el.find('img[src*="4rgos"]').first().attr('src') ||
      $el.find('img').first().attr('src');

    listings.push({
      retailer: 'Argos',
      retailerUrl: BASE,
      name,
      price,
      inStock,
      productUrl,
      image: imgSrc,
      lastChecked: new Date().toISOString(),
    });
  });

  return listings;
}
