"use client";

import { Button } from "@/components/ui/button";
import { useZenGardenStore } from "@/providers/zen-garden-store-provider";
import { Trash } from "lucide-react";
import Link from "next/link";

export default function GalleryPage() {
	const { gardens, remove: removeGarden } = useZenGardenStore((state) => state);

	if (gardens.length === 0) {
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
				{gardens
					.sort((a, b) => b.createdAt - a.createdAt)
					.map((garden) => (
						<div key={garden.createdAt} className="border border-border rounded-lg overflow-hidden bg-card">
							<div className="absolute inset-0 flex items-center justify-center">
								<span className="bg-background/80 backdrop-blur-sm px-3 py-1 rounded-md text-sm">{garden.name}</span>
							</div>
							<div className="p-3">
								<div className="text-xs text-muted mb-3">
									Created on {new Date(garden.createdAt).toLocaleDateString()} at {new Date(garden.createdAt).toLocaleTimeString()}
								</div>

								<div className="flex space-x-3">
									<Link href={`/garden?id=${garden.id}`} className="flex-1">
										<Button size="sm" variant="outline" className="flex-1">
											Edit
										</Button>
									</Link>

									<Link href={`/view?id=${garden.id}`} className="flex-1">
										<Button size="sm" variant="secondary" className="w-full">
											View
										</Button>
									</Link>
									<Button
										onClick={() => (garden.id ? removeGarden(garden.id) : null)}
										size="sm"
										className="border border-destructive text-destructive bg-inherit hover:bg-destructive hover:text-foreground">
										<Trash />
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
