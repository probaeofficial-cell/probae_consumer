import mongoose, { Schema, Document } from "mongoose";

export interface ICalculatedBowl {
  originalBowlId: mongoose.Types.ObjectId;
  name: string;
  assignedCalories: number;
  calculatedWeight: number;
  calculatedPrice: number;
  mealType?: string;
  ratio?: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  micros: string[];
}

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  plan: mongoose.Types.ObjectId;
  selectedMealCombo: string;
  calculatedBowls: ICalculatedBowl[];
  finalTotalPrice: number;
  status: string;
  createdAt: Date;
}

const CalculatedBowlSchema = new Schema({
  originalBowlId: { type: Schema.Types.ObjectId, ref: "Bowl", required: true },
  name: { type: String, required: true },
  assignedCalories: { type: Number, required: true },
  calculatedWeight: { type: Number, required: true },
  calculatedPrice: { type: Number, required: true },
  mealType: { type: String },
  ratio: { type: Number },
  macros: {
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    fiber: { type: Number, required: true },
  },
  micros: [{ type: String, required: true }],
});

const SubscriptionSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  plan: { type: Schema.Types.ObjectId, ref: "PlanTier", required: true },
  selectedMealCombo: { type: String, required: true },
  calculatedBowls: [CalculatedBowlSchema],
  finalTotalPrice: { type: Number, required: true },
  status: { type: String, default: "active" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Subscription || mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
