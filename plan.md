# Implementation Plan: iTwin Run History & ZIP Upload Integration

This document outlines the step-by-step implementation plan for integrating the iTwin Run History API into the **DistanceMeasurment** application.

---

## 1. Requirements & User Flow Overview

1. **ZIP Upload & MP4 Filtering**:
   - The user drops or selects a `.zip` archive containing photogrammetry/3D assets (e.g., `.obj`, `.mtl`, `.jpg`, and an optional `.mp4` video).
   - If an `.mp4` is present in the ZIP, the frontend will filter it out (using `JSZip`), leaving exactly one `.obj`, one `.mtl`, and one `.jpg`/`.jpeg`.
   - The filtered files are repackaged on-the-fly into a clean ZIP Blob without recompressing (`compression: "STORE"` for speed) before uploading to the backend.
   - Support both direct ZIP uploads and individual file selection if needed.

2. **Project Entry Flow & Run Lifecycle**:
   - **Initial Entry Screen**:
     - When opening the app or starting fresh, the user is presented with two primary actions:
       1. **"New Project"** button
       2. **"Existing Projects" (History)** button
     - The user cannot simply drop a ZIP blindly into nowhere without a project context.
   - **"New Project" Flow**:
     - Clicking **"New Project"** prompts for a project name (via modal/dialog).
     - Submitting creates the run: `POST /api/v1/runs` with `{ project_name }` and stores `run_id` in app state.
     - Once the project is created, the user is navigated to the **Upload / Load step** where the ZIP upload dropzone is active.
   - **ZIP Upload & Conversion**:
     - User drops or selects the `.zip` archive for this project.
     - Frontend filters out `.mp4`, leaving `.obj`, `.mtl`, `.jpg`.
     - Convert model: `POST /api/v1/runs/{run_id}/convert` with upload progress bar (using `axios`) and "Converting on server..." processing state.
     - On completion, `glb_url` is loaded directly into the Three.js viewport (`ModelViewer`), advancing to Calibrate/Measure steps.
   - **Save Flow**:
     - User calibrates scale and adds measurements.
     - Clicking **"Save"** calls `POST /api/v1/runs/{run_id}/save` sending the current state as a JSON file.
   - **"Existing Projects" (History) Flow**:
     - Clicking **"Existing Projects"** (or History tab in the navbar) displays the list of saved runs (`GET /api/v1/runs`).
     - Selecting an existing project calls `GET /api/v1/runs/{run_id}` to obtain fresh `glb_url` and `json_url`, restores the model and measurements, and opens the 3D Viewer directly.

---

## 2. Dependencies to Install

- `jszip`: For reading the uploaded zip in the browser, stripping out any `.mp4` files, and re-packing the required `.obj`, `.mtl`, and `.jpg` files.
- `axios`: For reliable upload progress tracking (`onUploadProgress`) during large file uploads to `POST /runs/{run_id}/convert`.

```bash
npm install jszip axios
npm install --save-dev @types/jszip
```

---

## 3. Architecture & File Breakdown

### A. API Layer (`src/services/api.ts`)
Create a typed API client implementing:
- `BASE_URL`: Configurable (defaults to `http://localhost:8000/api/v1`, with optional `VITE_API_BASE_URL` env var).
- `createRun(projectName: string)`: `POST /runs`
- `convertWithProgress(runId: string, zipBlob: Blob, onProgress: (pct: number) => void)`: `POST /runs/{runId}/convert`
- `saveRun(runId: string, metadata: object)`: `POST /runs/{runId}/save`
- `listRuns(params: { status?: string, project_name?: string, limit?: number, offset?: number })`: `GET /runs`
- `getRun(runId: string)`: `GET /runs/{runId}`
- Error handling helper extracting `detail` messages (strings or validation arrays).

### B. ZIP Processing Utility (`src/utils/zipUtils.ts`)
Create a utility function to handle ZIP inspections and filtering:
- `filterAndPrepareZip(file: File): Promise<Blob>`:
  1. Load ZIP with `JSZip.loadAsync(file)`.
  2. Inspect contents, ignore `__MACOSX/`, `.DS_Store`, and explicitly **filter out / ignore `.mp4`** (or other video files).
  3. Validate that there is **exactly one** `.obj`, **one** `.mtl`, and **one** `.jpg`/`.jpeg`.
     - If missing or invalid, throw descriptive user-friendly errors.
  4. Create a clean `JSZip` instance, add the 3 files, and generate a blob with `{ type: 'blob', compression: 'STORE' }`.

### C. State Management Updates
1. **`src/stores/RunStore.ts` (New)**:
   - Holds active run state: `runId`, `projectName`, `status`, `uploadProgress`, `isProcessing`, `isSaving`, `error`.
   - Actions:
     - `startProject(name: string)`: creates run via API.
     - `processAndUploadZip(file: File)`: handles ZIP filtering, calls convert with progress, updates `model.setGlbUrl(glb_url)`.
     - `saveCurrentRun()`: bundles `measurement.toJSON()` and `ui.toJSON()`, calls `api.saveRun`.
     - `loadRun(runId: string)`: fetches run detail, loads GLB url, downloads & hydrates `json_url` into `measurement` and `ui` stores.
     - `listRuns(search?: string, page?: number)`: manages paginated history list.
2. **`src/stores/ModelStore.ts`**:
   - Add support for loading remote GLB URLs (presigned S3 URLs) in addition to local `blob:` URLs, and storing current project info.
3. **`src/stores/UIStore.ts`**:
   - Add active view routing: `activeView: 'viewer' | 'history'`.
   - Methods: `goToViewer()`, `goToHistory()`.
4. **`src/stores/MeasurementStore.ts`**:
   - Add `serialize()` and `hydrate(data: any)` methods to save and reload calibration and measurement lines/points.

### D. UI Components & Updates
1. **`src/components/UI/StartScreen.tsx` (New - Entry Hub)**:
   - Displayed when no project is actively loaded.
   - Presents two primary actions:
     - **"New Project"** button (opens the `NewProjectModal`).
     - **"Existing Projects" (History)** button (navigates to `HistoryView`).
   - Clean, modern landing interface with recent project shortcuts if available.
2. **`src/components/UI/NewProjectModal.tsx` (New)**:
   - Dialog prompting the user to name their project (e.g., "Bridge Pier A").
   - Submits `api.createRun(projectName)` to obtain a `run_id`.
   - On success, sets active run in `RunStore` and transitions into the 3D Viewer Load state where the ZIP dropzone is ready.
3. **`src/components/History/HistoryView.tsx` (New)**:
   - Search input for `project_name`.
   - Grid or table listing saved runs (project name, date formatted with `new Date()`, status).
   - "Open in Viewer" button for each run:
     - Shows loader while fetching `getRun(runId)`, downloads metadata, sets up viewer, switches to viewer view.
   - "Back to Projects / Home" button.
   - Pagination controls (`Previous`, `Next`, total count).
4. **`src/components/UI/Toolbar.tsx`**:
   - Navigation buttons:
     - **"Projects / Home"** or **"New Project"** button to start over or return.
     - **"History"** button to view saved projects anytime.
     - Step tabs (Load, Calibrate, Measure) visible when in an active project session.
   - Active project name chip (e.g. "Project: Bridge Pier A").
   - "Save Run" button (visible when in Calibrate/Measure with active `runId`):
     - Indicates saved status (`Saved ✓`, `Saving...`, `Save to Cloud`).
5. **`src/components/UI/DropzoneOverlay.tsx`**:
   - Activated after a project has been created via **New Project**.
   - Accepts `.zip` archive containing `.obj`, `.mtl`, `.jpg`, with `.mp4` filtered out.
   - Upload & Processing progress overlay showing:
     - 0-100% Uploading...
     - "Converting model to GLB on server..." spinner.
6. **`src/App.tsx`**:
   - Top-level routing state:
     - If `ui.activeView === 'start'`: render `StartScreen`.
     - If `ui.activeView === 'history'`: render `HistoryView`.
     - If `ui.activeView === 'viewer'`: render `SceneCanvas` and sidebars.

---

## 4. Step-by-Step Implementation Phases

| Phase | Description | Deliverables |
|---|---|---|
| **Phase 1** | Dependencies & API Client | Install `jszip`, `axios`. Create `src/services/api.ts` with error handling and types. |
| **Phase 2** | ZIP Filtering & Repackaging | Implement `src/utils/zipUtils.ts` to inspect ZIP, discard `.mp4`, validate OBJ/MTL/JPG, repackage. |
| **Phase 3** | Serialization in MeasurementStore | Add `exportData()` and `importData()` in `MeasurementStore` for calibration and measurement points. |
| **Phase 4** | RunStore Implementation | Create `RunStore.ts` managing runs, project creation, convert flow with progress, save metadata, and history list. Connect into `RootStore`. |
| **Phase 5** | Entry Screen & New Project Flow | Build `StartScreen.tsx` with "New Project" and "Existing Projects" buttons, plus `NewProjectModal.tsx` to initialize `run_id`. |
| **Phase 6** | Dropzone & Upload UX | Update `DropzoneOverlay` and `Toolbar` with ZIP upload, upload progress bar, and processing spinner for the active run. |
| **Phase 7** | History View & Routing | Create `HistoryView.tsx`, hook up top-level view routing in `UIStore`, `Toolbar`, and `App.tsx`, test opening saved runs. |
| **Phase 8** | Verification & Polish | Verify complete flow: Home -> New Project -> Drop ZIP with MP4 -> 3D View -> Calibrate/Measure -> Save -> History -> Reopen. |
