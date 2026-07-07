import { NextResponse } from 'next/server';
import User from '@/models/User';
import connectToDatabase from '@/lib/db';

// Helper to get client IP
function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return 'unknown-ip';
}

function calculateCalorieProfile(data: any) {
  const weight = Number(data.weight);
  const height = Number(data.height);
  const age = Number(data.age);
  const isMale = data.sex === 'Male';

  // 1. Calculate BMR (Mifflin-St Jeor)
  let bmr;
  if (isMale) {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }

  // 2. Activity Multiplier
  let activityMultiplier = 1.2; // Default to sedentary
  switch (data.activityLevel) {
    case 'Sedentary': activityMultiplier = 1.2; break;
    case 'Lightly Active': activityMultiplier = 1.375; break;
    case 'Active': activityMultiplier = 1.55; break;
    case 'Very Active': activityMultiplier = 1.725; break;
    case 'Athlete': activityMultiplier = 1.9; break;
  }
  
  // 3. Get TDEE
  let tdee = bmr * activityMultiplier;

  // 4. Goal Adjustment
  switch(data.goal) {
      case 'Weight Loss':
          tdee = tdee - 500;
          break;
      case 'Muscle Gain':
          tdee = tdee + 300;
          break;
      default:
          // Maintain Weight
          break;
  }

  // Ensure minimums for safety
  if (isMale && tdee < 1500) tdee = 1500;
  if (!isMale && tdee < 1200) tdee = 1200;

  tdee = Math.round(tdee);

  // Macros calculation
  // Protein: ~2g per kg for active/muscle gain, 1.6g otherwise
  let proteinFactor = 1.8;
  if (data.goal === 'Muscle Gain' || data.activityLevel === 'Very Active') proteinFactor = 2.2;
  let protein = Math.round(weight * proteinFactor);

  // Fat: ~0.8g per kg
  let fat = Math.round(weight * 0.8);

  // Carbs: Remainder of calories
  const proteinCals = protein * 4;
  const fatCals = fat * 9;
  let remainingCals = tdee - (proteinCals + fatCals);
  let carbs = Math.max(0, Math.round(remainingCals / 4));

  // Fiber: ~14g per 1000 kcal
  let fiber = Math.round((tdee / 1000) * 14);

  return {
    total: tdee,
    protein,
    carbs,
    fat,
    fiber
  };
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const ipAddress = getClientIp(request);

    const user = await User.findOne({ ipAddress }).sort({ createdAt: -1 });
    if (!user) {
      return NextResponse.json({ success: false, message: "No profile found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const ipAddress = getClientIp(request);
    const body = await request.json();

    const calorieProfile = calculateCalorieProfile(body);
    
    // Find if user with this IP already exists, update them, else create new
    let user = await User.findOne({ ipAddress }).sort({ createdAt: -1 });

    const userData = {
      ipAddress,
      ...body,
      calorieProfile,
      dailyCalorieTarget: calorieProfile.total
    };

    if (user) {
      user = await User.findByIdAndUpdate(user._id, userData, { new: true });
    } else {
      user = await User.create(userData);
    }

    return NextResponse.json({ success: true, data: user, calorieProfile });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
