import { formatGBP } from '../lib/price.js';
import type { CardSearchResult } from '../types/index.js';

interface Props {
  card: CardSearchResult;
}

const RARITY_COLOURS: Record<string, string> = {
  'Common': 'text-gray-400 dark:text-gray-500',
  'Uncommon': 'text-green-600 dark:text-green-400',
  'Rare': 'text-blue-600 dark:text-blue-400',
  'Rare Holo': 'text-blue-600 dark:text-blue-400',
  'Rare Ultra': 'text-purple-600 dark:text-purple-400',
  'Rare Secret': 'text-yellow-600 dark:text-yellow-400',
  'Illustration Rare': 'text-pink-600 dark:text-pink-400',
  'Special Illustration Rare': 'text-pink-700 dark:text-pink-500',
  'Hyper Rare': 'text-yellow-500 dark:text-yellow-300',
};

export function CardResult({ card }: Props) {
  return (
    <div className="animate-fade-up group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden flex gap-3 p-3 hover:border-pokemon-yellow/40 dark:hover:border-pokemon-yellow/30 hover:shadow-md dark:hover:shadow-black/30 hover:-translate-y-0.5 transition-all duration-200">
      {card.image ? (
        <img
          src={card.image}
          alt={card.name}
          className="w-16 h-22 object-contain rounded flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="w-16 h-22 bg-gray-100 dark:bg-gray-800 rounded flex-shrink-0 flex items-center justify-center text-gray-400 dark:text-gray-600 text-xs text-center">
          No image
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight">{card.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{card.set} · #{card.number}</p>
          {card.rarity && (
            <p className={`text-xs mt-0.5 ${RARITY_COLOURS[card.rarity] ?? 'text-gray-500 dark:text-gray-500'}`}>
              {card.rarity}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          {card.marketPrice != null ? (
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Cardmarket avg</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">{formatGBP(card.marketPrice)}</p>
            </div>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-600">No price data</p>
          )}
          {card.cardmarketUrl && (
            <a
              href={card.cardmarketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-pokemon-blue hover:bg-blue-900 dark:hover:bg-blue-800 active:scale-95 text-white font-medium px-3 py-1.5 rounded-lg transition-all duration-200 shrink-0"
            >
              Cardmarket →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
