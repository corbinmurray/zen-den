import { SavedGardens } from "@/components/garden/saved-gardens";

export default function GalleryPage() {
	return (
		<main className="min-h-screen">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-3xl font-bold">Your Zen Garden Gallery</h1>
					<p className="text-muted mt-2">View and manage your saved zen gardens. Load them to continue editing or delete them if you no longer need them.</p>
				</div>
			</div>

			<SavedGardens />
		</main>
	);
}
