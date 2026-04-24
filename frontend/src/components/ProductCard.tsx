import { getPriceBadge, formatGBP } from '../lib/price.js';
import { PriceBadgeTag } from './PriceBadge.js';
import type { SealedProduct } from '../types/index.js';

interface Props {
  product: SealedProduct;
}

const TYPE_LABELS: Record<SealedProduct['type'], string> = {
  'booster-box': 'Booster Box',
  'elite-trainer-box': 'Elite Trainer Box',
  'booster-pack': 'Booster Pack',
  'tin': 'Tin',
  'collection-box': 'Collection Box',
  'other': 'Product',
};

export function ProductCard({ product }: Props) {
  const listing = product.listings[0];
  if (!listing) return null;

  const badge =
    listing.price !== null && product.rrp !== null
      ? getPriceBadge(listing.price, product.rrp)
      : null;

  return (
    <div className={`group animate-fade-up bg-white dark:bg-gray-900 border rounded-xl p-4 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:hover:shadow-black/40 ${
      listing.inStock
        ? 'border-gray-200 dark:border-gray-700 hover:border-pokemon-yellow/40 dark:hover:border-pokemon-yellow/30'
        : 'border-gray-100 dark:border-gray-800 opacity-60'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">
            {listing.retailer} · {TYPE_LABELS[product.type]}
          </p>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">
            {listing.name || product.name}
          </h3>
        </div>
        <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-lg transition-colors duration-200 ${
          listing.inStock
            ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
        }`}>
          {listing.inStock ? 'In Stock' : 'Out of Stock'}
        </span>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div>
          {listing.price !== null ? (
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
              {formatGBP(listing.price)}
            </p>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500">Price unavailable</p>
          )}
          {product.rrp !== null && (
            <p className="text-xs text-gray-400 dark:text-gray-500">RRP {formatGBP(product.rrp)}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {badge && <PriceBadgeTag badge={badge} />}
          <a
            href={listing.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-pokemon-blue hover:bg-blue-900 dark:hover:bg-blue-800 active:scale-95 text-white font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
          >
            View →
          </a>
        </div>
      </div>

      <p className="text-xs text-gray-300 dark:text-gray-600">
        Updated {new Date(listing.lastChecked).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
}
