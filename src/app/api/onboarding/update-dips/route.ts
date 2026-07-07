import { NextResponse } from 'next/server';
import User from '@/models/User';
import Subscription from '@/models/Subscription';
import connectToDatabase from '@/lib/db';

// Helper to get client IP
function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return 'unknown-ip';
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const ipAddress = getClientIp(request);
    const body = await request.json();
    const { bowlId, selectedDip } = body;

    if (!bowlId || !selectedDip) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const user = await User.findOne({ ipAddress }).sort({ createdAt: -1 });
    
    if (!user) {
      return NextResponse.json({ success: false, error: "No profile found" }, { status: 404 });
    }

    // Find the active subscription for this user
    const subscription = await Subscription.findOne({ user: user._id, status: 'active' }).sort({ createdAt: -1 });

    if (!subscription) {
      return NextResponse.json({ success: false, error: "No active subscription found" }, { status: 404 });
    }

    // Update the specific bowl's selectedDip
    let updated = false;
    for (const bowl of subscription.calculatedBowls) {
      // originalBowlId in calculatedBowls corresponds to the _id of the Bowl model
      if (bowl.originalBowlId.toString() === bowlId) {
        bowl.selectedDip = selectedDip;
        updated = true;
      }
    }

    if (updated) {
      subscription.markModified('calculatedBowls');
      await subscription.save();
    }

    return NextResponse.json({ success: true, message: "Dip updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
