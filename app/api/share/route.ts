import { storeGarden } from "@/lib/db";
import { Garden } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		// Parse the request body
		const body = await request.json();

		// Validate the request body
		if (!body.garden) {
			return NextResponse.json({ error: "Garden data is required" }, { status: 400 });
		}

		const garden: Garden = body.garden;

		// Basic validation
		if (!garden.items || !Array.isArray(garden.items)) {
			return NextResponse.json({ error: "Garden must include items array" }, { status: 400 });
		}

		// Store the garden and get a unique ID
		const id = storeGarden(garden);

		// Construct the share URL
		const shareUrl = `${request.nextUrl.origin}/view?id=${id}`;

		// Return the ID and share URL
		return NextResponse.json({
			id,
			shareUrl,
		});
	} catch (error) {
		console.error("Error creating share:", error);
		return NextResponse.json({ error: "Failed to create share link" }, { status: 500 });
	}
}
