"use client";

import { Button } from "@/components/ui/button";
import { Atmosphere, Garden } from "@/lib/types";
import { copyToClipboard, getGardenShareUrl } from "@/lib/utils";
import { useZenGardenStore } from "@/providers/zen-garden-store-provider";
import { Edit, Eye, Share, Trash } from "lucide-react";
import * as motion from "motion/react-client";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export default function GalleryPage() {
	const { gardens, remove: removeGarden } = useZenGardenStore((state) => state);
	const [sharingGardenIds, setSharingGardenIds] = useState<Record<string, boolean>>({});

	const handleRemove = useCallback(
		(id: string) => {
			toast.error("Remove garden?", {
				description: "Are you sure you want to remove your garden?",
				action: {
					label: "Yes",
					onClick: () => {
						removeGarden(id);
					},
				},
				cancel: {
					label: "Cancel",
					onClick: () => {},
				},
			});
		},
		[removeGarden]
	);

	// Handle share button click
	const handleShare = useCallback(async (garden: Garden) => {
		if (!garden.id) {
			toast.error("Cannot share garden", {
				description: "This garden doesn't have a valid ID.",
			});
			return;
		}

		try {
			setSharingGardenIds((prev) => ({ ...prev, [garden.id as string]: true }));

			const shareUrl = await getGardenShareUrl(garden);

			try {
				await copyToClipboard(shareUrl);
				toast.success("Share link created!", {
					description: "Share link has been copied to your clipboard.",
				});
			} catch {
				toast.info("Share link created!", {
					description: (
						<div className="space-y-2">
							<div>Unable to copy automatically to clipboard. You can:</div>
							<div className="overflow-x-auto rounded bg-background/80 p-2 text-xs font-mono">{shareUrl}</div>
						</div>
					),
					action: {
						label: "Try Copy",
						onClick: () => {
							navigator.clipboard
								.writeText(shareUrl)
								.then(() => {
									toast.success("URL copied to clipboard");
								})
								.catch(() => {
									toast.info("Please select and copy the URL manually", {
										duration: 5000,
									});
								});
						},
					},
					duration: 15000,
				});
			}
		} catch (error) {
			console.error("Error sharing garden:", error);
			toast.error("Failed to create share link", {
				description: "Please try again later.",
			});
		} finally {
			setSharingGardenIds((prev) => ({ ...prev, [garden.id as string]: false }));
		}
	}, []);

	if (gardens.length === 0) {
		return (
			<motion.div
				className="p-8 bg-card rounded-lg text-center shadow-sm flex flex-col items-center justify-center border border-border/30 mt-8"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}>
				<h3 className="text-xl font-medium mb-3">No Saved Gardens</h3>
				<p className="text-muted-foreground mb-6">You haven&apos;t created any zen gardens yet. Start by adding elements to your garden.</p>
				<Link href="/garden">
					<Button variant="default" className="px-6">
						Create Your First Garden
					</Button>
				</Link>
			</motion.div>
		);
	}

	return (
		<div className="max-w-[1400px] mx-auto pb-16 px-4 sm:px-6">
			<div className="mt-6 mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
					<h1 className="text-3xl font-semibold tracking-tight">Your Zen Gardens</h1>
					<p className="text-muted-foreground mt-1">Find tranquility in your saved creations</p>
				</motion.div>

				<Link href="/garden">
					<Button variant="default" className="flex items-center gap-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="lucide lucide-plus">
							<path d="M5 12h14" />
							<path d="M12 5v14" />
						</svg>
						New Garden
					</Button>
				</Link>
			</div>

			<motion.div
				className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.6 }}>
				{gardens
					.sort((a, b) => b.lastModifiedAt - a.lastModifiedAt)
					.map((garden, index) => (
						<GardenCard
							key={garden.id ?? index}
							garden={garden}
							index={index}
							isSharing={garden.id ? sharingGardenIds[garden.id] : false}
							onShare={handleShare}
							onRemove={handleRemove}
						/>
					))}
			</motion.div>
		</div>
	);
}

interface GardenCardProps {
	garden: Garden;
	index: number;
	isSharing: boolean;
	onShare: (garden: Garden) => Promise<void>;
	onRemove: (id: string) => void;
}

function GardenCard({ garden, index, isSharing, onShare, onRemove }: GardenCardProps) {
	return (
		<motion.div
			className="group relative h-[300px] rounded-xl overflow-hidden border border-border/30 shadow-sm hover:shadow-md transition-shadow duration-300"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: index * 0.05 }}>
			{/* Abstract zen background */}
			<div className="absolute inset-0 w-full h-full overflow-hidden">
				<ZenBackground garden={garden} />
			</div>

			{/* Card content with glass effect */}
			<div
				className="absolute inset-0 w-full h-full backdrop-blur-[1px] bg-background/40 dark:bg-background/30 
						   flex flex-col z-10 transition-all duration-300
						   group-hover:backdrop-blur-[2px] group-hover:bg-background/50 dark:group-hover:bg-background/40">
				{/* Top header section with garden name */}
				<div className="p-4 border-b border-border/20 backdrop-blur-sm bg-background/40 dark:bg-background/30 transition-all duration-300">
					<div className="flex justify-between items-center">
						<h3 className="text-lg font-medium truncate mr-2">{garden.name || "Untitled Garden"}</h3>
						<div className="text-xs text-foreground/70 whitespace-nowrap">{new Date(garden.lastModifiedAt).toLocaleDateString()}</div>
					</div>
				</div>

				{/* Main content area */}
				<div className="flex-grow flex flex-col justify-end p-4">
					{/* Action buttons */}
					<div className="space-y-2.5">
						<div className="grid grid-cols-3 gap-2.5">
							<Link href={`/garden?id=${garden.id}`} className="col-span-1">
								<Button size="sm" variant="outline" className="w-full bg-background/50 hover:bg-primary hover:text-primary-foreground transition-colors">
									<Edit className="h-3.5 w-3.5 mr-1.5" />
									Edit
								</Button>
							</Link>

							<Button
								size="sm"
								variant="outline"
								className="col-span-1 bg-background/50 hover:bg-secondary hover:text-secondary-foreground transition-colors"
								onClick={() => onShare(garden)}
								disabled={isSharing}>
								{isSharing ? (
									<>
										<span className="h-3.5 w-3.5 inline-block rounded-full border-2 border-current border-t-transparent animate-spin mr-1.5" />
										Sharing
									</>
								) : (
									<>
										<Share className="h-3.5 w-3.5 mr-1.5" />
										Share
									</>
								)}
							</Button>

							<Link href={`/view?id=${garden.id}`} className="col-span-1">
								<Button size="sm" variant="outline" className="w-full bg-background/50 hover:bg-accent hover:text-accent-foreground transition-colors">
									<Eye className="h-3.5 w-3.5 mr-1.5" />
									View
								</Button>
							</Link>
						</div>

						<Button
							onClick={() => (garden.id ? onRemove(garden.id) : null)}
							size="sm"
							variant="outline"
							className="w-full bg-background/50 hover:bg-destructive hover:text-destructive-foreground text-destructive/80 transition-colors">
							<Trash className="h-3.5 w-3.5 mr-1.5" />
							Delete
						</Button>
					</div>
				</div>
			</div>
		</motion.div>
	);
}

// New ZenBackground component with abstract, minimalist designs
function ZenBackground({ garden }: { garden: Garden }) {
	// Choose a zen pattern based on garden id to ensure consistency for the same garden
	const patternType = getPatternType(garden);

	return (
		<div className="relative w-full h-full">
			{patternType === "circles" && <ZenCirclesPattern garden={garden} />}
			{patternType === "waves" && <ZenWavesPattern garden={garden} />}
			{patternType === "terrain" && <ZenTerrainPattern garden={garden} />}
			{patternType === "zen" && <ZenSandPattern garden={garden} />}
		</div>
	);
}

// Helper to determine pattern type based on garden id
function getPatternType(garden: Garden): "circles" | "waves" | "terrain" | "zen" {
	const patterns = ["circles", "waves", "terrain", "zen"] as const;

	if (!garden.id) return "circles";

	// Use the first character of the ID to select a pattern
	const charCode = garden.id.charCodeAt(0);
	const index = charCode % patterns.length;

	return patterns[index];
}

// Abstract circle pattern - minimal, floating circles
function ZenCirclesPattern({ garden }: { garden: Garden }) {
	// Base colors from atmosphere or defaults
	const baseColor = getBaseColorFromAtmosphere(garden.atmosphere);

	return (
		<div className={`absolute inset-0 w-full h-full ${baseColor.background}`}>
			{/* Large circle */}
			<motion.div
				className={`absolute rounded-full ${baseColor.primary}`}
				style={{
					width: "40%",
					height: "40%",
					left: "30%",
					top: "30%",
					filter: "blur(40px)",
				}}
				animate={{
					scale: [1, 1.05, 1],
					opacity: [0.6, 0.7, 0.6],
				}}
				transition={{
					duration: 10,
					repeat: Infinity,
					repeatType: "mirror",
					ease: "easeInOut",
				}}
			/>

			{/* Small floating circles */}
			{Array.from({ length: 5 }).map((_, i) => (
				<motion.div
					key={i}
					className={`absolute rounded-full ${baseColor.accent}`}
					style={{
						width: `${8 + i * 4}px`,
						height: `${8 + i * 4}px`,
						left: `${10 + i * 20}%`,
						top: `${15 + i * 15}%`,
						filter: "blur(3px)",
					}}
					animate={{
						x: [0, 5, 0],
						y: [0, -3, 0],
						opacity: [0.5, 0.6, 0.5],
					}}
					transition={{
						duration: 12 + i * 2,
						repeat: Infinity,
						repeatType: "mirror",
						ease: "easeInOut",
						delay: i * 0.5,
					}}
				/>
			))}

			{/* Horizontal line */}
			<motion.div
				className={`absolute ${baseColor.secondary} h-[0.5px]`}
				style={{
					width: "70%",
					left: "15%",
					top: "70%",
				}}
				animate={{
					opacity: [0.3, 0.4, 0.3],
					width: ["70%", "65%", "70%"],
				}}
				transition={{
					duration: 15,
					repeat: Infinity,
					repeatType: "mirror",
					ease: "easeInOut",
				}}
			/>
		</div>
	);
}

// Wave pattern - gentle, flowing curves
function ZenWavesPattern({ garden }: { garden: Garden }) {
	const baseColor = getBaseColorFromAtmosphere(garden.atmosphere);

	return (
		<div className={`absolute inset-0 w-full h-full ${baseColor.background}`}>
			{/* Horizontal waves */}
			{Array.from({ length: 3 }).map((_, i) => (
				<motion.div
					key={i}
					className={`absolute ${baseColor.primary} h-[1px]`}
					style={{
						width: "100%",
						left: "0",
						top: `${50 + i * 10}%`,
						filter: "blur(3px)",
					}}
					animate={{
						y: [0, 5, 0],
						opacity: [0.5, 0.6, 0.5],
					}}
					transition={{
						duration: 15 - i * 2,
						repeat: Infinity,
						repeatType: "mirror",
						ease: "easeInOut",
						delay: i * 0.7,
					}}
				/>
			))}

			{/* Wave accent */}
			<motion.div className="absolute left-0 top-0 w-full h-full" style={{ opacity: 0.5 }}>
				<svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full" style={{ opacity: 0.4 }}>
					<motion.path
						d="M0,50 C20,40 35,60 50,50 C65,40 80,60 100,50"
						stroke={baseColor.accentStroke}
						strokeWidth="0.5"
						fill="none"
						animate={{
							d: [
								"M0,50 C20,45 35,55 50,50 C65,45 80,55 100,50",
								"M0,50 C20,55 35,45 50,50 C65,55 80,45 100,50",
								"M0,50 C20,45 35,55 50,50 C65,45 80,55 100,50",
							],
						}}
						transition={{
							duration: 25,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>
				</svg>
			</motion.div>

			{/* Floating circle accent */}
			<motion.div
				className={`absolute rounded-full ${baseColor.accent}`}
				style={{
					width: "15%",
					height: "15%",
					right: "15%",
					top: "25%",
					filter: "blur(20px)",
				}}
				animate={{
					opacity: [0.3, 0.4, 0.3],
					x: [0, 5, 0],
					y: [0, -5, 0],
				}}
				transition={{
					duration: 18,
					repeat: Infinity,
					repeatType: "mirror",
					ease: "easeInOut",
				}}
			/>
		</div>
	);
}

// Terrain/mountain-inspired pattern
function ZenTerrainPattern({ garden }: { garden: Garden }) {
	const baseColor = getBaseColorFromAtmosphere(garden.atmosphere);

	return (
		<div className={`absolute inset-0 w-full h-full ${baseColor.background}`}>
			{/* Background shape */}
			<div className="absolute inset-0">
				<svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
					<motion.path
						d="M0,100 L0,65 C10,60 20,70 30,65 C40,60 50,55 60,65 C70,75 80,60 90,65 L100,70 L100,100 Z"
						fill={baseColor.primaryFill}
						animate={{
							d: [
								"M0,100 L0,65 C10,60 20,70 30,65 C40,60 50,55 60,65 C70,75 80,60 90,65 L100,70 L100,100 Z",
								"M0,100 L0,68 C10,63 20,65 30,68 C40,73 50,60 60,63 C70,67 80,65 90,63 L100,68 L100,100 Z",
								"M0,100 L0,65 C10,60 20,70 30,65 C40,60 50,55 60,65 C70,75 80,60 90,65 L100,70 L100,100 Z",
							],
						}}
						transition={{
							duration: 30,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>
				</svg>
			</div>

			{/* Foreground mountains */}
			<div className="absolute inset-0">
				<svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
					<motion.path
						d="M0,100 L0,75 C15,70 25,80 40,75 C55,70 60,80 75,75 L100,80 L100,100 Z"
						fill={baseColor.secondaryFill}
						animate={{
							d: [
								"M0,100 L0,75 C15,70 25,80 40,75 C55,70 60,80 75,75 L100,80 L100,100 Z",
								"M0,100 L0,78 C15,73 25,75 40,78 C55,82 60,75 75,73 L100,78 L100,100 Z",
								"M0,100 L0,75 C15,70 25,80 40,75 C55,70 60,80 75,75 L100,80 L100,100 Z",
							],
						}}
						transition={{
							duration: 25,
							repeat: Infinity,
							ease: "easeInOut",
							delay: 2,
						}}
					/>
				</svg>
			</div>

			{/* Sun/moon */}
			<motion.div
				className={`absolute rounded-full ${baseColor.accent}`}
				style={{
					width: "12%",
					height: "12%",
					right: "20%",
					top: "25%",
					filter: "blur(4px)",
				}}
				animate={{
					opacity: [0.6, 0.7, 0.6],
					scale: [1, 1.05, 1],
				}}
				transition={{
					duration: 10,
					repeat: Infinity,
					repeatType: "mirror",
					ease: "easeInOut",
				}}
			/>
		</div>
	);
}

// Zen sand garden pattern with raked lines
function ZenSandPattern({ garden }: { garden: Garden }) {
	const baseColor = getBaseColorFromAtmosphere(garden.atmosphere);

	return (
		<div className={`absolute inset-0 w-full h-full ${baseColor.background}`}>
			{/* Sand texture with subtle gradient */}
			<div className={`absolute inset-0 w-full h-full opacity-30 ${baseColor.sandTexture}`} />

			{/* Horizontal raked lines */}
			{Array.from({ length: 12 }).map((_, i) => (
				<motion.div
					key={i}
					className={`absolute ${baseColor.primary} h-[1px]`}
					style={{
						width: "90%",
						left: "5%",
						top: `${20 + i * 5}%`,
						opacity: 0.4,
					}}
					animate={{
						opacity: [0.3, 0.4, 0.3],
						width: ["90%", "87%", "90%"],
					}}
					transition={{
						duration: 18,
						repeat: Infinity,
						repeatType: "mirror",
						ease: "easeInOut",
						delay: i * 0.1,
					}}
				/>
			))}

			{/* Rock/stone element */}
			<motion.div
				className={`absolute ${baseColor.rockColor} rounded-lg`}
				style={{
					width: "15%",
					height: "12%",
					right: "20%",
					top: "35%",
					transform: "rotate(5deg)",
					filter: "blur(1px)",
					opacity: 0.8,
				}}
				animate={{
					opacity: [0.7, 0.8, 0.7],
					rotate: [5, 4, 5],
				}}
				transition={{
					duration: 12,
					repeat: Infinity,
					repeatType: "mirror",
					ease: "easeInOut",
				}}
			/>

			{/* Path around rock */}
			<motion.div className="absolute left-0 top-0 w-full h-full" style={{ opacity: 0.5 }}>
				<svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
					<motion.path
						d="M0,45 C30,45 50,30 65,45 C80,60 100,45 100,45"
						stroke={baseColor.accentStroke}
						strokeWidth="0.5"
						fill="none"
						animate={{
							d: [
								"M0,45 C30,45 50,30 65,45 C80,60 100,45 100,45",
								"M0,45 C30,46 50,31 65,44 C80,59 100,44 100,45",
								"M0,45 C30,45 50,30 65,45 C80,60 100,45 100,45",
							],
						}}
						transition={{
							duration: 25,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>
				</svg>
			</motion.div>
		</div>
	);
}

// Helper function to get color scheme based on atmosphere
function getBaseColorFromAtmosphere(atmosphere?: Atmosphere) {
	// Zen-inspired color palette based on traditional Japanese aesthetics
	// Using more refined, subtle colors with lower opacity for elegance

	// Default zen garden colors - wabi-sabi aesthetic with refined tones
	if (!atmosphere) {
		return {
			// Neutral sand/paper tones with subtle gradients
			background: "bg-gradient-to-b from-[#f9f6f2] to-[#f2ede6] dark:from-[#1a1814]/90 dark:to-[#211f1b]",
			primary: "bg-[#d9c7b3]/20 dark:bg-[#9c8c7a]/20", // Warm beige
			secondary: "bg-[#7a7267]/15 dark:bg-[#5c544c]/15", // Stone gray
			accent: "bg-[#5c8984]/20 dark:bg-[#38565c]/20", // Sage/pine
			primaryFill: "rgba(217, 199, 179, 0.15)",
			secondaryFill: "rgba(122, 114, 103, 0.08)",
			accentStroke: "rgba(92, 137, 132, 0.2)",
			sandTexture: "bg-[#e5ddd1]/30 dark:bg-[#2c261e]/30",
			rockColor: "bg-[#7a7267] dark:bg-[#4a443c]",
		};
	}

	const { timeOfDay, weather } = atmosphere;

	// Day themes
	if (timeOfDay === "day") {
		if (weather === "clear") {
			return {
				// Asagi (light blue) and natural tones
				background: "bg-gradient-to-b from-[#f0f6f9] to-[#e9f1f6] dark:from-[#172029]/95 dark:to-[#1d2833]",
				primary: "bg-[#7db9c7]/20 dark:bg-[#4a7c8c]/20", // Asagi blue
				secondary: "bg-[#c7b370]/15 dark:bg-[#8c7d40]/15", // Kihada (subtle gold)
				accent: "bg-[#a2bc9f]/20 dark:bg-[#708c6a]/20", // Matcha
				primaryFill: "rgba(125, 185, 199, 0.15)",
				secondaryFill: "rgba(199, 179, 112, 0.08)",
				accentStroke: "rgba(162, 188, 159, 0.2)",
				sandTexture: "bg-[#f0eee0]/25 dark:bg-[#2c3626]/15",
				rockColor: "bg-[#7a7267] dark:bg-[#4a443c]",
			};
		}
		if (weather === "cloudy") {
			return {
				// Nezumi (mouse gray) and muted tones
				background: "bg-gradient-to-b from-[#f4f4f2] to-[#eaeae8] dark:from-[#222222]/95 dark:to-[#2a2a2a]",
				primary: "bg-[#a3a7ad]/20 dark:bg-[#626569]/20", // Nezumi gray
				secondary: "bg-[#8f8778]/15 dark:bg-[#635c4e]/15", // Rikyū brown
				accent: "bg-[#76859c]/15 dark:bg-[#4a5871]/15", // Mizu asagi (water blue)
				primaryFill: "rgba(163, 167, 173, 0.15)",
				secondaryFill: "rgba(143, 135, 120, 0.08)",
				accentStroke: "rgba(118, 133, 156, 0.2)",
				sandTexture: "bg-[#e3e1d9]/15 dark:bg-[#33312e]/15",
				rockColor: "bg-[#7c7670] dark:bg-[#4e4a46]",
			};
		}
		if (weather === "rainy") {
			return {
				// Fukiasagi (rain blue) and slate tones
				background: "bg-gradient-to-b from-[#eef2f6] to-[#e6ecf3] dark:from-[#1c2229]/95 dark:to-[#21282f]",
				primary: "bg-[#8ba0b1]/20 dark:bg-[#5c7082]/20", // Fukiasagi
				secondary: "bg-[#a6b0bb]/15 dark:bg-[#656e79]/15", // Slate
				accent: "bg-[#9ba89f]/15 dark:bg-[#667268]/15", // Rokushō (verdigris)
				primaryFill: "rgba(139, 160, 177, 0.12)",
				secondaryFill: "rgba(166, 176, 187, 0.08)",
				accentStroke: "rgba(155, 168, 159, 0.15)",
				sandTexture: "bg-[#e6eaed]/25 dark:bg-[#293036]/25",
				rockColor: "bg-[#7c7c7c] dark:bg-[#4e4e4e]",
			};
		}
		if (weather === "snowy") {
			return {
				// Shironeri (white) and cool soft tones
				background: "bg-gradient-to-b from-[#f9fafc] to-[#f2f5f8] dark:from-[#1d2126]/95 dark:to-[#1e2430]",
				primary: "bg-[#f0f0f0]/30 dark:bg-[#aaa9b2]/10", // Shironeri
				secondary: "bg-[#b0c4d9]/20 dark:bg-[#6a7f99]/20", // Pale indigo
				accent: "bg-[#cad8e0]/20 dark:bg-[#768c99]/20", // Geppaku (moon white)
				primaryFill: "rgba(240, 240, 240, 0.2)",
				secondaryFill: "rgba(176, 196, 217, 0.1)",
				accentStroke: "rgba(202, 216, 224, 0.25)",
				sandTexture: "bg-[#f5f5f5]/15 dark:bg-[#1f2937]/5",
				rockColor: "bg-[#b3b9c1] dark:bg-[#566473]",
			};
		}
	}

	// Sunset themes
	if (timeOfDay === "sunset") {
		if (weather === "clear") {
			return {
				// Akane (deep red) and sunset tones
				background: "bg-gradient-to-b from-[#f6efe9] to-[#f3e8e0] dark:from-[#291e18]/95 dark:to-[#2c211b]",
				primary: "bg-[#d98a74]/20 dark:bg-[#994f3a]/20", // Akane
				secondary: "bg-[#ba9b7c]/15 dark:bg-[#8c6c4a]/15", // Kogecha (tea brown)
				accent: "bg-[#c18a76]/20 dark:bg-[#945a46]/20", // Kachiiro (persimmon)
				primaryFill: "rgba(217, 138, 116, 0.12)",
				secondaryFill: "rgba(186, 155, 124, 0.08)",
				accentStroke: "rgba(193, 138, 118, 0.15)",
				sandTexture: "bg-[#f0e9e2]/25 dark:bg-[#33281f]/15",
				rockColor: "bg-[#8c7b6a] dark:bg-[#5c4e40]",
			};
		}
		if (weather === "cloudy") {
			return {
				// Kurenai (crimson) with muted tones
				background: "bg-gradient-to-b from-[#f2eae5] to-[#ebe2dc] dark:from-[#2b221f]/95 dark:to-[#2e2623]",
				primary: "bg-[#c48368]/20 dark:bg-[#8c5842]/20", // Kurenai
				secondary: "bg-[#a99785]/15 dark:bg-[#7a6855]/15", // Tsuchi (earth)
				accent: "bg-[#9e9478]/15 dark:bg-[#6d644a]/15", // Rikyū (tea ceremony brown)
				primaryFill: "rgba(196, 131, 104, 0.12)",
				secondaryFill: "rgba(169, 151, 133, 0.08)",
				accentStroke: "rgba(158, 148, 120, 0.15)",
				sandTexture: "bg-[#ebe4db]/15 dark:bg-[#34291f]/10",
				rockColor: "bg-[#8a7d70] dark:bg-[#5a4e44]",
			};
		}
		// Other weather patterns - fallback to general sunset theme
		return {
			// Cha (tea) and sunset tones
			background: "bg-gradient-to-b from-[#f4eee8] to-[#efe6dd] dark:from-[#2a211c]/95 dark:to-[#2e241d]",
			primary: "bg-[#c08a6c]/20 dark:bg-[#8c5e40]/20", // Cha
			secondary: "bg-[#ad9c7e]/15 dark:bg-[#7d6c4e]/15", // Yamabuki (mountain gold)
			accent: "bg-[#af7958]/15 dark:bg-[#7f492a]/15", // Kogecha (deep brown)
			primaryFill: "rgba(192, 138, 108, 0.12)",
			secondaryFill: "rgba(173, 156, 126, 0.08)",
			accentStroke: "rgba(175, 121, 88, 0.15)",
			sandTexture: "bg-[#ede5db]/25 dark:bg-[#33281e]/15",
			rockColor: "bg-[#8c7b6a] dark:bg-[#5c4e40]",
		};
	}

	// Night themes
	if (timeOfDay === "night") {
		if (weather === "clear") {
			return {
				// Kon (navy) and night tones
				background: "bg-gradient-to-b from-[#1e2637] to-[#171d2c] dark:from-[#121926]/95 dark:to-[#0e131d]",
				primary: "bg-[#364c70]/15 dark:bg-[#1f3a61]/15", // Kon
				secondary: "bg-[#4e5c80]/10 dark:bg-[#304266]/10", // Ruri (lapis)
				accent: "bg-[#7d92ad]/15 dark:bg-[#4e658c]/15", // Fujinezumi (wisteria gray)
				primaryFill: "rgba(54, 76, 112, 0.08)",
				secondaryFill: "rgba(78, 92, 128, 0.05)",
				accentStroke: "rgba(125, 146, 173, 0.12)",
				sandTexture: "bg-[#2c3542]/8 dark:bg-[#1c232d]/8",
				rockColor: "bg-[#3d4654] dark:bg-[#232932]",
			};
		}
		// Other weather patterns - fallback to general night theme
		return {
			// Kachi (victory blue) and calm night tones
			background: "bg-gradient-to-b from-[#212836] to-[#1a202c] dark:from-[#131720]/95 dark:to-[#0f131a]",
			primary: "bg-[#455776]/15 dark:bg-[#2e4266]/15", // Kachi
			secondary: "bg-[#394c6b]/10 dark:bg-[#243756]/10", // Rurikon (dark blue)
			accent: "bg-[#6d8796]/12 dark:bg-[#435966]/12", // Ainezu (indigo gray)
			primaryFill: "rgba(69, 87, 118, 0.08)",
			secondaryFill: "rgba(57, 76, 107, 0.05)",
			accentStroke: "rgba(109, 135, 150, 0.1)",
			sandTexture: "bg-[#2a303c]/8 dark:bg-[#1a1f28]/8",
			rockColor: "bg-[#3d434f] dark:bg-[#262c36]",
		};
	}

	// Default fallback - same as initial default but with refined values
	return {
		background: "bg-gradient-to-b from-[#f9f6f2] to-[#f2ede6] dark:from-[#1a1814]/90 dark:to-[#211f1b]",
		primary: "bg-[#d9c7b3]/20 dark:bg-[#9c8c7a]/20", // Warm beige
		secondary: "bg-[#7a7267]/15 dark:bg-[#5c544c]/15", // Stone gray
		accent: "bg-[#5c8984]/20 dark:bg-[#38565c]/20", // Sage/pine
		primaryFill: "rgba(217, 199, 179, 0.15)",
		secondaryFill: "rgba(122, 114, 103, 0.08)",
		accentStroke: "rgba(92, 137, 132, 0.2)",
		sandTexture: "bg-[#e5ddd1]/30 dark:bg-[#2c261e]/30",
		rockColor: "bg-[#7a7267] dark:bg-[#4a443c]",
	};
}
