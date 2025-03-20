"use client";

import { AtmosphereSettings, GardenElement } from "@/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "./canvas";

interface GardenViewerProps {
	elements: GardenElement[];
	background: string;
	atmosphereSettings: AtmosphereSettings;
	readonly?: boolean;
}

export function GardenViewer({
	elements = [],
	background = "/backgrounds/zen-default.jpg",
	atmosphereSettings = {
		timeOfDay: "day",
		weather: "clear",
		effects: [],
		effectsIntensity: 50,
	},
	readonly = true,
}: GardenViewerProps) {
	const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
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
	}, []);

	// These handlers are empty placeholders for read-only mode
	const handleElementUpdate = useCallback(() => {
		// No updates in read-only mode
	}, []);

	const handleRemoveElement = useCallback(() => {
		// No removals in read-only mode
	}, []);

	return (
		<div className="flex flex-col space-y-4">
			<div className="flex-1">
				<Canvas
					ref={canvasRef}
					elements={elements}
					background={background}
					onElementUpdate={handleElementUpdate}
					onElementRemove={handleRemoveElement}
					showOutlines={false}
					atmosphereSettings={atmosphereSettings}
					readonly={readonly}
				/>
			</div>
		</div>
	);
}
