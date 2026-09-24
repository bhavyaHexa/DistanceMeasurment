import { createContext, useContext } from 'react';
import { rootStore, RootStore } from './RootStore';

const StoreContext = createContext<RootStore>(rootStore);
export const useStores = () => useContext(StoreContext);
export const StoreProvider = StoreContext.Provider;
