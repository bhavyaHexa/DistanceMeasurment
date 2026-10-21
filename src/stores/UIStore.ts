import { makeAutoObservable } from 'mobx';
import type { RootStore } from './RootStore';
import type { Step, Unit } from '../types/measurement';

export class UIStore {
  activeView: 'start' | 'history' | 'viewer' = 'start';
  mode: 'calibrate' | 'measure' = 'calibrate';
  displayUnit: Unit = 'in';
  viewTool: 'rotate' | 'pan' = 'rotate';
  snapToEdges = true;
  showAxisLines = true;
  fitRequest = 0;
  isDraggingFile = false;
  confirm: null | { title: string; confirmLabel: string; onConfirm: () => void } = null;
  private root: RootStore;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this, { root: false } as any);
  }

  goToStart() {
    this.activeView = 'start';
  }

  goToHistory() {
    this.activeView = 'history';
  }

  goToViewer() {
    this.activeView = 'viewer';
  }

  get step(): Step {
    if (!this.root.model.isLoaded) return 'load';
    if (!this.root.measurement.isCalibrated) return 'calibrate';
    return this.mode;
  }

  goToCalibrate() {
    this.root.measurement.startRecalibration();
    this.mode = 'calibrate';
  }

  goToMeasure() {
    this.mode = 'measure';
  }


  requestFit() {
    this.fitRequest++;
  }

  askConfirm(cfg: { title: string; confirmLabel: string; onConfirm: () => void }) {
    this.confirm = cfg;
  }

  closeConfirm() {
    this.confirm = null;
  }

  setUnit(u: Unit) {
    this.displayUnit = u;
  }

  setViewTool(t: 'rotate' | 'pan') {
    this.viewTool = t;
  }

  setSnap(b: boolean) {
    this.snapToEdges = b;
  }

  setShowAxisLines(b: boolean) {
    this.showAxisLines = b;
  }

  setDraggingFile(b: boolean) {
    this.isDraggingFile = b;
  }

  requestReplace(file: File) {
    if (this.root.measurement.measurements.length > 0 || this.root.measurement.isCalibrated) {
      this.askConfirm({
        title: `Replace ${file.name}? Your scale and measurements will be cleared.`,
        confirmLabel: 'Replace',
        onConfirm: () => {
          this.root.measurement.clearAll();
          this.root.measurement.resetCalibration();
          this.root.model.setFile(file);
          this.mode = 'calibrate';
        },
      });
    } else {
      this.root.measurement.clearAll();
      this.root.measurement.resetCalibration();
      this.root.model.setFile(file);
      this.mode = 'calibrate';
    }
  }
}
