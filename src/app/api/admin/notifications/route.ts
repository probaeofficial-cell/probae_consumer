import { NextResponse } from "next/server";
import Notification from "@/models/Notification";
import connectToDatabase from "@/lib/db";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    // Fetch top 50 recent notifications
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({ read: false });

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 });
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error("Update notification error:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
