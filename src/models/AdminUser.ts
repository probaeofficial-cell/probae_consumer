import mongoose, { Schema, Document } from "mongoose";

export interface IAdminUser extends Document {
  name?: string;
  email: string;
  passwordHash: string;
  role: string;
  profileImageUrl?: string;
}

const AdminUserSchema: Schema = new Schema({
  name: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: "admin" },
  profileImageUrl: { type: String, default: "" },
});

export default mongoose.models.AdminUser || mongoose.model<IAdminUser>("AdminUser", AdminUserSchema);
