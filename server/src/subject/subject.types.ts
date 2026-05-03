export type SubjectEntity = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SubjectResponse = Omit<SubjectEntity, "userId">;
