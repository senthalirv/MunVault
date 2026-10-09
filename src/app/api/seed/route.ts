import { NextResponse } from "next/server";
import { runSeed } from "../../../../prisma/seed";

export async function POST() {
  try {
    await runSeed();
    return NextResponse.json({ success: true, message: "Database reseeded successfully!" });
  } catch (error: any) {
    console.error("POST /api/seed error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
