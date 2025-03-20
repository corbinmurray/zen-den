"use client";

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
		{ href: "/create", label: "Create Your Garden" },
		{ href: "/about", label: "About" },
	];

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
			<div className="container flex h-16 items-center justify-between">
				<div className="flex items-center gap-2">
					<Link href="/" className="flex items-center gap-2">
						<span className="text-xl font-semibold text-primary">Zen Den</span>
					</Link>
				</div>

				{/* Desktop Navigation */}
				<nav className="hidden md:flex items-center gap-6">
					{routes.map((route) => (
						<Link
							key={route.href}
							href={route.href}
							className={`text-sm transition-colors hover:text-primary ${pathname === route.href ? "text-foreground font-medium" : "text-muted-foreground"}`}>
							{route.label}
						</Link>
					))}
					<Button>Get Started</Button>
				</nav>

				{/* Mobile Navigation */}
				<Sheet open={isOpen} onOpenChange={setIsOpen}>
					<SheetTrigger asChild className="md:hidden">
						<Button variant="ghost" size="icon">
							<Menu className="h-5 w-5" />
							<span className="sr-only">Toggle menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="right" className="w-[240px] sm:w-[300px]">
						<nav className="flex flex-col gap-4 mt-8">
							{routes.map((route) => (
								<Link
									key={route.href}
									href={route.href}
									onClick={() => setIsOpen(false)}
									className={`text-sm transition-colors hover:text-primary ${
										pathname === route.href ? "text-foreground font-medium" : "text-muted-foreground"
									}`}>
									{route.label}
								</Link>
							))}
							<Button className="mt-2">Get Started</Button>
						</nav>
					</SheetContent>
				</Sheet>
			</div>
		</header>
	);
}
