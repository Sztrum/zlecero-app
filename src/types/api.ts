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
export type CustomerType = 'company' | 'individual';
export type InquiryStatus =
  | 'new'
  | 'triage'
  | 'waiting_for_customer'
  | 'preparing_offer'
  | 'offer_sent'
  | 'accepted'
  | 'rejected'
  | 'closed';
export type InquiryPriority = 'low' | 'normal' | 'high' | 'urgent';
export type InquiryMessageDirection = 'inbound' | 'outbound' | 'internal';

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

export type CustomerDuplicate = {
  id: string;
  displayName: string;
  email: string | null;
  companyName: string | null;
  taxNumber: string | null;
};

export type CustomerHistory = {
  inquiries: unknown[];
  messages: unknown[];
  offers: unknown[];
  orders: unknown[];
};

export type Customer = Entity<{
  type: CustomerType;
  displayName: string;
  companyName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  taxNumber: string | null;
  addressLine: string | null;
  postalCode: string | null;
  city: string | null;
  countryCode: string;
  notes: string | null;
  potentialDuplicates: CustomerDuplicate[];
  history: CustomerHistory | null;
  updatedAt: string | null;
}>;

export type InquiryParty = {
  id: string;
  displayName?: string;
  name?: string;
  email: string | null;
};

export type InquiryMessage = Entity<{
  direction: InquiryMessageDirection;
  senderName: string | null;
  senderEmail: string | null;
  recipientEmail: string | null;
  subject: string | null;
  body: string;
  externalMessageId: string | null;
  externalThreadId: string | null;
  sentAt: string | null;
}>;

export type InquiryStatusChange = {
  id: string;
  fromStatus: InquiryStatus | null;
  toStatus: InquiryStatus;
  changedByUserId: string | null;
  changedAt: string;
};

export type InquiryFile = Entity<{
  source: string;
  originalName: string;
  mimeType: string | null;
  sizeBytes: number;
  category: string | null;
  description: string | null;
  uploadedByUserId: string | null;
  messageId: string | null;
  downloadUrl: string;
  updatedAt: string | null;
}>;

export type InquiryNote = Entity<{
  body: string;
  isInternal: boolean;
  author: InquiryParty | null;
  updatedAt: string | null;
}>;

export type Inquiry = Entity<{
  title: string;
  description: string | null;
  source: string;
  status: InquiryStatus;
  priority: InquiryPriority;
  responseDueAt: string | null;
  realizationDueAt: string | null;
  pickupDueAt: string | null;
  archivedAt: string | null;
  customer: InquiryParty | null;
  owner: InquiryParty | null;
  messages: InquiryMessage[];
  files: InquiryFile[];
  notes: InquiryNote[];
  statusChanges: InquiryStatusChange[];
  updatedAt: string | null;
}>;

export type OfferStatus = 'draft' | 'sent' | 'accepted' | 'rejected';
export type OfferDiscountType = 'percent' | 'amount';

export type OfferItem = Entity<{
  position: number;
  name: string;
  description: string | null;
  quantity: string;
  unit: string;
  unitPriceCents: number;
  taxRate: string;
  netCents: number;
  taxCents: number;
  grossCents: number;
}>;

export type Offer = Entity<{
  inquiryId: string;
  customer: InquiryParty | null;
  owner: InquiryParty | null;
  number: string;
  status: OfferStatus;
  currency: string;
  issueDate: string;
  validUntil: string;
  paymentDueDays: number;
  deliveryCostCents: number;
  discountType: OfferDiscountType | null;
  discountValue: string;
  depositPercent: string;
  terms: string | null;
  notes: string | null;
  subtotalNetCents: number;
  discountCents: number;
  taxCents: number;
  totalGrossCents: number;
  depositCents: number;
  pdf: { generatedAt: string | null; downloadUrl: string } | null;
  orderId: string | null;
  sentAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  items: OfferItem[];
  updatedAt: string | null;
}>;

export type OrderStatus = 'new' | 'in_progress' | 'completed';

export type OrderItem = Omit<OfferItem, never>;

export type Order = Entity<{
  inquiryId: string | null;
  offerId: string;
  customer: InquiryParty | null;
  owner: InquiryParty | null;
  number: string;
  status: OrderStatus;
  currency: string;
  acceptedDate: string;
  paymentDueDate: string | null;
  realizationDueDate: string | null;
  pickupDueDate: string | null;
  terms: string | null;
  notes: string | null;
  subtotalNetCents: number;
  discountCents: number;
  taxCents: number;
  totalGrossCents: number;
  depositCents: number;
  items: OrderItem[];
  updatedAt: string | null;
}>;

export type DashboardTone = 'primary' | 'info' | 'warning' | 'danger';

export type DashboardCard = {
  id: string;
  label: string;
  value: number;
  tone: DashboardTone;
  href?: string;
};

export type DashboardItem = {
  id: string;
  type: 'inquiry' | 'offer' | 'order';
  label: string;
  title: string;
  customerName: string | null;
  ownerName: string | null;
  status: string;
  tone: DashboardTone;
  dueAt: string | null;
  href: string;
};

export type DashboardActivity = {
  id: string;
  type: string;
  label: string;
  description: string | null;
  status: string;
  occurredAt: string;
  href: string;
};

export type CompanyDashboard = {
  filter: { owner: 'all' | 'me' };
  cards: DashboardCard[];
  tasksToday: DashboardItem[];
  attentionItems: DashboardItem[];
  upcomingDeadlines: DashboardItem[];
  stats: {
    activeInquiries: number;
    sentOffersGrossCents: number;
    acceptedOffersGrossCents: number;
    activeOrders: number;
  };
  recentActivity: DashboardActivity[];
};

export type AdminDashboardAlert = {
  id: string;
  severity: DashboardTone;
  label: string;
  companyName: string;
  createdAt: string | null;
};

export type AdminDashboardCompany = {
  id: string;
  name: string;
  slug: string;
  trialEndsAt: string | null;
  onboardingCompletedAt: string | null;
  createdAt: string | null;
};

export type AdminDashboard = {
  cards: DashboardCard[];
  recentCompanies: AdminDashboardCompany[];
  alerts: AdminDashboardAlert[];
};

export type ApiResponse<T> = {
  status: number;
  message?: string;
  data: T;
};

export type AuthTokenResponse = {
  token: string;
};
