interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  scoreMin: number;
  onScoreChange: (v: number) => void;
}

const scoreOptions = [
  { value: 0, label: "Todos los scores" },
  { value: 90, label: "≥ 90" },
  { value: 80, label: "≥ 80" },
  { value: 75, label: "≥ 75" },
  { value: 60, label: "≥ 60" },
];

export default function Filters({ search, onSearchChange, scoreMin, onScoreChange }: Props) {
  return (
    <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-200">
      {/* Search */}
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar empresa o puesto…"
          className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-colors"
        />
      </div>

      {/* Score filter */}
      <select
        value={scoreMin}
        onChange={(e) => onScoreChange(Number(e.target.value))}
        className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 cursor-pointer"
      >
        {scoreOptions.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}