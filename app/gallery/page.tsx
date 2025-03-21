"use client";

import { Button } from "@/components/ui/button";
import { Atmosphere, Garden } from "@/lib/types";
import { copyToClipboard, shareGarden } from "@/lib/utils";
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

			const shareUrl = await shareGarden(garden);
			await copyToClipboard(shareUrl);

			toast.success("Share link created!", {
				description: "Share link has been copied to your clipboard.",
			});
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
				className="p-8 bg-card border border-border rounded-lg text-center shadow-sm flex flex-col items-center justify-center"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}>
				<h3 className="text-xl font-medium mb-3">No Saved Gardens</h3>
				<p className="text-muted mb-6">You haven&apos;t created any zen gardens yet. Start by adding elements to your garden.</p>
			</motion.div>
		);
	}

	return (
		<div className="space-y-8 min-h-[100vh] pb-12">
			<motion.h2
				className="text-2xl font-semibold tracking-tight"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}>
				Your Zen Garden Collection
			</motion.h2>

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
			className="group relative h-[300px] rounded-xl overflow-hidden"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: index * 0.05 }}
			whileHover={{ y: -5, transition: { duration: 0.2 } }}>
			{/* Abstract zen background */}
			<div className="absolute inset-0 w-full h-full overflow-hidden">
				<ZenBackground garden={garden} />
			</div>

			{/* Card content with glass effect */}
			<div
				className="absolute inset-0 w-full h-full backdrop-blur-[2px] bg-background/30 dark:bg-background/20 
						    border border-border/50 shadow-lg flex flex-col z-10 transition-all duration-300
						    group-hover:backdrop-blur-[1px] group-hover:bg-background/20 dark:group-hover:bg-background/10">
				{/* Top header section with garden name */}
				<div className="p-5 border-b border-border/40 backdrop-blur-sm bg-background/40 dark:bg-background/20">
					<div className="flex justify-between items-center">
						<h3 className="text-lg font-medium truncate mr-2">{garden.name || "Untitled Garden"}</h3>
						<div className="text-xs text-foreground/70 whitespace-nowrap">{new Date(garden.lastModifiedAt).toLocaleDateString()}</div>
					</div>
				</div>

				{/* Main content area */}
				<div className="flex-grow flex flex-col justify-end p-5">
					{/* Action buttons */}
					<div className="space-y-3">
						<div className="grid grid-cols-3 gap-3">
							<Link href={`/garden?id=${garden.id}`} className="col-span-1 group/edit">
								<Button
									size="sm"
									className="w-full bg-background/70 backdrop-blur-sm border border-border/50 text-foreground
											  hover:bg-primary/90 hover:text-primary-foreground hover:border-primary/90 
											  transition-all duration-300">
									<Edit className="h-3.5 w-3.5 group-hover/edit:rotate-12 transition-transform" />
									Edit
								</Button>
							</Link>

							<Button
								size="sm"
								className="col-span-1 group/share bg-background/70 backdrop-blur-sm border border-border/50 text-foreground
										  hover:bg-secondary/90 hover:text-white hover:border-secondary/90
										  transition-all duration-300"
								onClick={() => onShare(garden)}
								disabled={isSharing}>
								{isSharing ? (
									<>
										<span className="h-3.5 w-3.5 inline-block rounded-full border-2 border-current border-t-transparent animate-spin" />
										Sharing...
									</>
								) : (
									<>
										<Share className="h-3.5 w-3.5 group-hover/share:scale-110 transition-transform" />
										Share
									</>
								)}
							</Button>

							<Link href={`/view?id=${garden.id}`} className="col-span-1 group/view">
								<Button
									size="sm"
									className="w-full bg-background/70 backdrop-blur-sm border border-border/50 text-foreground
											  hover:bg-accent/90 hover:text-accent-foreground hover:border-accent/90
											  transition-all duration-300">
									<Eye className="h-3.5 w-3.5 group-hover/view:scale-110 transition-transform" />
									View
								</Button>
							</Link>
						</div>

						<Button
							onClick={() => (garden.id ? onRemove(garden.id) : null)}
							size="sm"
							className="w-full group/delete bg-background/70 backdrop-blur-sm border border-destructive/40 text-destructive
									  hover:bg-destructive hover:border-destructive hover:text-foreground
									  transition-all duration-300">
							<Trash className="h-3.5 w-3.5 group-hover/delete:rotate-12 transition-transform" />
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
					scale: [1, 1.1, 1],
					opacity: [0.6, 0.8, 0.6],
				}}
				transition={{
					duration: 8,
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
						filter: "blur(4px)",
					}}
					animate={{
						x: [0, 10, 5, -5, 0],
						y: [0, -5, 10, 5, 0],
						opacity: [0.5, 0.7, 0.5],
					}}
					transition={{
						duration: 10 + i * 2,
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
					opacity: [0.3, 0.6, 0.3],
					width: ["70%", "60%", "70%"],
				}}
				transition={{
					duration: 12,
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
						filter: "blur(4px)",
					}}
					animate={{
						y: [0, 10, -5, 0],
						opacity: [0.5, 0.7, 0.5],
					}}
					transition={{
						duration: 12 - i * 2,
						repeat: Infinity,
						repeatType: "mirror",
						ease: "easeInOut",
						delay: i * 0.7,
					}}
				/>
			))}

			{/* Wave accent */}
			<motion.div className="absolute left-0 top-0 w-full h-full" style={{ opacity: 0.6 }}>
				<svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full" style={{ opacity: 0.5 }}>
					<motion.path
						d="M0,50 C20,40 35,60 50,50 C65,40 80,60 100,50"
						stroke={baseColor.accentStroke}
						strokeWidth="0.5"
						fill="none"
						animate={{
							d: [
								"M0,50 C20,40 35,60 50,50 C65,40 80,60 100,50",
								"M0,50 C20,60 35,40 50,50 C65,60 80,40 100,50",
								"M0,50 C20,40 35,60 50,50 C65,40 80,60 100,50",
							],
						}}
						transition={{
							duration: 20,
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
					opacity: [0.3, 0.5, 0.3],
					x: [0, 10, 0],
					y: [0, -10, 0],
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
								"M0,100 L0,70 C10,65 20,60 30,70 C40,80 50,65 60,60 C70,55 80,70 90,60 L100,65 L100,100 Z",
								"M0,100 L0,65 C10,60 20,70 30,65 C40,60 50,55 60,65 C70,75 80,60 90,65 L100,70 L100,100 Z",
							],
						}}
						transition={{
							duration: 25,
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
								"M0,100 L0,80 C15,75 25,70 40,80 C55,90 60,75 75,70 L100,75 L100,100 Z",
								"M0,100 L0,75 C15,70 25,80 40,75 C55,70 60,80 75,75 L100,80 L100,100 Z",
							],
						}}
						transition={{
							duration: 20,
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
					opacity: [0.6, 0.8, 0.6],
					scale: [1, 1.1, 1],
				}}
				transition={{
					duration: 8,
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
						opacity: [0.3, 0.5, 0.3],
						width: ["90%", "85%", "90%"],
					}}
					transition={{
						duration: 15,
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
					transform: "rotate(10deg)",
					filter: "blur(1px)",
					opacity: 0.8,
				}}
				animate={{
					opacity: [0.7, 0.9, 0.7],
					rotate: [10, 8, 10],
				}}
				transition={{
					duration: 10,
					repeat: Infinity,
					repeatType: "mirror",
					ease: "easeInOut",
				}}
			/>

			{/* Path around rock */}
			<motion.div className="absolute left-0 top-0 w-full h-full" style={{ opacity: 0.6 }}>
				<svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
					<motion.path
						d="M0,45 C30,45 50,30 65,45 C80,60 100,45 100,45"
						stroke={baseColor.accentStroke}
						strokeWidth="0.5"
						fill="none"
						animate={{
							d: [
								"M0,45 C30,45 50,30 65,45 C80,60 100,45 100,45",
								"M0,45 C30,47 50,32 65,43 C80,58 100,43 100,45",
								"M0,45 C30,45 50,30 65,45 C80,60 100,45 100,45",
							],
						}}
						transition={{
							duration: 20,
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
	// We'll use more subdued, natural colors that evoke tranquility and harmony

	// Default zen garden colors - inspired by wabi-sabi aesthetic
	if (!atmosphere) {
		return {
			// Neutral sand/paper tones
			background: "bg-gradient-to-b from-[#f8f5f0] to-[#efe9e1] dark:from-[#1a1814] dark:to-[#211f1b]",
			primary: "bg-[#d9c7b3]/30 dark:bg-[#9c8c7a]/30", // Warm beige
			secondary: "bg-[#7a7267]/20 dark:bg-[#5c544c]/20", // Stone gray
			accent: "bg-[#5c8984]/30 dark:bg-[#38565c]/30", // Sage/pine
			primaryFill: "rgba(217, 199, 179, 0.2)",
			secondaryFill: "rgba(122, 114, 103, 0.1)",
			accentStroke: "rgba(92, 137, 132, 0.25)",
			sandTexture: "bg-[#e5ddd1]/40 dark:bg-[#2c261e]/40",
			rockColor: "bg-[#7a7267] dark:bg-[#4a443c]",
		};
	}

	const { timeOfDay, weather } = atmosphere;

	// Day themes
	if (timeOfDay === "day") {
		if (weather === "clear") {
			return {
				// Asagi (light blue) and natural tones
				background: "bg-gradient-to-b from-[#edf5f8] to-[#e7f0f5] dark:from-[#172029] dark:to-[#1d2833]",
				primary: "bg-[#7db9c7]/30 dark:bg-[#4a7c8c]/30", // Asagi blue
				secondary: "bg-[#c7b370]/20 dark:bg-[#8c7d40]/20", // Kihada (subtle gold)
				accent: "bg-[#a2bc9f]/30 dark:bg-[#708c6a]/30", // Matcha
				primaryFill: "rgba(125, 185, 199, 0.2)",
				secondaryFill: "rgba(199, 179, 112, 0.1)",
				accentStroke: "rgba(162, 188, 159, 0.3)",
				sandTexture: "bg-[#f0eee0]/30 dark:bg-[#2c3626]/20",
				rockColor: "bg-[#7a7267] dark:bg-[#4a443c]",
			};
		}
		if (weather === "cloudy") {
			return {
				// Nezumi (mouse gray) and muted tones
				background: "bg-gradient-to-b from-[#f2f2f0] to-[#e8e8e6] dark:from-[#222222] dark:to-[#2a2a2a]",
				primary: "bg-[#a3a7ad]/30 dark:bg-[#626569]/30", // Nezumi gray
				secondary: "bg-[#8f8778]/20 dark:bg-[#635c4e]/20", // Rikyū brown
				accent: "bg-[#76859c]/20 dark:bg-[#4a5871]/20", // Mizu asagi (water blue)
				primaryFill: "rgba(163, 167, 173, 0.2)",
				secondaryFill: "rgba(143, 135, 120, 0.1)",
				accentStroke: "rgba(118, 133, 156, 0.25)",
				sandTexture: "bg-[#e3e1d9]/20 dark:bg-[#33312e]/20",
				rockColor: "bg-[#7c7670] dark:bg-[#4e4a46]",
			};
		}
		if (weather === "rainy") {
			return {
				// Fukiasagi (rain blue) and slate tones
				background: "bg-gradient-to-b from-[#edf1f5] to-[#e3e9f0] dark:from-[#1c2229] dark:to-[#21282f]",
				primary: "bg-[#8ba0b1]/30 dark:bg-[#5c7082]/30", // Fukiasagi
				secondary: "bg-[#a6b0bb]/20 dark:bg-[#656e79]/20", // Slate
				accent: "bg-[#9ba89f]/20 dark:bg-[#667268]/20", // Rokushō (verdigris)
				primaryFill: "rgba(139, 160, 177, 0.15)",
				secondaryFill: "rgba(166, 176, 187, 0.1)",
				accentStroke: "rgba(155, 168, 159, 0.2)",
				sandTexture: "bg-[#e6eaed]/30 dark:bg-[#293036]/30",
				rockColor: "bg-[#7c7c7c] dark:bg-[#4e4e4e]",
			};
		}
		if (weather === "snowy") {
			return {
				// Shironeri (white) and cool soft tones
				background: "bg-gradient-to-b from-[#f9f9fa] to-[#f0f3f5] dark:from-[#1d2126] dark:to-[#1e2430]",
				primary: "bg-[#f0f0f0]/40 dark:bg-[#aaa9b2]/10", // Shironeri
				secondary: "bg-[#b0c4d9]/30 dark:bg-[#6a7f99]/30", // Pale indigo
				accent: "bg-[#cad8e0]/30 dark:bg-[#768c99]/30", // Geppaku (moon white)
				primaryFill: "rgba(240, 240, 240, 0.25)",
				secondaryFill: "rgba(176, 196, 217, 0.15)",
				accentStroke: "rgba(202, 216, 224, 0.35)",
				sandTexture: "bg-[#f5f5f5]/20 dark:bg-[#1f2937]/5",
				rockColor: "bg-[#b3b9c1] dark:bg-[#566473]",
			};
		}
	}

	// Sunset themes
	if (timeOfDay === "sunset") {
		if (weather === "clear") {
			return {
				// Akane (deep red) and sunset tones
				background: "bg-gradient-to-b from-[#f5ede7] to-[#f2e6de] dark:from-[#291e18] dark:to-[#2c211b]",
				primary: "bg-[#d98a74]/30 dark:bg-[#994f3a]/30", // Akane
				secondary: "bg-[#ba9b7c]/20 dark:bg-[#8c6c4a]/20", // Kogecha (tea brown)
				accent: "bg-[#c18a76]/30 dark:bg-[#945a46]/30", // Kachiiro (persimmon)
				primaryFill: "rgba(217, 138, 116, 0.15)",
				secondaryFill: "rgba(186, 155, 124, 0.1)",
				accentStroke: "rgba(193, 138, 118, 0.2)",
				sandTexture: "bg-[#f0e9e2]/30 dark:bg-[#33281f]/20",
				rockColor: "bg-[#8c7b6a] dark:bg-[#5c4e40]",
			};
		}
		if (weather === "cloudy") {
			return {
				// Kurenai (crimson) with muted tones
				background: "bg-gradient-to-b from-[#f0e8e3] to-[#e9e0da] dark:from-[#2b221f] dark:to-[#2e2623]",
				primary: "bg-[#c48368]/30 dark:bg-[#8c5842]/30", // Kurenai
				secondary: "bg-[#a99785]/20 dark:bg-[#7a6855]/20", // Tsuchi (earth)
				accent: "bg-[#9e9478]/20 dark:bg-[#6d644a]/20", // Rikyū (tea ceremony brown)
				primaryFill: "rgba(196, 131, 104, 0.15)",
				secondaryFill: "rgba(169, 151, 133, 0.1)",
				accentStroke: "rgba(158, 148, 120, 0.2)",
				sandTexture: "bg-[#ebe4db]/20 dark:bg-[#34291f]/10",
				rockColor: "bg-[#8a7d70] dark:bg-[#5a4e44]",
			};
		}
		// Other weather patterns - fallback to general sunset theme
		return {
			// Cha (tea) and sunset tones
			background: "bg-gradient-to-b from-[#f2ece6] to-[#eee4db] dark:from-[#2a211c] dark:to-[#2e241d]",
			primary: "bg-[#c08a6c]/30 dark:bg-[#8c5e40]/30", // Cha
			secondary: "bg-[#ad9c7e]/20 dark:bg-[#7d6c4e]/20", // Yamabuki (mountain gold)
			accent: "bg-[#af7958]/20 dark:bg-[#7f492a]/20", // Kogecha (deep brown)
			primaryFill: "rgba(192, 138, 108, 0.15)",
			secondaryFill: "rgba(173, 156, 126, 0.1)",
			accentStroke: "rgba(175, 121, 88, 0.2)",
			sandTexture: "bg-[#ede5db]/30 dark:bg-[#33281e]/20",
			rockColor: "bg-[#8c7b6a] dark:bg-[#5c4e40]",
		};
	}

	// Night themes
	if (timeOfDay === "night") {
		if (weather === "clear") {
			return {
				// Kon (navy) and night tones
				background: "bg-gradient-to-b from-[#1e2637] to-[#171d2c] dark:from-[#121926] dark:to-[#0e131d]",
				primary: "bg-[#364c70]/20 dark:bg-[#1f3a61]/20", // Kon
				secondary: "bg-[#4e5c80]/15 dark:bg-[#304266]/15", // Ruri (lapis)
				accent: "bg-[#7d92ad]/20 dark:bg-[#4e658c]/20", // Fujinezumi (wisteria gray)
				primaryFill: "rgba(54, 76, 112, 0.1)",
				secondaryFill: "rgba(78, 92, 128, 0.05)",
				accentStroke: "rgba(125, 146, 173, 0.15)",
				sandTexture: "bg-[#2c3542]/10 dark:bg-[#1c232d]/10",
				rockColor: "bg-[#3d4654] dark:bg-[#232932]",
			};
		}
		// Other weather patterns - fallback to general night theme
		return {
			// Kachi (victory blue) and calm night tones
			background: "bg-gradient-to-b from-[#212836] to-[#1a202c] dark:from-[#131720] dark:to-[#0f131a]",
			primary: "bg-[#455776]/20 dark:bg-[#2e4266]/20", // Kachi
			secondary: "bg-[#394c6b]/15 dark:bg-[#243756]/15", // Rurikon (dark blue)
			accent: "bg-[#6d8796]/15 dark:bg-[#435966]/15", // Ainezu (indigo gray)
			primaryFill: "rgba(69, 87, 118, 0.1)",
			secondaryFill: "rgba(57, 76, 107, 0.05)",
			accentStroke: "rgba(109, 135, 150, 0.15)",
			sandTexture: "bg-[#2a303c]/10 dark:bg-[#1a1f28]/10",
			rockColor: "bg-[#3d434f] dark:bg-[#262c36]",
		};
	}

	// Default fallback - same as initial default
	return {
		background: "bg-gradient-to-b from-[#f8f5f0] to-[#efe9e1] dark:from-[#1a1814] dark:to-[#211f1b]",
		primary: "bg-[#d9c7b3]/30 dark:bg-[#9c8c7a]/30", // Warm beige
		secondary: "bg-[#7a7267]/20 dark:bg-[#5c544c]/20", // Stone gray
		accent: "bg-[#5c8984]/30 dark:bg-[#38565c]/30", // Sage/pine
		primaryFill: "rgba(217, 199, 179, 0.2)",
		secondaryFill: "rgba(122, 114, 103, 0.1)",
		accentStroke: "rgba(92, 137, 132, 0.25)",
		sandTexture: "bg-[#e5ddd1]/40 dark:bg-[#2c261e]/40",
		rockColor: "bg-[#7a7267] dark:bg-[#4a443c]",
	};
}
