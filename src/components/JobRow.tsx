import { useEffect, useRef, useState } from "react";
import type { Application } from "../types";
import InterviewModal from "./InterviewModal";
import CvModal from "./CvModal";

interface Props {
  job: Application;
  index: number;
  onStatusUpdate: (id: string, status: string) => void;
  onJobClick: (id: string, company: string, url: string) => void;
  onGenerateInterview: (id: string, company: string, title: string) => void;
  onGenerateCv: (id: string) => void;
  generatingInterview: boolean;
  generatingCv: boolean;
}

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

function scoreStyle(s: number) {
  if (s >= 85) return { grad: "linear-gradient(90deg,#e0176a,#ff6b2b)", color: "#ff6b2b" };
  if (s >= 70) return { grad: "linear-gradient(90deg,#7c3aed,#e0176a)", color: "#e0176a" };
  return { grad: "rgba(255,255,255,.15)", color: "#5a4566" };
}

const LINKS = [
  { key: "cv_url" as const, label: "CV", icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> },
  { key: "cover_url" as const, label: "Cover", icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg> },
];

export default function JobRow({ job, index, onStatusUpdate, onJobClick, onGenerateInterview, onGenerateCv, generatingInterview, generatingCv }: Props) {
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showCvModal, setShowCvModal] = useState(false);
  const rowRef = useRef<HTMLTableRowElement>(null);
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

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateX(-6px)";
    const t = setTimeout(() => {
      el.style.transition = "opacity .2s ease, transform .2s ease";
      el.style.opacity = "1";
      el.style.transform = "none";
    }, index * 20);
    return () => clearTimeout(t);
  }, [index]);

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === status) return;
    if (!nextStatuses.includes(newStatus)) return;
    onStatusUpdate(job.id, newStatus);
    if (newStatus === "INTERVIEW" && !hasInterview) {
      onGenerateInterview(job.id, job.company, job.title);
    }
  };

  const tdStyle: React.CSSProperties = {
    padding: "9px 14px", borderBottom: "1px solid rgba(255,255,255,.03)", verticalAlign: "middle",
  };

  return (
    <>
      <tr
        ref={rowRef}
        onMouseEnter={e => { Array.from((e.currentTarget as HTMLTableRowElement).cells).forEach(td => { td.style.background = "rgba(255,255,255,.025)"; }); }}
        onMouseLeave={e => { Array.from((e.currentTarget as HTMLTableRowElement).cells).forEach(td => { td.style.background = "transparent"; }); }}
      >
        {/* Company */}
        <td style={tdStyle}>
          <div style={{ fontWeight: 600, fontSize: 12, color: "var(--txt)" }}>{job.company}</div>
          <div style={{ fontSize: 10, color: "var(--txt3)", marginTop: 1 }}>{job.title}</div>
        </td>

        {/* Score bar */}
        <td style={tdStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 48, height: 3, borderRadius: 2, background: "rgba(255,255,255,.06)", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 2, width: `${score}%`, background: ss.grad, transition: "width .5s cubic-bezier(.4,0,.2,1)" }} />
            </div>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, fontWeight: 500, color: ss.color, minWidth: 22 }}>
              {score}
            </span>
          </div>
        </td>

        {/* Status pill + hidden select */}
        <td style={tdStyle}>
          {isTerminal ? (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "3px 9px", borderRadius: 20,
              background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color,
              fontSize: 9, fontWeight: 600, letterSpacing: ".05em",
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.dot, boxShadow: `0 0 5px ${sc.dot}99`, flexShrink: 0 }} />
              {sc.label}
            </span>
          ) : (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "3px 9px", borderRadius: 20,
              background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color,
              fontSize: 9, fontWeight: 600, letterSpacing: ".05em",
              position: "relative", cursor: "pointer", overflow: "hidden",
            }}>
              {generatingInterview ? (
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: "50%", background: sc.dot, flexShrink: 0,
                    animation: "genPulse .8s ease-in-out infinite",
                  }} />
                  <style>{`@keyframes genPulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
                  Generando…
                </span>
              ) : (
                <>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.dot, boxShadow: `0 0 5px ${sc.dot}99`, flexShrink: 0 }} />
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
        </td>

        {/* Date */}
        <td style={tdStyle}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--txt3)" }}>{date}</span>
        </td>

        {/* Links */}
        <td style={tdStyle}>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => onJobClick(job.id, job.company, job.job_url || "")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 3,
                padding: "2px 7px", borderRadius: 5,
                border: "1px solid var(--border)", color: "var(--txt3)",
                background: "rgba(255,255,255,.03)",
                fontSize: 10, fontFamily: "'Outfit', sans-serif",
                cursor: "pointer", transition: "all .15s",
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "rgba(224,23,106,.4)";
                el.style.color = "var(--mag)";
                el.style.background = "rgba(224,23,106,.07)";
                el.style.boxShadow = "0 0 10px rgba(224,23,106,.12)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--border)";
                el.style.color = "var(--txt3)";
                el.style.background = "rgba(255,255,255,.03)";
                el.style.boxShadow = "none";
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
              Job
            </button>
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
                    display: "inline-flex", alignItems: "center", gap: 3,
                    padding: "2px 7px", borderRadius: 5,
                    border: "1px solid var(--border)", color: "var(--txt3)",
                    textDecoration: "none", background: "rgba(255,255,255,.03)",
                    fontSize: 10, fontFamily: "'Outfit', sans-serif",
                    transition: "all .15s",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "rgba(224,23,106,.4)";
                    el.style.color = "var(--mag)";
                    el.style.background = "rgba(224,23,106,.07)";
                    el.style.boxShadow = "0 0 10px rgba(224,23,106,.12)";
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "var(--border)";
                    el.style.color = "var(--txt3)";
                    el.style.background = "rgba(255,255,255,.03)";
                    el.style.boxShadow = "none";
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
                  display: "inline-flex", alignItems: "center", gap: 3,
                  padding: "2px 7px", borderRadius: 5,
                  border: "1px solid rgba(6,182,212,.3)", color: "#06b6d4",
                  background: "rgba(6,182,212,.08)",
                  fontSize: 10, fontFamily: "'Outfit', sans-serif",
                  cursor: "pointer", transition: "all .15s",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "rgba(6,182,212,.5)";
                  el.style.background = "rgba(6,182,212,.15)";
                  el.style.boxShadow = "0 0 10px rgba(6,182,212,.15)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "rgba(6,182,212,.3)";
                  el.style.background = "rgba(6,182,212,.08)";
                  el.style.boxShadow = "none";
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6" /><polyline points="9 14 11 16 15 12" />
                </svg>
                CV
              </button>
            ) : (
              <button
                onClick={() => !generatingCv && onGenerateCv(job.id)}
                disabled={generatingCv}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 3,
                  padding: "2px 7px", borderRadius: 5,
                  border: generatingCv ? "1px solid var(--border)" : "1px solid rgba(255,107,43,.3)",
                  color: generatingCv ? "var(--txt3)" : "#ff6b2b",
                  background: generatingCv ? "rgba(255,255,255,.03)" : "rgba(255,107,43,.08)",
                  fontSize: 10, fontFamily: "'Outfit', sans-serif",
                  cursor: generatingCv ? "default" : "pointer",
                  transition: "all .15s",
                  opacity: generatingCv ? 0.5 : 1,
                }}
                onMouseEnter={e => {
                  if (!generatingCv) {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "rgba(255,107,43,.5)";
                    el.style.background = "rgba(255,107,43,.15)";
                    el.style.boxShadow = "0 0 10px rgba(255,107,43,.15)";
                  }
                }}
                onMouseLeave={e => {
                  if (!generatingCv) {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "rgba(255,107,43,.3)";
                    el.style.background = "rgba(255,107,43,.08)";
                    el.style.boxShadow = "none";
                  }
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
                </svg>
                {generatingCv ? "…" : "Gen. CV"}
              </button>
            )}
            {hasInterview && (
              <button
                onClick={() => setShowInterviewModal(true)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 3,
                  padding: "2px 7px", borderRadius: 5,
                  border: "1px solid rgba(168,85,247,.3)", color: "#c084fc",
                  background: "rgba(168,85,247,.08)",
                  fontSize: 10, fontFamily: "'Outfit', sans-serif",
                  cursor: "pointer", transition: "all .15s",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "rgba(168,85,247,.5)";
                  el.style.background = "rgba(168,85,247,.15)";
                  el.style.boxShadow = "0 0 10px rgba(168,85,247,.15)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "rgba(168,85,247,.3)";
                  el.style.background = "rgba(168,85,247,.08)";
                  el.style.boxShadow = "none";
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Interview
              </button>
            )}
          </div>
        </td>
      </tr>

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
    </>
  );
}
