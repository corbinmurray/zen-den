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
			className="flex flex-col items-start">
			<div className="rounded-lg bg-primary/10 p-3 ring-1 ring-primary/20">{icon}</div>
			<h3 className="mt-4 font-semibold text-foreground">{title}</h3>
			<p className="mt-2 text-sm text-muted-foreground">{description}</p>
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
		<div className="bg-background py-24 sm:py-32">
			<div className="mx-auto max-w-7xl px-6 lg:px-8">
				<motion.div
					className="mx-auto max-w-2xl text-center"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, easing: [0.22, 0.03, 0.26, 1] }}>
					<h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Create your own digital calm</h2>
					<p className="mt-6 text-lg leading-8 text-muted-foreground">
						Zen Den provides a peaceful escape into a world of tranquility where you can create, cultivate, and find balance in your digital garden.
					</p>
				</motion.div>
				<div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
					<dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
						{features.map((feature) => (
							<Feature key={feature.title} icon={feature.icon} title={feature.title} description={feature.description} delay={feature.delay} />
						))}
					</dl>
				</div>
			</div>
		</div>
	);
}
