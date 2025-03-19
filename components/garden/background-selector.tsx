"use client";

import { BackgroundOption } from "@/lib/types";
import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

// Sample backgrounds with minimalist cartoon styles to match elements
const BACKGROUND_OPTIONS: BackgroundOption[] = [
	{
		id: "sand",
		name: "Zen Sand",
		path: "https://img.freepik.com/free-vector/minimalist-japanese-garden-with-sand_23-2148983678.jpg",
		thumbnail: "https://img.freepik.com/free-vector/minimalist-japanese-garden-with-sand_23-2148983678.jpg",
	},
	{
		id: "mountains",
		name: "Pastel Mountains",
		path: "https://img.freepik.com/free-vector/flat-design-mountain-landscape_52683-78047.jpg",
		thumbnail: "https://img.freepik.com/free-vector/flat-design-mountain-landscape_52683-78047.jpg",
	},
	{
		id: "beach",
		name: "Calm Beach",
		path: "https://img.freepik.com/free-vector/hand-drawn-beach-landscape_23-2149005228.jpg",
		thumbnail: "https://img.freepik.com/free-vector/hand-drawn-beach-landscape_23-2149005228.jpg",
	},
	{
		id: "space",
		name: "Night Sky",
		path: "https://img.freepik.com/free-vector/gradient-night-sky-with-stars_23-2148282506.jpg",
		thumbnail: "https://img.freepik.com/free-vector/gradient-night-sky-with-stars_23-2148282506.jpg",
	},
];

interface BackgroundSelectorProps {
	selected: string;
	onSelect: (path: string) => void;
}

export function BackgroundSelector({ selected, onSelect }: BackgroundSelectorProps) {
	const [selectInProgress, setSelectInProgress] = useState(false);
	const [lastSelected, setLastSelected] = useState<string | null>(null);

	const handleBackgroundSelect = (bgPath: string) => {
		// Enhanced visual feedback during selection
		setSelectInProgress(true);
		setLastSelected(bgPath);

		// Select the background
		onSelect(bgPath);

		// Reset states after animation period
		setTimeout(() => {
			setSelectInProgress(false);
			setTimeout(() => setLastSelected(null), 300);
		}, 300);
	};

	return (
		<div className="space-y-4">
			<h4 className="text-sm font-medium mb-2">Background</h4>
			<div className="grid grid-cols-2 gap-2">
				{BACKGROUND_OPTIONS.map((bg) => (
					<motion.button
						key={bg.id}
						className={`flex flex-col items-center p-2 rounded-md bg-background border 
							${selected === bg.path ? "border-primary shadow-lg" : "border-border hover:bg-secondary"} 
							cursor-pointer relative overflow-hidden`}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => !selectInProgress && handleBackgroundSelect(bg.path)}
						transition={{ duration: 0.2 }}
						title={bg.name}>
						<div className="relative w-full aspect-video mb-1">
							<Image
								src={bg.thumbnail}
								alt={bg.name}
								width={300}
								height={200}
								style={{
									objectFit: "cover",
									width: "100%",
									height: "100%",
								}}
								className="rounded-sm"
							/>

							{/* Enhanced animation for background being selected */}
							{lastSelected === bg.path && (
								<>
									<motion.div
										className="absolute inset-0 bg-primary/15 rounded-md"
										initial={{ opacity: 0.8 }}
										animate={{ opacity: 0 }}
										transition={{ duration: 0.7 }}
									/>
									<motion.div
										className="absolute inset-0 border-2 border-primary rounded-md"
										initial={{ opacity: 0.8 }}
										animate={{ opacity: 0 }}
										transition={{ duration: 0.5 }}
									/>
								</>
							)}
						</div>
						<span className="text-xs text-center">{bg.name}</span>
					</motion.button>
				))}
			</div>
		</div>
	);
}
