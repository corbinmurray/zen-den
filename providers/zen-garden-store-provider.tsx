"use client";

import { type ZenGardenStore, createZenGardenStore } from "@/stores/zen-garden-store";
import { type ReactNode, createContext, useContext, useRef } from "react";
import { useStore } from "zustand";

export type ZenGardenStoreApi = ReturnType<typeof createZenGardenStore>;
export const ZenGardenStoreContext = createContext<ZenGardenStoreApi | undefined>(undefined);
export interface ZenGardenStoreProviderProps {
	children: ReactNode;
}

export const ZenGardenStoreProvider = ({ children }: ZenGardenStoreProviderProps) => {
	const storeRef = useRef<ZenGardenStoreApi | null>(null);
	if (storeRef.current === null) {
		storeRef.current = createZenGardenStore();
	}

	return <ZenGardenStoreContext.Provider value={storeRef.current}>{children}</ZenGardenStoreContext.Provider>;
};

export const useZenGardenStore = <T,>(selector: (store: ZenGardenStore) => T): T => {
	const zenGardenStoreContext = useContext(ZenGardenStoreContext);

	if (!zenGardenStoreContext) {
		throw new Error(`useZenGardenStore must be used within ZenGardenStoreProvider`);
	}

	return useStore(zenGardenStoreContext, selector);
};
