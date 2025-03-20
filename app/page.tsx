import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Navigation } from "@/components/navigation";

export default function Home() {
	return (
		<main>
			<Navigation />
			<Hero />
			<Features />
			<Footer />
		</main>
	);
}
