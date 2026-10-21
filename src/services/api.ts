import axios from "axios";

export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://9r3vxkr8-8000.inc1.devtunnels.ms/api/v1";

export type RunStatus = "created" | "converted" | "saved" | "failed";

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

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// `detail` is a string for business errors, or an array for field validation errors.
function formatErrorMessage(body: any, fallback: string): string {
  const d = body?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) {
    return d
      .map(
        (e) =>
          `${e.loc ? e.loc.slice(-1)[0] : "field"}: ${e.msg || "invalid value"}`,
      )
      .join(", ");
  }
  return fallback;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, init);
  } catch (err: any) {
    throw new ApiError(
      0,
      `Cannot connect to backend server at ${BASE_URL}. Please ensure the iTwin backend service is running.`,
    );
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      formatErrorMessage(
        body,
        res.statusText || `Request failed with status ${res.status}`,
      ),
    );
  }
  return body as T;
}

export const api = {
  createRun: (projectName: string) =>
    request<RunSummary>("/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_name: projectName }),
    }),

  convertWithProgress: async (
    runId: string,
    zip: File | Blob,
    onProgress: (percent: number) => void,
  ): Promise<ConvertResponse> => {
    const form = new FormData();
    form.append("file", zip, "model.zip");
    try {
      const response = await axios.post<ConvertResponse>(
        `${BASE_URL}/runs/${runId}/convert`,
        form,
        {
          timeout: 0, // conversion can take a while
          onUploadProgress: (e) => {
            if (e.total) {
              onProgress(Math.round((e.loaded / e.total) * 100));
            }
          },
        },
      );
      return response.data;
    } catch (err: any) {
      if (err.response) {
        const message = formatErrorMessage(
          err.response.data,
          err.response.statusText ||
            `Conversion failed (${err.response.status})`,
        );
        throw new ApiError(err.response.status, message);
      }
      throw new ApiError(500, err.message || "Network error during conversion");
    }
  },

  saveRun: (runId: string, metadata: unknown) => {
    const form = new FormData();
    const blob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: "application/json",
    });
    form.append("file", blob, "metadata.json");
    return request<SaveResponse>(`/runs/${runId}/save`, {
      method: "POST",
      body: form,
    });
  },

  listRuns: (
    params: {
      status?: RunStatus;
      project_name?: string;
      limit?: number;
      offset?: number;
    } = {},
  ) => {
    const qs = new URLSearchParams();
    if (params.status) qs.append("status", params.status);
    if (params.project_name) qs.append("project_name", params.project_name);
    if (typeof params.limit === "number")
      qs.append("limit", params.limit.toString());
    if (typeof params.offset === "number")
      qs.append("offset", params.offset.toString());

    const queryStr = qs.toString();
    return request<RunList>(`/runs${queryStr ? `?${queryStr}` : ""}`);
  },

  getRun: (runId: string) => request<RunDetail>(`/runs/${runId}`),
};
