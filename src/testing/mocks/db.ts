import { factory, nullable, primaryKey } from '@mswjs/data';
import { nanoid } from 'nanoid';

const models = {
  company: {
    id: primaryKey(nanoid),
    name: String,
    slug: String,
    billingName: String,
    taxNumber: String,
    contactEmail: String,
    contactPhone: String,
    addressLine: String,
    postalCode: String,
    city: String,
    countryCode: String,
    brandColor: String,
    trialDays: Number,
    trialStartedAt: String,
    trialEndsAt: String,
    onboardingCompletedAt: nullable(String),
    createdAt: Date.now,
  },
  user: {
    id: primaryKey(nanoid),
    companyId: String,
    name: String,
    email: String,
    avatar: String,
    password: String,
    role: String,
    status: String,
    bio: String,
    invitedAt: String,
    deactivatedAt: String,
    createdAt: Date.now,
  },
  customer: {
    id: primaryKey(nanoid),
    companyId: String,
    type: String,
    displayName: String,
    companyName: nullable(String),
    firstName: nullable(String),
    lastName: nullable(String),
    email: nullable(String),
    phone: nullable(String),
    taxNumber: nullable(String),
    addressLine: nullable(String),
    postalCode: nullable(String),
    city: nullable(String),
    countryCode: String,
    notes: nullable(String),
    createdAt: String,
    updatedAt: String,
  },
  inquiry: {
    id: primaryKey(nanoid),
    companyId: String,
    customerId: nullable(String),
    ownerUserId: nullable(String),
    source: String,
    title: String,
    description: nullable(String),
    status: String,
    priority: String,
    responseDueAt: nullable(String),
    realizationDueAt: nullable(String),
    pickupDueAt: nullable(String),
    archivedAt: nullable(String),
    createdAt: String,
    updatedAt: String,
  },
  inquiryStatusChange: {
    id: primaryKey(nanoid),
    companyId: String,
    inquiryId: String,
    changedByUserId: nullable(String),
    fromStatus: nullable(String),
    toStatus: String,
    changedAt: String,
  },
  inquiryMessage: {
    id: primaryKey(nanoid),
    companyId: String,
    inquiryId: String,
    customerId: nullable(String),
    createdByUserId: nullable(String),
    direction: String,
    senderName: nullable(String),
    senderEmail: nullable(String),
    recipientEmail: nullable(String),
    subject: nullable(String),
    body: String,
    externalMessageId: nullable(String),
    externalThreadId: nullable(String),
    sentAt: nullable(String),
    createdAt: String,
  },
  inquiryFile: {
    id: primaryKey(nanoid),
    companyId: String,
    inquiryId: String,
    customerId: nullable(String),
    inquiryMessageId: nullable(String),
    uploadedByUserId: nullable(String),
    source: String,
    originalName: String,
    mimeType: nullable(String),
    sizeBytes: Number,
    category: nullable(String),
    description: nullable(String),
    downloadUrl: String,
    createdAt: String,
    updatedAt: String,
  },
  inquiryNote: {
    id: primaryKey(nanoid),
    companyId: String,
    inquiryId: String,
    authorUserId: nullable(String),
    body: String,
    isInternal: Boolean,
    createdAt: String,
    updatedAt: String,
  },
  offer: {
    id: primaryKey(nanoid),
    companyId: String,
    inquiryId: String,
    customerId: nullable(String),
    ownerUserId: nullable(String),
    number: String,
    status: String,
    currency: String,
    issueDate: String,
    validUntil: String,
    paymentDueDays: Number,
    deliveryCostCents: Number,
    discountType: nullable(String),
    discountValue: String,
    depositPercent: String,
    terms: nullable(String),
    notes: nullable(String),
    subtotalNetCents: Number,
    discountCents: Number,
    taxCents: Number,
    totalGrossCents: Number,
    depositCents: Number,
    pdfGeneratedAt: nullable(String),
    sentAt: nullable(String),
    acceptedAt: nullable(String),
    rejectedAt: nullable(String),
    createdAt: String,
    updatedAt: String,
  },
  offerItem: {
    id: primaryKey(nanoid),
    companyId: String,
    offerId: String,
    position: Number,
    name: String,
    description: nullable(String),
    quantity: String,
    unit: String,
    unitPriceCents: Number,
    taxRate: String,
    netCents: Number,
    taxCents: Number,
    grossCents: Number,
    createdAt: String,
    updatedAt: String,
  },
  order: {
    id: primaryKey(nanoid),
    companyId: String,
    inquiryId: nullable(String),
    offerId: String,
    customerId: nullable(String),
    ownerUserId: nullable(String),
    number: String,
    status: String,
    currency: String,
    acceptedDate: String,
    paymentDueDate: nullable(String),
    realizationDueDate: nullable(String),
    pickupDueDate: nullable(String),
    terms: nullable(String),
    notes: nullable(String),
    subtotalNetCents: Number,
    discountCents: Number,
    taxCents: Number,
    totalGrossCents: Number,
    depositCents: Number,
    createdAt: String,
    updatedAt: String,
  },
  orderItem: {
    id: primaryKey(nanoid),
    companyId: String,
    orderId: String,
    offerItemId: nullable(String),
    position: Number,
    name: String,
    description: nullable(String),
    quantity: String,
    unit: String,
    unitPriceCents: Number,
    taxRate: String,
    netCents: Number,
    taxCents: Number,
    grossCents: Number,
    createdAt: String,
    updatedAt: String,
  },
};

export const db = factory(models);

export type Model = keyof typeof models;

const dbFilePath = 'mocked-db.json';

export const loadDb = async () => {
  if (typeof window === 'undefined') {
    const { readFile, writeFile } = await import('fs/promises');
    try {
      const data = await readFile(dbFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error: any) {
      if (error?.code === 'ENOENT') {
        const emptyDB = {};
        await writeFile(dbFilePath, JSON.stringify(emptyDB, null, 2));
        return emptyDB;
      }

      console.error('Error loading mocked DB:', error);
      return null;
    }
  }

  return Object.assign(
    JSON.parse(window.localStorage.getItem('msw-db') || '{}'),
  );
};

export const storeDb = async (data: string) => {
  if (typeof window === 'undefined') {
    const { writeFile } = await import('fs/promises');
    await writeFile(dbFilePath, data);
  } else {
    window.localStorage.setItem('msw-db', data);
  }
};

export const persistDb = async (model: Model) => {
  if (process.env.NODE_ENV === 'test') return;
  const data = await loadDb();
  data[model] = db[model].getAll();
  await storeDb(JSON.stringify(data));
};

export const initializeDb = async () => {
  const database = await loadDb();
  Object.entries(db).forEach(([key, model]) => {
    const dataEntries = database[key];
    if (dataEntries) {
      dataEntries?.forEach((entry: Record<string, any>) => {
        model.create(entry);
      });
    }
  });
};

export const resetDb = () => {
  window.localStorage.clear();
};
