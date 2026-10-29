import { makeAutoObservable, runInAction } from 'mobx';
import { ApiError, errorMessage, isAbortError } from '@/services/http';
import { runsApi } from '@/services/runsApi';
import type { Health, RunDetail, RunStatus } from '@/types/api';
import type { SavedMeasurementData } from '@/types/projectFile';
import { downloadFromUrl, toFileStem } from '@/utils/download';
import { buildProjectFile, parseProjectFile } from '@/utils/projectFile';
import type { RootStore } from './RootStore';

const MAX_VIDEO_BYTES = 300 * 1024 * 1024;
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.avi', '.wmv', '.mpg', '.mpeg']);
const ACTIVE_RUN_KEY = 'itwin.activeRun';
const POLL_INTERVAL_MS = 4000;
const MAX_POLL_FAILURES = 15;

const PROCESSING_LABELS: Record<string, string> = {
  queued: 'Waiting in queue…',
  starting: 'Starting…',
  extracting_frames: 'Reading the video…',
  preparing: 'Preparing video frames…',
  aerotriangulation: 'Aligning the images…',
  reconstruction: 'Building the 3D model…',
  converting: 'Finishing the model…',
};

function waitForNextPoll(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Polling cancelled', 'AbortError'));
      return;
    }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, POLL_INTERVAL_MS);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('Polling cancelled', 'AbortError'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

function fileExtension(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot < 0 ? '' : filename.slice(dot).toLowerCase();
}

/** The project (backend "run") open in the workspace: loading, video processing and saving. */
export class ProjectStore {
  runId: string | null = null;
  name = '';
  status: RunStatus | null = null;

  isOpening = false;
  openError: string | null = null;

  uploadPhase: 'idle' | 'uploading' = 'idle';
  uploadProgress = 0;
  uploadError: string | null = null;
  processingStage: string | null = null;
  processingProgress: number | null = null;

  captureAvailable = false;
  captureMessage: string | null = null;
  isCheckingHealth = false;

  isSaving = false;
  saveError: string | null = null;
  isDownloadingModel = false;
  /** Snapshot of the data at the last save/open, used to detect unsaved changes. */
  private savedSnapshot: string | null = null;
  private uploadAbort: AbortController | null = null;
  private processingAbort: AbortController | null = null;
  private healthRequest: Promise<void> | null = null;

  private readonly root: RootStore;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable<
      this,
      'root' | 'savedSnapshot' | 'uploadAbort' | 'processingAbort' | 'healthRequest'
    >(
      this,
      {
        root: false,
        savedSnapshot: false,
        uploadAbort: false,
        processingAbort: false,
        healthRequest: false,
      },
      { autoBind: true },
    );
  }

  get isUploading(): boolean {
    return this.uploadPhase !== 'idle';
  }

  get isProcessing(): boolean {
    return this.status === 'queued' || this.status === 'processing';
  }

  get canUploadVideo(): boolean {
    return (
      this.captureAvailable &&
      !this.isUploading &&
      !this.isProcessing &&
      !this.isOpening
    );
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

  get uploadStage(): { index: number; percent: number | null; label: string } | null {
    if (this.uploadPhase === 'uploading') {
      return { index: 0, percent: this.uploadProgress, label: 'Uploading video' };
    }
    if (this.isProcessing) {
      const stage = this.processingStage ?? (this.status === 'queued' ? 'queued' : 'starting');
      return {
        index: 1,
        percent: this.status === 'queued' ? 0 : this.processingProgress,
        label: PROCESSING_LABELS[stage] ?? stage.replaceAll('_', ' '),
      };
    }
    const { model } = this.root;
    if (model.url && !model.isLoaded && !model.error) {
      return { index: 2, percent: model.loadProgress, label: 'Loading the 3D model…' };
    }
    return null;
  }

  get canDownloadModel(): boolean {
    return this.root.model.isLoaded && this.root.model.url !== null && !this.isDownloadingModel;
  }

  async checkHealth() {
    if (this.healthRequest) return this.healthRequest;
    this.isCheckingHealth = true;
    this.captureMessage = null;
    const request = runsApi
      .health()
      .then(({ capture }: Health) => {
        runInAction(() => {
          this.captureAvailable = capture.available;
          this.captureMessage = capture.available
            ? null
            : capture.message ?? `Video processing is unavailable${capture.code ? ` (${capture.code})` : '.'}`;
        });
      })
      .catch((error: unknown) => {
        runInAction(() => {
          this.captureAvailable = false;
          this.captureMessage = errorMessage(error, 'Could not check video processing availability.');
        });
      })
      .finally(() => {
        runInAction(() => {
          this.isCheckingHealth = false;
          this.healthRequest = null;
        });
      });
    this.healthRequest = request;
    return request;
  }

  async downloadModel() {
    const url = this.root.model.url;
    if (!url || this.isDownloadingModel) return;
    this.isDownloadingModel = true;
    try {
      await downloadFromUrl(`${toFileStem(this.name)}.glb`, url);
    } finally {
      runInAction(() => {
        this.isDownloadingModel = false;
      });
    }
  }

  get canCancelUpload(): boolean {
    return this.uploadPhase === 'uploading';
  }

  /** Creates an empty project and returns its run id. */
  async create(name: string): Promise<string> {
    const run = await runsApi.create(name);
    runInAction(() => {
      this.close();
      this.runId = run.run_id;
      this.name = run.project_name;
      this.status = run.status;
    });
    return run.run_id;
  }

  async open(runId: string) {
    if (this.runId === runId) {
      if (!this.isOpening && this.isProcessing) this.startPolling(runId);
      return;
    }
    this.close();
    this.runId = runId;
    this.isOpening = true;

    try {
      let run = await runsApi.get(runId);
      let saved = null;
      if (run.json_url) {
        try {
          saved = parseProjectFile(await runsApi.fetchProjectFile(run.json_url));
        } catch (error) {
          if (!(error instanceof ApiError) || error.status !== 403) throw error;
          run = await runsApi.get(runId);
          if (!run.json_url) throw error;
          saved = parseProjectFile(await runsApi.fetchProjectFile(run.json_url));
        }
      }
      if (this.runId !== runId) return;

      runInAction(() => {
        const { model, calibration, measurements, workspace } = this.root;
        this.applyRunDetails(run);
        if (saved) {
          calibration.load(saved.data.calibration);
          measurements.load(saved.data.measurements, saved.data.nextColorIndex);
          if (saved.displayUnit) workspace.setDisplayUnit(saved.displayUnit);
        }
        if (run.glb_url && model.url !== run.glb_url) model.load(run.glb_url);
        workspace.showInitialStep();
        this.markSaved();
        this.isOpening = false;
      });
      if (this.isProcessing) {
        this.saveActiveRun(true);
        this.startPolling(runId);
      }
    } catch (error) {
      runInAction(() => {
        if (this.runId !== runId) return;
        this.openError = errorMessage(error, 'Could not open this project.');
        this.isOpening = false;
      });
    }
  }

  async uploadFile(file: File) {
    const ext = fileExtension(file.name);
    if (!VIDEO_EXTENSIONS.has(ext)) {
      this.uploadError = 'Choose a video file (.mp4, .mov, .avi, .wmv, .mpg or .mpeg).';
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      this.uploadError = 'Video too large (max 300 MB).';
      return;
    }
    if (!this.canUploadVideo) {
      this.uploadError =
        this.captureMessage ?? 'Video processing is unavailable. Please try again later.';
      return;
    }
    await this.upload(file);
  }

  cancelUpload() {
    this.uploadAbort?.abort();
    this.uploadAbort = null;
    this.uploadPhase = 'idle';
  }

  stopPolling() {
    this.processingAbort?.abort();
    this.processingAbort = null;
  }

  retryProcessing() {
    if (!this.runId || !this.isProcessing) return;
    this.uploadError = null;
    this.startPolling(this.runId);
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
    this.stopPolling();
    this.saveActiveRun(false);
    this.runId = null;
    this.name = '';
    this.status = null;
    this.isOpening = false;
    this.openError = null;
    this.uploadProgress = 0;
    this.uploadError = null;
    this.processingStage = null;
    this.processingProgress = null;
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

  private async upload(video: File) {
    const runId = this.runId;
    if (!runId) return;
    const abort = new AbortController();
    this.uploadAbort = abort;
    this.uploadPhase = 'uploading';
    this.uploadProgress = 0;
    this.uploadError = null;

    try {
      const result = await runsApi.uploadVideo(runId, video, {
        signal: abort.signal,
        onUploadProgress: (percent) =>
          runInAction(() => {
            this.uploadProgress = percent;
          }),
      });
      if (this.runId !== runId) return;
      runInAction(() => {
        this.status = result.status;
        this.processingStage = 'queued';
        this.processingProgress = 0;
        this.uploadPhase = 'idle';
      });
      this.saveActiveRun(true);
      this.startPolling(runId);
    } catch (error) {
      if (isAbortError(error) || this.runId !== runId) return;
      runInAction(() => {
        this.uploadPhase = 'idle';
        this.uploadError = errorMessage(error, 'Video upload failed. Please try again.');
      });
    } finally {
      if (this.uploadAbort === abort) this.uploadAbort = null;
    }
  }

  private startPolling(runId: string) {
    if (this.processingAbort) return;
    const abort = new AbortController();
    this.processingAbort = abort;
    void this.pollForModel(runId, abort);
  }

  private async pollForModel(runId: string, abort: AbortController) {
    let failures = 0;
    try {
      while (!abort.signal.aborted && this.runId === runId) {
        try {
          const run = await runsApi.get(runId, abort.signal);
          if (abort.signal.aborted || this.runId !== runId) return;
          failures = 0;
          runInAction(() => this.applyRunDetails(run));

          if (run.status === 'converted' || run.status === 'saved') {
            runInAction(() => {
              if (run.glb_url && this.root.model.url !== run.glb_url) this.root.model.load(run.glb_url);
              this.uploadError = null;
              this.markSaved();
            });
            this.saveActiveRun(false);
            return;
          }
          if (run.status === 'failed') {
            runInAction(() => {
              this.uploadError = run.error ?? '3D model creation failed. Upload another video to try again.';
            });
            this.saveActiveRun(false);
            return;
          }
        } catch (error) {
          if (isAbortError(error) || abort.signal.aborted) return;
          failures += 1;
          if (failures > MAX_POLL_FAILURES) {
            runInAction(() => {
              this.uploadError = errorMessage(error, 'Could not check model creation progress. Retry the status check.');
            });
            return;
          }
        }

        await waitForNextPoll(abort.signal);
      }
    } catch (error) {
      if (!isAbortError(error)) {
        runInAction(() => {
          this.uploadError = errorMessage(error, 'Could not continue checking model creation progress.');
        });
      }
    } finally {
      if (this.processingAbort === abort) this.processingAbort = null;
    }
  }

  private applyRunDetails(run: RunDetail) {
    this.name = run.project_name;
    this.status = run.status;
    this.uploadError = run.status === 'failed' ? run.error : null;
    this.processingStage = run.stage;
    this.processingProgress = run.progress;
  }

  private saveActiveRun(active: boolean) {
    try {
      if (active && this.runId) {
        localStorage.setItem(ACTIVE_RUN_KEY, this.runId);
      } else if (this.runId && localStorage.getItem(ACTIVE_RUN_KEY) === this.runId) {
        localStorage.removeItem(ACTIVE_RUN_KEY);
      }
    } catch (error) {
      this.uploadError = errorMessage(error, 'Could not save this run for progress recovery.');
    }
  }

  private markSaved() {
    this.savedSnapshot = this.snapshot;
  }
}
