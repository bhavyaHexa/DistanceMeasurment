import { ModelStore } from './ModelStore';
import { MeasurementStore } from './MeasurementStore';
import { UIStore } from './UIStore';

export class RootStore {
  model = new ModelStore();
  measurement = new MeasurementStore();
  ui = new UIStore(this);
}

export const rootStore = new RootStore();
