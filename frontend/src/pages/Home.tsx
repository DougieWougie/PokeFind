import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar.js';

const POPULAR_SEARCHES = [
  { label: 'Surging Sparks ETB', q: 'Surging Sparks Elite Trainer Box', mode: 'products' },
  { label: 'Prismatic Evolutions ETB', q: 'Prismatic Evolutions Elite Trainer Box', mode: 'products' },
  { label: 'Stellar Crown Booster Box', q: 'Stellar Crown booster box', mode: 'products' },
  { label: 'Charizard ex', q: 'Charizard ex', mode: 'cards' },
  { label: 'Pikachu VMAX', q: 'Pikachu VMAX', mode: 'cards' },
] as const;

const FEATURES = [
  { icon: '🔍', title: 'Live Stock', body: 'Scraped from UK retailers in real time — Total Cards, Argos, Magic Madhouse and eBay.' },
  { icon: '💰', title: 'Fair Price Alerts', body: 'Every price is flagged against RRP so you can see instantly when you\'re being scalped.' },
  { icon: '🃏', title: 'Cards + Sealed', body: 'Search individual cards via the Pokemon TCG API, or sealed products across retail and resale.' },
] as const;

export function Home() {
  const [mode, setMode] = useState<'cards' | 'products'>('products');
  const navigate = useNavigate();

  function handleSearch(query: string, searchMode: 'cards' | 'products') {
    navigate(`/search?q=${encodeURIComponent(query)}&mode=${searchMode}`);
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] px-4 gap-10 relative overflow-hidden">
      {/* Subtle radial glow behind hero */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-pokemon-yellow/5 dark:bg-pokemon-yellow/10 rounded-full blur-3xl" />
      </div>

      <div className="text-center relative">
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 tracking-tight">
          <span className="shimmer-text">PokéFind</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
          Find Pokémon cards &amp; sealed products in stock at fair prices across UK retailers.
        </p>
        <p className="text-gray-400 dark:text-gray-600 text-sm mt-1">No scalper nonsense.</p>
      </div>

      <SearchBar onSearch={handleSearch} mode={mode} onModeChange={setMode} />

      <div className="flex flex-wrap justify-center gap-2 max-w-xl">
        <p className="w-full text-center text-xs text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-1">Popular searches</p>
        {POPULAR_SEARCHES.map(({ label, q, mode: searchMode }) => (
          <button
            key={label}
            onClick={() => handleSearch(q, searchMode)}
            className="text-xs bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-pokemon-yellow/40 dark:hover:border-pokemon-yellow/40 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl w-full">
        {FEATURES.map(({ icon, title, body }) => (
          <div key={title} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 text-center hover:border-pokemon-yellow/30 dark:hover:border-pokemon-yellow/20 hover:shadow-md dark:hover:shadow-black/20 transition-all duration-200 hover:-translate-y-0.5">
            <div className="text-2xl mb-2">{icon}</div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm mb-1">{title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
