import { Button } from "@/components/ui/button";
import * as motion from "motion/react-client";

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
								className="mt-6 text-lg leading-8 text-muted-foreground">
								Create your own tranquil digital space where you can arrange elements like stones, plants, and water features. Experience the calm of tending to
								your personal zen garden, wherever you are.
							</motion.p>
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.8, delay: 0.4, easing: [0.22, 0.03, 0.26, 1] }}
								className="mt-10 flex items-center gap-x-6">
								<Button size="lg" className="rounded-md">
									Create Your Garden
								</Button>
								<Button variant="outline" size="lg" className="rounded-md">
									Explore Gallery
								</Button>
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
				className="absolute inset-y-0 right-0 -z-10 w-full overflow-hidden bg-secondary/5 lg:w-1/2"
				aria-hidden="true">
				{/* We'll replace this with an actual zen garden image in the future */}
				<div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20 opacity-80" />
				<div className="absolute inset-x-0 bottom-0 h-px bg-primary/10" />
				<div className="absolute inset-y-0 right-0 w-px bg-primary/10" />

				{/* Decorative zen elements using CSS */}
				<div className="absolute top-1/3 left-1/4 h-16 w-16 rounded-full bg-primary/10" />
				<div className="absolute top-2/3 left-1/2 h-24 w-24 rounded-full bg-accent/10" />
				<div className="absolute top-1/2 left-1/3 h-32 w-32 rounded-full bg-secondary/10" />

				{/* Wavy pattern for water-like effect */}
				<svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 1000" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M0,800 C150,700 350,900 500,800 C650,700 850,900 1000,800 L1000,1000 L0,1000 Z" className="fill-accent/5" />
					<path d="M0,900 C150,800 350,1000 500,900 C650,800 850,1000 1000,900 L1000,1000 L0,1000 Z" className="fill-primary/5" />
				</svg>
			</motion.div>
		</div>
	);
}
