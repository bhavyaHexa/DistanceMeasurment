export const PROJECTS_PATH = '/projects';

export function projectPath(runId: string): string {
  return `${PROJECTS_PATH}/${encodeURIComponent(runId)}`;
}

export const TEST_UPLOAD_PATH = '/test-upload';
