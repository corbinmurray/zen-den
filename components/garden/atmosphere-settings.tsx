import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Cloud, CloudRain, CloudSnow, Moon, Sun, Sunset } from "lucide-react";

export interface AtmosphereSettings {
	timeOfDay: "day" | "sunset" | "night";
	weather: "clear" | "cloudy" | "rainy" | "snowy";
}

interface AtmosphereSettingsProps {
	settings: AtmosphereSettings;
	onSettingsChange: (settings: AtmosphereSettings) => void;
}

export function AtmosphereSettings({ settings, onSettingsChange }: AtmosphereSettingsProps) {
	const updateSettings = (updatedValues: Partial<AtmosphereSettings>) => {
		onSettingsChange({ ...settings, ...updatedValues });
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
							<Sun className="text-orange-400" />
							<span className="text-xs">Day</span>
						</Label>
					</div>

					<div>
						<RadioGroupItem value="sunset" id="sunset" className="peer sr-only" />
						<Label
							htmlFor="sunset"
							className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-2 hover:bg-secondary hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
							<Sunset className="text-amber-500" />
							<span className="text-xs">Sunset</span>
						</Label>
					</div>

					<div>
						<RadioGroupItem value="night" id="night" className="peer sr-only" />
						<Label
							htmlFor="night"
							className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-2 hover:bg-secondary hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
							<Moon className="text-indigo-400" />
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
							<Sun className="text-blue-400" />
							<span className="text-xs">Clear</span>
						</Label>
					</div>

					<div>
						<RadioGroupItem value="cloudy" id="cloudy" className="peer sr-only" />
						<Label
							htmlFor="cloudy"
							className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-2 hover:bg-secondary hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
							<Cloud className="text-gray-400" />
							<span className="text-xs">Cloudy</span>
						</Label>
					</div>

					<div>
						<RadioGroupItem value="rainy" id="rainy" className="peer sr-only" />
						<Label
							htmlFor="rainy"
							className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-2 hover:bg-secondary hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
							<CloudRain className="text-blue-500" />
							<span className="text-xs">Rainy</span>
						</Label>
					</div>

					<div>
						<RadioGroupItem value="snowy" id="snowy" className="peer sr-only" />
						<Label
							htmlFor="snowy"
							className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-2 hover:bg-secondary hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
							<CloudSnow className="text-blue-200" />
							<span className="text-xs">Snowy</span>
						</Label>
					</div>
				</RadioGroup>
			</div>
		</div>
	);
}
