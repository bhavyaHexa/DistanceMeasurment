import { makeAutoObservable, observableRef } from 'mobx';
import * as THREE from 'three';

export class ModelStore {
  fileName: string | null = null;
  objectUrl: string | null = null;
  isLoaded = false;
  boundingBox: THREE.Box3 | null = null;
  boundingSphereRadius = 1;

  constructor() {
    makeAutoObservable(this, {
      boundingBox: observableRef,
    });
  }

  setFile(file: File) {
    this.clear();
    this.fileName = file.name;
    this.objectUrl = URL.createObjectURL(file);
  }

  setLoaded(box: THREE.Box3) {
    this.boundingBox = box;
    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);
    this.boundingSphereRadius = sphere.radius || 1;
    this.isLoaded = true;
  }

  clear() {
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    this.objectUrl = null;
    this.fileName = null;
    this.isLoaded = false;
    this.boundingBox = null;
    this.boundingSphereRadius = 1;
  }
}
