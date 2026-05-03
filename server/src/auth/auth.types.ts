export type AuthUser = {
  id: string;
  email: string;
  nickname: string;
  name: string | null;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};
