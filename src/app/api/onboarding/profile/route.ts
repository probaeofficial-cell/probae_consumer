import { NextResponse } from 'next/server';
import User from '@/models/User';
import connectToDatabase from '@/lib/db';


export const dynamic = "force-dynamic";

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
  let bmr =
    (10 * weight) +
    (6.25 * height) -
    (5 * age) +
    (isMale ? 5 : -161);

  // 2. Activity Multiplier
  let activityMultiplier = 1.2;

  switch (data.activityLevel) {
    case 'Sedentary':
      activityMultiplier = 1.2;
      break;
    case 'Lightly Active':
      activityMultiplier = 1.375;
      break;
    case 'Active':
      activityMultiplier = 1.55;
      break;
    case 'Very Active':
      activityMultiplier = 1.725;
      break;
    case 'Athlete':
      activityMultiplier = 1.9;
      break;
  }

  // 3. Calculate TDEE
  let tdee = bmr * activityMultiplier;

  // 4. Adjust calories based on goal
  switch (data.goal) {
    case 'Weight Loss':
      tdee -= 500;
      break;

    case 'Muscle Gain':
      tdee += 300;
      break;

    // Maintain Weight -> no change
  }

  // 5. Minimum calorie intake
  if (isMale && tdee < 1500) tdee = 1500;
  if (!isMale && tdee < 1200) tdee = 1200;

  tdee = Math.round(tdee);

  // -------------------------
  // Macronutrients
  // -------------------------

  // Protein (g/kg)
  let proteinFactor = 1.6;

  if (data.activityLevel === 'Sedentary' || data.activityLevel === 'Lightly Active') {
    if (data.goal === 'Maintain Weight' || data.goal === 'Weight Loss') {
      proteinFactor = data.activityLevel === 'Sedentary' ? 0.8 : 1.0;
    } else {
      // Muscle Gain not allowed in UI, but fallback to 1.6 if bypassed
      proteinFactor = 1.6; 
    }
  } else if (data.activityLevel === 'Active') {
    proteinFactor = 1.5;
  } else if (data.activityLevel === 'Very Active' || data.activityLevel === 'Athlete') {
    proteinFactor = 2.0;
  }

  const protein = Math.round(weight * proteinFactor);

  // Fat = 25% of total calories
  const fat = Math.round((tdee * 0.25) / 9);

  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;

  const carbs = Math.max(
    0,
    Math.round((tdee - proteinCalories - fatCalories) / 4)
  );

  // Fiber = 14 g per 1000 kcal
  const fiber = Math.round((tdee / 1000) * 14);

  return {
    total: tdee,
    protein,
    carbs,
    fat,
    fiber,
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
