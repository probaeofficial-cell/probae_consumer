import { NextResponse } from "next/server";
import PlanRequest from "@/models/PlanRequest";
import Notification from "@/models/Notification";
import User from "@/models/User";
import connectToDatabase from "@/lib/db";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    
    const userIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    const newRequest = new PlanRequest({
      ...body,
      userIp
    });

    await newRequest.save();

    // Create Notification for admin
    await Notification.create({
      message: `New enquiry from ${body.name || 'User'}`,
      type: "enquiry",
      link: "/admin/enquiries"
    });

    // Update user's onboarding step to 6 so it persists on reload
    let ipToSearch = userIp;
    if (ipToSearch.includes(',')) {
      ipToSearch = ipToSearch.split(',')[0].trim();
    }
    
    await User.findOneAndUpdate(
      { ipAddress: ipToSearch },
      { $set: { onboardingStep: 6, onboardingCompleted: true } },
      { sort: { createdAt: -1 } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating plan request:", error);
    return NextResponse.json({ success: false, error: "Failed to submit request" }, { status: 500 });
  }
}
