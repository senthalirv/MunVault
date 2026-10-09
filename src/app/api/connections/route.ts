import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conferenceId = searchParams.get("conferenceId");
    const status = searchParams.get("status") || "accepted";

    const where: any = {
      status: status === "all" ? undefined : status,
    };

    if (conferenceId && conferenceId !== "all") {
      where.sourceDoc = {
        conferenceId,
      };
    }

    const connections = await prisma.documentConnection.findMany({
      where,
      include: {
        sourceDoc: {
          include: {
            conference: {
              select: { id: true, name: true, committee: true, portfolio: true },
            },
          },
        },
        targetDoc: {
          include: {
            conference: {
              select: { id: true, name: true, committee: true, portfolio: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ connections });
  } catch (error: any) {
    console.error("GET /api/connections error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceDocId, targetDocId, connectionType, explanation, similarityScore } = body;

    if (!sourceDocId || !targetDocId) {
      return NextResponse.json(
        { error: "Both sourceDocId and targetDocId are required." },
        { status: 400 }
      );
    }

    if (sourceDocId === targetDocId) {
      return NextResponse.json(
        { error: "Cannot connect a document to itself." },
        { status: 400 }
      );
    }

    // Check if connection already exists
    const existing = await prisma.documentConnection.findFirst({
      where: {
        OR: [
          { sourceDocId, targetDocId },
          { sourceDocId: targetDocId, targetDocId: sourceDocId },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A connection already exists between these two documents.", connection: existing },
        { status: 409 }
      );
    }

    const connection = await prisma.documentConnection.create({
      data: {
        sourceDocId,
        targetDocId,
        connectionType: connectionType || "THEMATIC",
        explanation: explanation || "Manual connection established by delegate",
        similarityScore: similarityScore || 80.0,
        status: "accepted",
      },
      include: {
        sourceDoc: true,
        targetDoc: true,
      },
    });

    return NextResponse.json({ connection }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/connections error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
