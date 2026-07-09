import { NextResponse } from "next/server";
import Subscription from "@/models/Subscription";
import "@/models/PlanTier"; // Register model for populate
import "@/models/User"; // Register model for populate
import connectToDatabase from "@/lib/db";


export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const [subscriptions, totalCount] = await Promise.all([
      Subscription.find()
        .skip(skip)
        .limit(limit)
        .populate("user")
        .populate("plan")
        .lean(),
      Subscription.countDocuments(),
    ]);

    return NextResponse.json({
      success: true,
      subscriptions,
      totalCount,
      page,
      limit,
    });
  } catch (error) {
    console.error("Fetch subscriptions error:", error);
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}
