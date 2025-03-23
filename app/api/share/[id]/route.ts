import { getGarden } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const id = request.nextUrl.searchParams.get("id");

		if (!id) {
			console.error("Unable to fetch garden. No id was provided");
			return NextResponse.json({ error: "Garden ID is required" }, { status: 400 });
		}

		const garden = await getGarden(id);

		if (!garden) {
			console.error("Unable to find garden with id", id);
			return NextResponse.json({ error: "Garden not found" }, { status: 404 });
		}

		console.log("Found garden", id);
		return NextResponse.json({ garden });
	} catch (error) {
		console.error("Error retrieving garden:", error);
		return NextResponse.json({ error: "Failed to retrieve garden" }, { status: 500 });
	}
}
