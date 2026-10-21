import { makeAutoObservable, observableShallow, runInAction } from 'mobx';
import { errorMessage } from '@/services/http';
import { runsApi } from '@/services/runsApi';
import type { RunSummary } from '@/types/api';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

/** The Projects page: a searchable, paged list of every run. */
export class ProjectsListStore {
  items: RunSummary[] = [];
  total = 0;
  page = 0;
  search = '';
  isLoading = false;
  hasLoaded = false;
  error: string | null = null;

  private requestId = 0;
  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    makeAutoObservable<this, 'requestId' | 'searchTimer'>(
      this,
      { items: observableShallow, requestId: false, searchTimer: false },
      { autoBind: true },
    );
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.total / PAGE_SIZE));
  }

  get canGoBack(): boolean {
    return this.page > 0 && !this.isLoading;
  }

  get canGoForward(): boolean {
    return this.page + 1 < this.pageCount && !this.isLoading;
  }

  get isEmpty(): boolean {
    return this.hasLoaded && !this.isLoading && !this.error && this.items.length === 0;
  }

  setSearch(value: string) {
    this.search = value;
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.load(0), SEARCH_DEBOUNCE_MS);
  }

  nextPage() {
    if (this.canGoForward) void this.load(this.page + 1);
  }

  previousPage() {
    if (this.canGoBack) void this.load(this.page - 1);
  }

  async load(page = this.page) {
    const requestId = ++this.requestId;
    this.page = page;
    this.isLoading = true;
    this.error = null;

    try {
      const result = await runsApi.list({
        project_name: this.search.trim() || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      if (requestId !== this.requestId) return;
      runInAction(() => {
        this.items = result.items;
        this.total = result.total;
      });
    } catch (error) {
      if (requestId !== this.requestId) return;
      runInAction(() => {
        this.error = errorMessage(error, 'Could not load projects.');
      });
    } finally {
      if (requestId === this.requestId) {
        runInAction(() => {
          this.isLoading = false;
          this.hasLoaded = true;
        });
      }
    }
  }
}
