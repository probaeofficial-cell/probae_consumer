import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import bcrypt from "bcrypt";
import AdminUser from "@/models/AdminUser";
import connectToDatabase from "@/lib/db";

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

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    
    const adminId = await getAuthAdminId();
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { currentPassword, newPassword } = body;
    
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Invalid password data" }, { status: 400 });
    }
    
    const admin = await AdminUser.findById(adminId);
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
    }
    
    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
    
    admin.passwordHash = newPasswordHash;
    await admin.save();
    
    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
