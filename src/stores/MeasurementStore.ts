import { makeAutoObservable, observableShallow } from 'mobx';
import type { PointEnd, Vec3 } from '@/types/geometry';
import type { MeasureMode, Measurement } from '@/types/measurement';
import type { SavedMeasurement } from '@/types/projectFile';
import { buildMeasurementsCsv } from '@/utils/csv';
import { segmentLength } from '@/utils/geometry';
import { makeId } from '@/utils/ids';
import { MEASURE_COLORS } from '@/utils/measureColors';
import { formatLength, sceneToUnit } from '@/utils/units';
import type { RootStore } from './RootStore';

/** Default reported length for new measurements: the vertical component. */
const DEFAULT_MODE: MeasureMode = 'y';

/**
 * The measurement list. Items are replaced (never mutated) on change, so the shallow
 * observable array is enough to re-render rows and scene objects.
 */
export class MeasurementStore {
  items: Measurement[] = [];
  /** Measurement waiting for its points to be clicked on the model. */
  placingId: string | null = null;
  selectedId: string | null = null;
  /** Row whose name is being edited inline. */
  renamingId: string | null = null;
  private nextColorIndex = 0;

  private readonly root: RootStore;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable<this, 'root'>(this, { root: false, items: observableShallow }, { autoBind: true });
  }

  get placing(): Measurement | null {
    return this.items.find((m) => m.id === this.placingId) ?? null;
  }

  get isPlacing(): boolean {
    return this.placingId !== null;
  }

  isSelected(id: string): boolean {
    return this.selectedId === id;
  }

  /** Length of `m` in the display unit, for the given mode (defaults to the row's chosen mode). */
  formatValue(m: Measurement, mode: MeasureMode = m.selectedAxis): string {
    const scale = this.root.calibration.metersPerSceneUnit;
    if (!m.a || !m.b || scale === null) return '—';
    const unit = this.root.workspace.displayUnit;
    return formatLength(sceneToUnit(segmentLength(m.a, m.b, mode), scale, unit), unit);
  }

  get csv(): string {
    const { calibration, workspace } = this.root;
    return buildMeasurementsCsv({
      measurements: this.items,
      metersPerSceneUnit: calibration.metersPerSceneUnit,
      unit: workspace.displayUnit,
      calibration: calibration.length === null ? null : { length: calibration.length, unit: calibration.unit },
    });
  }

  /** Adds a measurement and waits for its two points to be clicked. */
  startNew() {
    this.cancelPlacing();
    const measurement: Measurement = {
      id: makeId(),
      name: `Measurement ${this.items.length + 1}`,
      a: null,
      b: null,
      colorIndex: this.nextColorIndex,
      visible: true,
      selectedAxis: DEFAULT_MODE,
      createdAt: Date.now(),
    };
    this.nextColorIndex = (this.nextColorIndex + 1) % MEASURE_COLORS.length;
    this.items.push(measurement);
    this.placingId = measurement.id;
    this.selectedId = null;
  }

  /** Stops placing; a measurement that never got both points is discarded. */
  cancelPlacing() {
    const placing = this.placing;
    this.placingId = null;
    if (placing && !placing.b) this.items = this.items.filter((m) => m.id !== placing.id);
  }

  placePoint(point: Vec3) {
    const placing = this.placing;
    if (!placing) return;
    if (!placing.a) {
      this.update(placing.id, { a: point });
      return;
    }
    this.update(placing.id, { b: point });
    this.placingId = null;
    this.selectedId = placing.id;
    this.root.history.push(() => this.removeWithoutHistory(placing.id));
  }

  movePoint(id: string, end: PointEnd, point: Vec3) {
    this.update(id, { [end]: point });
  }

  select(id: string | null) {
    this.selectedId = id;
  }

  toggleSelected(id: string) {
    this.selectedId = this.selectedId === id ? null : id;
  }

  get hasCompleted(): boolean {
    return this.items.some((m) => m.a && m.b);
  }

  startRename(id: string) {
    this.renamingId = id;
  }

  /** Saves the inline edit; an empty name keeps the old one. */
  finishRename(name: string) {
    const id = this.renamingId;
    this.renamingId = null;
    const trimmed = name.trim();
    if (id && trimmed) this.update(id, { name: trimmed });
  }

  cancelRename() {
    this.renamingId = null;
  }

  setMode(id: string, mode: MeasureMode) {
    this.update(id, { selectedAxis: mode });
  }

  toggleVisible(id: string) {
    const m = this.items.find((item) => item.id === id);
    if (m) this.update(id, { visible: !m.visible });
  }

  remove(id: string) {
    const index = this.items.findIndex((m) => m.id === id);
    if (index < 0) return;
    const removed = this.items[index];
    this.removeWithoutHistory(id);
    if (removed.b) {
      this.root.history.push(() => {
        this.items.splice(index, 0, removed);
      });
    }
  }

  clearAll() {
    const previous = this.items;
    this.reset();
    this.root.history.push(() => {
      this.items = previous;
    });
  }

  reset() {
    this.items = [];
    this.placingId = null;
    this.selectedId = null;
    this.renamingId = null;
  }

  toJSON(): { measurements: SavedMeasurement[]; nextColorIndex: number } {
    return {
      measurements: this.items
        .filter((m) => m.a && m.b)
        .map(({ id, name, colorIndex, visible, a, b, selectedAxis, createdAt }) => ({
          id,
          name,
          colorIndex,
          visible,
          a,
          b,
          selectedAxis,
          createdAt,
        })),
      nextColorIndex: this.nextColorIndex,
    };
  }

  load(saved: SavedMeasurement[], nextColorIndex: number) {
    this.reset();
    this.items = saved.map((m) => ({
      ...m,
      // Saves made before the mode was stored reported the straight-line length.
      selectedAxis: m.selectedAxis ?? 'euclidean',
      createdAt: m.createdAt ?? Date.now(),
    }));
    this.nextColorIndex = nextColorIndex;
  }

  private update(id: string, patch: Partial<Measurement>) {
    const index = this.items.findIndex((m) => m.id === id);
    if (index >= 0) this.items[index] = { ...this.items[index], ...patch };
  }

  private removeWithoutHistory(id: string) {
    this.items = this.items.filter((m) => m.id !== id);
    if (this.selectedId === id) this.selectedId = null;
    if (this.placingId === id) this.placingId = null;
  }
}
