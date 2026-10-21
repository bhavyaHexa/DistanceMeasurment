/** Triggers a browser download of `href` as `fileName`. */
function clickDownloadLink(href: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = href;
  link.download = fileName;
  link.click();
}

export function downloadBlob(fileName: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  clickDownloadLink(url, fileName);
  URL.revokeObjectURL(url);
}

export function downloadTextFile(fileName: string, content: string, mimeType: string): void {
  downloadBlob(fileName, new Blob([content], { type: mimeType }));
}

/**
 * Downloads a file from a (possibly cross-origin) URL. Cross-origin links ignore the `download`
 * attribute, so the file is fetched and saved as a blob; if that fails (e.g. CORS), the link is opened directly.
 */
export async function downloadFromUrl(fileName: string, url: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed (${response.status})`);
    downloadBlob(fileName, await response.blob());
  } catch {
    clickDownloadLink(url, fileName);
  }
}

/** Turns a project name into a safe file name stem. */
export function toFileStem(name: string): string {
  return name.trim().replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '') || 'project';
}
