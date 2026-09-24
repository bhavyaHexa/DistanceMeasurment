import { ModelStore } from './ModelStore';
import { MeasurementStore } from './MeasurementStore';

export class RootStore {
  model = new ModelStore();
  measurement = new MeasurementStore();
}

export const rootStore = new RootStore();
