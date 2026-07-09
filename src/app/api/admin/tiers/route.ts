import connectToDatabase from "@/lib/db";
import PlanTier from "@/models/PlanTier";
import { NextResponse } from "next/server";


export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { name, category, duration, days, mealType, selections, totalPrice, discountPrice } = body;

    if (!name || !category || !duration || !days || !mealType || !selections || totalPrice === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newTier = await PlanTier.create({
      name,
      category,
      duration,
      days: Number(days),
      mealType,
      selections,
      totalPrice: Number(totalPrice),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
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
