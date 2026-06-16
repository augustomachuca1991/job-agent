import { useState, useEffect, useCallback, useMemo } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { connect } from "./lib/supabase";
import type { Application, SortField } from "./types";
import ConfigForm from "./components/ConfigForm";
import StatsBar from "./components/StatsBar";
import Filters from "./components/Filters";
import JobTable from "./components/JobTable";

const STORAGE_URL = "supabase_url";
const STORAGE_KEY = "supabase_key";

export default function App() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [scoreMin, setScoreMin] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    const url = localStorage.getItem(STORAGE_URL);
    const key = localStorage.getItem(STORAGE_KEY);
    if (url && key) {
      setSupabase(connect(url, key));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    setLoading(true);
    setError("");

    supabase
      .from("applications")
      .select("*")
      .order("score", { ascending: false })
      .then(({ data, error: err }) => {
        setLoading(false);
        if (err) {
          setError(err.message);
        } else {
          setApps((data as Application[]) || []);
        }
      });
  }, [supabase]);

  const handleConnect = useCallback((url: string, key: string) => {
    localStorage.setItem(STORAGE_URL, url);
    localStorage.setItem(STORAGE_KEY, key);
    setSupabase(connect(url, key));
  }, []);

  const handleDisconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_URL);
    localStorage.removeItem(STORAGE_KEY);
    setSupabase(null);
    setApps([]);
    setError("");
  }, []);

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortAsc((p) => !p);
      } else {
        setSortField(field);
        setSortAsc(field === "score" ? false : true);
      }
    },
    [sortField]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return apps
      .filter((j) => {
        if (scoreMin > 0 && (j.score ?? 0) < scoreMin) return false;
        if (statusFilter !== "all" && j.status !== statusFilter) return false;
        if (q && !`${j.company} ${j.title}`.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => {
        const va = String(a[sortField] ?? "");
        const vb = String(b[sortField] ?? "");
        const cmp = va.localeCompare(vb, undefined, { numeric: true });
        return sortAsc ? cmp : -cmp;
      });
  }, [apps, search, scoreMin, statusFilter, sortField, sortAsc]);

  if (!supabase) {
    return <ConfigForm onConnect={handleConnect} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Agent</h1>
          <p className="text-sm text-gray-500">Dashboard de aplicaciones</p>
        </div>
        <button
          onClick={handleDisconnect}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          Desconectar
        </button>
      </header>

      <StatsBar apps={filtered} />

      <Filters
        search={search}
        onSearchChange={setSearch}
        scoreMin={scoreMin}
        onScoreChange={setScoreMin}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {loading && (
        <div className="text-center py-12 text-gray-400">Cargando aplicaciones...</div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && <JobTable apps={filtered} sortField={sortField} sortAsc={sortAsc} onSort={handleSort} />}
    </div>
  );
}
