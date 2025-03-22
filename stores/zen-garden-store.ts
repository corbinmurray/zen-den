import { Garden } from "@/lib/types";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

export const defaultInitState: ZenGardenState = {
	gardens: [],
};

export type ZenGardenStoreApi = ReturnType<typeof createZenGardenStore>;
export interface ZenGardenState {
	gardens: Garden[];
}

export interface ZenGardenActions {
	add: (garden: Garden) => void;
	update: (garden: Garden) => void;
	remove: (id: string) => void;
	getGardenById: (id: string) => Garden | undefined;
}

export type ZenGardenStore = ZenGardenState & ZenGardenActions;

export const createZenGardenStore = (initState: ZenGardenState = defaultInitState) => {
	return createStore<ZenGardenStore>()(
		persist(
			(set, get) => ({
				...initState,
				add: (garden) => set((state) => ({ gardens: [...state.gardens, garden] })),
				update: (garden) =>
					set((state) => ({
						gardens: state.gardens.map((g) => (g.id === garden.id ? garden : g)),
					})),
				remove: (id) => set((state) => ({ gardens: state.gardens.filter((x) => x.id !== id) })),
				getGardenById: (id) => get().gardens.find((garden) => garden.id === id),
			}),
			{ name: "zen-gardens" }
		)
	);
};
