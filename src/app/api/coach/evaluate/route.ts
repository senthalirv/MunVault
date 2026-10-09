import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { evaluatePracticeResponse } from "@/lib/ai/coach-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conferenceId, question, userTranscript } = body;

    if (!question || !userTranscript) {
      return NextResponse.json(
        { error: "Both question and userTranscript are required." },
        { status: 400 }
      );
    }

    let conf = null;
    if (conferenceId) {
      conf = await prisma.conference.findUnique({
        where: { id: conferenceId },
      });
    }

    const evaluation = await evaluatePracticeResponse({
      question,
      userTranscript,
      portfolio: conf?.portfolio || "United Kingdom",
      committee: conf?.committee || "UNHRC",
      agenda: conf?.agenda || "Human Rights & Multilateral Accountability",
    });

    // Save session in database
    const session = await prisma.practiceSession.create({
      data: {
        conferenceId: conf?.id || null,
        question,
        topic: conf?.agenda || "Diplomatic Rebuttal",
        committee: conf?.committee || "UNHRC",
        portfolio: conf?.portfolio || "United Kingdom",
        userTranscript,
        contentScore: evaluation.contentScore,
        accuracyScore: evaluation.accuracyScore,
        relevanceScore: evaluation.relevanceScore,
        diplomacyScore: evaluation.diplomacyScore,
        structureScore: evaluation.structureScore,
        rebuttalScore: evaluation.rebuttalScore,
        overallScore: evaluation.overallScore,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        actionableSuggestion: evaluation.actionableSuggestion,
      },
    });

    // Update profile streak
    await prisma.delegateProfile.updateMany({
      where: { id: "default-profile" },
      data: {
        practiceStreak: { increment: 1 },
      },
    });

    return NextResponse.json({
      session,
      evaluation,
    });
  } catch (error: any) {
    console.error("POST /api/coach/evaluate error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
