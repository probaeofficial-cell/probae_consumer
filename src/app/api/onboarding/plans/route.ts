import { NextResponse } from "next/server";
import PlanTier from "@/models/PlanTier";
// Import Bowl to ensure it's registered for population
import "@/models/Bowl";
import "@/models/Image";
import connectToDatabase from "@/lib/db";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { duration, frequency, mealSlots } = body;

    // Convert frequency "5 DAYS" to number 5
    const daysMatch = frequency?.match(/\d+/);
    const days = daysMatch ? parseInt(daysMatch[0]) : null;

    if (!duration || !days) {
      return NextResponse.json({ success: false, error: "Duration and frequency required" }, { status: 400 });
    }

    const query: any = {
      duration: new RegExp(`^${duration}$`, 'i'), 
      days 
    };

    if (mealSlots && Array.isArray(mealSlots)) {
      const codes = mealSlots.map(slot => {
        if (slot === 'B-FAST') return 'B';
        if (slot === 'LUNCH') return 'L';
        if (slot === 'DINNER') return 'D';
        return slot;
      });
      if (codes.length > 0) {
        query['selections'] = { $size: codes.length };
        query['selections.type'] = { $all: codes };
      }
    }

    // Find all PlanTiers matching duration (case-insensitive) and days
    const plans = await PlanTier.find(query).populate({
      path: "selections.bowls",
      populate: {
        path: "imageId",
        select: "url"
      }
    });

    return NextResponse.json({ success: true, plans });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch plans" }, { status: 500 });
  }
}
