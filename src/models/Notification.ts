import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  message: string;
  type: string;
  read: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  message: { type: String, required: true },
  type: { type: String, required: true },
  read: { type: Boolean, default: false },
  link: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
