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
