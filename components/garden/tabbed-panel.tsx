import { AtmosphereSettings, type AtmosphereSettings as AtmosphereSettingsType } from "@/components/garden/atmosphere-settings";
import { ElementPanel } from "@/components/garden/element-panel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ElementOption } from "@/lib/types";
import { SaveIcon, Share, TrashIcon } from "lucide-react";

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
					</TabsList>
				</div>

				<div className="flex-1 overflow-hidden relative">
					<TabsContent value="elements" className="absolute inset-0 overflow-auto p-2 mt-0 border-0">
						<ElementPanel onAddElement={onAddElement} />
					</TabsContent>

					<TabsContent value="atmosphere" className="absolute inset-0 overflow-auto p-3 mt-0 border-0">
						<AtmosphereSettings settings={atmosphereSettings} onSettingsChange={onAtmosphereChange} />
					</TabsContent>
				</div>

				{/* Action Buttons - Fixed at Bottom */}
				<div className="mt-auto border-t border-border px-3 py-2">
					<div className="space-y-3">
						<div className="grid grid-cols-2 gap-3">
							<Button onClick={onSave} className="w-full">
								<SaveIcon className="mr-1 h-4 w-4" />
								Save
							</Button>

							<Button onClick={onShare} variant="outline" className="w-full">
								<Share className="mr-1 h-4 w-4" />
								Share
							</Button>
						</div>

						<Button onClick={onClear} className="w-full border border-destructive bg-transparent text-destructive hover:bg-destructive hover:text-foreground">
							<TrashIcon className="mr-1 h-4 w-4" />
							Clear Garden
						</Button>
					</div>
				</div>
			</Tabs>
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
