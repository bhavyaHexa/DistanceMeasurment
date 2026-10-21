import { makeAutoObservable } from 'mobx';
import type { Vec3 } from '@/types/geometry';
import type { Unit } from '@/types/measurement';
import type { Hint, Step } from '@/types/workspace';
import type { RootStore } from './RootStore';

const STEP_ORDER: readonly Step[] = ['upload', 'calibrate', 'measure'];

/** The open project's workflow: which step is active, the display unit and the hint to show. */
export class WorkspaceStore {
  /** Chosen step once the model is calibrated; before that the step is forced. */
  private mode: 'calibrate' | 'measure' = 'calibrate';
  displayUnit: Unit = 'in';

  private readonly root: RootStore;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable<this, 'root'>(this, { root: false }, { autoBind: true });
  }

  get step(): Step {
    if (!this.root.model.isLoaded) return 'upload';
    if (!this.root.calibration.isCalibrated) return 'calibrate';
    return this.mode;
  }

  get stepNumber(): number {
    return STEP_ORDER.indexOf(this.step) + 1;
  }

  isStepDone(step: Step): boolean {
    if (step === 'upload') return this.root.model.isLoaded;
    if (step === 'calibrate') return this.root.calibration.isCalibrated;
    return false;
  }

  canOpenStep(step: Step): boolean {
    if (step === 'calibrate') return this.root.model.isLoaded;
    if (step === 'measure') return this.root.calibration.isCalibrated;
    return false;
  }

  /** True when a click on the model will place a point. */
  get isPlacingPoint(): boolean {
    if (this.step === 'calibrate') return this.root.calibration.isPicking;
    if (this.step === 'measure') return this.root.measurements.isPlacing;
    return false;
  }

  get hint(): Hint | null {
    const { calibration, measurements, viewer } = this.root;
    if (viewer.isDragging) return { text: 'Drag to move the point, release to drop it', tone: 'active' };

    if (this.step === 'calibrate') {
      if (calibration.nextPoint === 'a') return { text: 'Click the model to place point A', tone: 'calibration' };
      if (calibration.nextPoint === 'b') return { text: 'Click the model to place point B', tone: 'calibration' };
      return { text: 'Enter the real vertical distance between A and B, then apply', tone: 'success' };
    }

    if (this.step === 'measure') {
      const placing = measurements.placing;
      if (placing?.a) return { text: 'Click to place the end point', tone: 'active' };
      if (placing) return { text: 'Click the model to place the start point', tone: 'active' };
      return { text: 'Select a measurement, or add a new one', tone: 'neutral' };
    }
    return null;
  }

  openStep(step: Step) {
    if (!this.canOpenStep(step) || step === this.step) return;
    if (step === 'calibrate') {
      this.root.measurements.cancelPlacing();
      this.root.calibration.beginEdit();
      this.mode = 'calibrate';
    } else if (step === 'measure') {
      this.mode = 'measure';
    }
  }

  applyCalibration() {
    this.root.calibration.apply();
    if (this.root.calibration.isCalibrated) this.mode = 'measure';
  }

  /** Leaves the Set scale step without changing the scale in use. */
  cancelCalibration() {
    this.root.calibration.beginEdit();
    this.mode = 'measure';
  }

  placePoint(point: Vec3) {
    if (this.step === 'calibrate') this.root.calibration.placePoint(point);
    else if (this.step === 'measure') this.root.measurements.placePoint(point);
  }

  /** Esc: stop whatever point placement is in progress. */
  cancelInteraction() {
    this.root.measurements.cancelPlacing();
    this.root.viewer.setHoverPoint(null);
  }

  setDisplayUnit(unit: Unit) {
    this.displayUnit = unit;
  }

  /** After opening a project: go straight to measuring when a scale is already set. */
  showInitialStep() {
    this.mode = this.root.calibration.isCalibrated ? 'measure' : 'calibrate';
  }

  reset() {
    this.mode = 'calibrate';
  }
}
