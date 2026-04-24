import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SearchBar } from '../components/SearchBar.js';
import { ProductCard } from '../components/ProductCard.js';
import { CardResult } from '../components/CardResult.js';
import { PriceFilter } from '../components/PriceFilter.js';
import { FilterBar } from '../components/FilterBar.js';
import { searchCards, searchProducts } from '../lib/api.js';
import { getPriceBadge } from '../lib/price.js';

export function Search() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const query = params.get('q') ?? '';
  const mode = (params.get('mode') ?? 'products') as 'cards' | 'products';

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [excludedRetailers, setExcludedRetailers] = useState<Set<string>>(new Set());
  const [hideScalpers, setHideScalpers] = useState(false);

  const productsQuery = useQuery({
    queryKey: ['products', query],
    queryFn: () => searchProducts(query),
    enabled: mode === 'products' && query.length >= 2,
  });

  const cardsQuery = useQuery({
    queryKey: ['cards', query],
    queryFn: () => searchCards(query),
    enabled: mode === 'cards' && query.length >= 2,
  });

  function handleSearch(newQuery: string, newMode: 'cards' | 'products') {
    setMinPrice('');
    setMaxPrice('');
    setExcludedRetailers(new Set());
    setHideScalpers(false);
    navigate(`/search?q=${encodeURIComponent(newQuery)}&mode=${newMode}`);
  }

  function handleModeChange(newMode: 'cards' | 'products') {
    setMinPrice('');
    setMaxPrice('');
    setExcludedRetailers(new Set());
    setHideScalpers(false);
    navigate(`/search?q=${encodeURIComponent(query)}&mode=${newMode}`);
  }

  function handleRetailerToggle(retailer: string) {
    setExcludedRetailers(prev => {
      const next = new Set(prev);
      if (next.has(retailer)) next.delete(retailer);
      else next.add(retailer);
      return next;
    });
  }

  const min = minPrice !== '' ? parseFloat(minPrice) : null;
  const max = maxPrice !== '' ? parseFloat(maxPrice) : null;

  function inPriceRange(price: number | null | undefined): boolean {
    if (price == null) return min === null;
    if (min !== null && price < min) return false;
    if (max !== null && price > max) return false;
    return true;
  }

  const isLoading = mode === 'products' ? productsQuery.isLoading : cardsQuery.isLoading;
  const isError = mode === 'products' ? productsQuery.isError : cardsQuery.isError;
  const error = mode === 'products' ? productsQuery.error : cardsQuery.error;

  const allProducts = productsQuery.data?.results ?? [];
  const allCards = cardsQuery.data?.results ?? [];

  const availableRetailers = [...new Set(
    allProducts.map(p => p.listings[0]?.retailer).filter((r): r is string => Boolean(r))
  )];

  const productResults = allProducts.filter(p => {
    const listing = p.listings[0];
    if (!listing) return false;
    if (!inPriceRange(listing.price)) return false;
    if (excludedRetailers.has(listing.retailer)) return false;
    if (hideScalpers && listing.price !== null && p.rrp !== null) {
      if (getPriceBadge(listing.price, p.rrp) === 'scalper') return false;
    }
    return true;
  });

  const cardResults = allCards.filter(c => inPriceRange(c.marketPrice));

  const inStockCount = productResults.filter(p => p.listings[0]?.inStock).length;
  const isFiltered = min !== null || max !== null || excludedRetailers.size > 0 || hideScalpers;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <SearchBar
        initialQuery={query}
        onSearch={handleSearch}
        mode={mode}
        onModeChange={handleModeChange}
      />

      {query && (
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isLoading ? (
                  <span>Searching across retailers…</span>
                ) : mode === 'products' ? (
                  <span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{productResults.length}</span>
                    {isFiltered && <span className="text-gray-400 dark:text-gray-500"> of {allProducts.length}</span>}
                    <span> listings</span>
                    {inStockCount > 0 && (
                      <span className="ml-2 text-green-600 dark:text-green-400 font-medium">· {inStockCount} in stock</span>
                    )}
                  </span>
                ) : (
                  <span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{cardResults.length}</span>
                    {isFiltered && <span className="text-gray-400 dark:text-gray-500"> of {allCards.length}</span>}
                    <span> cards</span>
                  </span>
                )}
              </p>

              {!isLoading && (allProducts.length > 0 || allCards.length > 0) && (
                <PriceFilter
                  min={minPrice}
                  max={maxPrice}
                  onMinChange={setMinPrice}
                  onMaxChange={setMaxPrice}
                />
              )}
            </div>

            {mode === 'products' && !isLoading && allProducts.length > 0 && (
              <p className="text-xs text-gray-300 dark:text-gray-600">Cached 15 min · prices may vary</p>
            )}
          </div>

          {mode === 'products' && !isLoading && availableRetailers.length > 0 && (
            <FilterBar
              retailers={availableRetailers}
              excludedRetailers={excludedRetailers}
              onRetailerToggle={handleRetailerToggle}
              hideScalpers={hideScalpers}
              onHideScalpersChange={setHideScalpers}
            />
          )}
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 h-40 animate-pulse" />
          ))}
        </div>
      )}

      {isError && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400 font-medium">Search failed</p>
          <p className="text-red-500 dark:text-red-600 text-sm mt-1">{(error as Error).message}</p>
        </div>
      )}

      {!isLoading && !isError && mode === 'products' && (
        <>
          {productResults.length === 0 && query ? (
            allProducts.length > 0 ? (
              <NoFilterMatch onClear={() => { setMinPrice(''); setMaxPrice(''); setExcludedRetailers(new Set()); setHideScalpers(false); }} />
            ) : (
              <NoResults query={query} />
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {productResults.map(product => (
                <ProductCard key={`${product.id}-${product.listings[0]?.retailer}`} product={product} />
              ))}
            </div>
          )}
        </>
      )}

      {!isLoading && !isError && mode === 'cards' && (
        <>
          {cardResults.length === 0 && query ? (
            allCards.length > 0 ? (
              <NoFilterMatch onClear={() => { setMinPrice(''); setMaxPrice(''); }} />
            ) : (
              <NoResults query={query} />
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cardResults.map(card => (
                <CardResult key={card.id} card={card} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="text-center py-20 text-gray-400 dark:text-gray-500">
      <p className="text-4xl mb-4">🔍</p>
      <p className="font-medium text-gray-700 dark:text-gray-300 text-lg">No results for "{query}"</p>
      <p className="text-sm mt-2">Try a different search term or check spelling.</p>
    </div>
  );
}

function NoFilterMatch({ onClear }: { onClear: () => void }) {
  return (
    <div className="text-center py-20 text-gray-400 dark:text-gray-500">
      <p className="text-4xl mb-4">💰</p>
      <p className="font-medium text-gray-700 dark:text-gray-300 text-lg">No results match your filters</p>
      <button
        onClick={onClear}
        className="mt-3 text-sm text-pokemon-yellow hover:underline"
      >
        Clear all filters
      </button>
    </div>
  );
}
