"use client";

import { ElementOption } from "@/lib/types";
import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

// Sample elements - these would ideally be loaded from a data source
const ELEMENT_OPTIONS: ElementOption[] = [
	{
		type: "rock",
		name: "Smooth Rock",
		imagePath: "/garden-elements/rock.png",
		preview: "/garden-elements/rock-preview.png",
	},
	{
		type: "bamboo",
		name: "Bamboo",
		imagePath: "/garden-elements/bamboo.png",
		preview: "/garden-elements/bamboo-preview.png",
	},
	{
		type: "bonsai",
		name: "Bonsai Tree",
		imagePath: "/garden-elements/bonsai.png",
		preview: "/garden-elements/bonsai-preview.png",
	},
	{
		type: "lantern",
		name: "Stone Lantern",
		imagePath: "/garden-elements/lantern.png",
		preview: "/garden-elements/lantern-preview.png",
	},
	{
		type: "sand",
		name: "Sand Patch",
		imagePath: "/garden-elements/sand.png",
		preview: "/garden-elements/sand-preview.png",
	},
	{
		type: "water",
		name: "Water Feature",
		imagePath: "/garden-elements/water.png",
		preview: "/garden-elements/water-preview.png",
	},
];

interface ElementPanelProps {
	onAddElement: (element: ElementOption) => void;
}

export function ElementPanel({ onAddElement }: ElementPanelProps) {
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [addedElement, setAddedElement] = useState<string | null>(null);
	const [addInProgress, setAddInProgress] = useState(false);

	// Filter elements based on category if needed
	const displayedElements = selectedCategory ? ELEMENT_OPTIONS.filter((el) => el.type === selectedCategory) : ELEMENT_OPTIONS;

	const handleElementClick = (element: ElementOption) => {
		// Enhanced visual feedback during addition
		setAddInProgress(true);
		setAddedElement(element.type);

		// Add the element to the garden
		onAddElement(element);

		// Reset states after animation period
		setTimeout(() => {
			setAddInProgress(false);
			setTimeout(() => setAddedElement(null), 300);
		}, 300);
	};

	return (
		<div>
			<h3 className="text-lg font-medium mb-3">Garden Elements</h3>

			<div className="grid grid-cols-2 gap-2">
				{displayedElements.map((element) => (
					<motion.div
						key={element.type}
						className={`flex flex-col items-center p-2 rounded-md bg-background hover:bg-muted border 
							${addedElement === element.type ? "border-primary shadow-lg" : "border-border"} 
							cursor-pointer relative overflow-hidden`}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => !addInProgress && handleElementClick(element)}
						transition={{ duration: 0.2 }}>
						<div className="relative w-16 h-16 mb-1">
							<Image
								src={element.preview}
								alt={element.name}
								fill
								style={{
									objectFit: "contain",
									transform: addedElement === element.type ? "scale(1.1)" : "scale(1)",
									transition: "transform 0.2s ease-out",
								}}
							/>

							{/* Enhanced animation for element being added */}
							{addedElement === element.type && (
								<>
									<motion.div
										className="absolute inset-0 bg-primary/15 rounded-md"
										initial={{ opacity: 0.8 }}
										animate={{ opacity: 0 }}
										transition={{ duration: 0.7 }}
									/>
									<motion.div
										className="absolute inset-0 border-2 border-primary rounded-md"
										initial={{ opacity: 0.8 }}
										animate={{ opacity: 0 }}
										transition={{ duration: 0.5 }}
									/>
								</>
							)}
						</div>
						<span className="text-xs text-center">{element.name}</span>

						{/* Add indicator for adding functionality */}
						<div className="absolute top-1 right-1 bg-background/90 backdrop-blur-[2px] rounded-full p-0.5 shadow-sm">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="10"
								height="10"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="text-primary">
								<path d="M5 12h14" />
								<path d="M12 5v14" />
							</svg>
						</div>
					</motion.div>
				))}
			</div>

			<div className="mt-4 p-3 bg-card/50 border border-border rounded-md">
				<div className="flex items-start gap-2 text-xs text-muted">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="mt-0.5 shrink-0">
						<circle cx="12" cy="12" r="10" />
						<path d="M12 16v-4" />
						<path d="M12 8h.01" />
					</svg>
					<div>
						<p className="mb-1.5">Click any element to add it to your zen garden.</p>
						<p>Once added, you can drag to position elements naturally within the canvas.</p>
					</div>
				</div>
			</div>
		</div>
	);
}
