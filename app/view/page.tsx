import { GardenViewer } from "@/components/garden/garden-viewer";
import { getGarden } from "@/lib/db";
import { Suspense } from "react";

export default async function ViewPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
	const params = await searchParams;
	const gardenId = params.id;
	let garden = null;

	if (gardenId) {
		garden = await getGarden(gardenId);
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
			<GardenViewer initialGarden={garden} />
		</Suspense>
	);
}
