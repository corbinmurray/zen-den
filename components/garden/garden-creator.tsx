"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Garden } from "@/lib/types";
import { useZenGardenStore } from "@/providers/zen-garden-store-provider";
import { useGardenEditorStore } from "@/stores/garden-editor-store";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Canvas } from "./canvas";
import { TabbedPanel } from "./tabbed-panel";

export function GardenCreator() {
	// Get only the necessary values and actions from garden editor store
	const {
		gardenItems,
		atmosphere,
		selectedGardenId,
		saveDialogOpen,
		gardenName,
		showOutlines,

		setCanvasSize,
		setSelectedGardenId,
		setSaveDialogOpen,
		setGardenName,
		loadGarden,
		updateGardenItem,
		removeGardenItem,
	} = useGardenEditorStore();

	// Get zen garden store for saving/loading gardens
	const { gardens, add: addGarden, update: updateGarden } = useZenGardenStore((state) => state);

	const canvasRef = useRef<HTMLDivElement>(null);

	// Get canvas size when component mounts
	useEffect(() => {
		const updateCanvasSize = () => {
			if (canvasRef.current) {
				const { width, height } = canvasRef.current.getBoundingClientRect();
				setCanvasSize({ width, height });
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
	}, [setCanvasSize]);

	// Load garden from URL parameters
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const gardenId = urlParams.get("id");

		if (gardenId && gardens) {
			try {
				const garden = gardens.find((g: Garden) => g.id === gardenId);

				if (garden) {
					// Load garden data into store
					loadGarden({
						id: gardenId,
						name: garden.name || "My Zen Garden",
						items: garden.items || [],
						atmosphere: garden.atmosphere,
					});
				} else {
					toast.error("Garden not found", {
						description: "The garden you're trying to edit could not be found.",
					});
				}
			} catch (error) {
				console.error("Error loading garden from URL:", error);
				toast.error("Failed to load garden", {
					description: "There was an error loading the garden data.",
				});
			}
		}
	}, [gardens, loadGarden]);

	// Handle saving the garden
	const handleSaveGarden = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();

			try {
				// Create a unique ID for the garden if it doesn't have one
				const gardenId = selectedGardenId || uuidv4();

				// Create garden object
				const garden: Garden = {
					id: gardenId,
					name: gardenName,
					items: gardenItems,
					atmosphere: atmosphere,
					createdAt: Date.now(),
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
			} catch (error) {
				console.error("Error saving garden:", error);
				toast.error("Save failed", {
					description: "Failed to save your garden. Please try again.",
				});
			}
		},
		[selectedGardenId, gardenName, gardenItems, atmosphere, gardens, updateGarden, addGarden, setSelectedGardenId, setSaveDialogOpen]
	);

	return (
		<div className="flex flex-col space-y-4">
			<div className="flex flex-col md:flex-row gap-4">
				{/* Left panel with tabbed interface */}
				<div className="w-full md:w-96 h-[60vh] md:h-[70vh]">
					<TabbedPanel />
				</div>

				{/* Right side canvas */}
				<div className="flex-1">
					<Canvas
						ref={canvasRef}
						elements={gardenItems}
						onElementUpdate={updateGardenItem}
						onElementRemove={removeGardenItem}
						showOutlines={showOutlines}
						atmosphere={atmosphere}
					/>
				</div>
			</div>

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
