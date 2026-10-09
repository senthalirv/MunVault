import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateCoachQuestions } from "@/lib/ai/coach-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conferenceId } = body;

    let conf = null;
    if (conferenceId && conferenceId !== "all") {
      conf = await prisma.conference.findUnique({
        where: { id: conferenceId },
        include: { documents: { take: 3 } },
      });
    }

    if (!conf) {
      // Pick first conference or default
      conf = await prisma.conference.findFirst({
        include: { documents: { take: 3 } },
      });
    }

    const context = {
      conferenceName: conf?.name || "UN Model Session",
      committee: conf?.committee || "UNHRC",
      portfolio: conf?.portfolio || "United Kingdom",
      agenda: conf?.agenda || "Protection of Minorities & Freedom of Religion",
      researchSnippets: conf?.documents.map((d) => d.content.slice(0, 500)),
    };

    const questions = await generateCoachQuestions(context);

    return NextResponse.json({
      conference: {
        id: conf?.id,
        name: conf?.name,
        committee: conf?.committee,
        portfolio: conf?.portfolio,
        agenda: conf?.agenda,
      },
      questions,
    });
  } catch (error: any) {
    console.error("POST /api/coach/questions error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
