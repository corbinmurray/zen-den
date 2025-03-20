"use client";

import { AtmosphereSettings, ElementOption, GardenElement } from "@/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Canvas } from "./canvas";
import { TabbedPanel } from "./tabbed-panel";

export function GardenCreator() {
	const [elements, setElements] = useState<GardenElement[]>([]);
	const [background, setBackground] = useState("/backgrounds/zen-default.jpg");
	const [soundEnabled, setSoundEnabled] = useState(false);
	const [currentSound, setCurrentSound] = useState<string | null>("/sounds/ambient-zen.mp3");
	const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
	const [showOutlines, setShowOutlines] = useState(false);
	const [atmosphereSettings, setAtmosphereSettings] = useState<AtmosphereSettings>({
		timeOfDay: "day",
		weather: "clear",
		effects: [],
		effectsIntensity: 50,
	});

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

	// Check if there's a garden to load
	useEffect(() => {
		try {
			// Check if there's a garden to load from localStorage
			const gardenToLoad = localStorage.getItem("zenGardenToLoad");

			if (gardenToLoad) {
				const garden = JSON.parse(gardenToLoad);

				// Set garden elements and settings
				setElements(garden.elements || []);
				setBackground(garden.background || "/backgrounds/zen-default.jpg");

				// Set atmosphere settings if available
				if (garden.atmosphereSettings) {
					setAtmosphereSettings(garden.atmosphereSettings);
				}

				// Clear the stored garden after loading
				localStorage.removeItem("zenGardenToLoad");

				toast.success("Garden loaded", {
					description: "Your garden has been loaded from the gallery.",
				});
			}
		} catch (error) {
			console.error("Failed to load garden:", error);
			toast.error("Failed to load garden", {
				description: "There was a problem loading your garden.",
			});
			// Clear potentially corrupted data
			localStorage.removeItem("zenGardenToLoad");
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

	// Handle saving garden to local storage
	const handleSave = () => {
		// Prompt the user to name their garden
		toast.info("Name your garden", {
			description: "Give your zen garden a name to help you identify it in your gallery.",
			action: {
				label: "Save",
				onClick: (data) => {
					// Default name if none provided
					const gardenName = data?.name?.trim() || `Zen Garden ${new Date().toLocaleDateString()}`;

					const garden = {
						elements,
						background,
						timestamp: new Date().toISOString(),
						atmosphereSettings,
						name: gardenName,
					};

					try {
						// Save to local storage
						const savedGardens = JSON.parse(localStorage.getItem("zenGardens") || "[]");
						localStorage.setItem("zenGardens", JSON.stringify([...savedGardens, garden]));

						toast.success("Garden saved", {
							description: `"${gardenName}" has been saved to your gallery.`,
						});
					} catch (error) {
						console.error("Failed to save garden:", error);
						toast.error("Save failed", {
							description: "Failed to save your garden. Please try again.",
						});
					}
				},
			},
			cancel: {
				label: "Cancel",
				onClick: () => {},
			},
			// Add an input field for the garden name
			inputs: [
				{
					name: "name",
					placeholder: "My Zen Garden",
					type: "text",
				},
			],
		});
	};

	// Handle sharing (generate a shareable link)
	const handleShare = () => {
		// Prompt the user to name their garden before sharing
		toast.info("Name your garden", {
			description: "Give your zen garden a name before sharing it.",
			action: {
				label: "Share",
				onClick: (data) => {
					// Default name if none provided
					const gardenName = data?.name?.trim() || `Zen Garden ${new Date().toLocaleDateString()}`;

					// First, save the garden to generate a timestamp ID if it's not already saved
					const timestamp = new Date().toISOString();
					const garden = {
						elements,
						background,
						timestamp,
						atmosphereSettings,
						name: gardenName,
					};

					try {
						// Save to local storage if not already saved
						const savedGardens = JSON.parse(localStorage.getItem("zenGardens") || "[]");

						// Check if this exact garden is already saved
						let existingGardenId = null;
						const isAlreadySaved = savedGardens.some((savedGarden: any) => {
							// Simple check - if elements length and background match
							if (savedGarden.elements.length === elements.length && savedGarden.background === background) {
								existingGardenId = savedGarden.timestamp;
								return true;
							}
							return false;
						});

						// If not already saved, save it now
						if (!isAlreadySaved) {
							localStorage.setItem("zenGardens", JSON.stringify([...savedGardens, garden]));
							existingGardenId = timestamp;
						}

						// Create the shareable link
						const shareUrl = `${window.location.origin}/view?id=${existingGardenId}`;

						// Copy to clipboard
						navigator.clipboard
							.writeText(shareUrl)
							.then(() => {
								toast.success("Link copied to clipboard", {
									description: `Share this link to let others view "${gardenName}".`,
								});
							})
							.catch((err) => {
								console.error("Failed to copy garden link:", err);
								toast.error("Failed to copy link", {
									description: "Your shareable link is: " + shareUrl,
								});
							});
					} catch (error) {
						console.error("Failed to share garden:", error);
						toast.error("Share failed", {
							description: "Failed to create a shareable link. Please try again.",
						});
					}
				},
			},
			cancel: {
				label: "Cancel",
				onClick: () => {},
			},
			// Add an input field for the garden name
			inputs: [
				{
					name: "name",
					placeholder: "My Zen Garden",
					type: "text",
				},
			],
		});
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
