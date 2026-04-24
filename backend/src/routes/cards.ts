import { Router, type Request, type Response } from 'express';
import { getCached, setCached, cacheKey } from '../lib/cache.js';
import { fetchHtml } from '../lib/http.js';
import * as cheerio from 'cheerio';
import type { CardSearchResult, SearchResponse } from '../types/index.js';

const router = Router();
const PTCG_API = 'https://api.pokemontcg.io/v2';

router.get('/search', async (req: Request, res: Response) => {
  const query = String(req.query.q ?? '').trim();
  const page = Math.max(1, parseInt(String(req.query.page ?? '1')));
  if (!query || query.length < 2) {
    res.status(400).json({ error: 'Query must be at least 2 characters' });
    return;
  }

  const key = cacheKey('cards', query, String(page));
  const cached = getCached<SearchResponse<CardSearchResult>>(key);
  if (cached) {
    res.json({ ...cached, cached: true });
    return;
  }

  const pageSize = 20;
  const apiUrl = `${PTCG_API}/cards?q=name:"${encodeURIComponent(query)}"&page=${page}&pageSize=${pageSize}&orderBy=-set.releaseDate`;

  const apiRes = await fetch(apiUrl, {
    headers: { 'User-Agent': 'pokefind/0.1 (uk card price finder)' },
  });

  if (!apiRes.ok) {
    res.status(502).json({ error: 'Pokemon TCG API unavailable' });
    return;
  }

  const data = await apiRes.json() as {
    data: PtcgCard[];
    totalCount: number;
  };

  const results: CardSearchResult[] = data.data.map(card => ({
    id: card.id,
    name: card.name,
    set: card.set.name,
    setCode: card.set.id,
    number: card.number,
    rarity: card.rarity,
    image: card.images?.small,
    marketPrice: card.cardmarket?.prices?.averageSellPrice ?? undefined,
    cardmarketUrl: card.cardmarket?.url ?? cardmarketSearchUrl(card.name, card.set.name),
  }));

  const response: SearchResponse<CardSearchResult> = {
    results,
    total: data.totalCount,
    query,
  };

  setCached(key, response);
  res.json(response);
});

function cardmarketSearchUrl(name: string, set: string): string {
  const q = encodeURIComponent(`${name} ${set}`);
  return `https://www.cardmarket.com/en/Pokemon/Products/Singles?searchString=${q}&language=4`;
}

interface PtcgCard {
  id: string;
  name: string;
  number: string;
  rarity?: string;
  set: { id: string; name: string };
  images?: { small?: string; large?: string };
  cardmarket?: {
    url?: string;
    prices?: {
      averageSellPrice?: number;
      lowPrice?: number;
      trendPrice?: number;
    };
  };
}

export default router;
