import { useGLTF } from '@react-three/drei';
import { useModelPointer } from './hooks/useModelPointer';
import { useModelSetup } from './hooks/useModelSetup';

export function ModelViewer({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  useModelSetup(scene);
  const pointer = useModelPointer();

  return <primitive object={scene} {...pointer} />;
}
