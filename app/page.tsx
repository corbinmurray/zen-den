import { Features } from "@/components/features";
import { Hero } from "@/components/hero";

export default function Home() {
	return (
		<main className="relative overflow-hidden">
			{/* Background decorative elements */}
			<div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl -z-10" />
			<div className="absolute bottom-1/3 right-1/4 h-96 w-96 rounded-full bg-accent/5 blur-3xl -z-10" />

			{/* Animated dot pattern */}
			<div className="fixed inset-0 -z-20 opacity-[0.02]">
				<svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
					<defs>
						<pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
							<circle cx="2" cy="2" r="1" fill="currentColor" />
						</pattern>
					</defs>
					<rect width="100%" height="100%" fill="url(#smallGrid)" />
				</svg>
			</div>

			<Hero />

			{/* Decorative separator */}
			<div className="relative py-12">
				<div className="absolute inset-0 flex items-center" aria-hidden="true">
					<div className="w-full border-t border-muted/20"></div>
				</div>
				<div className="relative flex justify-center">
					<span className="bg-background px-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="text-primary/50">
							<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
							<path d="M7 12a5 5 0 0 1 10 0"></path>
							<line x1="12" x2="12" y1="17" y2="22"></line>
						</svg>
					</span>
				</div>
			</div>

			<Features />
		</main>
	);
}
