export type RunStatus = 'created' | 'queued' | 'processing' | 'converted' | 'saved' | 'failed';

export interface RunSummary {
  run_id: string;
  project_name: string;
  status: RunStatus;
  created_at: string;
  converted_at: string | null;
  saved_at: string | null;
}

export interface RunDetail extends RunSummary {
  error: string | null;
  error_code: string | null;
  stage: string | null;
  progress: number | null;
  photo_count: number | null;
  glb_url: string | null;
  json_url: string | null;
  expires_in: number;
}

export interface VideoResponse {
  run_id: string;
  status: RunStatus;
  duration_seconds: number;
}

export interface SaveResponse {
  run_id: string;
  status: RunStatus;
  saved_at: string;
}

export interface RunList {
  items: RunSummary[];
  total: number;
}

export interface ListRunsParams {
  status?: RunStatus;
  project_name?: string;
  limit?: number;
  offset?: number;
}

export interface Health {
  status: string;
  capture: {
    available: boolean;
    code: string | null;
    message: string | null;
    engine_version: string | null;
    state: string | null;
  };
}
