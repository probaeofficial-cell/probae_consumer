import mongoose, { Schema, Document } from "mongoose";

export interface IPlanTier extends Document {
  name: string;
  category: string;
  duration: string;
  days: number;
  mealCombinations: string[];
  allowedBowls: mongoose.Types.ObjectId[];
}

const PlanTierSchema: Schema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  duration: { type: String, required: true },
  days: { type: Number, required: true },
  mealCombinations: [{ type: String, required: true }],
  allowedBowls: [{ type: Schema.Types.ObjectId, ref: "Bowl", required: true }],
});

export default mongoose.models.PlanTier || mongoose.model<IPlanTier>("PlanTier", PlanTierSchema);
