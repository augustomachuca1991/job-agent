import type { Application } from "../types";

interface Props {
  apps: Application[];
  statusFilter: string;
  onStatusChange: (v: string) => void;
  isMobile: boolean;
}

const STATUS_NAV = [
  { value: "all", label: "Todos", dot: null, glow: null },
  { value: "NEW", label: "Nuevo", dot: "#06b6d4", glow: "rgba(6,182,212,.35)" },
  { value: "APPLIED", label: "Aplicado", dot: "#ff6b2b", glow: "rgba(255,107,43,.35)" },
  { value: "INTERVIEW", label: "Entrevista", dot: "#a855f7", glow: "rgba(168,85,247,.35)" },
  { value: "REJECTED", label: "Rechazado", dot: "#5a4566", glow: null },
];

export default function Sidebar({ apps, statusFilter, onStatusChange, isMobile }: Props) {
  const total = apps.length;
  const avg = total > 0 ? Math.round(apps.reduce((s, j) => s + (j.score ?? 0), 0) / total) : 0;
  const newC = apps.filter(j => j.status === "NEW").length;

  const countFor = (v: string) => v === "all" ? total : apps.filter(j => j.status === v).length;

  if (isMobile) {
    return (
      <aside style={{
        width: 220, flexShrink: 0,
        background: "rgba(13,7,16,.98)",
        borderRight: "1px solid var(--border)",
        padding: "14px 12px",
        display: "flex", flexDirection: "column", gap: 14,
        height: "100%", overflowY: "auto",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { val: total, label: "aplicaciones", grad: "linear-gradient(135deg,#e0176a,#ff6b2b)" },
            { val: avg, label: "score promedio", grad: "linear-gradient(135deg,#ff6b2b,#a855f7)" },
            { val: newC, label: "sin revisar", grad: "linear-gradient(135deg,#a855f7,#06b6d4)" },
          ].map(({ val, label, grad }) => (
            <div key={label} style={{
              background: "rgba(255,255,255,.03)", border: "1px solid var(--border)",
              borderRadius: 10, padding: "8px 10px",
            }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 700, lineHeight: 1, background: grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {val}
              </div>
              <div style={{ fontSize: 9, color: "var(--txt3)", textTransform: "uppercase", letterSpacing: ".08em", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <p style={{ fontSize: 10, color: "var(--txt3)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4, fontWeight: 600 }}>Estado</p>
          {STATUS_NAV.map(({ value, label, dot, glow }) => {
            const active = statusFilter === value;
            return (
              <button
                key={value}
                onClick={() => onStatusChange(value)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", padding: "6px 8px", borderRadius: 8,
                  border: `1px solid ${active ? "rgba(224,23,106,.3)" : "transparent"}`,
                  background: active ? "linear-gradient(135deg,rgba(224,23,106,.1),rgba(255,107,43,.07))" : "transparent",
                  cursor: "pointer", fontFamily: "'Outfit', sans-serif",
                  fontSize: 11, color: active ? "var(--txt)" : "var(--txt2)",
                  transition: "all .15s",
                }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.03)"; (e.currentTarget as HTMLElement).style.color = "var(--txt)"; } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--txt2)"; } }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {dot && (
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0, boxShadow: active && glow ? `0 0 6px ${glow}` : "none" }} />
                  )}
                  {!dot && <span style={{ width: 6, height: 6, flexShrink: 0 }} />}
                  {label}
                </span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--txt3)" }}>
                  {countFor(value)}
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <aside style={{
      width: 180, flexShrink: 0,
      background: "rgba(13,7,16,.6)", backdropFilter: "blur(20px)",
      borderRight: "1px solid var(--border)",
      padding: "18px 14px",
      display: "flex", flexDirection: "column", gap: 20,
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { val: total, label: "aplicaciones", grad: "linear-gradient(135deg,#e0176a,#ff6b2b)" },
          { val: avg, label: "score promedio", grad: "linear-gradient(135deg,#ff6b2b,#a855f7)" },
          { val: newC, label: "sin revisar", grad: "linear-gradient(135deg,#a855f7,#06b6d4)" },
        ].map(({ val, label, grad }) => (
          <div key={label} style={{
            background: "rgba(255,255,255,.03)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "10px 12px",
            transition: "border-color .2s",
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border2)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 700, lineHeight: 1, background: grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {val}
            </div>
            <div style={{ fontSize: 10, color: "var(--txt3)", textTransform: "uppercase", letterSpacing: ".08em", marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <p style={{ fontSize: 10, color: "var(--txt3)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6, fontWeight: 600 }}>Estado</p>
        {STATUS_NAV.map(({ value, label, dot, glow }) => {
          const active = statusFilter === value;
          return (
            <button
              key={value}
              onClick={() => onStatusChange(value)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                width: "100%", padding: "7px 10px", borderRadius: 8,
                border: `1px solid ${active ? "rgba(224,23,106,.3)" : "transparent"}`,
                background: active ? "linear-gradient(135deg,rgba(224,23,106,.1),rgba(255,107,43,.07))" : "transparent",
                cursor: "pointer", fontFamily: "'Outfit', sans-serif",
                fontSize: 12, color: active ? "var(--txt)" : "var(--txt2)",
                transition: "all .15s",
              }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.03)"; (e.currentTarget as HTMLElement).style.color = "var(--txt)"; } }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--txt2)"; } }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {dot && (
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%", background: dot, flexShrink: 0,
                    boxShadow: active && glow ? `0 0 6px ${glow}` : "none",
                  }} />
                )}
                {!dot && <span style={{ width: 7, height: 7, flexShrink: 0 }} />}
                {label}
              </span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--txt3)" }}>
                {countFor(value)}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
