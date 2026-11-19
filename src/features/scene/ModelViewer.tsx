import { observer } from 'mobx-react-lite';
import { useGLTF } from '@react-three/drei';
import { useStores } from '@/hooks/useStores';
import { useModelPointer } from './hooks/useModelPointer';
import { useModelSetup } from './hooks/useModelSetup';

export const ModelViewer = observer(function ModelViewer({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const { viewer } = useStores();
  useModelSetup(scene, viewer.showTexture);
  const pointer = useModelPointer();

  return <primitive object={scene} {...pointer} />;
});
