import { GardenViewer } from "@/components/garden/garden-viewer";
import { Suspense } from "react";

// Type issue with searchParams in Next.js 15, use a different pattern
export default async function ViewPage() {
	// Access searchParams through props in client component instead
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
			<GardenViewer />
		</Suspense>
	);
}
