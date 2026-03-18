export type PostResult = "valid" | "hoax" | "uncertain";
export type PostStatus = "completed" | "processing" | "expired" | "updating";

export interface Post {
  id: string;
  title: string | null;
  summary: string | null;
  context: string;
  result: PostResult | null;
  confidence: number | null;
  created_at: string;
  updated_at: string;
  status: PostStatus;
  category: string | null;
  information: string | null;
}

export interface Think {
  id: string;
  post_id: string | null;   // FK to post
  state: "exploring" | "analyzing" | "completed" | null;
  information: string | null;   // semicolon-separated
  media: string | null;         // semicolon-separated media sources
  analysis: string | null;      // semicolon-separated analysis sources
  official: string | null;      // semicolon-separated official sources
  media_score: number | null;
  analysis_score: number | null;
  official_score: number | null;
  media_insight: string | null;
  official_insight: string | null;
  analysis_insight: string | null;

  // Official source metadata
  official_url: string | null;
  official_name: string | null;

  // Dynamic news sources
  cnbc: string | null;
  cnbc_insight: string | null;
  cnbc_score: number | null;
  cnbc_url: string | null;

  detik: string | null;
  detik_insight: string | null;
  detik_score: number | null;
  detik_url: string | null;

  kompas: string | null;
  kompas_insight: string | null;
  kompas_score: number | null;
  kompas_url: string | null;

  inews: string | null;
  inews_insight: string | null;
  inews_score: number | null;
  inews_url: string | null;
}

