import { useEffect } from 'react';
import { useBounds } from '@react-three/drei';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/hooks/useStores';

/** Frames the model whenever a fit is requested (on load, or the Fit button / F key). */
export const FitController = observer(function FitController() {
  const { model, viewer } = useStores();
  const bounds = useBounds();
  const { fitRequest } = viewer;

  useEffect(() => {
    if (model.isLoaded) bounds.refresh().fit();
  }, [fitRequest, model.isLoaded, bounds]);

  return null;
});
