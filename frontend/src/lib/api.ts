import type { CardSearchResult, SealedProduct, SearchResponse } from '../types/index.js';

const BASE = '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Request failed');
  }
  return res.json() as Promise<T>;
}

export function searchCards(query: string, page = 1) {
  return get<SearchResponse<CardSearchResult>>(
    `/cards/search?q=${encodeURIComponent(query)}&page=${page}`,
  );
}

export function searchProducts(query: string) {
  return get<SearchResponse<SealedProduct>>(
    `/products/search?q=${encodeURIComponent(query)}`,
  );
}
