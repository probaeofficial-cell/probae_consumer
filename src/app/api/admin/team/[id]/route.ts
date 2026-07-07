import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
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

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    await connectToDatabase();
    
    const adminId = await getAuthAdminId();
    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const targetId = params.id;
    
    // Prevent an admin from deleting themselves
    if (adminId === targetId) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 403 });
    }
    
    const deletedAdmin = await AdminUser.findByIdAndDelete(targetId);
    
    if (!deletedAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Delete admin error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
