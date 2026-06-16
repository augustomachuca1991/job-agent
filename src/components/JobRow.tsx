import type { Application } from "../types";

interface Props {
  job: Application;
  onStatusUpdate: (id: string, status: string) => void;
}

const STATUS_OPTIONS = ["NEW", "APPLIED", "INTERVIEW", "REJECTED"];

const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  NEW: { pill: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  APPLIED: { pill: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  INTERVIEW: { pill: "bg-violet-50 text-violet-700", dot: "bg-violet-600" },
  REJECTED: { pill: "bg-red-50 text-red-600", dot: "bg-red-400" },
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "Nuevo",
  APPLIED: "Aplicado",
  INTERVIEW: "Entrevista",
  REJECTED: "Rechazado",
};

function scoreColor(score: number) {
  if (score >= 85) return { bar: "bg-emerald-500", text: "text-emerald-600" };
  if (score >= 70) return { bar: "bg-amber-400", text: "text-amber-600" };
  return { bar: "bg-red-400", text: "text-red-500" };
}

export default function JobRow({ job, onStatusUpdate }: Props) {
  const score = job.score ?? 0;
  const colors = scoreColor(score);
  const status = job.status || "NEW";
  const styles = STATUS_STYLES[status] ?? STATUS_STYLES.NEW;

  const date = job.created_at
    ? new Date(job.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })
    : "—";

  const links = [
    job.job_url && { href: job.job_url, label: "Job", icon: ExternalLinkIcon },
    job.cv_url && { href: job.cv_url, label: "CV", icon: FileIcon },
    job.cover_url && { href: job.cover_url, label: "Cover", icon: MailIcon },
  ].filter(Boolean) as { href: string; label: string; icon: React.FC }[];

  return (
    <tr className="group border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors">
      {/* Company + Title */}
      <td className="px-5 py-3">
        <div className="text-sm font-medium text-gray-900 leading-snug">{job.company}</div>
        <div className="text-xs text-gray-500 mt-0.5 leading-snug">{job.title}</div>
      </td>

      {/* Score bar */}
      <td className="px-5 py-3">
        {job.score != null && (
          <div className="flex items-center gap-2">
            <div className="w-14 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${colors.bar}`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className={`text-xs font-mono font-medium ${colors.text}`}>{score}</span>
          </div>
        )}
      </td>

      {/* Status pill + select */}
      <td className="px-5 py-3">
        <div className="relative inline-flex">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${styles.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />
            {STATUS_LABELS[status] ?? status}
          </span>
          {/* Invisible select overlaid for interaction */}
          <select
            value={status}
            onChange={(e) => onStatusUpdate(job.id, e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full"
            aria-label={`Estado de ${job.company}`}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </td>

      {/* Date */}
      <td className="px-5 py-3">
        <span className="text-xs font-mono text-gray-400">{date}</span>
      </td>

      {/* Links */}
      <td className="px-5 py-3">
        <div className="flex items-center gap-1.5">
          {links.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-gray-500 border border-gray-200 rounded-md bg-white hover:text-gray-800 hover:border-gray-300 transition-colors"
            >
              <Icon />
              {label}
            </a>
          ))}
        </div>
      </td>
    </tr>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  );
}