import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

export async function proxy(request: NextRequest) {
  const adminToken = request.cookies.get("admin_token")?.value;
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/admin");
  const isSetupRoute = request.nextUrl.pathname === "/api/admin/setup";
  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  // Bypass auth for the setup endpoint
  if (isSetupRoute) {
    return NextResponse.next();
  }

  if (!adminToken) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isLoginPage) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jose.jwtVerify(adminToken, secret);
    
    // If authenticated user tries to access login page, redirect to dashboard
    if (isLoginPage) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (!isLoginPage) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
