import { makeAutoObservable, observableShallow } from 'mobx';

const MAX_ENTRIES = 50;

/** Undo stack. Each entry is a function that reverts one user action. */
export class HistoryStore {
  private entries: Array<() => void> = [];

  constructor() {
    makeAutoObservable<this, 'entries'>(this, { entries: observableShallow }, { autoBind: true });
  }

  get canUndo(): boolean {
    return this.entries.length > 0;
  }

  push(revert: () => void) {
    this.entries.push(revert);
    if (this.entries.length > MAX_ENTRIES) this.entries.shift();
  }

  undo() {
    this.entries.pop()?.();
  }

  clear() {
    this.entries = [];
  }
}
