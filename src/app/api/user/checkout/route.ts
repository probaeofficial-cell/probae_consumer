import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Subscription from "@/models/Subscription";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { user, planId, selectedMealCombo, calculatedBowls, finalTotalPrice } = body;
    
    if (!user || !planId || !selectedMealCombo || !calculatedBowls || !finalTotalPrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upsert or create user based on provided details
    let userDoc;
    if (user._id) {
      userDoc = await User.findById(user._id);
    }
    if (!userDoc) {
      userDoc = await User.create(user);
    }

    const subscription = await Subscription.create({
      user: userDoc._id,
      plan: planId,
      selectedMealCombo,
      calculatedBowls,
      finalTotalPrice,
      status: "active",
    });

    return NextResponse.json({ success: true, subscription }, { status: 201 });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to process checkout" }, { status: 500 });
  }
}
