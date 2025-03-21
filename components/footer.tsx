"use client";

import { Github } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

export function Footer() {
	const currentYear = new Date().getFullYear();

	const footerLinks = [
		{ name: "Garden", href: "/garden" },
		{ name: "Gallery", href: "/gallery" },
		{ name: "Privacy", href: "#" },
		{ name: "Terms", href: "#" },
	];

	return (
		<footer className="border-t bg-background/90 backdrop-blur-sm">
			<div className="container mx-auto px-4 py-12 md:flex md:items-center md:justify-between lg:px-8">
				<div className="flex flex-col space-y-8 md:order-1 md:space-y-0">
					<div className="flex items-center justify-center md:justify-start">
						<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-semibold text-foreground">
							Zen<span className="text-primary">Den</span>
						</motion.span>
					</div>
					<div className="mt-4 flex justify-center space-x-6 md:justify-start">
						{footerLinks.map((link) => (
							<Link key={link.name} href={link.href} className="text-sm text-muted hover:text-foreground transition-colors">
								{link.name}
							</Link>
						))}
					</div>
					<div className="mt-8 md:mt-0">
						<p className="text-center text-xs leading-5 text-muted md:text-left">&copy; {currentYear} Zen Den. All rights reserved.</p>
					</div>
				</div>

				<div className="mt-8 flex justify-center md:order-2 md:mt-0">
					<Link
						href="https://github.com"
						target="_blank"
						rel="noopener noreferrer"
						className="rounded-full bg-muted/10 p-2 text-muted hover:bg-muted/20 hover:text-foreground transition-colors"
						aria-label="GitHub">
						<Github className="h-5 w-5" />
					</Link>
				</div>
			</div>
		</footer>
	);
}
