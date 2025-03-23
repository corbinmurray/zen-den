"use client";

import { Button } from "@/components/ui/button";
import { Atmosphere, Garden } from "@/lib/types";
import { copyToClipboard, formatDate, getGardenShareUrl } from "@/lib/utils";
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
					description: (
						<div className="space-y-2">
							<div>Link copied to clipboard.</div>
							<div className="overflow-x-auto rounded bg-background/80 p-2 text-xs font-mono">{shareUrl}</div>
						</div>
					),
					duration: 8000,
				});
			} catch {
				toast.info("Share link created!", {
					description: (
						<div className="space-y-2">
							<div>Unable to copy automatically to clipboard. You can:</div>
							<div className="overflow-x-auto rounded bg-background/80 p-2 text-xs font-mono select-all">{shareUrl}</div>
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
					<p className="text-muted mt-1">Find tranquility in your saved creations</p>
				</motion.div>
			</div>

			<motion.div
				className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
	const [hovered, setHovered] = useState(false);

	return (
		<motion.div
			className="relative rounded-xl overflow-hidden"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: index * 0.05 }}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}>
			{/* Card container with improved borders and shadows for better visibility in light mode */}
			<div
				className="group relative h-[330px] border-2 border-border/60 dark:border-border/20 rounded-xl overflow-hidden 
                        shadow-[0_6px_16px_rgba(0,0,0,0.12),0_3px_6px_rgba(0,0,0,0.1)] dark:shadow-md 
                        transition-all duration-500 hover:shadow-[0_10px_25px_rgba(0,0,0,0.18),0_4px_10px_rgba(0,0,0,0.12)]">
				{/* Color overlay to enhance background pattern vibrancy - strengthened for light mode */}
				<div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-transparent to-accent/[0.06] dark:from-primary/[0.01] dark:to-accent/[0.02] z-[1]"></div>

				{/* Zen background pattern with improved vibrancy for light mode */}
				<div className="absolute inset-0 w-full h-full overflow-hidden saturate-[1.3] contrast-[1.1] dark:saturate-100 dark:contrast-100">
					<ZenBackground garden={garden} className="opacity-[0.98] dark:opacity-80" />
				</div>

				{/* Paper texture SVG pattern with improved contrast for light mode */}
				<div className="absolute inset-0 opacity-[0.15] dark:opacity-[0.07] mix-blend-overlay z-[2]">
					<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
						<defs>
							<pattern id={`paper-texture-${garden.id || index}`} patternUnits="userSpaceOnUse" width="200" height="200">
								<filter id={`paper-grain-${garden.id || index}`}>
									<feTurbulence
										type="fractalNoise"
										baseFrequency="0.04"
										numOctaves="5"
										result="turbulence"
										seed={garden.id ? parseInt(garden.id.charAt(0), 36) || 1 : index + 1}
									/>
									<feDisplacementMap in="SourceGraphic" in2="turbulence" scale="5" />
								</filter>
								<rect width="100%" height="100%" fill="currentColor" filter={`url(#paper-grain-${garden.id || index})`} opacity="0.35" />
							</pattern>
						</defs>
						<rect width="100%" height="100%" fill={`url(#paper-texture-${garden.id || index})`} />
					</svg>
				</div>

				{/* Subtle grain texture with increased opacity for light mode */}
				<div className="absolute inset-0 bg-noise opacity-[0.06] dark:opacity-[0.03] z-[3]"></div>

				{/* Decorative zen corner pattern with improved visibility on hover for light mode */}
				<motion.div
					className="absolute -bottom-12 -right-12 w-48 h-48 opacity-0 transition-opacity duration-500 z-[4]"
					animate={{
						opacity: hovered ? 0.25 : 0,
					}}
					transition={{ duration: 0.5 }}>
					<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.8" xmlns="http://www.w3.org/2000/svg">
						<circle cx="50" cy="50" r="40" opacity="0.7" />
						<circle cx="50" cy="50" r="30" opacity="0.5" />
						<circle cx="50" cy="50" r="20" opacity="0.4" />
						<path d="M10,50 C10,30 30,10 50,10" opacity="0.7" />
						<path d="M50,90 C30,90 10,70 10,50" opacity="0.7" />
						<path d="M90,50 C90,70 70,90 50,90" opacity="0.7" />
						<path d="M50,10 C70,10 90,30 90,50" opacity="0.7" />
					</svg>
				</motion.div>

				{/* Card content with enhanced glass morphism effect for better visibility in light mode */}
				<div
					className="absolute inset-0 w-full h-full backdrop-blur-[2px] bg-white/65 dark:bg-background/40
							 flex flex-col z-[5] transition-all duration-500
							 group-hover:backdrop-blur-[3px] group-hover:bg-white/75 dark:group-hover:bg-background/50">
					{/* Decorative zen elements with increased contrast in light mode */}
					<motion.div
						className="absolute w-[140%] h-[1px] bg-black/25 dark:bg-white/10 left-0 top-[82%] rotate-[-2deg]"
						animate={{
							opacity: [0.25, 0.35, 0.25],
						}}
						transition={{
							duration: 6,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>

					<motion.div
						className="absolute w-[130%] h-[1px] bg-black/20 dark:bg-white/5 left-[-5%] top-[78%] rotate-[-1deg]"
						animate={{
							opacity: [0.2, 0.3, 0.2],
						}}
						transition={{
							duration: 8,
							repeat: Infinity,
							ease: "easeInOut",
							delay: 0.5,
						}}
					/>

					{/* Garden title with elegant styling */}
					<div className="pt-5 px-5 flex justify-between items-start">
						<motion.div
							initial={{ opacity: 0, y: -5 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
							className="flex-1 mr-3">
							<h3 className="text-xl font-medium tracking-tight text-foreground/90">{garden.name || "Untitled Garden"}</h3>
							<p className="text-xs text-foreground/60 mt-1">{formatDate(garden.lastModifiedAt)}</p>
						</motion.div>
					</div>

					{/* Scroll pattern decorative element with improved visibility in light mode */}
					<motion.div
						className="absolute right-5 top-6 w-8 h-8 opacity-40 dark:opacity-15"
						animate={{
							opacity: [0.4, 0.3, 0.4],
							rotate: hovered ? 10 : 0,
						}}
						transition={{
							opacity: {
								duration: 4,
								repeat: Infinity,
								ease: "easeInOut",
							},
							rotate: {
								duration: 0.6,
								ease: "easeInOut",
							},
						}}>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
							<path d="M12 3a9 9 0 1 0 9 9" />
							<path d="M12 3v6" />
							<path d="M12 9h6" />
						</svg>
					</motion.div>

					{/* Actions */}
					<div className="mt-auto p-5">
						{/* Primary actions with zen-inspired look */}
						<div className="flex gap-3 mb-3">
							<Link href={`/view?id=${garden.id}`} className="flex-1">
								<Button size="default" className="w-full bg-primary/20 hover:bg-primary/30 border-none text-foreground font-normal">
									<Eye className="size-4 opacity-70" />
									View
								</Button>
							</Link>

							<Link href={`/garden?id=${garden.id}`} className="flex-1">
								<Button size="default" className="w-full bg-primary/20 hover:bg-primary/30 border-none text-foreground font-normal">
									<Edit className="size-4 opacity-70" />
									Edit
								</Button>
							</Link>
						</div>

						{/* Secondary actions */}
						<div className="flex gap-3">
							<Button
								onClick={() => onShare(garden)}
								disabled={isSharing}
								size="sm"
								className="flex-1 bg-transparent border border-border/70 hover:bg-background/60 text-foreground/80 font-normal">
								{isSharing ? (
									<>
										<span className="size-3.5 inline-block rounded-full border-2 border-current border-t-transparent animate-spin mr-2" />
										Sharing
									</>
								) : (
									<>
										<Share className="size-3.5 opacity-70" />
										Share
									</>
								)}
							</Button>

							<Button
								onClick={() => (garden.id ? onRemove(garden.id) : null)}
								size="sm"
								className="flex-1 bg-transparent border border-border/70 hover:bg-destructive/10 text-foreground/80 font-normal">
								<Trash className="size-3.5 opacity-70" />
								Delete
							</Button>
						</div>
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
			// Neutral sand/paper tones with significantly improved light mode visibility
			background: "bg-gradient-to-b from-[#f6f0e8] to-[#efe6dc] dark:from-[#1a1814]/90 dark:to-[#211f1b]",
			primary: "bg-[#b38a60]/50 dark:bg-[#9c8c7a]/25", // Deeper, more saturated beige for light mode
			secondary: "bg-[#5b4c40]/40 dark:bg-[#5c544c]/20", // Darker stone gray for light mode
			accent: "bg-[#3a6a66]/45 dark:bg-[#38565c]/25", // Deeper sage/pine for light mode
			primaryFill: "rgba(179, 138, 96, 0.45)", // Deeper and more visible
			secondaryFill: "rgba(91, 76, 64, 0.25)", // Darker and more visible
			accentStroke: "rgba(58, 106, 102, 0.4)", // Deeper and more visible
			sandTexture: "bg-[#d1c3b1]/50 dark:bg-[#2c261e]/30", // More visible texture
			rockColor: "bg-[#5a4c40] dark:bg-[#4a443c]", // Darker rock for better contrast
		};
	}

	const { timeOfDay, weather } = atmosphere;

	// Day themes
	if (timeOfDay === "day") {
		if (weather === "clear") {
			return {
				// Asagi (light blue) and natural tones - enhanced for light mode
				background: "bg-gradient-to-b from-[#e8f2f8] to-[#daeaf4] dark:from-[#172029]/95 dark:to-[#1d2833]",
				primary: "bg-[#4889a0]/50 dark:bg-[#4a7c8c]/25", // Deeper Asagi blue
				secondary: "bg-[#b39548]/40 dark:bg-[#8c7d40]/20", // More saturated Kihada gold
				accent: "bg-[#5f9078]/45 dark:bg-[#708c6a]/25", // Deeper Matcha
				primaryFill: "rgba(72, 137, 160, 0.4)", // More vibrant blue
				secondaryFill: "rgba(179, 149, 72, 0.25)", // More visible gold
				accentStroke: "rgba(95, 144, 120, 0.4)", // More visible matcha
				sandTexture: "bg-[#e8e6d4]/45 dark:bg-[#2c3626]/20", // More visible texture
				rockColor: "bg-[#5a4c40] dark:bg-[#4a443c]", // Darker rock
			};
		}
		if (weather === "cloudy") {
			return {
				// Nezumi (mouse gray) and muted tones - enhanced for light mode
				background: "bg-gradient-to-b from-[#ededea] to-[#e2e2de] dark:from-[#222222]/95 dark:to-[#2a2a2a]",
				primary: "bg-[#70757e]/50 dark:bg-[#626569]/25", // Darker Nezumi gray
				secondary: "bg-[#6a6052]/40 dark:bg-[#635c4e]/20", // Darker Rikyū brown
				accent: "bg-[#475980]/40 dark:bg-[#4a5871]/20", // Deeper Mizu asagi (water blue)
				primaryFill: "rgba(112, 117, 126, 0.4)", // More visible gray
				secondaryFill: "rgba(106, 96, 82, 0.25)", // More visible brown
				accentStroke: "rgba(71, 89, 128, 0.35)", // More visible blue
				sandTexture: "bg-[#cbc8bf]/40 dark:bg-[#33312e]/20", // More visible texture
				rockColor: "bg-[#5f5953] dark:bg-[#4e4a46]", // Darker rock
			};
		}
		if (weather === "rainy") {
			return {
				// Fukiasagi (rain blue) and slate tones - enhanced for light mode
				background: "bg-gradient-to-b from-[#e6ecf2] to-[#dde5ef] dark:from-[#1c2229]/95 dark:to-[#21282f]",
				primary: "bg-[#597690]/50 dark:bg-[#5c7082]/25", // Deeper Fukiasagi
				secondary: "bg-[#738699]/40 dark:bg-[#656e79]/20", // Deeper slate
				accent: "bg-[#678779]/40 dark:bg-[#667268]/20", // Deeper Rokushō (verdigris)
				primaryFill: "rgba(89, 118, 144, 0.4)", // More visible blue
				secondaryFill: "rgba(115, 134, 153, 0.25)", // More visible slate
				accentStroke: "rgba(103, 135, 121, 0.35)", // More visible verdigris
				sandTexture: "bg-[#cee5f1]/40 dark:bg-[#293036]/25", // More visible texture
				rockColor: "bg-[#5f5f5f] dark:bg-[#4e4e4e]", // Darker rock
			};
		}
		if (weather === "snowy") {
			return {
				// Shironeri (white) and cool soft tones - enhanced for light mode
				background: "bg-gradient-to-b from-[#f2f6fa] to-[#e9f0f6] dark:from-[#1d2126]/95 dark:to-[#1e2430]",
				primary: "bg-[#bdc3d0]/60 dark:bg-[#aaa9b2]/15", // More visible light blue-gray
				secondary: "bg-[#7c96b2]/45 dark:bg-[#6a7f99]/25", // Deeper pale indigo
				accent: "bg-[#96aabb]/45 dark:bg-[#768c99]/25", // Deeper Geppaku (moon white)
				primaryFill: "rgba(189, 195, 208, 0.5)", // More visible blue-gray
				secondaryFill: "rgba(124, 150, 178, 0.35)", // More visible indigo
				accentStroke: "rgba(150, 170, 187, 0.4)", // More visible moon white
				sandTexture: "bg-[#dfe1f3]/35 dark:bg-[#1f2937]/10", // More visible texture
				rockColor: "bg-[#96a3b3] dark:bg-[#566473]", // Deeper rock
			};
		}
	}

	// Sunset themes
	if (timeOfDay === "sunset") {
		if (weather === "clear") {
			return {
				// Akane (deep red) and sunset tones - enhanced for light mode
				background: "bg-gradient-to-b from-[#f2e5dc] to-[#edded3] dark:from-[#291e18]/95 dark:to-[#2c211b]",
				primary: "bg-[#c5644a]/50 dark:bg-[#994f3a]/25", // More vibrant Akane
				secondary: "bg-[#a07952]/40 dark:bg-[#8c6c4a]/20", // Deeper Kogecha (tea brown)
				accent: "bg-[#a6644a]/45 dark:bg-[#945a46]/25", // Deeper Kachiiro (persimmon)
				primaryFill: "rgba(197, 100, 74, 0.4)", // More visible red
				secondaryFill: "rgba(160, 121, 82, 0.25)", // More visible brown
				accentStroke: "rgba(166, 100, 74, 0.35)", // More visible persimmon
				sandTexture: "bg-[#e8dfd5]/45 dark:bg-[#33281f]/20", // More visible texture
				rockColor: "bg-[#735f4d] dark:bg-[#5c4e40]", // Deeper rock
			};
		}
		if (weather === "cloudy") {
			return {
				// Kurenai (crimson) with muted tones - enhanced for light mode
				background: "bg-gradient-to-b from-[#ede3dc] to-[#e5d9d0] dark:from-[#2b221f]/95 dark:to-[#2e2623]",
				primary: "bg-[#ac6442]/50 dark:bg-[#8c5842]/25", // Deeper Kurenai
				secondary: "bg-[#8d7863]/40 dark:bg-[#7a6855]/20", // Deeper Tsuchi (earth)
				accent: "bg-[#847551]/40 dark:bg-[#6d644a]/20", // Deeper Rikyū
				primaryFill: "rgba(172, 100, 66, 0.4)", // More visible crimson
				secondaryFill: "rgba(141, 120, 99, 0.25)", // More visible earth
				accentStroke: "rgba(132, 117, 81, 0.35)", // More visible Rikyū
				sandTexture: "bg-[#d3cabd]/40 dark:bg-[#34291f]/15", // More visible texture
				rockColor: "bg-[#72655a] dark:bg-[#5a4e44]", // Deeper rock
			};
		}
		// Other weather patterns - fallback to general sunset theme
		return {
			// Cha (tea) and sunset tones - enhanced for light mode
			background: "bg-gradient-to-b from-[#eee4da] to-[#e9dccf] dark:from-[#2a211c]/95 dark:to-[#2e241d]",
			primary: "bg-[#a56946]/50 dark:bg-[#8c5e40]/25", // Deeper Cha
			secondary: "bg-[#937f58]/40 dark:bg-[#7d6c4e]/20", // Deeper Yamabuki
			accent: "bg-[#955933]/40 dark:bg-[#7f492a]/20", // Deeper Kogecha
			primaryFill: "rgba(165, 105, 70, 0.4)", // More visible tea
			secondaryFill: "rgba(147, 127, 88, 0.25)", // More visible gold
			accentStroke: "rgba(149, 89, 51, 0.35)", // More visible brown
			sandTexture: "bg-[#d5cabe]/45 dark:bg-[#33281e]/20", // More visible texture
			rockColor: "bg-[#72614e] dark:bg-[#5c4e40]", // Deeper rock
		};
	}

	// Night themes
	if (timeOfDay === "night") {
		// For night themes in light mode, we'll use deeper colors while keeping the dark mode relatively dark
		return {
			// Kon (navy) and night tones - enhanced for light mode
			background: "bg-gradient-to-b from-[#e6eaf2] to-[#dce2ed] dark:from-[#121926]/95 dark:to-[#0e131d]",
			primary: "bg-[#3a4d6d]/50 dark:bg-[#1f3a61]/20", // Deeper, more visible navy for light mode
			secondary: "bg-[#4f5d84]/40 dark:bg-[#304266]/15", // Deeper blue for light mode
			accent: "bg-[#7e94b1]/45 dark:bg-[#4e658c]/20", // Deeper accent for light mode
			primaryFill: "rgba(58, 77, 109, 0.4)", // More visible navy
			secondaryFill: "rgba(79, 93, 132, 0.3)", // More visible blue
			accentStroke: "rgba(126, 148, 177, 0.4)", // More visible accent
			sandTexture: "bg-[#dce2ed]/40 dark:bg-[#1c232d]/10", // More visible texture
			rockColor: "bg-[#3d4658] dark:bg-[#232932]", // Deeper rock color
		};
	}

	// Default fallback with enhanced light mode visibility
	return {
		background: "bg-gradient-to-b from-[#f6f0e8] to-[#efe6dc] dark:from-[#1a1814]/90 dark:to-[#211f1b]",
		primary: "bg-[#b38a60]/50 dark:bg-[#9c8c7a]/25", // Deeper beige for light mode
		secondary: "bg-[#5b4c40]/40 dark:bg-[#5c544c]/20", // Darker stone gray for light mode
		accent: "bg-[#3a6a66]/45 dark:bg-[#38565c]/25", // Deeper sage/pine for light mode
		primaryFill: "rgba(179, 138, 96, 0.45)", // More visible fill
		secondaryFill: "rgba(91, 76, 64, 0.25)", // More visible fill
		accentStroke: "rgba(58, 106, 102, 0.4)", // More visible stroke
		sandTexture: "bg-[#d1c3b1]/50 dark:bg-[#2c261e]/30", // More visible texture
		rockColor: "bg-[#5a4c40] dark:bg-[#4a443c]", // Darker rock
	};
}
