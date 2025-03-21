"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

export function Navigation() {
	const [isOpen, setIsOpen] = React.useState(false);
	const pathname = usePathname();

	const routes = [{ href: "/gallery", label: "Gallery" }];

	return (
		<motion.header
			initial={{ y: -20, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.5, ease: [0.22, 0.03, 0.26, 1] }}
			className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
			{/* Animated gradient line */}
			<div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				<div className="flex items-center gap-2">
					<Link href="/" className="flex items-center gap-2 group">
						<motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-semibold relative">
							<span className="group-hover:text-foreground transition-colors duration-300">Zen</span>
							<span className="text-primary">Den</span>

							{/* Underline animation on hover */}
							<span className="absolute -bottom-1 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300 ease-out"></span>
						</motion.span>
					</Link>
				</div>

				{/* Desktop Navigation */}
				<nav className="hidden md:flex items-center gap-6">
					{routes.map((route) => (
						<Link
							key={route.href}
							href={route.href}
							className={`transition-colors hover:text-primary relative ${
								pathname === route.href ? "text-foreground font-medium after:block after:w-full after:h-0.5 after:bg-primary after:mt-0.5" : "text-muted"
							}`}>
							{route.label}
							{pathname !== route.href && (
								<span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary hover:w-full transition-all duration-300 ease-out"></span>
							)}
						</Link>
					))}
					<Button asChild variant="default" size="sm" className="ml-2 relative overflow-hidden group">
						<Link href="/garden">
							<span className="relative z-10">Create Your Garden</span>
							<span className="absolute inset-0 bg-gradient-to-r from-primary to-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
						</Link>
					</Button>
					<ThemeToggle />
				</nav>

				{/* Mobile Navigation */}
				<Sheet open={isOpen} onOpenChange={setIsOpen}>
					<SheetTrigger asChild className="md:hidden">
						<Button variant="ghost" size="icon" className="mr-2">
							<Menu className="h-5 w-5" />
							<span className="sr-only">Toggle menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="right" className="w-[240px] sm:w-[300px]">
						<div className="flex items-center justify-between pt-4">
							<span className="text-lg font-semibold">Menu</span>
							<ThemeToggle />
						</div>
						<nav className="flex flex-col gap-4 mt-8">
							{routes.map((route) => (
								<Link
									key={route.href}
									href={route.href}
									onClick={() => setIsOpen(false)}
									className={`transition-colors hover:text-primary ${pathname === route.href ? "text-foreground font-medium" : "text-muted"}`}>
									{route.label}
								</Link>
							))}
							<Button asChild variant="default" size="sm" className="mt-4">
								<Link href="/garden" onClick={() => setIsOpen(false)}>
									Create Your Garden
								</Link>
							</Button>
						</nav>
					</SheetContent>
				</Sheet>

				{/* Mobile Theme Toggle (Visible outside sheet) */}
				<div className="flex items-center md:hidden">
					<ThemeToggle />
				</div>
			</div>
		</motion.header>
	);
}
