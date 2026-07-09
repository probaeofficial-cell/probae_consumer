import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import bcrypt from "bcrypt";
import AdminUser from "@/models/AdminUser";
import connectToDatabase from "@/lib/db";


export const dynamic = "force-dynamic";

// Helper to get authenticated admin ID
async function getAuthAdminId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  
  if (!token) return null;
  
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload.id as string;
  } catch (error) {
    return null;
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    
    const adminId = await getAuthAdminId();
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const admins = await AdminUser.find().select("-passwordHash").sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, admins });
  } catch (error) {
    console.error("Fetch admins error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const adminId = await getAuthAdminId();
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, email, password } = body;
    
    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: "Invalid data. Password must be at least 6 characters." }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await AdminUser.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: "An admin with this email already exists" }, { status: 400 });
    }
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const newAdmin = await AdminUser.create({
      name: name || "",
      email: email.toLowerCase(),
      passwordHash,
      role: "admin",
    });
    
    return NextResponse.json({ 
      success: true, 
      admin: {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        profileImageUrl: newAdmin.profileImageUrl
      }
    });
  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
