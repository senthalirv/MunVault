import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { conferenceId: string } }
) {
  try {
    const analysis = await prisma.researchAnalysis.findFirst({
      where: { conferenceId: params.conferenceId },
      orderBy: { createdAt: "desc" },
    });

    if (!analysis) {
      return NextResponse.json({ analysis: null });
    }

    let strongAreas: string[] = [];
    let missingAreas: string[] = [];
    try {
      strongAreas = JSON.parse(analysis.strongAreas);
      missingAreas = JSON.parse(analysis.missingAreas);
    } catch {
      strongAreas = [analysis.strongAreas];
      missingAreas = [analysis.missingAreas];
    }

    return NextResponse.json({
      analysis: {
        ...analysis,
        strongAreas,
        missingAreas,
      },
    });
  } catch (error: any) {
    console.error(`GET /api/analyst/${params.conferenceId} error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
