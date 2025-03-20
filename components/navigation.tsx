"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

export function Navigation() {
	const [isOpen, setIsOpen] = React.useState(false);
	const pathname = usePathname();

	const routes = [
		{ href: "/", label: "Home" },
		{ href: "/gallery", label: "Gallery" },
		{ href: "/garden", label: "Create Your Garden" },
		{ href: "/about", label: "About" },
	];

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
			<div className="container mx-auto flex h-16 items-center justify-between">
				<div className="flex items-center gap-2">
					<Link href="/" className="flex items-center gap-2">
						<span className="text-2xl font-semibold text-primary">Zen Den</span>
					</Link>
				</div>

				{/* Desktop Navigation */}
				<nav className="hidden md:flex items-center gap-6">
					{routes.map((route) => (
						<Link
							key={route.href}
							href={route.href}
							className={`transition-colors hover:text-primary ${pathname === route.href ? "text-foreground font-medium" : "text-muted"}`}>
							{route.label}
						</Link>
					))}
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
						</nav>
					</SheetContent>
				</Sheet>

				{/* Mobile Theme Toggle (Visible outside sheet) */}
				<div className="flex items-center md:hidden">
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
