import { useState } from "react";

interface Props {
  onLogin: () => void;
  onError: (msg: string) => void;
}

export default function LoginForm({ onLogin, onError }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    try {
      const { signIn } = await import("../lib/supabase");
      await signIn(email.trim(), password);
      onLogin();
    } catch (err: any) {
      onError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 12,
    color: "#f0e8f5",
    fontFamily: "'Outfit', sans-serif",
    outline: "none",
    transition: "border-color .2s, box-shadow .2s",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#0d0710", fontFamily: "'Outfit', sans-serif",
      backgroundImage: "radial-gradient(ellipse 60% 50% at 20% 20%, rgba(224,23,106,.12) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(168,85,247,.1) 0%, transparent 70%)",
    }}>
      <div style={{
        width: "100%", maxWidth: 380, padding: 32,
        background: "rgba(19,11,24,.8)", backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,.08)", borderRadius: 16,
        boxShadow: "0 24px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.04)",
      }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg,#e0176a,#ff6b2b)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 20px rgba(224,23,106,.4)",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: ".1em", background: "linear-gradient(135deg,#e0176a,#ff6b2b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                JOB AGENT
              </div>
              <div style={{ fontSize: 11, color: "#a889b8", marginTop: -2 }}>Iniciá sesión</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#a889b8", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              style={inputStyle}
              autoComplete="email"
              onFocus={e => { (e.target as HTMLElement).style.borderColor = "rgba(224,23,106,.5)"; (e.target as HTMLElement).style.boxShadow = "0 0 16px rgba(224,23,106,.1)"; }}
              onBlur={e => { (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,.08)"; (e.target as HTMLElement).style.boxShadow = "none"; }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#a889b8", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ ...inputStyle, fontFamily: "'DM Mono', monospace", fontSize: 11 }}
              autoComplete="current-password"
              onFocus={e => { (e.target as HTMLElement).style.borderColor = "rgba(224,23,106,.5)"; (e.target as HTMLElement).style.boxShadow = "0 0 16px rgba(224,23,106,.1)"; }}
              onBlur={e => { (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,.08)"; (e.target as HTMLElement).style.boxShadow = "none"; }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "10px 0", marginTop: 4,
              background: loading ? "rgba(255,255,255,.08)" : "linear-gradient(135deg,#e0176a,#ff6b2b)",
              border: "none", borderRadius: 8,
              color: "#fff", fontSize: 13, fontWeight: 600,
              fontFamily: "'Outfit', sans-serif", cursor: loading ? "default" : "pointer",
              boxShadow: loading ? "none" : "0 4px 24px rgba(224,23,106,.35)",
              transition: "opacity .15s, transform .15s",
            }}
            onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLElement).style.opacity = ".88"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; } }}
            onMouseLeave={e => { if (!loading) { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.transform = "none"; } }}
          >
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
