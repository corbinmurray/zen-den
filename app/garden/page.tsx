import { GardenCreator } from "@/components/garden/garden-creator";

export default function GardenPage({ searchParams }: { searchParams?: { id?: string } }) {
	// We don't need to do anything with the id parameter here
	// GardenCreator will read it from the URL with useEffect

	return (
		<div className="min-h-screen">
			<h1 className="text-3xl font-bold mb-6">Create Your Zen Garden</h1>
			<p className="text-muted mb-8">
				Arrange elements to create your own peaceful zen garden. Drag items onto the canvas and position them to craft your personal tranquil space.
			</p>

			<GardenCreator />
		</div>
	);
}
