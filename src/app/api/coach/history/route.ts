import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conferenceId = searchParams.get("conferenceId");

    const where: any = {};
    if (conferenceId && conferenceId !== "all") {
      where.conferenceId = conferenceId;
    }

    const sessions = await prisma.practiceSession.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        conference: {
          select: { id: true, name: true, committee: true, portfolio: true },
        },
      },
    });

    // Compute progress stats
    const totalSessions = sessions.length;
    const avgScore =
      totalSessions > 0
        ? Math.round((sessions.reduce((acc, s) => acc + s.overallScore, 0) / totalSessions) * 10) / 10
        : 0;

    return NextResponse.json({
      sessions,
      stats: {
        totalSessions,
        avgScore,
      },
    });
  } catch (error: any) {
    console.error("GET /api/coach/history error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
