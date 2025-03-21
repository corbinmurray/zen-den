import { Droplets, Flower, Leaf, Wind } from "lucide-react";
import * as motion from "motion/react-client";

interface FeatureProps {
	icon: React.ReactNode;
	title: string;
	description: string;
	delay: number;
}

function Feature({ icon, title, description, delay }: FeatureProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.6, delay: delay, easing: [0.22, 0.03, 0.26, 1] }}
			className="group flex flex-col items-start">
			<div className="relative rounded-xl bg-primary/5 p-3 ring-1 ring-primary/10 transition-all duration-300 group-hover:bg-primary/10 group-hover:ring-primary/20 group-hover:shadow-md group-hover:shadow-primary/5 overflow-hidden">
				{/* Animated background pattern on hover */}
				<div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-primary/5 group-hover:to-transparent transition-all duration-500" />
				<div
					className="absolute -inset-1 bg-grid-primary/5 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
					style={{ maskImage: "radial-gradient(circle, black, transparent 80%)" }}
				/>

				{/* Icon with subtle animations */}
				<div className="relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">{icon}</div>
			</div>
			<h3 className="mt-4 font-semibold text-foreground">{title}</h3>
			<p className="mt-2 text-sm text-muted">{description}</p>
		</motion.div>
	);
}

export function Features() {
	const features = [
		{
			icon: <Flower className="h-6 w-6 text-primary" />,
			title: "Personalized Designs",
			description: "Create unique arrangements that reflect your personality and preferences.",
			delay: 0.1,
		},
		{
			icon: <Leaf className="h-6 w-6 text-primary" />,
			title: "Mindful Practice",
			description: "Take moments to unwind and practice mindfulness through creative expression.",
			delay: 0.2,
		},
		{
			icon: <Droplets className="h-6 w-6 text-primary" />,
			title: "Tranquil Experience",
			description: "Enjoy the peaceful and calming effects of tending to your own zen garden.",
			delay: 0.3,
		},
		{
			icon: <Wind className="h-6 w-6 text-primary" />,
			title: "Stress Relief",
			description: "Take a mindful break from the digital noise to find calm and balance.",
			delay: 0.4,
		},
	];

	return (
		<div className="bg-background py-24 sm:py-32 relative">
			{/* Decorative elements */}
			<div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-primary/5 -z-10 blur-3xl" />

			{/* Animated background pattern */}
			<div className="absolute inset-0 overflow-hidden -z-10">
				<div className="absolute inset-0 opacity-[0.03]" aria-hidden="true">
					<svg className="absolute h-full w-full" xmlns="http://www.w3.org/2000/svg">
						<defs>
							<pattern id="features-pattern" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
								<rect width="100%" height="100%" fill="none" />
								<circle cx="20" cy="20" r="1" fill="currentColor" className="text-primary" />
								<circle cx="4" cy="4" r="0.5" fill="currentColor" className="text-accent" />
							</pattern>
						</defs>
						<rect width="200%" height="200%" fill="url(#features-pattern)" />
					</svg>
				</div>
				<motion.div
					className="absolute -inset-x-1/4 top-0 h-px w-[150%] bg-gradient-to-r from-transparent via-primary/20 to-transparent"
					animate={{
						y: [60, 120, 60],
						opacity: [0.2, 0.5, 0.2],
					}}
					transition={{
						duration: 15,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				/>
				<motion.div
					className="absolute -inset-x-1/3 top-0 h-px w-[200%] bg-gradient-to-r from-transparent via-accent/10 to-transparent"
					animate={{
						y: [200, 300, 200],
						opacity: [0.1, 0.3, 0.1],
					}}
					transition={{
						duration: 20,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				/>
			</div>

			<div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
				<motion.div
					className="mx-auto max-w-2xl text-center"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, easing: [0.22, 0.03, 0.26, 1] }}>
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						whileInView={{ opacity: 1, scale: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="mb-4 inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1 text-sm text-primary ring-1 ring-inset ring-primary/20">
						Digital Tranquility
					</motion.div>
					<h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Create your own digital calm</h2>
					<p className="mt-6 text-lg leading-8 text-muted">
						Zen Den provides a peaceful escape into a world of tranquility where you can create, cultivate, and find balance in your digital garden.
					</p>
				</motion.div>

				<div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
					<div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
						{features.map((feature) => (
							<Feature key={feature.title} icon={feature.icon} title={feature.title} description={feature.description} delay={feature.delay} />
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
