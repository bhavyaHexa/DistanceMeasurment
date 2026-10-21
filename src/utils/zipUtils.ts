import JSZip from 'jszip';

export interface FilteredZipResult {
  zipBlob: Blob;
  objFileName: string;
  mtlFileName: string;
  jpgFileName: string;
  ignoredFiles: string[];
}

/**
 * Inspects a user-supplied zip file.
 * - Filters out .mp4 (and video files, Mac OS metadata).
 * - Verifies that exactly one .obj, one .mtl, and one .jpg/.jpeg exist.
 * - Repackages the 3 essential files into a clean ZIP Blob without recompressing (STORE).
 */
export async function filterAndPrepareZip(file: File): Promise<FilteredZipResult> {
  const zip = await JSZip.loadAsync(file);

  const objFiles: { name: string; file: JSZip.JSZipObject }[] = [];
  const mtlFiles: { name: string; file: JSZip.JSZipObject }[] = [];
  const jpgFiles: { name: string; file: JSZip.JSZipObject }[] = [];
  const ignoredFiles: string[] = [];

  const entries = Object.keys(zip.files);

  for (const path of entries) {
    const zipEntry = zip.files[path];
    if (zipEntry.dir) continue;

    // Filter out OS junk
    if (path.includes('__MACOSX/') || path.endsWith('.DS_Store')) {
      ignoredFiles.push(path);
      continue;
    }

    const lower = path.toLowerCase();
    const fileName = path.split('/').pop() || path;

    // Explicitly filter out and ignore mp4 or other video formats
    if (lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.endsWith('.avi')) {
      ignoredFiles.push(fileName);
      continue;
    }

    if (lower.endsWith('.obj')) {
      objFiles.push({ name: fileName, file: zipEntry });
    } else if (lower.endsWith('.mtl')) {
      mtlFiles.push({ name: fileName, file: zipEntry });
    } else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
      jpgFiles.push({ name: fileName, file: zipEntry });
    } else {
      ignoredFiles.push(fileName);
    }
  }

  // Validate the requirements
  if (objFiles.length === 0) {
    throw new Error('ZIP archive is missing a .obj model file.');
  }
  if (objFiles.length > 1) {
    throw new Error(`ZIP archive must contain exactly one .obj file (found ${objFiles.length}).`);
  }

  if (mtlFiles.length === 0) {
    throw new Error('ZIP archive is missing a .mtl material file.');
  }
  if (mtlFiles.length > 1) {
    throw new Error(`ZIP archive must contain exactly one .mtl file (found ${mtlFiles.length}).`);
  }

  if (jpgFiles.length === 0) {
    throw new Error('ZIP archive is missing a texture image (.jpg or .jpeg).');
  }
  if (jpgFiles.length > 1) {
    throw new Error(`ZIP archive must contain exactly one texture image (.jpg/.jpeg, found ${jpgFiles.length}).`);
  }

  // Build clean zip containing only obj, mtl, jpg
  const cleanZip = new JSZip();
  const objData = await objFiles[0].file.async('blob');
  const mtlData = await mtlFiles[0].file.async('blob');
  const jpgData = await jpgFiles[0].file.async('blob');

  cleanZip.file(objFiles[0].name, objData);
  cleanZip.file(mtlFiles[0].name, mtlData);
  cleanZip.file(jpgFiles[0].name, jpgData);

  // Use STORE compression for maximum speed
  const zipBlob = await cleanZip.generateAsync({ type: 'blob', compression: 'STORE' });

  return {
    zipBlob,
    objFileName: objFiles[0].name,
    mtlFileName: mtlFiles[0].name,
    jpgFileName: jpgFiles[0].name,
    ignoredFiles,
  };
}
