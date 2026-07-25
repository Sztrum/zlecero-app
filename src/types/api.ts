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

export type CompanyUserRole = 'owner' | 'admin' | 'member';
export type CompanyUserStatus = 'invited' | 'active' | 'deactivated';

export type Company = Entity<{
  name: string;
  slug: string;
  billingName: string | null;
  taxNumber: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  addressLine: string | null;
  postalCode: string | null;
  city: string | null;
  countryCode: string;
  brandColor: string;
  trialDays: number;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  onboardingCompletedAt: string | null;
}>;

export type CompanySummary = Pick<
  Company,
  'id' | 'name' | 'slug' | 'trialEndsAt' | 'onboardingCompletedAt'
>;

export type User = Entity<{
  name: string;
  email: string;
  avatar: string;
  role: CompanyUserRole;
  status: CompanyUserStatus;
  company: CompanySummary | null;
}>;

export type CompanyUser = Entity<{
  name: string;
  email: string;
  role: CompanyUserRole;
  status: CompanyUserStatus;
  invitedAt: string | null;
  deactivatedAt: string | null;
}>;

export type ApiResponse<T> = {
  status: number;
  message?: string;
  data: T;
};

export type AuthTokenResponse = {
  token: string;
};
