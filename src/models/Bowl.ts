import mongoose, { Schema, Document } from "mongoose";

export interface IBowl extends Document {
  name: string;
  imageId?: mongoose.Types.ObjectId;
  baseCalories: number;
  basePrice: number;
  baseWeight: number;
  category: string[];
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  micros: string[];
  mealTypes: string[];
  isActive: boolean;
}

const BowlSchema: Schema = new Schema({
  name: { type: String, required: true },
  imageId: { type: Schema.Types.ObjectId, ref: "Image" },
  baseCalories: { type: Number, required: true },
  basePrice: { type: Number, required: true },
  baseWeight: { type: Number, required: true },
  category: { type: [String], required: true },
  macros: {
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    fiber: { type: Number, required: true },
  },
  micros: [{ type: String, required: true }],
  mealTypes: { type: [String], required: true, default: ["B", "L", "D"] },
  isActive: { type: Boolean, default: true },
});

export default mongoose.models.Bowl || mongoose.model<IBowl>("Bowl", BowlSchema);
