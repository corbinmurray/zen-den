"use client";

import { AtmosphereSettings } from "@/components/garden/atmosphere-settings";
import { ElementPanel } from "@/components/garden/element-panel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Atmosphere, ElementOption, Garden, GardenItem } from "@/lib/types";
import { useZenGardenStore } from "@/providers/zen-garden-store-provider";
import { SaveIcon, Share, TrashIcon } from "lucide-react";
import { Dispatch, SetStateAction, useCallback } from "react";
import { toast } from "sonner";

interface TabbedPanelProps {
	atmosphere: Atmosphere;
	selectedGardenId: string | null;
	gardenName: string;
	gardenItems: GardenItem[];
	setAtmosphere: Dispatch<SetStateAction<Atmosphere>>;
	addGardenItem: (item: GardenItem) => void;
	clearGardenItems: () => void;
	setSaveDialogOpen: Dispatch<SetStateAction<boolean>>;
	setShareAfterSave: Dispatch<SetStateAction<boolean>>;
	handleShare: () => void;
}

export function TabbedPanel({
	atmosphere,
	selectedGardenId,
	gardenName,
	gardenItems,
	setAtmosphere,
	addGardenItem,
	clearGardenItems,
	setSaveDialogOpen,
	handleShare,
}: TabbedPanelProps) {
	const { update: updateGarden } = useZenGardenStore((state) => state);

	// Handle adding an element to the garden
	const handleAddElement = useCallback(
		(element: ElementOption) => {
			// Generate a new garden item from the element option
			const gardenItem: GardenItem = {
				id: crypto.randomUUID(),
				type: element.type,
				name: element.name,
				imagePath: element.imagePath,
				position: { x: Math.random() * 300, y: Math.random() * 300 },
				rotation: 0,
				scale: 1,
				zIndex: Date.now(),
			};

			addGardenItem(gardenItem);
		},
		[addGardenItem]
	);

	// Handle save button click
	const handleSave = useCallback(() => {
		if (selectedGardenId) {
			// Create the garden object
			const garden: Garden = {
				id: selectedGardenId,
				name: gardenName,
				items: gardenItems,
				atmosphere: atmosphere,
				lastModifiedAt: Date.now(),
			};

			// Update the existing garden
			updateGarden(garden);

			// Show success toast
			toast.success("Garden updated", {
				description: `"${gardenName}" has been updated successfully.`,
			});
		} else {
			// If it's a new garden, show the dialog to name it
			setSaveDialogOpen(true);
		}
	}, [selectedGardenId, updateGarden, gardenName, gardenItems, atmosphere, setSaveDialogOpen]);

	// Handle clear button click
	const handleClear = useCallback(() => {
		toast.warning("Clear garden?", {
			description: "Are you sure you want to clear your garden? This cannot be undone.",
			action: {
				label: "Yes, clear it",
				onClick: () => {
					clearGardenItems();
					toast.success("Garden cleared", {
						description: "Your zen garden has been reset.",
					});
				},
			},
			cancel: {
				label: "Cancel",
				onClick: () => {},
			},
		});
	}, [clearGardenItems]);

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
						<ElementPanel onAddElement={handleAddElement} />
					</TabsContent>

					<TabsContent value="atmosphere" className="absolute inset-0 overflow-auto p-3 mt-0 border-0">
						<AtmosphereSettings settings={atmosphere} onSettingsChange={setAtmosphere} />
					</TabsContent>
				</div>

				{/* Action Buttons - Fixed at Bottom */}
				<div className="mt-auto border-t border-border px-3 py-2">
					<div className="space-y-3">
						<div className="grid grid-cols-2 gap-3">
							<Button onClick={handleSave} className="w-full">
								<SaveIcon className="mr-1 h-4 w-4" />
								Save
							</Button>

							<Button onClick={handleShare} variant="outline" className="w-full">
								<Share className="mr-1 h-4 w-4" />
								Share
							</Button>
						</div>

						<Button
							onClick={handleClear}
							className="w-full border border-destructive bg-transparent text-destructive hover:bg-destructive hover:text-foreground">
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
