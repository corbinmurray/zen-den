export interface Position {
	x: number;
	y: number;
}

export interface GardenItem {
	id: string;
	type: string;
	name: string;
	imagePath: string;
	position: Position;
	rotation: number;
	scale: number;
	zIndex?: number;
}

export interface ElementOption {
	type: string;
	name: string;
	imagePath: string;
	preview?: string;
	category?: string;
}

export interface Garden {
	id?: string;
	name?: string;
	lastModifiedAt: number;
	items: GardenItem[];
	atmosphere?: Atmosphere;
}

export interface Atmosphere {
	timeOfDay: "day" | "sunset" | "night";
	weather: "clear" | "cloudy" | "rainy" | "snowy";
}

export interface BackgroundOption {
	id: string;
	name: string;
	path: string;
	thumbnail: string;
}
