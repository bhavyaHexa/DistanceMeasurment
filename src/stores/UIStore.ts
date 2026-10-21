import { makeAutoObservable, observableRef } from 'mobx';

export interface ConfirmRequest {
  title: string;
  description?: string;
  confirmLabel: string;
  tone?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel?: () => void;
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

  confirm() {
    const request = this.confirmRequest;
    this.confirmRequest = null;
    request?.onConfirm();
  }

  cancelConfirm() {
    const request = this.confirmRequest;
    this.confirmRequest = null;
    request?.onCancel?.();
  }
}
