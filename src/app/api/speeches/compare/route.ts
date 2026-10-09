import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { compareSpeeches } from "@/lib/ai/speech-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { speechAId, speechBId } = body;

    if (!speechAId || !speechBId) {
      return NextResponse.json(
        { error: "Both speechAId and speechBId are required." },
        { status: 400 }
      );
    }

    if (speechAId === speechBId) {
      return NextResponse.json(
        { error: "Cannot compare a speech to itself." },
        { status: 400 }
      );
    }

    const [speechA, speechB] = await Promise.all([
      prisma.speech.findUnique({
        where: { id: speechAId },
        include: { conference: true },
      }),
      prisma.speech.findUnique({
        where: { id: speechBId },
        include: { conference: true },
      }),
    ]);

    if (!speechA || !speechB) {
      return NextResponse.json({ error: "One or both speeches not found." }, { status: 404 });
    }

    const comparison = compareSpeeches(
      speechA.content,
      speechB.content,
      speechA.title,
      speechB.title
    );

    // Save comparison record for historical reference
    const saved = await prisma.speechComparison.upsert({
      where: { id: `${speechAId}_${speechBId}` },
      update: {
        overallSimilarity: comparison.overallSimilarity,
        wordingSimilarity: comparison.wordingSimilarity,
        framingSimilarity: comparison.framingSimilarity,
        policySimilarity: comparison.policySimilarity,
        evidenceSimilarity: comparison.evidenceSimilarity,
        explanation: comparison.explanation,
      },
      create: {
        id: `${speechAId}_${speechBId}`,
        speechAId,
        speechBId,
        overallSimilarity: comparison.overallSimilarity,
        wordingSimilarity: comparison.wordingSimilarity,
        framingSimilarity: comparison.framingSimilarity,
        policySimilarity: comparison.policySimilarity,
        evidenceSimilarity: comparison.evidenceSimilarity,
        explanation: comparison.explanation,
      },
    });

    return NextResponse.json({
      comparison: {
        ...saved,
        speechA: {
          id: speechA.id,
          title: speechA.title,
          speechType: speechA.speechType,
          conferenceName: speechA.conference.name,
        },
        speechB: {
          id: speechB.id,
          title: speechB.title,
          speechType: speechB.speechType,
          conferenceName: speechB.conference.name,
        },
      },
    });
  } catch (error: any) {
    console.error("POST /api/speeches/compare error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
