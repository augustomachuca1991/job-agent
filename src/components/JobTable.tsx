import type { Application, SortField } from "../types";
import JobRow from "./JobRow";

interface Props {
  apps: Application[];
  sortField: SortField;
  sortAsc: boolean;
  onSort: (field: SortField) => void;
}

const columns: { field: SortField; label: string }[] = [
  { field: "company", label: "Empresa" },
  { field: "title", label: "Puesto" },
  { field: "score", label: "Score" },
  { field: "status", label: "Estado" },
  { field: "created_at", label: "Fecha" },
];

export default function JobTable({ apps, sortField, sortAsc, onSort }: Props) {
  if (apps.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        Sin resultados
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-xs">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80">
            {columns.map(({ field, label }) => (
              <th
                key={field}
                onClick={() => onSort(field)}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none whitespace-nowrap"
              >
                {label}
                {sortField === field && (
                  <span className="ml-1">{sortAsc ? "▲" : "▼"}</span>
                )}
              </th>
            ))}
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Links
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {apps.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
