import { makeAutoObservable, observableRef } from 'mobx';
import * as THREE from 'three';

export class ModelStore {
  // --- Old fields (kept for compatibility) ---
  fileName: string | null = null;
  objectUrl: string | null = null;
  boundingBox: THREE.Box3 | null = null;
  boundingSphereRadius = 1;
  scene: THREE.Object3D | null = null;
  _oldIsLoaded = false;

  // --- New fields (Layer 1) ---
  file: { name: string; sizeBytes: number; url: string } | null = null;
  loadProgress: number | null = null;
  error: string | null = null;
  _isLoaded = false;

  constructor() {
    makeAutoObservable(this, {
      boundingBox: observableRef,
      scene: false,
    });
  }

  // --- New methods ---
  get isLoaded(): boolean {
    return this._isLoaded;
  }

  setFile(file: File) {
    this.reset();
    const url = URL.createObjectURL(file);
    this.file = { name: file.name, sizeBytes: file.size, url };
    this.error = null;
    this.loadProgress = 0;
    
    // Compatibility updates
    this.fileName = file.name;
    this.objectUrl = url;
  }

  setLoaded(box?: THREE.Box3) {
    this._isLoaded = true;
    this.loadProgress = null;
    
    // Compatibility
    this._oldIsLoaded = true;
    if (box) {
      this.boundingBox = box;
      const sphere = new THREE.Sphere();
      box.getBoundingSphere(sphere);
      this.boundingSphereRadius = sphere.radius || 1;
    }
  }

  setError(msg: string) {
    this.error = msg;
    this.loadProgress = null;
  }

  setProgress(n: number | null) {
    this.loadProgress = n;
  }

  reset() {
    if (this.file) URL.revokeObjectURL(this.file.url);
    this.file = null;
    this.loadProgress = null;
    this.error = null;
    this._isLoaded = false;

    // Compatibility
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    this.fileName = null;
    this.objectUrl = null;
    this._oldIsLoaded = false;
    this.boundingBox = null;
    this.boundingSphereRadius = 1;
  }

  // --- Old methods (kept for compatibility) ---
  setScene(scene: THREE.Object3D | null) {
    this.scene = scene;
  }

  clear() {
    this.reset();
  }
}
