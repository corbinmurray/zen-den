"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ElementOption } from "@/lib/types";
import { Eraser, Paintbrush, Trash } from "lucide-react";
import { JSX, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

// Define grid size
const GRID_SIZE = 40;
const CANVAS_SIZE = 500;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;
const createEmptyGrid = () =>
	Array(GRID_SIZE)
		.fill(null)
		.map(() => Array(GRID_SIZE).fill(null));

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
	const [grid, setGrid] = useState<Array<Array<string | null>>>(createEmptyGrid());
	const [currentColor, setCurrentColor] = useState(COLOR_PALETTE[0]);
	const [elementName, setElementName] = useState("Custom Element");
	const [selectedTool, setSelectedTool] = useState<"paint" | "erase">("paint");
	const [isDrawing, setIsDrawing] = useState(false);
	const gridRef = useRef<HTMLDivElement>(null);
	const [lastCell, setLastCell] = useState<{ row: number; col: number } | null>(null);

	// Update cursor based on selected tool
	const getCursorStyle = () => {
		return selectedTool === "paint" ? "pointer" : "crosshair";
	};

	// Handle cell click or drag
	const handleCellInteraction = (rowIndex: number, colIndex: number, isDrag = false) => {
		// Start drawing on mouse down
		if (!isDrag && !isDrawing) {
			setIsDrawing(true);
			setLastCell({ row: rowIndex, col: colIndex });
		}

		// Only continue if we're in drawing mode and either it's initial click or it's a drag
		if (!isDrawing && isDrag) {
			return;
		}

		// Skip if we're interacting with the same cell (prevents state updates)
		if (lastCell && lastCell.row === rowIndex && lastCell.col === colIndex) {
			return;
		}

		setLastCell({ row: rowIndex, col: colIndex });

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

	// Handle canvas mouse move for smoother drawing
	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isDrawing || !gridRef.current) return;

		const rect = gridRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		// Calculate cell coordinates
		const cellWidth = rect.width / GRID_SIZE;
		const cellHeight = rect.height / GRID_SIZE;

		const colIndex = Math.floor(x / cellWidth);
		const rowIndex = Math.floor(y / cellHeight);

		// Check if within bounds and different from last cell
		if (colIndex >= 0 && colIndex < GRID_SIZE && rowIndex >= 0 && rowIndex < GRID_SIZE) {
			handleCellInteraction(rowIndex, colIndex, true);
		}
	};

	// Clean up drawing state on mouse up/leave
	const handleDrawEnd = () => {
		setIsDrawing(false);
		setLastCell(null);
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
			imagePath: svgString,
			preview: svgString,
			category: "custom",
		};

		onSaveElement(customElement);
	};

	return (
		<div className="flex flex-col gap-6">
			<div>
				<Label htmlFor="element-name">Element Name</Label>
				<Input id="element-name" value={elementName} onChange={(e) => setElementName(e.target.value)} className="mt-1 max-w-sm" />
			</div>

			<div className="flex-1 flex flex-col">
				{/* Color palette */}
				<div className="mb-4">
					<span className="text-sm font-medium block mb-2">Colors</span>
					<div className="flex flex-wrap gap-2">
						{COLOR_PALETTE.map((color) => (
							<Button
								key={color}
								className={`size-8 p-0 rounded-full border-2 ${currentColor === color ? "ring-primary ring-2 scale-110" : "border-transparent"}`}
								style={{ backgroundColor: color }}
								onClick={() => setCurrentColor(color)}
								aria-label={`Select color ${color}`}
							/>
						))}
					</div>
				</div>
			</div>

			<div className="flex-1">
				<div className="flex justify-around mb-2 w-full">
					<div className="flex gap-6">
						<Button size="sm" variant={selectedTool === "paint" ? "default" : "outline"} onClick={() => setSelectedTool("paint")}>
							<Paintbrush className="mr-1 size-4" />
							Paint
						</Button>
						<Button size="sm" variant={selectedTool === "erase" ? "default" : "outline"} onClick={() => setSelectedTool("erase")}>
							<Eraser className="mr-1 size-4" />
							Erase
						</Button>
						<Button
							size="sm"
							className="border border-destructive text-destructive bg-transparent hover:bg-destructive hover:text-foreground"
							onClick={() => setGrid(createEmptyGrid())}>
							<Trash className="mr-1 size-4" />
							Clear
						</Button>
					</div>
				</div>

				{/* Grid editor */}
				<div
					ref={gridRef}
					className="border border-border rounded-md overflow-hidden bg-white touch-none select-none"
					style={{
						width: "100%",
						aspectRatio: "1/1",
						display: "grid",
						gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
						gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
						cursor: getCursorStyle(),
					}}
					onMouseDown={(e) => {
						// Prevent default to avoid text selection
						e.preventDefault();
					}}
					onMouseMove={handleMouseMove}
					onMouseUp={handleDrawEnd}
					onMouseLeave={handleDrawEnd}
					onTouchEnd={handleDrawEnd}>
					{grid.map((row, rowIndex) =>
						row.map((cell, colIndex) => (
							<div
								key={`${rowIndex}-${colIndex}`}
								className="border border-border/20"
								style={{
									backgroundColor: cell || "transparent",
									position: "relative",
								}}
								onMouseDown={(e) => {
									e.preventDefault(); // Prevent default behavior
									handleCellInteraction(rowIndex, colIndex);
								}}
								onTouchStart={(e) => {
									e.preventDefault(); // Prevent default behavior
									handleCellInteraction(rowIndex, colIndex);
								}}
								onTouchMove={(e) => {
									e.preventDefault(); // Prevent scrolling during drawing

									if (!isDrawing) return;

									// Get touch position and find corresponding cell
									const touch = e.touches[0];
									const rect = gridRef.current?.getBoundingClientRect();
									if (!rect) return;

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

			<div className="flex justify-end gap-2">
				<Button variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button onClick={handleSave}>Save Element</Button>
			</div>
		</div>
	);
}
