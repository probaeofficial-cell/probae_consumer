import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectToDatabase from "@/lib/db";
import AdminUser from "@/models/AdminUser";

// Define it as a POST request so it's a bit more intentional when called from Postman,
// but GET works too. We'll use POST for better practice.
export async function POST() {
  try {
    // 1. Get credentials from environment variables
    const email = process.env.ADMIN_SETUP_EMAIL;
    const password = process.env.ADMIN_SETUP_PASSWORD;

    // 2. Ensure they are configured in the environment
    if (!email || !password) {
      return NextResponse.json(
        { error: "Admin credentials are not configured in the environment variables." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // 3. Check if this specific admin already exists
    const existingAdmin = await AdminUser.findOne({ email });
    if (existingAdmin) {
      return NextResponse.json(
        { message: `Admin user (${email}) already exists in the database.` },
        { status: 200 }
      );
    }

    // 4. Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 5. Create the admin user
    await AdminUser.create({
      email,
      passwordHash,
      role: "admin",
    });

    return NextResponse.json({ 
      success: true, 
      message: "Admin user successfully created from environment variables."
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Failed to setup admin" }, { status: 500 });
  }
}
