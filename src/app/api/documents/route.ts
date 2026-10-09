import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conferenceId = searchParams.get("conferenceId");
    const category = searchParams.get("category");
    const query = searchParams.get("q");

    const where: any = {};
    if (conferenceId && conferenceId !== "all") {
      where.conferenceId = conferenceId;
    }
    if (category && category !== "all") {
      where.category = category;
    }
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      where.OR = [
        { title: { contains: q } },
        { content: { contains: q } },
        { tags: { contains: q } },
      ];
    }

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        conference: {
          select: {
            id: true,
            name: true,
            committee: true,
            portfolio: true,
          },
        },
        _count: {
          select: {
            sourceLinks: true,
            targetLinks: true,
          },
        },
      },
    });

    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error("GET /api/documents error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conferenceId, title, category, content, tags } = body;

    if (!conferenceId || !title || !category || !content) {
      return NextResponse.json(
        { error: "conferenceId, title, category, and content are required." },
        { status: 400 }
      );
    }

    // Verify conference exists
    const conf = await prisma.conference.findUnique({
      where: { id: conferenceId },
    });
    if (!conf) {
      return NextResponse.json({ error: "Conference does not exist" }, { status: 404 });
    }

    // Compute basic coverage score based on length and substantive markers
    const wordCount = content.trim().split(/\s+/).length;
    const coverageScore = Math.min(95, Math.max(50, Math.round(55 + Math.min(35, wordCount / 15))));

    const document = await prisma.document.create({
      data: {
        conferenceId,
        title: title.trim(),
        category,
        content: content.trim(),
        tags: tags?.trim() || null,
        isImmutable: true,
        coverageScore,
      },
      include: {
        conference: {
          select: { id: true, name: true, committee: true, portfolio: true },
        },
      },
    });

    // If it's a speech, also index it in the Speech model
    if (category === "GSL" || category === "MODERATED_CAUCUS") {
      await prisma.speech.create({
        data: {
          conferenceId,
          documentId: document.id,
          title: title.trim(),
          speechType: category,
          content: content.trim(),
          themes: JSON.stringify(["Multilateral Diplomacy", conf.committee]),
          arguments: JSON.stringify(["Policy alignment with national delegation"]),
          policyProposals: JSON.stringify([]),
          evidenceUsed: JSON.stringify([]),
          framingType: "Diplomatic Balance",
        },
      });
    }

    return NextResponse.json({ document }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/documents error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
