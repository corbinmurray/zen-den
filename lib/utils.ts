import { ClassValue, clsx } from "clsx";
import { nanoid } from "nanoid";
import { twMerge } from "tailwind-merge";
import { Garden } from "./types";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Generates a consistent ID for gardens
 * @returns A unique ID suitable for gardens and share URLs
 */
export function generateGardenId(): string {
	return nanoid(7);
}

/**
 * Creates a shareable URL for a garden using the share API
 * @param garden Garden data to share
 * @returns Promise with the share URL or throws an error
 */
export async function getGardenShareUrl(garden: Garden): Promise<string> {
	// Call the share API
	const response = await fetch("/api/share", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ garden }),
	});

	if (!response.ok) {
		throw new Error("Failed to create share link");
	}

	const { shareUrl } = await response.json();
	return shareUrl;
}

/**
 * Copies text to clipboard with fallback
 * @param text Text to copy
 * @returns Promise that resolves when copying is complete
 */
export async function copyToClipboard(text: string): Promise<void> {
	try {
		await navigator.clipboard.writeText(text);
	} catch (err) {
		console.error("Failed to copy text:", err);
		// Fallback for browsers that don't support clipboard API
		const textArea = document.createElement("textarea");
		textArea.value = text;
		textArea.style.position = "fixed";
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();

		try {
			document.execCommand("copy");
		} catch (err) {
			console.error("Fallback clipboard copy failed:", err);
			throw new Error("Failed to copy to clipboard");
		} finally {
			document.body.removeChild(textArea);
		}
	}
}

/**
 * Formats a timestamp as a more elegant date stamp. Example 'Today, 5:40pm'
 * @param timestamp The timestamp to format
 * @returns The formatted date string
 */
export function formatDate(timestamp: number): string {
	const date = new Date(timestamp);
	const now = new Date();
	const isToday = date.toDateString() === now.toDateString();

	if (isToday) {
		return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
	}

	const yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);
	const isYesterday = date.toDateString() === yesterday.toDateString();

	if (isYesterday) {
		return "Yesterday";
	}

	const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
	if (date.getFullYear() !== now.getFullYear()) {
		options.year = "numeric";
	}

	return date.toLocaleDateString(undefined, options);
}
