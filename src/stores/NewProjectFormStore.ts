import { makeAutoObservable, observableRef, runInAction } from 'mobx';
import { errorMessage } from '@/services/http';
import { prepareScanZip, type PreparedScan } from '@/utils/zip';
import type { RootStore } from './RootStore';

const MAX_NAME_LENGTH = 100;

/** State of the "New project" dialog: project name plus the scan ZIP, validated before submit. */
export class NewProjectFormStore {
  isOpen = false;
  name = '';
  scan: PreparedScan | null = null;
  fileError: string | null = null;
  isPreparing = false;
  isSubmitting = false;
  submitError: string | null = null;

  private prepareId = 0;
  private readonly root: RootStore;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable<this, 'root' | 'prepareId'>(
      this,
      { root: false, prepareId: false, scan: observableRef },
      { autoBind: true },
    );
  }

  get trimmedName(): string {
    return this.name.trim();
  }

  get nameError(): string | null {
    return this.trimmedName.length > MAX_NAME_LENGTH ? `Use ${MAX_NAME_LENGTH} characters or fewer.` : null;
  }

  get canSubmit(): boolean {
    return (
      this.trimmedName.length > 0 && !this.nameError && this.scan !== null && !this.isPreparing && !this.isSubmitting
    );
  }

  open() {
    this.reset();
    this.isOpen = true;
  }

  close() {
    if (this.isSubmitting) return;
    this.isOpen = false;
    this.reset();
  }

  setName(value: string) {
    this.name = value;
  }

  async selectFile(file: File) {
    const id = ++this.prepareId;
    this.scan = null;
    this.fileError = null;
    this.isPreparing = true;
    if (!this.trimmedName) this.name = file.name.replace(/\.zip$/i, '');

    try {
      const scan = await prepareScanZip(file);
      if (id === this.prepareId) runInAction(() => (this.scan = scan));
    } catch (error) {
      if (id === this.prepareId) runInAction(() => (this.fileError = errorMessage(error, 'Could not read this file.')));
    } finally {
      if (id === this.prepareId) runInAction(() => (this.isPreparing = false));
    }
  }

  clearFile() {
    this.prepareId++;
    this.scan = null;
    this.fileError = null;
    this.isPreparing = false;
  }

  /** Creates the project and starts the upload. Resolves with the new run id, or null on failure. */
  async submit(): Promise<string | null> {
    if (!this.canSubmit || !this.scan) return null;
    this.isSubmitting = true;
    this.submitError = null;

    try {
      const runId = await this.root.project.create(this.trimmedName, this.scan);
      runInAction(() => {
        this.isSubmitting = false;
        this.close();
      });
      return runId;
    } catch (error) {
      runInAction(() => {
        this.isSubmitting = false;
        this.submitError = errorMessage(error, 'Could not create the project.');
      });
      return null;
    }
  }

  private reset() {
    this.clearFile();
    this.name = '';
    this.submitError = null;
  }
}
