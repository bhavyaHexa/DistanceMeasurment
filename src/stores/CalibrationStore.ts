import { makeAutoObservable } from 'mobx';
import type { PointEnd, Vec3 } from '@/types/geometry';
import type { CalibrationPoints, MeasureMode, Unit } from '@/types/measurement';
import type { SavedCalibration } from '@/types/projectFile';
import { segmentLength } from '@/utils/geometry';
import { toMeters } from '@/utils/units';
import type { RootStore } from './RootStore';

const EMPTY_POINTS: CalibrationPoints = { a: null, b: null };

/**
 * Scale calibration: two points on the model plus a real-world length for one chosen measure
 * (direct distance, or the ΔX / ΔY / ΔZ component between them).
 * `applied` is the scale in use; `draft` is what the user is editing in the Set scale step.
 */
export class CalibrationStore {
  applied: CalibrationPoints = EMPTY_POINTS;
  length: number | null = null;
  unit: Unit = 'in';
  mode: MeasureMode = 'y';

  draft: CalibrationPoints = EMPTY_POINTS;
  lengthInput = '';
  draftMode: MeasureMode = 'y';

  private readonly root: RootStore;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable<this, 'root'>(this, { root: false }, { autoBind: true });
  }

  /** Real-world metres per scene unit, from the chosen measure between the applied A and B. */
  get metersPerSceneUnit(): number | null {
    const { a, b } = this.applied;
    if (!a || !b || !this.length) return null;
    const sceneLength = segmentLength(a, b, this.mode);
    return sceneLength === 0 ? null : toMeters(this.length, this.unit) / sceneLength;
  }

  /** Scene length of the draft pair for `mode`, or null until both points are placed. */
  draftSceneLength(mode: MeasureMode): number | null {
    const { a, b } = this.draft;
    return a && b ? segmentLength(a, b, mode) : null;
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
    return this.nextPoint === null && this.parsedLength !== null && !!this.draftSceneLength(this.draftMode);
  }

  get summary(): string | null {
    return this.length === null ? null : `${this.length} ${this.unit}`;
  }

  setDraftMode(mode: MeasureMode) {
    this.draftMode = mode;
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
    this.mode = this.draftMode;
  }

  /** Starts editing from the scale currently in use. */
  beginEdit() {
    this.draft = { ...this.applied };
    this.lengthInput = this.length?.toString() ?? '';
    this.draftMode = this.mode;
  }

  reset() {
    this.applied = EMPTY_POINTS;
    this.length = null;
    this.unit = 'in';
    this.mode = 'y';
    this.draft = EMPTY_POINTS;
    this.lengthInput = '';
    this.draftMode = 'y';
  }

  /** Moves both the applied and the draft points with `remap`. */
  remapPoints(remap: (point: Vec3) => Vec3) {
    const map = (point: Vec3 | null) => (point ? remap(point) : null);
    this.applied = { a: map(this.applied.a), b: map(this.applied.b) };
    this.draft = { a: map(this.draft.a), b: map(this.draft.b) };
  }

  toJSON(): SavedCalibration {
    return {
      calA: this.applied.a,
      calB: this.applied.b,
      calLength: this.length,
      calUnit: this.unit,
      calMode: this.mode,
    };
  }

  load(saved: SavedCalibration) {
    this.applied = { a: saved.calA, b: saved.calB };
    this.length = saved.calLength;
    this.unit = saved.calUnit;
    this.mode = saved.calMode ?? 'y';
    this.beginEdit();
  }

  private recordDraftForUndo() {
    const previous = this.draft;
    this.root.history.push(() => {
      this.draft = previous;
    });
  }
}
