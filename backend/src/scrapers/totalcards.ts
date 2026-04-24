import * as cheerio from 'cheerio';
import { fetchHtml } from '../lib/http.js';
import type { RetailerListing } from '../types/index.js';

const BASE = 'https://www.totalcards.net';

export async function searchTotalCards(query: string): Promise<RetailerListing[]> {
  const url = `${BASE}/search?q=${encodeURIComponent(query)}&type=product`;
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const listings: RetailerListing[] = [];

  // Each product is a .col with a .box-inner inside
  $('.col').filter((_, el) => $(el).find('.box-inner').length > 0).each((_, el) => {
    const $el = $(el);

    const name = $el.find('a.product-title').first().text().trim();
    if (!name) return;

    const href = $el.find('a.product-title').first().attr('href');
    if (!href) return;
    const productUrl = href.startsWith('http') ? href : `${BASE}${href}`;

    const priceText = $el.find('.price-item.regular-price').first().text().trim();
    const priceMatch = priceText.match(/£([\d,]+\.?\d*)/);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : null;

    const inStock = !$el.text().toLowerCase().includes('sold out') && price !== null;

    const rawImg = $el.find('img').first().attr('src') || $el.find('img').first().attr('srcset')?.split(' ')[0];
    const image = rawImg ? (rawImg.startsWith('//') ? `https:${rawImg}` : rawImg) : undefined;

    listings.push({
      retailer: 'Total Cards',
      retailerUrl: BASE,
      name,
      price,
      inStock,
      productUrl,
      image,
      lastChecked: new Date().toISOString(),
    });
  });

  return listings;
}
