import { makeAutoObservable } from 'mobx';
import type { PointEnd, Vec3 } from '@/types/geometry';
import type { CalibrationPoints, Unit } from '@/types/measurement';
import type { SavedCalibration } from '@/types/projectFile';
import { axisDelta } from '@/utils/geometry';
import { toMeters } from '@/utils/units';
import type { RootStore } from './RootStore';

const EMPTY_POINTS: CalibrationPoints = { a: null, b: null };

/**
 * Scale calibration: two points on the model plus their real-world VERTICAL distance.
 * `applied` is the scale in use; `draft` is what the user is editing in the Set scale step.
 */
export class CalibrationStore {
  applied: CalibrationPoints = EMPTY_POINTS;
  length: number | null = null;
  unit: Unit = 'in';

  draft: CalibrationPoints = EMPTY_POINTS;
  lengthInput = '';

  private readonly root: RootStore;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable<this, 'root'>(this, { root: false }, { autoBind: true });
  }

  /** Real-world metres per scene unit, from the vertical (Y) offset between A and B. */
  get metersPerSceneUnit(): number | null {
    const { a, b } = this.applied;
    if (!a || !b || !this.length) return null;
    const sceneHeight = axisDelta(a, b, 'y');
    return sceneHeight === 0 ? null : toMeters(this.length, this.unit) / sceneHeight;
  }

  get isCalibrated(): boolean {
    return this.metersPerSceneUnit !== null;
  }

  /** The next draft point a click will place, or null when both are placed. */
  get nextPoint(): PointEnd | null {
    if (!this.draft.a) return 'a';
    if (!this.draft.b) return 'b';
    return null;
  }

  pointStatus(end: PointEnd): 'placed' | 'next' | 'waiting' {
    if (this.draft[end]) return 'placed';
    return this.nextPoint === end ? 'next' : 'waiting';
  }

  get isPicking(): boolean {
    return this.root.workspace.step === 'calibrate' && this.nextPoint !== null;
  }

  get parsedLength(): number | null {
    const value = Number.parseFloat(this.lengthInput);
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  get canApply(): boolean {
    return this.nextPoint === null && this.parsedLength !== null;
  }

  get summary(): string | null {
    return this.length === null ? null : `${this.length} ${this.unit}`;
  }

  placePoint(point: Vec3) {
    const end = this.nextPoint;
    if (!end) return;
    this.recordDraftForUndo();
    this.draft = { ...this.draft, [end]: point };
  }

  repick(end: PointEnd) {
    this.recordDraftForUndo();
    this.draft = { ...this.draft, [end]: null };
  }

  moveDraftPoint(end: PointEnd, point: Vec3) {
    if (this.draft[end]) this.draft = { ...this.draft, [end]: point };
  }

  setLengthInput(value: string) {
    this.lengthInput = value;
  }

  apply() {
    if (!this.canApply) return;
    this.applied = { ...this.draft };
    this.length = this.parsedLength;
    this.unit = this.root.workspace.displayUnit;
  }

  /** Starts editing from the scale currently in use. */
  beginEdit() {
    this.draft = { ...this.applied };
    this.lengthInput = this.length?.toString() ?? '';
  }

  reset() {
    this.applied = EMPTY_POINTS;
    this.length = null;
    this.unit = 'in';
    this.draft = EMPTY_POINTS;
    this.lengthInput = '';
  }

  toJSON(): SavedCalibration {
    return { calA: this.applied.a, calB: this.applied.b, calLength: this.length, calUnit: this.unit };
  }

  load(saved: SavedCalibration) {
    this.applied = { a: saved.calA, b: saved.calB };
    this.length = saved.calLength;
    this.unit = saved.calUnit;
    this.beginEdit();
  }

  private recordDraftForUndo() {
    const previous = this.draft;
    this.root.history.push(() => {
      this.draft = previous;
    });
  }
}
