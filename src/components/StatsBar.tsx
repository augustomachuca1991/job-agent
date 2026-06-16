import type { Application } from "../types";

interface Props {
  apps: Application[];
}

export default function StatsBar({ apps }: Props) {
  const total = apps.length;
  const avg =
    total > 0
      ? Math.round(apps.reduce((s, j) => s + (j.score ?? 0), 0) / total)
      : 0;
  const newCount = apps.filter((j) => j.status === "NEW").length;

  return (
    <div className="flex flex-wrap gap-3 mb-5">
      <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 min-w-[100px]">
        <div className="text-lg font-semibold tabular-nums">{total}</div>
        <div className="text-xs text-gray-500">Total</div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 min-w-[100px]">
        <div className="text-lg font-semibold tabular-nums">{avg}</div>
        <div className="text-xs text-gray-500">Score Promedio</div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 min-w-[100px]">
        <div className="text-lg font-semibold tabular-nums">{newCount}</div>
        <div className="text-xs text-gray-500">Nuevas (NEW)</div>
      </div>
    </div>
  );
}
