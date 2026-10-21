export type RunStatus = 'created' | 'converted' | 'saved' | 'failed';

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
  glb_url: string | null;
  json_url: string | null;
  expires_in: number;
}

export interface ConvertResponse {
  run_id: string;
  status: RunStatus;
  glb_url: string;
  expires_in: number;
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
