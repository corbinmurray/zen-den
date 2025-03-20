"use client";

import { ElementOption } from "@/lib/types";
import { motion } from "motion/react";
import { useState } from "react";

// Sample elements with SVG-based images
const ELEMENT_OPTIONS: ElementOption[] = [
	{
		type: "rock",
		name: "Smooth Rock",
		imagePath: "#rock", // We'll use SVG components instead
		preview: "#rock-preview",
	},
	{
		type: "bamboo",
		name: "Bamboo",
		imagePath: "#bamboo",
		preview: "#bamboo-preview",
	},
	{
		type: "bonsai",
		name: "Bonsai Tree",
		imagePath: "#bonsai",
		preview: "#bonsai-preview",
	},
	{
		type: "lantern",
		name: "Stone Lantern",
		imagePath: "#lantern",
		preview: "#lantern-preview",
	},
	{
		type: "sand",
		name: "Sand Patch",
		imagePath: "#sand",
		preview: "#sand-preview",
	},
	{
		type: "water",
		name: "Water Feature",
		imagePath: "#water",
		preview: "#water-preview",
	},
];

interface ElementPanelProps {
	onAddElement: (element: ElementOption) => void;
}

export function ElementPanel({ onAddElement }: ElementPanelProps) {
	// Not using category filtering for now, but might in the future
	const [addedElement, setAddedElement] = useState<string | null>(null);
	const [addInProgress, setAddInProgress] = useState(false);

	// Filter elements based on category if needed
	const displayedElements = ELEMENT_OPTIONS;

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

	// Function to render the preview SVG for each element type
	const renderElementPreview = (type: string) => {
		switch (type) {
			case "rock":
				return (
					<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
						<ellipse cx="50" cy="60" rx="40" ry="30" fill="#8B8B8B" />
						<ellipse cx="50" cy="60" rx="30" ry="20" fill="#A3A3A3" />
						<ellipse cx="40" cy="50" rx="10" ry="8" fill="#CFCFCF" opacity="0.6" />
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
			default:
				return null;
		}
	};

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 gap-2">
				{displayedElements.map((element) => (
					<motion.div
						key={element.type}
						className={`flex flex-col items-center p-2 rounded-md bg-background hover:bg-secondary border 
							${addedElement === element.type ? "border-primary shadow-lg" : "border-border"} 
							cursor-pointer relative overflow-hidden`}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => !addInProgress && handleElementClick(element)}
						transition={{ duration: 0.2 }}>
						<div className="relative w-16 h-16 mb-1">
							{renderElementPreview(element.type)}

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
						<div className="absolute top-1 right-1 bg-background/90 rounded-full p-0.5 shadow-sm">
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
		</div>
	);
}
