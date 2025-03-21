import { getGarden } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const id = params.id;

		if (!id) {
			return NextResponse.json({ error: "Garden ID is required" }, { status: 400 });
		}

		// Get the garden data
		const garden = getGarden(id);

		if (!garden) {
			return NextResponse.json({ error: "Garden not found" }, { status: 404 });
		}

		// Return the garden data
		return NextResponse.json({ garden });
	} catch (error) {
		console.error("Error retrieving garden:", error);
		return NextResponse.json({ error: "Failed to retrieve garden" }, { status: 500 });
	}
}
