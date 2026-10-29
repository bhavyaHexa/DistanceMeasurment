import { makeAutoObservable, observableShallow, runInAction } from 'mobx';
import { errorMessage } from '@/services/http';
import { runsApi } from '@/services/runsApi';
import type { RunStatus, RunSummary } from '@/types/api';

const PAGE_SIZE = 20;
const API_PAGE_SIZE = 100;
const SEARCH_DEBOUNCE_MS = 300;
const LISTED_STATUSES: readonly RunStatus[] = ['saved', 'queued', 'processing'];

/** The Projects page: a searchable, globally sorted list of saved and active runs. */
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
      const requiredCount = (page + 1) * PAGE_SIZE;
      const offsets = Array.from(
        { length: Math.ceil(requiredCount / API_PAGE_SIZE) },
        (_, index) => index * API_PAGE_SIZE,
      );
      const results = await Promise.all(
        LISTED_STATUSES.map(async (status) => {
          const pages = await Promise.all(
            offsets.map((offset) =>
              runsApi.list({
                status,
                project_name: this.search.trim() || undefined,
                limit: Math.min(API_PAGE_SIZE, requiredCount - offset),
                offset,
              }),
            ),
          );
          return {
            total: pages[0]?.total ?? 0,
            items: pages.flatMap((result) => result.items),
          };
        }),
      );
      if (requestId !== this.requestId) return;
      runInAction(() => {
        const allItems = results.flatMap((result) => result.items);
        allItems.sort((a, b) => {
          const timeDifference = Date.parse(b.created_at) - Date.parse(a.created_at);
          return timeDifference || a.run_id.localeCompare(b.run_id);
        });
        this.items = allItems.slice(page * PAGE_SIZE, requiredCount);
        this.total = results.reduce((sum, result) => sum + result.total, 0);
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
