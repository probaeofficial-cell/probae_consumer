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
    
    // Find the bowl
    const bowl = await Bowl.findById(id);
    
    if (!bowl) {
      return NextResponse.json({ error: "Bowl not found" }, { status: 404 });
    }

    // Flip the current isActive boolean state
    bowl.isActive = !bowl.isActive;
    await bowl.save();

    return NextResponse.json({ success: true, bowl }, { status: 200 });
  } catch (error) {
    console.error("Toggle bowl status error:", error);
    return NextResponse.json({ error: "Failed to toggle bowl status" }, { status: 500 });
  }
}
