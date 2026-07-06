import connectToDatabase from "@/lib/db";
import Bowl from "@/models/Bowl";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();

    // Parse micros comma separated string if it's sent as a string
    if (typeof body.micros === "string") {
      body.micros = body.micros.split(",").map((s: string) => s.trim()).filter(Boolean);
    }

    if (!body.imageId || body.imageId === "") {
      delete body.imageId;
    }

    const updatedBowl = await Bowl.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedBowl) {
      return NextResponse.json({ error: "Bowl not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, bowl: updatedBowl }, { status: 200 });
  } catch (error) {
    console.error("Update bowl error:", error);
    return NextResponse.json({ error: "Failed to update bowl" }, { status: 500 });
  }
}
