"use client";

import { GardenElement } from "@/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "./canvas";
import { TabbedPanel } from "./tabbed-panel";

export function GardenCreator() {
	const [elements, setElements] = useState<GardenElement[]>([]);
	const [background, setBackground] = useState("/backgrounds/zen-default.jpg");
	const [soundEnabled, setSoundEnabled] = useState(false);
	const [currentSound, setCurrentSound] = useState<string | null>("/sounds/ambient-zen.mp3");
	const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
	const [showOutlines, setShowOutlines] = useState(false);

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

	// Use callback to prevent unnecessary recreations of this function
	const handleAddElement = useCallback(
		(elementOption: ElementOption) => {
			// Place new element in center of visible canvas
			const centerX = Math.max(0, canvasSize.width / 2 - 50); // 50 is half of baseSize
			const centerY = Math.max(0, canvasSize.height / 2 - 50);

			// Create a copy with a unique ID
			const newElement: GardenElement = {
				...elementOption,
				id: `${elementOption.type}-${Date.now()}`,
				position: { x: centerX, y: centerY },
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
		const garden = {
			elements,
			background,
			timestamp: new Date().toISOString(),
		};

		try {
			// Save to local storage
			const savedGardens = JSON.parse(localStorage.getItem("zenGardens") || "[]");
			localStorage.setItem("zenGardens", JSON.stringify([...savedGardens, garden]));

			alert("Your zen garden has been saved!");
		} catch (error) {
			console.error("Failed to save garden:", error);
			alert("Failed to save your garden. Please try again.");
		}
	};

	// Handle sharing (generate a shareable link)
	const handleShare = () => {
		// This would typically involve a backend to store the garden
		// For now, we'll just copy garden data to clipboard as a demo
		const gardenData = JSON.stringify({
			elements,
			background,
		});

		navigator.clipboard
			.writeText(gardenData)
			.then(() => {
				alert("Garden data copied to clipboard! In a full implementation, this would generate a shareable link.");
			})
			.catch((err) => {
				console.error("Failed to copy garden data:", err);
				alert("Failed to copy garden data. Please try again.");
			});
	};

	// Handle clearing the canvas
	const handleClear = () => {
		if (confirm("Are you sure you want to clear your garden? This cannot be undone.")) {
			setElements([]);
		}
	};

	// Toggle ambient sound
	const handleToggleSound = () => {
		setSoundEnabled(!soundEnabled);
	};

	// Change ambient sound
	const handleSoundChange = (soundPath: string) => {
		setCurrentSound(soundPath);
	};

	// Toggle showing element outlines
	const handleShowOutlinesChange = (show: boolean) => {
		setShowOutlines(show);
	};

	return (
		<div className="flex flex-col space-y-4">
			<div className="flex flex-col md:flex-row gap-4">
				{/* Left panel with tabbed interface */}
				<div className="w-full md:w-80 h-[60vh] md:h-[70vh]">
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
					/>
				</div>
			</div>
		</div>
	);
}
