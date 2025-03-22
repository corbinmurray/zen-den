"use client";

import { Atmosphere, GardenItem } from "@/lib/types";
import * as motion from "motion/react-client";
import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";

interface CanvasProps {
	elements: GardenItem[];
	atmosphere?: Atmosphere;
	readonly?: boolean;
	onElementRemove?: (id: string) => void;
	onElementUpdate?: (element: GardenItem) => void;
}

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>(function Canvas(
	{
		elements,
		atmosphere = {
			timeOfDay: "day",
			weather: "clear",
		},
		readonly = false,
		onElementRemove,
		onElementUpdate,
	},
	ref
) {
	const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
	const canvasRef = useRef<HTMLDivElement>(null);
	const canvasContainerRef = useRef<HTMLDivElement | null>(null);
	const [canvasBounds, setCanvasBounds] = useState({ width: 0, height: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [draggedElement, setDraggedElement] = useState<string | null>(null);
	const [isResizing, setIsResizing] = useState(false);
	const [resizeDirection, setResizeDirection] = useState<string | null>(null);
	const mousePositionRef = useRef({ x: 0, y: 0 });
	const [elementPositions, setElementPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
	const [elementScales, setElementScales] = useState<Map<string, number>>(new Map());
	const processedElementsRef = useRef(new Set<string>());
	const [copiedElement, setCopiedElement] = useState<GardenItem | null>(null);
	const [showCopyFeedback, setShowCopyFeedback] = useState(false);

	const updateBounds = useCallback(() => {
		if (canvasContainerRef.current) {
			const rect = canvasContainerRef.current.getBoundingClientRect();
			setCanvasBounds({
				width: rect.width,
				height: rect.height,
			});
		}
	}, []);

	// Helper function to determine if a point is within an element's shape
	const isPointInShape = useCallback((elementType: string, x: number, y: number, elementX: number, elementY: number, size: number, rotation: number) => {
		// Convert coordinates relative to element center
		const centerX = elementX + size / 2;
		const centerY = elementY + size / 2;

		// Account for rotation by rotating the point in the opposite direction
		const rotationRad = (rotation * Math.PI) / 180;
		const rotatedX = Math.cos(-rotationRad) * (x - centerX) - Math.sin(-rotationRad) * (y - centerY) + centerX;
		const rotatedY = Math.sin(-rotationRad) * (x - centerX) + Math.cos(-rotationRad) * (y - centerY) + centerY;

		// Get normalized coordinates within the element (0 to 1)
		const normalizedX = (rotatedX - elementX) / size;
		const normalizedY = (rotatedY - elementY) / size;

		// Check if we're outside the element's bounds
		if (normalizedX < 0 || normalizedX > 1 || normalizedY < 0 || normalizedY > 1) {
			return false;
		}

		// For more precise hit testing based on element type
		switch (elementType) {
			case "rock":
			case "rock-flat":
			case "rock-tall":
			case "bonsai":
			case "cherry":
			case "pine":
			case "moss":
			case "water":
			case "sand":
				// For these elements, use an elliptical hit area
				const distX = (normalizedX - 0.5) * 2; // -1 to 1
				const distY = (normalizedY - 0.5) * 2; // -1 to 1
				// Check if the point is within an ellipse
				return distX * distX + distY * distY <= 1;

			case "bamboo":
			case "grass":
				// Narrower hit area for thin vertical plants
				const centerDist = Math.abs(normalizedX - 0.5);
				return centerDist < 0.15 && normalizedY > 0.2;

			case "lantern":
			case "bridge":
			case "pagoda":
				// For structural elements, use a slightly reduced rectangular hit area
				return normalizedX > 0.1 && normalizedX < 0.9 && normalizedY > 0.1 && normalizedY < 0.9;

			default:
				// Default to a circular hit area with 80% of the full radius
				const dx = normalizedX - 0.5;
				const dy = normalizedY - 0.5;
				return dx * dx + dy * dy <= 0.16; // 0.16 = (0.4)²
		}
	}, []);

	// Handle ResizeObserver for canvas size
	useEffect(() => {
		if (!canvasRef.current) return;

		updateBounds();

		const resizeObserver = new ResizeObserver(updateBounds);
		resizeObserver.observe(canvasRef.current);

		return () => {
			resizeObserver.disconnect();
		};
	}, [updateBounds]);

	// Modify the useEffect for initializing element positions and scales to preserve existing positions
	useEffect(() => {
		const newPositions = new Map(elementPositions);
		const newScales = new Map(elementScales);
		let hasChanges = false;

		// Remove entries for elements that no longer exist
		const elementIds = new Set(elements.map((element) => element.id));
		newPositions.forEach((_, id) => {
			if (!elementIds.has(id)) {
				newPositions.delete(id);
				hasChanges = true;
			}
		});
		newScales.forEach((_, id) => {
			if (!elementIds.has(id)) {
				newScales.delete(id);
				hasChanges = true;
			}
		});

		// Add entries for new elements only
		elements.forEach((element) => {
			if (!processedElementsRef.current.has(element.id)) {
				// Only set position/scale for new elements
				if (!newPositions.has(element.id)) {
					newPositions.set(element.id, element.position);
					hasChanges = true;
				}
				if (!newScales.has(element.id)) {
					newScales.set(element.id, element.scale);
					hasChanges = true;
				}
				// Mark this element as processed
				processedElementsRef.current.add(element.id);
			}
		});

		// Only update state if there were actually changes
		if (hasChanges) {
			setElementPositions(newPositions);
			setElementScales(newScales);
		}
	}, [elements]); // Only depend on elements changing

	// Pass canvasRef through to parent component if needed
	useEffect(() => {
		if (ref && typeof ref === "function") {
			ref(canvasRef.current);
		} else if (ref) {
			ref.current = canvasRef.current;
		}
	}, [ref]);

	// Handle mouse events
	const handleMouseDown = useCallback(
		(e: MouseEvent) => {
			// Skip if clicked on button or control
			if (
				(e.target as HTMLElement).tagName === "BUTTON" ||
				(e.target as HTMLElement).closest("button") ||
				(e.target as HTMLElement).closest('[role="button"]') ||
				(e.target as HTMLElement).closest(".controls")
			) {
				return;
			}

			if (!canvasContainerRef.current) return;
			const container = canvasContainerRef.current;

			// Check if we're clicking on a resize handle
			const resizeHandle = (e.target as HTMLElement).closest(".resize-handle");
			if (resizeHandle) {
				e.preventDefault();
				e.stopPropagation();

				const elementId = resizeHandle.getAttribute("data-element-id");
				const direction = resizeHandle.getAttribute("data-direction");

				if (elementId && direction) {
					setIsResizing(true);
					setDraggedElement(elementId);
					setResizeDirection(direction);

					const rect = container.getBoundingClientRect();
					mousePositionRef.current = {
						x: e.clientX - rect.left,
						y: e.clientY - rect.top,
					};
					return;
				}
			}

			const rect = container.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			// Find if we clicked on an element (in reverse order for proper z-index)
			const clickedElementIndex = [...elements].reverse().findIndex((element) => {
				const pos = elementPositions.get(element.id) || element.position;
				const scale = elementScales.get(element.id) || element.scale;
				const size = 100 * scale;

				// Use more precise hit testing
				return isPointInShape(element.type, x, y, pos.x, pos.y, size, element.rotation);
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
		},
		[elements, elementPositions, elementScales, isPointInShape]
	);

	// Controls click handler
	const handleControlsClick = useCallback((e: MouseEvent) => {
		// If the click was on a control element, prevent it from triggering drag
		if ((e.target as HTMLElement).closest(".controls")) {
			e.stopPropagation();
		}
	}, []);

	// Handle mouse move
	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!canvasContainerRef.current) return;
			const container = canvasContainerRef.current;

			const rect = container.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			// Calculate delta movement
			const deltaX = x - mousePositionRef.current.x;
			const deltaY = y - mousePositionRef.current.y;

			// Update mouse position for next calculation
			mousePositionRef.current = { x, y };

			// Handle resizing
			if (isResizing && draggedElement && resizeDirection) {
				const element = elements.find((el) => el.id === draggedElement);
				if (element) {
					let scaleChange = 0;

					// Calculate scale change based on resize direction
					switch (resizeDirection) {
						case "corner":
							// Diagonal movement creates more natural scaling
							scaleChange = ((Math.abs(deltaX) + Math.abs(deltaY)) / 200) * (deltaX + deltaY > 0 ? 1 : -1);
							break;
						case "right":
							scaleChange = deltaX / 100;
							break;
						case "left":
							scaleChange = -deltaX / 100;
							break;
						case "bottom":
							scaleChange = deltaY / 100;
							break;
						case "top":
							scaleChange = -deltaY / 100;
							break;
					}

					const oldScale = elementScales.get(element.id) || element.scale;
					const newScale = Math.max(0.5, Math.min(2, oldScale + scaleChange));

					// Update the scale in our local state for immediate visual feedback
					setElementScales((prevScales) => {
						const newScales = new Map(prevScales);
						newScales.set(element.id, newScale);
						return newScales;
					});

					// Calculate position adjustment to keep element centered as it scales
					const baseSize = 100;
					const oldSize = baseSize * oldScale;
					const newSize = baseSize * newScale;
					const size = newSize; // Define size variable for use in constraints
					const sizeChange = (newSize - oldSize) / 2;

					// Get current position
					const currentPos = elementPositions.get(element.id) || element.position;

					// Adjust position to maintain center with proper boundary constraints
					const newPosition = {
						x: Math.max(-size * 0.75, Math.min(currentPos.x - sizeChange, canvasBounds.width - size * 0.25)),
						y: Math.max(-size * 0.75, Math.min(currentPos.y - sizeChange, canvasBounds.height - size * 0.25)),
					};

					// Update positions in state to reflect the scaling
					setElementPositions((prevPositions) => {
						const newPositions = new Map(prevPositions);
						newPositions.set(element.id, newPosition);
						return newPositions;
					});
				}
			}
			// Handle dragging
			else if (isDragging && draggedElement) {
				// Find the element being dragged
				const element = elements.find((el) => el.id === draggedElement);
				if (element) {
					// Get current position
					const currentPos = elementPositions.get(element.id) || element.position;
					const currentScale = elementScales.get(element.id) || element.scale;
					const size = 100 * currentScale;

					// Calculate new position with constraints that allow elements to extend outside,
					// but keep at least 25% of the element visible
					const newX = Math.max(-size * 0.75, Math.min(currentPos.x + deltaX, canvasBounds.width - size * 0.25));
					const newY = Math.max(-size * 0.75, Math.min(currentPos.y + deltaY, canvasBounds.height - size * 0.25));

					// Update position in our local state for immediate visual feedback
					setElementPositions((prevPositions) => {
						const newPositions = new Map(prevPositions);
						newPositions.set(element.id, { x: newX, y: newY });
						return newPositions;
					});
				}
			}
		},
		[canvasBounds.height, canvasBounds.width, draggedElement, elementPositions, elementScales, elements, isDragging, isResizing, resizeDirection]
	);

	// Handle mouse up
	const handleMouseUp = useCallback(() => {
		if ((isResizing || isDragging) && draggedElement) {
			// Get the current position/scale from our local state
			const position = elementPositions.get(draggedElement);
			const scale = elementScales.get(draggedElement);

			// Find the element in the elements array
			const elementIndex = elements.findIndex((el) => el.id === draggedElement);
			if (elementIndex !== -1 && position) {
				// Create a new reference to the element (to avoid mutating props)
				const updatedElement = { ...elements[elementIndex] };

				// Set the updated position
				updatedElement.position = position;

				// Set the updated scale if it exists
				if (scale !== undefined) {
					updatedElement.scale = scale;
				}

				// If we have an onElementUpdate callback, call it with the updated element
				if (onElementUpdate) {
					onElementUpdate(updatedElement);
				}
			}

			// Reset dragging/resizing state
			if (isResizing) {
				setIsResizing(false);
				setResizeDirection(null);
			}
			setIsDragging(false);
			setDraggedElement(null);
		}
	}, [isResizing, isDragging, draggedElement, elementPositions, elementScales, elements, onElementUpdate]);

	// Touch events for mobile
	const handleTouchStart = useCallback(
		(e: TouchEvent) => {
			if (e.touches.length === 1) {
				if (!canvasContainerRef.current) return;
				const container = canvasContainerRef.current;

				// Check if we're touching a resize handle
				const touch = e.touches[0];
				const element = document.elementFromPoint(touch.clientX, touch.clientY);
				const resizeHandle = element?.closest(".resize-handle");

				if (resizeHandle) {
					e.preventDefault();

					const elementId = resizeHandle.getAttribute("data-element-id");
					const direction = resizeHandle.getAttribute("data-direction");

					if (elementId && direction) {
						setIsResizing(true);
						setDraggedElement(elementId);
						setResizeDirection(direction);

						const rect = container.getBoundingClientRect();
						mousePositionRef.current = {
							x: touch.clientX - rect.left,
							y: touch.clientY - rect.top,
						};
						return;
					}
				}

				const rect = container.getBoundingClientRect();
				const x = touch.clientX - rect.left;
				const y = touch.clientY - rect.top;

				const clickedElementIndex = [...elements].reverse().findIndex((element) => {
					const pos = elementPositions.get(element.id) || element.position;
					const scale = elementScales.get(element.id) || element.scale;
					const size = 100 * scale;

					// Use the same precise hit testing for touch
					return isPointInShape(element.type, x, y, pos.x, pos.y, size, element.rotation);
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
		},
		[elements, elementPositions, elementScales, isPointInShape]
	);

	const handleTouchMove = useCallback(
		(e: TouchEvent) => {
			if (e.touches.length === 1) {
				if (!canvasContainerRef.current) return;
				const container = canvasContainerRef.current;

				const touch = e.touches[0];
				const rect = container.getBoundingClientRect();
				const x = touch.clientX - rect.left;
				const y = touch.clientY - rect.top;

				const deltaX = x - mousePositionRef.current.x;
				const deltaY = y - mousePositionRef.current.y;

				mousePositionRef.current = { x, y };

				// Handle resizing with touch
				if (isResizing && draggedElement && resizeDirection) {
					const element = elements.find((el) => el.id === draggedElement);
					if (element) {
						let scaleChange = 0;

						// Calculate scale change based on resize direction
						switch (resizeDirection) {
							case "corner":
								scaleChange = ((Math.abs(deltaX) + Math.abs(deltaY)) / 200) * (deltaX + deltaY > 0 ? 1 : -1);
								break;
							case "right":
								scaleChange = deltaX / 100;
								break;
							case "left":
								scaleChange = -deltaX / 100;
								break;
							case "bottom":
								scaleChange = deltaY / 100;
								break;
							case "top":
								scaleChange = -deltaY / 100;
								break;
						}

						const oldScale = elementScales.get(element.id) || element.scale;
						const newScale = Math.max(0.5, Math.min(2, oldScale + scaleChange));

						setElementScales((prevScales) => {
							const newScales = new Map(prevScales);
							newScales.set(element.id, newScale);
							return newScales;
						});

						// Calculate position adjustment to keep element centered as it scales
						const baseSize = 100;
						const oldSize = baseSize * oldScale;
						const newSize = baseSize * newScale;
						const size = newSize; // Define size variable for use in constraints
						const sizeChange = (newSize - oldSize) / 2;

						const currentPos = elementPositions.get(element.id) || element.position;

						const newPosition = {
							x: Math.max(-size * 0.75, Math.min(currentPos.x - sizeChange, canvasBounds.width - size * 0.25)),
							y: Math.max(-size * 0.75, Math.min(currentPos.y - sizeChange, canvasBounds.height - size * 0.25)),
						};

						setElementPositions((prevPositions) => {
							const newPositions = new Map(prevPositions);
							newPositions.set(element.id, newPosition);
							return newPositions;
						});

						e.preventDefault();
					}
				}
				// Handle dragging with touch
				else if (isDragging && draggedElement) {
					const element = elements.find((el) => el.id === draggedElement);
					if (element) {
						const currentPos = elementPositions.get(element.id) || element.position;
						const currentScale = elementScales.get(element.id) || element.scale;
						const size = 100 * currentScale;

						// Apply same constraints for touch events
						const newX = Math.max(-size * 0.75, Math.min(currentPos.x + deltaX, canvasBounds.width - size * 0.25));
						const newY = Math.max(-size * 0.75, Math.min(currentPos.y + deltaY, canvasBounds.height - size * 0.25));

						setElementPositions((prevPositions) => {
							const newPositions = new Map(prevPositions);
							newPositions.set(element.id, { x: newX, y: newY });
							return newPositions;
						});
					}

					e.preventDefault(); // Prevent scrolling when dragging
				}
			}
		},
		[canvasBounds.height, canvasBounds.width, draggedElement, elementPositions, elementScales, elements, isDragging, isResizing, resizeDirection]
	);

	const handleTouchEnd = useCallback(() => {
		if ((isResizing || isDragging) && draggedElement) {
			// Get the current position/scale from our local state
			const position = elementPositions.get(draggedElement);
			const scale = elementScales.get(draggedElement);

			// Find the element in the elements array
			const elementIndex = elements.findIndex((el) => el.id === draggedElement);
			if (elementIndex !== -1 && position) {
				// Create a new reference to the element (to avoid mutating props)
				const updatedElement = { ...elements[elementIndex] };

				// Set the updated position
				updatedElement.position = position;

				// Set the updated scale if it exists
				if (scale !== undefined) {
					updatedElement.scale = scale;
				}

				// If we have an onElementUpdate callback, call it with the updated element
				if (onElementUpdate) {
					onElementUpdate(updatedElement);
				}
			}

			// Reset states
			if (isResizing) {
				setIsResizing(false);
				setResizeDirection(null);
			}
			setIsDragging(false);
			setDraggedElement(null);
		}
	}, [isResizing, isDragging, draggedElement, elementPositions, elementScales, elements, onElementUpdate]);

	// Set up event listeners
	useEffect(() => {
		if (!canvasRef.current) return;

		canvasContainerRef.current = canvasRef.current;

		updateBounds();

		// Only add interactive event listeners if not in readonly mode
		if (!readonly) {
			// Mouse events
			canvasContainerRef.current.addEventListener("mousedown", handleMouseDown);
			canvasContainerRef.current.addEventListener("click", handleControlsClick);
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);

			// Touch events for mobile
			canvasContainerRef.current.addEventListener("touchstart", handleTouchStart as EventListener, { passive: false });
			canvasContainerRef.current.addEventListener("touchmove", handleTouchMove as EventListener, { passive: false });
			document.addEventListener("touchend", handleTouchEnd as EventListener);
		}

		// Always add resize event listener, even in readonly mode
		window.addEventListener("resize", updateBounds);

		return () => {
			// Clean up event listeners
			if (canvasContainerRef.current && !readonly) {
				canvasContainerRef.current.removeEventListener("mousedown", handleMouseDown);
				canvasContainerRef.current.removeEventListener("click", handleControlsClick);
				canvasContainerRef.current.removeEventListener("touchstart", handleTouchStart as EventListener);
				canvasContainerRef.current.removeEventListener("touchmove", handleTouchMove as EventListener);
			}
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
			document.removeEventListener("touchend", handleTouchEnd as EventListener);
			window.removeEventListener("resize", updateBounds);
		};
	}, [handleMouseDown, handleMouseMove, handleMouseUp, handleTouchStart, handleTouchMove, handleTouchEnd, handleControlsClick, updateBounds, readonly]);

	// Handle rotate and scale functions
	const handleRotate = (id: string, change: number, e?: React.MouseEvent) => {
		if (e) {
			e.stopPropagation();
			e.preventDefault();
		}

		const element = elements.find((el) => el.id === id);

		if (element) {
			// Calculate new rotation value, ensuring it stays within 0-360 range
			const currentRotation = element.rotation || 0;
			const newRotation = (currentRotation + change + 360) % 360;

			// Create an updated element with the new rotation
			const updatedElement = { ...element, rotation: newRotation };

			// If we have an onElementUpdate callback, call it with the updated element
			if (onElementUpdate) {
				onElementUpdate(updatedElement);
			}
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
			const size = newSize; // Define size variable for use in constraints
			const sizeChange = (newSize - oldSize) / 2;

			// Get current position (from our state or element)
			const currentPos = elementPositions.get(element.id) || element.position;

			// Adjust position to maintain center with proper boundary constraints
			const newPosition = {
				x: Math.max(-size * 0.75, Math.min(currentPos.x - sizeChange, canvasBounds.width - size * 0.25)),
				y: Math.max(-size * 0.75, Math.min(currentPos.y - sizeChange, canvasBounds.height - size * 0.25)),
			};

			// Update scales in state
			setElementScales((prevScales) => {
				const newScales = new Map(prevScales);
				newScales.set(element.id, newScale);
				return newScales;
			});

			// Update positions in state to reflect the scaling
			setElementPositions((prevPositions) => {
				const newPositions = new Map(prevPositions);
				newPositions.set(element.id, newPosition);
				return newPositions;
			});
		}
	};

	// Function to render the SVG content for each element type
	const renderElementSVG = (type: string) => {
		// Check if this is a custom element (type starts with "custom-")
		if (type.startsWith("custom-")) {
			// Find the element by type instead of id
			const customElement = elements.find((el) => el.type === type);
			if (customElement && customElement.imagePath) {
				// Render the SVG content from imagePath
				return <div dangerouslySetInnerHTML={{ __html: customElement.imagePath }} className="w-full h-full" />;
			}
			return null;
		}

		switch (type) {
			case "rock":
				return (
					<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
						<ellipse cx="50" cy="60" rx="40" ry="30" fill="#8B8B8B" />
						<ellipse cx="50" cy="60" rx="30" ry="20" fill="#A3A3A3" />
						<ellipse cx="40" cy="50" rx="10" ry="8" fill="#CFCFCF" opacity="0.6" />
					</svg>
				);
			case "rock-flat":
				return (
					<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
						<ellipse cx="50" cy="70" rx="45" ry="20" fill="#9B9B9B" />
						<ellipse cx="50" cy="70" rx="35" ry="15" fill="#B0B0B0" />
						<ellipse cx="60" cy="65" rx="10" ry="5" fill="#CFCFCF" opacity="0.5" />
					</svg>
				);
			case "rock-tall":
				return (
					<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
						<path d="M40,80 Q30,30 50,20 Q70,30 60,80 Z" fill="#8B8B8B" />
						<path d="M45,75 Q40,35 50,25 Q60,35 55,75 Z" fill="#A3A3A3" />
					</svg>
				);
			case "bamboo":
				return (
					<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
						<rect x="45" y="20" width="10" height="70" fill="#4D7C0F" rx="5" />
						<rect x="45" y="20" width="10" height="5" fill="#3F6212" rx="2" />
						<rect x="45" y="35" width="10" height="5" fill="#3F6212" rx="2" />
						<rect x="45" y="50" width="10" height="5" fill="#3F6212" rx="2" />
						<rect x="45" y="65" width="10" height="5" fill="#3F6212" rx="2" />
						<path d="M55 25 C70 15, 75 10, 85 15" stroke="#65A30D" strokeWidth="2" fill="none" />
						<path d="M55 40 C70 30, 75 25, 85 30" stroke="#65A30D" strokeWidth="2" fill="none" />
						<path d="M55 55 C70 45, 75 40, 85 45" stroke="#65A30D" strokeWidth="2" fill="none" />
						<path d="M45 25 C30 15, 25 10, 15 15" stroke="#65A30D" strokeWidth="2" fill="none" />
						<path d="M45 55 C30 45, 25 40, 15 45" stroke="#65A30D" strokeWidth="2" fill="none" />
					</svg>
				);
			case "bonsai":
				return (
					<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
						<rect x="40" y="70" width="20" height="15" fill="#8B4513" rx="2" />
						<rect x="45" y="40" width="10" height="30" fill="#A0522D" />
						<path d="M50 15 C20 40, 30 20, 50 40" stroke="#A0522D" strokeWidth="5" fill="none" />
						<path d="M50 15 C80 40, 70 20, 50 40" stroke="#A0522D" strokeWidth="5" fill="none" />
						<circle cx="50" cy="25" r="20" fill="#228B22" />
						<circle cx="30" cy="30" r="10" fill="#228B22" />
						<circle cx="70" cy="30" r="10" fill="#228B22" />
						<circle cx="40" cy="15" r="8" fill="#228B22" />
						<circle cx="60" cy="15" r="8" fill="#228B22" />
					</svg>
				);
			case "cherry":
				return (
					<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
						<rect x="45" y="60" width="10" height="25" fill="#8B4513" />
						<path d="M50 20 C20 50, 40 20, 50 50" stroke="#8B4513" strokeWidth="4" fill="none" />
						<path d="M50 20 C80 50, 60 20, 50 50" stroke="#8B4513" strokeWidth="4" fill="none" />
						<circle cx="35" cy="25" r="12" fill="#FFB7C5" />
						<circle cx="50" cy="20" r="15" fill="#FFB7C5" />
						<circle cx="65" cy="25" r="12" fill="#FFB7C5" />
						<circle cx="28" cy="35" r="10" fill="#FFB7C5" />
						<circle cx="72" cy="35" r="10" fill="#FFB7C5" />
					</svg>
				);
			case "pine":
				return (
					<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
						<rect x="45" y="60" width="10" height="25" fill="#8B4513" />
						<polygon points="30,60 70,60 50,20" fill="#2D5016" />
						<polygon points="35,50 65,50 50,25" fill="#3A6B1E" />
						<polygon points="38,40 62,40 50,20" fill="#4C8C27" />
					</svg>
				);
			case "grass":
				return (
					<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
						<path d="M30,80 C40,30 45,70 50,30" stroke="#4C8C27" strokeWidth="3" fill="none" />
						<path d="M35,80 C50,35 55,60 60,35" stroke="#65A30D" strokeWidth="3" fill="none" />
						<path d="M40,80 C45,40 50,50 55,25" stroke="#4C8C27" strokeWidth="3" fill="none" />
						<path d="M45,80 C60,40 65,60 70,30" stroke="#65A30D" strokeWidth="3" fill="none" />
						<path d="M50,80 C55,30 60,50 65,25" stroke="#4C8C27" strokeWidth="3" fill="none" />
					</svg>
				);
			case "lantern":
				return (
					<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
						<rect x="40" y="80" width="20" height="5" fill="#7F7F7F" />
						<rect x="30" y="75" width="40" height="5" fill="#7F7F7F" />
						<path d="M35 35 L65 35 L60 75 L40 75 Z" fill="#9F9F9F" />
						<rect x="30" y="30" width="40" height="5" fill="#7F7F7F" />
						<rect x="40" y="20" width="20" height="10" fill="#9F9F9F" />
						<rect x="45" y="15" width="10" height="5" fill="#7F7F7F" />
						<rect x="48" y="10" width="4" height="5" fill="#7F7F7F" />
						<rect x="40" y="45" width="20" height="5" fill="#7F7F7F" opacity="0.5" />
					</svg>
				);
			case "bridge":
				return (
					<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
						<path d="M20,50 C40,30 60,30 80,50" stroke="#8B4513" strokeWidth="5" fill="none" />
						<rect x="20" y="50" width="60" height="5" fill="#A0522D" />
						<rect x="20" y="55" width="5" height="15" fill="#8B4513" />
						<rect x="75" y="55" width="5" height="15" fill="#8B4513" />
						<rect x="30" y="55" width="5" height="10" fill="#8B4513" />
						<rect x="65" y="55" width="5" height="10" fill="#8B4513" />
						<rect x="45" y="55" width="10" height="7" fill="#8B4513" />
					</svg>
				);
			case "pagoda":
				return (
					<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
						<rect x="40" y="70" width="20" height="10" fill="#8B4513" />
						<rect x="35" y="60" width="30" height="10" fill="#A0522D" />
						<path d="M30 60 L70 60 L50 45 Z" fill="#C13B3B" />
						<rect x="40" y="45" width="20" height="8" fill="#A0522D" />
						<path d="M35 45 L65 45 L50 30 Z" fill="#C13B3B" />
						<rect x="45" y="30" width="10" height="5" fill="#A0522D" />
						<path d="M40 30 L60 30 L50 20 Z" fill="#C13B3B" />
					</svg>
				);
			case "sand":
				return (
					<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
						<ellipse cx="50" cy="50" rx="40" ry="25" fill="#E0D2B4" />
						<path d="M20 50 Q35 40, 50 50 Q65 60, 80 50" stroke="#D1C4A8" strokeWidth="2" fill="none" />
						<path d="M20 55 Q35 45, 50 55 Q65 65, 80 55" stroke="#D1C4A8" strokeWidth="2" fill="none" />
						<path d="M20 45 Q35 35, 50 45 Q65 55, 80 45" stroke="#D1C4A8" strokeWidth="2" fill="none" />
					</svg>
				);
			case "water":
				return (
					<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
						<ellipse cx="50" cy="50" rx="35" ry="25" fill="#A5C7D3" />
						<ellipse cx="50" cy="50" rx="30" ry="20" fill="#B9D9E8" />
						<ellipse cx="40" cy="45" rx="5" ry="3" fill="#FFFFFF" opacity="0.6" />
						<ellipse cx="55" cy="60" rx="8" ry="5" fill="#8DB4C2" opacity="0.5" />
						<path d="M30 50 Q40 45, 50 50 Q60 55, 70 50" stroke="#FFFFFF" strokeWidth="1" fill="none" opacity="0.5" />
					</svg>
				);
			case "moss":
				return (
					<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
						<ellipse cx="50" cy="60" rx="35" ry="20" fill="#4B7F52" />
						<ellipse cx="50" cy="60" rx="30" ry="17" fill="#5C9E64" />
						<ellipse cx="35" cy="55" rx="7" ry="4" fill="#76BC7F" opacity="0.7" />
						<ellipse cx="60" cy="65" rx="8" ry="5" fill="#76BC7F" opacity="0.5" />
						<ellipse cx="50" cy="50" rx="5" ry="3" fill="#76BC7F" opacity="0.6" />
					</svg>
				);
			default:
				return null;
		}
	};

	// Get the appropriate overlay style based on time of day
	const getTimeOfDayOverlay = () => {
		switch (atmosphere.timeOfDay) {
			case "day":
				return "brightness(1)";
			case "sunset":
				return "brightness(0.9) sepia(0.3)";
			case "night":
				return "brightness(0.6) saturate(0.8)";
			default:
				return "brightness(1)";
		}
	};

	// Get the appropriate weather effect class
	const weatherEffectComponent =
		atmosphere.weather === "clear" ? null : atmosphere.weather === "rainy" ? (
			<RainEffect />
		) : atmosphere.weather === "snowy" ? (
			<SnowEffect />
		) : atmosphere.weather === "cloudy" ? (
			<CloudEffect />
		) : null;

	// Handle copy/paste functionality
	const handleCopyElement = useCallback(
		(id: string, e?: React.MouseEvent) => {
			if (e) {
				e.stopPropagation();
				e.preventDefault();
			}

			const element = elements.find((el) => el.id === id);
			if (element) {
				setCopiedElement({ ...element });

				// Show feedback briefly
				setShowCopyFeedback(true);
				setTimeout(() => setShowCopyFeedback(false), 1500);
			}
		},
		[elements]
	);

	const handlePasteElement = useCallback(() => {
		if (copiedElement && onElementUpdate) {
			// Create a new element based on the copied one
			const newElement = {
				...copiedElement,
				id: `${copiedElement.id.split("-copy-")[0]}-copy-${Date.now().toString(36)}`, // Generate a unique ID
				position: {
					// Offset the position slightly to make it visible
					x: (copiedElement.position.x + 20) % (canvasBounds.width - 50),
					y: (copiedElement.position.y + 20) % (canvasBounds.height - 50),
				},
			};

			// Check if this ID somehow already exists in our elements
			if (elements.find((el) => el.id === newElement.id)) {
				// If ID already exists, update it
				onElementUpdate(newElement);
			} else {
				// Otherwise it's a new element to add
				onElementUpdate(newElement);

				// After a short delay, select the new element
				setTimeout(() => {
					setSelectedElementId(newElement.id);
				}, 100);
			}
		}
	}, [copiedElement, canvasBounds.width, canvasBounds.height, onElementUpdate, elements]);

	// Handle keyboard shortcuts for copy/paste
	useEffect(() => {
		if (readonly) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			// Check if we're in an input field or textarea
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
				return;
			}

			// Copy: Ctrl+C or Cmd+C
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c" && selectedElementId) {
				const element = elements.find((el) => el.id === selectedElementId);
				if (element) {
					setCopiedElement({ ...element });
					setShowCopyFeedback(true);
					setTimeout(() => setShowCopyFeedback(false), 1500);
					e.preventDefault(); // Prevent default browser copy behavior
				}
			}

			// Paste: Ctrl+V or Cmd+V
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v" && copiedElement) {
				handlePasteElement();
				e.preventDefault(); // Prevent default browser paste behavior
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [elements, selectedElementId, copiedElement, handlePasteElement, readonly]);

	return (
		<div>
			<div
				ref={canvasRef}
				className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden rounded-lg border border-border touch-none"
				style={{
					cursor: isDragging ? "grabbing" : isResizing ? "nwse-resize" : "default",
					filter: getTimeOfDayOverlay(),
				}}>
				{/* Weather effects */}
				<div className="absolute inset-0 z-10 pointer-events-none">{weatherEffectComponent}</div>

				{/* Render all garden elements */}
				{elements.map((element) => {
					// Get position either from our local state (for immediate updates) or from the element
					const position = elementPositions.get(element.id) || element.position;
					const scale = elementScales.get(element.id) || element.scale;
					const baseSize = 100;
					const size = baseSize * scale;

					return (
						<div
							key={element.id}
							className="absolute z-10"
							style={{
								transform: `translate(${position.x}px, ${position.y}px)`,
								zIndex: element.id === selectedElementId ? 100 : element.zIndex || 1,
								cursor: isDragging && draggedElement === element.id ? "grabbing" : "grab",
								transition: (isDragging && draggedElement === element.id) || (isResizing && draggedElement === element.id) ? "none" : "transform 0.1s ease-out",
								touchAction: "none", // Disable browser touch actions for better touch support
							}}>
							{/* Element Image with outline */}
							<div
								style={{
									width: size,
									height: size,
									transform: `rotate(${element.rotation}deg)`,
									position: "relative",
									boxSizing: "border-box",
									border: element.id === selectedElementId ? "2px dashed var(--primary)" : "none",
									borderRadius: "4px",
									boxShadow: element.id === selectedElementId ? "0 0 0 1px rgba(0,0,0,0.05), 0 0 0 4px rgba(var(--primary), 0.15)" : "none",
								}}>
								<div className="relative w-full h-full">{renderElementSVG(element.type)}</div>

								{/* Resize regions - only show for selected element when not readonly */}
								{element.id === selectedElementId && !readonly && (
									<>
										{/* Corner resize region */}
										<div
											className="resize-handle absolute bottom-0 right-0 w-8 h-8 bg-transparent hover:bg-primary/25 transition-colors duration-150 z-10 cursor-nwse-resize rounded-br-sm"
											data-element-id={element.id}
											data-direction="corner"
										/>

										{/* Right edge resize region */}
										<div
											className="resize-handle absolute top-0 right-0 w-5 h-full bg-transparent hover:bg-primary/25 transition-colors duration-150 z-10 cursor-ew-resize"
											data-element-id={element.id}
											data-direction="right"
										/>

										{/* Bottom edge resize region */}
										<div
											className="resize-handle absolute bottom-0 left-0 h-5 w-full bg-transparent hover:bg-primary/25 transition-colors duration-150 z-10 cursor-ns-resize"
											data-element-id={element.id}
											data-direction="bottom"
										/>

										{/* Left edge resize region */}
										<div
											className="resize-handle absolute top-0 left-0 w-5 h-full bg-transparent hover:bg-primary/25 transition-colors duration-150 z-10 cursor-ew-resize"
											data-element-id={element.id}
											data-direction="left"
										/>

										{/* Top edge resize region */}
										<div
											className="resize-handle absolute top-0 left-0 h-5 w-full bg-transparent hover:bg-primary/25 transition-colors duration-150 z-10 cursor-ns-resize"
											data-element-id={element.id}
											data-direction="top"
										/>
									</>
								)}
							</div>

							{/* Controls - only show when selected */}
							{element.id === selectedElementId && !readonly && (
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
											handleRotate(element.id, 45);
										}}
										aria-label="Rotate right">
										<RotateRightIcon className="h-4 w-4" />
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
										className="p-1 hover:bg-muted relative"
										onMouseDown={(e) => {
											e.stopPropagation();
											e.preventDefault();
											handleCopyElement(element.id, e);
										}}
										aria-label="Copy">
										<CopyIcon className="h-4 w-4" />
									</button>

									<button
										type="button"
										className="p-1 hover:bg-muted text-destructive"
										onMouseDown={(e) => {
											e.stopPropagation();
											e.preventDefault();
											if (onElementRemove) {
												onElementRemove(element.id);
											}
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

			{/* Copy feedback toast notification */}
			{showCopyFeedback && (
				<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-card border border-border px-4 py-2 rounded-md shadow-md z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
					<CopyIcon className="h-4 w-4 text-primary" />
					<span className="text-sm font-medium">Element copied! Press Ctrl+V to paste</span>
				</div>
			)}
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

// Add the CopyIcon component along with the other icons
function CopyIcon(props: React.SVGProps<SVGSVGElement>) {
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
			<rect x="8" y="8" width="12" height="12" rx="2" ry="2"></rect>
			<path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path>
		</svg>
	);
}

const RainEffect = React.memo(function RainEffect() {
	return (
		<div className="absolute inset-0 bg-blue-900/10 pointer-events-none">
			{/* Rain drops falling */}
			{Array.from({ length: 35 }).map((_, i) => {
				// Pre-calculate random values to avoid regeneration on re-renders
				const randLeft = (i * 2.87) % 100;
				const randTop = i % 10;
				const randY = 30 + ((i * 1.7) % 50);
				const randX = ((i % 11) - 5) * 3;
				const randDuration = 1.2 + (i % 7) * 0.1;
				const randDelay = (i % 5) * 0.4;

				return (
					<motion.div
						key={`rain-${i}`}
						className="absolute w-[1px] h-[7px] bg-blue-200/70"
						style={{
							left: `${randLeft}%`,
							top: `-${randTop}px`,
						}}
						animate={{
							y: `${randY}vh`,
							x: `${randX}px`,
							opacity: [0.8, 0.6, 0.4],
						}}
						transition={{
							duration: randDuration,
							repeat: Infinity,
							ease: "easeIn",
							delay: randDelay,
							times: [0, 0.7, 1],
							repeatDelay: (i % 3) * 0.1,
						}}
					/>
				);
			})}

			{/* Water ripples/pools at the bottom */}
			<div className="absolute bottom-0 left-0 right-0 h-[30px] overflow-hidden">
				{Array.from({ length: 12 }).map((_, i) => {
					const randWidth = 8 + (i % 8) * 2;
					const randLeft = (i * 8.33) % 100;
					const randBottom = i % 10;
					const randDuration = 1.5 + (i % 5) * 0.2;
					const randDelay = (i * 0.42) % 5;

					return (
						<motion.div
							key={`pool-${i}`}
							className="absolute rounded-full bg-blue-200/20"
							style={{
								width: `${randWidth}px`,
								height: `${randWidth}px`,
								left: `${randLeft}%`,
								bottom: `${randBottom}px`,
							}}
							initial={{ scale: 0, opacity: 0.7 }}
							animate={{
								scale: [0, 1.5, 2],
								opacity: [0.7, 0.5, 0],
							}}
							transition={{
								duration: randDuration,
								repeat: Infinity,
								delay: randDelay,
								times: [0, 0.4, 1],
								ease: "easeOut",
							}}
						/>
					);
				})}
				{/* Water puddle base */}
				<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-200/30 to-blue-200/5 h-[15px]"></div>
			</div>
		</div>
	);
});

const SnowEffect = React.memo(function SnowEffect() {
	return (
		<div className="absolute inset-0 bg-blue-100/5 pointer-events-none">
			{/* Snowflakes falling */}
			{Array.from({ length: 35 }).map((_, i) => {
				// Pre-calculate random values to avoid regeneration on re-renders
				const randWidth = 2 + (i % 5) * 0.6;
				const randLeft = (i * 2.87) % 100;
				const randY = 50 + ((i * 1.5) % 40);
				const randDuration = 5 + (i % 8);
				const randDelay = (i * 0.8) % 5;
				const sinOffset = i % 2 === 0 ? 60 * Math.sin(i * 0.5) : 45 * Math.cos(i * 0.5);

				return (
					<motion.div
						key={`snow-${i}`}
						className="absolute rounded-full bg-white/80"
						style={{
							width: `${randWidth}px`,
							height: `${randWidth}px`,
							left: `${randLeft}%`,
							top: `-${i % 10}px`,
							filter: "blur(0.2px)",
						}}
						animate={{
							y: `${randY}vh`,
							x: `calc(${i % 10}% + ${sinOffset}px)`,
							rotate: 360,
							opacity: [0.9, 0.8, 0.7],
						}}
						transition={{
							duration: randDuration,
							repeat: Infinity,
							ease: [0.1, 0.3, 0.9, 0.1],
							delay: randDelay,
							repeatDelay: (i % 5) * 0.1,
						}}
					/>
				);
			})}

			{/* Snow accumulation at the bottom */}
			<div className="absolute bottom-0 left-0 right-0 overflow-hidden">
				{/* Snow drifts (uneven snow piles) */}
				<svg width="100%" height="30" viewBox="0 0 1000 30" preserveAspectRatio="none">
					<path
						d="M0,30 Q50,10 100,20 Q150,30 200,15 Q250,5 300,25 Q350,15 400,20 Q450,10 500,25 Q550,15 600,20 Q650,5 700,15 Q750,25 800,10 Q850,20 900,25 Q950,15 1000,20 L1000,30 L0,30 Z"
						fill="rgba(255, 255, 255, 0.3)"
					/>
					<path
						d="M0,30 Q70,20 140,25 Q210,15 280,20 Q350,25 420,15 Q490,25 560,20 Q630,15 700,25 Q770,15 840,20 Q910,25 1000,15 L1000,30 L0,30 Z"
						fill="rgba(255, 255, 255, 0.5)"
					/>
				</svg>

				{/* Occasional snowflake landing animation */}
				{Array.from({ length: 8 }).map((_, i) => {
					const randWidth = 3 + (i % 4);
					const randLeft = (i * 12.5) % 100;
					const randBottom = 4 + ((i * 1.9) % 15);
					const randDuration = 1.2 + (i % 4) * 0.2;
					const randDelay = i * 1.3;
					const randRepeatDelay = i % 8;

					return (
						<motion.div
							key={`snowland-${i}`}
							className="absolute rounded-full bg-white/40"
							style={{
								width: `${randWidth}px`,
								height: `${randWidth}px`,
								left: `${randLeft}%`,
								bottom: `${randBottom}px`,
							}}
							initial={{ scale: 0, opacity: 0 }}
							animate={{
								scale: [0, 1.2, 1],
								opacity: [0, 0.7, 0.5],
							}}
							transition={{
								duration: randDuration,
								repeat: Infinity,
								delay: randDelay,
								times: [0, 0.3, 1],
								ease: "easeOut",
								repeatDelay: randRepeatDelay,
							}}
						/>
					);
				})}
			</div>
		</div>
	);
});

const CloudEffect = React.memo(function CloudEffect() {
	return (
		<div className="absolute inset-0 bg-gray-400/5 pointer-events-none">
			{/* Larger slower clouds at the top */}
			{Array.from({ length: 10 }).map((_, i) => {
				const yPos = Math.floor(Math.random() * i);
				const xPos = i * 10;
				const opacity = 0.3 + (i % 3) * 0.05;
				const scale = 1.2 + (i % 3) * 0.15;
				const width = 150 + (i % 3) * 20;
				const height = 80 + (i % 3) * 10;
				const duration = 240 + i * 20;

				return (
					<motion.div
						key={`cloud-top-${i}`}
						className="absolute bg-white/40 rounded-[50%]"
						style={{
							width: `${width}px`,
							height: `${height}px`,
							top: `${yPos}%`,
							left: `${xPos}%`,
							filter: "blur(3px)",
						}}
						initial={{
							opacity: opacity,
							scale: scale,
						}}
						animate={{
							x: "100%",
						}}
						transition={{
							duration: duration,
							repeat: Infinity,
							repeatType: "loop",
							ease: "linear",
						}}
					/>
				);
			})}

			{/* Cloud clusters with compound shapes for more natural look */}
			{Array.from({ length: 5 }).map((_, i) => {
				// Position in the top 25% of the screen
				const yPos = 5 + i * 4;
				const xPos = 10 + i * 30;
				const baseDelay = i * 25;
				const baseDuration = 240 + i * 30;

				return (
					<div key={`cloud-cluster-${i}`} className="absolute" style={{ top: `${yPos}%`, left: `${xPos}%` }}>
						{/* Main cloud body */}
						<motion.div
							className="absolute bg-white/40 rounded-full w-[70px] h-[45px]"
							style={{ filter: "blur(2px)" }}
							initial={{ x: -350 }}
							animate={{ x: "120vw" }}
							transition={{
								duration: baseDuration,
								repeat: Infinity,
								repeatType: "loop",
								delay: baseDelay,
								ease: "linear",
							}}
						/>
						{/* Cloud puff 1 */}
						<motion.div
							className="absolute bg-white/30 rounded-full w-[55px] h-[40px] left-[40px] top-[-10px]"
							style={{ filter: "blur(2px)" }}
							initial={{ x: -350 }}
							animate={{ x: "120vw" }}
							transition={{
								duration: baseDuration,
								repeat: Infinity,
								repeatType: "loop",
								delay: baseDelay,
								ease: "linear",
							}}
						/>
						{/* Cloud puff 2 */}
						<motion.div
							className="absolute bg-white/35 rounded-full w-[60px] h-[35px] left-[25px] top-[5px]"
							style={{ filter: "blur(2px)" }}
							initial={{ x: -350 }}
							animate={{ x: "120vw" }}
							transition={{
								duration: baseDuration,
								repeat: Infinity,
								repeatType: "loop",
								delay: baseDelay,
								ease: "linear",
							}}
						/>
						{/* Cloud puff 3 - adds more complexity */}
						<motion.div
							className="absolute bg-white/25 rounded-full w-[40px] h-[30px] left-[15px] top-[-5px]"
							style={{ filter: "blur(2px)" }}
							initial={{ x: -350 }}
							animate={{ x: "120vw" }}
							transition={{
								duration: baseDuration,
								repeat: Infinity,
								repeatType: "loop",
								delay: baseDelay,
								ease: "linear",
							}}
						/>
					</div>
				);
			})}

			{/* Medium clouds in middle-top area */}
			{Array.from({ length: 3 }).map((_, i) => {
				// Position in 5-20% range of the screen
				const yPos = 5 + i * 5;
				const opacity = 0.15 + i * 0.07;
				const scale = 0.9 + (i % 3) * 0.1;
				const duration = 180 - i * 15;
				const delay = 240 + i * 40;

				return (
					<motion.div
						key={`cloud-mid-${i}`}
						className="absolute rounded-full"
						style={{
							top: `${yPos}%`,
							width: "100px",
							height: "60px",
							background: "linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)",
							filter: "blur(1.5px)",
						}}
						initial={{
							x: -150,
							opacity: opacity,
							scale: scale,
						}}
						animate={{
							x: `${120}%`,
						}}
						transition={{
							duration: duration,
							repeat: Infinity,
							repeatType: "loop",
							delay: delay,
							ease: "linear",
						}}
					/>
				);
			})}

			{/* Small distant clouds */}
			{Array.from({ length: 4 }).map((_, i) => {
				// Position in 0-15% range of the screen
				const yPos = i * 4;
				const opacity = 0.1 + (i % 4) * 0.03;
				const scale = 0.6 + (i % 4) * 0.08;
				const duration = 160 + i * 30;
				const delay = 240 + i * 40;

				return (
					<motion.div
						key={`cloud-small-${i}`}
						className="absolute"
						style={{
							top: `${yPos}%`,
							width: "70px",
							height: "40px",
							borderRadius: "50px 50px 30px 30px",
							background: "linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)",
							filter: "blur(1px)",
						}}
						initial={{
							x: -100,
							opacity: opacity,
							scale: scale,
						}}
						animate={{
							x: `${120}%`,
						}}
						transition={{
							duration: duration,
							repeat: Infinity,
							repeatType: "loop",
							delay: delay,
							ease: "linear",
						}}
					/>
				);
			})}
		</div>
	);
});
