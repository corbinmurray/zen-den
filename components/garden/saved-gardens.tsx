"use client";

import { Button } from "@/components/ui/button";
import { GardenData, GardenElement } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function SavedGardens() {
	const [savedGardens, setSavedGardens] = useState<GardenData[]>([]);
	const router = useRouter();

	// Load saved gardens from localStorage
	useEffect(() => {
		try {
			const gardens = JSON.parse(localStorage.getItem("zenGardens") || "[]");
			setSavedGardens(gardens);
		} catch (error) {
			console.error("Failed to load saved gardens:", error);
		}
	}, []);

	// Delete a garden
	const handleDelete = (timestamp: string) => {
		toast.warning("Delete garden?", {
			description: "Are you sure you want to delete this garden?",
			action: {
				label: "Delete",
				onClick: () => {
					try {
						const gardens = savedGardens.filter((g) => g.timestamp !== timestamp);
						localStorage.setItem("zenGardens", JSON.stringify(gardens));
						setSavedGardens(gardens);
						toast.success("Garden deleted", {
							description: "Your garden has been removed from the gallery.",
						});
					} catch (error) {
						console.error("Failed to delete garden:", error);
						toast.error("Failed to delete", {
							description: "There was a problem deleting your garden. Please try again.",
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

	// Load a garden and navigate to the garden editor
	const handleLoad = (garden: GardenData) => {
		// Store the garden to be loaded in localStorage
		try {
			localStorage.setItem("zenGardenToLoad", JSON.stringify(garden));
			// Navigate to the garden page
			router.push("/garden?load=true");
			toast.success("Loading garden", {
				description: "Your garden is being loaded into the editor.",
			});
		} catch (error) {
			console.error("Failed to prepare garden for loading:", error);
			toast.error("Failed to load", {
				description: "There was a problem loading your garden. Please try again.",
			});
		}
	};

	// Function to render a simple SVG preview of an element
	const renderElementPreview = (type: string, scale: number, position: { x: number; y: number }, rotation: number) => {
		// Very simplified SVG rendering to create small preview thumbnails
		switch (type) {
			case "rock":
			case "rock-flat":
			case "rock-tall":
				return (
					<div
						className="absolute w-8 h-8 rounded-full bg-neutral-400"
						style={{
							left: `${position.x / 3}px`,
							top: `${position.y / 3}px`,
							transform: `scale(${scale * 0.6}) rotate(${rotation}deg)`,
							opacity: 0.85,
						}}
					/>
				);
			case "bamboo":
			case "pine":
			case "grass":
				return (
					<div
						className="absolute w-6 h-10 bg-green-700 rounded-t-full"
						style={{
							left: `${position.x / 3}px`,
							top: `${position.y / 3}px`,
							transform: `scale(${scale * 0.6}) rotate(${rotation}deg)`,
							opacity: 0.85,
						}}
					/>
				);
			case "cherry":
			case "bonsai":
				return (
					<div
						className="absolute w-8 h-8 bg-green-600 rounded-full"
						style={{
							left: `${position.x / 3}px`,
							top: `${position.y / 3}px`,
							transform: `scale(${scale * 0.6}) rotate(${rotation}deg)`,
							opacity: 0.85,
						}}
					/>
				);
			case "water":
				return (
					<div
						className="absolute w-12 h-8 bg-blue-300 rounded-full"
						style={{
							left: `${position.x / 3}px`,
							top: `${position.y / 3}px`,
							transform: `scale(${scale * 0.6}) rotate(${rotation}deg)`,
							opacity: 0.7,
						}}
					/>
				);
			case "sand":
				return (
					<div
						className="absolute w-16 h-8 bg-amber-100 rounded-full"
						style={{
							left: `${position.x / 3}px`,
							top: `${position.y / 3}px`,
							transform: `scale(${scale * 0.6}) rotate(${rotation}deg)`,
							opacity: 0.7,
						}}
					/>
				);
			case "moss":
				return (
					<div
						className="absolute w-10 h-6 bg-green-500 rounded-full"
						style={{
							left: `${position.x / 3}px`,
							top: `${position.y / 3}px`,
							transform: `scale(${scale * 0.6}) rotate(${rotation}deg)`,
							opacity: 0.8,
						}}
					/>
				);
			case "lantern":
			case "bridge":
			case "pagoda":
				return (
					<div
						className="absolute w-6 h-10 bg-amber-800 rounded-sm"
						style={{
							left: `${position.x / 3}px`,
							top: `${position.y / 3}px`,
							transform: `scale(${scale * 0.6}) rotate(${rotation}deg)`,
							opacity: 0.85,
						}}
					/>
				);
			default:
				if (type.startsWith("custom-")) {
					return (
						<div
							className="absolute w-8 h-8 bg-primary rounded-md"
							style={{
								left: `${position.x / 3}px`,
								top: `${position.y / 3}px`,
								transform: `scale(${scale * 0.6}) rotate(${rotation}deg)`,
								opacity: 0.7,
							}}
						/>
					);
				}
				return null;
		}
	};

	if (savedGardens.length === 0) {
		return (
			<div className="p-6 bg-card border border-border rounded-lg text-center">
				<h3 className="text-lg font-medium mb-2">No Saved Gardens</h3>
				<p className="text-muted mb-4">You haven't created any zen gardens yet. Start by adding elements to your garden.</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold">Your Saved Gardens</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{savedGardens.map((garden) => (
					<div key={garden.timestamp} className="border border-border rounded-lg overflow-hidden bg-card">
						<div
							className="aspect-video relative"
							style={{
								backgroundImage: `url(${garden.background})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
								filter:
									garden.atmosphereSettings?.timeOfDay === "night"
										? "brightness(0.6)"
										: garden.atmosphereSettings?.timeOfDay === "sunset"
										? "brightness(0.8) sepia(0.2)"
										: "brightness(1)",
							}}>
							{/* Render a few elements as a preview */}
							<div className="absolute inset-0 overflow-hidden">
								{garden.elements.slice(0, 5).map((element: GardenElement, i) => (
									<div key={i}>{renderElementPreview(element.type, element.scale, element.position, element.rotation)}</div>
								))}
							</div>

							{/* Garden name as an overlay */}
							<div className="absolute inset-0 flex items-end justify-start p-2">
								<div className="bg-background/80 backdrop-blur-sm px-3 py-2 rounded-md text-sm font-medium">
									{garden.name || `Garden ${new Date(garden.timestamp).toLocaleDateString()}`}
								</div>
							</div>
						</div>

						<div className="p-3">
							<div className="text-xs text-muted mb-3">Created on {new Date(garden.timestamp).toLocaleDateString()}</div>

							<div className="flex space-x-2">
								<Button onClick={() => handleLoad(garden)} size="sm" variant="outline" className="flex-1">
									Edit
								</Button>
								<Link href={`/view?id=${garden.timestamp}`} className="flex-1">
									<Button size="sm" variant="secondary" className="w-full">
										View
									</Button>
								</Link>
								<Button
									onClick={() => handleDelete(garden.timestamp)}
									size="sm"
									variant="ghost"
									className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10">
									Delete
								</Button>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
