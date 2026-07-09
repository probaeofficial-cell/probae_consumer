import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
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
    
    const admin = await AdminUser.findById(adminId).select("name email");
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      profile: {
        name: admin.name || "",
        email: admin.email,
        profileImageUrl: admin.profileImageUrl || ""
      }
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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
    const { name, profileImageUrl } = body;
    
    if (typeof name !== "string") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
    
    const updateData: any = { name };
    if (profileImageUrl !== undefined) {
      updateData.profileImageUrl = profileImageUrl;
    }
    
    const admin = await AdminUser.findByIdAndUpdate(
      adminId,
      updateData,
      { new: true }
    ).select("name email profileImageUrl");
    
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      profile: {
        name: admin.name,
        email: admin.email,
        profileImageUrl: admin.profileImageUrl || ""
      }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
