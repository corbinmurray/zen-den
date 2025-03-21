import { Garden } from "@/lib/types";
import { persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";

export type ZenGardenState = {
	gardens: Garden[];
};

export type ZenGardenActions = {
	add: (garden: Garden) => void;
	remove: (id: string) => void;
};

export type ZenGardenStore = ZenGardenState & ZenGardenActions;

export const defaultInitState: ZenGardenState = {
	gardens: [],
};

export const createZenGardenStore = (initState: ZenGardenState = defaultInitState) => {
	return createStore<ZenGardenStore>()(
		persist(
			(set) => ({
				...initState,
				add: (garden) => set((state) => ({ gardens: [...state.gardens, garden] })),
				remove: (id) => set((state) => ({ gardens: state.gardens?.filter((x) => x.id !== id) })),
			}),
			{ name: "zen-gardens" }
		)
	);
};
