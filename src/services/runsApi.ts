import type {
  ConvertResponse,
  ListRunsParams,
  RunDetail,
  RunList,
  RunSummary,
  SaveResponse,
} from '@/types/api';
import type { ProjectFile } from '@/types/projectFile';
import { get, post } from './http';

export const runsApi = {
  create(projectName: string): Promise<RunSummary> {
    return post<RunSummary>('/runs', { project_name: projectName });
  },

  convert(
    runId: string,
    zip: Blob,
    options: { onUploadProgress: (percent: number) => void; signal?: AbortSignal },
  ): Promise<ConvertResponse> {
    const form = new FormData();
    form.append('file', zip, 'model.zip');
    return post<ConvertResponse>(`/runs/${runId}/convert`, form, { ...options, timeout: 0 });
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

  get(runId: string): Promise<RunDetail> {
    return get<RunDetail>(`/runs/${runId}`);
  },

  /** Downloads saved metadata from its presigned URL. Returns null when it can't be read. */
  async fetchProjectFile(url: string): Promise<unknown> {
    try {
      const response = await fetch(url);
      return response.ok ? await response.json() : null;
    } catch {
      return null;
    }
  },
};
