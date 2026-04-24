import NodeCache from 'node-cache';

// Cache scrape results for 15 minutes to avoid hammering retailers
const cache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

export function getCached<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

export function setCached<T>(key: string, value: T): void {
  cache.set(key, value);
}

export function cacheKey(...parts: string[]): string {
  return parts.join(':').toLowerCase().replace(/\s+/g, '-');
}
