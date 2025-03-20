"use client";

import { ElementOption } from "@/lib/types";
import { useState } from "react";
import { ActionButtons } from "./action-buttons";
import { ElementPanel } from "./element-panel";
import { GardenSettings } from "./garden-settings";

// Tab identifiers
type TabId = "elements" | "settings" | "sounds";

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
	onSave: () => void;
	onShare: () => void;
	onClear: () => void;
}

export function TabbedPanel({
	onAddElement,
	background,
	onBackgroundChange,
	soundEnabled,
	onSoundToggle,
	currentSound,
	onSoundChange,
	showOutlines,
	onShowOutlinesChange,
	onSave,
	onShare,
	onClear,
}: TabbedPanelProps) {
	const [activeTab, setActiveTab] = useState<TabId>("elements");

	return (
		<div className="flex flex-col h-full overflow-hidden bg-card rounded-lg border border-border">
			{/* Tab Navigation */}
			<div className="flex border-b border-border">
				<TabButton id="elements" active={activeTab === "elements"} onClick={() => setActiveTab("elements")}>
					<ElementsIcon className="h-4 w-4 mr-2" />
					Elements
				</TabButton>

				<TabButton id="settings" active={activeTab === "settings"} onClick={() => setActiveTab("settings")}>
					<SettingsIcon className="h-4 w-4 mr-2" />
					Settings
				</TabButton>

				<TabButton id="sounds" active={activeTab === "sounds"} onClick={() => setActiveTab("sounds")}>
					<SoundIcon className="h-4 w-4 mr-2" />
					Sounds
				</TabButton>
			</div>

			{/* Tab Content */}
			<div className="flex-1 overflow-y-auto p-4">
				{activeTab === "elements" && <ElementPanel onAddElement={onAddElement} />}

				{activeTab === "settings" && (
					<GardenSettings
						background={background}
						onBackgroundChange={onBackgroundChange}
						soundEnabled={soundEnabled}
						onSoundToggle={onSoundToggle}
						currentSound={currentSound}
						onSoundChange={onSoundChange}
						showOutlines={showOutlines}
						onShowOutlinesChange={onShowOutlinesChange}
					/>
				)}

				{activeTab === "sounds" && (
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
				)}
			</div>

			{/* Action Buttons - Fixed at Bottom */}
			<div className="mt-auto border-t border-border p-4">
				<ActionButtons onSave={onSave} onShare={onShare} onClear={onClear} />
			</div>
		</div>
	);
}

// Tab Button Component
interface TabButtonProps {
	id: string;
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}

function TabButton({ id, active, onClick, children }: TabButtonProps) {
	return (
		<button
			id={`tab-${id}`}
			role="tab"
			aria-selected={active}
			aria-controls={`tabpanel-${id}`}
			className={`flex items-center px-4 py-2 text-sm font-medium transition-colors ${
				active ? "text-primary border-b-2 border-primary" : "text-muted hover:text-foreground hover:bg-muted/30"
			}`}
			onClick={onClick}>
			{children}
		</button>
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

function SoundOption({ id, name, selected, onClick }: SoundOptionProps) {
	return (
		<div
			className={`p-3 rounded-md border transition-colors cursor-pointer flex items-center gap-3 ${
				selected ? "bg-primary/10 border-primary" : "border-border hover:border-muted"
			}`}
			onClick={onClick}>
			<div className={`shrink-0 h-4 w-4 rounded-full border ${selected ? "border-primary bg-primary" : "border-muted"}`}>
				{selected && (
					<div className="h-full w-full flex items-center justify-center">
						<div className="h-1 w-1 rounded-full bg-white"></div>
					</div>
				)}
			</div>
			<span className="text-sm">{name}</span>
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

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
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
			<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
			<circle cx="12" cy="12" r="3" />
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
			<path d="M8.5 5.5V18M15.5 5.5V18" />
			<path d="M2 10h20" />
			<path d="M2 14h20" />
		</svg>
	);
}
