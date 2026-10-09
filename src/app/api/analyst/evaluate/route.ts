import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { analyzeConferenceResearch } from "@/lib/ai/analyst-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conferenceId } = body;

    if (!conferenceId) {
      return NextResponse.json({ error: "conferenceId is required." }, { status: 400 });
    }

    const conference = await prisma.conference.findUnique({
      where: { id: conferenceId },
      include: {
        documents: true,
      },
    });

    if (!conference) {
      return NextResponse.json({ error: "Conference not found." }, { status: 404 });
    }

    if (conference.documents.length === 0) {
      return NextResponse.json(
        { error: "No documents found for this conference. Please upload research or speeches first." },
        { status: 400 }
      );
    }

    const analysisOutput = await analyzeConferenceResearch({
      conferenceName: conference.name,
      committee: conference.committee,
      portfolio: conference.portfolio,
      agenda: conference.agenda,
      documents: conference.documents.map((d) => ({
        title: d.title,
        category: d.category,
        content: d.content,
      })),
    });

    // Save to database
    const saved = await prisma.researchAnalysis.create({
      data: {
        conferenceId: conference.id,
        overallScore: analysisOutput.overallScore,
        countryPositionScore: analysisOutput.countryPositionScore,
        historicalScore: analysisOutput.historicalScore,
        unPrecedentsScore: analysisOutput.unPrecedentsScore,
        resolutionsScore: analysisOutput.resolutionsScore,
        oppositionScore: analysisOutput.oppositionScore,
        implementationScore: analysisOutput.implementationScore,
        sourcesScore: analysisOutput.sourcesScore,
        strongAreas: JSON.stringify(analysisOutput.strongAreas),
        missingAreas: JSON.stringify(analysisOutput.missingAreas),
        feedback: analysisOutput.feedback,
      },
    });

    return NextResponse.json({
      analysis: {
        ...saved,
        strongAreas: analysisOutput.strongAreas,
        missingAreas: analysisOutput.missingAreas,
      },
    });
  } catch (error: any) {
    console.error("POST /api/analyst/evaluate error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
