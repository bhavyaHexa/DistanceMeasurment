# Distance Measure

Measure real-world distances on photogrammetry models. Upload a video, set the scale from two
points with a known vertical distance, then place measurements on the 3D model and save them.

## Getting started

```bash
npm install --legacy-peer-deps   # npm 10 trips over an optional peer dependency without the flag
cp .env.example .env.local       # point VITE_API_BASE_URL at the backend
npm run dev
```

| Script          | What it does                     |
| --------------- | -------------------------------- |
| `npm run dev`   | Start the dev server             |
| `npm run build` | Type-check and build for release |
| `npm run lint`  | Lint with oxlint                 |

## How it works

1. **Projects** (`/projects`) lists saved projects and active video processing runs. **New project**
   asks for a name; upload its video from the workspace.
2. **Workspace** (`/projects/:runId`) walks through three steps:
   - **Upload** — upload an MP4, MOV, AVI, WMV, MPG or MPEG video (up to 300 MB). The workspace shows
     upload progress, then the backend's processing stage and percentage while it creates the 3D model.
     Processing can take several minutes; progress resumes when the project is reopened.
   - **Set scale** — click points A and B and enter their real vertical distance.
   - **Measure** — add measurements, choose straight-line or ΔX/ΔY/ΔZ, export CSV, and save.

## Project structure

```
src/
  app/          App shell, router and route paths
  components/   Shared components; ui/ holds the building blocks (Button, Dialog, Menu, …)
  features/     One folder per screen area
    projects/     Projects page and New project dialog
    workspace/    Workspace page, top bar, step indicator, upload panel, viewport controls
    calibration/  Set scale panel
    measurements/ Measurement list panel
    scene/        three.js scene: canvas, model, markers, lines, labels (+ hooks/)
  hooks/        Shared React hooks (stores access, shortcuts, file drop, unsaved-changes guard, …)
  services/     HTTP client and the runs API
  stores/       MobX stores — all app state and behaviour lives here
  types/        Shared TypeScript types
  utils/        Pure helpers (units, geometry, CSV, ZIP checks, snapping, formatting, …)
  styles/       Tailwind entry and theme
```

Conventions:

- Components only render. They read MobX stores via `useStores()` and call store actions.
- Logic that touches the DOM or three.js events lives in hooks; pure calculations live in `utils/`.
- Styling is Tailwind; design tokens are in `src/styles/index.css`.
