import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectToDatabase from "@/lib/db";
import AdminUser from "@/models/AdminUser";


export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Forbidden in production" }, { status: 403 });
  }

  try {
    await connectToDatabase();
    
    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({ email: "admin@probae.com" });
    if (existingAdmin) {
      return NextResponse.json({ message: "Admin user already exists. Email: admin@probae.com, Password: password123" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("password123", salt);

    const admin = await AdminUser.create({
      email: "admin@probae.com",
      passwordHash,
      role: "admin",
    });

    return NextResponse.json({ 
      success: true, 
      message: "Admin user created successfully",
      credentials: {
        email: "admin@probae.com",
        password: "password123"
      }
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed admin" }, { status: 500 });
  }
}
