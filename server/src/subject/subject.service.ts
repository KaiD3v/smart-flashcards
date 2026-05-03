import type { CreateSubjectBody, UpdateSubjectBody } from "./subject.dto";
import { HttpError } from "../auth/auth.errors";
import {
  SubjectRepository,
  type CreateSubjectInput,
  type UpdateSubjectInput,
} from "./subject.repository";
import type { SubjectEntity, SubjectResponse } from "./subject.types";

function toResponse(subject: SubjectEntity): SubjectResponse {
  const { userId: _userId, ...rest } = subject;
  return rest;
}

export class SubjectService {
  constructor(private readonly repository: SubjectRepository) {}

  async create(ownerUserId: string, body: CreateSubjectBody): Promise<SubjectResponse> {
    const input: CreateSubjectInput = {
      userId: ownerUserId,
      name: body.name,
      description: body.description ?? null,
      imageUrl: body.imageUrl ?? null,
      isActive: body.isActive ?? true,
    };

    const subject = await this.repository.create(input);
    return toResponse(subject);
  }

  async findByIdForUser(id: string, ownerUserId: string): Promise<SubjectResponse> {
    const subject = await this.repository.findByIdForUser(id, ownerUserId);
    if (!subject) {
      throw new HttpError(404, "Subject not found");
    }
    return toResponse(subject);
  }

  async findAllForUser(ownerUserId: string): Promise<SubjectResponse[]> {
    const subjects = await this.repository.findManyByUserId(ownerUserId);
    return subjects.map(toResponse);
  }

  async updateForUser(
    id: string,
    ownerUserId: string,
    body: UpdateSubjectBody
  ): Promise<SubjectResponse> {
    const patch: UpdateSubjectInput = {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.imageUrl !== undefined
        ? { imageUrl: body.imageUrl === "" ? null : body.imageUrl }
        : {}),
      ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
    };

    const subject = await this.repository.updateForUser(id, ownerUserId, patch);
    if (!subject) {
      throw new HttpError(404, "Subject not found");
    }
    return toResponse(subject);
  }

  async deleteForUser(id: string, ownerUserId: string): Promise<void> {
    const deleted = await this.repository.deleteForUser(id, ownerUserId);
    if (!deleted) {
      throw new HttpError(404, "Subject not found");
    }
  }
}
