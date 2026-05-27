import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { HttpError } from "../auth/auth.errors";
import {
  resolveDocumentMimeType,
  type SupportedDocumentMimeType,
} from "../middleware/file-upload.middleware";

const MIN_EXTRACTED_CHARS = 50;
const MAX_MATERIAL_CHARS = 100_000;

export type ExtractTextResult = {
  text: string;
  originalCharCount: number;
  truncated: boolean;
};

function normalizeExtractedText(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

async function extractFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

async function extractFromDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

function extractFromTxt(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

async function extractRawText(
  buffer: Buffer,
  mimeType: SupportedDocumentMimeType
): Promise<string> {
  switch (mimeType) {
    case "application/pdf":
      return extractFromPdf(buffer);
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return extractFromDocx(buffer);
    case "text/plain":
      return extractFromTxt(buffer);
    default:
      throw new HttpError(400, "Unsupported document type");
  }
}

function applyMaterialLengthLimit(text: string): Pick<ExtractTextResult, "text" | "truncated"> {
  if (text.length <= MAX_MATERIAL_CHARS) {
    return { text, truncated: false };
  }

  return {
    text: text.slice(0, MAX_MATERIAL_CHARS),
    truncated: true,
  };
}

/**
 * Extrai texto de um documento em memória (PDF, DOCX ou TXT), normaliza e aplica limites.
 */
export async function extractTextFromDocument(
  buffer: Buffer,
  mimeType: SupportedDocumentMimeType
): Promise<ExtractTextResult> {
  let raw: string;
  try {
    raw = await extractRawText(buffer, mimeType);
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : "Document parsing failed";
    throw new HttpError(400, message);
  }

  const normalized = normalizeExtractedText(raw);
  const originalCharCount = normalized.length;

  if (originalCharCount < MIN_EXTRACTED_CHARS) {
    throw new HttpError(
      400,
      "Could not extract enough text from the document. The file may be empty, scanned, or image-only."
    );
  }

  const { text, truncated } = applyMaterialLengthLimit(normalized);

  return {
    text,
    originalCharCount,
    truncated,
  };
}

/**
 * Resolve o MIME do ficheiro carregado (útil quando o browser envia `application/octet-stream`).
 */
export function resolveUploadedDocumentMimeType(
  filename: string,
  reportedMimeType: string
): SupportedDocumentMimeType {
  return resolveDocumentMimeType(filename, reportedMimeType);
}
