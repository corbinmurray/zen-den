"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Atmosphere, Garden, GardenItem } from "@/lib/types";
import { generateGardenId } from "@/lib/utils";
import { useZenGardenStore } from "@/providers/zen-garden-store-provider";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Canvas } from "./canvas";
import { TabbedPanel } from "./tabbed-panel";

export function GardenCreator() {
	// Get zen garden store for saving/loading gardens
	const { gardens, add: addGarden, update: updateGarden } = useZenGardenStore((state) => state);

	// State that was previously in the store
	const [gardenItems, setGardenItems] = useState<GardenItem[]>([]);
	const [gardenName, setGardenName] = useState<string>("My Zen Garden");
	const [selectedGardenId, setSelectedGardenId] = useState<string | null>(null);
	const [atmosphere, setAtmosphere] = useState<Atmosphere>({
		timeOfDay: "day",
		weather: "clear",
	});
	const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);
	const [shareAfterSave, setShareAfterSave] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const canvasRef = useRef<HTMLDivElement>(null);

	// Add garden item handler
	const addGardenItem = useCallback((item: GardenItem) => {
		setGardenItems((prev) => [...prev, item]);
	}, []);

	// Clear garden items handler
	const clearGardenItems = useCallback(() => {
		setGardenItems([]);
	}, []);

	// Load garden handler
	const loadGarden = useCallback((garden: Garden) => {
		if (!garden) return;

		setSelectedGardenId(garden.id || null);
		setGardenName(garden.name || "My Zen Garden");
		setGardenItems(garden.items || []);
		if (garden.atmosphere) {
			setAtmosphere(garden.atmosphere);
		}
	}, []);

	// Fetch garden from API
	const fetchGardenFromApi = useCallback(
		async (gardenId: string) => {
			setIsLoading(true);
			try {
				// First check if a garden with this ID already exists in our store
				const existingGarden = gardens.find((g: Garden) => g.id === gardenId);

				if (existingGarden) {
					// We already have this garden, just load it
					loadGarden(existingGarden);
					setIsLoading(false);
					return;
				}

				const response = await fetch(`/api/share/${gardenId}`);

				if (!response.ok) {
					throw new Error("Garden not found");
				}

				const data = await response.json();

				if (!data.garden) {
					throw new Error("Invalid garden data");
				}

				const garden = data.garden;

				// Add the garden to the store only if it doesn't already exist
				if (!gardens.some((g: Garden) => g.id === garden.id)) {
					addGarden(garden);
				}

				// Load garden data into state
				loadGarden({
					id: gardenId,
					name: garden.name || "My Zen Garden",
					items: garden.items || [],
					atmosphere: garden.atmosphere,
					lastModifiedAt: garden.lastModifiedAt || Date.now(),
				});

				// Only show toast for gardens loaded from shared links that weren't previously in the store
				if (!existingGarden) {
					toast.success("Garden loaded", {
						description: `"${garden.name || "Garden"}" has been loaded from shared link.`,
					});
				}
			} catch (error) {
				console.error("Error fetching garden from API:", error);
				toast.error("Garden not found", {
					description: "The garden you're trying to view could not be found.",
				});
			} finally {
				setIsLoading(false);
			}
		},
		[addGarden, loadGarden, gardens]
	);

	// Get canvas size when component mounts
	useEffect(() => {
		const updateCanvasSize = () => {
			// We're not using the canvas size anymore, but keeping the resize observation
			// for potential future use
			if (canvasRef.current) {
				canvasRef.current.getBoundingClientRect();
			}
		};

		// Initial measurement
		updateCanvasSize();

		// Throttled resize handler to improve performance
		let resizeTimer: ReturnType<typeof setTimeout>;
		const throttledResize = () => {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(updateCanvasSize, 100);
		};

		window.addEventListener("resize", throttledResize);
		return () => {
			window.removeEventListener("resize", throttledResize);
			clearTimeout(resizeTimer);
		};
	}, []);

	// Load garden from URL parameters
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const gardenId = urlParams.get("id");

		if (gardenId) {
			try {
				// First check if garden exists in our store
				const garden = gardens?.find((g: Garden) => g.id === gardenId);

				if (garden) {
					// Load garden data from store - no need for API call or toast notification
					loadGarden(garden);
				} else {
					// Only if not found in store, try to fetch from API
					fetchGardenFromApi(gardenId);
				}
			} catch (error) {
				console.error("Error loading garden from URL:", error);
				toast.error("Failed to load garden", {
					description: "There was an error loading the garden data.",
				});
			}
		}
	}, [gardens, loadGarden, fetchGardenFromApi]);

	// Handle saving the garden
	const handleSaveGarden = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();

			try {
				// Create a unique ID for the garden if it doesn't have one
				const gardenId = selectedGardenId || generateGardenId();

				// Create garden object
				const garden: Garden = {
					id: gardenId,
					name: gardenName,
					items: gardenItems,
					atmosphere: atmosphere,
					lastModifiedAt: Date.now(),
				};

				// Check if garden with this ID already exists
				const existingGarden = gardens.find((g: Garden) => g.id === gardenId);

				if (existingGarden) {
					// Update existing garden
					updateGarden(garden);
					toast.success("Garden updated", {
						description: `"${gardenName}" has been updated successfully.`,
					});
				} else {
					// Add new garden
					addGarden(garden);
					toast.success("Garden saved", {
						description: `"${gardenName}" has been saved successfully.`,
					});
				}

				// Update selected garden ID
				setSelectedGardenId(gardenId);

				// Close the dialog
				setSaveDialogOpen(false);

				// Handle share after save if needed
				if (shareAfterSave) {
					setShareAfterSave(false);
				}
			} catch (error) {
				console.error("Error saving garden:", error);
				toast.error("Save failed", {
					description: "Failed to save your garden. Please try again.",
				});
			}
		},
		[selectedGardenId, gardenName, gardenItems, atmosphere, gardens, updateGarden, addGarden, shareAfterSave]
	);

	// Add the onElementRemove function
	const handleElementRemove = useCallback((id: string) => {
		setGardenItems((prev) => prev.filter((item) => item.id !== id));
	}, []);

	// Add an element update handler
	const handleElementUpdate = useCallback((updatedElement: GardenItem) => {
		setGardenItems((prev) => {
			// Check if the element already exists in our array
			const elementExists = prev.some((item) => item.id === updatedElement.id);

			if (elementExists) {
				// Update existing element
				return prev.map((item) => (item.id === updatedElement.id ? updatedElement : item));
			} else {
				// Add as a new element (useful for paste operations)
				return [...prev, updatedElement];
			}
		});
	}, []);

	return (
		<div className="flex flex-col space-y-4">
			{isLoading ? (
				<div className="flex items-center justify-center h-[70vh]">
					<div className="text-center">
						<div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
						<p className="text-muted-foreground">Loading garden...</p>
					</div>
				</div>
			) : (
				<div className="flex flex-col md:flex-row gap-4">
					{/* Left panel with tabbed interface */}
					<div className="w-full md:w-96 h-[60vh] md:h-[70vh]">
						<TabbedPanel
							atmosphere={atmosphere}
							selectedGardenId={selectedGardenId}
							gardenName={gardenName}
							gardenItems={gardenItems}
							setAtmosphere={setAtmosphere}
							addGardenItem={addGardenItem}
							clearGardenItems={clearGardenItems}
							setSaveDialogOpen={setSaveDialogOpen}
							setShareAfterSave={setShareAfterSave}
						/>
					</div>

					{/* Right side canvas */}
					<div className="flex-1">
						<Canvas
							ref={canvasRef}
							elements={gardenItems}
							atmosphere={atmosphere}
							onElementRemove={handleElementRemove}
							onElementUpdate={handleElementUpdate}
						/>
					</div>
				</div>
			)}

			{/* Save Garden Dialog */}
			<Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Save Your Zen Garden</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSaveGarden} className="space-y-6">
						<div className="flex flex-col justify-start items-start gap-2">
							<Label htmlFor="garden-name" className="text-right">
								Name
							</Label>
							<Input
								id="garden-name"
								value={gardenName}
								onChange={(e) => setGardenName(e.target.value)}
								className="col-span-4"
								placeholder="Enter garden name"
								autoFocus
							/>
						</div>

						<div className="flex justify-end items-center gap-3">
							<Button type="button" variant="outline" onClick={() => setSaveDialogOpen(false)}>
								Cancel
							</Button>
							<Button type="submit">Save Garden</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
