import { makeAutoObservable, runInAction } from 'mobx';
import { errorMessage } from '@/services/http';
import type { RootStore } from './RootStore';

const MAX_NAME_LENGTH = 255;

/** State of the "New project" dialog: project name and project creation. */
export class NewProjectFormStore {
  isOpen = false;
  name = '';
  isSubmitting = false;
  submitError: string | null = null;

  private readonly root: RootStore;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable<this, 'root'>(this, { root: false }, { autoBind: true });
  }

  get trimmedName(): string {
    return this.name.trim();
  }

  get nameError(): string | null {
    return this.trimmedName.length > MAX_NAME_LENGTH ? `Use ${MAX_NAME_LENGTH} characters or fewer.` : null;
  }

  get canSubmit(): boolean {
    return this.trimmedName.length > 0 && !this.nameError && !this.isSubmitting;
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

  async submit(): Promise<string | null> {
    if (!this.canSubmit) return null;
    this.isSubmitting = true;
    this.submitError = null;

    try {
      const runId = await this.root.project.create(this.trimmedName);
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
    this.name = '';
    this.submitError = null;
  }
}
