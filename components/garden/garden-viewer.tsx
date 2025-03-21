"use client";

import { Button } from "@/components/ui/button";
import { Atmosphere, GardenItem } from "@/lib/types";
import { useZenGardenStore } from "@/providers/zen-garden-store-provider";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Canvas } from "./canvas";

export function GardenViewer() {
	const [elements, setElements] = useState<GardenItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [gardenName, setGardenName] = useState<string>("Zen Garden");
	const [atmosphere, setAtmosphere] = useState<Atmosphere>({
		timeOfDay: "day",
		weather: "clear",
	});

	const searchParams = useSearchParams();
	const gardenId = searchParams.get("id");

	// Get the getGardenById function from our store
	const getGardenById = useZenGardenStore((state) => state.getGardenById);

	useEffect(() => {
		if (!gardenId) {
			toast.error("Garden not found", {
				description: "The garden you're looking for could not be found.",
			});
			setIsLoading(false);
			return;
		}

		try {
			const garden = getGardenById(gardenId);

			if (garden) {
				setElements(garden.items || []);
				setGardenName(garden.name || "Zen Garden");
				setAtmosphere(
					garden.atmosphere || {
						timeOfDay: "day",
						weather: "clear",
					}
				);
			} else {
				toast.error("Garden not found", {
					description: "The garden you're looking for could not be found.",
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
	}, [gardenId, getGardenById]);

	// Placeholder functions since this is read-only
	const onElementUpdate = () => {};
	const onElementRemove = () => {};

	// Handle garden edit navigation
	const handleEdit = () => {
		window.location.href = `/garden?id=${gardenId}`;
	};

	return (
		<div className="flex flex-col h-full w-full">
			{/* Header with back and edit buttons */}
			<div className="flex justify-between items-center p-4 border-b border-border bg-card">
				<div className="flex items-center gap-4">
					<Link href="/gallery" className="flex items-center gap-2 text-sm font-medium">
						<ArrowLeft className="h-4 w-4" />
						<span>Back to Gallery</span>
					</Link>
					{!isLoading && (
						<div className="hidden sm:block border-l border-border pl-4">
							<h1 className="text-lg font-semibold">{gardenName}</h1>
						</div>
					)}
				</div>
				<Button onClick={handleEdit} size="sm" className="flex items-center gap-2">
					<Edit className="h-4 w-4" />
					<span>Edit Garden</span>
				</Button>
			</div>

			{/* Garden name for mobile view */}
			{!isLoading && elements.length > 0 && (
				<div className="sm:hidden px-4 py-2 border-b border-border bg-background">
					<h1 className="text-lg font-semibold">{gardenName}</h1>
				</div>
			)}

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
							<p className="text-muted mb-4">The garden you&apos;re looking for could not be found or has no elements.</p>
							<Link href="/gallery">
								<Button>View Gallery</Button>
							</Link>
						</div>
					</div>
				) : (
					<Canvas
						elements={elements}
						onElementUpdate={onElementUpdate}
						onElementRemove={onElementRemove}
						atmosphere={atmosphere}
						readonly={true}
					/>
				)}
			</div>
		</div>
	);
}
