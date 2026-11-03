import { makeAutoObservable, runInAction } from 'mobx';
import { errorMessage } from '@/services/http';
import { runsApi } from '@/services/runsApi';
import type { RootStore } from './RootStore';
import { LISTED_STATUSES } from './ProjectsListStore';

const MAX_NAME_LENGTH = 255;
const NAME_CHECK_LIMIT = 100;

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
      if (await this.isNameTaken(this.trimmedName)) {
        runInAction(() => {
          this.isSubmitting = false;
          this.submitError = `A project named "${this.trimmedName}" already exists. Choose a different name.`;
        });
        return null;
      }
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

  /** Names are compared ignoring case and surrounding spaces. The API only lists runs per status. */
  private async isNameTaken(name: string): Promise<boolean> {
    const key = name.toLowerCase();
    const results = await Promise.all(
      LISTED_STATUSES.map((status) => runsApi.list({ status, project_name: name, limit: NAME_CHECK_LIMIT })),
    );
    return results.some((result) =>
      result.items.some((item) => item.project_name.trim().toLowerCase() === key),
    );
  }

  private reset() {
    this.name = '';
    this.submitError = null;
  }
}
