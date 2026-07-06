import connectToDatabase from "@/lib/db";
import Bowl from "@/models/Bowl";
import "@/models/Image";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    
    // Parse micros comma separated string if it's sent as a string
    if (typeof body.micros === "string") {
      body.micros = body.micros.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    
    // Parse ingredients comma separated string
    if (typeof body.ingredients === "string") {
      body.ingredients = body.ingredients.split(",").map((s: string) => s.trim()).filter(Boolean);
    }

    if (!body.imageId || body.imageId === "") {
      delete body.imageId;
    }

    const bowl = await Bowl.create(body);
    return NextResponse.json({ success: true, bowl }, { status: 201 });
  } catch (error) {
    console.error("Create bowl error:", error);
    return NextResponse.json({ error: "Failed to create bowl" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "All";

    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }
    if (category && category !== "All") {
      query.category = category;
    }

    const mealTypesParam = searchParams.get("mealTypes");
    if (mealTypesParam) {
      const types = mealTypesParam.split(",");
      query.mealTypes = { $in: types };
    }

    const [bowls, totalCount] = await Promise.all([
      Bowl.find(query).skip(skip).limit(limit).populate("imageId").lean(),
      Bowl.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      bowls,
      totalCount,
      page,
      limit,
    });
  } catch (error) {
    console.error("Fetch bowls error:", error);
    return NextResponse.json({ error: "Failed to fetch bowls" }, { status: 500 });
  }
}
