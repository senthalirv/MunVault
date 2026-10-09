import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }

    const conferences = await prisma.conference.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            documents: true,
            speeches: true,
            practiceSessions: true,
          },
        },
        documents: {
          select: {
            id: true,
            title: true,
            category: true,
            coverageScore: true,
            createdAt: true,
          },
          take: 5,
        },
      },
    });

    return NextResponse.json({ conferences });
  } catch (error: any) {
    console.error("GET /api/conferences error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch conferences" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, date, committee, portfolio, agenda, notes, award, status, countryFlag } = body;

    if (!name || !committee || !portfolio || !agenda) {
      return NextResponse.json(
        { error: "Name, committee, portfolio, and agenda are required." },
        { status: 400 }
      );
    }

    const conference = await prisma.conference.create({
      data: {
        name: name.trim(),
        date: date?.trim() || null,
        committee: committee.trim(),
        portfolio: portfolio.trim(),
        agenda: agenda.trim(),
        notes: notes?.trim() || null,
        award: award?.trim() || null,
        status: status || "active",
        countryFlag: countryFlag || "🌐",
      },
    });

    return NextResponse.json({ conference }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/conferences error:", error);
    return NextResponse.json({ error: error.message || "Failed to create conference" }, { status: 500 });
  }
}
