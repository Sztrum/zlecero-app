import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { db, persistDb } from '../db';
import { networkDelay, requireAuth } from '../utils';

type MockCustomer = ReturnType<typeof db.customer.create>;

const emptyHistory = {
  inquiries: [],
  messages: [],
  offers: [],
  orders: [],
};

const requireCompany = (authorizationHeader: string | null) => {
  const { error, user } = requireAuth(authorizationHeader);

  if (error || !user?.company) {
    return { error: error || 'Unauthorized', company: null };
  }

  return { error: null, company: user.company };
};

const getPotentialDuplicates = (customer: MockCustomer) => {
  if (!customer.email && !customer.taxNumber && !customer.companyName) {
    return [];
  }

  return db.customer
    .findMany({ where: { companyId: { equals: customer.companyId } } })
    .filter((candidate) => {
      if (candidate.id === customer.id) {
        return false;
      }

      return (
        (!!customer.email && candidate.email === customer.email) ||
        (!!customer.taxNumber && candidate.taxNumber === customer.taxNumber) ||
        (!!customer.companyName &&
          candidate.companyName === customer.companyName)
      );
    })
    .map((duplicate) => ({
      id: duplicate.id,
      displayName: duplicate.displayName,
      email: duplicate.email,
      companyName: duplicate.companyName,
      taxNumber: duplicate.taxNumber,
    }));
};

const toCustomerResponse = (
  customer: MockCustomer,
  includeHistory = false,
) => ({
  id: customer.id,
  type: customer.type,
  displayName: customer.displayName,
  companyName: customer.companyName,
  firstName: customer.firstName,
  lastName: customer.lastName,
  email: customer.email,
  phone: customer.phone,
  taxNumber: customer.taxNumber,
  addressLine: customer.addressLine,
  postalCode: customer.postalCode,
  city: customer.city,
  countryCode: customer.countryCode,
  notes: customer.notes,
  potentialDuplicates: getPotentialDuplicates(customer),
  history: includeHistory ? emptyHistory : null,
  createdAt: customer.createdAt,
  updatedAt: customer.updatedAt,
});

const customerPayload = async (request: Request) => {
  const body = (await request.json()) as Record<string, string | null>;

  return {
    type: body.type || 'company',
    displayName: body.display_name || '',
    companyName: body.company_name || null,
    firstName: body.first_name || null,
    lastName: body.last_name || null,
    email: body.email || null,
    phone: body.phone || null,
    taxNumber: body.tax_number || null,
    addressLine: body.address_line || null,
    postalCode: body.postal_code || null,
    city: body.city || null,
    countryCode: body.country_code || 'PL',
    notes: body.notes || null,
  };
};

export const customerHandlers = [
  http.get(`${env.API_URL}/customers`, async ({ request }) => {
    await networkDelay();

    const { error, company } = requireCompany(
      request.headers.get('authorization'),
    );

    if (error || !company) {
      return HttpResponse.json({ message: error }, { status: 401 });
    }

    const search = new URL(request.url).searchParams
      .get('search')
      ?.toLowerCase();
    const customers = db.customer
      .findMany({ where: { companyId: { equals: company.id } } })
      .filter((customer) => {
        if (!search) {
          return true;
        }

        return [
          customer.displayName,
          customer.companyName,
          customer.email,
          customer.phone,
          customer.taxNumber,
        ].some((value) => value?.toLowerCase().includes(search));
      })
      .map((customer) => toCustomerResponse(customer));

    return HttpResponse.json({ status: 200, data: { customers } });
  }),

  http.post(`${env.API_URL}/customers`, async ({ request }) => {
    await networkDelay();

    const { error, company } = requireCompany(
      request.headers.get('authorization'),
    );

    if (error || !company) {
      return HttpResponse.json({ message: error }, { status: 401 });
    }

    const payload = await customerPayload(request);
    const customer = db.customer.create({
      companyId: company.id,
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await persistDb('customer');

    return HttpResponse.json(
      { status: 201, data: toCustomerResponse(customer, true) },
      { status: 201 },
    );
  }),

  http.get(
    `${env.API_URL}/customers/:customerId`,
    async ({ params, request }) => {
      await networkDelay();

      const { error, company } = requireCompany(
        request.headers.get('authorization'),
      );

      if (error || !company) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }

      const customer = db.customer.findFirst({
        where: {
          id: { equals: String(params.customerId) },
          companyId: { equals: company.id },
        },
      });

      if (!customer) {
        return HttpResponse.json(
          { message: 'Customer was not found.' },
          { status: 422 },
        );
      }

      return HttpResponse.json({
        status: 200,
        data: toCustomerResponse(customer, true),
      });
    },
  ),

  http.patch(
    `${env.API_URL}/customers/:customerId`,
    async ({ params, request }) => {
      await networkDelay();

      const { error, company } = requireCompany(
        request.headers.get('authorization'),
      );

      if (error || !company) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }

      const payload = await customerPayload(request);
      const customer = db.customer.update({
        where: {
          id: { equals: String(params.customerId) },
          companyId: { equals: company.id },
        },
        data: {
          ...payload,
          updatedAt: new Date().toISOString(),
        },
      });

      if (!customer) {
        return HttpResponse.json(
          { message: 'Customer was not found.' },
          { status: 422 },
        );
      }

      await persistDb('customer');

      return HttpResponse.json({
        status: 200,
        data: toCustomerResponse(customer, true),
      });
    },
  ),
];
