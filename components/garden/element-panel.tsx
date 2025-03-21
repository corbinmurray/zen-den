"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ElementOption, GardenItem } from "@/lib/types";
import { Pencil, Search, Trash } from "lucide-react";
import { motion } from "motion/react";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CustomElementCreator } from "./custom-element-creator";

interface ElementPanelProps {
	onAddElement: (element: GardenItem) => void;
}

export function ElementPanel({ onAddElement }: ElementPanelProps) {
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
	const [addedElement, setAddedElement] = useState<string | null>(null);
	const [addInProgress, setAddInProgress] = useState(false);
	const [customElements, setCustomElements] = useState<ElementOption[]>([]);
	const [dialogOpen, setDialogOpen] = useState(false);

	// Load custom elements from local storage on component mount
	useEffect(() => {
		try {
			const storedElements = localStorage.getItem("zenCustomElements");
			if (storedElements) {
				setCustomElements(JSON.parse(storedElements));
			}
		} catch (error) {
			console.error("Failed to load custom elements:", error);
		}
	}, []);

	// Debounce search term to improve performance
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 300);

		return () => clearTimeout(timer);
	}, [searchTerm]);

	const filteredStandardElements = ELEMENT_OPTIONS.filter((el) => el.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));

	const filteredCustomElements = customElements.filter((el) => el.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));

	const allElements = [...filteredStandardElements, ...filteredCustomElements];

	const handleElementClick = (element: ElementOption) => {
		setAddInProgress(true);
		setAddedElement(element.type);

		const gardenItem: GardenItem = {
			id: nanoid(),
			type: element.type,
			name: element.name,
			imagePath: element.imagePath,
			position: { x: Math.random() * 300, y: Math.random() * 300 },
			rotation: 0,
			scale: 1,
			zIndex: Date.now(),
		};

		onAddElement(gardenItem);

		setTimeout(() => {
			setAddInProgress(false);
			setTimeout(() => setAddedElement(null), 300);
		}, 300);
	};

	// Handle saving a custom element
	const handleSaveCustomElement = (element: ElementOption) => {
		const updatedElements = [...customElements, element];
		setCustomElements(updatedElements);

		try {
			localStorage.setItem("zenCustomElements", JSON.stringify(updatedElements));
		} catch (error) {
			console.error("Failed to save custom element:", error);
		}

		const gardenItem: GardenItem = {
			id: nanoid(),
			type: element.type,
			name: element.name,
			imagePath: element.imagePath,
			position: { x: Math.random() * 300, y: Math.random() * 300 },
			rotation: 0,
			scale: 1,
			zIndex: Date.now(),
		};

		onAddElement(gardenItem);
		setDialogOpen(false);
	};

	// Handle deleting a custom element
	const handleDeleteCustomElement = (elementType: string, event: React.MouseEvent) => {
		event.stopPropagation();

		toast.warning("Delete element?", {
			description: "Are you sure you want to delete this custom element?",
			action: {
				label: "Delete",
				onClick: () => {
					const updatedElements = customElements.filter((el) => el.type !== elementType);
					setCustomElements(updatedElements);

					// Update local storage
					try {
						localStorage.setItem("zenCustomElements", JSON.stringify(updatedElements));
						toast.success("Element deleted", {
							description: "Custom element has been removed.",
						});
					} catch (error) {
						console.error("Failed to update custom elements:", error);
						toast.error("Delete failed", {
							description: "Failed to remove the element. Please try again.",
						});
					}
				},
			},
			cancel: {
				label: "Cancel",
				onClick: () => {},
			},
		});
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
						<rect x="45" y="50" width="10" height="35" fill="#8B4513" />
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
				return (
					<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
						<line x1="30" y1="30" x2="70" y2="70" stroke="#A0522D" strokeWidth="3" />
						<line x1="30" y1="70" x2="40" y2="60" stroke="#A0522D" strokeWidth="3" />
						<line x1="40" y1="60" x2="50" y2="50" stroke="#A0522D" strokeWidth="3" />
						<line x1="50" y1="50" x2="60" y2="40" stroke="#A0522D" strokeWidth="3" />
						<line x1="60" y1="40" x2="70" y2="30" stroke="#A0522D" strokeWidth="3" />
					</svg>
				);
			case "incense":
				return (
					<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
						<rect x="40" y="70" width="20" height="10" rx="2" fill="#7F7F7F" />
						<line x1="50" y1="70" x2="50" y2="30" stroke="#7F3F00" strokeWidth="2" />
						<ellipse cx="50" cy="30" rx="2" ry="2" fill="#FF6D00" />
						<path d="M50,30 C47,25 48,20 50,15 C52,20 53,25 50,30" fill="none" stroke="#AAAAAA" strokeWidth="1" strokeDasharray="2,2" />
					</svg>
				);
			case "meditation-stone":
				return (
					<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
						<ellipse cx="50" cy="75" rx="40" ry="5" fill="#5D5D5D" opacity="0.3" />
						<ellipse cx="50" cy="45" rx="25" ry="10" fill="#9E9E9E" />
						<ellipse cx="50" cy="35" rx="15" ry="8" fill="#7D7D7D" />
						<ellipse cx="50" cy="28" rx="10" ry="5" fill="#ABABAB" />
					</svg>
				);
				return (
					<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
						<rect x="45" y="60" width="10" height="25" fill="#8B4513" />
						<path d="M50 20 C20 50, 40 20, 50 50" stroke="#8B4513" strokeWidth="4" fill="none" />
						<path d="M50 20 C80 50, 60 20, 50 50" stroke="#8B4513" strokeWidth="4" fill="none" />
						<path d="M30,30 L40,25 L50,30 L60,25 L70,30 L60,35 L70,40 L60,45 L50,40 L40,45 L30,40 L40,35 Z" fill="#E64C3C" />
					</svg>
				);
			case "bell":
				return (
					<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
						<path d="M45,30 C45,25 55,25 55,30 L55,35 L45,35 Z" fill="#CD9B1D" />
						<path d="M40,35 L60,35 L58,60 C58,70 42,70 42,60 Z" fill="#F0C420" />
						<circle cx="50" cy="65" r="3" fill="#CD9B1D" />
						<rect x="48" y="65" width="4" height="15" fill="#CD9B1D" />
						<ellipse cx="50" cy="80" rx="8" ry="3" fill="#CD9B1D" />
					</svg>
				);
			case "tea-bowl":
				return (
					<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
						<ellipse cx="50" cy="75" rx="25" ry="5" fill="#8D6E63" opacity="0.5" />
						<path d="M30,60 C30,75 70,75 70,60 C70,50 65,45 50,45 C35,45 30,50 30,60" fill="#A1887F" />
						<path d="M30,60 C30,67 70,67 70,60" fill="none" stroke="#8D6E63" strokeWidth="2" />
						<ellipse cx="50" cy="51" rx="15" ry="7" fill="#D7CCC8" />
					</svg>
				);
				return (
					<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
						<rect x="38" y="60" width="24" height="5" rx="2" fill="#8B4513" />
						<rect x="45" y="40" width="10" height="20" fill="#4D7C0F" rx="5" />
						<path d="M42,50 C35,45 35,40 45,40 C55,40 55,45 48,50" fill="none" stroke="#8B4513" strokeWidth="2" />
						<path d="M45,40 L45,20 L55,20 L55,40" fill="#4D7C0F" />
						<ellipse cx="50" cy="65" rx="20" ry="5" fill="#A5C7D3" opacity="0.8" />
						<path d="M50,20 C48,10 52,10 50,20" stroke="#86BFDE" strokeWidth="1" strokeDasharray="1,1" />
						<path d="M50,25 C48,15 52,15 50,25" stroke="#86BFDE" strokeWidth="1" strokeDasharray="1,1" />
						<path d="M50,30 C48,20 52,20 50,30" stroke="#86BFDE" strokeWidth="1" strokeDasharray="1,1" />
					</svg>
				);
			default:
				return null;
		}
	};

	return (
		<>
			<div className="space-y-4">
				{/* Create custom element button */}
				<div className="mb-4">
					<Button className="w-full" onClick={() => setDialogOpen(true)}>
						<Pencil />
						<span className="text-sm font-medium">Create Custom Element</span>
					</Button>
				</div>

				{/* Search input */}
				<Input
					type="text"
					placeholder="Search elements..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					aria-label="Search garden elements"
					startIcon={Search}
				/>

				{/* Show message if no elements found */}
				{allElements.length === 0 && (
					<div className="flex flex-col items-center justify-center py-8 text-muted">
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
							className="mb-2">
							<circle cx="12" cy="12" r="10" />
							<line x1="12" y1="8" x2="12" y2="12" />
							<line x1="12" y1="16" x2="12.01" y2="16" />
						</svg>
						<p className="text-sm">No elements found for &quot;{debouncedSearchTerm}&quot;</p>
					</div>
				)}

				{/* All elements in a single flat list */}
				{allElements.length > 0 && (
					<div>
						<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
							{allElements.map((element) => (
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
										{element.category === "custom" && element.preview ? (
											<div dangerouslySetInnerHTML={{ __html: element.preview }} />
										) : (
											renderElementPreview(element.type)
										)}

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

									{/* Delete button - only for custom elements */}
									{element.category === "custom" && (
										<div
											className="absolute top-1 right-1 p-1.5 rounded-full bg-background border border-border/30 shadow-sm z-10 group/delete"
											onClick={(e) => handleDeleteCustomElement(element.type, e)}
											aria-label="Delete custom element">
											<Trash className="size-3.5 text-destructive group-hover/delete:text-white" />
											<span className="absolute inset-0 rounded-full bg-destructive opacity-0 group-hover/delete:opacity-100 transition-opacity -z-10"></span>
										</div>
									)}
								</motion.div>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Custom Element Creator Dialog */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="overflow-y-auto">
					<DialogHeader>
						<DialogTitle>Draw Something New</DialogTitle>
					</DialogHeader>
					<CustomElementCreator onSaveElement={handleSaveCustomElement} onCancel={() => setDialogOpen(false)} />
				</DialogContent>
			</Dialog>
		</>
	);
}

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
	{
		type: "meditation-stone",
		name: "Meditation Stones",
		imagePath: "#meditation-stone",
		preview: "#meditation-stone-preview",
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
		name: "Grass Tuft",
		imagePath: "#grass",
		preview: "#grass-preview",
		category: "plants",
	},

	// Water Features
	{
		type: "water",
		name: "Water Pool",
		imagePath: "#water",
		preview: "#water-preview",
		category: "water",
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
		name: "Wood Bridge",
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
	{
		type: "bell",
		name: "Zen Bell",
		imagePath: "#bell",
		preview: "#bell-preview",
		category: "decorations",
	},
	{
		type: "tea-bowl",
		name: "Tea Bowl",
		imagePath: "#tea-bowl",
		preview: "#tea-bowl-preview",
		category: "decorations",
	},
	{
		type: "incense",
		name: "Incense Holder",
		imagePath: "#incense",
		preview: "#incense-preview",
		category: "decorations",
	},

	// Features
	{
		type: "sand",
		name: "Raked Sand",
		imagePath: "#sand",
		preview: "#sand-preview",
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
