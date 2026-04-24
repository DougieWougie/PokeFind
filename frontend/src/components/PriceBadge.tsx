import { badgeClasses, badgeLabel, type PriceBadge } from '../lib/price.js';

interface Props {
  badge: PriceBadge;
}

export function PriceBadgeTag({ badge }: Props) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClasses(badge)}`}>
      {badgeLabel(badge)}
    </span>
  );
}
