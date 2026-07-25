// This file should be generated from the backend contract once the API schema is available.
// Keep frontend API types synchronized with backend responses instead of hand-editing them long term.

export type BaseEntity = {
  id: string;
  createdAt: number;
};

export type Entity<T> = {
  [K in keyof T]: T[K];
} & BaseEntity;

export type Meta = {
  page: number;
  total: number;
  totalPages: number;
};

export type User = Entity<{
  name: string;
  email: string;
  avatar: string;
  role?: 'ADMIN' | 'USER';
}>;

export type ApiResponse<T> = {
  status: number;
  message?: string;
  data: T;
};

export type AuthTokenResponse = {
  token: string;
};
