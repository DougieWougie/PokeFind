// UK RRPs in GBP — sourced from official Pokemon UK / distributor pricing
export const RRP_DATA: Record<string, number> = {
  // Booster Boxes
  'booster box': 89.99,
  'booster display': 89.99,
  // Elite Trainer Boxes
  'elite trainer box': 39.99,
  'etb': 39.99,
  // Tins
  'tin': 19.99,
  'poke ball tin': 19.99,
  // Single packs
  'booster pack': 4.99,
  // Collection boxes
  'collection box': 34.99,
  'premium collection': 44.99,
  'super premium collection': 69.99,
};

export function getRrp(productName: string, productType: string): number | null {
  const lowerName = productName.toLowerCase();
  const lowerType = productType.toLowerCase();

  // Check product type first for a direct match
  if (lowerType === 'booster-box') return RRP_DATA['booster box'];
  if (lowerType === 'elite-trainer-box') return RRP_DATA['elite trainer box'];
  if (lowerType === 'tin') return RRP_DATA['tin'];
  if (lowerType === 'booster-pack') return RRP_DATA['booster pack'];
  if (lowerType === 'collection-box') return RRP_DATA['collection box'];

  // Fall back to name matching
  if (lowerName.includes('elite trainer box') || lowerName.includes('etb')) return RRP_DATA['elite trainer box'];
  if (lowerName.includes('booster box') || lowerName.includes('booster display')) return RRP_DATA['booster box'];
  if (lowerName.includes('super premium')) return RRP_DATA['super premium collection'];
  if (lowerName.includes('premium collection')) return RRP_DATA['premium collection'];
  if (lowerName.includes('collection box') || lowerName.includes('collection')) return RRP_DATA['collection box'];
  if (lowerName.includes(' tin')) return RRP_DATA['tin'];

  return null;
}

export function getPriceBadge(price: number, rrp: number): 'fair' | 'above-rrp' | 'scalper' {
  const ratio = price / rrp;
  if (ratio <= 1.1) return 'fair';
  if (ratio <= 1.4) return 'above-rrp';
  return 'scalper';
}
