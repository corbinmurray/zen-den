"use client";

import { Button } from "@/components/ui/button";
import { Atmosphere, Garden } from "@/lib/types";
import { copyToClipboard, getGardenShareUrl } from "@/lib/utils";
import { useZenGardenStore } from "@/providers/zen-garden-store-provider";
import { Edit, Eye, Share, Trash } from "lucide-react";
import * as motion from "motion/react-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
	const router = useRouter();
	const [showControls, setShowControls] = useState(false);

	return (
		<motion.div
			className="group relative h-[300px] rounded-xl overflow-hidden border border-border/50 shadow-md hover:shadow-lg transition-all duration-300"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: index * 0.05 }}
			onMouseEnter={() => setShowControls(true)}
			onMouseLeave={() => setShowControls(false)}>
			{/* Abstract zen background */}
			<div className="absolute inset-0 w-full h-full overflow-hidden">
				<ZenBackground garden={garden} className="opacity-90 dark:opacity-70" />
			</div>

			{/* Card content with glass effect */}
			<div
				className="absolute inset-0 w-full h-full backdrop-blur-[3px] bg-white/70 dark:bg-background/30 
						   flex flex-col z-10 transition-all duration-300 
						   group-hover:backdrop-blur-[4px] group-hover:bg-white/75 dark:group-hover:bg-background/40
						   shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_4px_6px_rgba(0,0,0,0.05)] dark:shadow-none">
				{/* Top header section with garden name */}
				<div className="p-4 border-b border-border/30 backdrop-blur-sm bg-white/80 dark:bg-background/30 transition-all duration-300 shadow-sm">
					<div className="flex justify-between items-center">
						<h3 className="text-lg font-medium truncate mr-2">{garden.name || "Untitled Garden"}</h3>
						<div className="text-xs text-foreground/80 whitespace-nowrap">{new Date(garden.lastModifiedAt).toLocaleDateString()}</div>
					</div>
				</div>

				{/* Main content area */}
				<div className="flex-grow flex flex-col justify-end p-4">
					{/* Action buttons */}
					<div className="space-y-2.5">
						<div className="grid grid-cols-3 gap-2.5">
							<Link href={`/garden?id=${garden.id}`} className="col-span-1">
								<Button size="sm" className="w-full" variant="outline">
									<Edit className="size-3.5" />
									Edit
								</Button>
							</Link>

							<Button size="sm" className="col-span-1" onClick={() => onShare(garden)} disabled={isSharing} variant="outline">
								{isSharing ? (
									<>
										<span className="size-3.5 inline-block rounded-full border-2 border-current border-t-transparent animate-spin" />
										Sharing
									</>
								) : (
									<>
										<Share className="size-3.5" />
										Share
									</>
								)}
							</Button>

							<Link href={`/view?id=${garden.id}`} className="col-span-1">
								<Button size="sm" className="w-full" variant="outline">
									<Eye className="size-3.5" />
									View
								</Button>
							</Link>
						</div>

						<Button
							onClick={() => (garden.id ? onRemove(garden.id) : null)}
							size="sm"
							className="w-full bg-transparent border border-destructive text-destructive hover:bg-destructive hover:text-foreground">
							<Trash className="size-3.5" />
							Delete
						</Button>
					</div>
				</div>
			</div>
		</motion.div>
	);
}

// Modify the ZenBackground component to accept className prop
function ZenBackground({ garden, className }: { garden: Garden; className?: string }) {
	// Choose a zen pattern based on garden id to ensure consistency for the same garden
	const patternType = getPatternType(garden);

	return (
		<div className={`relative w-full h-full ${className || ""}`}>
			{patternType === "circles" && <ZenCirclesPattern garden={garden} />}
			{patternType === "waves" && <ZenWavesPattern garden={garden} />}
			{patternType === "terrain" && <ZenTerrainPattern garden={garden} />}
			{patternType === "sand" && <ZenSandPattern garden={garden} />}
		</div>
	);
}

// Helper to determine pattern type based on garden id
function getPatternType(garden: Garden): "circles" | "waves" | "terrain" | "sand" {
	const patterns = ["circles", "waves", "terrain", "sand"] as const;

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
					filter: "blur(30px)",
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
						filter: "blur(2px)",
					}}
					animate={{
						x: [0, 5, 0],
						y: [0, -3, 0],
						opacity: [0.6, 0.8, 0.6],
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
				className={`absolute ${baseColor.secondary} h-[1px]`}
				style={{
					width: "70%",
					left: "15%",
					top: "70%",
				}}
				animate={{
					opacity: [0.4, 0.6, 0.4],
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
						filter: "blur(2px)",
					}}
					animate={{
						y: [0, 5, 0],
						opacity: [0.6, 0.8, 0.6],
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
			<motion.div className="absolute left-0 top-0 w-full h-full" style={{ opacity: 0.6 }}>
				<svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full" style={{ opacity: 0.6 }}>
					<motion.path
						d="M0,50 C20,45 35,55 50,50 C65,45 80,55 100,50"
						stroke={baseColor.accentStroke}
						strokeWidth="0.8"
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
					filter: "blur(15px)",
				}}
				animate={{
					opacity: [0.4, 0.6, 0.4],
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
					filter: "blur(3px)",
				}}
				animate={{
					opacity: [0.7, 0.9, 0.7],
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
			<div className={`absolute inset-0 w-full h-full opacity-40 ${baseColor.sandTexture}`} />

			{/* Horizontal raked lines */}
			{Array.from({ length: 12 }).map((_, i) => (
				<motion.div
					key={i}
					className={`absolute ${baseColor.primary} h-[1px]`}
					style={{
						width: "90%",
						left: "5%",
						top: `${20 + i * 5}%`,
						opacity: 0.6,
					}}
					animate={{
						opacity: [0.5, 0.7, 0.5],
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
					opacity: 0.85,
				}}
				animate={{
					opacity: [0.8, 0.9, 0.8],
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
			<motion.div className="absolute left-0 top-0 w-full h-full" style={{ opacity: 0.6 }}>
				<svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
					<motion.path
						d="M0,45 C30,45 50,30 65,45 C80,60 100,45 100,45"
						stroke={baseColor.accentStroke}
						strokeWidth="0.8"
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
	// Using more refined colors with better light mode contrast

	// Default zen garden colors - wabi-sabi aesthetic with improved contrast
	if (!atmosphere) {
		return {
			// Neutral sand/paper tones with improved visibility
			background: "bg-gradient-to-b from-[#f6f0e8] to-[#efe6dc] dark:from-[#1a1814]/90 dark:to-[#211f1b]",
			primary: "bg-[#c4a98c]/40 dark:bg-[#9c8c7a]/25", // Warm beige - increased opacity for light mode
			secondary: "bg-[#6a5c50]/30 dark:bg-[#5c544c]/20", // Stone gray - increased opacity for light mode
			accent: "bg-[#4a7a76]/35 dark:bg-[#38565c]/25", // Sage/pine - increased opacity for light mode
			primaryFill: "rgba(196, 169, 140, 0.3)",
			secondaryFill: "rgba(106, 92, 80, 0.15)",
			accentStroke: "rgba(74, 122, 118, 0.3)",
			sandTexture: "bg-[#e1d3c1]/40 dark:bg-[#2c261e]/30",
			rockColor: "bg-[#6a5c50] dark:bg-[#4a443c]",
		};
	}

	const { timeOfDay, weather } = atmosphere;

	// Day themes
	if (timeOfDay === "day") {
		if (weather === "clear") {
			return {
				// Asagi (light blue) and natural tones
				background: "bg-gradient-to-b from-[#e8f2f8] to-[#daeaf4] dark:from-[#172029]/95 dark:to-[#1d2833]",
				primary: "bg-[#68a7b9]/40 dark:bg-[#4a7c8c]/25", // Asagi blue
				secondary: "bg-[#bfa95a]/30 dark:bg-[#8c7d40]/20", // Kihada (subtle gold)
				accent: "bg-[#7fa08d]/35 dark:bg-[#708c6a]/25", // Matcha
				primaryFill: "rgba(104, 167, 185, 0.25)",
				secondaryFill: "rgba(191, 169, 90, 0.15)",
				accentStroke: "rgba(127, 160, 141, 0.3)",
				sandTexture: "bg-[#e8e6d4]/35 dark:bg-[#2c3626]/20",
				rockColor: "bg-[#6a5c50] dark:bg-[#4a443c]",
			};
		}
		if (weather === "cloudy") {
			return {
				// Nezumi (mouse gray) and muted tones
				background: "bg-gradient-to-b from-[#ededea] to-[#e2e2de] dark:from-[#222222]/95 dark:to-[#2a2a2a]",
				primary: "bg-[#8f939a]/40 dark:bg-[#626569]/25", // Nezumi gray
				secondary: "bg-[#7f7666]/30 dark:bg-[#635c4e]/20", // Rikyū brown
				accent: "bg-[#62738c]/30 dark:bg-[#4a5871]/20", // Mizu asagi (water blue)
				primaryFill: "rgba(143, 147, 154, 0.25)",
				secondaryFill: "rgba(127, 118, 102, 0.15)",
				accentStroke: "rgba(98, 115, 140, 0.25)",
				sandTexture: "bg-[#dbd8cf]/30 dark:bg-[#33312e]/20",
				rockColor: "bg-[#6f6963] dark:bg-[#4e4a46]",
			};
		}
		if (weather === "rainy") {
			return {
				// Fukiasagi (rain blue) and slate tones
				background: "bg-gradient-to-b from-[#e6ecf2] to-[#dde5ef] dark:from-[#1c2229]/95 dark:to-[#21282f]",
				primary: "bg-[#7990a6]/40 dark:bg-[#5c7082]/25", // Fukiasagi
				secondary: "bg-[#93a0af]/30 dark:bg-[#656e79]/20", // Slate
				accent: "bg-[#879d93]/30 dark:bg-[#667268]/20", // Rokushō (verdigris)
				primaryFill: "rgba(121, 144, 166, 0.25)",
				secondaryFill: "rgba(147, 160, 175, 0.15)",
				accentStroke: "rgba(135, 157, 147, 0.25)",
				sandTexture: "bg-[#dee5eb]/30 dark:bg-[#293036]/25",
				rockColor: "bg-[#6f6f6f] dark:bg-[#4e4e4e]",
			};
		}
		if (weather === "snowy") {
			return {
				// Shironeri (white) and cool soft tones
				background: "bg-gradient-to-b from-[#f2f6fa] to-[#e9f0f6] dark:from-[#1d2126]/95 dark:to-[#1e2430]",
				primary: "bg-[#e4e4e4]/50 dark:bg-[#aaa9b2]/15", // Shironeri
				secondary: "bg-[#9cb6d2]/35 dark:bg-[#6a7f99]/25", // Pale indigo
				accent: "bg-[#b6cad8]/35 dark:bg-[#768c99]/25", // Geppaku (moon white)
				primaryFill: "rgba(228, 228, 228, 0.3)",
				secondaryFill: "rgba(156, 182, 210, 0.2)",
				accentStroke: "rgba(182, 202, 216, 0.3)",
				sandTexture: "bg-[#eff1f3]/25 dark:bg-[#1f2937]/10",
				rockColor: "bg-[#a6aeb9] dark:bg-[#566473]",
			};
		}
	}

	// Sunset themes
	if (timeOfDay === "sunset") {
		if (weather === "clear") {
			return {
				// Akane (deep red) and sunset tones
				background: "bg-gradient-to-b from-[#f2e5dc] to-[#edded3] dark:from-[#291e18]/95 dark:to-[#2c211b]",
				primary: "bg-[#d27a5e]/40 dark:bg-[#994f3a]/25", // Akane
				secondary: "bg-[#b08c66]/30 dark:bg-[#8c6c4a]/20", // Kogecha (tea brown)
				accent: "bg-[#b67a60]/35 dark:bg-[#945a46]/25", // Kachiiro (persimmon)
				primaryFill: "rgba(210, 122, 94, 0.25)",
				secondaryFill: "rgba(176, 140, 102, 0.15)",
				accentStroke: "rgba(182, 122, 96, 0.25)",
				sandTexture: "bg-[#e8dfd5]/35 dark:bg-[#33281f]/20",
				rockColor: "bg-[#836f5d] dark:bg-[#5c4e40]",
			};
		}
		if (weather === "cloudy") {
			return {
				// Kurenai (crimson) with muted tones
				background: "bg-gradient-to-b from-[#ede3dc] to-[#e5d9d0] dark:from-[#2b221f]/95 dark:to-[#2e2623]",
				primary: "bg-[#bc7452]/40 dark:bg-[#8c5842]/25", // Kurenai
				secondary: "bg-[#9d8873]/30 dark:bg-[#7a6855]/20", // Tsuchi (earth)
				accent: "bg-[#948561]/30 dark:bg-[#6d644a]/20", // Rikyū (tea ceremony brown)
				primaryFill: "rgba(188, 116, 82, 0.25)",
				secondaryFill: "rgba(157, 136, 115, 0.15)",
				accentStroke: "rgba(148, 133, 97, 0.25)",
				sandTexture: "bg-[#e3dacd]/30 dark:bg-[#34291f]/15",
				rockColor: "bg-[#82756a] dark:bg-[#5a4e44]",
			};
		}
		// Other weather patterns - fallback to general sunset theme
		return {
			// Cha (tea) and sunset tones
			background: "bg-gradient-to-b from-[#eee4da] to-[#e9dccf] dark:from-[#2a211c]/95 dark:to-[#2e241d]",
			primary: "bg-[#b57956]/40 dark:bg-[#8c5e40]/25", // Cha
			secondary: "bg-[#a38f68]/30 dark:bg-[#7d6c4e]/20", // Yamabuki (mountain gold)
			accent: "bg-[#a56943]/30 dark:bg-[#7f492a]/20", // Kogecha (deep brown)
			primaryFill: "rgba(181, 121, 86, 0.25)",
			secondaryFill: "rgba(163, 143, 104, 0.15)",
			accentStroke: "rgba(165, 105, 67, 0.25)",
			sandTexture: "bg-[#e5dace]/35 dark:bg-[#33281e]/20",
			rockColor: "bg-[#82715e] dark:bg-[#5c4e40]",
		};
	}

	// Night themes
	if (timeOfDay === "night") {
		if (weather === "clear") {
			return {
				// Kon (navy) and night tones - kept darker for both modes
				background: "bg-gradient-to-b from-[#2e3849] to-[#242f44] dark:from-[#121926]/95 dark:to-[#0e131d]",
				primary: "bg-[#455c80]/25 dark:bg-[#1f3a61]/20", // Kon
				secondary: "bg-[#5f6d94]/20 dark:bg-[#304266]/15", // Ruri (lapis)
				accent: "bg-[#8ea4c1]/25 dark:bg-[#4e658c]/20", // Fujinezumi (wisteria gray)
				primaryFill: "rgba(69, 92, 128, 0.15)",
				secondaryFill: "rgba(95, 109, 148, 0.1)",
				accentStroke: "rgba(142, 164, 193, 0.2)",
				sandTexture: "bg-[#3c4456]/15 dark:bg-[#1c232d]/10",
				rockColor: "bg-[#4d5668] dark:bg-[#232932]",
			};
		}
		// Other weather patterns - fallback to general night theme
		return {
			// Kachi (victory blue) and calm night tones - kept darker for both modes
			background: "bg-gradient-to-b from-[#303a4d] to-[#273244] dark:from-[#131720]/95 dark:to-[#0f131a]",
			primary: "bg-[#566788]/25 dark:bg-[#2e4266]/20", // Kachi
			secondary: "bg-[#495c7e]/20 dark:bg-[#243756]/15", // Rurikon (dark blue)
			accent: "bg-[#7e99aa]/20 dark:bg-[#435966]/15", // Ainezu (indigo gray)
			primaryFill: "rgba(86, 103, 136, 0.15)",
			secondaryFill: "rgba(73, 92, 126, 0.1)",
			accentStroke: "rgba(126, 153, 170, 0.15)",
			sandTexture: "bg-[#3a404e]/15 dark:bg-[#1a1f28]/10",
			rockColor: "bg-[#4d5361] dark:bg-[#262c36]",
		};
	}

	// Default fallback - same as initial default but with improved contrast
	return {
		background: "bg-gradient-to-b from-[#f6f0e8] to-[#efe6dc] dark:from-[#1a1814]/90 dark:to-[#211f1b]",
		primary: "bg-[#c4a98c]/40 dark:bg-[#9c8c7a]/25", // Warm beige - increased opacity for light mode
		secondary: "bg-[#6a5c50]/30 dark:bg-[#5c544c]/20", // Stone gray - increased opacity for light mode
		accent: "bg-[#4a7a76]/35 dark:bg-[#38565c]/25", // Sage/pine - increased opacity for light mode
		primaryFill: "rgba(196, 169, 140, 0.3)",
		secondaryFill: "rgba(106, 92, 80, 0.15)",
		accentStroke: "rgba(74, 122, 118, 0.3)",
		sandTexture: "bg-[#e1d3c1]/40 dark:bg-[#2c261e]/30",
		rockColor: "bg-[#6a5c50] dark:bg-[#4a443c]",
	};
}
