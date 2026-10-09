import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { mineDelegateSpeechHabits, extractSpeechAttributesLocally } from "@/lib/ai/speech-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conferenceId = searchParams.get("conferenceId");

    const where: any = {};
    if (conferenceId && conferenceId !== "all") {
      where.conferenceId = conferenceId;
    }

    const speeches = await prisma.speech.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        conference: {
          select: { id: true, name: true, committee: true, portfolio: true },
        },
      },
    });

    const parsedSpeeches = speeches.map((s) => {
      let themes: string[] = [];
      let args: string[] = [];
      let policies: string[] = [];
      let evidence: string[] = [];
      try {
        themes = s.themes ? JSON.parse(s.themes) : [];
        args = s.arguments ? JSON.parse(s.arguments) : [];
        policies = s.policyProposals ? JSON.parse(s.policyProposals) : [];
        evidence = s.evidenceUsed ? JSON.parse(s.evidenceUsed) : [];
      } catch {
        // fallback
      }

      return {
        ...s,
        themes,
        arguments: args,
        policyProposals: policies,
        evidenceUsed: evidence,
      };
    });

    // Mine habits across all speeches
    const speechHabits = mineDelegateSpeechHabits(
      speeches.map((s) => ({
        id: s.id,
        title: s.title,
        content: s.content,
        conferenceName: s.conference.name,
      }))
    );

    return NextResponse.json({
      speeches: parsedSpeeches,
      habits: speechHabits,
    });
  } catch (error: any) {
    console.error("GET /api/speeches error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conferenceId, title, speechType, content } = body;

    if (!conferenceId || !title || !content) {
      return NextResponse.json(
        { error: "conferenceId, title, and content are required." },
        { status: 400 }
      );
    }

    const attr = extractSpeechAttributesLocally(content, title);

    const speech = await prisma.speech.create({
      data: {
        conferenceId,
        title: title.trim(),
        speechType: speechType || "GSL",
        content: content.trim(),
        themes: JSON.stringify(attr.themes),
        arguments: JSON.stringify(attr.arguments),
        policyProposals: JSON.stringify(attr.policyProposals),
        evidenceUsed: JSON.stringify(attr.evidenceUsed),
        framingType: attr.framingType,
      },
      include: {
        conference: true,
      },
    });

    return NextResponse.json({ speech }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/speeches error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
