import * as cheerio from 'cheerio';
import { fetchHtml } from '../lib/http.js';
import type { RetailerListing } from '../types/index.js';

const BASE = 'https://magicmadhouse.co.uk';

function mmhCategoryUrl(query: string): string {
  const lower = query.toLowerCase();
  if (lower.includes('elite trainer') || lower.includes('etb')) return `${BASE}/pokemon/pokemon-sealed-product/elite-trainer-boxes`;
  if (lower.includes('booster box') || lower.includes('booster display')) return `${BASE}/pokemon/pokemon-sealed-product/booster-box`;
  if (lower.includes(' tin')) return `${BASE}/pokemon/pokemon-sealed-product/blisters`;
  if (lower.includes('collection box') || lower.includes('collection')) return `${BASE}/pokemon/pokemon-sealed-product/collection-box-set`;
  if (lower.includes('booster bundle') || lower.includes('booster pack')) return `${BASE}/pokemon/pokemon-sealed-product/booster-pack`;
  return `${BASE}/pokemon/pokemon-sealed-product`;
}

interface StencilProduct {
  name: string;
  url: string;
  price?: { with_tax?: { value?: number } };
  stock_level: number | null;
  image?: { data?: string };
}

export async function searchMagicMadhouse(query: string): Promise<RetailerListing[]> {
  const url = mmhCategoryUrl(query);
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const listings: RetailerListing[] = [];

  let stencilJson: string | null = null;
  $('script').each((_, el) => {
    const text = $(el).html() ?? '';
    const m = text.match(/stencilBootstrap\("category",\s*"([\s\S]*?)"\s*\)/);
    if (m) {
      stencilJson = m[1];
      return false;
    }
  });

  if (!stencilJson) return listings;

  let data: { categoryProducts?: StencilProduct[] };
  try {
    // The JSON is double-encoded: the outer string is a JSON string literal
    data = JSON.parse(JSON.parse(`"${stencilJson}"`));
  } catch {
    return listings;
  }

  for (const p of data.categoryProducts ?? []) {
    if (!p.name || !p.url) continue;

    const price = p.price?.with_tax?.value ?? null;
    // stock_level null = available (not tracking); 0 = out of stock
    const inStock = p.stock_level !== 0 && price !== null;

    const rawImg = p.image?.data;
    const image = rawImg ? rawImg.replace('{:size}', '500x500') : undefined;

    listings.push({
      retailer: 'Magic Madhouse',
      retailerUrl: BASE,
      name: p.name,
      price,
      inStock,
      productUrl: p.url,
      image,
      lastChecked: new Date().toISOString(),
    });
  }

  return listings;
}
