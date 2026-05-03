export type UserEntity = {
  id: string;
  email: string;
  nickname: string;
  name: string | null;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicUser = Omit<UserEntity, "password">;
