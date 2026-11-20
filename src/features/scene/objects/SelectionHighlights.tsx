import { Html, Line } from '@react-three/drei';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/hooks/useStores';
import type { SceneEntity } from '@/types/selection';
import { entityKey } from '@/utils/entityMetrics';
import { FaceHighlight } from './FaceHighlight';
import { HTML_PASS_THROUGH } from './htmlPassThrough';

type Variant = 'hover' | 'selected';

const COLOR: Record<Variant, string> = { hover: '#2563eb', selected: '#f97316' };

/** The hovered preview and every selected point, edge or face, drawn on top of the model. */
export const SelectionHighlights = observer(function SelectionHighlights() {
  const { selection } = useStores();
  const preview = selection.hoverPreview;

  return (
    <group>
      {selection.selected.map((entity) => (
        <group key={entityKey(entity)}>{entityShape(entity, 'selected')}</group>
      ))}
      {preview && <group>{entityShape(preview, 'hover')}</group>}
    </group>
  );
});

function entityShape(entity: SceneEntity, variant: Variant) {
  const color = COLOR[variant];
  switch (entity.kind) {
    case 'point':
      return (
        <Html position={entity.point} center style={HTML_PASS_THROUGH} zIndexRange={[110, 0]}>
          {variant === 'hover' ? (
            <span className="block size-2.5 rounded-full border-[1.5px] border-white bg-blue-600 shadow" />
          ) : (
            <span className="block size-3 rounded-full border-[1.5px] border-white bg-orange-500 shadow" />
          )}
        </Html>
      );
    case 'edge':
      return (
        <Line
          points={entity.points}
          color={color}
          lineWidth={variant === 'hover' ? 4 : 5}
          depthTest={false}
          renderOrder={1000}
        />
      );
    case 'face':
      return <FaceHighlight corners={entity.corners} color={color} strong={variant === 'selected'} />;
  }
}
