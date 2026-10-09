import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { findSuggestedConnections } from "@/lib/ai/connection-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conferenceId = searchParams.get("conferenceId");

    const where: any = {};
    if (conferenceId && conferenceId !== "all") {
      where.conferenceId = conferenceId;
    }

    // Fetch documents
    const documents = await prisma.document.findMany({
      where,
      select: {
        id: true,
        title: true,
        category: true,
        content: true,
      },
    });

    // Fetch existing connections to exclude already linked pairs
    const existing = await prisma.documentConnection.findMany({
      select: {
        sourceDocId: true,
        targetDocId: true,
      },
    });

    const existingPairs = new Set<string>();
    for (const c of existing) {
      existingPairs.add(`${c.sourceDocId}:${c.targetDocId}`);
      existingPairs.add(`${c.targetDocId}:${c.sourceDocId}`);
    }

    const suggestions = findSuggestedConnections(documents, existingPairs);

    return NextResponse.json({ suggestions: suggestions.slice(0, 10) });
  } catch (error: any) {
    console.error("GET /api/connections/suggest error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, sourceDocId, targetDocId, connectionType, similarityScore, explanation } = body;

    if (!sourceDocId || !targetDocId || !action) {
      return NextResponse.json(
        { error: "action ('accept' | 'reject'), sourceDocId, and targetDocId are required." },
        { status: 400 }
      );
    }

    if (action === "reject") {
      // Record rejected connection so it isn't repeatedly suggested
      await prisma.documentConnection.upsert({
        where: { id: `${sourceDocId}_${targetDocId}` },
        update: { status: "rejected" },
        create: {
          id: `${sourceDocId}_${targetDocId}`,
          sourceDocId,
          targetDocId,
          connectionType: connectionType || "THEMATIC",
          similarityScore: similarityScore || 70,
          explanation: explanation || "Rejected suggestion",
          status: "rejected",
        },
      });

      return NextResponse.json({ success: true, message: "Connection suggestion rejected." });
    }

    if (action === "accept") {
      const created = await prisma.documentConnection.create({
        data: {
          sourceDocId,
          targetDocId,
          connectionType: connectionType || "THEMATIC",
          similarityScore: similarityScore || 80,
          explanation: explanation || "AI-suggested connection accepted by delegate",
          status: "accepted",
        },
        include: {
          sourceDoc: true,
          targetDoc: true,
        },
      });

      return NextResponse.json({ success: true, connection: created }, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid action. Use 'accept' or 'reject'." }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/connections/suggest error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
