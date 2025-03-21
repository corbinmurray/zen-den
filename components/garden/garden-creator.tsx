"use client";

import { AtmosphereSettings, ElementOption, GardenElement } from "@/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Canvas } from "./canvas";
import { TabbedPanel } from "./tabbed-panel";

// Default atmosphere settings
const defaultAtmosphereSettings: AtmosphereSettings = {
	timeOfDay: "day",
	weather: "clear",
	effects: [],
	effectsIntensity: 50,
};

export function GardenCreator() {
	const [elements, setElements] = useState<GardenElement[]>([]);
	const [background, setBackground] = useState("/backgrounds/zen-garden-bg.svg");
	const [soundEnabled, setSoundEnabled] = useState(false);
	const [currentSound, setCurrentSound] = useState<string | null>(null);
	const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
	const [showOutlines, setShowOutlines] = useState(false);
	const [atmosphereSettings, setAtmosphereSettings] = useState<AtmosphereSettings>(defaultAtmosphereSettings);
	const [selectedGardenId, setSelectedGardenId] = useState<string | null>(null);

	const canvasRef = useRef<HTMLDivElement>(null);

	// Cache the most recent elements to avoid unnecessary re-renders
	const elementsRef = useRef(elements);
	useEffect(() => {
		elementsRef.current = elements;
	}, [elements]);

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

	// Load garden from URL parameters or local storage
	useEffect(() => {
		// Get URL parameters
		const urlParams = new URLSearchParams(window.location.search);
		const gardenId = urlParams.get("id");

		if (gardenId) {
			// Try to load garden from local storage
			try {
				const savedGardensJSON = localStorage.getItem("zenGardens");

				if (savedGardensJSON) {
					const savedGardens = JSON.parse(savedGardensJSON);
					const garden = savedGardens.find((g: any) => g.id === gardenId);

					if (garden) {
						// Load garden data
						setElements(garden.elements || []);
						setBackground(garden.background || "/backgrounds/zen-garden-bg.svg");
						setAtmosphereSettings(garden.atmosphereSettings || defaultAtmosphereSettings);
						setSelectedGardenId(gardenId);

						toast.success("Garden loaded", {
							description: `Editing ${garden.name || "zen garden"}`,
						});
					} else {
						toast.error("Garden not found", {
							description: "The garden you're trying to edit could not be found.",
						});
					}
				}
			} catch (error) {
				console.error("Error loading garden from URL:", error);
				toast.error("Failed to load garden", {
					description: "There was an error loading the garden data.",
				});
			}
		}
	}, []);

	// Use callback to prevent unnecessary recreations of this function
	const handleAddElement = useCallback(
		(elementOption: ElementOption) => {
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
			const newElement: GardenElement = {
				...elementOption,
				id: `${elementOption.type}-${Date.now()}`,
				position: { x: boundedX, y: boundedY },
				rotation: 0,
				scale: 1,
			};

			setElements((prev) => [...prev, newElement]);
		},
		[canvasSize.width, canvasSize.height]
	);

	// Optimize update handler with useCallback
	const handleElementUpdate = useCallback((updatedElement: GardenElement) => {
		setElements((prev) => prev.map((el) => (el.id === updatedElement.id ? updatedElement : el)));
	}, []);

	// Optimize removal handler with useCallback
	const handleRemoveElement = useCallback((id: string) => {
		setElements((prev) => prev.filter((el) => el.id !== id));
	}, []);

	// Handle saving garden
	const handleSave = () => {
		try {
			// Create a unique ID for the garden if it doesn't have one
			const gardenId = selectedGardenId || Date.now().toString();
			const gardenName = "My Zen Garden"; // Default name

			// Create garden object
			const garden = {
				id: gardenId,
				name: gardenName,
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
					description: "Your garden has been updated successfully.",
				});
			} else {
				// Add new garden
				savedGardens.push(garden);
				toast.success("Garden saved", {
					description: "Your garden has been saved successfully.",
				});
			}

			// Save to local storage
			localStorage.setItem("zenGardens", JSON.stringify(savedGardens));

			// Update selected garden ID
			setSelectedGardenId(gardenId);
		} catch (error) {
			console.error("Error saving garden:", error);
			toast.error("Save failed", {
				description: "Failed to save your garden. Please try again.",
			});
		}
	};

	// Handle sharing garden
	const handleShare = () => {
		try {
			// Check if garden is already saved
			let existingGardenId = selectedGardenId;

			// If not saved, save it now
			if (!existingGardenId) {
				// Create a unique ID for the garden based on timestamp
				existingGardenId = Date.now().toString();
				const gardenName = "My Zen Garden";

				// Save garden to local storage
				const savedGardens = JSON.parse(localStorage.getItem("zenGardens") || "[]");
				const newGarden = {
					id: existingGardenId,
					name: gardenName,
					elements,
					background,
					atmosphereSettings,
					timestamp: Date.now(),
				};

				savedGardens.push(newGarden);
				localStorage.setItem("zenGardens", JSON.stringify(savedGardens));
				setSelectedGardenId(existingGardenId);

				toast.success("Garden saved", {
					description: "Your garden has been saved before sharing.",
				});
			}

			// Create shareable link
			const shareableLink = `${window.location.origin}/view?id=${existingGardenId}`;

			// Copy to clipboard
			navigator.clipboard
				.writeText(shareableLink)
				.then(() => {
					toast.success("Link copied!", {
						description: "Share this link with others to view your garden.",
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

	// Toggle ambient sound
	const handleToggleSound = () => {
		setSoundEnabled(!soundEnabled);
		toast.info(soundEnabled ? "Sound disabled" : "Sound enabled", {
			description: soundEnabled ? "Ambient sound has been turned off." : "Ambient sound has been enabled. Enjoy your zen experience.",
		});
	};

	// Change ambient sound
	const handleSoundChange = (soundPath: string) => {
		setCurrentSound(soundPath);
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
						background={background}
						onBackgroundChange={setBackground}
						soundEnabled={soundEnabled}
						onSoundToggle={handleToggleSound}
						currentSound={currentSound}
						onSoundChange={handleSoundChange}
						showOutlines={showOutlines}
						onShowOutlinesChange={handleShowOutlinesChange}
						atmosphereSettings={atmosphereSettings}
						onAtmosphereChange={handleAtmosphereChange}
						onSave={handleSave}
						onShare={handleShare}
						onClear={handleClear}
					/>
				</div>

				{/* Right side canvas */}
				<div className="flex-1">
					<Canvas
						ref={canvasRef}
						elements={elements}
						background={background}
						onElementUpdate={handleElementUpdate}
						onElementRemove={handleRemoveElement}
						showOutlines={showOutlines}
						atmosphereSettings={atmosphereSettings}
					/>
				</div>
			</div>
		</div>
	);
}
