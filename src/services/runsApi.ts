import type {
  Health,
  ListRunsParams,
  RunDetail,
  RunList,
  RunSummary,
  SaveResponse,
  VideoResponse,
} from '@/types/api';
import type { ProjectFile } from '@/types/projectFile';
import { ApiError, get, post } from './http';

export const runsApi = {
  health(): Promise<Health> {
    return get<Health>('/health');
  },

  create(projectName: string): Promise<RunSummary> {
    return post<RunSummary>('/runs', { project_name: projectName });
  },

  uploadVideo(
    runId: string,
    video: File,
    options: { onUploadProgress: (percent: number) => void; signal?: AbortSignal },
  ): Promise<VideoResponse> {
    const form = new FormData();
    form.append('file', video, video.name);
    return post<VideoResponse>(`/runs/${runId}/video`, form, { ...options, timeout: 0 });
  },

  save(runId: string, projectFile: ProjectFile): Promise<SaveResponse> {
    const form = new FormData();
    const json = new Blob([JSON.stringify(projectFile, null, 2)], { type: 'application/json' });
    form.append('file', json, 'metadata.json');
    return post<SaveResponse>(`/runs/${runId}/save`, form);
  },

  list(params: ListRunsParams = {}, signal?: AbortSignal): Promise<RunList> {
    return get<RunList>('/runs', { params: { ...params }, signal });
  },

  get(runId: string, signal?: AbortSignal): Promise<RunDetail> {
    return get<RunDetail>(`/runs/${runId}`, { signal });
  },

  /** Downloads saved metadata from its presigned URL. */
  async fetchProjectFile(url: string): Promise<unknown> {
    const response = await fetch(url);
    if (!response.ok) throw new ApiError(response.status, `Could not download saved metadata (${response.status}).`);
    return response.json();
  },
};
