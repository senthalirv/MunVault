/**
 * Universal text extraction utility for immutable document intake.
 * Extracts textual content from TXT, Markdown, DOCX, and PDF uploads.
 */

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<{ text: string; wordCount: number }> {
  try {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";

    // Plain text or markdown
    if (
      mimeType.includes("text") ||
      ext === "txt" ||
      ext === "md" ||
      ext === "markdown" ||
      ext === "csv"
    ) {
      const text = buffer.toString("utf-8");
      return {
        text,
        wordCount: text.split(/\s+/).filter(Boolean).length,
      };
    }

    // DOCX format
    if (
      ext === "docx" ||
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      try {
        // dynamic require for mammoth
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mammoth = require("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        const text = result.value || "";
        return {
          text: text.trim(),
          wordCount: text.split(/\s+/).filter(Boolean).length,
        };
      } catch (docErr) {
        console.warn("Mammoth extraction fallback:", docErr);
        const fallback = buffer.toString("utf-8").replace(/[^\x20-\x7E\n\r]/g, " ");
        return { text: fallback.trim(), wordCount: fallback.split(/\s+/).length };
      }
    }

    // PDF format
    if (ext === "pdf" || mimeType === "application/pdf") {
      try {
        // dynamic require for pdf-parse
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pdfParse = require("pdf-parse");
        const data = await pdfParse(buffer);
        const text = data.text || "";
        return {
          text: text.trim(),
          wordCount: text.split(/\s+/).filter(Boolean).length,
        };
      } catch (pdfErr) {
        console.warn("PDF-parse extraction fallback:", pdfErr);
        const fallback = buffer.toString("utf-8").replace(/[^\x20-\x7E\n\r]/g, " ");
        return { text: fallback.trim(), wordCount: fallback.split(/\s+/).length };
      }
    }

    // Default string fallback
    const raw = buffer.toString("utf-8").replace(/[^\x20-\x7E\n\r]/g, " ").trim();
    return {
      text: raw,
      wordCount: raw.split(/\s+/).filter(Boolean).length,
    };
  } catch (err) {
    console.error("Text extraction failed:", err);
    return {
      text: "Text extraction unavailable for this file format.",
      wordCount: 0,
    };
  }
}
