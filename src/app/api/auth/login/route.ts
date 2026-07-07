import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import * as jose from "jose";
import AdminUser from "@/models/AdminUser";
import connectToDatabase from "@/lib/db";


export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }
    
    const admin = await AdminUser.findOne({ email });
    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    
    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const alg = "HS256";
    
    const jwt = await new jose.SignJWT({ id: admin._id.toString(), role: admin.role })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret);
      
    const response = NextResponse.json({ 
      success: true,
      profileImageUrl: admin.profileImageUrl || ""
    });
    
    response.cookies.set("admin_token", jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });
    
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
