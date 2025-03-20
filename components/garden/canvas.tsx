"use client";

import { GardenElement } from "@/lib/types";
import { motion } from "motion/react";
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
	const [canvasBounds, setCanvasBounds] = useState({ width: 0, height: 0 });

	// Improved canvas bounds calculation with ResizeObserver for better performance
	useEffect(() => {
		if (!canvasRef.current) return;

		const updateBounds = () => {
			if (canvasRef.current) {
				const { width, height } = canvasRef.current.getBoundingClientRect();
				// Only update if values actually changed
				setCanvasBounds((prev) => {
					if (Math.abs(prev.width - width) > 1 || Math.abs(prev.height - height) > 1) {
						return { width, height };
					}
					return prev;
				});
			}
		};

		// Initial measurement
		updateBounds();

		// Use ResizeObserver for more efficient size tracking
		const resizeObserver = new ResizeObserver(updateBounds);
		resizeObserver.observe(canvasRef.current);

		return () => {
			if (canvasRef.current) {
				resizeObserver.unobserve(canvasRef.current);
			}
			resizeObserver.disconnect();
		};
	}, []);

	// Pass canvasRef through to parent component if needed
	useEffect(() => {
		if (ref && typeof ref === "function") {
			ref(canvasRef.current);
		} else if (ref) {
			ref.current = canvasRef.current;
		}
	}, [ref]);

	// Handle selection of element with better click behavior
	const handleElementSelect = (id: string) => {
		setSelectedElementId((current) => (current === id ? null : id));
	};

	// Handle drag end to update position
	const handleDragEnd = (id: string, position: { x: number; y: number }) => {
		const element = elements.find((el) => el.id === id);
		if (element) {
			onElementUpdate({
				...element,
				position,
			});
		}
	};

	// Handle rotation of element
	const handleRotate = (id: string, change: number) => {
		const element = elements.find((el) => el.id === id);
		if (element) {
			onElementUpdate({
				...element,
				rotation: (element.rotation + change) % 360,
			});
		}
	};

	// Handle scaling of element
	const handleScale = (id: string, change: number) => {
		const element = elements.find((el) => el.id === id);
		if (element) {
			const oldScale = element.scale;
			const newScale = Math.max(0.5, Math.min(2, element.scale + change));

			// Calculate position adjustment to keep element centered as it scales
			const baseSize = 100;
			const oldSize = baseSize * oldScale;
			const newSize = baseSize * newScale;
			const sizeChange = (newSize - oldSize) / 2;

			// Adjust position to maintain center
			const newPosition = {
				x: Math.max(0, Math.min(element.position.x - sizeChange, canvasBounds.width - newSize)),
				y: Math.max(0, Math.min(element.position.y - sizeChange, canvasBounds.height - newSize)),
			};

			onElementUpdate({
				...element,
				scale: newScale,
				position: newPosition,
			});
		}
	};

	return (
		<div
			ref={canvasRef}
			className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden rounded-lg border border-border"
			style={{
				backgroundImage: `url(${background})`,
				backgroundSize: "cover",
				backgroundPosition: "center",
			}}
			onClick={() => setSelectedElementId(null)}>
			{/* Garden Elements */}
			{elements.map((element) => (
				<DraggableElement
					key={element.id}
					element={element}
					canvasBounds={canvasBounds}
					isSelected={element.id === selectedElementId}
					onSelect={handleElementSelect}
					onDragEnd={handleDragEnd}
					onRotate={handleRotate}
					onScale={handleScale}
					onRemove={onElementRemove}
				/>
			))}

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
	);
});

interface DraggableElementProps {
	element: GardenElement;
	canvasBounds: { width: number; height: number };
	isSelected: boolean;
	onSelect: (id: string) => void;
	onDragEnd: (id: string, position: { x: number; y: number }) => void;
	onRotate: (id: string, change: number) => void;
	onScale: (id: string, change: number) => void;
	onRemove: (id: string) => void;
}

function DraggableElement({ element, canvasBounds, isSelected, onSelect, onDragEnd, onRotate, onScale, onRemove }: DraggableElementProps) {
	// Calculate element size based on scale
	const baseSize = 100;
	const size = baseSize * element.scale;

	// Track the current position during drag for smooth performance
	const [position, setPosition] = useState(element.position);

	// Update local position when element props change
	useEffect(() => {
		setPosition(element.position);
	}, [element.position]);

	// Handle component drag without any special constraints
	const handleDrag = (_, info) => {
		// Update position in state for immediate visual feedback
		setPosition((prevPos) => ({
			x: Math.max(0, Math.min(prevPos.x + info.delta.x, canvasBounds.width - size)),
			y: Math.max(0, Math.min(prevPos.y + info.delta.y, canvasBounds.height - size)),
		}));
	};

	// Apply the final position on drag end
	const handleDragEnd = () => {
		onDragEnd(element.id, position);
	};

	return (
		<motion.div
			className="absolute flex items-center justify-center cursor-move touch-none"
			style={{
				left: position.x,
				top: position.y,
				zIndex: isSelected ? 100 : element.zIndex || 1,
			}}
			drag
			dragMomentum={false}
			layout={false}
			initial={false}
			dragElastic={0}
			whileDrag={{ scale: 1.02 }}
			onDrag={handleDrag}
			onDragEnd={handleDragEnd}
			onClick={(e) => {
				e.stopPropagation();
				onSelect(element.id);
			}}
			whileTap={{ scale: 0.98 }}>
			{/* Element Image */}
			<motion.div
				className="relative"
				animate={{
					rotate: element.rotation,
				}}
				style={{
					width: size,
					height: size,
				}}>
				<Image
					src={element.imagePath}
					alt={element.name}
					fill
					style={{ objectFit: "contain", userSelect: "none", pointerEvents: "none" }}
					draggable={false}
					unoptimized
				/>
			</motion.div>

			{/* Controls - only show when selected */}
			{isSelected && (
				<div
					className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex items-center bg-card border border-border rounded-md shadow-md"
					onClick={(e) => e.stopPropagation()}>
					<button className="p-1 hover:bg-muted" onClick={() => onRotate(element.id, -45)} aria-label="Rotate left">
						<RotateLeftIcon className="h-4 w-4" />
					</button>

					<button className="p-1 hover:bg-muted" onClick={() => onScale(element.id, -0.1)} aria-label="Scale down">
						<MinusIcon className="h-4 w-4" />
					</button>

					<button className="p-1 hover:bg-muted" onClick={() => onScale(element.id, 0.1)} aria-label="Scale up">
						<PlusIcon className="h-4 w-4" />
					</button>

					<button className="p-1 hover:bg-muted" onClick={() => onRotate(element.id, 45)} aria-label="Rotate right">
						<RotateRightIcon className="h-4 w-4" />
					</button>

					<button className="p-1 hover:bg-muted text-destructive" onClick={() => onRemove(element.id)} aria-label="Remove">
						<XIcon className="h-4 w-4" />
					</button>
				</div>
			)}
		</motion.div>
	);
}

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
