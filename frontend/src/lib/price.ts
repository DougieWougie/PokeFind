export type PriceBadge = 'fair' | 'above-rrp' | 'scalper';

export function getPriceBadge(price: number, rrp: number): PriceBadge {
  const ratio = price / rrp;
  if (ratio <= 1.1) return 'fair';
  if (ratio <= 1.4) return 'above-rrp';
  return 'scalper';
}

export function formatGBP(amount: number): string {
  return `£${amount.toFixed(2)}`;
}

export function badgeLabel(badge: PriceBadge): string {
  if (badge === 'fair') return 'Fair Price';
  if (badge === 'above-rrp') return 'Above RRP';
  return 'Scalper Price';
}

export function badgeClasses(badge: PriceBadge): string {
  if (badge === 'fair') return 'bg-green-100 dark:bg-green-900/60 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700/50';
  if (badge === 'above-rrp') return 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50';
  return 'bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700/50 animate-pulse-scale';
}
