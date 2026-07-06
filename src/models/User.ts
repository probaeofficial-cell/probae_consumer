import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  ipAddress?: string;
  name: string;
  phone?: string;
  address?: string;
  sex?: string;
  age: number;
  height: number;
  weight: number;
  activityLevel: string;
  goal: string;
  dietaryPreferences?: string[];
  chefInstructions?: string;
  planDuration?: string;
  planFrequency?: string;
  mealSlots?: string[];
  
  onboardingStep?: number;
  dailyCalorieTarget?: number;
  calorieProfile?: {
    total: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  
  selectedPlan?: {
    tier: string;
    price: number;
  };
}

const UserSchema: Schema = new Schema({
  ipAddress: { type: String, index: true },
  name: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  sex: { type: String },
  age: { type: Number, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  activityLevel: { type: String, required: true },
  goal: { type: String, required: true },
  
  dietaryPreferences: [{ type: String }],
  chefInstructions: { type: String },
  
  planDuration: { type: String },
  planFrequency: { type: String },
  mealSlots: [{ type: String }],
  
  onboardingStep: { type: Number, default: 1 },
  dailyCalorieTarget: { type: Number },
  calorieProfile: {
    total: { type: Number },
    protein: { type: Number },
    carbs: { type: Number },
    fat: { type: Number },
    fiber: { type: Number },
  },
  
  selectedPlan: {
    tier: { type: String },
    price: { type: Number },
  }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
