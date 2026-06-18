import { useState } from "react";
import type { Application, SortField } from "../types";
import JobRow from "./JobRow";
import InterviewModal from "./InterviewModal";
import CvModal from "./CvModal";

interface Props {
  apps: Application[];
  sortField: SortField;
  sortAsc: boolean;
  onSort: (field: SortField) => void;
  onStatusUpdate: (id: string, status: string) => void;
  onGenerateInterview: (id: string, company: string, title: string) => void;
  onGenerateCv: (id: string) => void;
  generatingInterviewIds: Set<string>;
  generatingCvIds: Set<string>;
  isMobile: boolean;
}

const COLUMNS: { field: SortField; label: string }[] = [
  { field: "company", label: "Empresa" },
  { field: "score", label: "Score" },
  { field: "status", label: "Estado" },
  { field: "created_at", label: "Fecha" },
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; border: string; color: string; dot: string }> = {
  NEW: { label: "Nuevo", bg: "rgba(6,182,212,.1)", border: "rgba(6,182,212,.25)", color: "#06b6d4", dot: "#06b6d4" },
  APPLIED: { label: "Aplicado", bg: "rgba(255,107,43,.1)", border: "rgba(255,107,43,.25)", color: "#ff6b2b", dot: "#ff6b2b" },
  INTERVIEW: { label: "Entrevista", bg: "rgba(168,85,247,.12)", border: "rgba(168,85,247,.3)", color: "#c084fc", dot: "#a855f7" },
  REJECTED: { label: "Rechazado", bg: "rgba(255,255,255,.04)", border: "rgba(255,255,255,.08)", color: "#5a4566", dot: "#5a4566" },
};

const ALL_STATUSES = ["NEW", "APPLIED", "INTERVIEW", "REJECTED"];

const TRANSITIONS: Record<string, string[]> = {
  NEW: ["APPLIED", "REJECTED"],
  APPLIED: ["INTERVIEW", "REJECTED"],
  INTERVIEW: ["REJECTED"],
  REJECTED: [],
};

const LINKS = [
  { key: "job_url" as const, label: "Job", icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg> },
  { key: "cv_url" as const, label: "CV", icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> },
  { key: "cover_url" as const, label: "Cover", icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg> },
];

function scoreStyle(s: number) {
  if (s >= 85) return { grad: "linear-gradient(90deg,#e0176a,#ff6b2b)", color: "#ff6b2b" };
  if (s >= 70) return { grad: "linear-gradient(90deg,#7c3aed,#e0176a)", color: "#e0176a" };
  return { grad: "rgba(255,255,255,.15)", color: "#5a4566" };
}

function MobileCard({ job, onStatusUpdate, onGenerateInterview, onGenerateCv, generatingInterview, generatingCv }: {
  job: Application;
  onStatusUpdate: (id: string, status: string) => void;
  onGenerateInterview: (id: string, company: string, title: string) => void;
  onGenerateCv: (id: string) => void;
  generatingInterview: boolean;
  generatingCv: boolean;
}) {
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showCvModal, setShowCvModal] = useState(false);
  const score = job.score ?? 0;
  const ss = scoreStyle(score);
  const status = job.status || "NEW";
  const sc = STATUS_CONFIG[status] ?? STATUS_CONFIG.NEW;
  const date = job.created_at
    ? new Date(job.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })
    : "—";
  const nextStatuses = TRANSITIONS[status] ?? [];
  const isTerminal = status === "REJECTED";
  const hasInterview = !!job.interview_notes;
  const hasCv = !!job.cv_notes;

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === status) return;
    if (!nextStatuses.includes(newStatus)) return;
    onStatusUpdate(job.id, newStatus);
    if (newStatus === "INTERVIEW" && !hasInterview) {
      onGenerateInterview(job.id, job.company, job.title);
    }
  };

  return (
    <div style={{
      background: "rgba(255,255,255,.02)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "12px",
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: "var(--txt)" }}>{job.company}</div>
          <div style={{ fontSize: 10, color: "var(--txt3)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.title}</div>
        </div>
        {isTerminal ? (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0,
            padding: "2px 7px", borderRadius: 20,
            background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color,
            fontSize: 8, fontWeight: 600, letterSpacing: ".05em",
          }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: sc.dot, boxShadow: `0 0 4px ${sc.dot}99`, flexShrink: 0 }} />
            {sc.label}
          </span>
        ) : (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0,
            padding: "2px 7px", borderRadius: 20,
            background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color,
            fontSize: 8, fontWeight: 600, letterSpacing: ".05em",
            position: "relative", cursor: "pointer", overflow: "hidden",
          }}>
            {generatingInterview ? (
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                Generando…
              </span>
            ) : (
              <>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: sc.dot, boxShadow: `0 0 4px ${sc.dot}99`, flexShrink: 0 }} />
                {sc.label}
              </>
            )}
              {!generatingInterview && (
                <select
                  value={status}
                  onChange={e => handleStatusChange(e.target.value)}
                  style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%" }}
                  aria-label={`Estado de ${job.company}`}
                >
                  {ALL_STATUSES.map(s => (
                    <option key={s} value={s} style={{ background: "#1a0e20", color: "#f0e8f5" }}>
                      {STATUS_CONFIG[s]?.label ?? s}
                    </option>
                  ))}
                </select>
              )}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,.06)", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 2, width: `${score}%`, background: ss.grad, transition: "width .5s cubic-bezier(.4,0,.2,1)" }} />
        </div>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 500, color: ss.color, minWidth: 20 }}>
          {score}
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "var(--txt3)" }}>{date}</span>
        <div style={{ display: "flex", gap: 4 }}>
          {LINKS.map(({ key, label, icon }) => {
            const href = job[key] as string | undefined;
            if (!href) return null;
            return (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 2,
                  padding: "2px 6px", borderRadius: 4,
                  border: "1px solid var(--border)", color: "var(--txt3)",
                  textDecoration: "none", background: "rgba(255,255,255,.03)",
                  fontSize: 9, fontFamily: "'Outfit', sans-serif",
                }}
              >
                {icon}{label}
              </a>
            );
          })}
          {hasCv ? (
            <button
              onClick={() => setShowCvModal(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 2,
                padding: "2px 6px", borderRadius: 4,
                border: "1px solid rgba(6,182,212,.3)", color: "#06b6d4",
                background: "rgba(6,182,212,.08)",
                fontSize: 9, fontFamily: "'Outfit', sans-serif",
                cursor: "pointer",
              }}
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6" /><polyline points="9 14 11 16 15 12" />
              </svg>
              CV
            </button>
          ) : (
            <button
              onClick={() => !generatingCv && onGenerateCv(job.id)}
              disabled={generatingCv}
              style={{
                display: "inline-flex", alignItems: "center", gap: 2,
                padding: "2px 6px", borderRadius: 4,
                border: generatingCv ? "1px solid var(--border)" : "1px solid rgba(255,107,43,.3)",
                color: generatingCv ? "var(--txt3)" : "#ff6b2b",
                background: generatingCv ? "rgba(255,255,255,.03)" : "rgba(255,107,43,.08)",
                fontSize: 9, fontFamily: "'Outfit', sans-serif",
                cursor: generatingCv ? "default" : "pointer",
                opacity: generatingCv ? 0.5 : 1,
              }}
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              {generatingCv ? "…" : "Gen. CV"}
            </button>
          )}
          {hasInterview && (
            <button
              onClick={() => setShowInterviewModal(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 2,
                padding: "2px 6px", borderRadius: 4,
                border: "1px solid rgba(168,85,247,.3)", color: "#c084fc",
                background: "rgba(168,85,247,.08)",
                fontSize: 9, fontFamily: "'Outfit', sans-serif",
                cursor: "pointer",
              }}
            >
              Interview
            </button>
          )}
        </div>
      </div>
      {showInterviewModal && (
        <InterviewModal
          company={job.company}
          content={job.interview_notes!}
          onClose={() => setShowInterviewModal(false)}
        />
      )}
      {showCvModal && (
        <CvModal
          company={job.company}
          content={job.cv_notes!}
          onClose={() => setShowCvModal(false)}
        />
      )}
    </div>
  );
}

export default function JobTable({ apps, sortField, sortAsc, onSort, onStatusUpdate, onGenerateInterview, onGenerateCv, generatingInterviewIds, generatingCvIds, isMobile }: Props) {
  if (apps.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--txt3)", fontSize: 13 }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", margin: "0 auto 10px", color: "var(--txt3)" }} aria-hidden="true">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
        Sin resultados
      </div>
    );
  }

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px", flex: 1 }}>
        {apps.map(job => (
          <MobileCard
            key={job.id}
            job={job}
            onStatusUpdate={onStatusUpdate}
            onGenerateInterview={onGenerateInterview}
            onGenerateCv={onGenerateCv}
            generatingInterview={generatingInterviewIds.has(job.id)}
            generatingCv={generatingCvIds.has(job.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto", flex: 1 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)", background: "rgba(255,255,255,.015)" }}>
            {COLUMNS.map(({ field, label }) => (
              <th
                key={field}
                onClick={() => onSort(field)}
                style={{
                  padding: "9px 14px", textAlign: "left",
                  fontSize: 10, fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: ".1em",
                  color: sortField === field ? "var(--txt2)" : "var(--txt3)",
                  cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
                  transition: "color .15s",
                }}
              >
                {label}
                {sortField === field && (
                  <span style={{ marginLeft: 4, fontSize: 9, color: "var(--mag)" }}>
                    {sortAsc ? "▲" : "▼"}
                  </span>
                )}
              </th>
            ))}
            <th style={{ padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--txt3)" }}>
              Links
            </th>
          </tr>
        </thead>
        <tbody>
          {apps.map((job, i) => (
            <JobRow
              key={job.id}
              job={job}
              index={i}
              onStatusUpdate={onStatusUpdate}
              onGenerateInterview={onGenerateInterview}
              onGenerateCv={onGenerateCv}
              generatingInterview={generatingInterviewIds.has(job.id)}
              generatingCv={generatingCvIds.has(job.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
