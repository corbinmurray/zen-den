"use client";

import { Button } from "@/components/ui/button";
import { GardenData } from "@/lib/types";
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
				{savedGardens.map((garden, index) => (
					<div key={garden.timestamp} className="border border-border rounded-lg overflow-hidden bg-card">
						<div
							className="aspect-video relative"
							style={{
								backgroundImage: `url(${garden.background})`,
								backgroundSize: "cover",
								backgroundPosition: "center",
							}}>
							{/* Garden preview would render elements here in a full implementation */}
							<div className="absolute inset-0 flex items-center justify-center">
								<span className="bg-background/80 backdrop-blur-sm px-3 py-1 rounded-md text-sm">Garden {index + 1}</span>
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
