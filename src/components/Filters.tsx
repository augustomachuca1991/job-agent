interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  scoreMin: number;
  onScoreChange: (v: number) => void;
  isMobile: boolean;
}

const scoreOptions = [
  { value: 0, label: "Todos los scores" },
  { value: 90, label: "≥ 90" },
  { value: 80, label: "≥ 80" },
  { value: 75, label: "≥ 75" },
  { value: 60, label: "≥ 60" },
];

const inputBase: React.CSSProperties = {
  background: "rgba(255,255,255,.04)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--txt)",
  fontFamily: "'Outfit', sans-serif",
  fontSize: 12,
  outline: "none",
  transition: "border-color .2s",
};

export default function Filters({ search, onSearchChange, scoreMin, onScoreChange, isMobile }: Props) {
  return (
    <div style={{
      display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "stretch" : "center", gap: 8,
      padding: isMobile ? "8px 12px" : "10px 20px", borderBottom: "1px solid var(--border)",
    }}>
      <div style={{ position: "relative", flex: 1 }}>
        <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--txt3)" }}
          width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Buscar empresa o puesto…"
          style={{ ...inputBase, width: "100%", padding: "7px 10px 7px 30px" }}
          onFocus={e => { (e.target as HTMLElement).style.borderColor = "rgba(224,23,106,.4)"; (e.target as HTMLElement).style.boxShadow = "0 0 12px rgba(224,23,106,.1)"; }}
          onBlur={e => { (e.target as HTMLElement).style.borderColor = "var(--border)"; (e.target as HTMLElement).style.boxShadow = "none"; }}
        />
      </div>

      <select
        value={scoreMin}
        onChange={e => onScoreChange(Number(e.target.value))}
        style={{ ...inputBase, padding: "7px 10px", cursor: "pointer", color: "var(--txt2)", width: isMobile ? "100%" : "auto" }}
      >
        {scoreOptions.map(o => (
          <option key={o.value} value={o.value} style={{ background: "#1a0e20", color: "var(--txt)" }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
