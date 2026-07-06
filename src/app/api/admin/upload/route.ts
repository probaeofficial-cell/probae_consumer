import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3";
import connectToDatabase from "@/lib/db";
import ImageModel from "@/models/Image";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueFileName = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: uniqueFileName,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);
    
    // The public URL assuming a custom domain or public bucket routing is configured.
    // Replace with your actual R2 public URL if different.
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${uniqueFileName}`;

    await connectToDatabase();

    const imageDoc = await ImageModel.create({
      url: publicUrl,
      fileName: uniqueFileName,
    });

    return NextResponse.json({
      success: true,
      imageId: imageDoc._id,
      url: imageDoc.url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
