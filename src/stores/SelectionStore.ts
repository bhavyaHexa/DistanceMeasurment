import { makeAutoObservable, observableRef } from 'mobx';
import type { SceneEntity, SelectionFilter, SelectionMenuState } from '@/types/selection';
import { entityKey } from '@/utils/entityMetrics';
import type { RootStore } from './RootStore';

/**
 * CAD-style selection of points, edges and faces on the model: a filter picks what the cursor
 * sees, hovering previews it, clicking selects it (Ctrl/Shift adds), and right-click offers a
 * menu for the entities under the cursor.
 */
export class SelectionStore {
  filter: SelectionFilter = 'point';
  hover: SceneEntity | null = null;
  selected: SceneEntity[] = [];
  menu: SelectionMenuState | null = null;

  private readonly root: RootStore;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable<this, 'root'>(
      this,
      { root: false, hover: observableRef, selected: observableRef, menu: observableRef },
      { autoBind: true },
    );
  }

  /** Hover and click-to-select run only while measuring and not busy placing or dragging a point. */
  get isActive(): boolean {
    const { workspace, measurements, viewer } = this.root;
    return workspace.step === 'measure' && !measurements.isPlacing && !viewer.isDragging;
  }

  /** The hovered entity, unless it is already selected (the selected highlight wins). */
  get hoverPreview(): SceneEntity | null {
    if (!this.isActive || !this.hover) return null;
    const key = entityKey(this.hover);
    return this.selected.some((entity) => entityKey(entity) === key) ? null : this.hover;
  }

  setFilter(filter: SelectionFilter) {
    if (this.filter === filter) return;
    this.filter = filter;
    this.hover = null;
  }

  setHover(entity: SceneEntity | null) {
    this.hover = entity;
  }

  /** Selects `entity`; with `additive`, toggles it in the current selection instead. */
  select(entity: SceneEntity, additive = false) {
    if (!additive) {
      this.selected = [entity];
      return;
    }
    const key = entityKey(entity);
    const exists = this.selected.some((item) => entityKey(item) === key);
    this.selected = exists ? this.selected.filter((item) => entityKey(item) !== key) : [...this.selected, entity];
  }

  clearSelection() {
    if (this.selected.length > 0) this.selected = [];
  }

  openMenu(menu: SelectionMenuState) {
    this.hover = null;
    this.menu = menu;
  }

  closeMenu() {
    this.menu = null;
  }

  /** Menu choice: select what was under the cursor and keep that kind as the active filter. */
  chooseFromMenu(filter: SelectionFilter) {
    const entity = this.menu?.options[filter];
    this.menu = null;
    // Picking a selection ends any point placement, like switching tools in a CAD program.
    this.root.measurements.cancelPlacing();
    this.setFilter(filter);
    if (entity) this.selected = [entity];
  }

  /** Esc: drop the hover, the menu and the selection. */
  cancel() {
    this.hover = null;
    this.menu = null;
    this.clearSelection();
  }

  reset() {
    this.filter = 'point';
    this.hover = null;
    this.selected = [];
    this.menu = null;
  }
}
