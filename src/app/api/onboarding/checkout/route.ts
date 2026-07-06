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

    let user = await User.findOne({ ipAddress }).sort({ createdAt: -1 });
    
    if (!user) {
      return NextResponse.json({ success: false, message: "No profile found to checkout" }, { status: 404 });
    }

    user = await User.findByIdAndUpdate(
      user._id, 
      { selectedPlan: body.selectedPlan, status: 'PLAN_SELECTED', onboardingStep: 6 },
      { new: true }
    );

    // Ensure we create the Subscription
    if (body.calculatedBowls && body.finalTotalPrice !== undefined) {
      await Subscription.create({
        user: user._id,
        plan: body.selectedPlan,
        selectedMealCombo: body.selectedMealCombo || "",
        calculatedBowls: body.calculatedBowls,
        finalTotalPrice: body.finalTotalPrice,
        status: "active"
      });
    }

    return NextResponse.json({ success: true, message: "Checkout successful. We will connect with you.", data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
