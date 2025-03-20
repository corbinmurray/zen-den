"use client";

import { Button } from "@/components/ui/button";
import { AtmosphereSettings, GardenElement } from "@/lib/types";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Canvas } from "./canvas";

export function GardenViewer() {
	const [elements, setElements] = useState<GardenElement[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [background, setBackground] = useState("/backgrounds/zen-garden-bg.svg");
	const [atmosphereSettings, setAtmosphereSettings] = useState<AtmosphereSettings>({
		timeOfDay: "day",
		weather: "clear",
		effects: [],
		effectsIntensity: 50,
	});

	const searchParams = useSearchParams();
	const gardenId = searchParams.get("id");

	useEffect(() => {
		if (!gardenId) {
			toast.error("Garden not found", {
				description: "The garden you're looking for could not be found.",
			});
			setIsLoading(false);
			return;
		}

		try {
			// Load saved gardens from local storage
			const savedGardensJSON = localStorage.getItem("zenGardens");

			if (savedGardensJSON) {
				const savedGardens = JSON.parse(savedGardensJSON);
				const garden = savedGardens.find((g: any) => g.id === gardenId);

				if (garden) {
					// Load garden data
					setElements(garden.elements || []);
					setBackground(garden.background || "/backgrounds/zen-garden-bg.svg");
					setAtmosphereSettings(
						garden.atmosphereSettings || {
							timeOfDay: "day",
							weather: "clear",
							effects: [],
							effectsIntensity: 50,
						}
					);
					toast.success("Garden loaded", {
						description: `Viewing ${garden.name || "zen garden"}`,
					});
				} else {
					toast.error("Garden not found", {
						description: "The garden you're looking for could not be found.",
					});
				}
			} else {
				toast.error("No saved gardens", {
					description: "There are no saved gardens to view.",
				});
			}
		} catch (error) {
			toast.error("Failed to load garden", {
				description: "There was an error loading the garden data.",
			});
			console.error("Error loading garden:", error);
		} finally {
			setIsLoading(false);
		}
	}, [gardenId]);

	// Placeholder functions since this is read-only
	const onElementUpdate = () => {};
	const onElementRemove = () => {};

	// Handle garden edit navigation
	const handleEdit = () => {
		// Navigate to garden creator with this garden id
		window.location.href = `/garden?id=${gardenId}`;
	};

	return (
		<div className="flex flex-col h-full w-full">
			{/* Header with back and edit buttons */}
			<div className="flex justify-between items-center p-4 border-b border-border bg-card">
				<Link href="/gallery" className="flex items-center gap-2 text-sm font-medium">
					<ArrowLeft className="h-4 w-4" />
					<span>Back to Gallery</span>
				</Link>
				<Button onClick={handleEdit} size="sm" className="flex items-center gap-2">
					<Edit className="h-4 w-4" />
					<span>Edit Garden</span>
				</Button>
			</div>

			{/* Main content */}
			<div className="flex-1 relative overflow-hidden">
				{isLoading ? (
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
					</div>
				) : elements.length === 0 ? (
					<div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
						<div className="bg-muted/30 rounded-lg p-6 max-w-md">
							<h2 className="text-xl font-semibold mb-2">Garden Not Found</h2>
							<p className="text-muted mb-4">The garden you're looking for could not be found or has no elements.</p>
							<Link href="/gallery">
								<Button>View Gallery</Button>
							</Link>
						</div>
					</div>
				) : (
					<Canvas
						elements={elements}
						background={background}
						onElementUpdate={onElementUpdate}
						onElementRemove={onElementRemove}
						atmosphereSettings={atmosphereSettings}
						readonly={true}
					/>
				)}
			</div>
		</div>
	);
}
