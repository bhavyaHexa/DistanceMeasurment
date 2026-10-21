export function downloadTextFile(fileName: string, content: string, mimeType: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

/** Turns a project name into a safe file name stem. */
export function toFileStem(name: string): string {
  return name.trim().replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '') || 'project';
}
