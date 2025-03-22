import { Button } from "@/components/ui/button";
import * as motion from "motion/react-client";
import Link from "next/link";

export function Hero() {
	return (
		<div className="relative overflow-hidden">
			<div className="mx-auto max-w-7xl">
				<div className="relative z-10 lg:w-full lg:max-w-2xl">
					<div className="relative px-6 py-32 sm:py-40 lg:px-8 lg:py-56 lg:pr-0">
						<div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
							<motion.h1
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.8, easing: [0.22, 0.03, 0.26, 1] }}
								className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
								Find peace in your digital <span className="text-primary">Zen Garden</span>
							</motion.h1>
							<motion.p
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.8, delay: 0.2, easing: [0.22, 0.03, 0.26, 1] }}
								className="mt-6 text-lg leading-8 text-muted">
								Create your own tranquil digital space where you can arrange elements like stones, plants, and water features. Experience the calm of tending to
								your personal zen garden, wherever you are.
							</motion.p>
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.8, delay: 0.4, easing: [0.22, 0.03, 0.26, 1] }}
								className="mt-10 flex items-center gap-x-6">
								<Link href="/garden">
									<Button size="lg" className="rounded-md">
										Create Your Garden
									</Button>
								</Link>
								<Link href="/gallery">
									<Button variant="outline" size="lg" className="rounded-md">
										Explore Gallery
									</Button>
								</Link>
							</motion.div>
						</div>
					</div>
				</div>
			</div>
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				whileInView={{ opacity: 1, scale: 1 }}
				viewport={{ once: true }}
				transition={{ duration: 1.2, delay: 0.4, easing: [0.22, 0.03, 0.26, 1] }}
				className="absolute inset-y-0 right-0 -z-10 w-full overflow-hidden lg:w-1/2"
				aria-hidden="true">
				<div className="relative h-full w-full">
					{/* Beautiful gradient background with zen-like patterns */}
					<div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-accent/10 to-secondary/5" />

					{/* Circular patterns mimicking zen garden sand patterns */}
					<div className="absolute inset-0">
						<svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" preserveAspectRatio="none">
							<defs>
								<pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
									<circle cx="2" cy="2" r="1" fill="currentColor" className="text-primary/10" />
								</pattern>
								<mask id="circleMask">
									<rect width="100%" height="100%" fill="white" />
									<circle cx="400" cy="400" r="320" fill="black" />
									<circle cx="400" cy="400" r="240" fill="white" />
									<circle cx="400" cy="400" r="160" fill="black" />
									<circle cx="400" cy="400" r="80" fill="white" />
								</mask>
							</defs>
							<rect width="100%" height="100%" fill="url(#dotPattern)" mask="url(#circleMask)" className="opacity-30" />
							<path d="M0,700 C200,650 250,750 400,700 C550,650 600,750 800,700 L800,800 L0,800 Z" fill="currentColor" className="text-secondary/10" />
							<path d="M0,750 C200,700 250,800 400,750 C550,700 600,800 800,750 L800,800 L0,800 Z" fill="currentColor" className="text-primary/10" />
						</svg>
					</div>
				</div>

				{/* Subtle decorative elements */}
				<div className="absolute bottom-1/4 right-1/4 h-24 w-24 rounded-full bg-primary/10 blur-xl z-0" />
				<div className="absolute top-1/3 right-1/3 h-32 w-32 rounded-full bg-accent/10 blur-xl z-0" />
				<div className="absolute top-2/3 right-1/2 h-20 w-20 rounded-full bg-secondary/10 blur-xl z-0" />
			</motion.div>
		</div>
	);
}
