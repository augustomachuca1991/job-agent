import { useState, useEffect, useCallback, useMemo } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getDataClient, getSession, signOut } from "./lib/supabase";
import { callGemini, INTERVIEW_PROMPT_TEMPLATE, CV_PROMPT_TEMPLATE } from "./lib/gemini";
import { useMediaQuery } from "./lib/useMediaQuery";
import type { Application, SortField } from "./types";
import LoginForm from "./components/LoginForm";
import Sidebar from "./components/Sidebar";
import Filters from "./components/Filters";
import JobTable from "./components/JobTable";
import ScoreChart from "./components/ScoreChart";
import profile from "../data/profile.json";
import masterCv from "../cv/master_cv.md?raw";
import "./theme.css";

type AuthState = "loading" | "login" | "dashboard";

export default function App() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [scoreMin, setScoreMin] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortAsc, setSortAsc] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [generatingInterviewIds, setGeneratingInterviewIds] = useState<Set<string>>(new Set());
  const [generatingCvIds, setGeneratingCvIds] = useState<Set<string>>(new Set());
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        setSupabase(getDataClient());
        setAuthState("dashboard");
      } else {
        setAuthState("login");
        setLoading(false);
      }
    });
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
        if (err) setError(err.message);
        else setApps((data as Application[]) || []);
      });
  }, [supabase]);

  const handleLogin = useCallback(() => {
    setSupabase(getDataClient());
    setAuthState("dashboard");
  }, []);

  const handleLoginError = useCallback((msg: string) => {
    setError(msg);
  }, []);

  const handleDisconnect = useCallback(async () => {
    try {
      await signOut();
    } catch {}
    setSupabase(null);
    setApps([]);
    setError("");
    setAuthState("login");
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

  const handleGenerateInterview = useCallback(
    async (id: string, company: string, title: string) => {
      setGeneratingInterviewIds((prev) => new Set(prev).add(id));

      const prompt = INTERVIEW_PROMPT_TEMPLATE
        .replace("{{PROFILE}}", JSON.stringify(profile, null, 2))
        .replace("{{COMPANY_NAME}}", company)
        .replace("{{JOB_TITLE}}", title)
        .replace("{{JOB_DESCRIPTION}}", `Puesto: ${title} en ${company}`);

      try {
        const notes = await callGemini(prompt);
        if (notes) {
          setApps((prev) =>
            prev.map((j) => (j.id === id ? { ...j, interview_notes: notes, status: "INTERVIEW" } : j))
          );
          supabase
            ?.from("applications")
            .update({ interview_notes: notes, status: "INTERVIEW" })
            .eq("id", id)
            .then(({ error: err }) => {
              if (err) setError(err.message);
            });
        }
      } catch (err: any) {
        setError(err.message || "Error al generar entrevista");
      } finally {
        setGeneratingInterviewIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [supabase]
  );

  const handleGenerateCv = useCallback(
    async (id: string) => {
      const job = apps.find((j) => j.id === id);
      if (!job) return;

      setGeneratingCvIds((prev) => new Set(prev).add(id));

      const prompt = CV_PROMPT_TEMPLATE
        .replace("{{MASTER_CV}}", masterCv)
        .replace("{{TARGET_ROLE}}", `${job.title} en ${job.company}`)
        .replace("{{JOB_DESCRIPTION}}", JSON.stringify({
          company: job.company,
          title: job.title,
          score: job.score,
        }, null, 2));

      try {
        const cv = await callGemini(prompt);
        if (cv) {
          setApps((prev) =>
            prev.map((j) => (j.id === id ? { ...j, cv_notes: cv } : j))
          );
          supabase
            ?.from("applications")
            .update({ cv_notes: cv })
            .eq("id", id)
            .then(({ error: err }) => {
              if (err) setError(err.message);
            });
        }
      } catch (err: any) {
        setError(err.message || "Error al generar CV");
      } finally {
        setGeneratingCvIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [apps, supabase]
  );

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) setSortAsc((p) => !p);
      else { setSortField(field); setSortAsc(field === "score" ? false : true); }
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

  if (authState === "loading") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#0d0710", color: "var(--txt3)", fontFamily: "'Outfit', sans-serif", fontSize: 13,
      }}>
        Verificando sesión…
      </div>
    );
  }

  if (authState === "login") {
    return <LoginForm onLogin={handleLogin} onError={handleLoginError} />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)", fontFamily: "'Outfit', sans-serif" }}>
      {/* Top nav */}
      <nav style={{
        background: "rgba(13,7,16,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center",
        height: 46, padding: "0 12px", gap: 8, position: "sticky", top: 0, zIndex: 50,
      }}>
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(p => !p)}
            style={{
              background: "none", border: "none", cursor: "pointer", color: "var(--txt2)",
              padding: 6, display: "flex", alignItems: "center", justifyContent: "center",
            }}
            aria-label="Toggle sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 18 : 22, letterSpacing: ".1em", background: "linear-gradient(135deg,#e0176a,#ff6b2b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 10px rgba(224,23,106,.4))" }}>
          JOB AGENT
        </span>
        <div style={{ flex: 1 }} />
        <LiveBadge />
        <button
          onClick={handleDisconnect}
          style={{ fontSize: 11, color: "var(--txt3)", background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: "'Outfit', sans-serif", transition: "all .2s", whiteSpace: "nowrap" }}
          onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = "rgba(224,23,106,.4)"; (e.target as HTMLElement).style.color = "var(--mag)"; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = "var(--border)"; (e.target as HTMLElement).style.color = "var(--txt3)"; }}
        >
          {isMobile ? "Salir" : "Desconectar"}
        </button>
      </nav>

      {/* Hero */}
      <HeroBand apps={apps} isMobile={isMobile} />

      {/* Body */}
      <div style={{ display: "flex", flex: 1, position: "relative" }}>
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 40,
            }}
          />
        )}
        <div style={{
          ...(isMobile ? {
            position: "fixed" as const, top: 46, left: 0, bottom: 0, zIndex: 45,
            transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform .25s ease",
          } : {}),
        }}>
          <Sidebar
            apps={apps}
            statusFilter={statusFilter}
            onStatusChange={(v) => { setStatusFilter(v); if (isMobile) setSidebarOpen(false); }}
            isMobile={isMobile}
          />
        </div>

        <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div style={{ padding: isMobile ? "12px 12px" : "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--txt2)", fontWeight: 600 }}>
                Score por aplicación
              </span>
            </div>
            <ScoreChart apps={apps} isMobile={isMobile} />
          </div>

          <Filters search={search} onSearchChange={setSearch} scoreMin={scoreMin} onScoreChange={setScoreMin} isMobile={isMobile} />

          {loading && (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--txt3)", fontSize: 13 }}>
              Cargando aplicaciones…
            </div>
          )}
          {error && (
            <div style={{ margin: "12px 16px", background: "rgba(224,23,106,.1)", border: "1px solid rgba(224,23,106,.25)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#ff6b9d" }}>
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
              onGenerateInterview={handleGenerateInterview}
              onGenerateCv={handleGenerateCv}
              generatingInterviewIds={generatingInterviewIds}
              generatingCvIds={generatingCvIds}
              isMobile={isMobile}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function LiveBadge() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%", background: "#e0176a",
        boxShadow: "0 0 8px #e0176a",
        animation: "pulse 2s ease-in-out infinite",
        display: "inline-block",
      }} />
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}`}</style>
      <span style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", letterSpacing: ".1em", color: "#e0176a" }}>LIVE</span>
    </div>
  );
}

function HeroBand({ apps, isMobile }: { apps: Application[]; isMobile: boolean }) {
  const avg = apps.length ? Math.round(apps.reduce((s, j) => s + (j.score ?? 0), 0) / apps.length) : 0;
  const interviews = apps.filter(j => j.status === "INTERVIEW").length;
  const applied = apps.filter(j => j.status === "APPLIED").length;

  const kpis = [
    { val: apps.length, label: "Total", color: "#e0176a" },
    { val: avg, label: "Avg Score", color: "#ff6b2b" },
    { val: interviews, label: "Entrevistas", color: "#a855f7" },
    { val: applied, label: "Aplicadas", color: "#06b6d4" },
  ];

  return (
    <div style={{ position: "relative", padding: isMobile ? "14px 12px 12px" : "20px 20px 16px", borderBottom: "1px solid var(--border)", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(224,23,106,.08),rgba(168,85,247,.05),rgba(255,107,43,.06))", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(224,23,106,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(224,23,106,.04) 1px,transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />

      <div style={{ position: "relative", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? 10 : 20 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".18em", color: "var(--mag)", marginBottom: isMobile ? 4 : 6 }}>⬡ panel de control</p>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 28 : 36, letterSpacing: ".06em", lineHeight: .9, background: "linear-gradient(135deg,#fff 30%,rgba(224,23,106,.8))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            JOB<br />AGENT
          </h1>
          <p style={{ fontSize: 11, color: "var(--txt2)", marginTop: 4 }}>Seguimiento de aplicaciones en tiempo real</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, width: isMobile ? "100%" : "auto" }}>
          {kpis.map(({ val, label, color }) => (
            <div key={label} style={{
              padding: isMobile ? "8px 10px" : "10px 16px", background: "rgba(255,255,255,.03)", border: "1px solid var(--border)",
              borderRadius: 10, textAlign: "center", minWidth: isMobile ? 0 : 72,
              transition: "transform .2s, border-color .2s", cursor: "default",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
            >
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: isMobile ? 24 : 28, letterSpacing: ".04em", lineHeight: 1, color, textShadow: `0 0 20px ${color}88` }}>{val}</div>
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--txt2)", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
