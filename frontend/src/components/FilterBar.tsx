interface Props {
  retailers: string[];
  excludedRetailers: Set<string>;
  onRetailerToggle: (retailer: string) => void;
  hideScalpers: boolean;
  onHideScalpersChange: (v: boolean) => void;
}

const pillBase = 'px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 select-none cursor-pointer';
const pillActive = 'bg-pokemon-yellow text-gray-900 shadow-sm';
const pillInactive = 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700';

export function FilterBar({ retailers, excludedRetailers, onRetailerToggle, hideScalpers, onHideScalpersChange }: Props) {
  if (retailers.length === 0) return null;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">Sources</span>

      {retailers.map(r => (
        <button
          key={r}
          type="button"
          onClick={() => onRetailerToggle(r)}
          className={`${pillBase} ${excludedRetailers.has(r) ? pillInactive : pillActive}`}
        >
          {r}
        </button>
      ))}

      <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 shrink-0 hidden sm:block" />

      <button
        type="button"
        onClick={() => onHideScalpersChange(!hideScalpers)}
        className={`${pillBase} ${hideScalpers ? pillActive : pillInactive}`}
      >
        Hide scalper prices
      </button>
    </div>
  );
}
