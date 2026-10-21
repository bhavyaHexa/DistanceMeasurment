import { makeAutoObservable } from 'mobx';
import type * as THREE from 'three';

/** The converted 3D model shown in the viewer. */
export class ModelStore {
  url: string | null = null;
  isLoaded = false;
  /** 0–100 while the GLB downloads, otherwise null. */
  loadProgress: number | null = null;
  error: string | null = null;
  boundingRadius = 1;
  /** The loaded scene graph, kept for raycasting. Not observable. */
  scene: THREE.Object3D | null = null;

  constructor() {
    makeAutoObservable(this, { scene: false }, { autoBind: true });
  }

  /** Ground grid sized to the model. */
  get grid(): { size: number; divisions: number } {
    return this.isLoaded
      ? { size: Math.max(10, Math.ceil(this.boundingRadius * 5)), divisions: 50 }
      : { size: 10, divisions: 10 };
  }

  load(url: string) {
    this.reset();
    this.url = url;
    this.loadProgress = 0;
  }

  setProgress(percent: number) {
    if (!this.isLoaded) this.loadProgress = percent;
  }

  setLoaded(scene: THREE.Object3D, boundingRadius: number) {
    this.scene = scene;
    this.isLoaded = true;
    this.loadProgress = null;
    this.boundingRadius = boundingRadius || 1;
  }

  setError(message: string) {
    this.error = message;
    this.loadProgress = null;
  }

  reset() {
    this.url = null;
    this.isLoaded = false;
    this.loadProgress = null;
    this.error = null;
    this.boundingRadius = 1;
    this.scene = null;
  }
}
