import connectToDatabase from "@/lib/db";
import PlanTier from "@/models/PlanTier";
import "@/models/Bowl"; // Register Bowl model for population
import "@/models/Image"; // Register Image model
import { NextResponse } from "next/server";


export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    // We populate 'selections.bowls' so the frontend preview drawer can display them
    const tier = await PlanTier.findById(id).populate("selections.bowls").lean();
    if (!tier) {
      return NextResponse.json({ error: "Plan Tier not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, tier }, { status: 200 });
  } catch (error) {
    console.error("Get tier error:", error);
    return NextResponse.json({ error: "Failed to get plan tier" }, { status: 500 });
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

    const updatedTier = await PlanTier.findByIdAndUpdate(id, body, { returnDocument: 'after' });
    
    if (!updatedTier) {
      return NextResponse.json({ error: "Plan Tier not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, tier: updatedTier }, { status: 200 });
  } catch (error) {
    console.error("Update tier error:", error);
    return NextResponse.json({ error: "Failed to update plan tier" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    
    const deletedTier = await PlanTier.findByIdAndUpdate(id, { isDeleted: true });
    
    if (!deletedTier) {
      return NextResponse.json({ error: "Plan Tier not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete tier error:", error);
    return NextResponse.json({ error: "Failed to delete plan tier" }, { status: 500 });
  }
}
