import { Button } from "@/components/ui/button";
import * as motion from "motion/react-client";
import Link from "next/link";

export function Hero() {
	return (
		<div className="relative overflow-hidden">
			{/* Background animations container - now spans full width */}
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				whileInView={{ opacity: 1, scale: 1 }}
				viewport={{ once: true }}
				transition={{ duration: 1.2, delay: 0.4, easing: [0.22, 0.03, 0.26, 1] }}
				className="absolute inset-0 -z-10 w-full overflow-hidden"
				aria-hidden="true">
				<div className="relative h-full w-full">
					{/* Transparent background */}
					<div className="absolute inset-0 bg-transparent" />

					{/* Circular patterns mimicking zen garden sand patterns - with reduced opacity */}
					<div className="absolute inset-0 opacity-50">
						<svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 800" preserveAspectRatio="none">
							<defs>
								<pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
									<circle cx="2" cy="2" r="1" fill="currentColor" className="text-primary/5" />
								</pattern>
								<mask id="circleMask1">
									<rect width="100%" height="100%" fill="white" />
									<circle cx="400" cy="400" r="320" fill="black" />
									<circle cx="400" cy="400" r="240" fill="white" />
									<circle cx="400" cy="400" r="160" fill="black" />
									<circle cx="400" cy="400" r="80" fill="white" />
								</mask>
								<mask id="circleMask2">
									<rect width="100%" height="100%" fill="white" />
									<circle cx="1200" cy="400" r="320" fill="black" />
									<circle cx="1200" cy="400" r="240" fill="white" />
									<circle cx="1200" cy="400" r="160" fill="black" />
									<circle cx="1200" cy="400" r="80" fill="white" />
								</mask>
								<linearGradient id="zenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
									<stop offset="0%" stopColor="currentColor" stopOpacity="0.03" className="text-primary" />
									<stop offset="50%" stopColor="currentColor" stopOpacity="0.05" className="text-accent" />
									<stop offset="100%" stopColor="currentColor" stopOpacity="0.03" className="text-secondary" />
								</linearGradient>
							</defs>
							<rect width="100%" height="100%" fill="url(#dotPattern)" className="opacity-20" />

							{/* Animated ripple effects with reduced opacity */}
							<motion.circle
								cx="400"
								cy="400"
								r="300"
								stroke="currentColor"
								strokeWidth="1"
								strokeDasharray="5,5"
								fill="none"
								className="text-primary/10"
								initial={{ opacity: 0.1, scale: 0.8 }}
								animate={{
									opacity: [0.1, 0.4, 0.1],
									scale: [0.8, 1.1, 0.8],
								}}
								transition={{
									duration: 8,
									repeat: Infinity,
									ease: "easeInOut",
								}}
							/>

							<motion.circle
								cx="1200"
								cy="400"
								r="300"
								stroke="currentColor"
								strokeWidth="1"
								strokeDasharray="5,5"
								fill="none"
								className="text-primary/10"
								initial={{ opacity: 0.1, scale: 0.8 }}
								animate={{
									opacity: [0.1, 0.3, 0.1],
									scale: [0.8, 1.1, 0.8],
								}}
								transition={{
									duration: 10,
									repeat: Infinity,
									ease: "easeInOut",
								}}
							/>

							<motion.circle
								cx="400"
								cy="400"
								r="200"
								stroke="currentColor"
								strokeWidth="1"
								fill="none"
								className="text-accent/10"
								initial={{ opacity: 0.15, scale: 0.7 }}
								animate={{
									opacity: [0.15, 0.35, 0.15],
									scale: [0.7, 1.2, 0.7],
								}}
								transition={{
									duration: 10,
									delay: 1,
									repeat: Infinity,
									ease: "easeInOut",
								}}
							/>

							<motion.circle
								cx="1200"
								cy="400"
								r="200"
								stroke="currentColor"
								strokeWidth="1"
								fill="none"
								className="text-accent/10"
								initial={{ opacity: 0.15, scale: 0.7 }}
								animate={{
									opacity: [0.15, 0.35, 0.15],
									scale: [0.7, 1.2, 0.7],
								}}
								transition={{
									duration: 9,
									delay: 2,
									repeat: Infinity,
									ease: "easeInOut",
								}}
							/>


						</svg>
					</div>

					{/* Floating elements with reduced opacity - now distributed across whole hero */}
					<motion.div
						className="absolute top-1/4 left-1/4 h-12 w-12 rounded-full bg-primary/15"
						animate={{
							y: [0, -20, 0],
							x: [0, 10, 0],
							rotate: [0, 10, 0],
						}}
						transition={{
							duration: 8,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>

					<motion.div
						className="absolute bottom-1/3 right-1/3 h-8 w-8 rounded-full bg-accent/10"
						animate={{
							y: [0, 15, 0],
							x: [0, -10, 0],
							rotate: [0, -5, 0],
						}}
						transition={{
							duration: 7,
							delay: 1,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>

					<motion.div
						className="absolute top-1/3 left-1/2 h-10 w-10 rounded-full bg-secondary/10"
						animate={{
							y: [0, 12, 0],
							x: [0, 8, 0],
							rotate: [0, -8, 0],
						}}
						transition={{
							duration: 9,
							delay: 2,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>

					<motion.div
						className="absolute bottom-1/4 left-1/6 h-6 w-6 rounded-full bg-primary/10"
						animate={{
							y: [0, -10, 0],
							x: [0, -5, 0],
							rotate: [0, 15, 0],
						}}
						transition={{
							duration: 6,
							delay: 1.5,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>
				</div>

				{/* Subtle decorative elements with reduced opacity - distributed across the whole hero */}
				<div className="absolute bottom-1/4 right-1/4 h-24 w-24 rounded-full bg-primary/5 blur-xl z-0" />
				<div className="absolute top-1/3 right-1/3 h-32 w-32 rounded-full bg-accent/5 blur-xl z-0" />
				<div className="absolute top-2/3 right-1/2 h-20 w-20 rounded-full bg-secondary/5 blur-xl z-0" />
				<div className="absolute bottom-1/3 left-1/4 h-28 w-28 rounded-full bg-primary/5 blur-xl z-0" />
				<div className="absolute top-1/4 left-1/3 h-36 w-36 rounded-full bg-secondary/5 blur-xl z-0" />
			</motion.div>

			<div className="mx-auto max-w-7xl">
				<div className="relative z-10 lg:w-full lg:max-w-2xl">
					<div className="relative px-6 py-32 sm:py-40 lg:px-8 lg:py-56 lg:pr-0">
						<div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
							{/* Badge */}
							<motion.div
								initial={{ opacity: 0, y: -20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, easing: [0.22, 0.03, 0.26, 1] }}
								className="inline-flex items-center gap-x-2 rounded-full bg-primary/10 px-4 py-1 text-sm text-primary ring-1 ring-inset ring-primary/20 mb-8">
								<span className="font-medium">✨ Relax & Create</span>
							</motion.div>

							<motion.h1
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.8, easing: [0.22, 0.03, 0.26, 1] }}
								className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
								Find peace in your digital{" "}
								<span className="text-primary relative inline-block">
									Zen Garden
									<motion.span
										initial={{ scaleX: 0 }}
										whileInView={{ scaleX: 1 }}
										viewport={{ once: true }}
										transition={{ duration: 0.8, delay: 1.0, easing: [0.22, 0.03, 0.26, 1] }}
										className="absolute -bottom-1.5 left-0 h-1 w-full origin-left bg-primary/30"
									/>
								</span>
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
									<Button size="lg" className="rounded-md group relative overflow-hidden">
										<span className="relative z-10">Create Your Garden</span>
										<span className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-300" />
										<span className="absolute -inset-x-1 bottom-0 h-px bg-primary/20 group-hover:scale-x-100" />
									</Button>
								</Link>
								<Link href="/gallery">
									<Button variant="outline" size="lg" className="rounded-md group">
										<span>Explore Gallery</span>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
											className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1">
											<path d="M5 12h14"></path>
											<path d="m12 5 7 7-7 7"></path>
										</svg>
									</Button>
								</Link>
							</motion.div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
