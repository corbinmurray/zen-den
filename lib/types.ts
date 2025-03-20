export interface Position {
	x: number;
	y: number;
}

export interface GardenElement {
	id: string;
	type: string;
	name: string;
	imagePath: string;
	position: Position;
	rotation: number;
	scale: number;
	zIndex?: number;
}

export interface GardenData {
	elements: GardenElement[];
	background: string;
	timestamp: string;
}

export interface ElementOption {
	type: string;
	name: string;
	imagePath: string;
	preview: string;
}

export interface BackgroundOption {
	id: string;
	name: string;
	path: string;
	thumbnail: string;
}

export interface SoundOption {
	id: string;
	name: string;
	path: string;
}
