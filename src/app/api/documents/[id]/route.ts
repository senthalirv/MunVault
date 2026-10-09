import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const document = await prisma.document.findUnique({
      where: { id: params.id },
      include: {
        conference: true,
        sourceLinks: {
          include: {
            targetDoc: {
              select: { id: true, title: true, category: true, conferenceId: true },
            },
          },
        },
        targetLinks: {
          include: {
            sourceDoc: {
              select: { id: true, title: true, category: true, conferenceId: true },
            },
          },
        },
        speech: true,
      },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ document });
  } catch (error: any) {
    console.error(`GET /api/documents/${params.id} error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { category, tags, title, content } = body;

    // Strict Enforcement of Immutable Document Archival
    if (content !== undefined) {
      return NextResponse.json(
        {
          error:
            "Original document contents are strictly immutable to preserve historical MUN authenticity. To update speech or research text, please upload a new revision as a separate document.",
        },
        { status: 403 }
      );
    }

    const updated = await prisma.document.update({
      where: { id: params.id },
      data: {
        ...(category !== undefined && { category }),
        ...(tags !== undefined && { tags: tags?.trim() || null }),
        ...(title !== undefined && { title: title.trim() }),
      },
      include: {
        conference: true,
      },
    });

    return NextResponse.json({ document: updated });
  } catch (error: any) {
    console.error(`PATCH /api/documents/${params.id} error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete associated speech if any
    await prisma.speech.deleteMany({
      where: { documentId: params.id },
    });

    // Delete document (connections will cascade)
    await prisma.document.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, deletedId: params.id });
  } catch (error: any) {
    console.error(`DELETE /api/documents/${params.id} error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
