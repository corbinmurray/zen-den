"use client";

import { ElementOption } from "@/lib/types";
import { motion } from "motion/react";
import { useState } from "react";

// Sample elements with SVG-based images
const ELEMENT_OPTIONS: ElementOption[] = [
	// Rocks
	{
		type: "rock",
		name: "Smooth Rock",
		imagePath: "#rock",
		preview: "#rock-preview",
		category: "rocks",
	},
	{
		type: "rock-flat",
		name: "Flat Stone",
		imagePath: "#rock-flat",
		preview: "#rock-flat-preview",
		category: "rocks",
	},
	{
		type: "rock-tall",
		name: "Standing Stone",
		imagePath: "#rock-tall",
		preview: "#rock-tall-preview",
		category: "rocks",
	},

	// Plants
	{
		type: "bamboo",
		name: "Bamboo",
		imagePath: "#bamboo",
		preview: "#bamboo-preview",
		category: "plants",
	},
	{
		type: "bonsai",
		name: "Bonsai Tree",
		imagePath: "#bonsai",
		preview: "#bonsai-preview",
		category: "plants",
	},
	{
		type: "cherry",
		name: "Cherry Tree",
		imagePath: "#cherry",
		preview: "#cherry-preview",
		category: "plants",
	},
	{
		type: "pine",
		name: "Pine Tree",
		imagePath: "#pine",
		preview: "#pine-preview",
		category: "plants",
	},
	{
		type: "grass",
		name: "Tall Grass",
		imagePath: "#grass",
		preview: "#grass-preview",
		category: "plants",
	},

	// Decorations
	{
		type: "lantern",
		name: "Stone Lantern",
		imagePath: "#lantern",
		preview: "#lantern-preview",
		category: "decorations",
	},
	{
		type: "bridge",
		name: "Small Bridge",
		imagePath: "#bridge",
		preview: "#bridge-preview",
		category: "decorations",
	},
	{
		type: "pagoda",
		name: "Mini Pagoda",
		imagePath: "#pagoda",
		preview: "#pagoda-preview",
		category: "decorations",
	},

	// Features
	{
		type: "sand",
		name: "Sand Patch",
		imagePath: "#sand",
		preview: "#sand-preview",
		category: "features",
	},
	{
		type: "water",
		name: "Water Feature",
		imagePath: "#water",
		preview: "#water-preview",
		category: "features",
	},
	{
		type: "moss",
		name: "Moss Patch",
		imagePath: "#moss",
		preview: "#moss-preview",
		category: "features",
	},
];

// Category order and labels
const CATEGORIES = [
	{ id: "all", label: "All Elements" },
	{ id: "rocks", label: "Rocks & Stones" },
	{ id: "plants", label: "Plants & Trees" },
	{ id: "decorations", label: "Decorations" },
	{ id: "features", label: "Features" },
];

interface ElementPanelProps {
	onAddElement: (element: ElementOption) => void;
}

export function ElementPanel({ onAddElement }: ElementPanelProps) {
	const [selectedCategory, setSelectedCategory] = useState<string>("all");
	const [addedElement, setAddedElement] = useState<string | null>(null);
	const [addInProgress, setAddInProgress] = useState(false);

	// Filter elements based on category if needed
	const displayedElements = selectedCategory === "all" ? ELEMENT_OPTIONS : ELEMENT_OPTIONS.filter((el) => el.category === selectedCategory);

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

	return (
		<div className="space-y-4">
			{/* Category tabs */}
			<div className="flex flex-wrap gap-1 mb-4">
				{CATEGORIES.map((category) => (
					<button
						key={category.id}
						onClick={() => setSelectedCategory(category.id)}
						className={`text-xs px-2 py-1 rounded-md transition-colors ${
							selectedCategory === category.id ? "bg-primary/10 text-primary" : "bg-secondary hover:bg-secondary/80 text-muted"
						}`}>
						{category.label}
					</button>
				))}
			</div>

			{/* Elements grid */}
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
