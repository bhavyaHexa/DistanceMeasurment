import { makeAutoObservable, runInAction } from 'mobx';
import type { RootStore } from './RootStore';
import { api, type RunSummary, type RunStatus } from '../services/api';
import { filterAndPrepareZip } from '../utils/zipUtils';

export class RunStore {
  private root: RootStore;

  // Active run state
  currentRunId: string | null = null;
  projectName: string = '';
  status: RunStatus | null = null;
  
  // Upload and conversion state
  isUploading: boolean = false;
  uploadProgress: number = 0;
  isProcessing: boolean = false;
  isSaving: boolean = false;
  saveMessage: string | null = null;
  error: string | null = null;

  // History list state
  historyRuns: RunSummary[] = [];
  historyTotal: number = 0;
  historyLoading: boolean = false;
  historyPage: number = 0;
  historyPageSize: number = 20;
  historySearch: string = '';

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this, { root: false } as any);
  }

  setError(err: string | null) {
    this.error = err;
  }

  clearError() {
    this.error = null;
  }

  // 1. Create a brand new project
  async createNewProject(name: string): Promise<string> {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('Project name cannot be empty');
    }

    this.clearError();
    this.saveMessage = null;

    // Reset current workspace
    this.root.measurement.clearAll();
    this.root.measurement.resetCalibration();
    this.root.model.reset();

    const run = await api.createRun(trimmed);
    runInAction(() => {
      this.currentRunId = run.run_id;
      this.projectName = run.project_name;
      this.status = run.status;
      this.uploadProgress = 0;
      this.isUploading = false;
      this.isProcessing = false;
      // Navigate to viewer view where user will upload the ZIP
      this.root.ui.goToViewer();
    });

    return run.run_id;
  }

  // 2. Process and upload ZIP archive (filters out mp4, sends to convert)
  async uploadAndConvertZip(file: File) {
    if (!this.currentRunId) {
      throw new Error('No active project session. Please create a project first.');
    }

    try {
      this.clearError();
      this.isUploading = true;
      this.uploadProgress = 0;
      this.isProcessing = false;

      // Filter out .mp4 and validate 1 obj, 1 mtl, 1 jpg
      const { zipBlob } = await filterAndPrepareZip(file);

      // Upload with progress
      const result = await api.convertWithProgress(
        this.currentRunId,
        zipBlob,
        (percent) => {
          runInAction(() => {
            this.uploadProgress = percent;
            if (percent >= 100) {
              this.isProcessing = true;
            }
          });
        }
      );

      runInAction(() => {
        this.status = result.status;
        this.isUploading = false;
        this.isProcessing = false;
        this.uploadProgress = 100;
        // Load the converted GLB into ModelStore
        this.root.model.setRemoteModel(`${this.projectName}.glb`, result.glb_url);
      });
    } catch (err: any) {
      runInAction(() => {
        this.isUploading = false;
        this.isProcessing = false;
        this.error = err.message || 'Failed to upload and convert model.';
        this.root.model.setError(this.error!);
      });
      throw err;
    }
  }

  // 3. Save current measurements and calibration
  async saveProject() {
    if (!this.currentRunId) {
      throw new Error('No active project to save.');
    }

    try {
      this.isSaving = true;
      this.clearError();
      this.saveMessage = null;

      const metadata = {
        projectName: this.projectName,
        savedAt: new Date().toISOString(),
        measurementData: this.root.measurement.exportData(),
        displayUnit: this.root.ui.displayUnit,
      };

      const res = await api.saveRun(this.currentRunId, metadata);

      runInAction(() => {
        this.status = res.status;
        this.isSaving = false;
        this.saveMessage = 'Project saved successfully!';
      });

      // Clear save message after 3 seconds
      setTimeout(() => {
        runInAction(() => {
          if (this.saveMessage === 'Project saved successfully!') {
            this.saveMessage = null;
          }
        });
      }, 3000);
    } catch (err: any) {
      runInAction(() => {
        this.isSaving = false;
        this.error = err.message || 'Failed to save project.';
      });
      throw err;
    }
  }

  // 4. Load saved project from history
  async openProjectFromHistory(runId: string) {
    try {
      this.clearError();
      this.historyLoading = true;

      const runDetail = await api.getRun(runId);

      if (!runDetail.glb_url) {
        throw new Error('This project has no converted 3D model available.');
      }

      // Reset workspace
      this.root.measurement.clearAll();
      this.root.measurement.resetCalibration();
      this.root.model.reset();

      // Download saved metadata JSON if present
      let metadata: any = null;
      if (runDetail.json_url) {
        try {
          const res = await fetch(runDetail.json_url);
          if (res.ok) {
            metadata = await res.json();
          }
        } catch (fetchErr) {
          console.warn('Could not load saved JSON metadata:', fetchErr);
        }
      }

      runInAction(() => {
        this.currentRunId = runDetail.run_id;
        this.projectName = runDetail.project_name;
        this.status = runDetail.status;
        this.uploadProgress = 100;
        this.isUploading = false;
        this.isProcessing = false;
        this.historyLoading = false;

        // Load 3D model
        this.root.model.setRemoteModel(`${runDetail.project_name}.glb`, runDetail.glb_url!);

        // Hydrate measurements & units
        if (metadata) {
          if (metadata.measurementData) {
            this.root.measurement.importData(metadata.measurementData);
          }
          if (metadata.displayUnit) {
            this.root.ui.setUnit(metadata.displayUnit);
          }
        }

        // Navigate to 3D viewer
        this.root.ui.goToViewer();
      });
    } catch (err: any) {
      runInAction(() => {
        this.historyLoading = false;
        this.error = err.message || 'Failed to load project.';
      });
      throw err;
    }
  }

  // 5. Fetch history list
  async fetchHistory(page: number = 0, search: string = this.historySearch) {
    try {
      this.historyLoading = true;
      this.historyPage = page;
      this.historySearch = search;

      const res = await api.listRuns({
        status: 'saved',
        project_name: search || undefined,
        limit: this.historyPageSize,
        offset: page * this.historyPageSize,
      });

      runInAction(() => {
        this.historyRuns = res.items;
        this.historyTotal = res.total;
        this.historyLoading = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.historyLoading = false;
        this.error = err.message || 'Failed to fetch history.';
      });
    }
  }
}
