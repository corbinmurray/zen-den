import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
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
	title: "Zen Garden - Digital Sanctuary",
	description: "A peaceful digital space showcasing design aesthetics and projects with a zen-like calm",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
					<ZenGardenStoreProvider>
						<Navigation />
						<main className="container px-4 mx-auto py-16">{children}</main>
						<Footer />
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
