import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { extractTextFromBuffer } from "@/lib/parsers/document-parser";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const conferenceId = formData.get("conferenceId") as string | null;
    const category = (formData.get("category") as string) || "RESEARCH";
    const customTitle = formData.get("title") as string | null;
    const tags = formData.get("tags") as string | null;

    if (!file || !conferenceId) {
      return NextResponse.json(
        { error: "A file and a valid conferenceId are required." },
        { status: 400 }
      );
    }

    const conference = await prisma.conference.findUnique({
      where: { id: conferenceId },
    });
    if (!conference) {
      return NextResponse.json({ error: "Conference not found." }, { status: 404 });
    }

    const fileName = file.name;
    const mimeType = file.type || "application/octet-stream";
    const fileSize = file.size;

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure uploads directory exists
    const uploadDir = path.resolve(process.cwd(), "data", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save unique local copy for immutable reference
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const localFilePath = path.join(uploadDir, `${uniqueSuffix}_${sanitizedFileName}`);
    fs.writeFileSync(localFilePath, buffer);

    // Extract text content from buffer
    const { text, wordCount } = await extractTextFromBuffer(buffer, mimeType, fileName);

    const docTitle = customTitle?.trim() || fileName.replace(/\.[^/.]+$/, "");
    const coverageScore = Math.min(95, Math.max(50, Math.round(55 + Math.min(35, wordCount / 15))));

    const document = await prisma.document.create({
      data: {
        conferenceId,
        title: docTitle,
        category,
        content: text.trim() || `Uploaded document: ${fileName}`,
        fileName,
        fileSize,
        mimeType,
        fileUrl: `/api/documents/download?file=${encodeURIComponent(path.basename(localFilePath))}`,
        tags: tags?.trim() || null,
        isImmutable: true,
        coverageScore,
      },
      include: {
        conference: true,
      },
    });

    // If GSL or Mod Caucus, also create Speech entry
    if (category === "GSL" || category === "MODERATED_CAUCUS") {
      await prisma.speech.create({
        data: {
          conferenceId,
          documentId: document.id,
          title: docTitle,
          speechType: category,
          content: text.trim(),
          themes: JSON.stringify([conference.committee, "Multilateral Position"]),
          arguments: JSON.stringify(["Extracted from uploaded speech"]),
          policyProposals: JSON.stringify([]),
          evidenceUsed: JSON.stringify([]),
          framingType: "Diplomatic Balance",
        },
      });
    }

    return NextResponse.json({ document }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/documents/upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload document" }, { status: 500 });
  }
}
