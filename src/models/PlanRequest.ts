import mongoose, { Schema, Document } from "mongoose";

export interface IPlanRequest extends Document {
  phone: string;
  userIp?: string;
  name: string;
  filters: {
    duration: string;
    frequency: string;
    mealSlots: string[];
    calorieTarget?: number;
  };
  status: "Pending" | "Resolved";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlanRequestSchema: Schema = new Schema(
  {
    phone: { type: String, required: true },
    userIp: { type: String },
    name: { type: String, required: true },
    filters: {
      duration: { type: String, required: true },
      frequency: { type: String, required: true },
      mealSlots: [{ type: String }],
      calorieTarget: { type: Number },
    },
    status: { type: String, enum: ["Pending", "Resolved"], default: "Pending" },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.PlanRequest || mongoose.model<IPlanRequest>("PlanRequest", PlanRequestSchema);
