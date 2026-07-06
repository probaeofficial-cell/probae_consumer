import mongoose, { Schema, Document } from "mongoose";

export interface IPlanTier extends Document {
  name: string;
  category: string;
  duration: string;
  days: number;
  mealType: string;
  selections: {
    type: string; // e.g. "B", "L", "D"
    bowls: mongoose.Types.ObjectId[];
  }[];
  totalPrice: number;
  discountPrice?: number;
}

const PlanTierSchema: Schema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  duration: { type: String, required: true },
  days: { type: Number, required: true },
  mealType: { type: String, required: true },
  selections: [{
    type: { type: String, required: true }, // "B", "L", "D"
    bowls: [{ type: Schema.Types.ObjectId, ref: "Bowl" }]
  }],
  totalPrice: { type: Number, required: true, default: 0 },
  discountPrice: { type: Number, default: 0 },
});

export default mongoose.models.PlanTier || mongoose.model<IPlanTier>("PlanTier", PlanTierSchema);
