import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conference = await prisma.conference.findUnique({
      where: { id: params.id },
      include: {
        documents: {
          orderBy: { createdAt: "desc" },
          include: {
            sourceLinks: {
              include: { targetDoc: { select: { id: true, title: true, category: true } } },
            },
            targetLinks: {
              include: { sourceDoc: { select: { id: true, title: true, category: true } } },
            },
          },
        },
        researchAnalyses: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        practiceSessions: {
          orderBy: { createdAt: "desc" },
        },
        speeches: true,
        _count: {
          select: {
            documents: true,
            speeches: true,
            practiceSessions: true,
          },
        },
      },
    });

    if (!conference) {
      return NextResponse.json({ error: "Conference not found" }, { status: 404 });
    }

    return NextResponse.json({ conference });
  } catch (error: any) {
    console.error(`GET /api/conferences/${params.id} error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { name, date, committee, portfolio, agenda, notes, award, status, countryFlag } = body;

    const updated = await prisma.conference.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(date !== undefined && { date: date?.trim() || null }),
        ...(committee !== undefined && { committee: committee.trim() }),
        ...(portfolio !== undefined && { portfolio: portfolio.trim() }),
        ...(agenda !== undefined && { agenda: agenda.trim() }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
        ...(award !== undefined && { award: award?.trim() || null }),
        ...(status !== undefined && { status }),
        ...(countryFlag !== undefined && { countryFlag }),
      },
    });

    return NextResponse.json({ conference: updated });
  } catch (error: any) {
    console.error(`PATCH /api/conferences/${params.id} error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.conference.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, deletedId: params.id });
  } catch (error: any) {
    console.error(`DELETE /api/conferences/${params.id} error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
