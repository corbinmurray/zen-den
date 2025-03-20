"use client";

import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
	onSave: () => void;
	onShare: () => void;
	onClear: () => void;
}

export function ActionButtons({ onSave, onShare, onClear }: ActionButtonsProps) {
	return (
		<div className="space-y-3">
			<div className="grid grid-cols-2 gap-3">
				<Button onClick={onSave} className="w-full">
					<SaveIcon className="mr-1 h-4 w-4" />
					Save
				</Button>

				<Button onClick={onShare} variant="outline" className="w-full">
					<ShareIcon className="mr-1 h-4 w-4" />
					Share
				</Button>
			</div>

			<Button onClick={onClear} className="w-full border border-destructive bg-transparent text-destructive hover:bg-destructive hover:text-foreground">
				<TrashIcon className="mr-1 h-4 w-4" />
				Clear Garden
			</Button>
		</div>
	);
}

// Icons
function SaveIcon(props: React.SVGProps<SVGSVGElement>) {
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
			<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
			<polyline points="17 21 17 13 7 13 7 21"></polyline>
			<polyline points="7 3 7 8 15 8"></polyline>
		</svg>
	);
}

function ShareIcon(props: React.SVGProps<SVGSVGElement>) {
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
			<circle cx="18" cy="5" r="3"></circle>
			<circle cx="6" cy="12" r="3"></circle>
			<circle cx="18" cy="19" r="3"></circle>
			<line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
			<line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
		</svg>
	);
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
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
			<polyline points="3 6 5 6 21 6"></polyline>
			<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
		</svg>
	);
}
