"use client";

import { GardenViewer } from "@/components/garden/garden-viewer";

export default function ViewPage() {
	return (
		<main className="flex flex-col h-full w-full my-16">
			<GardenViewer />
		</main>
	);
}
