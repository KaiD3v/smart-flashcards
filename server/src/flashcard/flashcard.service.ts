import { HttpError } from "../auth/auth.errors";
import {
  extractTextFromDocument,
  resolveUploadedDocumentMimeType,
} from "../helpers/document-text-extraction.helper";
import { generateFlashcardsFromMaterialText } from "../helpers/flashcard-generation.helper";
import { FsrsService } from "../helpers/fsrs";
import { SubjectService } from "../subject/subject.service";
import type {
  CreateFlashcardBody,
  GenerateFlashcardsBody,
  GenerateFromFileFields,
  ReviewFlashcardBody,
  UpdateFlashcardBody,
} from "./flashcard.dto";
import {
  FlashcardRepository,
  type CreateFlashcardInput,
  type UpdateFlashcardReviewInput,
  type UpdateFlashcardInput,
} from "./flashcard.repository";
import type {
  FlashcardEntity,
  FlashcardResponse,
  GenerateFromFileResponse,
} from "./flashcard.types";

function toResponse(flashcard: FlashcardEntity): FlashcardResponse {
  return flashcard;
}

export class FlashcardService {
  constructor(
    private readonly repository: FlashcardRepository,
    private readonly subjectService: SubjectService,
    private readonly fsrsService: FsrsService
  ) {}

  private async assertSubjectOwned(subjectId: string, ownerUserId: string): Promise<void> {
    await this.subjectService.findByIdForUser(subjectId, ownerUserId);
  }

  async create(
    subjectId: string,
    ownerUserId: string,
    body: CreateFlashcardBody
  ): Promise<FlashcardResponse> {
    await this.assertSubjectOwned(subjectId, ownerUserId);
    const now = new Date();
    const initialFsrsState = this.fsrsService.initialState(now);

    const order =
      body.order ?? (await this.repository.getNextOrderForSubject(subjectId));

    const input: CreateFlashcardInput = {
      subjectId,
      front: body.front,
      back: body.back,
      order,
      due: initialFsrsState.due,
      lastReviewedAt: null,
      stability: initialFsrsState.stability,
      difficulty: initialFsrsState.difficulty,
      reps: initialFsrsState.reps,
      lapses: initialFsrsState.lapses,
      state: initialFsrsState.state,
    };

    const flashcard = await this.repository.create(input);
    return toResponse(flashcard);
  }

  async findByIdForUser(
    flashcardId: string,
    ownerUserId: string
  ): Promise<FlashcardResponse> {
    const flashcard = await this.repository.findByIdForUser(flashcardId, ownerUserId);
    if (!flashcard) {
      throw new HttpError(404, "Flashcard not found");
    }
    return toResponse(flashcard);
  }

  async findAllForUserBySubject(
    subjectId: string,
    ownerUserId: string
  ): Promise<FlashcardResponse[]> {
    await this.assertSubjectOwned(subjectId, ownerUserId);
    const rows = await this.repository.findManyForUserBySubjectId(subjectId, ownerUserId);
    return rows.map(toResponse);
  }

  async updateForUser(
    flashcardId: string,
    ownerUserId: string,
    body: UpdateFlashcardBody
  ): Promise<FlashcardResponse> {
    const patch: UpdateFlashcardInput = {
      ...(body.front !== undefined ? { front: body.front } : {}),
      ...(body.back !== undefined ? { back: body.back } : {}),
      ...(body.order !== undefined ? { order: body.order } : {}),
    };

    const flashcard = await this.repository.updateForUser(flashcardId, ownerUserId, patch);
    if (!flashcard) {
      throw new HttpError(404, "Flashcard not found");
    }
    return toResponse(flashcard);
  }

  async deleteForUser(flashcardId: string, ownerUserId: string): Promise<void> {
    const deleted = await this.repository.deleteForUser(flashcardId, ownerUserId);
    if (!deleted) {
      throw new HttpError(404, "Flashcard not found");
    }
  }

  async findNeedReviewForUserBySubject(
    subjectId: string,
    ownerUserId: string
  ): Promise<FlashcardResponse[]> {
    await this.assertSubjectOwned(subjectId, ownerUserId);
    const rows = await this.repository.findNeedReviewForUserBySubjectId(
      subjectId,
      ownerUserId,
      new Date()
    );
    return rows.map(toResponse);
  }

  async reviewForUser(
    flashcardId: string,
    ownerUserId: string,
    body: ReviewFlashcardBody
  ): Promise<FlashcardResponse> {
    const flashcard = await this.repository.findByIdForUser(flashcardId, ownerUserId);
    if (!flashcard) {
      throw new HttpError(404, "Flashcard not found");
    }

    const now = new Date();
    const reviewed = this.fsrsService.review({
      stability: flashcard.stability,
      difficulty: flashcard.difficulty,
      due: flashcard.due,
      lastReviewedAt: flashcard.lastReviewedAt,
      reps: flashcard.reps,
      lapses: flashcard.lapses,
      state: flashcard.state,
      rating: body.rating,
      now,
    });

    const patch: UpdateFlashcardReviewInput = {
      stability: reviewed.stability,
      difficulty: reviewed.difficulty,
      due: reviewed.due,
      lastReviewedAt: reviewed.lastReviewedAt,
      reps: reviewed.reps,
      lapses: reviewed.lapses,
      state: reviewed.state,
    };

    const updated = await this.repository.updateReviewForUser(flashcardId, ownerUserId, patch);
    if (!updated) {
      throw new HttpError(404, "Flashcard not found");
    }

    return toResponse(updated);
  }

  /**
   * Gera flashcards via Ollama; opcionalmente persiste na matéria (sempre do utilizador autenticado).
   */
  async generateFromMaterial(
    subjectId: string,
    ownerUserId: string,
    body: GenerateFlashcardsBody
  ): Promise<
    | { flashcards: FlashcardResponse[]; persisted: true }
    | { flashcards: Array<{ front: string; back: string }>; persisted: false }
  > {
    await this.assertSubjectOwned(subjectId, ownerUserId);

    let generated: Array<{ front: string; back: string }>;
    try {
      generated = await generateFlashcardsFromMaterialText({
        materialText: body.materialText,
        maxCards: body.maxCards,
        model: body.model,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Flashcard generation failed";
      throw new HttpError(502, message);
    }

    if (body.persist === true) {
      const startOrder = await this.repository.getNextOrderForSubject(subjectId);
      const saved = await this.repository.createManyForSubject(subjectId, generated, startOrder);
      return { flashcards: saved.map(toResponse), persisted: true };
    }

    return { flashcards: generated, persisted: false };
  }

  /**
   * Extrai texto de um documento (PDF, DOCX, TXT) e gera flashcards via LLM.
   * O ficheiro não é persistido — apenas o texto extraído alimenta a geração.
   */
  async generateFromFile(
    subjectId: string,
    ownerUserId: string,
    file: Express.Multer.File,
    fields: GenerateFromFileFields
  ): Promise<GenerateFromFileResponse> {
    const mimeType = resolveUploadedDocumentMimeType(file.originalname, file.mimetype);

    let extracted: Awaited<ReturnType<typeof extractTextFromDocument>>;
    try {
      extracted = await extractTextFromDocument(file.buffer, mimeType);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : "Document text extraction failed";
      throw new HttpError(400, message);
    }

    const result = await this.generateFromMaterial(subjectId, ownerUserId, {
      materialText: extracted.text,
      maxCards: fields.maxCards,
      model: fields.model,
      persist: fields.persist,
    });

    return {
      ...result,
      source: {
        filename: file.originalname,
        mimeType,
        extractedCharCount: extracted.text.length,
        originalCharCount: extracted.originalCharCount,
        truncated: extracted.truncated,
      },
    };
  }
}
