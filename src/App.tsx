import { useState, useEffect, useCallback, useMemo } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { connect } from "./lib/supabase";
import type { Application, SortField } from "./types";
import ConfigForm from "./components/ConfigForm";
import Sidebar from "./components/Sidebar";
import Filters from "./components/Filters";
import JobTable from "./components/JobTable";

const STORAGE_URL = "supabase_url";
const STORAGE_KEY = "supabase_key";

function getSupabaseConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_KEY;
  if (envUrl && envKey) return { url: envUrl, key: envKey };

  const lsUrl = localStorage.getItem(STORAGE_URL);
  const lsKey = localStorage.getItem(STORAGE_KEY);
  if (lsUrl && lsKey) return { url: lsUrl, key: lsKey };

  return null;
}

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
    const cfg = getSupabaseConfig();
    if (cfg) {
      setSupabase(connect(cfg.url, cfg.key));
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

  const handleStatusUpdate = useCallback(
    (id: string, status: string) => {
      setApps((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j)));
      supabase?.from("applications").update({ status }).eq("id", id).then(({ error: err }) => {
        if (err) setError(err.message);
      });
    },
    [supabase]
  );

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
    <div className="min-h-screen bg-gray-100 flex items-start justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex">
        {/* Sidebar */}
        <Sidebar
          apps={apps}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onDisconnect={handleDisconnect}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar with filters */}
          <Filters
            search={search}
            onSearchChange={setSearch}
            scoreMin={scoreMin}
            onScoreChange={setScoreMin}
          />

          {/* States */}
          {loading && (
            <div className="flex items-center justify-center py-16 text-sm text-gray-400">
              Cargando aplicaciones…
            </div>
          )}

          {error && (
            <div className="mx-5 mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && (
            <JobTable
              apps={filtered}
              sortField={sortField}
              sortAsc={sortAsc}
              onSort={handleSort}
              onStatusUpdate={handleStatusUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
}