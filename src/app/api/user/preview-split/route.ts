import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import PlanTier from "@/models/PlanTier";
import Bowl from "@/models/Bowl";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    // planId is PlanTier ID
    // split is e.g. { breakfast: 0.3, lunch: 0.4, dinner: 0.3 }
    const { planId, dailyCalorieTarget, split } = body;
    
    if (!planId || !dailyCalorieTarget || !split) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const plan = await PlanTier.findById(planId).populate("allowedBowls").lean();
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // For preview, we assume one bowl is mapped per meal in the split for demonstration.
    // The specific matching logic of which bowl goes to which meal depends on category,
    // but here we scale ALL allowed bowls proportionally as requested.
    const scaledBowls = plan.allowedBowls.map((bowl: any) => {
      // Linear Scaling Factor based on one of the meals (or a generic calculation).
      // If we just want to scale a bowl to the full daily target for preview:
      const targetCalories = dailyCalorieTarget; 
      const factor = targetCalories / bowl.baseCalories;

      return {
        originalBowlId: bowl._id,
        name: bowl.name,
        assignedCalories: Math.round(targetCalories),
        calculatedWeight: Math.round(bowl.baseWeight * factor),
        calculatedPrice: bowl.rawMaterialCost > 0
          ? Number(((bowl.rawMaterialCost * factor) + (bowl.fixedCost || 0)).toFixed(2))
          : Number((bowl.basePrice * factor).toFixed(2)),
        macros: {
          protein: Math.round(bowl.macros.protein * factor),
          carbs: Math.round(bowl.macros.carbs * factor),
          fat: Math.round(bowl.macros.fat * factor),
          fiber: Math.round(bowl.macros.fiber * factor),
        },
        micros: bowl.micros, // Kept intact as text arrays
      };
    });

    return NextResponse.json({ success: true, scaledBowls });
  } catch (error) {
    console.error("Preview split error:", error);
    return NextResponse.json({ error: "Failed to preview split" }, { status: 500 });
  }
}
