import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ZenGardenStoreProvider } from "@/providers/zen-garden-store-provider";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Zen Den - Create Your Digital Zen Garden",
	description: "Design your own tranquil digital space where you can arrange elements like stones, plants, and water features for mindfulness and relaxation.",
	keywords: ["zen garden", "digital garden", "mindfulness", "relaxation", "meditation", "zen den"],
	authors: [{ name: "Zen Den Team" }],
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "https://zenden.app",
		title: "Zen Den - Create Your Digital Zen Garden",
		description: "Design your own tranquil digital space where you can arrange elements like stones, plants, and water features.",
		siteName: "Zen Den",
	},
	twitter: {
		card: "summary_large_image",
		title: "Zen Den - Create Your Digital Zen Garden",
		description: "Design your own tranquil digital space where you can arrange elements like stones, plants, and water features.",
	},
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#09090b" },
	],
	width: "device-width",
	initialScale: 1,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					<ZenGardenStoreProvider>
						<div className="flex min-h-screen flex-col">
							<Navigation />
							<main className="container mx-auto px-4 py-16 flex-1">{children}</main>
							<Footer />
						</div>
						<Toaster
							position="top-center"
							closeButton
							richColors
							toastOptions={{
								duration: 3000,
								className: "border border-border shadow-md",
								classNames: {
									toast: "group flex",
									title: "font-medium text-foreground",
									description: "text-muted-foreground text-sm mt-1",
									actionButton: "bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-medium px-3 py-1.5 rounded-md",
									cancelButton: "bg-muted text-muted-foreground hover:bg-muted/80 text-xs font-medium px-3 py-1.5 rounded-md",
									error: "bg-destructive/10 border-destructive/20 text-destructive dark:bg-destructive/20",
									success: "bg-primary/10 border-primary/20 dark:bg-primary/20",
									info: "bg-secondary/10 border-secondary/20 text-secondary-foreground dark:bg-secondary/20",
									warning: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 dark:bg-amber-500/20",
								},
							}}
						/>
					</ZenGardenStoreProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
