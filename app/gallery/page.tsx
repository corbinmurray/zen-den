import { SavedGardens } from "@/components/garden/saved-gardens";

export default function GalleryPage() {
	return (
		<main className="container mx-auto py-6 px-4 min-h-screen">
			<h1 className="text-3xl font-bold mb-6">Your Zen Garden Gallery</h1>
			<p className="text-muted mb-8">View and manage your saved zen gardens. Load them to continue editing or delete them if you no longer need them.</p>

			<SavedGardens />
		</main>
	);
}
