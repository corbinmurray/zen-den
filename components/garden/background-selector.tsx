"use client";

import { BackgroundOption } from "@/lib/types";
import Image from "next/image";

// Sample backgrounds
const BACKGROUND_OPTIONS: BackgroundOption[] = [
	{
		id: "default",
		name: "Zen Default",
		path: "/backgrounds/zen-default.jpg",
		thumbnail: "/backgrounds/zen-default-thumb.jpg",
	},
	{
		id: "mountain",
		name: "Misty Mountain",
		path: "/backgrounds/mountain.jpg",
		thumbnail: "/backgrounds/mountain-thumb.jpg",
	},
	{
		id: "wood",
		name: "Wooden Texture",
		path: "/backgrounds/wood.jpg",
		thumbnail: "/backgrounds/wood-thumb.jpg",
	},
	{
		id: "gradient",
		name: "Soft Gradient",
		path: "/backgrounds/gradient.jpg",
		thumbnail: "/backgrounds/gradient-thumb.jpg",
	},
];

interface BackgroundSelectorProps {
	selected: string;
	onSelect: (path: string) => void;
}

export function BackgroundSelector({ selected, onSelect }: BackgroundSelectorProps) {
	return (
		<div>
			<h4 className="text-sm font-medium mb-2">Background</h4>
			<div className="grid grid-cols-2 gap-2">
				{BACKGROUND_OPTIONS.map((bg) => (
					<button
						key={bg.id}
						className={`rounded-md overflow-hidden border-2 transition-all ${selected === bg.path ? "border-primary" : "border-border hover:border-muted"}`}
						onClick={() => onSelect(bg.path)}
						title={bg.name}>
						<div className="relative w-full aspect-video">
							<Image src={bg.thumbnail} alt={bg.name} fill style={{ objectFit: "cover" }} />
						</div>
					</button>
				))}
			</div>
		</div>
	);
}
