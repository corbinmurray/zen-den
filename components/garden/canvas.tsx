"use client";

import { AtmosphereSettings, GardenElement } from "@/lib/types";
import * as motion from "motion/react-client";
import { forwardRef, useEffect, useRef, useState } from "react";

interface CanvasProps {
	elements: GardenElement[];
	background: string;
	onElementUpdate: (element: GardenElement) => void;
	onElementRemove: (id: string) => void;
	showOutlines?: boolean;
	atmosphereSettings?: AtmosphereSettings;
	readonly?: boolean;
}

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>(function Canvas(
	{
		elements,
		background,
		onElementUpdate,
		onElementRemove,
		showOutlines = false,
		atmosphereSettings = {
			timeOfDay: "day",
			weather: "clear",
			effects: [],
			effectsIntensity: 50,
		},
		readonly = false,
	},
	ref
) {
	const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
	const canvasRef = useRef<HTMLDivElement>(null);
	const canvasContainerRef = useRef<HTMLDivElement | null>(null);
	const [canvasBounds, setCanvasBounds] = useState({ width: 0, height: 0 });

	// Keep track of the dragging state
	const [isDragging, setIsDragging] = useState(false);
	const [draggedElement, setDraggedElement] = useState<string | null>(null);
	// Add resize dragging state
	const [isResizing, setIsResizing] = useState(false);
	const [resizeDirection, setResizeDirection] = useState<string | null>(null);

	// Store loaded images in a map
	const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

	// Track mouse position for drag operations
	const mousePositionRef = useRef({ x: 0, y: 0 });

	// Track element positions for rendering
	const [elementPositions, setElementPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
	// Track element scales for immediate updates during resize
	const [elementScales, setElementScales] = useState<Map<string, number>>(new Map());

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

		// Initial update
		updateBounds();

		// Create observer
		const resizeObserver = new ResizeObserver(updateBounds);
		resizeObserver.observe(canvasRef.current);

		return () => {
			resizeObserver.disconnect();
		};
	}, [canvasBounds.width, canvasBounds.height]);

	// Initialize element positions and scales
	useEffect(() => {
		const newPositions = new Map();
		const newScales = new Map();
		elements.forEach((element) => {
			newPositions.set(element.id, element.position);
			newScales.set(element.id, element.scale);
		});
		setElementPositions(newPositions);
		setElementScales(newScales);
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
		// No need to preload SVG elements as they're rendered directly
	}, [elements]);

	// Handle mouse events
	useEffect(() => {
		if (!canvasRef.current) return;

		const container = canvasRef.current;
		canvasContainerRef.current = container;

		// Helper function to determine if a point is within the actual visible shape of an element
		const isPointInShape = (elementType: string, x: number, y: number, elementX: number, elementY: number, size: number, rotation: number) => {
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
		};

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
		};

		// Controls click handler
		const handleControlsClick = (e: MouseEvent) => {
			// If the click was on a control element, prevent it from triggering drag
			if ((e.target as HTMLElement).closest(".controls")) {
				e.stopPropagation();
			}
		};

		const handleMouseMove = (e: MouseEvent) => {
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
						case "left":
							scaleChange = deltaX / 100;
							break;
						case "bottom":
						case "top":
							scaleChange = deltaY / 100;
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

					// When resizing, also update the position to keep the element centered
					const baseSize = 100;
					const oldSize = baseSize * oldScale;
					const newSize = baseSize * newScale;
					const sizeChange = (newSize - oldSize) / 2;

					// Get current position
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
			if (isResizing && draggedElement) {
				const element = elements.find((el) => el.id === draggedElement);
				const newScale = elementScales.get(draggedElement);
				const newPosition = elementPositions.get(draggedElement);

				if (element && newScale && newPosition) {
					// Update the element position and scale through the parent callback
					onElementUpdate({
						...element,
						scale: newScale,
						position: newPosition,
					});
				}

				setIsResizing(false);
				setDraggedElement(null);
				setResizeDirection(null);
			} else if (isDragging && draggedElement) {
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
		};

		const handleTouchMove = (e: TouchEvent) => {
			if (e.touches.length === 1) {
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
							case "left":
								scaleChange = deltaX / 100;
								break;
							case "bottom":
							case "top":
								scaleChange = deltaY / 100;
								break;
						}

						const oldScale = elementScales.get(element.id) || element.scale;
						const newScale = Math.max(0.5, Math.min(2, oldScale + scaleChange));

						setElementScales((prevScales) => {
							const newScales = new Map(prevScales);
							newScales.set(element.id, newScale);
							return newScales;
						});

						// Position adjustments for resizing
						const baseSize = 100;
						const oldSize = baseSize * oldScale;
						const newSize = baseSize * newScale;
						const sizeChange = (newSize - oldSize) / 2;

						const currentPos = elementPositions.get(element.id) || element.position;

						const newPosition = {
							x: Math.max(0, Math.min(currentPos.x - sizeChange, canvasBounds.width - newSize)),
							y: Math.max(0, Math.min(currentPos.y - sizeChange, canvasBounds.height - newSize)),
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
			}
		};

		const handleTouchEnd = () => {
			if (isResizing && draggedElement) {
				const element = elements.find((el) => el.id === draggedElement);
				const newScale = elementScales.get(draggedElement);
				const newPosition = elementPositions.get(draggedElement);

				if (element && newScale && newPosition) {
					onElementUpdate({
						...element,
						scale: newScale,
						position: newPosition,
					});
				}

				setIsResizing(false);
				setDraggedElement(null);
				setResizeDirection(null);
			} else if (isDragging && draggedElement) {
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

		// Setup event listeners
		if (canvasContainerRef.current) {
			updateBounds();

			// Only add interactive event listeners if not in readonly mode
			if (!readonly) {
				// Mouse events
				canvasContainerRef.current.addEventListener("mousedown", handleMouseDown);
				canvasContainerRef.current.addEventListener("mousemove", handleMouseMove);
				document.addEventListener("mouseup", handleMouseUp);

				// Touch events for mobile
				canvasContainerRef.current.addEventListener("touchstart", handleTouchStart, { passive: false });
				canvasContainerRef.current.addEventListener("touchmove", handleTouchMove, { passive: false });
				document.addEventListener("touchend", handleTouchEnd);
			}
		}

		// Always add resize event listener, even in readonly mode
		window.addEventListener("resize", updateBounds);

		return () => {
			// Clean up event listeners
			if (canvasContainerRef.current && !readonly) {
				canvasContainerRef.current.removeEventListener("mousedown", handleMouseDown);
				canvasContainerRef.current.removeEventListener("mousemove", handleMouseMove);
				canvasContainerRef.current.removeEventListener("touchstart", handleTouchStart);
				canvasContainerRef.current.removeEventListener("touchmove", handleTouchMove);
			}
			document.removeEventListener("mouseup", handleMouseUp);
			document.removeEventListener("touchend", handleTouchEnd);
			window.removeEventListener("resize", updateBounds);
		};
	}, [
		updateBounds,
		handleMouseDown,
		handleMouseMove,
		handleMouseUp,
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
		readonly, // Make sure useEffect reruns if readonly status changes
	]);

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
		switch (atmosphereSettings.timeOfDay) {
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
	const getWeatherEffect = () => {
		if (atmosphereSettings.weather === "clear") return null;

		return (
			<div className="absolute inset-0 pointer-events-none z-10">
				{atmosphereSettings.weather === "rainy" && (
					<div className="absolute inset-0 bg-blue-900/10 backdrop-blur-[1px]">
						{Array.from({ length: 20 }).map((_, i) => (
							<motion.div
								key={`rain-${i}`}
								className="absolute w-[1px] h-[10px] bg-blue-200/60"
								initial={{
									x: `${Math.random() * 100}%`,
									y: -10,
									opacity: 0.7,
								}}
								animate={{
									y: `${100 + Math.random() * 10}%`,
									opacity: 0.3,
								}}
								transition={{
									duration: 0.8 + Math.random() * 0.6,
									repeat: Infinity,
									delay: Math.random() * 2,
								}}
							/>
						))}
					</div>
				)}

				{atmosphereSettings.weather === "snowy" && (
					<div className="absolute inset-0 bg-blue-100/5 backdrop-blur-[1px]">
						{Array.from({ length: 15 }).map((_, i) => (
							<motion.div
								key={`snow-${i}`}
								className="absolute w-[4px] h-[4px] rounded-full bg-white/80"
								initial={{
									x: `${Math.random() * 100}%`,
									y: -10,
									opacity: 0.9,
								}}
								animate={{
									y: `${100 + Math.random() * 10}%`,
									x: `calc(${Math.random() * 100}% + ${Math.sin(Math.random() * Math.PI * 2) * 50}px)`,
									opacity: 0.7,
								}}
								transition={{
									duration: 6 + Math.random() * 4,
									repeat: Infinity,
									delay: Math.random() * 5,
									ease: "linear",
								}}
							/>
						))}
					</div>
				)}

				{atmosphereSettings.weather === "cloudy" && (
					<div className="absolute inset-0 bg-gray-400/10 backdrop-blur-[1px]">
						{Array.from({ length: 3 }).map((_, i) => (
							<motion.div
								key={`cloud-${i}`}
								className="absolute bg-white/20 rounded-full w-[100px] h-[60px] blur-md"
								initial={{
									x: -100,
									y: 50 + i * 30,
									opacity: 0.2 + i * 0.1,
								}}
								animate={{
									x: `${100 + Math.random() * 10}%`,
								}}
								transition={{
									duration: 90 - i * 10,
									repeat: Infinity,
									repeatType: "loop",
									delay: i * 30,
									ease: "linear",
								}}
							/>
						))}
					</div>
				)}
			</div>
		);
	};

	// Get seasonal effects
	const getSeasonalEffects = () => {
		if (!atmosphereSettings.effects.length) return null;

		const intensity = atmosphereSettings.effectsIntensity / 100; // Convert to 0-1 scale
		const particleCount = Math.floor(15 * intensity);

		return (
			<div className="absolute inset-0 pointer-events-none z-20">
				{atmosphereSettings.effects.includes("leaves") && (
					<div className="absolute inset-0">
						{Array.from({ length: particleCount }).map((_, i) => (
							<motion.div
								key={`leaf-${i}`}
								className="absolute"
								initial={{
									x: `${Math.random() * 100}%`,
									y: -20,
									rotate: Math.random() * 360,
								}}
								animate={{
									y: `${100 + Math.random() * 10}%`,
									x: `calc(${Math.random() * 100}% + ${Math.sin(Math.random() * Math.PI * 2) * 100}px)`,
									rotate: Math.random() * 360 * (Math.random() > 0.5 ? 1 : -1),
								}}
								transition={{
									duration: 10 + Math.random() * 5,
									repeat: Infinity,
									delay: Math.random() * 10,
									ease: "linear",
								}}>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2Z" fill="#DC2626" fillOpacity="0.5" />
									<path d="M12 5C12 5 9 9 9 12C9 15 12 19 12 19C12 19 15 15 15 12C15 9 12 5 12 5Z" fill="#991B1B" fillOpacity="0.8" />
								</svg>
							</motion.div>
						))}
					</div>
				)}

				{atmosphereSettings.effects.includes("blossoms") && (
					<div className="absolute inset-0">
						{Array.from({ length: particleCount }).map((_, i) => (
							<motion.div
								key={`blossom-${i}`}
								className="absolute"
								initial={{
									x: `${Math.random() * 100}%`,
									y: -20,
									rotate: Math.random() * 360,
								}}
								animate={{
									y: `${100 + Math.random() * 10}%`,
									x: `calc(${Math.random() * 100}% + ${Math.sin(Math.random() * Math.PI * 2) * 70}px)`,
									rotate: Math.random() * 360,
								}}
								transition={{
									duration: 8 + Math.random() * 6,
									repeat: Infinity,
									delay: Math.random() * 5,
									ease: "linear",
								}}>
								<svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<circle cx="12" cy="12" r="4" fill="#FDF2F8" />
									<circle cx="12" cy="12" r="2" fill="#FBCFE8" />
								</svg>
							</motion.div>
						))}
					</div>
				)}

				{atmosphereSettings.effects.includes("butterflies") && (
					<div className="absolute inset-0">
						{Array.from({ length: Math.ceil(particleCount / 2) }).map((_, i) => (
							<motion.div
								key={`butterfly-${i}`}
								className="absolute"
								initial={{
									x: `${Math.random() * 100}%`,
									y: `${Math.random() * 100}%`,
									scale: 0.6 + Math.random() * 0.4,
								}}
								animate={{
									x: [`${Math.random() * 90}%`, `${Math.random() * 90}%`, `${Math.random() * 90}%`, `${Math.random() * 90}%`],
									y: [`${Math.random() * 90}%`, `${Math.random() * 90}%`, `${Math.random() * 90}%`, `${Math.random() * 90}%`],
									rotate: Math.random() * 40 - 20,
								}}
								transition={{
									duration: 20,
									times: [0, 0.3, 0.6, 1],
									repeat: Infinity,
									delay: Math.random() * 2,
								}}>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<motion.path
										d="M12 5C8 5 6 8 6 12C6 16 8 19 12 19C16 19 18 16 18 12C18 8 16 5 12 5Z"
										fill="#FBBF24"
										animate={{
											d: [
												"M12 5C8 5 6 8 6 12C6 16 8 19 12 19C16 19 18 16 18 12C18 8 16 5 12 5Z",
												"M12 5C8 7 6 8 6 12C6 16 8 17 12 19C16 17 18 16 18 12C18 8 16 7 12 5Z",
												"M12 5C8 5 6 8 6 12C6 16 8 19 12 19C16 19 18 16 18 12C18 8 16 5 12 5Z",
											],
										}}
										transition={{
											duration: 1,
											repeat: Infinity,
											repeatType: "mirror",
										}}
									/>
								</svg>
							</motion.div>
						))}
					</div>
				)}
			</div>
		);
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
					cursor: isDragging ? "grabbing" : isResizing ? "nwse-resize" : "default",
					filter: getTimeOfDayOverlay(),
				}}>
				{/* Weather effects */}
				{getWeatherEffect()}

				{/* Seasonal effects */}
				{getSeasonalEffects()}

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
							className="absolute"
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
								}}>
								{/* Element outline - only show when selected or explicitly requested */}
								{(showOutlines || element.id === selectedElementId) && (
									<div
										className={`absolute inset-0 ${element.id === selectedElementId ? "border-2" : "border"} ${
											element.id === selectedElementId ? "border-dashed" : "border-dotted"
										} rounded-md pointer-events-none`}
										style={{
											borderColor: element.id === selectedElementId ? "rgba(99, 102, 241, 0.8)" : "rgba(156, 163, 175, 0.3)",
											backgroundColor: element.id === selectedElementId ? "rgba(99, 102, 241, 0.05)" : "transparent",
										}}
									/>
								)}
								<div className="relative w-full h-full">{renderElementSVG(element.type)}</div>

								{/* Resize handles - only show for selected element when not readonly */}
								{element.id === selectedElementId && !readonly && (
									<>
										{/* Corner resize handle */}
										<div
											className="resize-handle absolute bottom-0 right-0 w-6 h-6 bg-primary/20 rounded-br-md border-r border-b border-primary z-10 cursor-nwse-resize"
											data-element-id={element.id}
											data-direction="corner"
										/>

										{/* Right edge resize handle */}
										<div
											className="resize-handle absolute top-1/2 right-0 w-4 h-8 -translate-y-1/2 bg-primary/20 border-r border-primary z-10 cursor-ew-resize"
											data-element-id={element.id}
											data-direction="right"
										/>

										{/* Bottom edge resize handle */}
										<div
											className="resize-handle absolute bottom-0 left-1/2 h-4 w-8 -translate-x-1/2 bg-primary/20 border-b border-primary z-10 cursor-ns-resize"
											data-element-id={element.id}
											data-direction="bottom"
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
