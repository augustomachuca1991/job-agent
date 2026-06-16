import type { Application } from "../types";

interface Props {
  job: Application;
}

export default function JobRow({ job }: Props) {
  const scoreClass =
    job.score != null
      ? job.score >= 85
        ? "bg-green-100 text-green-800"
        : job.score >= 70
          ? "bg-yellow-100 text-yellow-800"
          : "bg-red-100 text-red-800"
      : "bg-gray-100 text-gray-600";

  const statusClass = "bg-blue-100 text-blue-700";

  const date = job.created_at
    ? new Date(job.created_at).toLocaleDateString()
    : "-";

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-4 py-3 font-medium text-gray-900">{job.company}</td>
      <td className="px-4 py-3 text-gray-700">{job.title}</td>
      <td className="px-4 py-3">
        {job.score != null && (
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${scoreClass}`}
          >
            {job.score}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass}`}
        >
          {job.status || "NEW"}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-500 text-xs">{date}</td>
      <td className="px-4 py-3">
        <div className="flex gap-2 text-xs">
          {job.job_url && (
            <a
              href={job.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-800 transition-colors"
            >
              🔗 Job
            </a>
          )}
          {job.cv_url && (
            <a
              href={job.cv_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-800 transition-colors"
            >
              📄 CV
            </a>
          )}
          {job.cover_url && (
            <a
              href={job.cover_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-800 transition-colors"
            >
              ✉️ Cover
            </a>
          )}
        </div>
      </td>
    </tr>
  );
}
