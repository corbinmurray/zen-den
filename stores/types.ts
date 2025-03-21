import { Atmosphere, Garden, GardenItem } from "@/lib/types";

// Garden Editor Store Types
export interface GardenEditorState {
  // Garden items on the canvas
  gardenItems: GardenItem[];
  
  // Canvas size info
  canvasSize: { width: number; height: number };
  
  // UI states
  showOutlines: boolean;
  
  // Garden information
  atmosphere: Atmosphere;
  selectedGardenId: string | null;
  gardenName: string;
  
  // Dialog state
  saveDialogOpen: boolean;
  shareAfterSave: boolean;
}

export interface GardenEditorActions {
  // Garden item actions
  addGardenItem: (item: Omit<GardenItem, "id" | "position" | "rotation" | "scale">) => void;
  updateGardenItem: (updatedItem: GardenItem) => void;
  removeGardenItem: (id: string) => void;
  clearGardenItems: () => void;
  
  // Canvas actions
  setCanvasSize: (size: { width: number; height: number }) => void;
  
  // UI actions
  toggleOutlines: (show?: boolean) => void;
  
  // Garden information actions
  setAtmosphere: (atmosphere: Atmosphere) => void;
  setSelectedGardenId: (id: string | null) => void;
  setGardenName: (name: string) => void;
  
  // Dialog actions
  setSaveDialogOpen: (open: boolean) => void;
  setShareAfterSave: (share: boolean) => void;
  
  // Load garden data
  loadGarden: (garden: { 
    id: string; 
    name: string; 
    items: GardenItem[]; 
    atmosphere?: Atmosphere 
  }) => void;
}

// Zen Garden Store Types
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