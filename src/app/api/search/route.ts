import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    if (!query) {
      return NextResponse.json({
        query: "",
        totalHits: 0,
        conferences: [],
        documents: [],
      });
    }

    const q = query.toLowerCase();

    // Search Conferences
    const conferences = await prisma.conference.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { committee: { contains: q } },
          { portfolio: { contains: q } },
          { agenda: { contains: q } },
          { notes: { contains: q } },
          { award: { contains: q } },
        ],
      },
      include: {
        _count: {
          select: { documents: true, speeches: true },
        },
      },
      take: 10,
    });

    // Search Documents across all conferences
    const documents = await prisma.document.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { content: { contains: q } },
          { category: { contains: q } },
          { tags: { contains: q } },
        ],
      },
      include: {
        conference: {
          select: {
            id: true,
            name: true,
            committee: true,
            portfolio: true,
            countryFlag: true,
          },
        },
      },
      take: 25,
    });

    // Generate matched snippets for documents
    const documentsWithSnippets = documents.map((doc) => {
      let snippet = "";
      const lowerContent = doc.content.toLowerCase();
      const idx = lowerContent.indexOf(q);
      if (idx !== -1) {
        const start = Math.max(0, idx - 60);
        const end = Math.min(doc.content.length, idx + q.length + 80);
        snippet = (start > 0 ? "…" : "") + doc.content.slice(start, end).replace(/\s+/g, " ") + (end < doc.content.length ? "…" : "");
      } else {
        snippet = doc.content.slice(0, 140).replace(/\s+/g, " ") + "…";
      }

      return {
        ...doc,
        snippet,
      };
    });

    return NextResponse.json({
      query,
      totalHits: conferences.length + documentsWithSnippets.length,
      conferences,
      documents: documentsWithSnippets,
    });
  } catch (error: any) {
    console.error("GET /api/search error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
