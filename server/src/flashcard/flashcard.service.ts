import { HttpError } from "../auth/auth.errors";
import { generateFlashcardsFromMaterialText } from "../helpers/flashcard-generation.helper";
import { SubjectService } from "../subject/subject.service";
import type { CreateFlashcardBody, GenerateFlashcardsBody, UpdateFlashcardBody } from "./flashcard.dto";
import {
  FlashcardRepository,
  type CreateFlashcardInput,
  type UpdateFlashcardInput,
} from "./flashcard.repository";
import type { FlashcardEntity, FlashcardResponse } from "./flashcard.types";

function toResponse(flashcard: FlashcardEntity): FlashcardResponse {
  return flashcard;
}

export class FlashcardService {
  constructor(
    private readonly repository: FlashcardRepository,
    private readonly subjectService: SubjectService
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

    const order =
      body.order ?? (await this.repository.getNextOrderForSubject(subjectId));

    const input: CreateFlashcardInput = {
      subjectId,
      front: body.front,
      back: body.back,
      order,
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
}
