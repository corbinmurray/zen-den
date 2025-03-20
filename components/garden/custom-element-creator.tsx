"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ElementOption } from "@/lib/types";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

// Define grid size
const GRID_SIZE = 15;
const CANVAS_SIZE = 100;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;

// Define color palette that matches our aesthetic
const COLOR_PALETTE = [
	"#8B8B8B", // Gray (rocks)
	"#A3A3A3", // Light gray
	"#4D7C0F", // Green (bamboo)
	"#65A30D", // Light green
	"#228B22", // Forest green (bonsai)
	"#8B4513", // Brown (wood)
	"#A0522D", // Light brown
	"#FFB7C5", // Pink (cherry)
	"#E0D2B4", // Sand
	"#A5C7D3", // Water blue
	"#C13B3B", // Red (pagoda)
	"#FFFFFF", // White
];

interface CustomElementCreatorProps {
	onSaveElement: (element: ElementOption) => void;
	onCancel: () => void;
}

export function CustomElementCreator({ onSaveElement, onCancel }: CustomElementCreatorProps) {
	const [grid, setGrid] = useState<Array<Array<string | null>>>(() =>
		Array(GRID_SIZE)
			.fill(null)
			.map(() => Array(GRID_SIZE).fill(null))
	);
	const [currentColor, setCurrentColor] = useState(COLOR_PALETTE[0]);
	const [elementName, setElementName] = useState("Custom Element");
	const [elementDescription, setElementDescription] = useState("");
	const [selectedTool, setSelectedTool] = useState<"paint" | "erase">("paint");
	const [isDrawing, setIsDrawing] = useState(false);

	// Handle cell click or drag
	const handleCellInteraction = (rowIndex: number, colIndex: number, isDrag = false) => {
		if (!isDrag && !isDrawing) {
			setIsDrawing(true);
		}

		if (!isDrawing && isDrag) {
			return;
		}

		setGrid((prevGrid) => {
			const newGrid = [...prevGrid.map((row) => [...row])];
			if (selectedTool === "paint") {
				newGrid[rowIndex][colIndex] = currentColor;
			} else {
				newGrid[rowIndex][colIndex] = null;
			}
			return newGrid;
		});
	};

	// Convert grid to SVG path elements for preview and saving
	const generateSvgFromGrid = () => {
		const pathElements: JSX.Element[] = [];

		// Process grid cell by cell
		grid.forEach((row, rowIndex) => {
			row.forEach((cell, colIndex) => {
				if (cell) {
					const x = colIndex * CELL_SIZE;
					const y = rowIndex * CELL_SIZE;

					pathElements.push(
						<rect key={`${rowIndex}-${colIndex}`} x={x} y={y} width={CELL_SIZE} height={CELL_SIZE} fill={cell} stroke="#0000001a" strokeWidth="0.5" />
					);
				}
			});
		});

		return pathElements;
	};

	// Save the custom element
	const handleSave = () => {
		// Prepare the SVG markup as a string
		const svgElements = generateSvgFromGrid();
		const svgString = `
      <svg viewBox="0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
        ${svgElements
					.map((el) => el.props)
					.map((props) => `<rect x="${props.x}" y="${props.y}" width="${props.width}" height="${props.height}" fill="${props.fill}" />`)
					.join("")}
      </svg>
    `;

		// Create element option with description
		const customElement: ElementOption = {
			type: `custom-${uuidv4().slice(0, 8)}`,
			name: elementName,
			description: elementDescription || `Custom element: ${elementName}`,
			imagePath: svgString,
			preview: svgString,
			category: "custom",
		};

		onSaveElement(customElement);
	};

	return (
		<div className="flex flex-col">
			<div className="grid gap-4 mb-4 grid-cols-1 md:grid-cols-2">
				<div>
					<Label htmlFor="element-name">Element Name</Label>
					<Input id="element-name" value={elementName} onChange={(e) => setElementName(e.target.value)} className="mt-1" />
				</div>
				<div>
					<Label htmlFor="element-description">Description (Optional)</Label>
					<Input
						id="element-description"
						value={elementDescription}
						onChange={(e) => setElementDescription(e.target.value)}
						className="mt-1"
						placeholder="Briefly describe this element..."
					/>
				</div>
			</div>

			<div className="flex flex-col gap-4 md:flex-row md:items-start mb-4">
				<div className="flex-1">
					<div className="flex justify-between items-center mb-2">
						<span className="text-sm font-medium">Editor</span>
						<div className="flex gap-2">
							<Button size="sm" variant={selectedTool === "paint" ? "default" : "outline"} onClick={() => setSelectedTool("paint")}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="mr-1">
									<path d="M12 19l7-7 3 3-7 7-3-3z"></path>
									<path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
									<path d="M2 2l7.586 7.586"></path>
									<circle cx="11" cy="11" r="2"></circle>
								</svg>
								Paint
							</Button>
							<Button size="sm" variant={selectedTool === "erase" ? "default" : "outline"} onClick={() => setSelectedTool("erase")}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="mr-1">
									<path d="M20 20h-8.3a1 1 0 0 1-.7-.3L2.3 11a1 1 0 0 1 0-1.4l6.9-6.9a1 1 0 0 1 1.4 0L19 11a1 1 0 0 1 0 1.4l-8.7 8.7a1 1 0 0 1-.7.3H4"></path>
								</svg>
								Erase
							</Button>
						</div>
					</div>

					{/* Grid editor */}
					<div
						className="border border-border rounded-md overflow-hidden bg-white"
						style={{
							width: "100%",
							aspectRatio: "1/1",
							display: "grid",
							gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
							gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
						}}
						onMouseUp={() => setIsDrawing(false)}
						onMouseLeave={() => setIsDrawing(false)}
						onTouchEnd={() => setIsDrawing(false)}>
						{grid.map((row, rowIndex) =>
							row.map((cell, colIndex) => (
								<div
									key={`${rowIndex}-${colIndex}`}
									className="border border-border/20 cursor-pointer"
									style={{
										backgroundColor: cell || "transparent",
										position: "relative",
									}}
									onMouseDown={() => handleCellInteraction(rowIndex, colIndex)}
									onMouseOver={() => handleCellInteraction(rowIndex, colIndex, true)}
									onTouchStart={() => handleCellInteraction(rowIndex, colIndex)}
									onTouchMove={(e) => {
										e.preventDefault(); // Prevent scrolling during drawing

										// Get touch position and find corresponding cell
										const touch = e.touches[0];
										const rect = e.currentTarget.getBoundingClientRect();

										// Calculate position relative to the grid
										const relativeX = touch.clientX - rect.left;
										const relativeY = touch.clientY - rect.top;

										// Calculate cell coordinates
										const cellWidth = rect.width / GRID_SIZE;
										const cellHeight = rect.height / GRID_SIZE;

										const cellX = Math.floor(relativeX / cellWidth);
										const cellY = Math.floor(relativeY / cellHeight);

										// Check if within bounds
										if (cellX >= 0 && cellX < GRID_SIZE && cellY >= 0 && cellY < GRID_SIZE) {
											handleCellInteraction(cellY, cellX, true);
										}
									}}
									data-row={rowIndex}
									data-col={colIndex}
								/>
							))
						)}
					</div>
				</div>

				<div className="flex-1 flex flex-col">
					{/* Color palette */}
					<div className="mb-4">
						<span className="text-sm font-medium block mb-2">Colors</span>
						<div className="flex flex-wrap gap-2">
							{COLOR_PALETTE.map((color, index) => (
								<button
									key={index}
									className={`w-8 h-8 rounded-full border-2 ${currentColor === color ? "border-primary" : "border-transparent"}`}
									style={{ backgroundColor: color }}
									onClick={() => setCurrentColor(color)}
									aria-label={`Select color ${color}`}
								/>
							))}
						</div>
					</div>

					{/* Preview */}
					<div className="mb-4">
						<span className="text-sm font-medium block mb-2">Preview</span>
						<div className="border border-border rounded-md overflow-hidden bg-white p-2" style={{ width: "100%", aspectRatio: "1/1" }}>
							<svg viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`} xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
								{generateSvgFromGrid()}
							</svg>
						</div>
					</div>
				</div>
			</div>

			<div className="flex justify-end gap-2">
				<Button variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button onClick={handleSave}>Save Element</Button>
			</div>
		</div>
	);
}
