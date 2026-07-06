import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  age: number;
  height: number;
  weight: number;
  activityLevel: string;
  goal: string;
  dailyCalorieTarget: number;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  activityLevel: { type: String, required: true },
  goal: { type: String, required: true },
  dailyCalorieTarget: { type: Number, required: true },
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
