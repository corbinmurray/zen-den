import { Copyright, Github, Heart } from "lucide-react";
import * as motion from "motion/react-client";
import Link from "next/link";

export async function Footer() {
	const footerLinks = [
		{ name: "Garden", href: "/garden" },
		{ name: "Gallery", href: "/gallery" },
	];

	return (
		<footer className="border-t bg-background/90 backdrop-blur-sm">
			{/* Decorative top border */}
			<div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

			<div className="container mx-auto px-6 py-16">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
					{/* Logo area */}
					<div className="flex flex-col items-center md:items-start">
						<Link href="/" className="flex items-center gap-2 group">
							<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-semibold relative">
								<span className="group-hover:text-foreground transition-colors duration-300">Zen</span>
								<span className="text-primary">Den</span>

								{/* Underline animation on hover */}
								<span className="absolute -bottom-1 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
							</motion.span>
						</Link>
						<p className="mt-3 text-sm text-muted max-w-xs text-center md:text-left">A tranquil digital space for mindfulness and creative expression</p>
					</div>

					{/* Navigation links */}
					<div className="flex flex-col items-center">
						<h3 className="text-sm font-medium text-foreground mb-4">Quick Links</h3>
						<div className="flex flex-col items-center space-y-3">
							{footerLinks.map((link) => (
								<Link key={link.name} href={link.href} className="text-muted hover:text-primary transition-colors">
									{link.name}
								</Link>
							))}
						</div>
					</div>

					{/* Social & Copyright */}
					<div className="flex flex-col items-center md:items-end gap-2">
						<Link
							href="https://github.com/corbinmurray/zen-den"
							target="_blank"
							rel="noopener noreferrer"
							className="rounded-full bg-muted/10 p-3 text-muted hover:bg-primary/10 hover:text-primary transition-all duration-300"
							aria-label="GitHub">
							<Github className="size-5" />
						</Link>

						<p className="text-xs text-muted text-center md:text-right">
							Developed and designed with <Heart className="inline-block w-4 fill-red-500 stroke-red-500" /> Corbin Murray
						</p>
						<p className="text-xs text-muted text-center md:text-right">
							Copyright <Copyright className="w-3 inline-block" /> {new Date().getFullYear()} Corbin Murray
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
