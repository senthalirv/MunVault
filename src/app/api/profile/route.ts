import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [
      conferenceCount,
      documentCount,
      speechCount,
      awardCount,
      profile,
      awardsList,
      recentDocs,
      recentConferences,
      recentSessions,
    ] = await Promise.all([
      prisma.conference.count(),
      prisma.document.count(),
      prisma.speech.count(),
      prisma.conference.count({
        where: {
          award: { not: null },
        },
      }),
      prisma.delegateProfile.findFirst(),
      prisma.conference.findMany({
        where: { award: { not: null } },
        select: {
          id: true,
          name: true,
          committee: true,
          portfolio: true,
          award: true,
          countryFlag: true,
        },
      }),
      prisma.document.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          conference: { select: { name: true, committee: true } },
        },
      }),
      prisma.conference.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { documents: true, speeches: true },
          },
        },
      }),
      prisma.practiceSession.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      stats: {
        conferences: conferenceCount,
        documents: documentCount,
        speeches: speechCount,
        awards: awardCount,
        practiceStreak: profile?.practiceStreak || 4,
      },
      profile: profile || {
        id: "default-profile",
        name: "Delegate Workspace",
        institution: "International MUN Society",
        country: "United Kingdom",
        avatarInitials: "MV",
        practiceStreak: 4,
      },
      awardsList,
      recentDocs,
      recentConferences,
      recentSessions,
    });
  } catch (error: any) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, institution, country, notes, avatarInitials } = body;

    const profile = await prisma.delegateProfile.upsert({
      where: { id: "default-profile" },
      update: {
        ...(name && { name }),
        ...(institution && { institution }),
        ...(country && { country }),
        ...(notes !== undefined && { notes }),
        ...(avatarInitials && { avatarInitials }),
      },
      create: {
        id: "default-profile",
        name: name || "Delegate Workspace",
        institution: institution || "International MUN Society",
        country: country || "United Kingdom",
        avatarInitials: avatarInitials || "MV",
      },
    });

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error("PATCH /api/profile error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
