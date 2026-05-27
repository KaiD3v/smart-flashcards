import type { NextFunction, Request, RequestHandler, Response } from "express";
import multer, { type FileFilterCallback } from "multer";
import { HttpError } from "../auth/auth.errors";

const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;

export const FLASHCARD_DOCUMENT_FIELD = "file";

export const SUPPORTED_DOCUMENT_EXTENSIONS = [".pdf", ".docx", ".txt"] as const;

export type SupportedDocumentExtension = (typeof SUPPORTED_DOCUMENT_EXTENSIONS)[number];

export const SUPPORTED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
] as const;

export type SupportedDocumentMimeType = (typeof SUPPORTED_DOCUMENT_MIME_TYPES)[number];

const EXTENSION_TO_MIME: Record<SupportedDocumentExtension, SupportedDocumentMimeType> = {
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".txt": "text/plain",
};

export type DocumentFileUploadOptions = {
  /** Tamanho máximo do ficheiro em bytes. Default: `FILE_UPLOAD_MAX_BYTES` ou 10 MB. */
  maxBytes?: number;
  /** Nome do campo multipart. Default: `file`. */
  fieldName?: string;
};

function parseMaxBytesFromEnv(): number {
  const raw = process.env.FILE_UPLOAD_MAX_BYTES?.trim();
  if (!raw) {
    return DEFAULT_MAX_BYTES;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_MAX_BYTES;
  }

  return Math.floor(parsed);
}

function getFileExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex === -1) {
    return "";
  }
  return filename.slice(dotIndex).toLowerCase();
}

function isSupportedExtension(extension: string): extension is SupportedDocumentExtension {
  return (SUPPORTED_DOCUMENT_EXTENSIONS as readonly string[]).includes(extension);
}

function isSupportedMimeType(mimeType: string): mimeType is SupportedDocumentMimeType {
  return (SUPPORTED_DOCUMENT_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function resolveDocumentMimeType(
  filename: string,
  reportedMimeType: string
): SupportedDocumentMimeType {
  const extension = getFileExtension(filename);
  if (!isSupportedExtension(extension)) {
    throw new HttpError(
      400,
      `Unsupported file extension. Allowed formats: ${SUPPORTED_DOCUMENT_EXTENSIONS.join(", ")}`
    );
  }

  if (isSupportedMimeType(reportedMimeType)) {
    return reportedMimeType;
  }

  if (reportedMimeType === "application/octet-stream") {
    return EXTENSION_TO_MIME[extension];
  }

  throw new HttpError(
    400,
    `Unsupported file type. Allowed formats: ${SUPPORTED_DOCUMENT_EXTENSIONS.join(", ")}`
  );
}

function resolveMimeType(
  extension: SupportedDocumentExtension,
  reportedMimeType: string
): SupportedDocumentMimeType {
  if (isSupportedMimeType(reportedMimeType)) {
    return reportedMimeType;
  }

  if (reportedMimeType === "application/octet-stream") {
    return EXTENSION_TO_MIME[extension];
  }

  throw new HttpError(
    400,
    `Unsupported file type. Allowed formats: ${SUPPORTED_DOCUMENT_EXTENSIONS.join(", ")}`
  );
}

function documentFileFilter(
  _req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
): void {
  const extension = getFileExtension(file.originalname);
  if (!isSupportedExtension(extension)) {
    callback(
      new HttpError(
        400,
        `Unsupported file extension. Allowed formats: ${SUPPORTED_DOCUMENT_EXTENSIONS.join(", ")}`
      )
    );
    return;
  }

  try {
    resolveMimeType(extension, file.mimetype);
    callback(null, true);
  } catch (error) {
    callback(error instanceof Error ? error : new Error("Unsupported file type"));
  }
}

function mapMulterError(error: unknown): HttpError {
  if (error instanceof HttpError) {
    return error;
  }

  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        return new HttpError(413, "File too large");
      case "LIMIT_UNEXPECTED_FILE":
        return new HttpError(
          400,
          `Unexpected file field. Use "${FLASHCARD_DOCUMENT_FIELD}" as the field name`
        );
      case "LIMIT_FILE_COUNT":
        return new HttpError(400, "Only one file is allowed");
      case "LIMIT_PART_COUNT":
      case "LIMIT_FIELD_KEY":
      case "LIMIT_FIELD_VALUE":
      case "LIMIT_FIELD_COUNT":
        return new HttpError(400, "Invalid multipart request");
      default:
        return new HttpError(400, error.message);
    }
  }

  const message = error instanceof Error ? error.message : "File upload failed";
  return new HttpError(400, message);
}

/**
 * Middleware multipart para upload de documentos (PDF, DOCX, TXT) usados na geração de flashcards.
 * Armazena o ficheiro em memória (`req.file.buffer`).
 */
export function createDocumentFileUploadMiddleware(
  options: DocumentFileUploadOptions = {}
): RequestHandler {
  const maxBytes = options.maxBytes ?? parseMaxBytesFromEnv();
  const fieldName = options.fieldName ?? FLASHCARD_DOCUMENT_FIELD;

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxBytes,
      files: 1,
    },
    fileFilter: documentFileFilter,
  }).single(fieldName);

  return (req: Request, res: Response, next: NextFunction): void => {
    upload(req, res, (error) => {
      if (error) {
        next(mapMulterError(error));
        return;
      }
      next();
    });
  };
}

/**
 * Garante que o request inclui um ficheiro válido após o middleware de upload.
 */
export function requireUploadedDocument(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.file) {
    next(new HttpError(400, `A file is required in the "${FLASHCARD_DOCUMENT_FIELD}" field`));
    return;
  }
  next();
}
