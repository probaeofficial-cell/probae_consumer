import { NextResponse } from "next/server";
import PlanRequest from "@/models/PlanRequest";
import connectToDatabase from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch all requests sorted by newest first
    const enquiries = await PlanRequest.find().sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, enquiries });
  } catch (error: any) {
    console.error("Error fetching enquiries:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch enquiries" }, { status: 500 });
  }
}
