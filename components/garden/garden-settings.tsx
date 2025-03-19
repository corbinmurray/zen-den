"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { BackgroundSelector } from "./background-selector";
import { SoundToggle } from "./sound-toggle";

interface GardenSettingsProps {
	background: string;
	onBackgroundChange: (path: string) => void;
	soundEnabled: boolean;
	onSoundToggle: () => void;
	currentSound: string | null;
	onSoundChange: (soundPath: string) => void;
	showOutlines: boolean;
	onShowOutlinesChange: (show: boolean) => void;
}

export function GardenSettings({
	background,
	onBackgroundChange,
	soundEnabled,
	onSoundToggle,
	currentSound,
	onSoundChange,
	showOutlines,
	onShowOutlinesChange,
}: GardenSettingsProps) {
	const [zoomLevel, setZoomLevel] = useState<number[]>([100]);

	const handleZoomChange = (value: number[]) => {
		setZoomLevel(value);
		// Here you would typically pass this to a parent component
		// that would handle the actual zoom functionality
		// onZoomChange(value[0]);
	};

	return (
		<div className="space-y-8">
			<BackgroundSelector selected={background} onSelect={onBackgroundChange} />

			<div className="space-y-2">
				<h4 className="text-sm font-medium">Display Options</h4>

				<div className="flex items-center justify-between">
					<Label htmlFor="show-outlines" className="text-xs cursor-pointer">
						Show Element Outlines
					</Label>
					<Switch id="show-outlines" checked={showOutlines} onCheckedChange={onShowOutlinesChange} />
				</div>

				<div className="space-y-2">
					<div className="flex justify-between items-center">
						<Label htmlFor="zoom-slider" className="text-xs">
							Canvas Zoom
						</Label>
						<span className="text-xs text-muted">{zoomLevel[0]}%</span>
					</div>
					<Slider id="zoom-slider" min={50} max={150} step={5} value={zoomLevel} onValueChange={handleZoomChange} className="py-1" />
				</div>
			</div>
		</div>
	);
}
