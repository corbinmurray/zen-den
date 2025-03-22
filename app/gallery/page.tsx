"use client";

import { Button } from "@/components/ui/button";
import { Atmosphere, Garden } from "@/lib/types";
import { copyToClipboard, shareGarden } from "@/lib/utils";
import { useZenGardenStore } from "@/providers/zen-garden-store-provider";
import { Edit, Eye, Share, Trash } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export default function GalleryPage() {
	const { gardens, remove: removeGarden } = useZenGardenStore((state) => state);
	// Track which gardens are currently being shared
	const [sharingGardenIds, setSharingGardenIds] = useState<Record<string, boolean>>({});

	const handleRemove = useCallback(
		(id: string) => {
			toast.error("Remove garden?", {
				description: "Are you sure you want to remove your garden?",
				action: {
					label: "Yes",
					onClick: () => {
						removeGarden(id);
					},
				},
				cancel: {
					label: "Cancel",
					onClick: () => {},
				},
			});
		},
		[removeGarden]
	);

	// Handle share button click
	const handleShare = useCallback(async (garden: Garden) => {
		if (!garden.id) {
			toast.error("Cannot share garden", {
				description: "This garden doesn't have a valid ID.",
			});
			return;
		}

		try {
			// Mark this garden as currently sharing
			setSharingGardenIds((prev) => ({ ...prev, [garden.id as string]: true }));

			// Use shared utility function to generate and copy the share URL
			const shareUrl = await shareGarden(garden);
			await copyToClipboard(shareUrl);

			// Show success toast
			toast.success("Share link created!", {
				description: "Share link has been copied to your clipboard.",
			});
		} catch (error) {
			console.error("Error sharing garden:", error);
			toast.error("Failed to create share link", {
				description: "Please try again later.",
			});
		} finally {
			// Mark this garden as no longer sharing
			setSharingGardenIds((prev) => ({ ...prev, [garden.id as string]: false }));
		}
	}, []);

	if (gardens.length === 0) {
		return (
			<div className="p-6 bg-card border border-border rounded-lg text-center">
				<h3 className="text-lg font-medium mb-2">No Saved Gardens</h3>
				<p className="text-muted mb-4">You haven&apos;t created any zen gardens yet. Start by adding elements to your garden.</p>
			</div>
		);
	}

	return (
		<div className="space-y-4 min-h-[100vh]">
			<h2 className="text-xl font-semibold">Your Saved Gardens</h2>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{gardens
					.sort((a, b) => b.lastModifiedAt - a.lastModifiedAt)
					.map((garden, index) => (
						<div key={index} className="border border-border rounded-lg overflow-hidden bg-card shadow-sm hover:shadow-md transition-all">
							<div className={`h-40 flex items-center justify-center p-4 border-b border-border relative ${getCardStyle(garden.atmosphere)}`}>
								<ZenPattern />
								<div className="flex items-center justify-center w-full h-full">
									<div className="text-base font-medium px-4 py-2 rounded-md backdrop-blur-sm bg-background/5">{garden.name || "Untitled Garden"}</div>
								</div>
							</div>

							<div className="p-4">
								<div className="text-xs text-muted mb-4">
									Last modified {new Date(garden.lastModifiedAt).toLocaleDateString()} at {new Date(garden.lastModifiedAt).toLocaleTimeString()}
								</div>

								<div className="flex flex-col space-y-2">
									<div className="flex space-x-2">
										<Link href={`/garden?id=${garden.id}`} className="flex-1">
											<Button size="sm" variant="outline" className="w-full">
												<Edit className="h-3.5 w-3.5 mr-2" />
												Edit
											</Button>
										</Link>

										<Button
											size="sm"
											variant="outline"
											className="flex-1"
											onClick={() => handleShare(garden)}
											disabled={garden.id ? sharingGardenIds[garden.id as string] : false}>
											<Share className="h-3.5 w-3.5 mr-2" />
											{garden.id && sharingGardenIds[garden.id as string] ? "Sharing..." : "Share"}
										</Button>

										<Link href={`/view?id=${garden.id}`} className="flex-1">
											<Button size="sm" variant="secondary" className="w-full">
												<Eye className="h-3.5 w-3.5 mr-2" />
												View
											</Button>
										</Link>
									</div>

									<Button
										onClick={() => (garden.id ? handleRemove(garden.id) : null)}
										size="sm"
										className="border border-destructive text-destructive bg-inherit hover:text-foreground hover:bg-destructive">
										<Trash className="h-3.5 w-3.5 mr-2" />
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

const getCardStyle = (atmosphere?: Atmosphere) => {
	if (!atmosphere) return "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/30";

	const { timeOfDay, weather } = atmosphere;

	// Softer, more elegant gradients
	if (timeOfDay === "day") {
		if (weather === "clear") return "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/30";
		if (weather === "cloudy") return "bg-gradient-to-br from-slate-50 to-zinc-100 dark:from-slate-950/30 dark:to-zinc-950/40";
		if (weather === "rainy") return "bg-gradient-to-br from-slate-100 to-blue-50 dark:from-slate-950/30 dark:to-blue-950/20";
		if (weather === "snowy") return "bg-gradient-to-br from-slate-50 to-sky-50 dark:from-slate-950/20 dark:to-sky-950/20";
	}

	if (timeOfDay === "sunset") {
		if (weather === "clear") return "bg-gradient-to-br from-amber-50 to-pink-50 dark:from-amber-950/20 dark:to-pink-950/30";
		if (weather === "cloudy") return "bg-gradient-to-br from-amber-50 to-zinc-100 dark:from-amber-950/20 dark:to-zinc-950/30";
		if (weather === "rainy") return "bg-gradient-to-br from-amber-50 to-slate-100 dark:from-amber-950/20 dark:to-slate-950/30";
		if (weather === "snowy") return "bg-gradient-to-br from-amber-50 to-sky-50 dark:from-amber-950/20 dark:to-sky-950/20";
	}

	if (timeOfDay === "night") {
		if (weather === "clear") return "bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/30";
		if (weather === "cloudy") return "bg-gradient-to-br from-slate-100 to-zinc-50 dark:from-slate-950/40 dark:to-zinc-950/30";
		if (weather === "rainy") return "bg-gradient-to-br from-slate-100 to-indigo-50 dark:from-slate-950/40 dark:to-indigo-950/30";
		if (weather === "snowy") return "bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950/30 dark:to-indigo-950/30";
	}

	return "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/30";
};

// Decorative patterns for the cards
const ZenPattern = () => (
	<svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
		<defs>
			<pattern id="zen-pattern" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
				<circle cx="16" cy="16" r="1.5" fill="currentColor" />
			</pattern>
		</defs>
		<rect width="100%" height="100%" fill="url(#zen-pattern)" />
	</svg>
);
