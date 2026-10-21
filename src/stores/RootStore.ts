import { ModelStore } from './ModelStore';
import { MeasurementStore } from './MeasurementStore';
import { UIStore } from './UIStore';
import { RunStore } from './RunStore';

export class RootStore {
  model = new ModelStore();
  measurement = new MeasurementStore();
  ui = new UIStore(this);
  run = new RunStore(this);
}

export const rootStore = new RootStore();

