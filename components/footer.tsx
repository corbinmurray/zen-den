"use client";

import { Github } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

export function Footer() {
	const currentYear = new Date().getFullYear();

	// Keep only essential links
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
						<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
							<span className="text-2xl font-semibold text-foreground">
								Zen<span className="text-primary">Den</span>
							</span>
						</motion.div>
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
					<div className="flex flex-col items-center md:items-end gap-4">
						<Link
							href="https://github.com/corbinmurray/zen-den"
							target="_blank"
							rel="noopener noreferrer"
							className="rounded-full bg-muted/10 p-3 text-muted hover:bg-primary/10 hover:text-primary transition-all duration-300"
							aria-label="GitHub">
							<Github className="h-5 w-5" />
						</Link>

						<p className="text-xs text-muted text-center md:text-right">&copy; {currentYear} Zen Den</p>
						<p className="text-xs text-muted/60 text-center md:text-right">All rights reserved</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
