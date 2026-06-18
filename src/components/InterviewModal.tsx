import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({ html: false, linkify: true });

interface Props {
  company: string;
  content: string;
  onClose: () => void;
}

export default function InterviewModal({ company, content, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const html = md.render(content);

  return createPortal(
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,.7)", backdropFilter: "blur(4px)",
        padding: 20,
      }}
    >
      <div style={{
        width: "100%", maxWidth: 640, maxHeight: "80vh",
        display: "flex", flexDirection: "column",
        background: "rgba(19,11,24,.97)", border: "1px solid var(--border)",
        borderRadius: 16, boxShadow: "0 24px 80px rgba(0,0,0,.6)",
        overflow: "hidden",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px", borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--txt)" }}>
              Preparación entrevista — {company}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", color: "var(--txt3)", cursor: "pointer",
              padding: 4, display: "flex", borderRadius: 4,
              transition: "color .15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--txt)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--txt3)")}
            aria-label="Cerrar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{
          flex: 1, overflowY: "auto", padding: "18px",
          fontSize: 13, lineHeight: 1.7, color: "var(--txt)",
        }}>
          <div
            className="interview-content"
            dangerouslySetInnerHTML={{ __html: html }}
            style={{
              maxWidth: "100%",
            }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
