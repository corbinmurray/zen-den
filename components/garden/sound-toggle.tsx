"use client";

import { SoundOption } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

// Sample sound options
const SOUND_OPTIONS: SoundOption[] = [
	{
		id: "water",
		name: "Water Trickling",
		path: "/sounds/water-trickling.mp3",
	},
	{
		id: "chimes",
		name: "Wind Chimes",
		path: "/sounds/wind-chimes.mp3",
	},
	{
		id: "ambient",
		name: "Ambient Music",
		path: "/sounds/ambient-zen.mp3",
	},
	{
		id: "birds",
		name: "Bird Sounds",
		path: "/sounds/birds.mp3",
	},
];

interface SoundToggleProps {
	enabled: boolean;
	currentSound: string | null;
	onToggle: () => void;
	onSoundChange: (soundPath: string) => void;
}

export function SoundToggle({ enabled, currentSound, onToggle, onSoundChange }: SoundToggleProps) {
	const [isOpen, setIsOpen] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const handleSoundSelect = (soundPath: string) => {
		onSoundChange(soundPath);
		setIsOpen(false);
	};

	// Handle audio playback
	useEffect(() => {
		// Create audio element if it doesn't exist
		if (!audioRef.current) {
			audioRef.current = new Audio();
			audioRef.current.loop = true;
		}

		// Update audio source if needed
		if (currentSound && audioRef.current.src !== window.location.origin + currentSound) {
			audioRef.current.src = currentSound;
		}

		// Play or pause based on enabled state
		if (enabled && currentSound) {
			// Using a promise with catch to handle autoplay restrictions gracefully
			const playPromise = audioRef.current.play();

			if (playPromise !== undefined) {
				playPromise.catch((error) => {
					console.log("Autoplay prevented, user needs to interact with the page first:", error);
				});
			}
		} else if (audioRef.current) {
			audioRef.current.pause();
		}

		// Cleanup on component unmount
		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current = null;
			}
		};
	}, [enabled, currentSound]);

	return (
		<div>
			<h4 className="text-sm font-medium mb-2">Ambient Sound</h4>

			<div className="flex items-center space-x-2 mb-2">
				<button
					className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
						enabled ? "bg-primary" : "bg-muted"
					}`}
					onClick={onToggle}
					role="switch"
					aria-checked={enabled}>
					<span
						className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
							enabled ? "translate-x-4" : "translate-x-0"
						}`}
					/>
				</button>
				<span className="text-xs">{enabled ? "Sound On" : "Sound Off"}</span>
			</div>

			{enabled && (
				<div className="mt-2">
					<div className="relative border border-border rounded-md cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
						<div className="flex items-center justify-between p-2">
							<span className="text-xs">{currentSound ? SOUND_OPTIONS.find((s) => s.path === currentSound)?.name || "Select Sound" : "Select Sound"}</span>
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
								className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
								<polyline points="6 9 12 15 18 9"></polyline>
							</svg>
						</div>

						{isOpen && (
							<div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-md z-10">
								{SOUND_OPTIONS.map((sound) => (
									<div key={sound.id} className="p-2 hover:bg-muted cursor-pointer text-xs" onClick={() => handleSoundSelect(sound.path)}>
										{sound.name}
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
