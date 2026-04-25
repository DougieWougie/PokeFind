import { useState, type FormEvent } from 'react';

interface Props {
  initialQuery?: string;
  onSearch: (query: string, mode: 'cards' | 'products') => void;
  mode: 'cards' | 'products';
  onModeChange: (mode: 'cards' | 'products') => void;
}

export function SearchBar({ initialQuery = '', onSearch, mode, onModeChange }: Props) {
  const [query, setQuery] = useState(initialQuery);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length >= 2) onSearch(trimmed, mode);
  }

  const pillBase = 'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200';
  const pillActive = 'bg-pokemon-yellow text-gray-900 shadow-sm';
  const pillInactive = 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700';

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2 mb-3">
        <button type="button" onClick={() => onModeChange('cards')} className={`${pillBase} ${mode === 'cards' ? pillActive : pillInactive}`}>
          Single Cards
        </button>
        <button type="button" onClick={() => onModeChange('products')} className={`${pillBase} ${mode === 'products' ? pillActive : pillInactive}`}>
          Sealed Products
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={
            mode === 'cards'
              ? 'Search cards — e.g. Charizard ex, Pikachu VMAX…'
              : 'Search products — e.g. Surging Sparks booster box, ETB…'
          }
          className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-pokemon-yellow focus:ring-2 focus:ring-pokemon-yellow/30 transition-all duration-200"
          minLength={2}
          required
        />
        <button
          type="submit"
          className="bg-pokemon-red hover:bg-red-700 active:scale-95 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Search
        </button>
      </div>
    </form>
  );
}
