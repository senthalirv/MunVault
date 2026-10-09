import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const file = searchParams.get("file");

    if (!file) {
      return NextResponse.json({ error: "File name is required." }, { status: 400 });
    }

    const safeFile = path.basename(file);
    const filePath = path.resolve(process.cwd(), "data", "uploads", safeFile);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found on server." }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${safeFile}"`,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (error: any) {
    console.error("GET /api/documents/download error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
