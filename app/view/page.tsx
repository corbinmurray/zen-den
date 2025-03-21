"use client";

import { GardenViewer } from "@/components/garden/garden-viewer";

export default function ViewPage() {
	return (
		<main className="flex flex-col h-[calc(100vh-theme(spacing.16))] max-h-[calc(100vh-theme(spacing.16))]">
			<div className="flex-1 overflow-hidden">
				<GardenViewer />
			</div>
		</main>
	);
}
