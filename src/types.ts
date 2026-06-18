export interface Application {
  id: string;
  company: string;
  title: string;
  score: number | null;
  job_url: string | null;
  cv_url: string | null;
  cover_url: string | null;
  interview_notes: string | null;
  cv_notes: string | null;
  status: string;
  created_at: string | null;
}

export type SortField = "company" | "title" | "score" | "status" | "created_at";
