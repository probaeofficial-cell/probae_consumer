import connectToDatabase from "@/lib/db";
import Bowl from "@/models/Bowl";
import { NextResponse } from "next/server";


export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    const bowl = await Bowl.findById(id).populate("imageId").lean();
    if (!bowl) {
      return NextResponse.json({ error: "Bowl not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, bowl }, { status: 200 });
  } catch (error) {
    console.error("Get bowl error:", error);
    return NextResponse.json({ error: "Failed to get bowl" }, { status: 500 });
  }
}

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
    
    // Parse ingredients comma separated string
    if (typeof body.ingredients === "string") {
      body.ingredients = body.ingredients.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    
    // Parse dips comma separated string
    if (typeof body.dips === "string") {
      body.dips = body.dips.split(",").map((s: string) => s.trim()).filter(Boolean);
    }

    if (!body.imageId || body.imageId === "") {
      delete body.imageId;
    }

    if (body.rawMaterialCost !== undefined && body.fixedCost !== undefined) {
      body.basePrice = Number(body.rawMaterialCost) + Number(body.fixedCost);
    }

    if (body.baseCalories !== undefined) {
      body.baseCalories = Math.round(Number(body.baseCalories));
    }

    if (body.macros) {
      if (body.macros.protein !== undefined) body.macros.protein = Math.round(Number(body.macros.protein));
      if (body.macros.carbs !== undefined) body.macros.carbs = Math.round(Number(body.macros.carbs));
      if (body.macros.fat !== undefined) body.macros.fat = Math.round(Number(body.macros.fat));
      if (body.macros.fiber !== undefined) body.macros.fiber = Math.round(Number(body.macros.fiber));
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
