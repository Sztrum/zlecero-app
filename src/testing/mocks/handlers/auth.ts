import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';
import { authToken } from '@/lib/auth-token';

import { db, persistDb } from '../db';
import { authenticate, hash, requireAuth, networkDelay } from '../utils';

type RegisterBody = {
  name: string;
  email: string;
  password: string;
  company_name: string;
};

type LoginBody = {
  email: string;
  password: string;
};

export const authHandlers = [
  http.post(`${env.API_URL}/auth/register`, async ({ request }) => {
    await networkDelay();
    try {
      const userObject = (await request.json()) as RegisterBody;

      const existingUser = db.user.findFirst({
        where: {
          email: {
            equals: userObject.email,
          },
        },
      });

      if (existingUser) {
        return HttpResponse.json(
          { message: 'The user already exists' },
          { status: 400 },
        );
      }

      const company = db.company.create({
        name: userObject.company_name,
        slug: userObject.company_name.toLowerCase().replace(/\s+/g, '-'),
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
        trialEndsAt: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        onboardingCompletedAt: '',
      });

      db.user.create({
        ...userObject,
        companyId: company.id,
        role: 'owner',
        status: 'active',
        bio: '',
        avatar: 'https://picsum.photos/150/150',
        password: hash(userObject.password),
        invitedAt: '',
        deactivatedAt: '',
      });

      await persistDb('company');
      await persistDb('user');

      return HttpResponse.json({
        status: 200,
        message: 'User registered',
        data: {},
      });
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),

  http.post(`${env.API_URL}/auth/login`, async ({ request }) => {
    await networkDelay();

    try {
      const credentials = (await request.json()) as LoginBody;
      const result = authenticate(credentials);

      return HttpResponse.json({
        status: 200,
        message: 'Authenticated',
        data: {
          token: result.token,
        },
      });
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),

  http.post(
    `${env.API_URL}/auth/verify-email/:userId/email/verify/:hash`,
    async ({ params }) => {
      await networkDelay();

      const user = db.user.findFirst({
        where: {
          id: {
            equals: String(params.userId),
          },
        },
      });

      if (!user || String(params.hash).length === 0) {
        return HttpResponse.json(
          { message: 'Invalid email verification hash.' },
          { status: 422 },
        );
      }

      return HttpResponse.json({
        status: 200,
        message: 'Email verified.',
        data: {
          user_id: user.id,
          remember_token: 'mock-remember-token',
        },
      });
    },
  ),

  http.post(`${env.API_URL}/auth/logout`, async () => {
    await networkDelay();

    authToken.clear();

    return HttpResponse.json({
      status: 200,
      message: 'Logged out',
    });
  }),

  http.get(`${env.API_URL}/auth/profile`, async ({ request }) => {
    await networkDelay();

    try {
      const { error, user } = requireAuth(request.headers.get('authorization'));

      if (error) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }

      return HttpResponse.json({ status: 200, data: user });
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),
];
