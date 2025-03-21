import { Atmosphere, GardenItem } from "@/lib/types";
import { GardenEditorActions, GardenEditorState } from "@/stores/types";
import { create } from "zustand";

const defaultAtmosphere: Atmosphere = {
	timeOfDay: "day",
	weather: "clear",
};

export const useGardenEditorStore = create<GardenEditorState & GardenEditorActions>((set) => ({
	// Initial state
	gardenItems: [],
	canvasSize: { width: 0, height: 0 },
	showOutlines: false,
	atmosphere: defaultAtmosphere,
	selectedGardenId: null,
	gardenName: "My Zen Garden",
	saveDialogOpen: false,
	shareAfterSave: false,

	// Actions
	addGardenItem: (item) =>
		set((state) => {
			// Calculate center of visible canvas
			const centerX = Math.max(0, state.canvasSize.width / 2 - 50);
			const centerY = Math.max(0, state.canvasSize.height / 2 - 50);

			// Create random offset around the center (±20% of canvas size)
			const offsetRange = {
				x: Math.min(100, state.canvasSize.width * 0.2),
				y: Math.min(100, state.canvasSize.height * 0.2),
			};

			// Generate random position with offset from center
			const randomX = centerX + (Math.random() * offsetRange.x * 2 - offsetRange.x);
			const randomY = centerY + (Math.random() * offsetRange.y * 2 - offsetRange.y);

			// Keep position within canvas bounds
			const boundedX = Math.max(10, Math.min(state.canvasSize.width - 110, randomX));
			const boundedY = Math.max(10, Math.min(state.canvasSize.height - 110, randomY));

			// Create a new item with a unique ID
			const newItem: GardenItem = {
				...item,
				id: `${item.type}-${Date.now()}`,
				position: { x: boundedX, y: boundedY },
				rotation: 0,
				scale: 1,
			};

			return { gardenItems: [...state.gardenItems, newItem] };
		}),

	updateGardenItem: (updatedItem) =>
		set((state) => ({
			gardenItems: state.gardenItems.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
		})),

	removeGardenItem: (id) =>
		set((state) => ({
			gardenItems: state.gardenItems.filter((item) => item.id !== id),
		})),

	clearGardenItems: () => set({ gardenItems: [] }),

	setCanvasSize: (size) => set({ canvasSize: size }),

	toggleOutlines: (show) =>
		set((state) => ({
			showOutlines: show !== undefined ? show : !state.showOutlines,
		})),

	setAtmosphere: (atmosphere) => set({ atmosphere }),

	setSelectedGardenId: (id) => set({ selectedGardenId: id }),

	setGardenName: (name) => set({ gardenName: name }),

	setSaveDialogOpen: (open) => set({ saveDialogOpen: open }),

	setShareAfterSave: (share) => set({ shareAfterSave: share }),

	loadGarden: (garden) =>
		set({
			selectedGardenId: garden.id,
			gardenName: garden.name,
			gardenItems: garden.items,
			atmosphere: garden.atmosphere || defaultAtmosphere,
		}),
}));
