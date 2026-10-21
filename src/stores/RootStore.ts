import { CalibrationStore } from './CalibrationStore';
import { HistoryStore } from './HistoryStore';
import { MeasurementStore } from './MeasurementStore';
import { ModelStore } from './ModelStore';
import { NewProjectFormStore } from './NewProjectFormStore';
import { ProjectsListStore } from './ProjectsListStore';
import { ProjectStore } from './ProjectStore';
import { UIStore } from './UIStore';
import { ViewerStore } from './ViewerStore';
import { WorkspaceStore } from './WorkspaceStore';

export class RootStore {
  readonly ui = new UIStore();
  readonly history = new HistoryStore();
  readonly projects = new ProjectsListStore();
  readonly newProject = new NewProjectFormStore(this);
  readonly project = new ProjectStore(this);
  readonly model = new ModelStore();
  readonly workspace = new WorkspaceStore(this);
  readonly calibration = new CalibrationStore(this);
  readonly measurements = new MeasurementStore(this);
  readonly viewer = new ViewerStore(this);
}
