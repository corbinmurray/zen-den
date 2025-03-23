import { storeGarden } from "@/lib/db";
import { Garden } from "@/lib/types";
import { generateGardenId } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		if (!body.garden) {
			console.error("Error creating share link. Garden data was not provided.");
			return NextResponse.json({ error: "Garden data is required" }, { status: 400 });
		}

		const garden: Garden = body.garden;

		if (!garden.items || !Array.isArray(garden.items)) {
			console.error("No garden items to recreate share URL");
			return NextResponse.json({ error: "Garden must include items array" }, { status: 400 });
		}

		if (!garden.id) {
			garden.id = generateGardenId();
		}

		const id = garden.id;
		await storeGarden(garden);

		const host = request.headers.get("host") || request.headers.get("x-forwarded-host");
		const protocol = request.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");

		const origin = host ? `${protocol}://${host}` : request.nextUrl.origin;
		const shareUrl = `${origin}/view?id=${id}`;

		console.log("Created share URL", shareUrl);

		return NextResponse.json({
			id,
			shareUrl,
		});
	} catch (error) {
		console.error("Error creating share:", error);
		return NextResponse.json({ error: "Failed to create share link" }, { status: 500 });
	}
}
