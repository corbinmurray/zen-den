"use client";

import { GardenElement } from "@/lib/types";
import Image from "next/image";
import { forwardRef, useEffect, useRef, useState } from "react";

interface CanvasProps {
	elements: GardenElement[];
	background: string;
	onElementUpdate: (element: GardenElement) => void;
	onElementRemove: (id: string) => void;
}

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>(function Canvas({ elements, background, onElementUpdate, onElementRemove }, ref) {
	const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
	const canvasRef = useRef<HTMLDivElement>(null);
	const canvasContainerRef = useRef<HTMLDivElement | null>(null);
	const [canvasBounds, setCanvasBounds] = useState({ width: 0, height: 0 });
	const [showOutlines, setShowOutlines] = useState(false);

	// Keep track of the dragging state
	const [isDragging, setIsDragging] = useState(false);
	const [draggedElement, setDraggedElement] = useState<string | null>(null);

	// Store loaded images in a map
	const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

	// Track mouse position for drag operations
	const mousePositionRef = useRef({ x: 0, y: 0 });

	// Track element positions for rendering
	const [elementPositions, setElementPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

	// Handle ResizeObserver for canvas size
	useEffect(() => {
		if (!canvasRef.current) return;

		const updateBounds = () => {
			if (canvasRef.current) {
				const { width, height } = canvasRef.current.getBoundingClientRect();
				if (Math.abs(canvasBounds.width - width) > 1 || Math.abs(canvasBounds.height - height) > 1) {
					setCanvasBounds({ width, height });
				}
			}
		};

		updateBounds();

		const resizeObserver = new ResizeObserver(updateBounds);
		resizeObserver.observe(canvasRef.current);

		return () => {
			if (canvasRef.current) {
				resizeObserver.unobserve(canvasRef.current);
			}
			resizeObserver.disconnect();
		};
	}, [canvasBounds.width, canvasBounds.height]);

	// Initialize element positions
	useEffect(() => {
		const newPositions = new Map();
		elements.forEach((element) => {
			newPositions.set(element.id, element.position);
		});
		setElementPositions(newPositions);
	}, [elements]);

	// Pass canvasRef through to parent component if needed
	useEffect(() => {
		if (ref && typeof ref === "function") {
			ref(canvasRef.current);
		} else if (ref) {
			ref.current = canvasRef.current;
		}
	}, [ref]);

	// Preload all element images
	useEffect(() => {
		elements.forEach((element) => {
			if (!imagesRef.current.has(element.imagePath)) {
				// Create a native HTMLImageElement for preloading
				const img = document.createElement("img");
				img.src = element.imagePath;
				img.onload = () => {
					imagesRef.current.set(element.imagePath, img);
				};
			}
		});
	}, [elements]);

	// Handle mouse events
	useEffect(() => {
		if (!canvasRef.current) return;

		const container = canvasRef.current;
		canvasContainerRef.current = container;

		const handleMouseDown = (e: MouseEvent) => {
			// Skip if clicked on button or control
			if (
				(e.target as HTMLElement).tagName === "BUTTON" ||
				(e.target as HTMLElement).closest("button") ||
				(e.target as HTMLElement).closest('[role="button"]') ||
				(e.target as HTMLElement).closest(".controls")
			) {
				return;
			}

			const rect = container.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			// Find if we clicked on an element (in reverse order for proper z-index)
			const clickedElementIndex = [...elements].reverse().findIndex((element) => {
				const pos = elementPositions.get(element.id) || element.position;
				const size = 100 * element.scale;

				// Check if click is within the element bounds
				return x >= pos.x && x <= pos.x + size && y >= pos.y && y <= pos.y + size;
			});

			if (clickedElementIndex !== -1) {
				// Get the actual element (accounting for reverse order)
				const clickedElement = elements[elements.length - 1 - clickedElementIndex];
				setSelectedElementId(clickedElement.id);
				setDraggedElement(clickedElement.id);
				setIsDragging(true);
				mousePositionRef.current = { x, y };
				e.preventDefault();
			} else {
				setSelectedElementId(null);
			}
		};

		// Controls click handler
		const handleControlsClick = (e: MouseEvent) => {
			// If the click was on a control element, prevent it from triggering drag
			if ((e.target as HTMLElement).closest(".controls")) {
				e.stopPropagation();
			}
		};

		const handleMouseMove = (e: MouseEvent) => {
			if (isDragging && draggedElement) {
				const rect = container.getBoundingClientRect();
				const x = e.clientX - rect.left;
				const y = e.clientY - rect.top;

				// Calculate delta movement
				const deltaX = x - mousePositionRef.current.x;
				const deltaY = y - mousePositionRef.current.y;

				// Update mouse position for next calculation
				mousePositionRef.current = { x, y };

				// Find the element being dragged
				const element = elements.find((el) => el.id === draggedElement);
				if (element) {
					// Get current position
					const currentPos = elementPositions.get(element.id) || element.position;
					const size = 100 * element.scale;

					// Calculate new position with proper constraints to keep element fully visible
					const newX = Math.max(0, Math.min(currentPos.x + deltaX, canvasBounds.width - size));
					const newY = Math.max(0, Math.min(currentPos.y + deltaY, canvasBounds.height - size));

					// Update position in our local state for immediate visual feedback
					setElementPositions((prevPositions) => {
						const newPositions = new Map(prevPositions);
						newPositions.set(element.id, { x: newX, y: newY });
						return newPositions;
					});
				}
			}
		};

		const handleMouseUp = () => {
			if (isDragging && draggedElement) {
				const element = elements.find((el) => el.id === draggedElement);
				const newPosition = elementPositions.get(draggedElement);

				if (element && newPosition) {
					// Update the element position through the parent callback
					onElementUpdate({
						...element,
						position: newPosition,
					});
				}

				setIsDragging(false);
				setDraggedElement(null);
			}
		};

		// Attach event listeners
		container.addEventListener("mousedown", handleMouseDown);
		container.addEventListener("click", handleControlsClick);
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);

		// Touch events for mobile
		const handleTouchStart = (e: TouchEvent) => {
			if (e.touches.length === 1) {
				const touch = e.touches[0];
				const rect = container.getBoundingClientRect();
				const x = touch.clientX - rect.left;
				const y = touch.clientY - rect.top;

				const clickedElementIndex = [...elements].reverse().findIndex((element) => {
					const pos = elementPositions.get(element.id) || element.position;
					const size = 100 * element.scale;
					return x >= pos.x && x <= pos.x + size && y >= pos.y && y <= pos.y + size;
				});

				if (clickedElementIndex !== -1) {
					const clickedElement = elements[elements.length - 1 - clickedElementIndex];
					setSelectedElementId(clickedElement.id);
					setDraggedElement(clickedElement.id);
					setIsDragging(true);
					mousePositionRef.current = { x, y };
					e.preventDefault(); // Prevent scrolling when dragging
				} else {
					setSelectedElementId(null);
				}
			}
		};

		const handleTouchMove = (e: TouchEvent) => {
			if (isDragging && draggedElement && e.touches.length === 1) {
				const touch = e.touches[0];
				const rect = container.getBoundingClientRect();
				const x = touch.clientX - rect.left;
				const y = touch.clientY - rect.top;

				const deltaX = x - mousePositionRef.current.x;
				const deltaY = y - mousePositionRef.current.y;

				mousePositionRef.current = { x, y };

				const element = elements.find((el) => el.id === draggedElement);
				if (element) {
					const currentPos = elementPositions.get(element.id) || element.position;
					const size = 100 * element.scale;

					// Apply same constraints for touch events
					const newX = Math.max(0, Math.min(currentPos.x + deltaX, canvasBounds.width - size));
					const newY = Math.max(0, Math.min(currentPos.y + deltaY, canvasBounds.height - size));

					setElementPositions((prevPositions) => {
						const newPositions = new Map(prevPositions);
						newPositions.set(element.id, { x: newX, y: newY });
						return newPositions;
					});
				}

				e.preventDefault(); // Prevent scrolling when dragging
			}
		};

		const handleTouchEnd = () => {
			if (isDragging && draggedElement) {
				const element = elements.find((el) => el.id === draggedElement);
				const newPosition = elementPositions.get(draggedElement);

				if (element && newPosition) {
					onElementUpdate({
						...element,
						position: newPosition,
					});
				}

				setIsDragging(false);
				setDraggedElement(null);
			}
		};

		// Attach touch event listeners
		container.addEventListener("touchstart", handleTouchStart, { passive: false });
		window.addEventListener("touchmove", handleTouchMove, { passive: false });
		window.addEventListener("touchend", handleTouchEnd);

		return () => {
			// Clean up event listeners
			container.removeEventListener("mousedown", handleMouseDown);
			container.removeEventListener("click", handleControlsClick);
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);

			container.removeEventListener("touchstart", handleTouchStart);
			window.removeEventListener("touchmove", handleTouchMove);
			window.removeEventListener("touchend", handleTouchEnd);
		};
	}, [canvasBounds.height, canvasBounds.width, draggedElement, elementPositions, elements, isDragging, onElementUpdate]);

	// Handle rotate and scale functions
	const handleRotate = (id: string, change: number, e?: React.MouseEvent) => {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}

		const element = elements.find((el) => el.id === id);
		if (element) {
			onElementUpdate({
				...element,
				rotation: (element.rotation + change) % 360,
			});
		}
	};

	const handleScale = (id: string, change: number, e?: React.MouseEvent) => {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}

		const element = elements.find((el) => el.id === id);
		if (element) {
			const oldScale = element.scale;
			const newScale = Math.max(0.5, Math.min(2, element.scale + change));

			// Calculate position adjustment to keep element centered as it scales
			const baseSize = 100;
			const oldSize = baseSize * oldScale;
			const newSize = baseSize * newScale;
			const sizeChange = (newSize - oldSize) / 2;

			// Get current position (from our state or element)
			const currentPos = elementPositions.get(element.id) || element.position;

			// Adjust position to maintain center with proper boundary constraints
			const newPosition = {
				x: Math.max(0, Math.min(currentPos.x - sizeChange, canvasBounds.width - newSize)),
				y: Math.max(0, Math.min(currentPos.y - sizeChange, canvasBounds.height - newSize)),
			};

			// Update positions in state to reflect the scaling
			setElementPositions((prevPositions) => {
				const newPositions = new Map(prevPositions);
				newPositions.set(element.id, newPosition);
				return newPositions;
			});

			onElementUpdate({
				...element,
				scale: newScale,
				position: newPosition,
			});
		}
	};

	const handleRemove = (id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		onElementRemove(id);
	};

	return (
		<div>
			<div
				ref={canvasRef}
				className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden rounded-lg border border-border touch-none"
				style={{
					backgroundImage: `url(${background})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
					cursor: isDragging ? "grabbing" : "default",
				}}>
				{/* Render all garden elements */}
				{elements.map((element) => {
					// Get position either from our local state (for immediate updates) or from the element
					const position = elementPositions.get(element.id) || element.position;
					const baseSize = 100;
					const size = baseSize * element.scale;

					return (
						<div
							key={element.id}
							className="absolute"
							style={{
								transform: `translate(${position.x}px, ${position.y}px)`,
								zIndex: element.id === selectedElementId ? 100 : element.zIndex || 1,
								cursor: isDragging && draggedElement === element.id ? "grabbing" : "grab",
								transition: isDragging && draggedElement === element.id ? "none" : "transform 0.1s ease-out",
								touchAction: "none", // Disable browser touch actions for better touch support
							}}>
							{/* Element Image with outline */}
							<div
								style={{
									width: size,
									height: size,
									transform: `rotate(${element.rotation}deg)`,
									position: "relative",
								}}>
								{/* Element outline */}
								{(showOutlines || element.id === selectedElementId) && (
									<div
										className="absolute inset-0 border-2 border-dashed rounded-md pointer-events-none"
										style={{
											borderColor: element.id === selectedElementId ? "rgba(99, 102, 241, 0.8)" : "rgba(156, 163, 175, 0.5)",
											backgroundColor: "rgba(99, 102, 241, 0.05)",
										}}
									/>
								)}
								<div className="relative w-full h-full">
									<Image
										src={element.imagePath}
										alt={element.name}
										fill
										style={{
											objectFit: "contain",
											userSelect: "none",
											pointerEvents: "none", // Prevent image from capturing events
										}}
										draggable={false}
										unoptimized
									/>
								</div>
							</div>

							{/* Controls - only show when selected */}
							{element.id === selectedElementId && (
								<div
									className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex items-center bg-card border border-border rounded-md shadow-md z-50 controls"
									style={{ pointerEvents: "auto" }}
									onClick={(e) => e.stopPropagation()}>
									<button
										type="button"
										className="p-1 hover:bg-muted"
										onMouseDown={(e) => {
											e.stopPropagation();
											e.preventDefault();
											handleRotate(element.id, -45);
										}}
										aria-label="Rotate left">
										<RotateLeftIcon className="h-4 w-4" />
									</button>

									<button
										type="button"
										className="p-1 hover:bg-muted"
										onMouseDown={(e) => {
											e.stopPropagation();
											e.preventDefault();
											handleScale(element.id, -0.1);
										}}
										aria-label="Scale down">
										<MinusIcon className="h-4 w-4" />
									</button>

									<button
										type="button"
										className="p-1 hover:bg-muted"
										onMouseDown={(e) => {
											e.stopPropagation();
											e.preventDefault();
											handleScale(element.id, 0.1);
										}}
										aria-label="Scale up">
										<PlusIcon className="h-4 w-4" />
									</button>

									<button
										type="button"
										className="p-1 hover:bg-muted"
										onMouseDown={(e) => {
											e.stopPropagation();
											e.preventDefault();
											handleRotate(element.id, 45);
										}}
										aria-label="Rotate right">
										<RotateRightIcon className="h-4 w-4" />
									</button>

									<button
										type="button"
										className="p-1 hover:bg-muted text-destructive"
										onMouseDown={(e) => {
											e.stopPropagation();
											e.preventDefault();
											onElementRemove(element.id);
										}}
										aria-label="Remove">
										<XIcon className="h-4 w-4" />
									</button>
								</div>
							)}
						</div>
					);
				})}

				{/* Empty state */}
				{elements.length === 0 && (
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="bg-card/80 backdrop-blur-sm p-6 rounded-lg text-center max-w-sm flex flex-col items-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="40"
								height="40"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="text-primary mb-3">
								<path d="M2 22h20" />
								<path d="M20 22V6l-4-4H8.5L4 6v16" />
								<path d="M18 2H2v20" />
								<path d="M14 5v5.5a2.5 2.5 0 0 1-5 0V7" />
								<circle cx="9" cy="7" r="1" />
							</svg>
							<h3 className="text-lg font-medium mb-2">Your Zen Garden Awaits</h3>
							<p className="text-muted mb-4">
								Start by clicking on elements in the panel on the left to add them to your garden. Once added, drag them to position, then use the controls to
								rotate and resize.
							</p>
							<div className="grid grid-cols-3 gap-3 text-xs text-center w-full">
								<div className="flex flex-col items-center p-2 bg-background rounded-md">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="mb-1">
										<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
									</svg>
									<span>1. Select an element</span>
								</div>
								<div className="flex flex-col items-center p-2 bg-background rounded-md">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="mb-1">
										<path d="M11 19a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
										<path d="M2 6h11" />
										<path d="M9 12H2" />
										<path d="M14 6h8" />
										<path d="M11 12h11" />
										<path d="M6.236 12l-3 6.646A1 1 0 0 0 4 20h16a1 1 0 0 0 .764-1.646l-3-6.646" />
									</svg>
									<span>2. Drag to position</span>
								</div>
								<div className="flex flex-col items-center p-2 bg-background rounded-md">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
										className="mb-1">
										<path d="M12 2v8" />
										<path d="m16 12 4-4-4-4" />
										<rect x="2" y="14" width="20" height="8" rx="2" />
									</svg>
									<span>3. Customize & save</span>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Show outlines toggle button */}
			<div className="mt-2 flex justify-end">
				<button
					type="button"
					onMouseDown={(e) => {
						e.stopPropagation();
						e.preventDefault();
						setShowOutlines(!showOutlines);
					}}
					className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
						showOutlines ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"
					}`}>
					<BorderIcon className="h-3 w-3" />
					{showOutlines ? "Hide Outlines" : "Show Outlines"}
				</button>
			</div>
		</div>
	);
});

// Icons
function RotateLeftIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}>
			<path d="M7.1818 10.1818C7.1818 10.1818 8.01815 8.85 9.85726 7.5C11.5182 6.25 13.5455 5.5 15.5 5.5C16.5 5.5 12.5 5.5 16.5 5.5M17.5 9V5.5H14"></path>
			<path d="M11.5 19.5C15.0899 19.5 18 16.5899 18 13C18 9.41015 15.0899 6.5 11.5 6.5C7.91015 6.5 5 9.41015 5 13C5 16.5899 7.91015 19.5 11.5 19.5Z"></path>
		</svg>
	);
}

function RotateRightIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}>
			<path d="M17.1818 10.1818C17.1818 10.1818 16.3455 8.85 14.5064 7.5C12.8455 6.25 10.8182 5.5 8.86365 5.5C7.86365 5.5 11.8637 5.5 7.86365 5.5M6.86365 9V5.5H10.3637"></path>
			<path d="M11.5 19.5C7.91015 19.5 5 16.5899 5 13C5 9.41015 7.91015 6.5 11.5 6.5C15.0899 6.5 18 9.41015 18 13C18 16.5899 15.0899 19.5 11.5 19.5Z"></path>
		</svg>
	);
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}>
			<line x1="12" y1="5" x2="12" y2="19"></line>
			<line x1="5" y1="12" x2="19" y2="12"></line>
		</svg>
	);
}

function MinusIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}>
			<line x1="5" y1="12" x2="19" y2="12"></line>
		</svg>
	);
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}>
			<line x1="18" y1="6" x2="6" y2="18"></line>
			<line x1="6" y1="6" x2="18" y2="18"></line>
		</svg>
	);
}

function BorderIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}>
			<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
			<line x1="3" y1="9" x2="21" y2="9" />
			<line x1="3" y1="15" x2="21" y2="15" />
			<line x1="9" y1="3" x2="9" y2="21" />
			<line x1="15" y1="3" x2="15" y2="21" />
		</svg>
	);
}
