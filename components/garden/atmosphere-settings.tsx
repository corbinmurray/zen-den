"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";

export interface AtmosphereSettings {
	timeOfDay: "day" | "sunset" | "night";
	weather: "clear" | "cloudy" | "rainy" | "snowy";
	effects: ("leaves" | "blossoms" | "butterflies")[];
	effectsIntensity: number;
}

interface AtmosphereSettingsProps {
	settings: AtmosphereSettings;
	onSettingsChange: (settings: AtmosphereSettings) => void;
}

export function AtmosphereSettings({ settings, onSettingsChange }: AtmosphereSettingsProps) {
	const updateSettings = (updatedValues: Partial<AtmosphereSettings>) => {
		onSettingsChange({ ...settings, ...updatedValues });
	};

	const toggleEffect = (effect: "leaves" | "blossoms" | "butterflies") => {
		const newEffects = settings.effects.includes(effect) ? settings.effects.filter((e) => e !== effect) : [...settings.effects, effect];

		updateSettings({ effects: newEffects });
	};

	return (
		<div className="space-y-6">
			{/* Time of Day Section */}
			<div className="space-y-3">
				<h4 className="text-sm font-medium">Time of Day</h4>
				<RadioGroup
					value={settings.timeOfDay}
					onValueChange={(value) => updateSettings({ timeOfDay: value as "day" | "sunset" | "night" })}
					className="grid grid-cols-3 gap-2">
					<div>
						<RadioGroupItem value="day" id="day" className="peer sr-only" />
						<Label
							htmlFor="day"
							className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-2 hover:bg-secondary hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="mb-1 text-orange-400">
								<circle cx="12" cy="12" r="4" />
								<path d="M12 2v2" />
								<path d="M12 20v2" />
								<path d="m4.93 4.93 1.41 1.41" />
								<path d="m17.66 17.66 1.41 1.41" />
								<path d="M2 12h2" />
								<path d="M20 12h2" />
								<path d="m6.34 17.66-1.41 1.41" />
								<path d="m19.07 4.93-1.41 1.41" />
							</svg>
							<span className="text-xs">Day</span>
						</Label>
					</div>

					<div>
						<RadioGroupItem value="sunset" id="sunset" className="peer sr-only" />
						<Label
							htmlFor="sunset"
							className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-2 hover:bg-secondary hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="mb-1 text-amber-500">
								<path d="M12 10V2" />
								<path d="m4.93 10.93 1.41 1.41" />
								<path d="M2 18h2" />
								<path d="M20 18h2" />
								<path d="m19.07 10.93-1.41 1.41" />
								<path d="M22 22H2" />
								<path d="m16 6-4 4-4-4" />
								<path d="M16 18a4 4 0 0 0-8 0" />
							</svg>
							<span className="text-xs">Sunset</span>
						</Label>
					</div>

					<div>
						<RadioGroupItem value="night" id="night" className="peer sr-only" />
						<Label
							htmlFor="night"
							className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-2 hover:bg-secondary hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="mb-1 text-indigo-400">
								<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
							</svg>
							<span className="text-xs">Night</span>
						</Label>
					</div>
				</RadioGroup>
			</div>

			{/* Weather Section */}
			<div className="space-y-3">
				<h4 className="text-sm font-medium">Weather</h4>
				<RadioGroup
					value={settings.weather}
					onValueChange={(value) => updateSettings({ weather: value as "clear" | "cloudy" | "rainy" | "snowy" })}
					className="grid grid-cols-4 gap-2">
					<div>
						<RadioGroupItem value="clear" id="clear" className="peer sr-only" />
						<Label
							htmlFor="clear"
							className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-2 hover:bg-secondary hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="mb-1 text-blue-400">
								<circle cx="12" cy="12" r="5" />
								<path d="M12 1v2" />
								<path d="M12 21v2" />
								<path d="M4.22 4.22l1.42 1.42" />
								<path d="M18.36 18.36l1.42 1.42" />
								<path d="M1 12h2" />
								<path d="M21 12h2" />
								<path d="M4.22 19.78l1.42-1.42" />
								<path d="M18.36 5.64l1.42-1.42" />
							</svg>
							<span className="text-[10px]">Clear</span>
						</Label>
					</div>

					<div>
						<RadioGroupItem value="cloudy" id="cloudy" className="peer sr-only" />
						<Label
							htmlFor="cloudy"
							className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-2 hover:bg-secondary hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="mb-1 text-gray-400">
								<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
							</svg>
							<span className="text-[10px]">Cloudy</span>
						</Label>
					</div>

					<div>
						<RadioGroupItem value="rainy" id="rainy" className="peer sr-only" />
						<Label
							htmlFor="rainy"
							className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-2 hover:bg-secondary hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="mb-1 text-blue-500">
								<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
								<path d="M16 14v6" />
								<path d="M8 14v6" />
								<path d="M12 16v6" />
							</svg>
							<span className="text-[10px]">Rainy</span>
						</Label>
					</div>

					<div>
						<RadioGroupItem value="snowy" id="snowy" className="peer sr-only" />
						<Label
							htmlFor="snowy"
							className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-2 hover:bg-secondary hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="mb-1 text-blue-200">
								<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
								<path d="M8 15h.01" />
								<path d="M8 19h.01" />
								<path d="M12 17h.01" />
								<path d="M12 21h.01" />
								<path d="M16 15h.01" />
								<path d="M16 19h.01" />
							</svg>
							<span className="text-[10px]">Snowy</span>
						</Label>
					</div>
				</RadioGroup>
			</div>

			{/* Seasonal Effects */}
			<div className="space-y-3">
				<h4 className="text-sm font-medium">Seasonal Effects</h4>
				<div className="flex justify-between space-x-2">
					<div
						onClick={() => toggleEffect("leaves")}
						className={`flex flex-1 flex-col items-center justify-between rounded-md border-2 ${
							settings.effects.includes("leaves") ? "border-primary" : "border-muted"
						} bg-background p-2 hover:bg-secondary hover:text-accent-foreground cursor-pointer`}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="mb-1 text-amber-600">
							<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
							<path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
						</svg>
						<span className="text-[10px]">Leaves</span>
					</div>

					<div
						onClick={() => toggleEffect("blossoms")}
						className={`flex flex-1 flex-col items-center justify-between rounded-md border-2 ${
							settings.effects.includes("blossoms") ? "border-primary" : "border-muted"
						} bg-background p-2 hover:bg-secondary hover:text-accent-foreground cursor-pointer`}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="mb-1 text-pink-400">
							<path d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9m-4.5 3a4.5 4.5 0 1 0 4.5 4.5M7.5 12H9m3 4.5a4.5 4.5 0 1 0 4.5-4.5M12 16.5V15m4.5-3a4.5 4.5 0 1 1-4.5-4.5M16.5 12H15" />
							<circle cx="12" cy="12" r="3" />
						</svg>
						<span className="text-[10px]">Blossoms</span>
					</div>

					<div
						onClick={() => toggleEffect("butterflies")}
						className={`flex flex-1 flex-col items-center justify-between rounded-md border-2 ${
							settings.effects.includes("butterflies") ? "border-primary" : "border-muted"
						} bg-background p-2 hover:bg-secondary hover:text-accent-foreground cursor-pointer`}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="mb-1 text-purple-400">
							<path d="M14 3c.4.7.5 1.4.5 2.1 0 2.5-2 4.4-4.5 4.4s-4.5-2-4.5-4.4c0-.7.1-1.4.5-2.1" />
							<path d="M16.2 11.7c.7-.3 1.5-.4 2.3-.4 2.5 0 4.5 2 4.5 4.4s-2 4.5-4.5 4.5c-.8 0-1.5-.1-2.2-.4" />
							<path d="M8 11.7c-.8-.3-1.6-.4-2.3-.4C3.2 11.2 1 13.2 1 15.7c0 2.5 2 4.4 4.5 4.4.8 0 1.6-.2 2.3-.5" />
							<path d="m16 9-.3 1.5c0 .5.1 1 .3 1.5l1.7.2c.5 0 1-.1 1.4-.4l1.1 1.2" />
							<path d="m20 7-1.4.3c-.4.1-.8.3-1 .7l-1 1.5c-.3.5-.5 1-.7 1.5" />
							<path d="m8 9 .3 1.5c0 .5-.1 1-.3 1.5l-1.7.2c-.5 0-1-.1-1.4-.4L4 13" />
							<path d="m4 7 1.4.3c.4.1.8.3 1 .7l1 1.5c.3.5.5 1 .7 1.5" />
							<path d="M12 18v5" />
							<path d="m10 20 2 2 2-2" />
						</svg>
						<span className="text-[10px]">Butterflies</span>
					</div>
				</div>
			</div>

			{/* Effect Intensity Slider */}
			{settings.effects.length > 0 && (
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<Label htmlFor="effects-intensity" className="text-sm">
							Effect Intensity
						</Label>
						<span className="text-xs text-muted-foreground">{settings.effectsIntensity}%</span>
					</div>
					<Slider
						id="effects-intensity"
						min={10}
						max={100}
						step={10}
						value={[settings.effectsIntensity]}
						onValueChange={(value) => updateSettings({ effectsIntensity: value[0] })}
						className="w-full"
					/>
				</div>
			)}
		</div>
	);
}
