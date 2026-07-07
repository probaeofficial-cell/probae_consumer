import { NextResponse } from "next/server";
import PlanRequest from "@/models/PlanRequest";
import connectToDatabase from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { status, notes } = body;
    const { id } = await params;
    
    if (!status && notes === undefined) {
      return NextResponse.json({ success: false, error: "Status or notes required" }, { status: 400 });
    }
    
    const updated = await PlanRequest.findByIdAndUpdate(
      id,
      { $set: { ...(status && { status }), ...(notes !== undefined && { notes }) } },
      { returnDocument: 'after' }
    );
    
    if (!updated) {
      return NextResponse.json({ success: false, error: "Enquiry not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, enquiry: updated });
  } catch (error: any) {
    console.error("Error updating enquiry:", error);
    return NextResponse.json({ success: false, error: "Failed to update enquiry" }, { status: 500 });
  }
}
