interface Props {
  min: string;
  max: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
}

const inputClass = 'w-20 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-pokemon-yellow transition-colors duration-200';

export function PriceFilter({ min, max, onMinChange, onMaxChange }: Props) {
  return (
    <div className="flex items-center flex-wrap gap-2">
      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">Price</span>
      <div className="flex items-center gap-1.5">
        <span className="text-gray-400 dark:text-gray-500 text-sm">£</span>
        <input type="number" min="0" step="0.01" placeholder="Min" value={min} onChange={e => onMinChange(e.target.value)} className={inputClass} />
      </div>
      <span className="text-gray-400 dark:text-gray-600 text-xs">to</span>
      <div className="flex items-center gap-1.5">
        <span className="text-gray-400 dark:text-gray-500 text-sm">£</span>
        <input type="number" min="0" step="0.01" placeholder="Max" value={max} onChange={e => onMaxChange(e.target.value)} className={inputClass} />
      </div>
      {(min || max) && (
        <button
          onClick={() => { onMinChange(''); onMaxChange(''); }}
          className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
          aria-label="Clear price filter"
        >
          Clear
        </button>
      )}
    </div>
  );
}
