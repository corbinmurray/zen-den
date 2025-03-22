"use client";

import { Github, Instagram, Twitter } from "lucide-react";
import Link from "next/link";

export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="border-t bg-background/90 backdrop-blur-sm">
			<div className="container mx-auto px-4 py-12 md:flex md:items-center md:justify-between lg:px-8">
				<div className="flex justify-center space-x-6 md:order-2">
					<Link href="https://github.com/corbinmurray" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-foreground" aria-label="GitHub">
						<Github className="h-5 w-5" />
					</Link>
				</div>
				<div className="mt-8 md:order-1 md:mt-0">
					<p className="text-center text-xs leading-5 text-muted">&copy; {currentYear} Zen Den. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
}
