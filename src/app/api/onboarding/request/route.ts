import { NextResponse } from "next/server";
import PlanRequest from "@/models/PlanRequest";
import connectToDatabase from "@/lib/db";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    
    // Attempt to extract IP
    const userIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    const newRequest = new PlanRequest({
      ...body,
      userIp
    });

    await newRequest.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating plan request:", error);
    return NextResponse.json({ success: false, error: "Failed to submit request" }, { status: 500 });
  }
}
