import { makeAutoObservable, observableRef } from 'mobx';

export interface ConfirmRequest {
  title: string;
  description?: string;
  confirmLabel: string;
  tone?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel?: () => void;
  /** Optional extra action (e.g. "Leave without saving") shown between Cancel and the primary button. */
  secondaryLabel?: string;
  onSecondary?: () => void;
}

/** App-wide UI state that isn't tied to one feature: the confirmation dialog. */
export class UIStore {
  confirmRequest: ConfirmRequest | null = null;

  constructor() {
    makeAutoObservable(this, { confirmRequest: observableRef }, { autoBind: true });
  }

  askConfirm(request: ConfirmRequest) {
    this.confirmRequest = request;
  }

  reset() {
    this.confirmRequest = null;
  }

  confirm() {
    const request = this.confirmRequest;
    this.confirmRequest = null;
    request?.onConfirm();
  }

  confirmSecondary() {
    const request = this.confirmRequest;
    this.confirmRequest = null;
    request?.onSecondary?.();
  }

  cancelConfirm() {
    const request = this.confirmRequest;
    this.confirmRequest = null;
    request?.onCancel?.();
  }
}
