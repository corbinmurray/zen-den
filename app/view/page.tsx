import { GardenViewer } from "@/components/garden/garden-viewer";
import { getGarden } from "@/lib/db";
import { Garden } from "@/lib/types";
import { Suspense } from "react";

export default async function ViewPage({ searchParams }: { searchParams?: { id?: string } }) {
	const gardenId = searchParams?.id || "";

	let garden: Garden | null = null;

	if (gardenId) {
		try {
			garden = await getGarden(gardenId);
		} catch (error) {
			console.error("Error fetching garden:", error);
		}
	}

	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center h-screen">
					<div className="text-center">
						<div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
						<p className="text-muted-foreground">Loading garden...</p>
					</div>
				</div>
			}>
			<GardenViewer initialGarden={garden} gardenId={gardenId} />
		</Suspense>
	);
}
