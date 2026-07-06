import mongoose, { Schema, Document } from "mongoose";

export interface IImage extends Document {
  url: string;
  fileName: string;
  uploadedAt: Date;
}

const ImageSchema: Schema = new Schema({
  url: { type: String, required: true },
  fileName: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Image || mongoose.model<IImage>("Image", ImageSchema);
