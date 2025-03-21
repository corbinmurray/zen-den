"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Atmosphere, GardenItem } from "@/lib/types";
import { useZenGardenStore } from "@/providers/zen-garden-store-provider";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { v6 as uuidV6 } from "uuid";
import { Canvas } from "./canvas";
import { TabbedPanel } from "./tabbed-panel";

const defaultAtmosphere: Atmosphere = {
	timeOfDay: "day",
	weather: "clear",
};

export function GardenCreator() {
	const [gardenItems, setGardenItems] = useState<GardenItem[]>([]);
	const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
	const [showOutlines, setShowOutlines] = useState(false);
	const [atmosphere, setAtmosphere] = useState<Atmosphere>(defaultAtmosphere);
	const [selectedGardenId, setSelectedGardenId] = useState<string | null>(null);
	const [saveDialogOpen, setSaveDialogOpen] = useState(false);
	const [gardenName, setGardenName] = useState("My Zen Garden");
	const [shareAfterSave, setShareAfterSave] = useState(false);
	const { gardens, add: addGarden, remove: removeGarden } = useZenGardenStore((state) => state);

	const canvasRef = useRef<HTMLDivElement>(null);

	// Cache the most recent elements to avoid unnecessary re-renders
	const itemsRef = useRef(gardenItems);
	useEffect(() => {
		itemsRef.current = gardenItems;
	}, [gardenItems]);

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
	}, []);

	// Load garden from URL parameters
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const gardenId = urlParams.get("id");

		if (gardenId) {
			try {
				const garden = gardens.find((g) => g.id === gardenId);

				if (garden) {
					// Load garden data
					setGardenItems(garden.items || []);
					setAtmosphere(garden.atmosphere || defaultAtmosphere);
					setSelectedGardenId(gardenId);
					setGardenName(garden.name || "My Zen Garden");
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
	}, [gardens]);

	// Use callback to prevent unnecessary recreations of this function
	const handleAddElement = useCallback(
		(gardenItem: GardenItem) => {
			// Calculate center of visible canvas
			const centerX = Math.max(0, canvasSize.width / 2 - 50); // 50 is half of baseSize
			const centerY = Math.max(0, canvasSize.height / 2 - 50);

			// Create random offset around the center (±20% of canvas size)
			const offsetRange = {
				x: Math.min(100, canvasSize.width * 0.2),
				y: Math.min(100, canvasSize.height * 0.2),
			};

			// Generate random position with offset from center
			const randomX = centerX + (Math.random() * offsetRange.x * 2 - offsetRange.x);
			const randomY = centerY + (Math.random() * offsetRange.y * 2 - offsetRange.y);

			// Keep position within canvas bounds
			const boundedX = Math.max(10, Math.min(canvasSize.width - 110, randomX));
			const boundedY = Math.max(10, Math.min(canvasSize.height - 110, randomY));

			// Create a copy with a unique ID
			const newItem: GardenItem = {
				...elementOption,
				id: `${elementOption.type}-${Date.now()}`,
				position: { x: boundedX, y: boundedY },
				rotation: 0,
				scale: 1,
			};

			setGardenItems((prev) => [...prev, newItem]);
		},
		[canvasSize.width, canvasSize.height]
	);

	// Optimize update handler with useCallback
	const handleElementUpdate = useCallback((updatedElement: GardenItem) => {
		setElements((prev) => prev.map((el) => (el.id === updatedElement.id ? updatedElement : el)));
	}, []);

	// Optimize removal handler with useCallback
	const handleRemoveElement = useCallback((id: string) => {
		setElements((prev) => prev.filter((el) => el.id !== id));
	}, []);

	// Open the save dialog (or directly save if already saved)
	const handleOpenSaveDialog = () => {
		// If garden already has an ID, just update it without prompting for a name
		if (selectedGardenId) {
			// Direct save/update without opening dialog
			saveGardenWithName(false);
		} else {
			// Open dialog for new gardens to get a name
			setSaveDialogOpen(true);
		}
	};

	// Save garden with the provided name
	const saveGardenWithName = (closeDialog = true) => {
		try {
			// Create a unique ID for the garden if it doesn't have one
			const gardenId = selectedGardenId || uuidV6();

			// Create garden object
			const garden: GardenData = {
				id: gardenId,
				gardenName: gardenName,
				elements,
				background,
				atmosphereSettings,
				timestamp: Date.now(),
			};

			// Get existing gardens
			const savedGardensJSON = localStorage.getItem("zenGardens");
			const savedGardens = savedGardensJSON ? JSON.parse(savedGardensJSON) : [];

			// Check if garden with this ID already exists
			const existingGardenIndex = savedGardens.findIndex((g: any) => g.id === gardenId);

			if (existingGardenIndex >= 0) {
				// Update existing garden
				savedGardens[existingGardenIndex] = garden;
				toast.success("Garden updated", {
					description: `"${gardenName}" has been updated successfully.`,
				});
			} else {
				// Add new garden
				savedGardens.push(garden);
				toast.success("Garden saved", {
					description: `"${gardenName}" has been saved successfully.`,
				});
			}

			// Save to local storage
			localStorage.setItem("zenGardens", JSON.stringify(savedGardens));

			// Update selected garden ID
			setSelectedGardenId(gardenId);

			// Close the dialog if needed
			if (closeDialog) {
				setSaveDialogOpen(false);
			}

			// Check if we should share after saving
			if (shareAfterSave) {
				setShareAfterSave(false);
				// Use setTimeout to ensure the state is updated before sharing
				setTimeout(() => shareGardenLink(), 100);
			}
		} catch (error) {
			console.error("Error saving garden:", error);
			toast.error("Save failed", {
				description: "Failed to save your garden. Please try again.",
			});
		}
	};

	// Handle sharing garden
	const handleShare = () => {
		// If garden is not saved yet, open the save dialog first
		if (!selectedGardenId) {
			setShareAfterSave(true);
			setSaveDialogOpen(true);
			toast.info("Name your garden", {
				description: "Please name your garden before sharing it.",
			});
			return;
		}

		// Generate and share the link for an already saved garden
		shareGardenLink();
	};

	// Helper function to generate and share garden link
	const shareGardenLink = () => {
		try {
			// Create shareable link
			const shareableLink = `${window.location.origin}/view?id=${selectedGardenId}`;

			// Copy to clipboard
			navigator.clipboard
				.writeText(shareableLink)
				.then(() => {
					toast.success("Link copied!", {
						description: `Share this link with others to view "${gardenName}".`,
					});
				})
				.catch((err) => {
					console.error("Failed to copy link:", err);
					toast.info("Share link", {
						description: shareableLink,
					});
				});
		} catch (error) {
			console.error("Error sharing garden:", error);
			toast.error("Share failed", {
				description: "Failed to create a shareable link. Please try again.",
			});
		}
	};

	// Handle clearing the canvas
	const handleClear = () => {
		toast.warning("Clear garden?", {
			description: "Are you sure you want to clear your garden? This cannot be undone.",
			action: {
				label: "Yes, clear it",
				onClick: () => {
					setElements([]);
					toast.success("Garden cleared", {
						description: "Your zen garden has been reset.",
					});
				},
			},
			cancel: {
				label: "Cancel",
				onClick: () => {},
			},
		});
	};

	// Toggle showing element outlines
	const handleShowOutlinesChange = (show: boolean) => {
		setShowOutlines(show);
	};

	// Update atmosphere settings
	const handleAtmosphereChange = (settings: AtmosphereSettings) => {
		setAtmosphereSettings(settings);
	};

	return (
		<div className="flex flex-col space-y-4">
			<div className="flex flex-col md:flex-row gap-4">
				{/* Left panel with tabbed interface */}
				<div className="w-full md:w-96 h-[60vh] md:h-[70vh]">
					<TabbedPanel
						onAddElement={handleAddElement}
						showOutlines={showOutlines}
						onShowOutlinesChange={handleShowOutlinesChange}
						atmosphereSettings={atmosphereSettings}
						onAtmosphereChange={handleAtmosphereChange}
						onSave={handleOpenSaveDialog}
						onShare={handleShare}
						onClear={handleClear}
					/>
				</div>

				{/* Right side canvas */}
				<div className="flex-1">
					<Canvas
						ref={canvasRef}
						elements={gardenItems}
						onElementUpdate={handleElementUpdate}
						onElementRemove={handleRemoveElement}
						showOutlines={showOutlines}
						atmosphereSettings={atmosphereSettings}
					/>
				</div>
			</div>

			{/* Save Garden Dialog */}
			<Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Save Your Zen Garden</DialogTitle>
					</DialogHeader>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							saveGardenWithName(true);
						}}
						className="space-y-6">
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
