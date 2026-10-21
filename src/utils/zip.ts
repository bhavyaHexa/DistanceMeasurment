import JSZip from 'jszip';

export const SCAN_HINT = 'Needs one .obj, .mtl and .jpg. Videos are removed automatically.';

/** A validated scan, repacked with only the files the converter needs. */
export interface PreparedScan {
  sourceName: string;
  sourceSize: number;
  zip: Blob;
  modelFile: string;
  materialFile: string;
  textureFile: string;
  /** Files dropped from the archive (videos, OS metadata, anything unrecognised). */
  ignoredFiles: string[];
}

type Kind = 'model' | 'material' | 'texture' | 'ignored';

const KIND_BY_EXTENSION: Record<string, Kind> = {
  obj: 'model',
  mtl: 'material',
  jpg: 'texture',
  jpeg: 'texture',
};

const REQUIREMENTS: { kind: Exclude<Kind, 'ignored'>; label: string }[] = [
  { kind: 'model', label: '.obj model' },
  { kind: 'material', label: '.mtl material' },
  { kind: 'texture', label: '.jpg texture' },
];

function isOsMetadata(path: string): boolean {
  return path.includes('__MACOSX/') || path.endsWith('.DS_Store');
}

function kindOf(path: string): Kind {
  const extension = path.split('.').pop()?.toLowerCase() ?? '';
  return KIND_BY_EXTENSION[extension] ?? 'ignored';
}

function baseName(path: string): string {
  return path.split('/').pop() || path;
}

/**
 * Checks that the archive holds exactly one .obj, one .mtl and one .jpg/.jpeg, and repacks just
 * those three (uncompressed, for speed). Videos and other files are left out.
 * Throws an Error with a user-facing message when the archive doesn't qualify.
 */
export async function prepareScanZip(file: File): Promise<PreparedScan> {
  let archive: JSZip;
  try {
    archive = await JSZip.loadAsync(file);
  } catch {
    throw new Error('This file is not a valid ZIP archive.');
  }

  const found: Record<Kind, JSZip.JSZipObject[]> = { model: [], material: [], texture: [], ignored: [] };
  for (const entry of Object.values(archive.files)) {
    if (entry.dir) continue;
    found[isOsMetadata(entry.name) ? 'ignored' : kindOf(entry.name)].push(entry);
  }

  for (const { kind, label } of REQUIREMENTS) {
    if (found[kind].length === 0) throw new Error(`The ZIP is missing a ${label} file.`);
    if (found[kind].length > 1) {
      throw new Error(`The ZIP must contain exactly one ${label} file (found ${found[kind].length}).`);
    }
  }

  const [model, material, texture] = REQUIREMENTS.map(({ kind }) => found[kind][0]);
  const clean = new JSZip();
  await Promise.all(
    [model, material, texture].map(async (entry) => clean.file(baseName(entry.name), await entry.async('blob'))),
  );

  return {
    sourceName: file.name,
    sourceSize: file.size,
    zip: await clean.generateAsync({ type: 'blob', compression: 'STORE' }),
    modelFile: baseName(model.name),
    materialFile: baseName(material.name),
    textureFile: baseName(texture.name),
    ignoredFiles: found.ignored.filter((entry) => !isOsMetadata(entry.name)).map((entry) => baseName(entry.name)),
  };
}
