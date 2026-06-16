import type { Application, SortField } from "../types";
import JobRow from "./JobRow";
import JobCard from "./JobCard";

interface Props {
  apps: Application[];
  sortField: SortField;
  sortAsc: boolean;
  onSort: (field: SortField) => void;
  onStatusUpdate: (id: string, status: string) => void;
}

const COLUMNS: { field: SortField; label: string }[] = [
  { field: "company", label: "Empresa" },
  { field: "score", label: "Score" },
  { field: "status", label: "Estado" },
  { field: "created_at", label: "Fecha" },
];

export default function JobTable({ apps, sortField, sortAsc, onSort, onStatusUpdate }: Props) {
  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
        <span className="text-sm">Sin resultados</span>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: cards */}
      <div className="divide-y divide-gray-100 md:hidden">
        {apps.map((job) => (
          <JobCard key={job.id} job={job} onStatusUpdate={onStatusUpdate} />
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80">
              {COLUMNS.map(({ field, label }) => (
                <th
                  key={field}
                  onClick={() => onSort(field)}
                  className="px-5 py-2.5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none whitespace-nowrap transition-colors"
                >
                  {label}
                  {sortField === field && (
                    <span className="ml-1 text-gray-500">{sortAsc ? "▲" : "▼"}</span>
                  )}
                </th>
              ))}
              <th className="px-5 py-2.5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Links
              </th>
            </tr>
          </thead>
          <tbody>
            {apps.map((job) => (
              <JobRow key={job.id} job={job} onStatusUpdate={onStatusUpdate} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
