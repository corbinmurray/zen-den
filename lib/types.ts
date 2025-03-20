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
	name?: string;
	atmosphereSettings?: AtmosphereSettings;
}

export interface ElementOption {
	type: string;
	name: string;
	imagePath: string;
	preview: string;
	category?: string;
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

export interface AtmosphereSettings {
	timeOfDay: "day" | "sunset" | "night";
	weather: "clear" | "cloudy" | "rainy" | "snowy";
	effects: ("leaves" | "blossoms" | "butterflies")[];
	effectsIntensity: number;
}
