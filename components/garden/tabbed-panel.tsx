import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ElementOption } from "@/lib/types";
import { ActionButtons } from "./action-buttons";
import { AtmosphereSettings, type AtmosphereSettings as AtmosphereSettingsType } from "./atmosphere-settings";
import { ElementPanel } from "./element-panel";

interface TabbedPanelProps {
	onAddElement: (element: ElementOption) => void;
	background: string;
	onBackgroundChange: (path: string) => void;
	soundEnabled: boolean;
	onSoundToggle: () => void;
	currentSound: string | null;
	onSoundChange: (soundPath: string) => void;
	showOutlines: boolean;
	onShowOutlinesChange: (show: boolean) => void;
	atmosphereSettings?: AtmosphereSettingsType;
	onAtmosphereChange?: (settings: AtmosphereSettingsType) => void;
	onSave: () => void;
	onShare: () => void;
	onClear: () => void;
}

export function TabbedPanel({
	onAddElement,
	soundEnabled,
	onSoundToggle,
	currentSound,
	onSoundChange,
	atmosphereSettings = {
		timeOfDay: "day",
		weather: "clear",
	},
	onAtmosphereChange = () => {},
	onSave,
	onShare,
	onClear,
}: TabbedPanelProps) {
	return (
		<div className="flex flex-col h-full overflow-hidden bg-card rounded-lg border border-border">
			<Tabs defaultValue="elements" className="flex flex-col h-full p-1">
				<div className="border-b border-border flex-shrink-0">
					<TabsList className="h-12 w-full justify-start bg-transparent">
						<TabsTrigger
							value="elements"
							className="flex items-center gap-1 px-3 py-2 text-xs data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none data-[state=active]:bg-transparent min-w-[80px] hover:cursor-pointer hover:text-foreground">
							<ElementsIcon className="h-4 w-4" />
							<span>Elements</span>
						</TabsTrigger>
						<TabsTrigger
							value="atmosphere"
							className="flex items-center gap-1 px-3 py-2 text-xs data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none data-[state=active]:bg-transparent min-w-[95px] hover:cursor-pointer hover:text-foreground">
							<AtmosphereIcon className="h-4 w-4" />
							<span>Atmosphere</span>
						</TabsTrigger>
						<TabsTrigger
							value="sounds"
							className="flex items-center gap-1 px-3 py-2 text-xs data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none data-[state=active]:bg-transparent min-w-[80px] hover:cursor-pointer hover:text-foreground">
							<SoundIcon className="h-4 w-4" />
							<span>Sounds</span>
						</TabsTrigger>
					</TabsList>
				</div>

				<div className="flex-1 overflow-hidden relative">
					<TabsContent value="elements" className="absolute inset-0 overflow-auto p-2 mt-0 border-0">
						<ElementPanel onAddElement={onAddElement} />
					</TabsContent>

					<TabsContent value="atmosphere" className="absolute inset-0 overflow-auto p-3 mt-0 border-0">
						<AtmosphereSettings settings={atmosphereSettings} onSettingsChange={onAtmosphereChange} />
					</TabsContent>

					<TabsContent value="sounds" className="absolute inset-0 overflow-auto p-3 mt-0 border-0">
						<div className="space-y-4">
							<h3 className="text-lg font-medium">Sound Settings</h3>
							<div className="mt-2">
								<div className="flex items-center space-x-2 mb-3">
									<SoundIcon className="h-5 w-5 text-primary" />
									<span className="text-sm font-medium">Ambient Audio</span>
								</div>

								<p className="text-xs text-muted mb-4">
									Enhance your zen experience with calming background sounds. Toggle sounds on or off and select your preferred ambient audio.
								</p>

								<div className="mt-4 mb-8">
									<div className="flex items-center space-x-2 mb-2">
										<button
											className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
												soundEnabled ? "bg-primary" : "bg-muted"
											}`}
											onClick={onSoundToggle}
											role="switch"
											aria-checked={soundEnabled}>
											<span
												className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
													soundEnabled ? "translate-x-5" : "translate-x-0"
												}`}
											/>
										</button>
										<span className="text-sm">{soundEnabled ? "Sound On" : "Sound Off"}</span>
									</div>

									{soundEnabled && (
										<div className="mt-4 space-y-3">
											<h4 className="text-sm font-medium">Select Sound</h4>
											<SoundOption
												id="water"
												name="Water Trickling"
												path="/sounds/water-trickling.mp3"
												selected={currentSound === "/sounds/water-trickling.mp3"}
												onClick={() => onSoundChange("/sounds/water-trickling.mp3")}
											/>
											<SoundOption
												id="chimes"
												name="Wind Chimes"
												path="/sounds/wind-chimes.mp3"
												selected={currentSound === "/sounds/wind-chimes.mp3"}
												onClick={() => onSoundChange("/sounds/wind-chimes.mp3")}
											/>
											<SoundOption
												id="ambient"
												name="Ambient Music"
												path="/sounds/ambient-zen.mp3"
												selected={currentSound === "/sounds/ambient-zen.mp3"}
												onClick={() => onSoundChange("/sounds/ambient-zen.mp3")}
											/>
											<SoundOption
												id="birds"
												name="Bird Sounds"
												path="/sounds/birds.mp3"
												selected={currentSound === "/sounds/birds.mp3"}
												onClick={() => onSoundChange("/sounds/birds.mp3")}
											/>
										</div>
									)}
								</div>

								<div className="bg-muted/30 border border-border rounded-md p-3 mt-6">
									<div className="flex items-start gap-2 text-xs text-muted">
										<div className="mt-1 shrink-0">ℹ️</div>
										<p>Sound may not play automatically due to browser restrictions. If no sound is playing, try interacting with the page first.</p>
									</div>
								</div>
							</div>
						</div>
					</TabsContent>
				</div>

				{/* Action Buttons - Fixed at Bottom */}
				<div className="mt-auto border-t border-border px-3 py-2">
					<ActionButtons onSave={onSave} onShare={onShare} onClear={onClear} />
				</div>
			</Tabs>
		</div>
	);
}

// Sound Option Component
interface SoundOptionProps {
	id: string;
	name: string;
	path: string;
	selected: boolean;
	onClick: () => void;
}

function SoundOption({ name, selected, onClick }: SoundOptionProps) {
	return (
		<div
			className={`flex items-center p-2 rounded-md cursor-pointer ${
				selected ? "bg-primary/10 border border-primary" : "hover:bg-secondary border border-border"
			}`}
			onClick={onClick}>
			<div className="mr-3">
				<div className={`w-4 h-4 rounded-full ${selected ? "bg-primary" : "border border-muted"}`}>
					{selected && (
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
							<path
								fillRule="evenodd"
								d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
								clipRule="evenodd"
							/>
						</svg>
					)}
				</div>
			</div>
			<div className="flex-1">
				<div className="text-sm font-medium">{name}</div>
			</div>
		</div>
	);
}

// Icons
function ElementsIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
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
			{...props}>
			<rect width="7" height="7" x="3" y="3" rx="1" />
			<rect width="7" height="7" x="14" y="3" rx="1" />
			<rect width="7" height="7" x="14" y="14" rx="1" />
			<rect width="7" height="7" x="3" y="14" rx="1" />
		</svg>
	);
}

function AtmosphereIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
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
			{...props}>
			<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
			<path d="M22 10v1" />
			<path d="M2 10v1" />
			<path d="M12 2v1" />
			<path d="M12 21v1" />
			<path d="m4.93 4.93-.7.7" />
			<path d="m19.07 4.93.7.7" />
		</svg>
	);
}

function SoundIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
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
			{...props}>
			<path d="M2 10v3" />
			<path d="M6 6v11" />
			<path d="M10 3v18" />
			<path d="M14 8v7" />
			<path d="M18 5v13" />
			<path d="M22 10v3" />
		</svg>
	);
}
