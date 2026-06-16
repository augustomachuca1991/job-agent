import type { Application } from "../types";

interface Props {
    apps: Application[];
    statusFilter: string;
    onStatusChange: (v: string) => void;
    onDisconnect: () => void;
}

const STATUS_NAV = [
    { value: "all", label: "Todos", color: "" },
    { value: "NEW", label: "Nuevo", color: "#3B82F6" },
    { value: "APPLIED", label: "Aplicado", color: "#10B981" },
    { value: "INTERVIEW", label: "Entrevista", color: "#7C3AED" },
    { value: "REJECTED", label: "Rechazado", color: "#EF4444" },
];

export default function Sidebar({ apps, statusFilter, onStatusChange, onDisconnect }: Props) {
    const total = apps.length;
    const avg = total > 0 ? Math.round(apps.reduce((s, j) => s + (j.score ?? 0), 0) / total) : 0;
    const newCount = apps.filter((j) => j.status === "NEW").length;

    const countFor = (val: string) =>
        val === "all" ? total : apps.filter((j) => j.status === val).length;

    return (
        <aside className="flex flex-col gap-6 w-[200px] shrink-0 bg-gray-50 border-r border-gray-200 p-5 min-h-full">
            {/* Logo */}
            <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500" aria-hidden="true">
                    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                </svg>
                <span className="text-sm font-medium">Job Agent</span>
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-2">
                <StatCard value={total} label="aplicaciones" accent />
                <StatCard value={avg} label="score promedio" />
                <StatCard value={newCount} label="sin revisar" />
            </div>

            {/* Status nav */}
            <div className="flex flex-col gap-0.5">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1.5">Estado</p>
                {STATUS_NAV.map(({ value, label, color }) => (
                    <button
                        key={value}
                        onClick={() => onStatusChange(value)}
                        className={`flex items-center justify-between w-full px-2 py-1.5 rounded-md text-left text-[13px] transition-colors cursor-pointer border-0
              ${statusFilter === value
                                ? "bg-white font-medium text-gray-900 shadow-sm ring-1 ring-gray-200"
                                : "text-gray-600 hover:bg-white hover:text-gray-900"
                            }`}
                    >
                        <span className="flex items-center gap-2">
                            {color && (
                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                            )}
                            {label}
                        </span>
                        <span className="text-[11px] font-mono text-gray-400">{countFor(value)}</span>
                    </button>
                ))}
            </div>

            {/* Disconnect */}
            <div className="mt-auto pt-4 border-t border-gray-200">
                <button
                    onClick={onDisconnect}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer bg-transparent border-0"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Desconectar
                </button>
            </div>
        </aside>
    );
}

function StatCard({ value, label, accent = false }: { value: number; label: string; accent?: boolean }) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 px-3 py-2.5">
            <div className={`text-xl font-medium font-mono leading-tight ${accent ? "text-indigo-600" : "text-gray-900"}`}>
                {value}
            </div>
            <div className="text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">{label}</div>
        </div>
    );
}