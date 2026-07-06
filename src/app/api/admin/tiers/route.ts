import connectToDatabase from "@/lib/db";
import PlanTier from "@/models/PlanTier";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { name, duration, days, mealCombinations, allowedBowls } = body;

    if (!name || !duration || !days || !mealCombinations || !allowedBowls) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newTier = await PlanTier.create({
      name,
      duration,
      days: Number(days),
      mealCombinations,
      allowedBowls,
    });

    return NextResponse.json({ success: true, tier: newTier }, { status: 201 });
  } catch (error) {
    console.error("Create tier error:", error);
    return NextResponse.json({ error: "Failed to create tier" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    
    const tiers = await PlanTier.find().sort({ _id: -1 }).lean();

    return NextResponse.json({
      success: true,
      tiers,
    });
  } catch (error) {
    console.error("Fetch tiers error:", error);
    return NextResponse.json({ error: "Failed to fetch tiers" }, { status: 500 });
  }
}
