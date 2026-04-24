export interface RetailerListing {
  retailer: string;
  retailerUrl: string;
  name: string;
  price: number | null;
  inStock: boolean;
  productUrl: string;
  image?: string;
  lastChecked: string;
}

export interface SealedProduct {
  id: string;
  name: string;
  set?: string;
  type: 'booster-box' | 'elite-trainer-box' | 'booster-pack' | 'tin' | 'collection-box' | 'other';
  rrp: number | null;
  image?: string;
  listings: RetailerListing[];
}

export interface CardSearchResult {
  id: string;
  name: string;
  set: string;
  setCode: string;
  number: string;
  rarity?: string;
  image?: string;
  marketPrice?: number;
  cardmarketUrl?: string;
}

export interface SearchResponse<T> {
  results: T[];
  total: number;
  query: string;
}
