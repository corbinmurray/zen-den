"use client";

import { Canvas } from "@/components/garden/canvas";
import { Button } from "@/components/ui/button";
import { Atmosphere, Garden } from "@/lib/types";
import { generateGardenId } from "@/lib/utils";
import { useZenGardenStore } from "@/providers/zen-garden-store-provider";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface GardenViewerProps {
	initialGarden?: Garden | null;
}

export function GardenViewer({ initialGarden }: GardenViewerProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const gardenId = searchParams?.get("id") || "";
	const { getGardenById, add: addGarden } = useZenGardenStore((state) => state);

	const [isLoading, setIsLoading] = useState(!initialGarden);
	const [garden, setGarden] = useState<Garden | undefined>(initialGarden || undefined);

	const defaultAtmosphere: Atmosphere = {
		timeOfDay: "day",
		weather: "clear",
	};

	// Fetch garden from API
	const fetchGardenFromApi = useCallback(
		async (id: string) => {
			if (!id) {
				console.error("Attempting to fetch garden with no ID");
				return false;
			}

			try {
				const response = await fetch(`/api/share/${id}`);

				if (!response.ok) {
					throw new Error("Garden not found");
				}

				const data = await response.json();

				if (!data.garden) {
					throw new Error("Invalid garden data");
				}

				const fetchedGarden = data.garden;

				addGarden(fetchedGarden);
				setGarden(fetchedGarden);

				return true;
			} catch (error) {
				console.error("Error fetching garden from API:", error);
				return false;
			}
		},
		[addGarden]
	);

	useEffect(() => {
		async function loadGarden() {
			if (initialGarden) {
				if (initialGarden.id && !getGardenById(initialGarden.id)) {
					addGarden(initialGarden);
				}
				setGarden(initialGarden);
				setIsLoading(false);
				return;
			}

			if (!gardenId) {
				setIsLoading(false);
				toast.error("Garden not found", {
					description: "No garden ID was provided.",
				});
				return;
			}

			const storeGarden = getGardenById(gardenId);

			if (storeGarden) {
				console.log("Getting garden from store", gardenId);
				setGarden(storeGarden);
				setIsLoading(false);
				return;
			}

			const success = await fetchGardenFromApi(gardenId);

			if (!success) {
				toast.error("Garden not found", {
					description: "The garden you're looking for could not be found.",
				});
			}

			setIsLoading(false);
		}

		loadGarden();
	}, [gardenId, getGardenById, fetchGardenFromApi, initialGarden, addGarden]);

	const handleEdit = () => {
		if (!garden || !garden.id) {
			toast.error("Cannot edit garden", {
				description: "This garden doesn't have a valid ID.",
			});
			return;
		}

		// Create a fork of the garden with a new ID
		const forkedGarden = {
			...garden,
			id: generateGardenId(), // Generate a new ID for the fork
			name: `${garden.name || "Garden"} (Copy)`,
			lastModifiedAt: Date.now(),
		};

		// Add the forked garden to the store
		addGarden(forkedGarden);

		// Show a toast notification
		toast.success("Creating a copy", {
			description: "You're now editing a copy of the shared garden.",
		});

		// Navigate to the garden editor with the new ID
		router.push(`/garden?id=${forkedGarden.id}`);
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
					{!isLoading && garden && (
						<div className="hidden sm:block border-l border-border pl-4">
							<h1 className="text-lg font-semibold">{garden.name || "Untitled Garden"}</h1>
						</div>
					)}
				</div>
				<Button onClick={handleEdit} size="sm" className="flex items-center gap-2">
					<Edit className="h-4 w-4" />
					<span>Edit Garden</span>
				</Button>
			</div>

			{/* Garden name for mobile view */}
			{!isLoading && garden && (
				<div className="sm:hidden px-4 py-2 border-b border-border bg-background">
					<h1 className="text-lg font-semibold">{garden.name || "Untitled Garden"}</h1>
				</div>
			)}

			{/* Main content */}
			<div className="flex-1 relative overflow-hidden">
				{isLoading ? (
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
					</div>
				) : !garden || garden.items.length === 0 ? (
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
					<Canvas elements={garden.items} atmosphere={garden.atmosphere || defaultAtmosphere} readonly={true} />
				)}
			</div>
		</div>
	);
}
