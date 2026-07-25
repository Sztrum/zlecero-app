import {
  randEmail,
  randCompanyName,
  randParagraph,
  randPassword,
  randUserName,
  randUuid,
} from '@ngneat/falso';

const generateCompany = () => ({
  id: randUuid() + Math.random(),
  name: randCompanyName(),
  slug: `company-${Math.random().toString(36).slice(2, 8)}`,
  billingName: '',
  taxNumber: '',
  contactEmail: '',
  contactPhone: '',
  addressLine: '',
  postalCode: '',
  city: '',
  countryCode: 'PL',
  brandColor: '#2563eb',
  trialDays: 14,
  trialStartedAt: new Date().toISOString(),
  trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  onboardingCompletedAt: null,
  createdAt: Date.now(),
});

const generateUser = () => ({
  id: randUuid() + Math.random(),
  name: randUserName({ withAccents: false }),
  email: randEmail(),
  avatar: 'https://picsum.photos/150/150',
  password: randPassword(),
  role: 'owner',
  status: 'active',
  company: generateCompany(),
  bio: randParagraph(),
  createdAt: Date.now(),
});

const generateCustomer = () => ({
  id: randUuid() + Math.random(),
  companyId: generateCompany().id,
  type: 'company',
  displayName: randCompanyName(),
  companyName: randCompanyName(),
  firstName: '',
  lastName: '',
  email: randEmail(),
  phone: '',
  taxNumber: '',
  addressLine: '',
  postalCode: '',
  city: '',
  countryCode: 'PL',
  notes: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const createUser = <T extends Partial<ReturnType<typeof generateUser>>>(
  overrides?: T,
) => {
  return { ...generateUser(), ...overrides };
};

export const createCompany = <
  T extends Partial<ReturnType<typeof generateCompany>>,
>(
  overrides?: T,
) => {
  return { ...generateCompany(), ...overrides };
};

export const createCustomer = <
  T extends Partial<ReturnType<typeof generateCustomer>>,
>(
  overrides?: T,
) => {
  return { ...generateCustomer(), ...overrides };
};
