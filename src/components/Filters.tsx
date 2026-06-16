interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  scoreMin: number;
  onScoreChange: (v: number) => void;
  statusFilter: string;
  onStatusChange: (v: string) => void;
}

const scoreOptions = [
  { value: 0, label: "Todos los scores" },
  { value: 90, label: "≥ 90" },
  { value: 80, label: "≥ 80" },
  { value: 75, label: "≥ 75" },
  { value: 60, label: "≥ 60" },
];

const statusOptions = [
  { value: "all", label: "Todos los estados" },
  { value: "NEW", label: "NEW" },
  { value: "APPLIED", label: "APPLIED" },
  { value: "INTERVIEW", label: "INTERVIEW" },
  { value: "REJECTED", label: "REJECTED" },
];

export default function Filters({
  search,
  onSearchChange,
  scoreMin,
  onScoreChange,
  statusFilter,
  onStatusChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar empresa o puesto..."
        className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
      />

      <select
        value={scoreMin}
        onChange={(e) => onScoreChange(Number(e.target.value))}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
      >
        {scoreOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
      >
        {statusOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
