"use client";

import { GardenViewer } from "@/components/garden/garden-viewer";
import { Button } from "@/components/ui/button";
import { AtmosphereSettings, GardenElement } from "@/lib/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ViewPage() {
	const searchParams = useSearchParams();
	const [gardenData, setGardenData] = useState<{
		elements: GardenElement[];
		background: string;
		atmosphereSettings: AtmosphereSettings;
	} | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Try to load garden from URL parameters or localStorage
		try {
			setLoading(true);

			// Get the garden data from search params
			const gardenId = searchParams.get("id");

			if (gardenId) {
				// For a full implementation, this would fetch from a database
				// For now, we'll load from localStorage if the ID matches a timestamp
				const savedGardens = JSON.parse(localStorage.getItem("zenGardens") || "[]");
				const garden = savedGardens.find((g: any) => g.timestamp === gardenId);

				if (garden) {
					setGardenData({
						elements: garden.elements || [],
						background: garden.background || "/backgrounds/zen-default.jpg",
						atmosphereSettings: garden.atmosphereSettings || {
							timeOfDay: "day",
							weather: "clear",
							effects: [],
							effectsIntensity: 50,
						},
					});

					toast.success("Garden loaded", {
						description: "Viewing garden in read-only mode",
					});
				} else {
					toast.error("Garden not found", {
						description: "Could not find the garden you're looking for",
					});
				}
			} else {
				toast.error("Missing garden ID", {
					description: "No garden ID provided in the URL",
				});
			}
		} catch (error) {
			console.error("Failed to load garden:", error);
			toast.error("Error loading garden", {
				description: "There was a problem loading this garden",
			});
		} finally {
			setLoading(false);
		}
	}, [searchParams]);

	return (
		<main className="container mx-auto py-6 px-4 min-h-screen">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-3xl font-bold">View Zen Garden</h1>
					<p className="text-muted mt-2">You are viewing a read-only version of this zen garden. Want to create your own? Visit the garden creator.</p>
				</div>
				<div className="flex gap-2 shrink-0">
					<Link href="/garden">
						<Button variant="outline" className="w-full md:w-auto">
							Create Your Own
						</Button>
					</Link>
					<Link href="/gallery">
						<Button variant="ghost" className="w-full md:w-auto">
							View Gallery
						</Button>
					</Link>
				</div>
			</div>

			{loading ? (
				<div className="flex items-center justify-center py-20">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
				</div>
			) : gardenData ? (
				<div className="h-[70vh] border border-border rounded-lg overflow-hidden">
					<GardenViewer elements={gardenData.elements} background={gardenData.background} atmosphereSettings={gardenData.atmosphereSettings} readonly={true} />
				</div>
			) : (
				<div className="text-center py-20 bg-card rounded-lg border border-border">
					<h2 className="text-xl font-semibold mb-2">Garden Not Found</h2>
					<p className="text-muted mb-6">The garden you're looking for could not be loaded. It may have been deleted or the link is invalid.</p>
					<Link href="/garden">
						<Button>Create a New Garden</Button>
					</Link>
				</div>
			)}
		</main>
	);
}
