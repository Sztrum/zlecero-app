import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { db, persistDb } from '../db';
import { requireAuth, networkDelay } from '../utils';

const requireCompanyUser = (authorizationHeader: string | null) => {
  const { error, user } = requireAuth(authorizationHeader);

  if (error || !user?.company) {
    return { error: error || 'Unauthorized', user: null, company: null };
  }

  return { user, company: user.company, error: null };
};

type MockUser = ReturnType<typeof db.user.create>;

const toCompanyUserResponse = (user: MockUser) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  role: user.role,
  status: user.status,
  invitedAt: user.invitedAt,
  deactivatedAt: user.deactivatedAt,
  createdAt: user.createdAt,
});

export const companyHandlers = [
  http.get(`${env.API_URL}/companies/current`, async ({ request }) => {
    await networkDelay();

    const { error, company } = requireCompanyUser(
      request.headers.get('authorization'),
    );

    if (error) {
      return HttpResponse.json({ message: error }, { status: 401 });
    }

    return HttpResponse.json({ status: 200, data: company });
  }),

  http.patch(`${env.API_URL}/companies/current`, async ({ request }) => {
    await networkDelay();

    const { error, company } = requireCompanyUser(
      request.headers.get('authorization'),
    );

    if (error || !company) {
      return HttpResponse.json({ message: error }, { status: 401 });
    }

    const body = (await request.json()) as any;
    const updatedCompany = db.company.update({
      where: { id: { equals: company.id } },
      data: {
        name: body.name,
        billingName: body.billing_name || '',
        taxNumber: body.tax_number || '',
        contactEmail: body.contact_email || '',
        contactPhone: body.contact_phone || '',
        addressLine: body.address_line || '',
        postalCode: body.postal_code || '',
        city: body.city || '',
        countryCode: body.country_code,
        brandColor: body.brand_color,
      },
    });

    await persistDb('company');

    return HttpResponse.json({ status: 200, data: updatedCompany });
  }),

  http.get(`${env.API_URL}/companies/users`, async ({ request }) => {
    await networkDelay();

    const { error, company } = requireCompanyUser(
      request.headers.get('authorization'),
    );

    if (error || !company) {
      return HttpResponse.json({ message: error }, { status: 401 });
    }

    const users = db.user
      .findMany({ where: { companyId: { equals: company.id } } })
      .map((user) => toCompanyUserResponse(user));

    return HttpResponse.json({ status: 200, data: { users } });
  }),

  http.post(`${env.API_URL}/companies/users`, async ({ request }) => {
    await networkDelay();

    const { error, user, company } = requireCompanyUser(
      request.headers.get('authorization'),
    );

    if (error || !user || !company) {
      return HttpResponse.json({ message: error }, { status: 401 });
    }

    if (user.role !== 'owner' && user.role !== 'admin') {
      return HttpResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = (await request.json()) as any;
    const invitedUser = db.user.create({
      companyId: company.id,
      name: body.name,
      email: body.email,
      avatar: 'https://picsum.photos/150/150',
      password: hashRandomPassword(),
      role: body.role,
      status: 'invited',
      bio: '',
      invitedAt: new Date().toISOString(),
      deactivatedAt: '',
    });

    await persistDb('user');

    return HttpResponse.json(
      { status: 201, data: toCompanyUserResponse(invitedUser) },
      { status: 201 },
    );
  }),

  http.patch(
    `${env.API_URL}/companies/users/:userId/deactivate`,
    async ({ params, request }) => {
      await networkDelay();

      const { error, user, company } = requireCompanyUser(
        request.headers.get('authorization'),
      );

      if (error || !user || !company) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }

      if (user.role !== 'owner' && user.role !== 'admin') {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 });
      }

      const targetUser = db.user.findFirst({
        where: {
          id: { equals: String(params.userId) },
          companyId: { equals: company.id },
        },
      });

      if (!targetUser) {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 });
      }

      const updatedUser = db.user.update({
        where: { id: { equals: targetUser.id } },
        data: {
          status: 'deactivated',
          deactivatedAt: new Date().toISOString(),
        },
      });

      if (!updatedUser) {
        return HttpResponse.json({ message: 'Forbidden' }, { status: 403 });
      }

      await persistDb('user');

      return HttpResponse.json({
        status: 200,
        data: toCompanyUserResponse(updatedUser),
      });
    },
  ),
];

const hashRandomPassword = () => Math.random().toString(36);
