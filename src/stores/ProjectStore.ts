import { makeAutoObservable, runInAction } from 'mobx';
import { errorMessage, isAbortError } from '@/services/http';
import { runsApi } from '@/services/runsApi';
import type { RunStatus } from '@/types/api';
import type { SavedMeasurementData } from '@/types/projectFile';
import type { UploadPhase } from '@/types/workspace';
import { buildProjectFile, parseProjectFile } from '@/utils/projectFile';
import { prepareScanZip, type PreparedScan } from '@/utils/zip';
import type { RootStore } from './RootStore';

/** The project (backend "run") open in the workspace: loading, scan upload and saving. */
export class ProjectStore {
  runId: string | null = null;
  name = '';
  status: RunStatus | null = null;

  isOpening = false;
  openError: string | null = null;

  uploadPhase: UploadPhase = 'idle';
  uploadProgress = 0;
  uploadError: string | null = null;

  isSaving = false;
  saveError: string | null = null;
  /** Snapshot of the data at the last save/open, used to detect unsaved changes. */
  private savedSnapshot: string | null = null;
  private uploadAbort: AbortController | null = null;

  private readonly root: RootStore;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable<this, 'root' | 'uploadAbort'>(
      this,
      { root: false, uploadAbort: false },
      { autoBind: true },
    );
  }

  get isUploading(): boolean {
    return this.uploadPhase !== 'idle';
  }

  private get measurementData(): SavedMeasurementData {
    const { measurements, nextColorIndex } = this.root.measurements.toJSON();
    return { version: 1, calibration: this.root.calibration.toJSON(), measurements, nextColorIndex };
  }

  private get snapshot(): string {
    return JSON.stringify([this.measurementData, this.root.workspace.displayUnit]);
  }

  get hasUnsavedChanges(): boolean {
    return this.root.model.isLoaded && this.savedSnapshot !== null && this.snapshot !== this.savedSnapshot;
  }

  get hasBeenSaved(): boolean {
    return this.status === 'saved';
  }

  get canSave(): boolean {
    return this.root.model.isLoaded && !this.isSaving && (this.hasUnsavedChanges || !this.hasBeenSaved);
  }

  /**
   * Where the scan is in its journey to the viewer: index into the upload stages
   * (check → upload → convert → open) and a percentage when one is known.
   */
  get uploadStage(): { index: number; percent: number | null } | null {
    if (this.uploadPhase === 'preparing') return { index: 0, percent: null };
    if (this.uploadPhase === 'uploading') return { index: 1, percent: this.uploadProgress };
    if (this.uploadPhase === 'converting') return { index: 2, percent: null };
    const { model } = this.root;
    if (model.url && !model.isLoaded && !model.error) return { index: 3, percent: model.loadProgress };
    return null;
  }

  get canCancelUpload(): boolean {
    return this.uploadPhase === 'preparing' || this.uploadPhase === 'uploading';
  }

  /** Creates the run and starts uploading the scan in the background. Resolves with the run id. */
  async create(name: string, scan: PreparedScan): Promise<string> {
    const run = await runsApi.create(name);
    runInAction(() => {
      this.close();
      this.runId = run.run_id;
      this.name = run.project_name;
      this.status = run.status;
    });
    void this.upload(scan);
    return run.run_id;
  }

  async open(runId: string) {
    if (this.runId === runId) return;
    this.close();
    this.runId = runId;
    this.isOpening = true;

    try {
      const run = await runsApi.get(runId);
      const saved = run.json_url ? parseProjectFile(await runsApi.fetchProjectFile(run.json_url)) : null;
      if (this.runId !== runId) return;

      runInAction(() => {
        const { model, calibration, measurements, workspace } = this.root;
        this.name = run.project_name;
        this.status = run.status;
        this.uploadError = run.status === 'failed' ? run.error : null;
        if (run.glb_url) model.load(run.glb_url);
        if (saved) {
          calibration.load(saved.data.calibration);
          measurements.load(saved.data.measurements, saved.data.nextColorIndex);
          if (saved.displayUnit) workspace.setDisplayUnit(saved.displayUnit);
        }
        workspace.showInitialStep();
        this.markSaved();
        this.isOpening = false;
      });
    } catch (error) {
      runInAction(() => {
        if (this.runId !== runId) return;
        this.openError = errorMessage(error, 'Could not open this project.');
        this.isOpening = false;
      });
    }
  }

  /** Validates a ZIP the user dropped in the workspace, then uploads it. */
  async uploadFile(file: File) {
    this.uploadPhase = 'preparing';
    this.uploadError = null;
    try {
      const scan = await prepareScanZip(file);
      await this.upload(scan);
    } catch (error) {
      runInAction(() => {
        this.uploadPhase = 'idle';
        this.uploadError = errorMessage(error, 'Could not read this ZIP file.');
      });
    }
  }

  cancelUpload() {
    this.uploadAbort?.abort();
    this.uploadAbort = null;
    this.uploadPhase = 'idle';
  }

  async save() {
    const runId = this.runId;
    if (!runId || this.isSaving) return;
    const snapshot = this.snapshot;
    const file = buildProjectFile(this.name, this.measurementData, this.root.workspace.displayUnit);
    this.isSaving = true;
    this.saveError = null;

    try {
      const response = await runsApi.save(runId, file);
      runInAction(() => {
        this.status = response.status;
        this.savedSnapshot = snapshot;
      });
    } catch (error) {
      runInAction(() => {
        this.saveError = errorMessage(error, 'Could not save the project.');
      });
    } finally {
      runInAction(() => {
        this.isSaving = false;
      });
    }
  }

  /** Clears the open project and everything shown in the workspace. */
  close() {
    this.cancelUpload();
    this.runId = null;
    this.name = '';
    this.status = null;
    this.isOpening = false;
    this.openError = null;
    this.uploadProgress = 0;
    this.uploadError = null;
    this.saveError = null;
    this.savedSnapshot = null;

    const { model, calibration, measurements, viewer, workspace, history } = this.root;
    model.reset();
    calibration.reset();
    measurements.reset();
    viewer.reset();
    workspace.reset();
    history.clear();
  }

  private async upload(scan: PreparedScan) {
    const runId = this.runId;
    if (!runId) return;
    const abort = new AbortController();
    this.uploadAbort = abort;
    this.uploadPhase = 'uploading';
    this.uploadProgress = 0;
    this.uploadError = null;

    try {
      const result = await runsApi.convert(runId, scan.zip, {
        signal: abort.signal,
        onUploadProgress: (percent) =>
          runInAction(() => {
            this.uploadProgress = percent;
            if (percent >= 100) this.uploadPhase = 'converting';
          }),
      });
      if (this.runId !== runId) return;
      runInAction(() => {
        this.status = result.status;
        this.uploadPhase = 'idle';
        this.root.model.load(result.glb_url);
        this.markSaved();
      });
    } catch (error) {
      if (isAbortError(error) || this.runId !== runId) return;
      runInAction(() => {
        this.uploadPhase = 'idle';
        this.uploadError = errorMessage(error, 'Upload failed. Please try again.');
      });
    } finally {
      if (this.uploadAbort === abort) this.uploadAbort = null;
    }
  }

  private markSaved() {
    this.savedSnapshot = this.snapshot;
  }
}
